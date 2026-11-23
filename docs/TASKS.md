# FolioCraft — Execution Board

Board de acompanhamento. **Plano detalhado:** [`plans/2026-11-17-foliocraft-implementation.md`](./plans/2026-11-17-foliocraft-implementation.md) · **Spec:** [`SPEC.md`](./SPEC.md)

Regra de execução: uma task por vez, todos os passos do plano na ordem (teste falhando → implementar → verde), gate completo, commit Conventional, marcar aqui. Na fase de **UI do editor**, cada task termina com `pnpm dev` + screenshot e **para** até autorização explícita do usuário — a próxima não inicia sozinha.

- **Implementada:** o código da task já está commitado na branch (`Sim`/`Não`).
- **Status:** a task está encerrada — gate verde, review aprovado e, na fase de UI, autorização do usuário (`[x]`).

## Progresso

| #   | Task                  | Implementada | Entrega                                                                              | Gate                                                                          | Status |
| --- | --------------------- | ------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------ |
| 1   | Bootstrap & tooling   | Sim          | Next 15 + pnpm + Biome + Lefthook + Podman + Vitest + CI base                        | `pnpm lint && pnpm typecheck && pnpm test && pnpm build`                      | [x]    |
| 2   | Tokens, UI e landing  | Sim          | Tokens do Figma, primitivas, landing; **checkpoint visual**                          | `pnpm lint && pnpm typecheck && pnpm test`                                    | [ ]    |
| 3   | Schema & migrations   | Sim          | Tabelas de perfil + Drizzle + migration 0000                                         | `pnpm db:generate && pnpm db:migrate` + `\d profiles`                         | [x]    |
| 4   | Auth                  | Sim          | Better Auth, Mailpit, verificação, reset, GitHub opcional, e2e auth                  | `pnpm test && pnpm test:e2e tests/e2e/auth.spec.ts`                           | [x]    |
| 5   | Domínio               | Não          | Slug, contratos Zod, queries, helpers de banco de teste                              | `pnpm test`                                                                   | [ ]    |
| 6   | Templates & portfólio | Não          | 3 templates × light/dark, monograma, `PortfolioPage`; grounding no Figma             | `pnpm test`                                                                   | [ ]    |
| 7   | Editor base           | Não          | Shell, aba Perfil, autosave, publish/unpublish, e2e autosave                         | `pnpm test && pnpm test:e2e tests/e2e/editor.spec.ts`                         | [ ]    |
| 8   | Seções                | Não          | Experiência (com kind + helper primeiro emprego), Projetos, Skills, e2e persistência | `pnpm test && pnpm test:e2e tests/e2e/editor.spec.ts`                         | [ ]    |
| 9   | Aparência & preview   | Não          | Aba Aparência, preview ao vivo, responsivo, e2e tema                                 | `pnpm test && pnpm test:e2e tests/e2e/editor.spec.ts`                         | [ ]    |
| 10  | Página pública        | Não          | `/[slug]` SSG/ISR, 301 de slug, 404, revalidação, e2e                                | `pnpm test:e2e tests/e2e/public-page.spec.ts tests/e2e/slug-redirect.spec.ts` | [ ]    |
| 11  | SEO & explore         | Não          | Metadata, JSON-LD, OG, sitemap, robots, `/explore`                                   | `pnpm test:e2e tests/e2e/seo.spec.ts tests/e2e/explore.spec.ts`               | [ ]    |
| 12  | PDF                   | Não          | Print route + Playwright + endpoint + botões; e2e download                           | `pnpm test:e2e tests/e2e/pdf.spec.ts`                                         | [ ]    |
| 13  | Configurações         | Não          | Senha, GitHub conectado, exclusão de conta; e2e                                      | `pnpm test:e2e tests/e2e/settings.spec.ts`                                    | [ ]    |
| 14  | Seed, README, CI e2e  | Não          | Bruce Wayne + rascunho Clark, README inglês, job e2e                                 | `pnpm test:e2e`                                                               | [ ]    |
| 15  | A11y & QA             | Não          | axe, teclado, varredura do Review Focus, gate final                                  | `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`     | [ ]    |

## Fase UI do editor (revisão incremental)

Fase atual, **antes da Task 3**. Cada linha é uma task de um componente: o código nasce com dados mockados (fixtures locais) e é ligado às queries reais na Task 7. Ao fim de cada task eu deixo `pnpm dev` de pé + screenshot e **paro**; `Status [x]` só entra com o seu "pode seguir".

| #     | Componente                                | Ref. Figma       | Implementada | Gate                                       | Status |
| ----- | ----------------------------------------- | ---------------- | ------------ | ------------------------------------------ | ------ |
| UI-1  | Header + scaffold `/dashboard`            | `1:180`          | Sim          | `pnpm lint && pnpm typecheck && pnpm test` | [x]    |
| UI-2  | Menu de abas                              | `1:205`          | Sim          | idem                                       | [x]    |
| UI-3  | Área de conteúdo + troca de aba           | `1:226`          | Sim          | idem                                       | [x]    |
| UI-4  | Barra de ações fixa                       | `1:305`          | Sim          | idem                                       | [x]    |
| UI-5  | Painel de preview (toolbar + browser)     | `1:320`, `1:337` | Sim          | idem                                       | [x]    |
| UI-6  | Aba Perfil                                | `1:227`          | Sim          | idem                                       | [x]    |
| UI-7  | Aba Experiência + helper primeiro emprego | `8:873`, `8:890` | Sim          | idem                                       | [x]    |
| UI-8  | Aba Projetos                              | `8:555`          | Sim          | idem                                       | [x]    |
| UI-9  | Aba Skills                                | `7:296`          | Sim          | idem                                       | [x]    |
| UI-10 | Aba Aparência                             | `8:1166`         | Sim          | idem                                       | [x]    |

**Task 3–15:** pausadas até a fase de UI ser concluída e autorizada.

## Gates

- **Pre-commit (Lefthook):** `biome check --write` nos staged + `tsc --noEmit`.
- **Pre-push:** `vitest run`.
- **Commit-msg:** commitlint (Conventional Commits, inglês, minúsculo, imperativo).
- **Task:** o gate da tabela + commit `type(scope): ...`.
- **Nunca** commitar com teste vermelho, `test.only` ou `console.log` de debug.

## Review Focus (checado na Task 15, testado na task dona)

- [ ] Slug hostil (reservado/tomado/acento/reclaim) → erro de campo, sem 500 nem duplicata.
- [ ] Rascunho não vaza por `/[slug]`, `/[slug]/print` nem `/api/pdf/[slug]`; slug antigo de rascunho não redireciona.
- [ ] Markup escapado em nome/bio/descrições; URLs só `http(s)`; JSON-LD com `<` escapado.
- [ ] PDF: Chromium ausente → 503; perfil vazio → PDF válido; browser reutilizado.
- [ ] Conteúdo extremo: zero seções, 100 skills, bio longa, nome de 1 palavra/vazio.
- [ ] Preview, página pública e PDF renderizam o mesmo template e as mesmas CSS vars.

## Definition of Done (por task)

- [ ] Passos do plano executados (falha → implementação → verde).
- [ ] Testes novos co-localizados, nomes `should ...`.
- [ ] Gate da task verde.
- [ ] Nenhuma regra de validação duplicada fora do Zod.
- [ ] Nenhum hex/fonte hardcoded fora dos tokens.
- [ ] Commit atômico com mensagem Conventional.
- [ ] Na fase de UI: screenshot entregue e autorização registrada antes da próxima task.
- [ ] Task marcada neste board.

## Bloqueios conhecidos

- **Node/pnpm:** o ambiente ativo (`node@26`) não fornece pnpm; a task 1 fixa Node 24 via `mise` (fallback `node@25.2.1`, que já tem o shim).
- **Figma v0:** layout em ajuste; as telas de aba (`8:824`, `8:506`, `7:209`, `8:1116`) são conteúdo isolado a 791px — o layout real é a `home` (`1:177`, 1056 + 864). Re-ler antes de cada task de UI e das tasks 2, 6–9 e 12, e usar `design_diff` contra `.figwright/snapshots/`; nunca medir por screenshot.
- **Deploy:** alvo adiado; PDF atrás de `PdfRenderer` para permitir container ou Vercel depois.
