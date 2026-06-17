import {
  DEFAULT_THEME,
  isValidDomain,
  isValidHexColor,
  normalizeDomain,
  resolveTheme,
  slugifyOrg,
} from '../../domain/branding.js';

describe('branding domain', () => {
  it('validates hex colors', () => {
    expect(isValidHexColor('#042C53')).toBe(true);
    expect(isValidHexColor('#abcdef')).toBe(true);
    expect(isValidHexColor('042C53')).toBe(false);
    expect(isValidHexColor('#fff')).toBe(false);
    expect(isValidHexColor('#gggggg')).toBe(false);
  });

  it('normalizes domains (strip protocol, port, path, case)', () => {
    expect(normalizeDomain('HTTPS://Shop.Example.com/path?x=1')).toBe('shop.example.com');
    expect(normalizeDomain('example.com:8080')).toBe('example.com');
    expect(normalizeDomain('  Example.COM  ')).toBe('example.com');
  });

  it('validates hostnames', () => {
    expect(isValidDomain('shop.example.com')).toBe(true);
    expect(isValidDomain('example.co.uk')).toBe(true);
    expect(isValidDomain('localhost')).toBe(false);
    expect(isValidDomain('no_tld')).toBe(false);
    expect(isValidDomain('-bad.example.com')).toBe(false);
  });

  it('slugifies org names', () => {
    expect(slugifyOrg('Acme PC Builds!')).toBe('acme-pc-builds');
    expect(slugifyOrg('  --Hello--  ')).toBe('hello');
  });

  it('merges partial branding over the default theme', () => {
    const theme = resolveTheme({
      brandName: 'Acme',
      logoUrl: null,
      primaryColorHex: '#123456',
      secondaryColorHex: 'not-a-color',
    });
    expect(theme.brandName).toBe('Acme');
    expect(theme.primaryColorHex).toBe('#123456');
    // Invalid secondary falls back to default.
    expect(theme.secondaryColorHex).toBe(DEFAULT_THEME.secondaryColorHex);
  });
});
