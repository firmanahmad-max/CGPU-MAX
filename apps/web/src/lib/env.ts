// Public env access — keep server-only secrets out of this module.

const rawPublic = process.env.NEXT_PUBLIC_API_URL;
const url = rawPublic && rawPublic.length > 0 ? rawPublic : 'http://localhost:3001';
// Browser-facing base (must be reachable from the user's machine).
export const API_BASE_URL: string = url.replace(/\/$/, '');

// Server-side (RSC) base. Inside containers the browser URL (localhost) can't
// reach the API service on the compose network, so API_INTERNAL_URL (e.g.
// http://api:3001) is used for server-rendered fetches. Falls back to the
// public URL for local dev where they're the same host.
const internal = process.env.API_INTERNAL_URL ?? url;
export const INTERNAL_API_BASE_URL: string = internal.replace(/\/$/, '');
