# Deploying CGPU-MAX

The stack is **web** (Next.js), **api** (Express), **Postgres**, and **Redis**.
Redis, Clerk, Stripe, and Anthropic are all optional — the app degrades
gracefully without them (see [Environment](#environment)).

## 1. Local — Docker Compose (turnkey)

```bash
docker compose up --build
```

Brings up Postgres + Redis + API + web, syncs the schema, and seeds demo data on
first start. Then open **http://localhost:3000** (API on **:3001**).

- The `api` service runs `prisma db push` + an idempotent seed before serving.
- The `web` service bakes `NEXT_PUBLIC_API_URL` (browser) and uses
  `API_INTERNAL_URL=http://api:3001` (server-rendered fetches over the compose
  network).

> If ports **5432/6379** are already in use on your machine (e.g. another
> Postgres/Redis), the standard compose will fail to bind them. Remap the host
> ports in a local override, or copy the pattern from the gitignored
> `docker-compose.deploy.yml` (Postgres → 5544, Redis → 6380).

Stop it: `docker compose down` (add `-v` to also drop the seeded volume).

## 2. Cloud — full stack on Render (one Blueprint)

Uses [`render.yaml`](../render.yaml). Everything runs from the same Dockerfiles.

1. Push this repo to GitHub (done) and sign in to **Render**.
2. **New → Blueprint**, pick this repo. Render reads `render.yaml` and proposes
   the Postgres DB, Redis (Key Value), API, and web services.
3. Apply. Two values are left blank on purpose (they only exist after the URLs
   are assigned):
   - On **cgpu-max-api** → `CORS_ALLOWED_ORIGINS` = the web URL, e.g.
     `https://cgpu-max-web.onrender.com`.
   - On **cgpu-max-web** → `NEXT_PUBLIC_API_URL` **and** `API_INTERNAL_URL` = the
     API URL, e.g. `https://cgpu-max-api.onrender.com`.
4. Because `NEXT_PUBLIC_API_URL` is **baked at build time**, **redeploy the web
   service** after you set it (Manual Deploy → Clear build cache & deploy).

Notes:

- The API honors Render's injected `PORT`; the health check hits `/health`.
- `preDeployCommand` runs `prisma db push` + seed each deploy (idempotent).
  Remove the seed once you have a real dataset.
- Free instances sleep and free Postgres expires — use paid plans for anything
  lasting.

## 3. Cloud — web on Vercel + API on Render (alternative)

Prefer Vercel for the web? Deploy only the API + data on Render (delete the
`cgpu-max-web` service from `render.yaml`, or ignore it), then:

1. **Vercel → New Project** from this repo.
2. Set **Root Directory** to `apps/web`. Vercel detects Next.js and pnpm; the
   workspace installs from the repo root automatically.
3. Env vars (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_API_URL` = your Render API URL (build-time).
   - `API_INTERNAL_URL` = same Render API URL (server-side fetches).
4. Redeploy after changing `NEXT_PUBLIC_API_URL`.
5. On the API set `CORS_ALLOWED_ORIGINS` to your Vercel URL.

## Environment

| Var                    | Where | Required | Notes                                                                                              |
| ---------------------- | ----- | -------- | -------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | api   | yes      | Postgres connection string                                                                         |
| `PORT` / `API_PORT`    | api   | no       | PaaS injects `PORT`; local defaults to `3001`                                                      |
| `REDIS_URL`            | api   | no       | with `REDIS_ENABLED=false` the API runs without Redis (caching/rate-limit/analytics become no-ops) |
| `CORS_ALLOWED_ORIGINS` | api   | yes\*    | comma-separated web origins; needed once the web is on a real domain                               |
| `NEXT_PUBLIC_API_URL`  | web   | yes      | **build-time**, browser-facing API URL                                                             |
| `API_INTERNAL_URL`     | web   | no       | server-side fetch base; defaults to `NEXT_PUBLIC_API_URL`                                          |

Optional integrations (unset ⇒ that feature is disabled, app still runs):

| Var                                                     | Unlocks                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | real auth (Account/Pro gating); otherwise an auth shim treats you as signed-in |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`            | billing/checkout                                                               |
| `ANTHROPIC_API_KEY`                                     | the AI Build Advisor                                                           |
