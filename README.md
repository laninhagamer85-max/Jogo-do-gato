# Meu Pet Virtual — Web Agência AD

**Retomada e instruções:** [recovery/RETOMADA-MANUS.md](recovery/RETOMADA-MANUS.md).

## Estado da publicação

A versão pública mais recente observada no Site existente é a **v12**, publicada em 14/10/2026 a partir do commit `47a07c607879a443b2fe9b2686795e118a2495ba`. Ela reúne a revisão da Aventura e o protótipo inicial de Exploração. O repositório continua sendo a fonte de trabalho; esta documentação não publica nem altera o Site.

## Atualização em desenvolvimento

A atualização **Bosque dos Caminhos** está em branch própria, derivada do runtime publicado na v12. O plano é oferecer três capítulos originais com duas salas cada, exploração top-down, puzzles gentis, movimento visível do pet, áudio original e progresso versionado por perfil. A Aventura lateral continua disponível e não é substituída.

**Esta atualização ainda não foi publicada.** Os PRs #4–#6 permanecem preservados; o Bosque está no [PR #7](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/7), separado e baseado no PR #6. Não fazer merge, force-push ou deploy nesta rodada. Consulte o [plano](docs/evolution/plans/2026-10-14-bosque-dos-caminhos.md), o [TODO](TODO.md), o [estado da evolução](docs/evolution/state.json) e o [relatório QA](docs/evolution/reviews/2026-10-14-bosque-dos-caminhos/REPORT.md).

## Desenvolvimento e validação

- `pnpm dev`: inicia apenas a aplicação local de desenvolvimento.
- `/qa-review.html`: fixture de revisão em memória; não autentica nem lê/grava partidas reais e é excluída do build público.
- `pnpm check`: verificação TypeScript.
- `pnpm exec vitest run --exclude '**/*.integration.test.ts'`: testes offline pertinentes, sem integrar contas reais.
- `pnpm build`: produz os arquivos estáticos locais da fonte; **não publica**.
- `pnpm build:recovery`: recuperação histórica da v7 com ajustes móveis; não é a versão atual.
- `pnpm dev:server` e `pnpm build:server`: fluxo anterior com Express.

A QA desta atualização cobre o modo novo e regressões selecionadas da Aventura. Um playthrough UI-driven das seis salas foi concluído na fixture isolada com teclado/toque sintetizados; isso não é uma partida humana nem um save real. **Não declarar as 100 fases laterais testadas**. Testes em aparelho físico e persistência autenticada em staging permanecem pendentes; consulte o [relatório QA](docs/evolution/reviews/2026-10-14-bosque-dos-caminhos/REPORT.md).
