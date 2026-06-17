import Anthropic from '@anthropic-ai/sdk';

import { env } from '../../../shared/config/env.js';

let _client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}
