# AGENTS.md — FolioCraft

Single Next.js 15 App Router app, **not** a monorepo. `docs/SPEC.md` is the product authority (itself in pt-BR); `docs/TASKS.md` is the work board — `Implementada` means code committed, `Status [x]` means gate green **and** independent review approved. New code, comments, commits and docs in English; all user-visible UI copy in pt-BR.

## Commands and toolchain

- Node 24 / pnpm 10 are pinned by mise (`.mise.toml`, `.nvmrc`); in this environment run `mise exec -- pnpm <cmd>` — bare `pnpm` can resolve to the wrong toolchain. Use `mise install` on a fresh machine.
- Gate order: `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build`. CI splits this into `checks` (lint/typecheck/test, no env vars) and `build` (Postgres service + full env block).
- `pnpm infra:up` / `pnpm infra:down` use **Podman** Compose, not Docker: Postgres 16 (dev db `foliocraft`) + Mailpit (SMTP `:1025`, web UI `:8025`).
- `pnpm seed`, `pnpm test:e2e`, `pnpm db:generate` / `db:migrate` / `db:studio` are declared in `package.json` but their supporting files/configs (`scripts/seed.ts`, `playwright.config.ts`, `tests/e2e/`, drizzle config) do not exist yet — do not assume they run.

## Gotchas

- **`docs/TESTING.md` is the testing authority.** `docs/skills/TESTING_FRONTEND_GUIDELINE.md` is a stale TICKETVIBE template describing a `apps/*` + `packages/*` monorepo with turbo filters; ignore its commands, "Project Overrides" and tooling-status claims.
- Vitest has three projects: `unit` (`src/**/*.spec.ts`), `dom` (`src/**/*.spec.tsx`, jsdom + jest-dom), `integration` (`src/**/*.integration.spec.ts`, real `foliocraft_test` DB, serial). `passWithNoTests: true` lives at the **root** of `vitest.config.ts`, so `pnpm test` exits 0 even if all specs disappear — check the reported test count, not just the exit code.
- `foliocraft_test` is created by `scripts/init-test-db.sql`, mounted into Postgres only on first volume init; an existing `foliocraft_pgdata` volume will not re-run it.
- Env is split deliberately: `src/lib/env.ts` parses `process.env` eagerly at import (fail-fast), so never import it from a client component or a unit test. Tests import `parseEnv`/`envSchema` from `src/lib/env-schema.ts` instead — otherwise they silently depend on a developer `.env`. `BETTER_AUTH_SECRET` must be ≥ 32 chars; `.env` is gitignored, copy `.env.example`.
- Figma is the source of truth for UI. Baselines live in `.figwright/snapshots/` (gitignored); read values through the `figwright` MCP tools in Code Mode (`get_design_context` + `design_diff`) with the plugin open — never measure from screenshots.
- Product constraints that are easy to violate: exactly 3 templates × light/dark and typed tokens only (no user-supplied CSS, colors or fonts). Hex literals belong only in the token block of `src/app/globals.css` (later `src/lib/template.ts`). Public pages are SSG + ISR; drafts 404; PDF only via `/[slug]/print` behind the `PdfRenderer` interface.

## Commits

- **Commit after each important function/task, not in one batch at the end.** Stage only that task's files; if the diff mixes unrelated changes, split into separate commits.
- Format `<type>(<scope>): <description>`: English, imperative, lowercase subject, no trailing period, scope when useful (`feat(auth):`, `fix(ui):`). Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`. Add a blank-line body for what/why and a footer (`Closes #123`, `BREAKING CHANGE: …`) when needed. Full rules: `docs/skills/COMMIT_GUIDELINE.md`.
- Commitlint enforces the subject on `commit-msg`; Lefthook runs Biome on staged files + typecheck before the commit and `pnpm test` on push — finish the gate before committing.

## Conventions

- Biome only (no ESLint/Prettier): tabs, line width 100, double quotes, organize imports.
- Unit/component tests are co-located as `<source>.spec.ts(x)`; E2E is centralized in `tests/e2e/`. Prefer accessible queries and MSW at the network boundary over implementation-detail mocks.
