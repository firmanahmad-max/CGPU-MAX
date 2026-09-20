# Deploying CGPU-MAX

Stack: **web** (Next.js) · **api** (Express) · **Postgres** · **Redis** (optional).
Redis, Clerk, Stripe, and Anthropic are all optional — the app degrades
gracefully without them (see [Environment](#environment)).

Recommended free split: **web → Vercel · api → Vercel (serverless) · Postgres →
Neon** — one platform, no credit card. Also documented: [local
Docker](#local--docker-compose) and a [Render](#alternative--render-docker)
alternative.

---

## Cloud — all on Vercel + Neon (recommended)

Two Vercel projects from this **one** repo (different Root Directories) plus a
Neon database. No credit card required. Do it in this order so the URLs line up.

### 1. Neon — Postgres

1. Create a project at **neon.tech** (region Singapore is closest to Indonesia).
   Only the **Postgres database** is needed — leave Object storage / Functions /
   Auth off.
2. Copy the connection string. Turn **Connection pooling OFF** and use the
   **direct** connection (host _without_ `-pooler`), keeping `?sslmode=require`.
   The API's build step runs `prisma db push`, which needs a direct session.

### 2. Vercel — the API (serverless)

1. **Vercel → Add New → Project**, import this repo.
2. Set **Root Directory** to `apps/api`. Framework preset: **Other** (Vercel
   reads [`apps/api/vercel.json`](../apps/api/vercel.json): it builds the Express
   app and routes every path to one serverless function).
3. Environment variables:
   - `DATABASE_URL` = your Neon **direct** string from step 1.
   - `REDIS_ENABLED` = `false`.
   - `CORS_ALLOWED_ORIGINS` = your web URL (from step 3, e.g.
     `https://cgpu-max.vercel.app`). Put a placeholder now, fix it in step 4.
4. Deploy. The build runs `prisma generate` → `tsc` → `prisma db push` → an
   idempotent seed, then ships the function. Copy the API URL, e.g.
   `https://cgpu-max-api.vercel.app`. Check `…/health` returns `{"status":"ok"}`.

> **The build talks to Neon.** Schema push + seed run at build time over the
> direct connection, so every redeploy re-syncs (idempotent). If the build fails
> on the Neon step, see the `channel_binding` note below.

### 3. Vercel — the web

1. **Vercel → Add New → Project**, import the **same** repo again.
2. Set **Root Directory** to `apps/web`.
3. Environment variables:
   - `NEXT_PUBLIC_API_URL` = the API URL from step 2.4.
   - `API_INTERNAL_URL` = the **same** API URL.
4. Deploy. Copy the web URL.

### 4. Wire CORS

Back on the **API** project → Settings → Environment Variables, set
`CORS_ALLOWED_ORIGINS` to the exact web URL from step 3, and **Redeploy** the API
so it takes effect.

> **`NEXT_PUBLIC_API_URL` is baked at build time.** If you change it later,
> **redeploy the web** (Vercel → Deployments → Redeploy).

Done — open your web URL. Because it's HTTPS, the PWA is installable immediately
(address-bar **Install**, or Add to Home Screen on mobile).

**Notes**

- **Cold start:** Neon scales its compute to zero when idle, so the first request
  after a quiet spell waits a second or two while it wakes. Vercel functions
  themselves are fast.
- **`channel_binding`:** Neon's string may end with `&channel_binding=require`.
  If a build fails connecting to Postgres, drop that parameter (keep
  `?sslmode=require`) and redeploy.
- **Scaling later:** the runtime uses Neon's direct connection, which is fine for
  demo traffic. Under heavy concurrency, switch `DATABASE_URL` to Neon's
  **pooled** string (`-pooler`, add `&pgbouncer=true`) for the runtime and move
  the build's `prisma db push`/seed to a one-off run against the direct URL.

---

## Local — Docker Compose

```bash
docker compose up --build
```

Brings up Postgres + Redis + API + web, syncs the schema, and seeds demo data on
first start. Open **http://localhost:3000** (API on **:3001**).

> If ports **5432/6379** are already used on your machine, the standard compose
> fails to bind them. Remap host ports in a local override (see the gitignored
> `docker-compose.deploy.yml`: Postgres → 5544, Redis → 6380).

Stop it: `docker compose down` (`-v` also drops the seeded volume).

---

## Alternative — Render (Docker)

Prefer a long-running container over serverless? [`render.yaml`](../render.yaml)
deploys the API as a Docker web service (schema push + seed run at container
startup). **Note:** Render now requires a **payment card on file** even for
free-tier Blueprints (a $1 authorization) — international cards are often
declined. If your card works, it's a fine host; otherwise the Vercel path above
needs no card. To also host the web there, add a second Docker service for
`apps/web` and point its `NEXT_PUBLIC_API_URL` / `API_INTERNAL_URL` at the API.
Render's free Postgres is deleted after 30 days — point `DATABASE_URL` at Neon.

---

## Environment

| Var                    | Where | Required | Notes                                                                           |
| ---------------------- | ----- | -------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`         | api   | yes      | Postgres (Neon **direct** connection; build runs migrations/seed against it)    |
| `PORT` / `API_PORT`    | api   | no       | PaaS/containers inject `PORT`; local defaults to `3001` (unused on Vercel)      |
| `REDIS_ENABLED`        | api   | no       | `false` runs the API without Redis (caching/rate-limit/analytics become no-ops) |
| `REDIS_URL`            | api   | no       | only when `REDIS_ENABLED` is not `false`                                        |
| `CORS_ALLOWED_ORIGINS` | api   | yes\*    | comma-separated web origins; set to your web (Vercel) URL                       |
| `NEXT_PUBLIC_API_URL`  | web   | yes      | **build-time**, browser-facing API URL                                          |
| `API_INTERNAL_URL`     | web   | no       | server-rendered fetch base; defaults to `NEXT_PUBLIC_API_URL`                   |

Optional integrations (unset ⇒ that feature is disabled, app still runs):

| Var                                                     | Unlocks                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | real auth (Account/Pro gating); otherwise an auth shim treats you as signed-in |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`            | billing/checkout                                                               |
| `ANTHROPIC_API_KEY`                                     | the AI Build Advisor                                                           |
