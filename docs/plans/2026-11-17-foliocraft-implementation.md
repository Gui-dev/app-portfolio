# FolioCraft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o FolioCraft — gerador de portfólio/currículo com editor em split-screen, página pública em `/[slug]` (SSG/ISR + SEO) e exportação de PDF real.

**Architecture:** App Next.js 15 único. Dados em Postgres via Drizzle. Páginas públicas renderizadas com `PortfolioPage` (mesmo componente do preview e da rota de impressão), estáticas por `generateStaticParams` e revalidadas on-demand nas Server Actions. Auth com Better Auth (email/senha + GitHub). PDF via Playwright sobre `/[slug]/print`, atrás de uma interface `PdfRenderer`.

**Tech Stack:** Next.js 15 · React 19 · TypeScript strict · Tailwind v4 · Drizzle + Postgres 16 · Better Auth · Zod · react-hook-form · Nodemailer/Mailpit · Biome · Lefthook · Vitest + RTL + MSW · Playwright · pnpm · Podman.

**Spec:** `docs/SPEC.md` (leia junto — o plano argumenta a partir dele)

## Global Constraints

- pnpm only; Node 24 LTS (`mise`); `packageManager` pinado no `package.json`.
- Next.js 15 App Router, React 19, TypeScript `strict`; Tailwind v4 com CSS vars.
- Postgres 16 e Mailpit em `compose.yaml` (Podman). Nenhum SQLite.
- Zod é a única fonte de validação (cliente e Server Actions) e valida env no boot.
- Biome é o único linter/formatter; não adicionar ESLint/Prettier.
- react-hook-form + `zodResolver` em todos os formulários.
- Exatamente 3 templates (`minimal`, `developer`, `modern`) × light/dark; nenhuma cor/fonte/CSS
  arbitrária vinda do usuário. Template define tipografia, layout e acento; monograma é neutro
  (`gradient | solid | outline`).
- UI em pt-BR; código, commits, README e docs em inglês.
- `src/lib/env.ts` é **server-only**; componentes client usam `process.env.NEXT_PUBLIC_APP_URL`.
- Rota pública é `/[slug]`; rascunho/despublicado responde 404 e não aparece em sitemap/explore.
- Slug: 3–30 chars, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, blocklist; troca grava `slug_history` e
  responde redirect permanente.
- PDF só a partir de `/[slug]/print`, via `PdfRenderer`; Chromium ausente ⇒ 503.
- Testes co-localizados `<source>.spec.ts(x)`; integração `.integration.spec.ts`; e2e em
  `tests/e2e/`. Unitário nunca toca banco/rede/relógio real.
- Commits `type(scope): descrição` em inglês, minúsculo, imperativo, sem ponto final.

## Review Focus

- **Slug hostil:** reservado, já tomado, com acento/espaços, ou reclaim do próprio slug antigo
  — deve retornar erro de campo amigável, nunca 500 nem linha duplicada em histórico.
  _(tests: Task 5 — `slug.spec`, `queries.integration.spec`; Task 7 — `actions.integration.spec`)_
- **Vazamento de rascunho:** `/[slug]`, `/[slug]/print` e `/api/pdf/[slug]` de perfil não
  publicado devem dar 404, e slug antigo não pode redirecionar para rascunho.
  _(tests: Task 5, Task 10, Task 12)_
- **Injeção:** HTML/markup em nome/bio/descrições aparece escapado; URLs só `http(s)`;
  JSON-LD com `<` escapado como `\u003c`.
  _(tests: Task 5 — URL `javascript:`; Task 6 — texto escapado; Task 11 — JSON-LD)_
- **PDF frágil:** Chromium ausente, timeout ou perfil vazio não podem pendurar a request —
  503 claro no primeiro caso, PDF válido no último.
  _(tests: Task 12)_
- **Deriva de template:** preview, página pública e PDF devem renderizar o mesmo template e as
  mesmas CSS vars. _(tests: Task 6 — `data-template`/vars; Task 9 — preview; Task 10/12 — público e impressão)_
- **Conteúdo extremo:** zero seções, 100 skills, bio longa, nome de uma palavra ou vazio não
  quebram layout nem monograma. _(tests: Task 6 — `portfolio-page.spec`, `initials.spec`)_

---

## File Structure

```
compose.yaml · drizzle.config.ts · biome.json · lefthook.yml · commitlint.config.mjs
next.config.ts · tsconfig.json · .mise.toml · .env.example · playwright.config.ts
src/app/
  layout.tsx · globals.css · page.tsx · not-found.tsx · robots.ts · sitemap.ts
  opengraph-image.tsx
  explore/page.tsx · explore/page/[page]/page.tsx
  [slug]/page.tsx · [slug]/print/page.tsx · [slug]/opengraph-image.tsx
  api/auth/[...all]/route.ts · api/pdf/[slug]/route.ts
  (auth)/login|signup|forgot-password|reset-password/page.tsx
  dashboard/layout.tsx · page.tsx · actions.ts · settings/page.tsx
src/components/
  ui/                 # button, input, textarea, label, tabs, switch, select, badge, dialog
  marketing/          # site-header, hero, feature-grid, site-footer, explore-list
  auth/               # login-form, signup-form, forgot-password-form, reset-password-form
  editor/             # editor-shell, tab-nav, profile-form, experience-form, projects-form,
                      # skills-form, appearance-form, sticky-action-bar, preview-panel, use-autosave
  portfolio/          # portfolio-page, monogram, section-heading, experience-list,
                      # project-list, skill-list, social-links
  settings/           # password-form, connected-accounts, delete-account-dialog
src/lib/
  env.ts · auth.ts · auth-client.ts · email.ts · email-templates.ts
  db/schema.ts · db/client.ts · db/queries.ts · db/test-helpers.ts
  validation/profile.ts · slug.ts · template.ts · initials.ts · experience-kinds.ts · samples.ts
  · seo.ts · pdf.ts · urls.ts
scripts/seed.ts
drizzle/             # migrations geradas
tests/e2e/           # auth, editor, public-page, slug-redirect, seo, pdf, settings, a11y
tests/e2e/helpers/   # mailpit, db, users
docs/TESTING.md      # regravado para FolioCraft na Task 1
```

---

### Task 1: Bootstrap, tooling e infraestrutura local

**Files:**

- Create: `.mise.toml`, `.nvmrc`, `.gitignore`, `package.json`, `tsconfig.json`, `next.config.ts`,
  `postcss.config.mjs`, `biome.json`, `lefthook.yml`, `commitlint.config.mjs`, `compose.yaml`,
  `.env.example`, `vitest.config.ts`, `vitest.setup.ts`, `src/lib/env.ts`, `src/app/layout.tsx`,
  `src/app/page.tsx`, `src/app/globals.css`, `src/lib/env.spec.ts`,
  `.github/workflows/ci.yml`, `docs/TESTING.md`
- Modify: `docs/skills/COMMIT_GUIDELINE.md` (remover referência a TICKETVIBE no título)

**Interfaces:**

- Consumes: nada
- Produces: `env` (objeto Zod-validado com `DATABASE_URL`, `DATABASE_TEST_URL`,
  `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID?`, `GITHUB_CLIENT_SECRET?`,
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `NEXT_PUBLIC_APP_URL`); scripts `dev`, `build`,
  `lint`, `typecheck`, `test`,
  `test:e2e`, `db:generate`, `db:migrate`, `db:studio`, `seed`, `infra:up`, `infra:down`.

- [ ] **Step 1: Fixar ambiente e iniciar repositório**

Run: `git init -b main`
Crie `.mise.toml` com `node = "24"` e `pnpm = "10"`; `.nvmrc` com `24`.
Run: `mise install && pnpm -v`
Expected: pnpm ≥ 10. Se o download falhar, fallback documentado no `.mise.toml`:
`node = "25.2.1"` (versão já instalada que fornece o shim de pnpm).

- [ ] **Step 2: Criar `package.json` e configs do Next**

Dependências: `next@15 react@19 react-dom@19 zod drizzle-orm postgres better-auth nodemailer
react-hook-form @hookform/resolvers clsx tailwind-merge class-variance-authority lucide-react
@radix-ui/react-tabs @radix-ui/react-switch @radix-ui/react-select @radix-ui/react-label
@radix-ui/react-slot @radix-ui/react-dialog`.
Dev: `typescript @types/node @types/react @types/react-dom @types/nodemailer tailwindcss
@tailwindcss/postcss @biomejs/biome lefthook @commitlint/cli @commitlint/config-conventional
vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
@testing-library/user-event msw @playwright/test drizzle-kit tsx dotenv`.
`tsconfig.json` com `strict: true`, `paths: { "@/*": ["./src/*"] }`, plugin Next.
`next.config.ts` vazio (sem otimizações prematuras). `postcss.config.mjs` com
`@tailwindcss/postcss`. `src/app/layout.tsx` mínimo e `page.tsx` com `<h1>FolioCraft</h1>`.

- [ ] **Step 3: Configurar Biome, Lefthook e commitlint**

`biome.json`: `"indentStyle": "tab"` (padrão do Biome, igual aos docs herdados),
`"lineWidth": 100`, lint recommended, organizar imports.
`lefthook.yml`:

```yaml
pre-commit:
  jobs:
    - run: pnpm exec biome check --write --staged --files-ignore-unknown=true --no-errors-on-unmatched && git update-index --again
    - run: pnpm typecheck
pre-push:
  jobs:
    - run: pnpm test
commit-msg:
  jobs:
    - run: pnpm exec commitlint --edit {1}
```
Run: `pnpm exec lefthook install`
Expected: `.git/hooks/pre-commit`, `pre-push` e `commit-msg` criados.

- [ ] **Step 4: Subir Postgres e Mailpit com Podman**

`compose.yaml`: `postgres:16-alpine` (db `foliocraft`, user `foliocraft`, senha `foliocraft`,
porta 5432, volume nomeado, healthcheck `pg_isready`) e `axllent/mailpit` (1025 SMTP, 8025 UI,
`MP_MAX_MESSAGES=500`). `scripts/init-test-db.sql` montado em
`/docker-entrypoint-initdb.d/` criando `foliocraft_test`.
`.env.example` com todas as vars; `.env` local espelhando Mailpit.
Run: `pnpm infra:up && podman compose ps`
Expected: os dois serviços `healthy`; `curl -s localhost:8025/api/v1/info` responde JSON.

- [ ] **Step 5: Validação de env com Zod + teste**

`src/lib/env.ts` exporta `env = envSchema.parse(process.env)`.
`src/lib/env.spec.ts`: `it('should reject a missing DATABASE_URL')` espera `ZodError`;
`it('should default SMTP_PORT to 1025')`.
Run: `pnpm vitest run src/lib/env.spec.ts`
Expected: 2 passing.

- [ ] **Step 6: Vitest com três projetos + smoke test**

`vitest.config.ts` com `test.projects`: `unit` (node, `src/**/*.spec.ts`, exclui
`*.integration.spec.ts`), `dom` (jsdom, `src/**/*.spec.tsx`, setup com jest-dom), `integration`
(node, `src/**/*.integration.spec.ts`, setup `src/lib/db/test-helpers.ts`, `fileParallelism:
false`). `src/app/page.spec.tsx` (JSX no projeto dom → co-locar como
`src/app/page.spec.tsx`): `it('should render the product name')`.
Run: `pnpm test`
Expected: smoke test verde nos três projetos configurados.

- [ ] **Step 7: Scripts, CI e documentação de testes**

Scripts: `dev`, `build`, `start`, `lint` = `biome check .`, `format` = `biome format --write .`,
`typecheck` = `tsc --noEmit`, `test` = `vitest run`, `test:e2e` = `playwright test`,
`db:generate` = `drizzle-kit generate`, `db:migrate` = `drizzle-kit migrate`,
`db:studio` = `drizzle-kit studio`, `seed` = `tsx scripts/seed.ts`,
`infra:up` = `podman compose up -d`, `infra:down` = `podman compose down`.
`.github/workflows/ci.yml`: job `checks` (`pnpm install --frozen-lockfile` → `pnpm lint` →
`pnpm typecheck` → `pnpm test`) e job `build` com service `postgres:16-alpine` +
`DATABASE_URL` de CI → `pnpm db:migrate` → `pnpm build` (o build executa `generateStaticParams`
e `sitemap.ts`, que consultam o banco). Job e2e entra na Task 14.
Reescreva `docs/TESTING.md` para o FolioCraft: comandos reais, três níveis, três projetos
Vitest, colocação de specs, gates do Lefthook, CI. Remova referências a TICKETVIBE,
`packages/shared`, `apps/api` e `apps/web`. Mantenha `docs/skills/TESTING_FRONTEND_GUIDELINE.md`
como referência genérica.

- [ ] **Step 8: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: todos exit 0. O `build` exige `pnpm infra:up` (banco no ar e migrado).

```bash
git add -A
git commit -m "chore: bootstrap nextjs app with pnpm biome and podman infra"
```

---

### Task 2: Design tokens, primitivas de UI e landing

**Files:**

- Create: `src/app/globals.css` (tokens), `src/app/layout.tsx` (fontes),
  `src/components/ui/{button,input,textarea,label,tabs,switch,select,badge}.tsx`,
  `src/components/marketing/{site-header,hero,feature-grid,site-footer}.tsx` + specs,
  `src/components/marketing/*.spec.tsx`, `src/app/page.tsx` (substitui placeholder)
- Modify: `src/app/page.spec.tsx`

**Interfaces:**

- Consumes: `env` (Task 1)
- Produces: `Button` (variants `default | secondary | ghost | outline`, `asChild`),
  `Input`, `Textarea`, `Label`, `Tabs` (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`),
  `Switch`, `Select`, `Badge`; classes utilitárias `font-display`, `font-sans`, `font-mono`;
  CSS vars `--bg --surface --border --fg --muted --accent --accent-2`.

- [ ] **Step 1: Re-ler o Figma**

Chame `figwright.get_design_context` em `1:177` (raiz), `1:180` (header), `1:305` (footer) e
`1:319` (preview). Salve baseline com `figwright.design_diff` nesses nós.
Expected: valores de cor, fonte, raio e espaçamento conferidos contra `docs/SPEC.md §6`.
Divergência ⇒ atualizar `docs/SPEC.md`, nunca inventar.

- [ ] **Step 2: Fontes e tokens**

`layout.tsx` com `next/font/google`: `Plus_Jakarta_Sans` (`--font-display`),
`Inter` (`--font-sans`), `JetBrains_Mono` (`--font-mono`) e `Fraunces`
(`--font-serif`, template Minimal). `globals.css` com
`@import "tailwindcss"` e `@theme` mapeando as CSS vars do spec + dark como padrão da UI do
app. Nenhum componente pode conter hex literal — só token.

- [ ] **Step 3: Primitivas de UI**

Componentes Radix + CVA, sem lógica de negócio. `button.spec.tsx`:
`it('should render as a link when asChild is used')`; `it('should apply the secondary variant')`.
Run: `pnpm vitest run src/components/ui`
Expected: verdes.

- [ ] **Step 4: Landing**

`site-header` (marca, links Explore/Login, CTA "Criar meu portfólio"), `hero` (pill
"SSR + SEO", título, subtítulo, CTA para `/signup`, link "Ver demo" para `/bruce-wayne`),
`feature-grid` (SEO técnico, Temas, PDF), `site-footer`.
`hero.spec.tsx`: `it('should link the primary CTA to signup')` (`href="/signup"`) e
`it('should link the demo to the seeded profile')` (`href="/bruce-wayne"`).

- [ ] **Step 5: Checkpoint visual**

Run: `pnpm dev`, abra `http://localhost:3000`, capture screenshot 1920×1200.
Expected: dark editorial, gradiente indigo→violeta, Plus Jakarta no display, Inter no corpo,
JetBrains Mono em pills/labels. Enviar o screenshot para revisão **antes** da Task 3.

- [ ] **Step 6: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test`

```bash
git add -A
git commit -m "feat(landing): add design tokens ui primitives and marketing page"
```

---

### Task 3: Schema do banco e migrations

**Files:**

- Create: `src/lib/db/schema.ts`, `src/lib/db/client.ts`, `drizzle.config.ts`,
  `drizzle/0000_profiles.sql` (gerada)
- Modify: `compose.yaml` (garantir `scripts/init-test-db.sql` montado)

**Interfaces:**

- Consumes: `env.DATABASE_URL`
- Produces: `db` (cliente Drizzle tipado); tabelas `profiles`, `experiences`, `projects`,
  `skills`, `slugHistory`; tipos `Profile`, `NewProfile`, `ProfileWithRelations`,
  `ProfileCard`; enums `templateEnum`, `colorModeEnum`, `monogramStyleEnum`,
  `experienceKindEnum`.

- [ ] **Step 1: Escrever o schema**

Tabelas e colunas exatamente como `docs/SPEC.md §4`: `profiles.template` (default `modern`),
`color_mode` (default `dark`), `monogram_style` (default `gradient`), sem coluna `layout`;
`experiences.kind` (default `formal`). FKs `onDelete: "cascade"`; `profiles.userId`
único; `profiles.slug` único; `slugHistory.slug` único; índices compostos de ordenação;
`tags text[] not null default '{}'`. Exportar relações Drizzle (`profilesRelations` etc.).
Tipos `ProfileWithRelations = Profile & { experiences: Experience[]; projects: Project[];
skills: Skill[] }` e `ProfileCard = Pick<Profile, "slug" | "fullName" | "headline"> & { skills: string[] }`.

- [ ] **Step 2: Cliente e config**

`client.ts` com `postgres(env.DATABASE_URL, { max: 10 })` e singleton via `globalThis` em dev.
`drizzle.config.ts` com `dialect: "postgresql"`, `schema: "./src/lib/db/schema.ts"`,
`out: "./drizzle"`, `dbCredentials.url = env.DATABASE_URL`.

- [ ] **Step 3: Gerar e aplicar a migration**

Run: `pnpm db:generate && pnpm db:migrate`
Expected: `drizzle/0000_profiles.sql` criado e aplicado sem erro.

- [ ] **Step 4: Verificar no Postgres**

Run: `podman compose exec postgres psql -U foliocraft -d foliocraft -c "\d profiles"`
Expected: colunas, defaults, unique de `slug` e `user_id`, FK cascade.

- [ ] **Step 5: Gate e commit**

Run: `pnpm typecheck && pnpm lint`

```bash
git add -A
git commit -m "feat(db): add profile schema and migrations"
```

---

### Task 4: Autenticação com Better Auth, email e GitHub

**Files:**

- Create: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/email.ts`,
  `src/lib/email-templates.ts` + spec, `src/app/api/auth/[...all]/route.ts`,
  `src/app/(auth)/layout.tsx`, `src/app/(auth)/{login,signup,forgot-password,reset-password}/page.tsx`,
  `src/components/auth/{login-form,signup-form,forgot-password-form,reset-password-form}.tsx` + specs,
  `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx` (placeholder protegido),
  `drizzle/0001_auth.sql`, `playwright.config.ts`, `tests/e2e/helpers/mailpit.ts`,
  `tests/e2e/helpers/users.ts`, `tests/e2e/auth.spec.ts`
- Modify: `package.json` (`test:e2e` já existe), `src/lib/env.ts` (se precisar de var nova)

**Interfaces:**

- Consumes: `db`, `env`, `profiles` (ainda não usada)
- Produces: `auth` (server), `authClient` (client com `signUp.email`, `signIn.email`,
  `signIn.social`, `signOut`, `forgetPassword`, `resetPassword`, `changePassword`);
  `sendEmail({ to, subject, html })`; `verificationEmailHtml(url)` e
  `resetPasswordEmailHtml(url)`; helper `getSessionUser()` para server components.

- [ ] **Step 1: Configurar Better Auth e gerar tabelas**

`src/lib/auth.ts`: `betterAuth({ database: drizzleAdapter(db, { provider: "pg" }), emailAndPassword:
{ enabled: true, requireEmailVerification: true, minPasswordLength: 8 }, socialProviders:
env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? { github: { clientId: env.GITHUB_CLIENT_ID,
clientSecret: env.GITHUB_CLIENT_SECRET } } : {},
emailVerification: { sendVerificationEmail: async ({ user, url }) => sendEmail(...) },
emailAndPassword: { sendResetPassword: async ({ user, url }) => sendEmail(...) } })`.
GitHub é **opcional em dev**: sem credenciais, o botão social não renderiza e os fluxos
email/senha seguem 100% testáveis.
Run: `pnpm dlx @better-auth/cli generate --config src/lib/auth.ts --output src/lib/db/auth-schema.ts`
Mova as tabelas para `schema.ts` ou reexporte; `pnpm db:generate && pnpm db:migrate`.
Expected: `0001_auth.sql` aplicado com `user`, `session`, `account`, `verification`.

- [ ] **Step 2: Transporte de email + templates**

`email.ts`: Nodemailer com `host: env.SMTP_HOST`, `port: env.SMTP_PORT`, `secure: false`;
em dev aponta para Mailpit. `email-templates.ts`: HTML simples pt-BR com link `<a href>`.
`email-templates.spec.ts`: `it('should include the verification url')` e
`it('should escape a display name containing markup')`.

- [ ] **Step 3: Páginas e formulários de auth**

RHF + Zod (`src/lib/validation/auth.ts`: `signupSchema` com confirmação de senha,
`loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`). Signup chama
`authClient.signUp.email` e mostra "Verifique seu email"; login redireciona para
`/dashboard`; forgot mostra mensagem genérica (não revela existência de conta); reset usa
`token` da query.
`signup-form.spec.tsx`: `it('should show a field error when passwords differ')` e
`it('should show a field error for an invalid email')`.
Checkpoint visual: screenshot de `/login` e `/signup` para revisão (telas derivadas, sem Figma).

- [ ] **Step 4: Guard do dashboard**

`app/dashboard/layout.tsx` lê a sessão via `auth.api.getSession({ headers: await headers() })`;
sem sessão ⇒ `redirect("/login")`. `page.tsx` placeholder "Configurando seu perfil…".
`(auth)` layout com card central seguindo os tokens.

- [ ] **Step 5: Playwright + helper de Mailpit**

`playwright.config.ts`: `testDir: "./tests/e2e"`, `baseURL: process.env.E2E_BASE_URL ??
"http://localhost:3000"`, `retries: process.env.CI ? 1 : 0`, `use: { trace:
"retain-on-failure" }`, `webServer` = `pnpm dev` com `reuseExistingServer: !process.env.CI`.
`helpers/mailpit.ts`: `waitForEmail({ to, subjectContains })` via
`GET http://127.0.0.1:8025/api/v1/messages`, extrai `href` do HTML com polling até 10s.
`helpers/users.ts`: `uniqueEmail(prefix)` = `prefix+Date.now()+rand@example.com`.

- [ ] **Step 6: E2E de auth**

`tests/e2e/auth.spec.ts`:
`it('should sign up, verify by email and reach the dashboard')` — signup, pega link no
Mailpit, visita, login, espera `/dashboard`.
`it('should reject a wrong password')` — mensagem de erro visível, permanece em `/login`.
Run: `pnpm test:e2e tests/e2e/auth.spec.ts`
Expected: 2 passing (stack local no ar).

- [ ] **Step 7: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e tests/e2e/auth.spec.ts`

```bash
git add -A
git commit -m "feat(auth): add better auth with email verification and github login"
```

---

### Task 5: Domínio — slug, contratos Zod e queries

**Files:**

- Create: `src/lib/slug.ts` + spec, `src/lib/validation/profile.ts` + spec,
  `src/lib/urls.ts` (refine `http(s)`), `src/lib/db/test-helpers.ts`,
  `src/lib/db/queries.ts` + `queries.integration.spec.ts`
- Modify: `package.json` (script `test:integration` opcional)

**Interfaces:**

- Consumes: `db`, tipos do schema
- Produces: `normalizeSlug`, `validateSlug`, `RESERVED_SLUGS`, `isReservedSlug`;
  `ProfileDraftSchema`, `ProfileDraft`; queries `getProfileForUser`,
  `getPublicProfileBySlug`, `listPublishedProfiles`, `resolveSlugRedirect`, `isSlugAvailable`;
  `ensureTestDatabase`, `migrateTestDatabase`, `resetDatabase`.

- [ ] **Step 1: Teste do slug (falhando)**

`src/lib/slug.spec.ts`:

```ts
it("should normalize spaces and case", () =>
	expect(normalizeSlug("  Lucas Almeida ")).toBe("lucas-almeida"));
it("should strip invalid characters and collapse dashes", () =>
	expect(normalizeSlug("Lucas_Almeida!!--dev")).toBe("lucas-almeida-dev"));
it("should reject slugs shorter than 3", () =>
	expect(validateSlug("ab")).toEqual({ ok: false, reason: "length" }));
it("should reject more than 30 characters", () =>
	expect(validateSlug("a".repeat(31)).ok).toBe(false));
it("should reject consecutive dashes", () =>
	expect(validateSlug("lucas--almeida")).toEqual({ ok: false, reason: "charset" }));
it("should reject a leading dash", () =>
	expect(validateSlug("-lucas")).toEqual({ ok: false, reason: "charset" }));
it("should reject reserved words", () =>
	expect(validateSlug("dashboard")).toEqual({ ok: false, reason: "reserved" }));
it("should accept a valid slug", () => expect(validateSlug("bruce-wayne")).toEqual({ ok: true }));
```
Run: `pnpm vitest run src/lib/slug.spec.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 2: Implementar `slug.ts`**

`normalizeSlug`: minúsculas, normaliza NFD e remove diacríticos, troca não-alfanuméricos por
`-`, colapsa dashs, remove das pontas, trunca em 30.
`RESERVED_SLUGS`: `api, auth, dashboard, explore, login, signup, forgot-password,
reset-password, settings, print, robots.txt, sitemap.xml, favicon.ico, _next,
opengraph-image`.
Run: mesmo comando.
Expected: PASS (8 testes).

- [ ] **Step 3: Contratos Zod (falhando) e implementação**

`src/lib/urls.ts`: `httpUrl = z.string().url().refine(v => /^https?:\/\//.test(v))`.
`profile.spec.ts`:
`it('should reject a javascript url')` com `repoUrl: 'javascript:alert(1)'`;
`it('should reject more than 100 skills')`;
`it('should reject more than 20 experiences')`;
`it('should reject an unknown experience kind')`;
`it('should accept an empty draft')` (nome e slug vazios válidos em rascunho);
`it('should require a full name to publish')` via `publishableProfileSchema`.
Implemente `ProfileDraftSchema` com limites, `publishableProfileSchema` exigindo `fullName` e
`slug` válidos, e `contactEmail` obrigatório em ambos.
Run: `pnpm vitest run src/lib/validation`

- [ ] **Step 4: Helpers de banco de teste**

`test-helpers.ts` opera **somente** em `folio_craft_test` (guarda que lança se a URL não
terminar com `_test`): cria o banco se faltar, roda `drizzle-kit migrate` com
`DATABASE_URL` de teste, e `resetDatabase()` truncando todas as tabelas com
`RESTART IDENTITY CASCADE`.
Run: `pnpm test` (integration setup executa)
Expected: setup ok, sem tabelas no banco de dev.

- [ ] **Step 5: Queries (teste de integração primeiro)**

`queries.integration.spec.ts`:
`it('should not return a draft by public slug')`;
`it('should return experiences ordered by sort_order')`;
`it('should paginate published profiles by 12')`;
`it('should resolve an old slug only when the target is published')`;
`it('should consider a slug unavailable when taken by another profile')`;
`it('should allow the current profile to keep its own slug')`.
Rodar cada teste antes da implementação e ver falhar; implementar `queries.ts` com joins e
ordenação; `resolveSlugRedirect` só resolve alvo com `isPublished = true`.

- [ ] **Step 6: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test`

```bash
git add -A
git commit -m "feat(domain): add slug rules zod contracts and profile queries"
```

---

### Task 6: Templates, monograma e `PortfolioPage`

**Files:**

- Create: `src/lib/template.ts` + spec, `src/lib/initials.ts` + spec,
  `src/lib/experience-kinds.ts` + spec, `src/components/portfolio/portfolio-page.tsx` + spec,
  `src/components/portfolio/{monogram,section-heading,experience-list,project-list,skill-list,social-links}.tsx`
- Modify: `src/app/globals.css` (vars por `[data-mode]` e tipografia por `[data-template]`)

**Interfaces:**

- Consumes: `ProfileWithRelations`, `Template`, `ColorMode`, `MonogramStyle`, `ExperienceKind`
- Produces: `TEMPLATES`, `templateStyle`, `initials`, `EXPERIENCE_KINDS`, `PortfolioPage` com
  props `{ profile: ProfileWithRelations; className?: string }` (usa `profile.template` /
  `profile.colorMode` para as vars e `data-template`). Sem imports de banco ou Next APIs —
  renderizável em qualquer contexto.

- [ ] **Step 1: Testes de template, monograma e kinds (falhando)**

`template.spec.ts`:

```ts
it("should expose the three templates", () =>
	expect(Object.keys(TEMPLATES)).toEqual(["minimal", "developer", "modern"]));
it("should map the modern template to css variables", () =>
	expect(templateStyle("modern", "dark")).toMatchObject({
		"--accent": "#6366F1",
		"--accent-2": "#22D3EE",
	}));
it("should use the emerald accent for the developer template", () =>
	expect(templateStyle("developer", "dark")["--accent"]).toBe("#10B981"));
it("should use different backgrounds for light and dark", () =>
	expect(templateStyle("modern", "light")["--bg"]).not.toBe(
		templateStyle("modern", "dark")["--bg"],
	));
```
`initials.spec.ts`: `'Lucas Almeida'→'LA'`, `'Bruce Wayne'→'BW'`, `'Cher'→'C'`, `'Ana Maria
Braga'→'AB'`, `'  lucas   almeida  '→'LA'`, `''→'?'`.
`experience-kinds.spec.ts`: `EXPERIENCE_KINDS.formal.label === 'Emprego Formal'`;
`open-source`/`academic`/`freelance`/`volunteer` presentes.
Run: `pnpm vitest run src/lib/template.spec.ts src/lib/initials.spec.ts src/lib/experience-kinds.spec.ts` → FAIL.

- [ ] **Step 2: Implementar `template.ts`, `initials.ts` e `experience-kinds.ts`**

Templates conforme `docs/SPEC.md §6` (re-lidos do Figma no Step 5). `templateStyle` retorna
`React.CSSProperties` só com vars `--bg --surface --border --fg --muted --accent --accent-2`.
Tipografia entra por `data-template` no CSS (Fraunces / JetBrains Mono / Plus Jakarta + Inter).
Run: testes acima → PASS.

- [ ] **Step 3: Testes do `PortfolioPage` (falhando)**

`portfolio-page.spec.tsx`:

```ts
it("should render name, headline, bio and initials"); // getByRole('heading', { name: 'Bruce Wayne' }), getByText('BW')
it("should render social links with rel noopener"); // href github/linkedin, rel contém noopener
it("should hide empty sections"); // sem experiência/projetos/skills não há heading "Experiência"
it("should render 100 skills without crashing"); // getAllByRole('listitem').length === 100
it("should escape markup in the bio"); // bio '<script>alert(1)</script>' aparece como texto, sem <script> no container
it("should order experiences by sortOrder"); // primeiro heading de cargo é o de sortOrder 0
it("should expose the selected template and mode"); // data-template="developer", data-mode="light"
it("should render the experience kind label"); // badge "Open Source"
```
Run → FAIL.

- [ ] **Step 4: Implementar componentes de portfólio**

`PortfolioPage` aplica `style={templateStyle(...)}`, `data-template`, `data-mode` e o layout do
template (Minimal: uma coluna editorial; Developer: mono/denso com labels `//`; Modern: cards
elevados). Links externos com `rel="noopener noreferrer"` e `target="_blank"`. Seções vazias
não renderizam. `experience-list` mostra o badge do kind.
Run: `pnpm vitest run src/components/portfolio` → PASS.

- [ ] **Step 5: Grounding visual**

`figwright.get_design_context` em `1:338` (mockup do browser) e nos textos de `1:354`–`1:499`;
para os templates, `8:1180/8:1202/8:1228` e as telas `8:824`, `8:506`, `7:209`, `8:1116`.
`design_diff` contra `.figwright/snapshots/`. Compare com `PortfolioPage` renderizado numa
página `/preview-local` temporária (removida depois). Ajuste espaçamento **pelos objetos de
layout do Figma**, não por screenshot.

- [ ] **Step 6: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test`

```bash
git add -A
git commit -m "feat(portfolio): add templates monogram and portfolio renderer"
```

---

### Task 7: Editor — shell, aba Perfil, autosave e publicação

**Files:**

- Create: `src/app/dashboard/actions.ts` + `actions.integration.spec.ts`,
  `src/app/dashboard/layout.tsx` (substitui placeholder), `src/app/dashboard/page.tsx`,
  `src/components/editor/{editor-shell,tab-nav,sticky-action-bar,preview-panel,profile-form}.tsx` + specs,
  `src/components/editor/use-autosave.ts` + spec, `tests/e2e/editor.spec.ts`
- Modify: `src/components/ui/*` (se faltar primitiva)

**Interfaces:**

- Consumes: `queries`, `ProfileDraftSchema`, `slug`, `auth`
- Produces: Server Actions `saveProfileDraft(input: ProfileDraft)`, `publishProfile()`,
  `unpublishProfile()`; `ensureProfileForUser(userId, email)`; hook
  `useAutosave({ values, save, delay = 800 })` com `{ status: 'idle' | 'saving' | 'saved' |
  'error', savedAt: Date | null }`; `EditorShell` com slots `form` e `preview`.

- [ ] **Step 1: Teste das Server Actions (falhando)**

`actions.integration.spec.ts` (usa o banco de teste e uma sessão fake injetada):
`it('should create a draft profile on first save')`;
`it('should update the profile and its children')`;
`it('should return a field error when the slug is taken')`;
`it('should record the previous slug when the slug changes')`;
`it('should remove the history row when reclaiming the own old slug')`;
`it('should reject unauthenticated calls')`;
`it('should refuse to publish without a full name')`;
`it('should set publishedAt and revalidate on publish')` (mock de `next/cache`).
Run: `pnpm vitest run src/app/dashboard/actions.integration.spec.ts` → FAIL.

- [ ] **Step 2: Implementar as actions**

Todas autenticam via `auth.api.getSession`; `saveProfileDraft` valida com
`ProfileDraftSchema`, roda em transação (perfil + delete/insert de filhos por `sortOrder`),
resolve slug (normaliza, valida, checa disponibilidade) e grava histórico. Erros de campo
retornam `{ ok: false, fieldErrors }` — nunca lançar para erro esperado. `publishProfile`
exige `fullName` e chama `revalidatePath` para `/${slug}`, `/explore` e `/sitemap.xml`.
Run → PASS.

- [ ] **Step 3: Teste do autosave (falhando)**

`use-autosave.spec.ts` com `vi.useFakeTimers()`:
`it('should debounce save calls by 800ms')`;
`it('should not save when values did not change')`;
`it('should expose saved status and timestamp after a successful save')`;
`it('should expose error status when save rejects')`.
Run → FAIL; implementar; Run → PASS.

- [ ] **Step 4: Shell, aba Perfil e footer**

`EditorShell` conforme Figma (`1:178/1:180/1:205/1:305`): header com marca, pill "SSR + SEO",
switch de tema da UI e slug; `TabNav` com 5 abas (as demais renderizam "Em breve" até as
Tasks 8–9); `ProfileForm` com RHF + `ProfileDraftSchema` (nome, slug, headline, bio,
localização, email, GitHub, LinkedIn, monograma); `StickyActionBar` com indicador de sync,
"Exportar PDF" (desabilitado até a Task 12), "Publicar".
`profile-form.spec.tsx`: `it('should show the slug preview as the user types')` e
`it('should surface a slug field error returned by the server')`.

- [ ] **Step 5: Página do dashboard**

`page.tsx` (server): sessão → `ensureProfileForUser` (cria rascunho com nome do usuário e slug
derivado do email normalizado; se colidir, sufixo `-2`, `-3`…) → carrega
`ProfileWithRelations` → renderiza `EditorShell` com o form e um preview estático.
`ensureProfileForUser` é idempotente (teste na Step 1 cobre a segunda chamada sem duplicar).

- [ ] **Step 6: E2E de autosave**

`tests/e2e/editor.spec.ts`:
`it('should persist the headline after reload')` — signup/verify/login, edita headline, espera
"Rascunho sincronizado", recarrega, valor permanece.
`it('should redirect to login when unauthenticated')`.
Run: `pnpm test:e2e tests/e2e/editor.spec.ts` → 2 passing.

- [ ] **Step 7: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e tests/e2e/editor.spec.ts`

```bash
git add -A
git commit -m "feat(editor): add dashboard shell profile form autosave and publish"
```

---

### Task 8: Abas Experiência, Projetos e Skills

**Files:**

- Create: `src/components/editor/{experience-form,projects-form,skills-form}.tsx` + specs,
  `src/components/editor/repeatable-item.tsx`, `src/components/editor/beginner-helper.tsx` + spec,
  `src/lib/samples.ts` + spec
- Modify: `src/components/editor/tab-nav.tsx`, `src/app/dashboard/actions.ts` (payload completo)

**Interfaces:**

- Consumes: `ProfileDraft`, `saveProfileDraft`, `useAutosave`, `EXPERIENCE_KINDS`,
  `BEGINNER_SAMPLES`
- Produces: formulários com `useFieldArray` que produzem `experiences`/`projects`/`skills`
  com `sortOrder` reatribuído 0..n-1 na ordem visual; `kind` por experiência;
  `BEGINNER_SAMPLES` com 3 experiências (freelance, open-source, academic) prontas.

- [ ] **Step 1: Testes dos formulários repetíveis (falhando)**

`experience-form.spec.tsx`: `it('should add an experience of the selected kind')` (dropdown
"Adicionar" abre os tipos e insere `kind: 'freelance'`),
`it('should remove the second experience')`,
`it('should move an item up and renumber sortOrder')`,
`it('should show errors for a missing role')`.
`projects-form.spec.tsx`: `it('should split technologies by comma into tags')`
(`"Next.js, TypeScript" → ['Next.js','TypeScript']`), `it('should remove a project')`.
`skills-form.spec.tsx`: `it('should add a skill on Enter')`,
`it('should remove a skill from its chip')`, `it('should cap skills at 100')`.
`beginner-helper.spec.tsx`: `it('should load three sample experiences with distinct kinds')` e
`it('should not touch the database')` (verifica que só o formulário muda).
Run → FAIL.

- [ ] **Step 2: Implementar os formulários**

`RepeatableItem` com botões acessíveis "Mover para cima/baixo" e "Remover" (ícones + label
ARIA). Experiência: cartão numerado `#01`, badge do kind, campos cargo/empresa/período/
resultados; dropdown de adicionar escolhe o kind. `BeginnerHelper` (banner "Procurando o
primeiro emprego na área?") insere `BEGINNER_SAMPLES` no `useFieldArray` — client-side, sem
gravar. Projetos: nome, tecnologias por vírgula, descrição, repo, demo. Skills: input + Enter +
botão, chips com ×, limite 100.
Run: `pnpm vitest run src/components/editor src/lib/samples` → PASS.

- [ ] **Step 3: Persistência (integração, falhando)**

Adicione em `actions.integration.spec.ts`:
`it('should persist children with their visual order')`,
`it('should persist the experience kind')`,
`it('should delete children removed from the payload')`,
`it('should reject 21 projects')`,
`it('should reject an unknown experience kind')`.
Run → FAIL; implementar/ajustar a transação; Run → PASS.

- [ ] **Step 4: E2E**

`tests/e2e/editor.spec.ts`:
`it('should keep an added experience after reload')`;
`it('should load the beginner samples and keep them after reload')`;
`it('should reorder experiences and keep the new order after reload')`.
Run → passing.

- [ ] **Step 5: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e tests/e2e/editor.spec.ts`

```bash
git add -A
git commit -m "feat(editor): add experience projects and skills sections"
```

---

### Task 9: Aba Aparência e preview ao vivo

**Files:**

- Create: `src/components/editor/appearance-form.tsx` + spec,
  `src/components/editor/preview-panel.tsx` + spec, `src/components/editor/use-preview-profile.ts`
- Modify: `src/components/editor/editor-shell.tsx` (estado compartilhado via
  `FormProvider` + `useWatch`), `src/app/dashboard/page.tsx`

**Interfaces:**

- Consumes: `TEMPLATES`, `templateStyle`, `PortfolioPage`, `ProfileDraft`, `EXPERIENCE_KINDS`
- Produces: `usePreviewProfile()` retornando o `ProfileWithRelations` montado a partir dos
  valores observados do formulário (filhos com `id` temporário); `PreviewPanel` com toolbar
  (Live Preview, chip do template ativo, switch Dark, slug, "Baixar PDF" desabilitado até a Task 12).

- [ ] **Step 1: Teste do preview ao vivo (falhando)**

`preview-panel.spec.tsx`:
`it('should reflect the name typed in the form')`;
`it('should apply the selected template css variables')`;
`it('should expose the selected template in data-template')`;
`it('should switch the preview between light and dark')`;
`it('should show the public url with the current slug')`.
Run → FAIL.

- [ ] **Step 2: Implementar `usePreviewProfile` + `PreviewPanel`**

`useWatch` no `FormProvider` do editor; mapear `experiences/projects/skills` para o formato de
`ProfileWithRelations` (incluindo `kind`); renderizar `PortfolioPage` dentro do browser mockup
(`1:337` como referência). Trocar o tema da UI do editor não altera o preview do perfil.

- [ ] **Step 3: Teste da aba Aparência**

`appearance-form.spec.tsx`: `it('should render the three templates')`,
`it('should mark Modern as active by default')`,
`it('should describe each template')`,
`it('should toggle the default color mode')`.
Run → FAIL; implementar os cards de template (Minimal/Developer/Modern, com mini-preview e
descrição, referência `8:1180/8:1202/8:1228`) e os botões Light/Dark (`8:1257/8:1270`).
Run → PASS.

- [ ] **Step 4: Responsivo**

`editor-shell.spec.tsx`: `it('should switch to Edit/Preview tabs below lg')` (media query
simulada por prop ou hook; prefira CSS + teste de presença dos dois painéis com classes).
Run: `pnpm vitest run src/components/editor` → PASS.

- [ ] **Step 5: E2E**

`tests/e2e/editor.spec.ts`:
`it('should change the template and persist it after reload')` — seleciona "Developer",
verifica `data-template="developer"` e `--accent: #10B981` no preview; após recarregar,
continua Developer.
`it('should switch the preview to light mode and persist it')`.
Run → passing.

- [ ] **Step 6: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e tests/e2e/editor.spec.ts`

```bash
git add -A
git commit -m "feat(editor): add appearance tab with live preview"
```

---

### Task 10: Página pública, ISR, redirect de slug e 404

**Files:**

- Create: `src/app/[slug]/page.tsx`, `src/app/not-found.tsx`,
  `tests/e2e/public-page.spec.ts`, `tests/e2e/slug-redirect.spec.ts`
- Modify: `src/app/dashboard/actions.ts` (garantir revalidação), `src/app/page.tsx` (link demo
  continua válido)

**Interfaces:**

- Consumes: `getPublicProfileBySlug`, `resolveSlugRedirect`, `PortfolioPage`
- Produces: rota pública com `generateStaticParams` (publicados, máx. 100),
  `export const revalidate = 300`, `dynamicParams = true`; `notFound()` para rascunho.

- [ ] **Step 1: Implementar a rota**

`params` é `Promise<{ slug: string }>` no Next 15 (await). Fluxo: normaliza slug; se
`resolveSlugRedirect` retornar alvo → `permanentRedirect("/" + alvo)`; senão busca perfil
publicado; sem perfil → `notFound()`. Renderiza `PortfolioPage` em container de leitura
(`max-w-3xl`), com header mínimo (slug + botão "Baixar PDF" desabilitado até a Task 12).
`not-found.tsx` com CTA para a landing.

- [ ] **Step 2: E2E da página pública**

`public-page.spec.ts`:
`it('should publish a draft and expose it at /slug')` — fluxo completo no editor, publica,
visita `/slug`, vê nome/headline/skills.
`it('should return 404 for a draft slug')` — cria perfil sem publicar, `page.goto` devolve 404.
`it('should reflect an edit after revalidation')` — publica, edita headline, recarrega a página
pública e vê o novo texto (prova `revalidatePath`).
`it('should be reachable from the landing demo link')`.

- [ ] **Step 3: E2E do redirect de slug**

`slug-redirect.spec.ts`:
`it('should permanently redirect the old slug to the new one')` — usa
`request.get(oldUrl, { maxRedirects: 0 })` e aceita `301` ou `308`, com `location` correto.
`it('should not redirect an old slug after unpublishing')` — despublica, antigo slug → 404.
`it('should reject reserved and taken slugs in the editor')` — erro de campo visível.

- [ ] **Step 4: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e tests/e2e/public-page.spec.ts tests/e2e/slug-redirect.spec.ts`

```bash
git add -A
git commit -m "feat(public): add isr profile page with slug redirects"
```

---

### Task 11: Pacote de SEO e `/explore`

**Files:**

- Create: `src/lib/seo.ts` + spec, `src/app/[slug]/opengraph-image.tsx`,
  `src/app/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`,
  `src/app/explore/page.tsx`, `src/app/explore/page/[page]/page.tsx`,
  `src/components/marketing/explore-list.tsx`, `tests/e2e/helpers/db.ts`,
  `tests/e2e/seo.spec.ts`, `tests/e2e/explore.spec.ts`
- Modify: `src/app/[slug]/page.tsx` (usar `buildProfileMetadata`)

**Interfaces:**

- Consumes: `ProfileWithRelations`, `ProfileCard`, `TEMPLATES`, `env.NEXT_PUBLIC_APP_URL`
- Produces: `buildProfileMetadata(profile): Metadata`,
  `buildPersonJsonLd(profile): Record<string, unknown>`, `buildProfileOgAlt(profile): string`,
  `safeJsonLd(payload): string` (serializa e escapa `<` como `\u003c`).

- [ ] **Step 1: Testes unitários de SEO (falhando)**

`seo.spec.ts`:

```ts
it("should build the profile title", () =>
	expect(buildProfileMetadata(p).title).toBe("Bruce Wayne — CEO & Filantropo | FolioCraft"));
it("should truncate the description to 160 characters");
it("should set the canonical url", () =>
	expect(buildProfileMetadata(p).alternates?.canonical).toBe("https://foliocraft.app/bruce-wayne"));
it("should include the profile og image url");
it("should omit empty sameAs entries");
it("should escape < in the json-ld payload"); // JSON.stringify(...).replace(/</g, '\\u003c'), bio '<script>'
it("should include jobTitle and address in the json-ld");
```

- [ ] **Step 2: Implementar `seo.ts` e ligar ao metadata**

`generateMetadata` chama `buildProfileMetadata`; JSON-LD injetado com
`<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(...) }} />`
onde `safeJsonLd` escapa `<`. Rascunho não chega aqui (404 antes).

- [ ] **Step 3: OG images**

`[slug]/opengraph-image.tsx` (`runtime = "nodejs"`, `size = { width: 1200, height: 630 }`):
busca perfil publicado (404 se rascunho), usa cores do template, nome + headline truncados,
monograma. `opengraph-image.tsx` da landing com o gradiente indigo→violeta.
`buildProfileOgAlt`.

- [ ] **Step 4: Sitemap, robots e explore**

`sitemap.ts`: `/`, `/explore`, perfis publicados (exclui rascunhos), `revalidate = 300`.
`robots.ts`: allow `/`, disallow `/dashboard`, `/api/`, `/login`, `/signup`,
`/forgot-password`, `/reset-password`, `sitemap` absoluto.
`explore/page.tsx` (página 1) e `explore/page/[page]/page.tsx` (páginas 2..N) reaproveitam
`explore-list.tsx`: 12 por página, cards (monograma, nome, headline, até 3 skills) linkando
para `/[slug]`; `generateStaticParams` calcula as páginas no build e `revalidate = 300`;
página fora do range → `notFound()`. Nada de `searchParams` (isso tornaria a rota dinâmica).

- [ ] **Step 5: E2E de SEO e explore**

`seo.spec.ts`:
`it('should expose title, description and canonical')`;
`it('should render valid Person json-ld')` — lê `script[type="application/ld+json"]`,
`JSON.parse`, confere `@type`, `name`, `sameAs`;
`it('should serve a png og image')` — `request.get` espera 200 + `content-type: image/png`;
`it('should 404 the og image of a draft')`;
`it('should list only published profiles in the sitemap')`;
`it('should disallow the dashboard in robots.txt')`.
`explore.spec.ts`: `it('should list a published profile')`,
`it('should not list a draft')`, `it('should paginate at /explore/page/2')` (helper
`createPublishedProfile` em `tests/e2e/helpers/db.ts`, reusado na Task 14),
`it('should 404 pages beyond the last')`.

- [ ] **Step 6: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e tests/e2e/seo.spec.ts tests/e2e/explore.spec.ts`

```bash
git add -A
git commit -m "feat(seo): add metadata json-ld og images sitemap and explore"
```

---

### Task 12: PDF real com Playwright

**Files:**

- Create: `src/lib/pdf.ts` + spec, `src/app/[slug]/print/page.tsx`,
  `src/app/api/pdf/[slug]/route.ts`, `tests/e2e/pdf.spec.ts`
- Modify: `src/components/editor/sticky-action-bar.tsx`, `src/app/[slug]/page.tsx`,
  `src/app/globals.css` (`@media print`)

**Interfaces:**

- Consumes: `getPublicProfileBySlug`, `PortfolioPage`, `env.NEXT_PUBLIC_APP_URL`
- Produces: `PdfRenderer`, `createPlaywrightRenderer()`, `renderProfilePdf(renderer, url)`,
  `PdfUnavailableError`, `renderPdfResponse(bytes, filename)`.

- [ ] **Step 1: Teste do contrato do PDF (falhando)**

`pdf.spec.ts`:

```ts
it("should return the bytes produced by the renderer");
it("should reject with PdfUnavailableError when the renderer fails");
it("should set the pdf headers", () => {
	const res = renderPdfResponse(bytes, "bruce-wayne");
	expect(res.headers.get("content-type")).toBe("application/pdf");
	expect(res.headers.get("content-disposition")).toContain(
		'attachment; filename="bruce-wayne.pdf"',
	);
});
it("should return 503 when chromium is unavailable");
```
Run → FAIL.

- [ ] **Step 2: Implementar `pdf.ts`**

`createPlaywrightRenderer`: importa `chromium` de `@playwright/test`? **Não** — usar o pacote
`playwright` (runtime) para não acoplar o app ao test runner; adicionar `playwright` às
dependências. Singleton de browser em `globalThis`; `newPage` por request; `goto(url, {
waitUntil: "networkidle", timeout: 30_000 })`, `emulateMedia({ media: "print" })`,
`page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true })` — a margem vem
do `@page` do CSS, sem duplicar. Fecha a page em `finally`; falha → `PdfUnavailableError`.
`renderPdfResponse` retorna `Response` com headers e `cache-control: no-store`.

- [ ] **Step 3: Rota de impressão**

`[slug]/print/page.tsx`: `dynamic = "force-dynamic"`, `robots: { index: false, follow: false }`
via metadata, resolve slug antigo, 404 para rascunho, renderiza `PortfolioPage` sem chrome.
CSS: `@page { size: A4; margin: 12mm }`, `@media print { .no-print { display: none } }`,
`break-inside: avoid` em seções e itens.

- [ ] **Step 4: Route handler**

`GET /api/pdf/[slug]`: normaliza/valida slug; perfil publicado ou 404; monta URL absoluta
`${env.NEXT_PUBLIC_APP_URL}/${slug}/print`; `renderProfilePdf`; `renderPdfResponse`;
captura `PdfUnavailableError` → 503 JSON `{ error: "PDF_UNAVAILABLE" }`.

- [ ] **Step 5: E2E**

`pdf.spec.ts`:
`it('should download a valid pdf from the public page')` — `const res = await page.request.get(
'/api/pdf/<slug>')`, `expect(res.status()).toBe(200)`, corpo começa com `%PDF-`;
`it('should 404 the pdf of a draft')`;
`it('should mark the print page as noindex')`;
`it('should keep the download button enabled on the public page')`.
Run → passing.

- [ ] **Step 6: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e tests/e2e/pdf.spec.ts`

```bash
git add -A
git commit -m "feat(pdf): render print route to a4 pdf with playwright"
```

---

### Task 13: Configurações da conta

**Files:**

- Create: `src/app/dashboard/settings/page.tsx`,
  `src/components/settings/{password-form,connected-accounts,delete-account-dialog}.tsx` + specs,
  `tests/e2e/settings.spec.ts`
- Modify: `src/app/dashboard/layout.tsx` (link "Configurações"), `src/lib/auth.ts` (se precisar
  de `sendDeleteAccountVerification` — não: exclusão direta autenticada)

**Interfaces:**

- Consumes: `authClient.changePassword`, `authClient.listAccounts`, `authClient.unlinkAccount`,
  `authClient.signOut`, `auth` no servidor
- Produces: página com troca de senha, conexão GitHub (vincular/desvincular) e exclusão de
  conta com confirmação por digitação do slug.

- [ ] **Step 0: Habilitar exclusão no Better Auth**

Em `src/lib/auth.ts`, adicionar `user: { deleteUser: { enabled: true } }`; exclusão exige
senha (ou confirmação equivalente) na Server Action.

- [ ] **Step 1: Teste do formulário de senha (falhando)**

`password-form.spec.tsx`: `it('should require the current password')`,
`it('should reject mismatched new passwords')` (erro de campo),
`it('should show success after a valid change')`.

- [ ] **Step 2: Implementar página e componentes**

Troca de senha via Better Auth (mínimo 8 chars). Contas conectadas listadas com botão
"Desconectar" apenas quando existe outra forma de login (evita lockout). Exclusão: dialog com
input do slug, chama action que deleta `user` (cascata em `profiles`) e encerra sessão.

- [ ] **Step 3: E2E**

`settings.spec.ts`:
`it('should change the password and sign in with the new one')`;
`it('should delete the account and remove the public page')` — após excluir, `/[slug]` 404 e
login falha.
Run → passing.

- [ ] **Step 4: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e tests/e2e/settings.spec.ts`

```bash
git add -A
git commit -m "feat(settings): add password github and account deletion"
```

---

### Task 14: Seed Bruce Wayne, README e CI e2e

**Files:**

- Create: `scripts/seed.ts`, `README.md`
- Modify: `.github/workflows/ci.yml` (job e2e), `docs/TESTING.md` (status final),
  `tests/e2e/helpers/db.ts` (adicionar helpers do seed), `package.json` (se o seed precisar
  de flag `--reset`)

**Interfaces:**

- Consumes: `db`, `auth` (hash via Better Auth), schema
- Produces: seed idempotente com usuário demo `bruce@wayne.dev`, perfil publicado
  `/bruce-wayne` e rascunho `/clark-kent`; helper `createPublishedProfile(overrides)` para e2e
  de paginação.

- [ ] **Step 1: Escrever o seed**

Conteúdo em pt-BR, coerente com o Figma: Bruce Wayne, headline de CEO/filantropo com viés
tech, bio, localização "Gotham City • Remoto", links, skills (Estratégia, Segurança,
Next.js…), 2 experiências, 2 projetos com tags, template `modern` dark.
`clark-kent`: rascunho com conteúdo mínimo. Senha demo `foliocraft-demo` (documentada).
Upsert por email e slug; rodar duas vezes não duplica nada.

- [ ] **Step 2: Verificar idempotência**

Run: `pnpm seed && pnpm seed`
Expected: segunda execução sem erro; `select count(*) from profiles` = 2.
Run: `curl -s localhost:3000/bruce-wayne | grep -o "Bruce Wayne" | head -1`
Expected: `Bruce Wayne` (com `pnpm dev` no ar).

- [ ] **Step 3: README em inglês**

Seções: overview com screenshot, live demo (se houver), stack com justificativas, rotas e
estratégia de renderização (tabela do spec), arquitetura (pasta + fluxo de dados),
auth/email local (Mailpit), setup (Podman, pnpm, env, migrate, seed), demo credentials,
scripts, testes e CI, SEO checklist, decisões de escopo/non-goals, limitações conhecidas
(PDF/deploy).

- [ ] **Step 4: Job e2e no CI**

`ci.yml` adiciona `e2e`: services `postgres:16-alpine` e `axllent/mailpit`; env de teste;
`pnpm db:migrate`, `pnpm seed`, `pnpm exec playwright install --with-deps chromium`,
`pnpm test:e2e`. Artefato: `playwright-report` em falha.

- [ ] **Step 5: Gate e commit**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`

```bash
git add -A
git commit -m "chore: add demo seed readme and e2e ci job"
```

---

### Task 15: Acessibilidade, QA final e fechamento

**Files:**

- Create: `tests/e2e/a11y.spec.ts`
- Modify: `docs/TESTING.md`, `docs/TASKS.md` (marcar conclusão), `README.md` (seção
  "Verificação"), `package.json` (script `test:a11y` opcional)

**Interfaces:**

- Consumes: tudo
- Produces: suíte de acessibilidade e checklist final verde.

- [ ] **Step 1: Instalar axe e escrever a suíte**

`pnpm add -D @axe-core/playwright`.
`a11y.spec.ts` com `it('should have no serious or critical violations on <route>')` para `/`,
`/login`, `/signup`, `/bruce-wayne`, `/explore` e `/dashboard` (autenticado). Filtra
`serious`/`critical`.

- [ ] **Step 2: Teclado e foco**

E2E: navegação por Tab no editor alcança abas, campos, botões de reordenar e o footer; foco
visível; dialog de exclusão prende foco e fecha com Escape.
`it('should be fully operable with the keyboard')`.

- [ ] **Step 3: Varredura do Review Focus**

Confirme que cada linha do Review Focus tem teste verde; se faltar, adicione no task dono.
Checklist manual: 100 skills, bio longa, perfil sem seções, slug com acento, PDF de perfil
vazio, rascunho em todos os endpoints.

- [ ] **Step 4: Gate final**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`
Expected: tudo verde, sem `test.only`, sem `console.log` de debug.

- [ ] **Step 5: Commit de fechamento**

```bash
git add -A
git commit -m "test(a11y): add accessibility suite and close qa checklist"
```

---

## Self-Review

**Spec coverage:** decisões 1–19 → Tasks 1–15. Rotas → Tasks 2, 4, 7, 10, 11, 12, 13.
Modelo → 3. Auth → 4. Editor → 7–9. Tema → 6, 9. SEO → 10, 11. PDF → 12. Seed/escopo → 14.
A11y/QA → 15.

**Type consistency:** `ProfileWithRelations` (Task 3) usado em 5–12; `ProfileDraft` (5) em 7–9;
`templateStyle`/`initials`/`EXPERIENCE_KINDS` (6) em 6, 8, 9, 11; `PdfRenderer`/`PdfUnavailableError` (12) sem variantes de
nome; `saveProfileDraft`/`publishProfile`/`unpublishProfile` definidos em 7 e reusados em 8–10.

**Review Focus:** cada linha aponta para o teste que a fixa, na task dona do código.
