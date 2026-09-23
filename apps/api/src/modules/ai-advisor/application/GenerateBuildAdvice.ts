import type { PrismaClient } from '@prisma/client';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';
import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { logger } from '../../../shared/logging/logger.js';
import { EnforceUsageLimit } from '../../subscriptions/application/EnforceUsageLimit.js';
import type { BuildAdvice, ComponentPick } from '../domain/BuildAdvice.js';
import {
  buildCatalogContext,
  buildUserMessage,
  SYSTEM_PROMPT,
  type AdvisorRequest,
  type CatalogPart,
  type ComponentCatalogPart,
} from '../domain/promptBuilder.js';
import { buildAdviceJsonSchema, buildAdviceZod } from '../domain/schema.js';
import { anthropic } from '../infrastructure/AnthropicClient.js';
import { openAICompatible } from '../infrastructure/OpenAICompatibleClient.js';

// Prefer an OpenAI-compatible gateway (e.g. Sumopod) when configured; otherwise
// fall back to Anthropic. The advisor is disabled unless one is set.
function useOpenAI(): boolean {
  return Boolean(env.AI_BASE_URL && env.AI_API_KEY);
}
function aiConfigured(): boolean {
  return useOpenAI() || Boolean(env.ANTHROPIC_API_KEY);
}
function activeModel(): string {
  return useOpenAI() ? env.AI_MODEL : env.ANTHROPIC_MODEL;
}

// How many catalog parts to feed the model. Keep bounded so the prompt stays
// cache-friendly and within a sensible token budget.
const CATALOG_LIMIT = 60;

export class GenerateBuildAdvice {
  private readonly usage: EnforceUsageLimit;

  constructor(private readonly prisma: PrismaClient) {
    this.usage = new EnforceUsageLimit(prisma);
  }

  async execute(auth: AuthContext, req: AdvisorRequest) {
    if (!aiConfigured()) {
      throw new AppError('AI_NOT_CONFIGURED', 'AI advisor is not configured on this server', 503);
    }

    // Enforce the monthly AI-recommendation quota for the user's tier.
    await this.usage.incrementAndCheck({
      userId: auth.userId,
      tier: auth.tier,
      feature: 'aiRecommendations',
    });

    const [catalog, components] = await Promise.all([
      this.loadCatalog(req.budgetUsd),
      this.loadComponents(),
    ]);
    const catalogContext = buildCatalogContext(catalog, components);
    const userMessage = buildUserMessage(req, catalogContext);

    const advice = useOpenAI()
      ? await this.callOpenAI(userMessage)
      : await this.callClaude(userMessage);
    const validated = this.validateAndGround(advice, catalog, components, req);

    const modelUsed = activeModel();
    const shareSlug = `build-${auth.userId.slice(0, 8)}-${Date.now().toString(36)}`;
    await this.prisma.savedBuild.create({
      data: {
        shareSlug,
        ownerId: auth.userId,
        budgetUsd: req.budgetUsd,
        purpose: req.purpose,
        resolution: req.resolution,
        payload: validated as object,
        modelUsed,
      },
    });

    return { ...validated, shareSlug, modelUsed };
  }

  private async loadCatalog(budgetUsd: number): Promise<CatalogPart[]> {
    // Pull parts roughly in budget range (allow up to 1.5x for headroom), newest first.
    const rows = await this.prisma.processor.findMany({
      where: {
        deletedAt: null,
        OR: [{ msrpUsd: { lte: budgetUsd * 1.5 } }, { msrpUsd: null }],
      },
      take: CATALOG_LIMIT,
      orderBy: [{ msrpUsd: 'desc' }],
      select: {
        slug: true,
        type: true,
        modelName: true,
        manufacturer: true,
        msrpUsd: true,
        tdpWatts: true,
        cpuSpecs: { select: { socket: true } },
      },
    });
    return rows.map((r) => ({
      slug: r.slug,
      type: r.type,
      modelName: r.modelName,
      manufacturer: r.manufacturer,
      msrpUsd: r.msrpUsd ? Number(r.msrpUsd) : null,
      tdpWatts: r.tdpWatts,
      socket: r.cpuSpecs?.socket ?? null,
    }));
  }

  // Full non-processor catalog (motherboards, RAM, SSD, PSU, case, cooler,
  // monitor). Small enough (~90 rows) to feed in full so the model can enforce
  // socket / memory / wattage compatibility.
  private async loadComponents(): Promise<ComponentCatalogPart[]> {
    const rows = await this.prisma.component.findMany({
      where: { deletedAt: null },
      orderBy: [{ type: 'asc' }, { msrpUsd: 'asc' }],
      select: {
        slug: true,
        type: true,
        brand: true,
        modelName: true,
        msrpUsd: true,
        socket: true,
        chipset: true,
        formFactor: true,
        memoryType: true,
        capacityGb: true,
        interface: true,
        wattage: true,
        efficiency: true,
        sizeInch: true,
        resolution: true,
        refreshHz: true,
        panel: true,
      },
    });
    return rows.map((r) => ({
      slug: r.slug,
      type: String(r.type),
      brand: r.brand,
      modelName: r.modelName,
      approxPriceUsd: r.msrpUsd ? Number(r.msrpUsd) : null,
      socket: r.socket,
      chipset: r.chipset,
      formFactor: r.formFactor,
      memoryType: r.memoryType,
      capacityGb: r.capacityGb,
      interface: r.interface,
      wattage: r.wattage,
      efficiency: r.efficiency,
      sizeInch: r.sizeInch,
      resolution: r.resolution,
      refreshHz: r.refreshHz,
      panel: r.panel,
    }));
  }

  private async callClaude(userMessage: string): Promise<BuildAdvice> {
    try {
      // Structured outputs: constrain the response to our build-advice schema.
      // Adaptive thinking lets Claude reason about balance/budget before answering.
      const response = await anthropic().messages.parse({
        model: env.ANTHROPIC_MODEL,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        output_config: {
          format: {
            type: 'json_schema',
            name: 'build_advice',
            schema: buildAdviceJsonSchema,
          },
        },
      });

      if (response.stop_reason === 'refusal') {
        throw new AppError('AI_REFUSED', 'The advisor declined to answer this request', 422);
      }
      const parsed = response.parsed_output as BuildAdvice | null;
      if (!parsed) {
        throw new AppError('AI_BAD_OUTPUT', 'The advisor returned an unparseable response', 502);
      }
      return parsed;
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error({ err }, 'Anthropic call failed');
      throw new AppError('AI_UPSTREAM_ERROR', 'AI provider request failed', 502);
    }
  }

  private async callOpenAI(userMessage: string): Promise<BuildAdvice> {
    try {
      // OpenAI-compatible structured outputs: constrain the reply to our schema.
      const response = await openAICompatible().chat.completions.create({
        model: env.AI_MODEL,
        max_tokens: 4000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'build_advice', schema: buildAdviceJsonSchema, strict: true },
        },
      });

      const choice = response.choices[0];
      if (choice?.message.refusal) {
        throw new AppError('AI_REFUSED', 'The advisor declined to answer this request', 422);
      }
      const content = choice?.message.content;
      if (!content) {
        throw new AppError('AI_BAD_OUTPUT', 'The advisor returned an empty response', 502);
      }
      // The gateway may or may not enforce the schema, so validate the JSON.
      return buildAdviceZod.parse(JSON.parse(content));
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error({ err }, 'OpenAI-compatible call failed');
      throw new AppError('AI_UPSTREAM_ERROR', 'AI provider request failed', 502);
    }
  }

  // Trust-but-verify: clamp the model's slug claims to the catalog, replace the
  // claimed prices with the ones we control for known parts, then recompute the
  // total and within-budget flag. Strip the monitor when it wasn't requested.
  private validateAndGround(
    advice: BuildAdvice,
    catalog: CatalogPart[],
    components: ComponentCatalogPart[],
    req: AdvisorRequest,
  ): BuildAdvice {
    const priceBySlug = new Map<string, number>();
    for (const p of catalog) if (p.msrpUsd !== null) priceBySlug.set(p.slug, p.msrpUsd);
    for (const c of components)
      if (c.approxPriceUsd !== null) priceBySlug.set(c.slug, c.approxPriceUsd);
    const knownSlug = new Set<string>([
      ...catalog.map((p) => p.slug),
      ...components.map((c) => c.slug),
    ]);

    const ground = (pick: ComponentPick): ComponentPick => {
      if (pick.slug && !knownSlug.has(pick.slug)) {
        // Model hallucinated a slug — drop it rather than emit a dead link.
        return { ...pick, slug: null };
      }
      // Prefer our controlled price when the part is known.
      if (pick.slug && priceBySlug.has(pick.slug)) {
        return { ...pick, approxPriceUsd: priceBySlug.get(pick.slug)! };
      }
      return pick;
    };

    const cpu = ground(advice.cpu);
    const gpu = ground(advice.gpu);
    const motherboard = ground(advice.motherboard);
    const ram = ground(advice.ram);
    const ssd = ground(advice.ssd);
    const psu = ground(advice.psu);
    const pcCase = ground(advice.case);
    const cooler = ground(advice.cooler);
    const monitor = req.includeMonitor && advice.monitor ? ground(advice.monitor) : null;

    const parts = [cpu, gpu, motherboard, ram, ssd, psu, pcCase, cooler];
    if (monitor) parts.push(monitor);
    const estimatedTotalUsd = Math.round(
      parts.reduce((sum, p) => sum + (Number.isFinite(p.approxPriceUsd) ? p.approxPriceUsd : 0), 0),
    );
    const withinBudget = estimatedTotalUsd <= req.budgetUsd;

    return {
      ...advice,
      cpu,
      gpu,
      motherboard,
      ram,
      ssd,
      psu,
      case: pcCase,
      cooler,
      monitor,
      estimatedTotalUsd,
      withinBudget,
    };
  }
}
