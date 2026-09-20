import OpenAI from 'openai';

import { env } from '../../../shared/config/env.js';

// An OpenAI-compatible chat client, pointed at a custom gateway via AI_BASE_URL
// (e.g. Sumopod). Same wire protocol as OpenAI's /v1/chat/completions, so the
// official SDK works unchanged once we override apiKey + baseURL.
let _client: OpenAI | null = null;

export function openAICompatible(): OpenAI {
  if (!env.AI_BASE_URL || !env.AI_API_KEY) {
    throw new Error('AI_BASE_URL / AI_API_KEY not configured');
  }
  if (!_client) {
    _client = new OpenAI({ apiKey: env.AI_API_KEY, baseURL: env.AI_BASE_URL });
  }
  return _client;
}
