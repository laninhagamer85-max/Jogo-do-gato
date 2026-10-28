# Meu Pet Virtual — Web Agência AD

## Estado atual da fonte

Versão pública confirmada em 28/10/2026: **1.52.0** (Sites156). Ponte com passagem inferior no chão e colisão nas colunas; travessia superior apenas pelos acessos elevados. Castelo com recorte suavizado e primeiro degrau lateral baixo. Publicação succeeded, fonte Sites 581206b5866e6e6f7952810955b39306cba1433c. Consulte docs/evolution/runs/2026-10-28-bridge-layers.md. Revisões anteriores preservadas.

Use `node scripts/build-sites-release.mjs` (ou `pnpm build`): restaura e confere os atlas dos amigos pelo manifesto SHA256, executa Vite e prepara `out/`, preservando os recursos públicos recuperados. As credenciais de servidor não pertencem à configuração pública do cliente. Não trocar o projeto/domínio nem substituir a configuração de autenticação para ajustar animação.

A cobertura de fonte/recuperação evoluiu desde o snapshot v8 abaixo; painel de conta e atlas de ícones foram reconciliados. Testes offline e inspeção estática de sprites não substituem teste de gameplay. A expansão dos amigos está autorizada para David testar no celular depois da publicação.

## Histórico da recuperação

Ramo de retomada e revisão móvel de 09/10/2026, preparado para colaboração com o Manus.

**Comece por [Retomada e instruções para o Manus](recovery/RETOMADA-MANUS.md).**

O projeto preserva o código React/TypeScript recuperado, as mídias da publicação e uma cópia íntegra da distribuição v7. A fonte original antecedia a v7; painel de conta e atlas foram posteriormente reconciliados. As restrições antigas a seguir documentam aquela recuperação, não o processo atual de entrega.

- `pnpm dev`: cliente de desenvolvimento.
- `/qa-review.html`: demonstração local da aventura, sem contas nem partidas reais.
- `pnpm check`: verificação TypeScript.
- `pnpm build`: build atual de entrega pelo script `build-sites-release.mjs`.
- `pnpm build:recovery`: gera `out/` preservando a v7 e aplicando somente as correções móveis desta revisão.
- `pnpm dev:server`: fluxo anterior com Express.

A revisão móvel foi publicada como versão 8 em 09/10/2026. Naquele checkpoint, as alterações de entrada da Aventura de 12/10 aguardavam validação e conciliação. A distribuição histórica permanece disponível para recuperação; não deve substituir automaticamente a fonte atual nem uma publicação mais recente.

- `node --import tsx scripts/verify-adventure-entry.ts`: verifica seleção da próxima fase, replay e imutabilidade do progresso, sem navegador ou conta. Não executa as fases.
- `docs/evolution/state.json` e `docs/evolution/runs/2026-10-12.md`: estado e limites da revisão.

Os 100 estágios ainda precisam de testes reais na conta de teste.

![Revisão móvel da aventura em uma partida de demonstração](recovery/review-mobile-20261009.jpg)
