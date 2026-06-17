# Security Policy

CGPU-MAX follows the security requirements in [CGPU-MAX-MASTER-PROMPT.md § Security](./CGPU-MAX-MASTER-PROMPT.md). Quick summary of what's enforced at the code level:

## Currently enforced (Phase 1)

- **Input validation:** Zod schemas on every API request (`apps/api/src/modules/*/interface/validators.ts`).
- **Error responses:** Centralised handler in `apps/api/src/shared/middleware/errorHandler.ts`. No stack traces in production responses.
- **Security headers:** Helmet middleware globally; Next.js sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **CORS:** Whitelist via `CORS_ALLOWED_ORIGINS` env var; never `*` in production.
- **Rate limiting + slow-down:** Applied globally; per-tier limits to be wired in Phase 3.
- **Correlation IDs:** Every request tagged for traceable logs (`x-correlation-id`).
- **Structured logging:** Pino with PII redaction (`authorization`, `cookie`, `password`, `token`).
- **Secrets:** `.env.example` only; real secrets via `.env.local` (gitignored) for dev, secret manager for production.
- **TypeScript strict mode:** All strict flags enabled in `tsconfig.base.json`.

## Planned

- Phase 3: Clerk auth, JWT short-expiry + refresh, RBAC tiers
- Phase 4: Stripe webhook signature verification, idempotency keys
- Phase 7: Snyk/Dependabot, SAST/DAST in CI, pentest, bug bounty

## Reporting a vulnerability

Please email **security@cgpu-max.app** (placeholder). Do not file a public issue for security disclosures.
