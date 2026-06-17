// Public env access — keep server-only secrets out of this module.

const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const API_BASE_URL: string = url.replace(/\/$/, '');
