# Meu Pet Virtual — Web Agência AD

Ramo de colaboração `recovery/mobile-review-20261009`, com o Manus, no PR #4.

**Comece por [Retomada e instruções para o Manus](recovery/RETOMADA-MANUS.md).**

O projeto reúne React/TypeScript, mídias da publicação e a distribuição v7 preservada. Painel de conta e atlas de ícones foram restaurados na fonte em 12/10/2026. A versão pública confirmada em 13/10/2026 é a **v10**, incluindo entrada compacta da Aventura e sombras/enquadramento da casa. A equivalência visual e autenticação em perfil isolado ainda precisam de validação real.

- `pnpm dev`: cliente de desenvolvimento; para Sites seguir as regras de preview com navegador suportado.
- `/qa-review.html`: fixture local da Aventura, sem contas nem partidas reais; excluída da produção.
- `pnpm check`: verificação TypeScript.
- `pnpm build`: release estático da fonte editável com assets antigos preservados, via `scripts/build-sites-release.mjs`.
- `pnpm build:recovery`: recuperação histórica da v7 com ajustes móveis; não inclui as melhorias recentes.
- `pnpm dev:server` e `pnpm build:server`: fluxo anterior com Express.

A revisão de 13/10/2026 melhora proporções da terra e sombras das bordas apenas na fase 1. **Está somente na fonte, pendente de inspeção visual e playtest antes de publicar.**

- `node --import tsx scripts/verify-adventure-entry.ts`: seleção da próxima fase, replay e imutabilidade do progresso; não joga as fases.
- `node --import tsx scripts/verify-pilot-terrain.ts`: proporções, ancoragem na câmera, limites de desenho e isolamento do piloto; não substitui teste visual.
- [Estado](docs/evolution/state.json) e [relatório atual](docs/evolution/runs/2026-10-13.md): testes, limites e próxima ação.

As 100 fases ainda precisam de auditoria gradual com playtests reais em perfil isolado.
