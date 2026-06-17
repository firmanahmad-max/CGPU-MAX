import type { OrgRole, PrismaClient } from '@prisma/client';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';
import { AppError, NotFoundError } from '../../../shared/errors/AppError.js';
import {
  isValidDomain,
  isValidHexColor,
  normalizeDomain,
  resolveTheme,
  slugifyOrg,
} from '../domain/branding.js';

export interface BrandingPatch {
  brandName?: string;
  logoUrl?: string | null;
  primaryColorHex?: string;
  secondaryColorHex?: string;
  customDomain?: string | null;
}

export class OrganizationService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(auth: AuthContext, name: string) {
    const slug = await this.uniqueSlug(slugifyOrg(name) || 'org');
    const org = await this.prisma.organization.create({
      data: {
        name,
        slug,
        members: { create: { userId: auth.userId, role: 'OWNER' } },
      },
    });
    return this.toDto(org);
  }

  async listMine(auth: AuthContext) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId: auth.userId },
      include: { organization: true },
      orderBy: { createdAt: 'asc' },
    });
    return memberships.map((m) => ({ role: m.role, ...this.toDto(m.organization) }));
  }

  async updateBranding(auth: AuthContext, orgId: string, patch: BrandingPatch) {
    await this.assertRole(auth.userId, orgId, ['OWNER', 'ADMIN']);

    for (const key of ['primaryColorHex', 'secondaryColorHex'] as const) {
      const v = patch[key];
      if (v !== undefined && !isValidHexColor(v)) {
        throw new AppError('INVALID_COLOR', `${key} must be a #RRGGBB hex color`, 422);
      }
    }

    let customDomain: string | null | undefined = patch.customDomain;
    if (typeof customDomain === 'string' && customDomain.length > 0) {
      customDomain = normalizeDomain(customDomain);
      if (!isValidDomain(customDomain)) {
        throw new AppError('INVALID_DOMAIN', 'customDomain is not a valid hostname', 422);
      }
      const clash = await this.prisma.organization.findUnique({ where: { customDomain } });
      if (clash && clash.id !== orgId) {
        throw new AppError('DOMAIN_TAKEN', 'That custom domain is already in use', 409);
      }
    } else if (customDomain === '') {
      customDomain = null;
    }

    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        brandName: patch.brandName,
        logoUrl: patch.logoUrl,
        primaryColorHex: patch.primaryColorHex,
        secondaryColorHex: patch.secondaryColorHex,
        ...(customDomain !== undefined ? { customDomain } : {}),
      },
    });
    return this.toDto(org);
  }

  async addMember(auth: AuthContext, orgId: string, email: string, role: OrgRole) {
    await this.assertRole(auth.userId, orgId, ['OWNER']);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError('User', email);
    await this.prisma.organizationMember.upsert({
      where: { orgId_userId: { orgId, userId: user.id } },
      create: { orgId, userId: user.id, role },
      update: { role },
    });
    return { added: true, email, role };
  }

  // Public: resolve a white-label theme by custom domain.
  async brandingByDomain(rawDomain: string) {
    const domain = normalizeDomain(rawDomain);
    const org = await this.prisma.organization.findUnique({ where: { customDomain: domain } });
    if (!org) throw new NotFoundError('Branding for domain', domain);
    return { slug: org.slug, theme: resolveTheme(org) };
  }

  private async assertRole(userId: string, orgId: string, roles: OrgRole[]) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId, userId } },
    });
    if (!member) throw new NotFoundError('Organization', orgId);
    if (!roles.includes(member.role)) {
      throw new AppError('FORBIDDEN', `Requires org role: ${roles.join(' or ')}`, 403);
    }
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base;
    for (let i = 0; i < 50; i++) {
      const existing = await this.prisma.organization.findUnique({ where: { slug } });
      if (!existing) return slug;
      slug = `${base}-${i + 2}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  }

  private toDto(org: {
    id: string;
    name: string;
    slug: string;
    customDomain: string | null;
    brandName: string | null;
    logoUrl: string | null;
    primaryColorHex: string | null;
    secondaryColorHex: string | null;
  }) {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      customDomain: org.customDomain,
      theme: resolveTheme(org),
    };
  }
}
