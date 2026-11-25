# Testing — FolioCraft

How testing works in this repository. Project-specific conventions on top of the generic skills:

- Frontend: [`docs/skills/TESTING_FRONTEND_GUIDELINE.md`](./skills/TESTING_FRONTEND_GUIDELINE.md)
- Commits: [`docs/skills/COMMIT_GUIDELINE.md`](./skills/COMMIT_GUIDELINE.md)

## Principles

- Assert only external behavior: rendered state, HTTP responses, database effects, browser flows — never private calls or internal structure.
- Unit tests are co-located: `<source>.spec.ts` / `<source>.spec.tsx` next to the source file.
- Unit tests never touch the database, network, filesystem, or a real clock. Network is mocked with MSW.
- Integration tests use the real local Postgres database `foliocraft_test` and live in `*.integration.spec.ts` files.
- E2E tests run with Playwright against the real local stack (web on `:3000`, Mailpit API on `:8025`).
- Playwright uses `workers: 1`: specs share the dev server and Mailpit, and `fullyParallel: false` alone still runs spec files concurrently, which caused signup timeouts.

## Commands

Run from the repository root (Node/pnpm are pinned via mise — `mise install` first):

```bash
pnpm lint          # biome check .
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run (unit + dom + integration projects)
pnpm build         # next build

pnpm infra:up      # start Postgres 16 + Mailpit (podman compose)
pnpm infra:down    # stop them again

pnpm seed          # seed the demo account/profile (idempotent)
pnpm test:e2e      # Playwright E2E suite
```

## Three levels

| Level       | Tooling                                                    | Location                       |
| ----------- | ---------------------------------------------------------- | ------------------------------ |
| Unit        | Vitest (node environment), co-located `.spec.ts`           | `src/**/*.spec.ts`             |
| Component   | Vitest + Testing Library + jsdom, co-located `.spec.tsx`   | `src/**/*.spec.tsx`            |
| Integration | Vitest against real Postgres (`foliocraft_test`) + Mailpit | `src/**/*.integration.spec.ts` |
| E2E         | Playwright against the full local stack                    | `tests/e2e/`                   |

## Vitest projects

`vitest.config.ts` defines three projects:

| Project       | Environment | Includes                                               | Notes                                                                                                   |
| ------------- | ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `unit`        | node        | `src/**/*.spec.ts` (excluding `*.integration.spec.ts`) | plain logic, Zod schemas, helpers                                                                       |
| `dom`         | jsdom       | `src/**/*.spec.tsx`                                    | React Testing Library with jest-dom matchers                                                            |
| `integration` | node        | `src/**/*.integration.spec.ts`                         | real database; `fileParallelism: false`; `passWithNoTests: true` until the first integration specs land |

A shared `vitest.setup.ts` loads `.env` via dotenv and registers jest-dom matchers.

## Spec colocation

Tests live next to the code they cover:

```
src/lib/env.ts
src/lib/env.spec.ts
src/app/page.tsx
src/app/page.spec.tsx
src/app/[slug]/…/x.integration.spec.ts   # integration with the database
```

## Gates (Lefthook)

- **pre-commit:** Biome on staged files (`biome check --write --staged && git update-index --again`) + `pnpm typecheck`
- **pre-push:** `pnpm test`
- **commit-msg:** commitlint (Conventional Commits, English)

## CI

`.github/workflows/ci.yml` runs two jobs on every push/PR:

1. **checks:** `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm test`
2. **build:** same install, with a `postgres:16-alpine` service and the required build env vars, then `pnpm build`. Once migrations exist (database-schema task), `pnpm db:migrate` runs before the build.

The E2E job (Playwright + Postgres + Mailpit services) is added in a later task.

## Coverage

Coverage tooling is not configured yet; it will be introduced together with the first business-logic modules. The planned policy: minimum 80% lines/functions/statements/branches on business-logic paths (`src/lib/**`, `src/components/**`, server actions), with infrastructure and framework glue covered by integration/E2E instead of the unit gate.
