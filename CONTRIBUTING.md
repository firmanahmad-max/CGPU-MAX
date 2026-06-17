# Contributing to CGPU-MAX

## Ground rules

1. The [Master Prompt](./CGPU-MAX-MASTER-PROMPT.md) is the source of truth. If you disagree with a constraint there, open a PR against the spec first.
2. Every API feature lives in a **module** under `apps/api/src/modules/{name}` and follows the DDD layout: `domain/`, `application/`, `infrastructure/`, `interface/`, `tests/`. Layers depend inward only.
3. Validate every external input with Zod. Never trust query/body/params raw.
4. Never log secrets. Never commit `.env.local`.

## Workflow

```
main (production)
 ↑
develop (staging)
 ↑
feature/* | hotfix/* | release/*
```

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- Squash-and-merge on PR.
- All checks (lint, type-check, test, build) must pass.

## Local checks before pushing

```bash
pnpm format
pnpm lint
pnpm type-check
pnpm test
```

The `pre-commit` hook runs `lint-staged` automatically.

## Adding an API module

1. `apps/api/src/modules/<name>/` with subfolders per template.
2. Wire the route in `apps/api/src/server.ts` (later: an auto-loader).
3. Update `apps/api/prisma/schema.prisma` if persistence changes; create a migration with `pnpm db:migrate`.
4. Add at least one unit test for the use case and one for the domain entity invariants.

## Code style

- Functions over classes for stateless logic; classes for entities/use cases that benefit from identity.
- No `any` — use `unknown` and narrow.
- Comments only for non-obvious "why". Names carry the "what".
