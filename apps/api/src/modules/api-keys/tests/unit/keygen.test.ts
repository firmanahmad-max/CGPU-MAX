import { generateApiKey, hashApiKey, looksLikeApiKey } from '../../domain/keygen.js';

describe('api key generation', () => {
  it('produces a prefixed plaintext, a stable hash, and a display prefix', () => {
    const k = generateApiKey();
    expect(k.plaintext.startsWith('cgpu_live_')).toBe(true);
    expect(looksLikeApiKey(k.plaintext)).toBe(true);
    expect(k.hashedKey).toHaveLength(64); // sha256 hex
    expect(hashApiKey(k.plaintext)).toBe(k.hashedKey);
    expect(k.plaintext.startsWith(k.keyPrefix)).toBe(true);
  });

  it('generates unique keys', () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.plaintext).not.toBe(b.plaintext);
    expect(a.hashedKey).not.toBe(b.hashedKey);
  });

  it('rejects non-matching strings', () => {
    expect(looksLikeApiKey('sk-whatever')).toBe(false);
  });
});
