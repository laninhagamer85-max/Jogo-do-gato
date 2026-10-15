# Follow-up de UX e validação — Meu Pet Virtual

**Data:** 15/10/2026 (BRT)
**Estado:** correções aplicadas no código do PR #8; **ainda não publicado**. O PR permanece draft e aguarda decisão.
**Código das correções:** `c452fa9` — `fix: preserve forest pause and improve landscape layout`.

## Contexto e isolamento

- Repositório: `laninhagamer85-max/Jogo-do-gato`.
- PR: [#8 — melhorias de UX/controles](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/8), branch `fix/game-ux-controls-20261014`, base `feat/forest-path-chapter1-20261014`.
- Validação feita na worktree local e na fixture de desenvolvimento `qa-adventure.html`, servida em localhost; dados de demonstração em memória, sem login, conta, save ou partida real.
- Nenhum merge, force-push, deploy ou alteração do Site foi feito nesta revisão.
- A consulta pública de 15/10 ainda mostrava o selo **1.9.18**; o código do PR declara `GAME_RELEASE = 14`. Existem textos coincidentes entre o bundle público e o PR, mas não foi estabelecido o commit exato servido. **Não se presume que o PR #8 esteja publicado.**

## Correções efetuadas

1. **Cancelar saída durante pausa:** anteriormente, cancelar “Sair desta partida?” limpava tanto a confirmação quanto o overlay de pausa, retomando o jogo sem uma escolha explícita. Agora o cancelamento fecha apenas a confirmação, mantendo o jogador na pausa e limpando entradas mantidas. A regressão foi reproduzida pela interface e verificada após o patch: o menu de pausa continuou aberto.
2. **Paisagem curta (até 520 px de altura):** o mapa e os controles estavam empilhados; em 844×390 o canvas tinha cerca de 152 px de altura. O novo arranjo coloca o canvas à esquerda e o painel de comandos à direita. No mesmo viewport o canvas mediu **614×270 px** (cerca de 69% da altura da tela), sem overflow nem sobreposição. Direcionais: **48×48 px**; ações: **52 px de altura**. Em retrato, o D-pad mede **56×56 px** e as ações têm **56 px de altura**.
3. **Animação da Aventura lateral:** a captura parada e a captura durante movimento mostram o mesmo desenho articulado, com alteração de passada/cauda ligada ao deslocamento, sem troca para um retrato diferente. Input de teclado `ArrowRight` por 160 ms em 390×844; o HUD passou de 1% para 2% na captura em movimento e chegou a 3% após a libertação. É uma verificação visual curta, **não** uma partida completa.

## Medição responsiva automatizada

Playwright/Chromium mediu a geometria do DOM em uma fixture local. Os alvos touch foram medidos; `controlsInside` verdadeiro, `controlsOverlap` falso e sem overflow horizontal em todos os tamanhos abaixo.

| Viewport | Canvas | Altura do canvas / viewport | Menor lado de alvo touch |
|---|---:|---:|---:|
| 390×844 | 364×515 px | 61% | 56 px |
| 375×667 | 349×329 px | 49% | 56 px |
| 375×812 | 349×474 px | 58% | 56 px |
| 844×390 | 614×270 px | 69% | 48 px |
| 768×1024 | 742×725 px | 71% | 60 px |
| 1024×768 | 998×467 px | 61% | 60 px |
| 1366×768 | 1340×462 px | 60% | 60 px |

Estas são **medições automatizadas em browser**, não medições em telemóveis/tablets físicos. A captura em 1366×768 foi medida no DOM; a fixture de captura direta usada para as imagens foi executada em 375×667, 844×390 e 390×844.

## Testes e execução

- `pnpm check` — passou (TypeScript).
- `pnpm exec vitest run --exclude '**/*.integration.test.ts'` — **81/81 testes**, 14 ficheiros passaram.
- `pnpm build` — passou.
- `git diff --check` — passou.
- Console: sem erros JavaScript. A fixture local não fornece `/favicon.ico` (404); a auditoria de respostas HTTP não encontrou falha de asset do jogo.
- O build continua a avisar sobre chunks acima de 500 kB (**843,70 kB** e **1.322,04 kB** minificados) e a configuração `pnpm` em `package.json` contém chaves depreciadas. Não foram alterados nesta correção.

### Limites do playtest

- O teste de caminhada foi uma entrada de teclado sintética curta em browser automatizado; não foi uma partida humana nem uma partida em dispositivo físico.
- Numa tentativa exploratória anterior com `ArrowRight` mantido por 400 ms via `dispatchEvent`, a Aventura chegou ao overlay de nova tentativa antes de concluir a fase. A causa não foi isolada (pode envolver encontro/perigo e o intervalo da observação); não se altera física nem se contabilizam mortes a partir desse evento. A fase 1 não foi concluída nesta revisão.
- O modo Exploração foi verificado visualmente/layout e o cancelamento da saída foi testado na UI; não foi repetida a campanha de seis salas do relatório anterior.

## Evidências

- [Exploração — retrato 375×667](./evidence/forest-portrait-375x667.png)
- [Exploração — paisagem 844×390](./evidence/forest-landscape-844x390.png)
- [Aventura lateral — pet parado 390×844](./evidence/platformer-idle-390x844.png)
- [Aventura lateral — pet em movimento 390×844](./evidence/platformer-walk-390x844.png)
- [Métricas de viewport e input (JSON)](./evidence/metrics.json)

## Decisão sugerida

**Aprovar para revisão do PR/protótipo, não como autorização de deploy.** Antes de qualquer publicação: testar toque, orientação, safe areas, áudio e saída em aparelho físico; concluir um playthrough humano controlado da fase lateral 1 e investigar a tentativa que chegou à tela de falha; rever a divergência de identificador entre o Site público (`1.9.18`) e o código do PR (`14`). Manter o PR #8 em draft até essa decisão.
