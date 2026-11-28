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
pnpm test:a11y     # accessibility and keyboard specs only
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

| Project       | Environment | Includes                                               | Notes                                                                                                |
| ------------- | ----------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `unit`        | node        | `src/**/*.spec.ts` (excluding `*.integration.spec.ts`) | plain logic, Zod schemas, helpers                                                                    |
| `dom`         | jsdom       | `src/**/*.spec.tsx`                                    | React Testing Library with jest-dom matchers                                                         |
| `integration` | node        | `src/**/*.integration.spec.ts`                         | real database; `fileParallelism: false`; root `passWithNoTests: true` means check the reported count |

A shared `vitest.setup.ts` loads `.env` via dotenv and registers jest-dom matchers.

## Accessibility QA

`tests/e2e/a11y.spec.ts` runs `@axe-core/playwright` on `/`, `/login`, `/signup`, `/bruce-wayne`,
`/explore` and the authenticated `/dashboard`; only `serious` and `critical` violations fail the
suite. The authenticated specs sign in as the seeded demo user, so `pnpm seed` must run first.
The same file covers keyboard operation (tab/arrow navigation through editor tabs, fields, reorder
buttons and the footer, visible focus rings, focus trapping in the delete dialog and `Escape` to
close). `pnpm test:a11y` runs this spec alone.

The final QA sweep maps each `docs/TASKS.md` Review Focus line to a green test:

| Review Focus area                                                       | Covering test                                                                                                   |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Hostile slug (reserved/taken/accent/reclaim)                            | `src/app/dashboard/actions.integration.spec.ts`, `tests/e2e/slug-redirect.spec.ts`                              |
| Draft isolation across public/print/PDF/redirect                        | `tests/e2e/public-page.spec.ts`, `tests/e2e/pdf.spec.ts`, `tests/e2e/slug-redirect.spec.ts`                     |
| Escaped markup, http(s) URLs, JSON-LD                                   | `src/components/portfolio/portfolio-page.spec.tsx`, `src/lib/validation/profile.spec.ts`, `src/lib/seo.spec.ts` |
| PDF availability, sparse profile, reuse                                 | `src/lib/pdf.spec.ts`, `tests/e2e/pdf.spec.ts`                                                                  |
| Extreme content (0 sections, 100 skills, long bio, one-word/empty name) | `src/components/portfolio/portfolio-page.spec.tsx`, `src/lib/validation/profile.spec.ts`                        |
| Template and CSS variable parity                                        | `tests/e2e/public-page.spec.ts` (preview/public/print/PDF)                                                      |

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

`.github/workflows/ci.yml` runs three jobs on pushes to `main` and on pull requests. All jobs install with
`pnpm install --frozen-lockfile` and share the same env block (`DATABASE_URL`, `DATABASE_TEST_URL`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, SMTP settings, `NEXT_PUBLIC_APP_URL`, and `E2E_BASE_URL`):

1. **checks:** a `postgres:16-alpine` service supplies the dev and `_test` databases; run
   `pnpm lint` → `pnpm typecheck` → `pnpm test`. Integration specs migrate `foliocraft_test` on
   setup, so the test database URL must point at a real Postgres instance.
2. **build:** the same Postgres service and env, then `pnpm db:migrate` → `pnpm build`.
3. **e2e:** `postgres:16-alpine` and `axllent/mailpit` services, then `pnpm db:migrate` →
   `pnpm seed` (idempotent; safe to repeat) → `pnpm exec playwright install --with-deps chromium`
   → `pnpm test:e2e`. The `playwright-report` directory is uploaded when the job fails.

## Coverage

Coverage tooling is not configured yet; it will be introduced together with the first business-logic modules. The planned policy: minimum 80% lines/functions/statements/branches on business-logic paths (`src/lib/**`, `src/components/**`, server actions), with infrastructure and framework glue covered by integration/E2E instead of the unit gate.
