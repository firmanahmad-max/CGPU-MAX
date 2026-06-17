// Pure branding/theming + identifier helpers. No DB, no framework.

export interface Theme {
  brandName: string;
  logoUrl: string | null;
  primaryColorHex: string;
  secondaryColorHex: string;
}

export const DEFAULT_THEME: Theme = {
  brandName: 'CGPU-MAX',
  logoUrl: null,
  primaryColorHex: '#042C53',
  secondaryColorHex: '#185FA5',
};

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

// Strip protocol, port, path, and case so we store a bare hostname.
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');
}

export function isValidDomain(domain: string): boolean {
  // Basic public-hostname check: labels + a TLD of >= 2 letters, <= 253 chars.
  if (domain.length > 253) return false;
  return /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain);
}

export function slugifyOrg(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// Merge an organization's (possibly partial) branding over the platform default.
export function resolveTheme(org: {
  brandName: string | null;
  logoUrl: string | null;
  primaryColorHex: string | null;
  secondaryColorHex: string | null;
}): Theme {
  return {
    brandName: org.brandName?.trim() || DEFAULT_THEME.brandName,
    logoUrl: org.logoUrl ?? DEFAULT_THEME.logoUrl,
    primaryColorHex:
      org.primaryColorHex && isValidHexColor(org.primaryColorHex)
        ? org.primaryColorHex
        : DEFAULT_THEME.primaryColorHex,
    secondaryColorHex:
      org.secondaryColorHex && isValidHexColor(org.secondaryColorHex)
        ? org.secondaryColorHex
        : DEFAULT_THEME.secondaryColorHex,
  };
}
