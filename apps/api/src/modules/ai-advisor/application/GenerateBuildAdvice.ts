import type { PrismaClient } from '@prisma/client';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';
import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { logger } from '../../../shared/logging/logger.js';
import { EnforceUsageLimit } from '../../subscriptions/application/EnforceUsageLimit.js';
import type { BuildAdvice } from '../domain/BuildAdvice.js';
import {
  buildCatalogContext,
  buildUserMessage,
  SYSTEM_PROMPT,
  type AdvisorRequest,
  type CatalogPart,
} from '../domain/promptBuilder.js';
import { buildAdviceJsonSchema } from '../domain/schema.js';
import { anthropic } from '../infrastructure/AnthropicClient.js';

// How many catalog parts to feed the model. Keep bounded so the prompt stays
// cache-friendly and within a sensible token budget.
const CATALOG_LIMIT = 60;

export class GenerateBuildAdvice {
  private readonly usage: EnforceUsageLimit;

  constructor(private readonly prisma: PrismaClient) {
    this.usage = new EnforceUsageLimit(prisma);
  }

  async execute(auth: AuthContext, req: AdvisorRequest) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new AppError('AI_NOT_CONFIGURED', 'AI advisor is not configured on this server', 503);
    }

    // Enforce the monthly AI-recommendation quota for the user's tier.
    await this.usage.incrementAndCheck({
      userId: auth.userId,
      tier: auth.tier,
      feature: 'aiRecommendations',
    });

    const catalog = await this.loadCatalog(req.budgetUsd);
    const catalogContext = buildCatalogContext(catalog);
    const userMessage = buildUserMessage(req, catalogContext);

    const advice = await this.callClaude(userMessage);
    const validated = this.validateAndGround(advice, catalog);

    const shareSlug = `build-${auth.userId.slice(0, 8)}-${Date.now().toString(36)}`;
    await this.prisma.savedBuild.create({
      data: {
        shareSlug,
        ownerId: auth.userId,
        budgetUsd: req.budgetUsd,
        purpose: req.purpose,
        resolution: req.resolution,
        payload: validated as object,
        modelUsed: env.ANTHROPIC_MODEL,
      },
    });

    return { ...validated, shareSlug, modelUsed: env.ANTHROPIC_MODEL };
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
      },
    });
    return rows.map((r) => ({
      slug: r.slug,
      type: r.type,
      modelName: r.modelName,
      manufacturer: r.manufacturer,
      msrpUsd: r.msrpUsd ? Number(r.msrpUsd) : null,
      tdpWatts: r.tdpWatts,
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

  // Trust-but-verify: clamp the model's slug claims to the catalog and recompute
  // the within-budget flag from the prices we control.
  private validateAndGround(advice: BuildAdvice, catalog: CatalogPart[]): BuildAdvice {
    const bySlug = new Map(catalog.map((p) => [p.slug, p]));
    const ground = (pick: BuildAdvice['cpu']) => {
      if (pick.slug && !bySlug.has(pick.slug)) {
        // Model hallucinated a slug — drop it rather than emit a dead link.
        return { ...pick, slug: null };
      }
      return pick;
    };
    const cpu = ground(advice.cpu);
    const gpu = ground(advice.gpu);
    return { ...advice, cpu, gpu };
  }
}
