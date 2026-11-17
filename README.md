# FolioCraft

A portfolio/resume generator built with Next.js: users create an account, edit
their profile in a split-screen editor with live preview, pick one of three
templates, publish at `/[slug]` and export a real PDF.

> FolioCraft is under active development. See `docs/SPEC.md` for the product
> specification (in Portuguese).

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 (tokens in CSS variables)
- Postgres 16 + Drizzle ORM, via Podman Compose
- Better Auth (email/password + GitHub), Nodemailer/SMTP with Mailpit in dev
- Zod (validation, including environment variables at boot)
- Vitest + Testing Library + Playwright
- Biome, Lefthook, commitlint — pnpm as the only package manager

## Requirements

- Node 24 (`.nvmrc` / `.mise.toml`) — run `mise install` if you use mise
- pnpm 10
- Podman with the compose provider

## Getting started

```bash
mise install
pnpm install
pnpm infra:up        # start Postgres 16 + Mailpit
cp .env.example .env # then adjust values
pnpm dev             # http://localhost:3000
```

## Useful commands

```bash
pnpm lint            # biome check .
pnpm format          # biome format --write .
pnpm typecheck       # tsc --noEmit
pnpm test            # vitest run (unit + dom + integration)
pnpm build           # next build
pnpm infra:down      # stop the local infrastructure
```

See [`docs/TESTING.md`](docs/TESTING.md) for the testing conventions.
