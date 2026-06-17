import { createHash, randomBytes } from 'node:crypto';

// Key format: cgpu_live_<32 url-safe bytes>. We persist only the SHA-256 hash;
// the plaintext is returned to the caller exactly once.
const KEY_PREFIX = 'cgpu_live_';
const PREFIX_DISPLAY_LEN = KEY_PREFIX.length + 6;

export interface GeneratedKey {
  plaintext: string;
  hashedKey: string;
  keyPrefix: string;
}

export function generateApiKey(): GeneratedKey {
  const secret = randomBytes(24).toString('base64url');
  const plaintext = `${KEY_PREFIX}${secret}`;
  return {
    plaintext,
    hashedKey: hashApiKey(plaintext),
    keyPrefix: plaintext.slice(0, PREFIX_DISPLAY_LEN),
  };
}

export function hashApiKey(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex');
}

export function looksLikeApiKey(value: string): boolean {
  return value.startsWith(KEY_PREFIX);
}
