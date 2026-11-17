# FolioCraft — Especificação

**Status:** fechado em 2026-11-17 (grilling). Alterações exigem nova decisão registrada aqui.

**Produto:** gerador de portfólio/currículo online. O usuário cria conta, edita o perfil num
split-screen com preview ao vivo, escolhe um dos três templates, publica em
`foliocraft.app/[slug]` e exporta um PDF real.

**Objetivo do projeto:** peça de portfólio demonstrando SSR/SSG, rotas dinâmicas, SEO técnico,
autenticação, exportação de PDF e disciplina de testes/CI em um produto coeso.

---

## 1. Decisões fechadas

| #   | Decisão                 | Escolha                                                                                                    |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Objetivo                | Portfólio (qualidade de produção onde for barato)                                                          |
| 2   | Audiência do formulário | Genérica (não só dev)                                                                                      |
| 3   | Framework               | Next.js 15 App Router + TypeScript                                                                         |
| 4   | Deploy                  | Local agora; alvo de deploy adiado (container é o caminho natural por causa do Chromium)                   |
| 5   | Auth                    | Email + senha **e** GitHub (Better Auth)                                                                   |
| 6   | Idioma                  | UI em pt-BR; código, commits, README e docs em inglês                                                      |
| 7   | Banco                   | Postgres 16 + Drizzle ORM, via Podman Compose                                                              |
| 8   | Renderização            | SSG + ISR on-demand para páginas públicas; SSR no dashboard                                                |
| 9   | PDF                     | Playwright renderizando `/[slug]/print` (fonte única)                                                      |
| 10  | Tema                    | 3 templates do Figma (**Minimal, Developer, Modern**) × light/dark + monograma (gradiente/sólido/contorno) |
| 11  | Avatar                  | Sem upload; monograma com iniciais                                                                         |
| 12  | Slug                    | Único, editável, escrow em `slug_history` com 301/308                                                      |
| 13  | Formulário              | Editor em abas com autosave; rascunho ≠ publicado; publicação explícita                                    |
| 14  | Currículos por conta    | Um (tabela `profiles` separada de `users`, pronta para crescer)                                            |
| 15  | Email                   | Mailpit em dev; Nodemailer/SMTP abstrato                                                                   |
| 16  | Escopo SEO              | Metadata, JSON-LD Person, OG image dinâmica, sitemap, robots, `/explore`                                   |
| 17  | Dashboard               | O editor **é** o dashboard; sem listagem                                                                   |
| 18  | Testes                  | Vitest (unidade/integração) + RTL/MSW + Playwright e2e + CI                                                |
| 19  | Ferramentas             | pnpm, Zod, Biome, Lefthook, react-hook-form                                                                |

---

## 2. Stack e restrições globais

- **pnpm** é o único package manager (`packageManager` pinado; sem npm/yarn).
- **Node 24 LTS** via `mise` (`.mise.toml`). Fallback local já instalado: `node@25.2.1`
  (é a versão que fornece o shim de `pnpm` nesta máquina).
- **Next.js 15** (App Router), React 19, TypeScript `strict`.
- **Tailwind CSS v4** via `@tailwindcss/postcss`, tokens em CSS vars.
- **Biome** é o único linter/formatter (sem ESLint/Prettier). CI roda `biome ci`.
- **Lefthook:** pre-commit = `biome check --write` nos staged + `tsc --noEmit`;
  pre-push = `vitest run`; commit-msg = commitlint (Conventional Commits).
- **Zod** é a fonte única de validação: schemas usados pelo `react-hook-form` no cliente e
  revalidados nas Server Actions. Nenhuma regra duplicada.
- **Zod** também valida variáveis de ambiente no boot.
- **Nenhum CSS, cor ou fonte arbitrária vinda do usuário.** Tema só por templates tipados.
- **Sem upload de imagem**, sem formulário de contato, sem comentários, sem analytics,
  sem notificações além de verificação/reset, sem domínio customizado, sem i18n de conteúdo.
- Rotas públicas usam `/[slug]` na raiz, como no enunciado (`/seunome`).

---

## 3. Rotas

| Rota                                  | Render                      | Comportamento                                                                                                                                        |
| ------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                   | SSG                         | Landing; CTA para signup e link para o perfil demo                                                                                                   |
| `/explore`                            | ISR 300s + `revalidatePath` | Perfis publicados, 12/página; página 1 em `/explore`, seguintes em `/explore/page/[n]`                                                               |
| `/[slug]`                             | **SSG + ISR**               | `generateStaticParams` (publicados, máx. 100), `revalidate = 300`, `dynamicParams`, `notFound()` para rascunho/inexistente, 301/308 para slug antigo |
| `/[slug]/print`                       | SSR                         | Fonte única do PDF; `noindex`; 404 para rascunho; resolve slug antigo                                                                                |
| `/api/pdf/[slug]`                     | Node runtime                | Playwright → PDF A4; 404 para rascunho; 503 se Chromium falhar                                                                                       |
| `/[slug]/opengraph-image`             | Node runtime                | `ImageResponse` 1200×630 com o tema do perfil; 404 para rascunho                                                                                     |
| `/opengraph-image`                    | Node runtime                | OG da landing                                                                                                                                        |
| `/sitemap.xml`, `/robots.txt`         | `sitemap.ts` / `robots.ts`  | Só publicados; bloqueiam dashboard/auth/api                                                                                                          |
| `/login`, `/signup`                   | SSR                         | Better Auth                                                                                                                                          |
| `/forgot-password`, `/reset-password` | SSR                         | Fluxo por email (Mailpit em dev)                                                                                                                     |
| `/dashboard`                          | SSR dinâmico                | **Editor**, protegido por sessão                                                                                                                     |
| `/dashboard/settings`                 | SSR dinâmico                | Senha, GitHub conectado, excluir conta                                                                                                               |
| `/api/auth/[...all]`                  | —                           | Handler do Better Auth                                                                                                                               |
| 404                                   | —                           | Página própria reutilizada                                                                                                                           |

Regras de slug: 3–30 caracteres, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, reservados bloqueados
(`api, auth, dashboard, explore, login, signup, forgot-password, reset-password, settings,
print, robots.txt, sitemap.xml, favicon.ico, _next, opengraph-image`), comparação
case-insensitive. Troca de slug grava o antigo em `slug_history` (único) e responde
301/308; reclaim do próprio slug antigo remove a linha de histórico.

---

## 4. Modelo de dados (Postgres + Drizzle)

Enums:

```ts
template = "minimal" | "developer" | "modern";
color_mode = "light" | "dark";
monogram_style = "gradient" | "solid" | "outline";
experience_kind = "formal" | "freelance" | "open-source" | "academic" | "volunteer";
```

| Tabela                                       | Campos                                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`, `session`, `account`, `verification` | Geradas pelo CLI do Better Auth (não editar à mão)                                                                                                                                                                                                                                            |
| `profiles`                                   | `id uuid pk`, `user_id text unique fk→user cascade`, `slug text unique`, `full_name`, `headline`, `bio`, `location`, `contact_email`, `github_url`, `linkedin_url`, `monogram_style`, `template`, `color_mode`, `is_published bool default false`, `published_at`, `created_at`, `updated_at` |
| `experiences`                                | `id`, `profile_id fk cascade`, `kind` (default `formal`), `role`, `company`, `period`, `description`, `sort_order int`                                                                                                                                                                        |
| `projects`                                   | `id`, `profile_id fk cascade`, `name`, `description`, `repo_url`, `demo_url`, `tags text[]`, `sort_order int`                                                                                                                                                                                 |
| `skills`                                     | `id`, `profile_id fk cascade`, `name`, `sort_order int`                                                                                                                                                                                                                                       |
| `slug_history`                               | `id`, `profile_id fk cascade`, `slug text unique`, `created_at`                                                                                                                                                                                                                               |

Índices: `experiences(profile_id, sort_order)`, `projects(profile_id, sort_order)`,
`skills(profile_id, sort_order)`, `slug_history(profile_id)`.

Publicar exige `full_name` e `slug`; seções vazias são omitidas na renderização.

### Contratos de código

```ts
// src/lib/db/queries.ts
getProfileForUser(userId: string): Promise<ProfileWithRelations | null>
getPublicProfileBySlug(slug: string): Promise<ProfileWithRelations | null> // só is_published
listPublishedProfiles(opts: { page: number; pageSize?: number }): Promise<{ items: ProfileCard[]; total: number }>
resolveSlugRedirect(slug: string): Promise<string | null>   // alvo só se publicado
isSlugAvailable(slug: string, opts?: { forProfileId?: string }): Promise<boolean>

// src/lib/validation/profile.ts
ProfileDraftSchema  // perfil + experiences[] + projects[] + skills[]

// src/lib/slug.ts
normalizeSlug(raw: string): string
validateSlug(slug: string): { ok: true } | { ok: false; reason: 'length' | 'charset' | 'reserved' }

// src/lib/template.ts
TEMPLATES: Record<Template, { label: string; description: string; light: TemplateColors; dark: TemplateColors }>
templateStyle(template: Template, mode: ColorMode): React.CSSProperties
EXPERIENCE_KINDS: Record<ExperienceKind, { label: string }>

// src/lib/initials.ts
initials(fullName: string): string   // primeira + última palavra, 1 char se uma só, '?' se vazio

// src/lib/seo.ts
buildProfileMetadata(profile): Metadata
buildPersonJsonLd(profile): Record<string, unknown>
buildProfileOgAlt(profile): string

// src/lib/pdf.ts
interface PdfRenderer { render(url: string): Promise<Uint8Array> }
createPlaywrightRenderer(): PdfRenderer
renderProfilePdf(renderer: PdfRenderer, url: string): Promise<Uint8Array>

// src/app/dashboard/actions.ts
saveProfileDraft(input: ProfileDraft): Promise<{ ok: true; savedAt: string } | { ok: false; fieldErrors: Record<string, string[]> }>
publishProfile(): Promise<{ ok: true; slug: string }>
unpublishProfile(): Promise<{ ok: true }>
```

---

## 5. Editor (dashboard)

- Split-screen: editor 1056px / preview 864px em desktop; abaixo de `lg`, abas
  "Editar / Preview" (uma coluna). As telas de aba do Figma (791px) são **conteúdo isolado**,
  não um split alternativo.
- Header: marca, pill "SSR + SEO", switch de tema da UI, pill do slug público.
- Abas: **Perfil · Experiência · Projetos · Skills · Aparência**.
- Perfil: nome completo, slug, headline, bio, localização, email de contato, GitHub,
  LinkedIn, estilo do monograma (Gradiente/Sólido/Contorno).
- Experiência: dropdown "Adicionar" com tipo (`Emprego Formal`, `Freelance`, `Open Source`,
  `Projeto Acadêmico`, `Voluntariado`), badge numerado (#01…), cargo, empresa, período (texto),
  resultados. Remover/reordenar. Banner "Procurando o primeiro emprego?" com
  **"Carregar Perfil Primeiro Emprego"**, que insere 3 exemplos no formulário (freela, open
  source, acadêmico) sem gravar no banco até o autosave.
- Projetos: nome, tecnologias (texto separado por vírgula → tags), descrição curta, repo, demo.
  "Novo Projeto", cartões #01/#02, remover/reordenar.
- Skills: input com Enter + botão "Adicionar"; chips ativos com × para remover.
- Aparência: **3 templates** (Minimal, Developer, Modern) + light/dark. Monograma fica em Perfil.
- Autosave com debounce de 800ms; indicador "Rascunho sincronizado" com horário.
- Footer fixo: indicador de sync, "Exportar PDF", "Publicar"/"Despublicar".
- Publicar: valida, marca `is_published`, `published_at`, revalida `/[slug]`, `/explore` e
  `/sitemap.xml`; rascunho continua editável.
- Preview ao vivo usa o mesmo componente da página pública (`PortfolioPage`), em todas as abas.

---

## 6. Sistema de templates

Três templates × light/dark. Template define **tipografia, layout e acento padrão**; monograma
e cor de modo são independentes. Tokens expostos por CSS vars no elemento raiz da página
pública (`--fg`, `--bg`, `--surface`, `--border`, `--accent`, `--accent-2`, `--muted`) e por
`data-template` para regras de tipografia/layout — nunca por classes dinâmicas arbitrárias.

| Template            | Caráter                                                     | Display               | Corpo         | Acento                               |
| ------------------- | ----------------------------------------------------------- | --------------------- | ------------- | ------------------------------------ |
| **Minimal**         | Editorial: serifada, divisórias limpas, muito espaço branco | Fraunces 600          | Inter 400/500 | neutro (tinta)                       |
| **Developer**       | Terminal: mono, denso, `//` e labels de código              | JetBrains Mono 600    | Inter 400/500 | Emerald `#10B981`                    |
| **Modern** (padrão) | SaaS: cards elevados, sans geométrica                       | Plus Jakarta Sans 700 | Inter 400/500 | Indigo `#6366F1`, accent-2 `#22D3EE` |

Paleta base do template Modern (também usada na UI do app): fundo `#0B0F19`, superfície
`#111827`, borda `#1E293B`, texto `#F1F5F9`, texto suave `#94A3B8`, acento `#6366F1`,
gradiente `#7C3AED` → `#22D3EE`. Minimal e Developer têm variantes light/dark próprias, com
contraste ≥ 4.5:1; valores finais lidos do Figma antes da implementação.

Monograma: `gradient` (acento→accent-2), `solid` (acento), `outline` (borda + tinta).

---

## 7. SEO

- `generateMetadata`: `title = "{Nome} — {Headline} | FolioCraft"`, `description` = bio
  truncada em 160 caracteres, `canonical`, OpenGraph e Twitter card.
- **JSON-LD `Person`**: `name`, `jobTitle`, `description`, `url`, `image` (OG), `sameAs`
  (GitHub/LinkedIn), `address` (localização). Serialização com `<` escapado (`\u003c`).
- **OG image** dinâmica por perfil, com nome, headline e as cores do template.
- `sitemap.ts`: landing, explore e todos os perfis publicados; nunca rascunhos.
- `robots.ts`: libera público, bloqueia `/dashboard`, `/api/`, `/login`, `/signup`,
  `/forgot-password`, `/reset-password`.
- Rascunho ou despublicado: 404 (não vaza conteúdo) + `noindex` na rota de impressão.
- `/[slug]/print` e `/api/pdf/[slug]`: `noindex`/não indexável.

---

## 8. PDF

- `/[slug]/print` renderiza `PortfolioPage` sem chrome, com CSS `@media print`
  (`@page { size: A4; margin: 12mm }`, `break-inside: avoid` nas seções).
- `renderProfilePdf` abre a rota com Playwright (`emulateMedia({ media: 'print' })`,
  `page.pdf({ format: 'A4', printBackground: true })`), timeout de 30s, browser reutilizado
  entre requisições e fechado no shutdown.
- Falha do Chromium → `503` com mensagem, nunca request pendurado.
- Mesmo endpoint para os botões "Exportar PDF" (editor) e "Baixar PDF" (página pública).
- `PdfRenderer` é interface: trocar para `@sparticuz/chromium` (Vercel) não muda o resto.

---

## 9. Testes, CI e commits

Convenções herdadas de `docs/skills/` e adaptadas:

- Unidade/integração co-localizadas: `<source>.spec.ts` / `.spec.tsx`; integração com banco:
  `<source>.integration.spec.ts`. E2E centralizado em `tests/e2e/`.
- RTL para componentes (queries por role/label), MSW para rede, `userEvent` para interação.
- Unitário nunca toca banco, rede, filesystem ou relógio real.
- Playwright e2e contra o stack real (web, Postgres, Mailpit API em `:8025`), dados únicos
  por teste, helpers em `tests/e2e/helpers/`.
- CI: `biome ci` → `tsc --noEmit` → `vitest run` → `next build`; job e2e com Postgres e
  Mailpit como services, migrate + seed antes do Playwright.
- Commits: Conventional Commits em inglês, minúsculo, imperativo, sem ponto final.

---

## 10. Seed e não-objetivos

- `pnpm seed` idempotente: conta demo `bruce@wayne.dev` / senha documentada no README,
  perfil publicado `/bruce-wayne` (**Bruce Wayne**), com experiências, projetos e skills.
- Um segundo perfil **rascunho** (`/clark-kent`) para provar 404/sitemap/noindex.
- Não-objetivos (também no README): upload de imagem, contato, comentários, analytics/views,
  notificações, domínio customizado, múltiplos currículos, i18n de conteúdo.

---

## 11. Figma

Arquivo **"Folio craft"**, página `Page 1` (fonte: import de HTML, layout em ajuste pelo autor).

| Nó                     | Conteúdo                                                |
| ---------------------- | ------------------------------------------------------- |
| `1:177`                | Tela **home** (split 1056 + 864) — referência de layout |
| `1:180`                | Header do editor                                        |
| `1:205`                | Barra de abas                                           |
| `1:227`                | Conteúdo da aba Perfil                                  |
| `1:305`                | Footer fixo                                             |
| `1:319`                | Painel de preview                                       |
| `1:337`                | Browser mockup + página pública                         |
| `8:824`                | Conteúdo isolado da aba Experiência (791px)             |
| `8:506`                | Conteúdo isolado da aba Projetos                        |
| `7:209`                | Conteúdo isolado da aba Skills                          |
| `8:1116`               | Conteúdo isolado da aba Aparência                       |
| `8:1180/8:1202/8:1228` | Cards dos templates Minimal / Developer / Modern        |
| `1:109`                | Componentes (botões, tabs, pills)                       |

Protocolo: antes de implementar tela que dependa do Figma, chamar `get_design_context` no nó
correspondente e `design_diff` contra o baseline em `.figwright/snapshots/`; **nunca medir por
screenshot**. O design é v0 e pode mudar — valores lidos na hora da task prevalecem sobre este
documento.

---

## 12. Em aberto

- **Alvo de deploy final** (container vs. Vercel + `@sparticuz/chromium`): decidir quando
  houver deploy. O código fica agnóstico via `PdfRenderer`.
- **Layout final do Figma**: o autor ainda ajusta; re-ler antes das tasks 2, 6–9 e 12.
- **Rótulos de `experience_kind`**: o Figma mostra "Emprego Formal" e o banner cita freela,
  open source, acadêmico e voluntariado; confirmar os nomes exatos na implementação.
