# Deploying CGPU-MAX

Stack: **web** (Next.js) · **api** (Express) · **Postgres** · **Redis** (optional).
Redis, Clerk, Stripe, and Anthropic are all optional — the app degrades
gracefully without them (see [Environment](#environment)).

Recommended free split: **web → Vercel · api → Render · Postgres → Neon** (Redis
off). Also documented: [local Docker](#local--docker-compose) and an
[all-on-Render](#alternative--everything-on-render) alternative.

---

## Cloud — Vercel + Render + Neon (recommended)

Do it in this order so the URLs line up. It's all free-tier.

### 1. Neon — Postgres

1. Create a project at **neon.tech**.
2. Copy the connection string. Neon shows a **pooled** and a **direct** one —
   use the **direct** connection (host _without_ `-pooler`) for `DATABASE_URL`,
   because `prisma db push` / migrations need a direct session. Keep
   `?sslmode=require`.

### 2. Render — the API

1. Push this repo to GitHub (done), then in **Render → New → Blueprint** pick the
   repo. It reads [`render.yaml`](../render.yaml) and proposes **cgpu-max-api**
   (Docker). _(Or New → Web Service → Docker, `apps/api/Dockerfile`, context `.`)_
2. Set the two blank env vars:
   - `DATABASE_URL` = your Neon **direct** string from step 1.
   - `CORS_ALLOWED_ORIGINS` = your Vercel URL (you'll get it in step 3, e.g.
     `https://cgpu-max.vercel.app`). You can put a placeholder now and fix it
     after step 3.
3. Deploy. `preDeployCommand` runs `prisma db push` + an idempotent seed, then
   the API starts. It listens on Render's injected `PORT`; health check `/health`.
4. Copy the API's public URL, e.g. `https://cgpu-max-api.onrender.com`.

> **Cold start:** free Render web services sleep after ~15 min idle (first
> request then takes ~30–60 s). Optional: a free cron (e.g. cron-job.org) hitting
> `/health` every ~10 min keeps it warm.

### 3. Vercel — the web

1. **Vercel → Add New → Project**, import the repo.
2. Set **Root Directory** to `apps/web`. Vercel detects Next.js + pnpm and
   installs the workspace from the repo root automatically.
3. Add environment variables (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_API_URL` = the Render API URL from step 2.4.
   - `API_INTERNAL_URL` = the **same** Render API URL.
4. Deploy. Copy the Vercel URL.
5. Back on **Render**, set `CORS_ALLOWED_ORIGINS` to the Vercel URL and let it
   redeploy.

> **`NEXT_PUBLIC_API_URL` is baked at build time.** If you change it later,
> **redeploy the web** (Vercel → Deployments → Redeploy). The value is also read
> as a Docker build arg for local/Render Docker builds.

Done — open your Vercel URL. Because it's HTTPS, the PWA is installable
immediately (address-bar **Install**, or Add to Home Screen on mobile).

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

## Alternative — everything on Render

Prefer one platform? Add a Postgres database, a Redis (Key Value), and a second
Docker web service for `apps/web` to `render.yaml` (wire `DATABASE_URL` from the
DB, `REDIS_URL` from the key-value, and the web's `NEXT_PUBLIC_API_URL` /
`API_INTERNAL_URL` to the API URL). Simplest ops, but both services cold-start
and Render's free Postgres is deleted after 30 days — point `DATABASE_URL` at
Neon to avoid that.

---

## Environment

| Var                    | Where | Required | Notes                                                                           |
| ---------------------- | ----- | -------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`         | api   | yes      | Postgres (Neon **direct** connection for migrations)                            |
| `PORT` / `API_PORT`    | api   | no       | PaaS injects `PORT`; local defaults to `3001`                                   |
| `REDIS_ENABLED`        | api   | no       | `false` runs the API without Redis (caching/rate-limit/analytics become no-ops) |
| `REDIS_URL`            | api   | no       | only when `REDIS_ENABLED` is not `false`                                        |
| `CORS_ALLOWED_ORIGINS` | api   | yes\*    | comma-separated web origins; set to your Vercel URL                             |
| `NEXT_PUBLIC_API_URL`  | web   | yes      | **build-time**, browser-facing API URL                                          |
| `API_INTERNAL_URL`     | web   | no       | server-rendered fetch base; defaults to `NEXT_PUBLIC_API_URL`                   |

Optional integrations (unset ⇒ that feature is disabled, app still runs):

| Var                                                     | Unlocks                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | real auth (Account/Pro gating); otherwise an auth shim treats you as signed-in |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`            | billing/checkout                                                               |
| `ANTHROPIC_API_KEY`                                     | the AI Build Advisor                                                           |
