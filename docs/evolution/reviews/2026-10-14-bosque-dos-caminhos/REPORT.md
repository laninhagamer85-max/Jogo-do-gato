# Relatório de QA — Bosque dos Caminhos

- **Data:** 14/10/2026 (America/Sao_Paulo)
- **Conclusão:** QA funcional do protótipo concluída; **recomendado para revisão de integração**, não para aprovação de release/produção.
- **Projeto:** `laninhagamer85-max/Jogo-do-gato`
- **Branch:** `feat/forest-path-chapter1-20261014`
- **Base:** `feat/pet-motion-20261014`, commit `d0a5d08c7f7564a9d3c0adeaa6a9758d2c460103`
- **Commit de código testado:** `1a9f31e325cebe5fbb707783810922ec2c5def72` (a execução de teste/build usou a mesma árvore de código imediatamente antes do commit; não houve alteração de código depois).
- **PR de revisão:** [#7 — Bosque dos Caminhos](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/7), aberto contra `feat/pet-motion-20261014` (head do PR #6).
- **Site:** v12 continua sendo a versão pública observada; esta atualização não foi publicada nem mesclada. PRs #4–#6 permanecem abertos e preservados; o PR #7 é separado, sem merge/deploy automático.

## Resumo executivo

O modo **Bosque dos Caminhos** integra ao jogo existente uma campanha de exploração vista de cima com **3 capítulos × 2 salas**. As seis salas foram concluídas pela interface normal na fixture isolada, com desbloqueio orgânico dos capítulos 2 e 3; a tela final exibiu “Capítulo concluído” e a seleção mostrou os três capítulos como “Concluído”. A Aventura lateral permanece disponível. O progresso do Bosque usa `forestPathProgress`, versionado e aditivo dentro do `GameState` existente, e não concede nem altera moedas, XP ou itens.

**Tipo de partida:** playthrough guiado por automação de navegador, com eventos sintéticos de teclado/toque na UI. Não foi uma partida humana. Não houve chamada direta de vitória, teleporte ou invulnerabilidade. A fixture usou perfil fictício em memória; não houve autenticação, leitura/gravação de saves reais ou alteração de produção.

## Métricas do playthrough

Os contadores abaixo são os valores exibidos pela própria interface na conclusão de cada sala. “Passos” e “ações” não são duração nem número de tentativas.

| Sala | Resultado | Passos | Ações | Captura |
|---|---:|---:|---:|---|
| Capítulo 1 · Sala 1 — A placa silenciosa | Concluída | 24 | 5 | [captura](evidence/chapter1-room1-cleared.webp) |
| Capítulo 1 · Sala 2 — O atalho da raposa | Capítulo concluído | 48 | 9 | [captura](evidence/chapter1-room2-cleared.webp) |
| Capítulo 2 · Sala 1 — A ponte de folhas | Concluída | 17 | 2 | [captura](evidence/chapter2-room1-cleared.webp) |
| Capítulo 2 · Sala 2 — Duas margens | Capítulo concluído | 67 | 10 | [captura](evidence/chapter2-room2-cleared.webp) |
| Capítulo 3 · Sala 1 — A porta de cobre | Concluída | 21 | 4 | [captura](evidence/chapter3-room1-cleared.webp) |
| Capítulo 3 · Sala 2 — O guardião sonolento | Capítulo concluído | 71 | 8 | [captura](evidence/chapter3-room2-cleared.webp) |

**Tentativas/retries:** uma sequência de progressão pelos seis espaços foi registrada; nenhum reinício de sala foi observado nas capturas. O modo não tem vidas ou estado de morte; contatos com guardiões geram recuperação segura. A contagem de contatos não foi preservada por sala, portanto não se afirma “zero colisões”.
**Tempo:** não há relógio no jogo. Tempo ativo não foi instrumentado. As capturas da sequência final cobrem aproximadamente 18:00–18:37 UTC, incluindo inspeção de telas, espera e capturas; esse intervalo não deve ser interpretado como duração de gameplay.

A evidência de desbloqueio mostra os capítulos 1 e 2 concluídos e o 3 liberado; a captura final confirma os três concluídos:

- [Capítulos 1–2 concluídos; capítulo 3 disponível](evidence/chapters1-2-complete-chapter3-unlocked.webp)
- [Seleção final com os três capítulos concluídos](evidence/all-three-chapters-complete.webp)

## Viewports e controles

A seleção e o layout jogável foram medidos em **375×667, 375×812, 390×844, 844×390 e 1366×768**. Não foi feito o playthrough completo em cada tamanho: a sequência de seis salas ocorreu em **390×844**. Os outros tamanhos foram usados para verificar disposição, visibilidade dos controles, cortes e overflow. A captura compacta do jogo está em [375×667](evidence/gameplay-375x667.webp).

Teclado e toque emulado iniciaram e controlaram a aventura; pausa e retomada preservaram a sala; `pointercancel` liberou o D-pad; redimensionamento/rotação emulada não reiniciou a sala. A medição para 1366×768 foi feita no DOM do iframe, pois a janela externa do navegador de QA tinha 893 px de largura e não podia mostrar toda a captura desktop de uma vez. Isso é uma limitação do harness de evidência, não um corte confirmado no layout do jogo.

## Vídeo

[Vídeo MP4 de gameplay do Capítulo 2, Sala 1](evidence/forest-chapter2-room1.mp4): **6,65 s**, H.264, 740×422, 20 fps, sem áudio. O clipe foi decodificado integralmente e mostra o pet deslocando-se no mapa; o WebM bruto está preservado ao lado. O vídeo é evidência visual, não demonstra som. A trilha e os efeitos são gerados por Web Audio e passam pelo mixer/mute existente; áudio em aparelho físico continua pendente de validação.

## Verificações técnicas

| Verificação | Resultado |
|---|---|
| `pnpm check` | Aprovado, TypeScript sem erros |
| `pnpm exec vitest run --exclude '**/*.integration.test.ts'` | **73 testes aprovados em 12 arquivos** |
| `pnpm build` | Aprovado; saída estática criada localmente, sem publicação |
| `git diff --check` / `git show --check` | Aprovado |
| Isolamento do QA no build | Fixture HTML ausente; nomes `qa-review.html`, `qa-adventure.html` e atributos `data-qa-*` ausentes do bundle após ajuste |
| Persistência autenticada/staging e aparelho físico | Não executadas nesta rodada |

O build emite um aviso Vite de chunks minificados acima de 500 kB (aprox. 839 kB e 1.322 kB); não bloqueou a compilação e permanece como item de otimização. O pnpm também avisou que certas chaves de configuração no campo `pnpm` do `package.json` são ignoradas; não houve instalação nem atualização de dependências nesta rodada.

## Ocorrências e correções

- **`pointercancel`/movimento residual:** a inspeção em corredor livre mostrou desaceleração e estabilização após soltar, não entrada presa; pausa também manteve a posição. Não foi necessária mudança de física por esse falso positivo.
- **Instrumentação QA:** a primeira inspeção do bundle encontrou nomes de atributos QA compilados com valor constante `undefined`. O código foi ajustado para propagar os atributos por spread condicional; build final não contém os nomes de QA, e a fixture DEV continua expondo a telemetria de posição/itens.
- **Animação do pet:** o deslocamento aciona balanço/escala procedural no modo de cima; a Aventura lateral conserva a animação articulada de corrida/salto já integrada na v12. O modo top-down não tem salto por decisão de mecânica. A cadência foi observada em gameplay, mas spritesheets direcionais completas e validação em hardware ficam para decisão da etapa de produção.
- **Escopo não testado:** esta rodada não testou as 100 fases laterais, não validou contas/painel nem persistência real, não foi executada em telefone físico e não é auditoria de lançamento do Site.

## Pendências antes de release

1. Testar controles, rotação, safe areas e áudio em aparelho móvel físico.
2. Verificar migração/persistência em perfil de staging isolado, sem dados reais de crianças.
3. Decidir se a animação procedural basta para o protótipo ou se a produção exigirá spritesheets de quatro direções.
4. Fazer revisão de lançamento web independente (contas/isolamento, painel, segurança, backup/restauração e privacidade).
5. Integrar/publicar somente após decisão explícita. Manter v12 no Site até lá; não fazer merge automático, force-push ou deploy nesta branch.

## Recomendação

**Apto para revisão de integração como protótipo, com as limitações acima aceitas em aberto; não declarar pronto para produção.** O código e as evidências estão em branch própria, sem tocar nos PRs #4–#6 e sem alterar a v12 pública.
