# Meu Pet Virtual — revisão isolada de 14/10/2026

## Decisão

**Atualização após continuação no PR #5: APROVADO o aceite funcional da fase 1.** Uma partida guiada pelo agente chegou normalmente ao portal com 3 vidas, sem teleporte, invulnerabilidade ou chamada de vitória; foram verificados diálogo, 195 moedas, Torre de escalada, duas sardinhas, mapa e início orgânico da fase 2 por toque emulado. A física não foi alterada. **Sem publicação ou merge; não é aprovação das 100 fases.**

Leia o [relatório completo de aceite da fase 1](ACCEPTANCE-STAGE1.md), com commits, métricas, investigação das mortes, 50 testes offline e pendências restantes. **QA-04 está resolvida neste recorte.** Integração escolhida, aparelho real, conclusão integral por toque e auditorias históricas fora da Aventura continuam pendentes.

### Registro histórico da primeira rodada, preservado abaixo

**REPROVADA para publicação nesta etapa.** A revisão original do PR #4 apresenta uma falha de rotação que reposiciona o gato de uma plataforma elevada no chão inferior e pode causar dano injusto. A correção foi implementada e revalidada em ramo próprio, mas a conclusão da fase 1 e o fluxo de vitória/recompensa ainda não foram comprovados por uma partida concluída.

**Candidato corrigido: aprovação técnica parcial, não autorização de publicação.** Layout, terreno amostrado, apoio na rotação, controles, pausa e HUD foram verificados. Não houve deploy, merge, force-push, login, acesso a contas ou alteração de saves reais. A referência pública permanece a **v10**, conforme a solicitação e o estado do repositório; o site de produção não foi aberto para jogar nem modificado.

## 1. Identificação e preservação

- Repositório: `laninhagamer85-max/Jogo-do-gato`.
- Revisão original: `recovery/mobile-review-20261009`, PR [#4](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/4).
- HEAD remoto atualizado e testado: **`b60d71857036e750476eb491b782e14f74d50e55`**. Inclui o registro de bloqueio de 14/10, posterior ao HEAD citado dentro daquele relatório.
- Piloto de terreno preservado: **`b044f19da926f0b34247be34ab64a658921b064c`**; não expandido a outras fases.
- Ramo de correção: **`fix/qa-adventure-rotation-20261014`**, criado diretamente da revisão acima.
- Commit de fonte corrigida testado: **`b9353d4eb4186f169298d3e997a51d94ef186765`**, após `ad901f2`.
- Consultados: `README.md`, `recovery/RETOMADA-MANUS.md`, `docs/evolution/state.json`, relatório mais recente `docs/evolution/runs/2026-10-14.md`, fixture, componente, motor, terreno piloto, estilos e testes pertinentes.
- A revisão foi clonada em diretório novo. Nova consulta remota em 14/10 confirmou o mesmo HEAD. Nenhum arquivo ou histórico do ramo original foi substituído. O estado de evolução e o relatório existente não foram sobrescritos.

O bloqueio de navegador descrito no relatório anterior não foi tomado como uma impossibilidade deste ambiente: a fonte foi efetivamente executada no navegador Sandbox atual.

## 2. Ambiente e isolamento

- Ubuntu Sandbox; Chromium **154.0.8037.57**, contexto desktop Linux, DPR 1. Não são aparelhos físicos nem Safari/iOS/Chrome Android nativos.
- Cliente Vite iniciado em porta de teste 5173. **Backend, Firebase e banco não foram iniciados.** Não foram fornecidas credenciais de staging/produção ao jogo.
- Entrada obrigatória: `/qa-review.html`; seu iframe `/qa-adventure.html` contém o componente real com o pet sintético **Pudim**, estado React apenas em memória.
- Viewport medido é o do iframe, e não o tamanho da página externa de revisão. Alterar o seletor muda a área real disponível ao componente e aciona o redimensionamento do Canvas.
- Os contextos automatizados bloquearam requisições externas. A captura de rede da matriz registrou somente GETs locais de fonte/arte, sem endpoints de conta ou saves. Nos três percursos guiados medidos, as chaves de `localStorage` e `sessionStorage` estavam vazias.
- Nenhuma telemetria foi enviada a terceiros. A instrumentação de QA leu a instância em memória e registrou posição, tempo, apoio, vidas, moedas e câmera; **não escreveu posição, velocidade, colisões, invulnerabilidade nem resultados de vitória**.
- As páginas de QA estão fora dos inputs de produção; a busca no build final não encontrou páginas/arquivos QA.

## 3. Matriz visual e responsiva

Medições automatizadas foram acompanhadas de inspeção de capturas da entrada, fase 1 e pausa. A matriz completa e os arquivos originais/finais estão no pacote de evidências.

| Viewport | Jogar: limite inferior | Canvas da fase 1 | Controles móveis | Pausa | Resultado de layout |
|---|---:|---|---|---|---|
| 375×667 | 378 px | 353×338 px | direções 64×64; salto 76×76 | contida na tela | Passou |
| 375×812 | 378 px | 353×387,75 px | direções 64×64; salto 76×76 | contida na tela | Passou |
| 390×844 | 378 px | 368×403,11 px | direções 64×64; salto 76×76 | contida na tela | Passou |
| 844×390 | 240,42 px | 826×247 px | direções 64×64; salto 76×76 | contida na tela | Passou |
| 1366×768 | 287 px | 1290×548 px | controles auxiliares visíveis; teclado não exercitado nesse tamanho | contida no campo de jogo | Passou |

- **Jogar ficou inteiramente visível sem rolagem** nos cinco tamanhos; `scrollTop` da entrada era zero. A página não apresentou overflow horizontal global.
- Gato de entrada compacto: 104×108 px em retrato/desktop; 72×80 px em paisagem. Progresso resumido junto ao nome; história em seção recolhível.
- O mapa abaixo pode rolar verticalmente e seus carrosséis horizontalmente; isso não esconde o botão principal.
- Canvas, direções, salto e pausa permaneceram dentro do viewport nas capturas. Em paisagem, a barra de controles está próxima ao limite inferior, mas não foi cortada.
- As sobreposições dos controles sobre o terreno são parte do layout do jogo; não houve cobertura do botão de pausa ou de diálogos nas amostras.
- O toque em **Jogar** abriu a fase 2 quando a fixture recebeu progresso **sintético** de fase 2 desbloqueada, exclusivamente em memória. Isso comprova a seleção da próxima fase, **não** uma vitória na fase 1. A fase 2 foi somente iniciada, não jogada/auditada.

## 4. Terreno e colisões da fase 1

**Resultado: aprovado nas amostras de movimento examinadas, com a ressalva de rotação original descrita abaixo.**

Foram examinados grama, faixa de terra, sombras de borda e emendas enquanto a câmera seguia o gato em saltos e deslocamentos. Não foram observadas texturas de terra esticadas nem emendas deslizando em relação às plataformas. A repetição e recorte da terra mantêm a proporção da região de origem; a faixa superior de grama é estilizada separadamente.

Capturas incluem apoio no chão, entrada junto à borda, plataforma elevada, vãos, câmera deslocada e paisagem. O percurso corrigido alcançou x=4.758,63 de um portal em x=5.593, mas terminou em queda; isso **não** é aprovação de 85% dos desafios nem conclusão da fase.

A telemetria dos quadros apoiados foi comparada com `createPlatformLayout(1, altura_real_do_canvas)`, usando a mesma margem horizontal de 7 px da colisão:

| Percurso | Amostras apoiadas | Maior diferença pés × superfície | Apoio não encontrado |
|---|---:|---:|---:|
| Original — tentativa com derrota | 426 | 0 px | 0 |
| Original — reprodução de rotação | 542 | 0 px | 0 |
| Corrigido — percurso guiado | 1.723 | 0 px | 0 |

Essa medição verifica o alinhamento matemático do apoio com a silhueta desenhada. O sprite do gato é maior que sua caixa física, e não é uma inspeção pixel a pixel de todas as animações. A mudança de terreno não alterou a geometria de colisão.

## 5. Falhas e correções

| ID | Gravidade | Evidência e causa | Situação |
|---|---|---|---|
| QA-01 | Alta / bloqueadora | Em 390×844, gato apoiado na plataforma flutuante em x≈1.240,47, pés em y=202,03. Ao girar para 844×390, o motor procurava a primeira superfície pelo centro X, selecionava o chão inferior, causava colisão com inimigo e retornava a x=66 com 2 vidas. | Corrigida: preservar o índice da superfície efetiva de apoio, com a mesma sobreposição usada na física, inclusive nas duas bordas. Reteste 390→844→390 manteve plataforma flutuante, X e 3 vidas. |
| QA-02 | Alta, identificada por código/regressão | `visibilitychange` chamava `setPaused(document.hidden)` e podia desfazer a pausa explícita ao voltar à aba. Não foi apresentado como teste em celular real. | Corrigida: visibilidade só limpa controles ao ocultar e reinicia o relógio de quadro; a pausa escolhida pelo jogador permanece. Teste unitário e ciclo de visibilidade **simulado** no navegador passaram. |
| QA-03 | Baixa / estado visual | Efeito React reiniciava o HUD ao entrar em `playing`, inclusive ao retomar uma pausa. | Corrigida: resets permanecem em início/replay, não na retomada. Navegador coletou 1 moeda por salto e confirmou `1/28` imediatamente após continuar. |
| QA-04 | Bloqueadora inicial de aceite, não bug de física comprovado | Nenhum dos percursos da primeira rodada atingiu o portal. **Retificação pela telemetria na continuação: o guiado corrigido perdeu uma vida em inimigo e duas em quedas**, não duas em inimigos; os roteiros automatizados também falharam. | **Resolvida na seção 12** por conclusão normal da fase 1 e fluxo orgânico de vitória/recompensa/mapa/fase 2. A física não foi alterada. |

Durante a implementação intermediária, a revisão independente e a observação do navegador detectaram remoção inadvertida do guard do assistente `autoplay`. Foi corrigida em commit normal `b9353d4`; o estado final preserva o opt-in DEV existente. Um teste de navegador confirmou que o gato **não se move sozinho sem `autoplay=1`**. Ensaios nessa versão intermediária foram invalidados e não entram na matriz de aceite ou contagem de percursos abaixo.

## 6. Partidas, tentativas, mortes e tempo

> **Não houve jogador humano nem partida online.** “Guiado” significa decisões do agente e comandos de teclado temporizados no navegador, com a física real, sem `autoplay` ou teleporte. “Automatizado” significa decisões de um roteiro adaptativo no navegador. Ambos são diferentes dos testes unitários de geometria/101 estados, que não jogam fases.

**Definições:** perda de vida é uma redução do contador de corações; derrota é o encerramento da tentativa com zero vidas. A última perda não é mais um respawn. O tempo do motor inclui espera ociosa antes de algumas pausas; o tempo de parede também inclui pausas/observações. Não são tempos de speedrun.

| Percurso válido | Fonte / viewport | Método | Perdas de vida | Derrotas | Tempo do motor | Tempo de parede | Moedas | Resultado |
|---|---|---|---:|---:|---:|---:|---:|---|
| G1 | original / 390×844 | guiado | 3 | 1 | 45,64 s | 54,90 s | 2 | Quedas; não concluiu |
| G2 | original / 390×844→844×390 | guiado | 1 | 0 | 56,96 s | 57,10 s | 4 | Reprodução do dano de rotação; encerrado com 2 vidas |
| G3 | corrigido / 390×844, rotação ida/volta | guiado | 3 | 1 | 98,95 s | 205,30 s | 11 | Marco ativado, pausa/retomada, chegada a 85,08% da distância em queda; não concluiu |
| A1 | corrigido / 390×844 | automatizado adaptativo | 3 | 1 | 15,61 s | 15,45 s | 5 | Não concluiu; distância máxima final ≈28,8% |
| A2 | corrigido / 390×844 | automatizado adaptativo | 3 | 1 | 15,64 s | 15,46 s | 4 | Não concluiu; distância final ≈28,8% |
| A3 | corrigido / 390×844 | automatizado adaptativo | 3 | 1 | 15,60 s | 15,50 s | 5 | Zero vidas; distância final ≈28,1%. O snapshot precedeu a montagem do diálogo de derrota. |

**Total: 6 percursos medidos da fase 1; 0 conclusões.** Inicializações curtas da matriz de layout, smoke tests de controle e ensaios interrompidos por ajuste de instrumentação não são tentativas completas adicionais. Eles foram documentados como verificações automatizadas/exploratórias, não como vitórias.

O roteiro automatizado não comprova que a fase seja impossível: ele não representa habilidade humana. O percurso guiado chegou muito além do roteiro, mas também não satisfez o aceite de conclusão.

## 7. Controles, rotação e console

- Exercitados no motor: **seta direita, seta esquerda, Espaço e Escape**; correr, saltar, pousar, cair, receber dano, respawn, marco, pausa e retomada.
- Toque emulado: esquerda; direita e salto simultâneos; liberação dos ponteiros deixou os três inputs falsos. Toque principal em progresso sintético abriu a fase desbloqueada correta.
- A/D, W e seta para cima foram inspecionados no código, **não exercitados individualmente** neste ciclo.
- Rotação real da área do iframe 390×844→844×390→390×844 executou ResizeObserver do componente, sem recarregar ou recomeçar o estado. A correção preservou o apoio elevado e vidas.
- A matriz visual percorreu os cinco viewports, mas **não houve uma partida completa em cada tamanho**. Percursos longos foram em 390×844, com rotação para paisagem.
- Matriz e regressões finais: **zero erros de página/console registrados**. Os erros de runners de QA durante preparação foram ajustes do roteiro (imagens lazy, seletor ambíguo e coleta de moeda), não atribuídos ao aplicativo.
- Suspensão física em segundo plano, barras móveis de navegador, notch/safe area e teclado de aparelhos reais não foram verificados.

## 8. TypeScript, build e testes

| Verificação executada | Resultado | Limite |
|---|---|---|
| Instalação com lockfile congelado, pnpm 10.4.1 | Passou | Scripts de dependências permaneceram bloqueados conforme o projeto |
| `pnpm check` original e final | Passou | TypeScript sem emissão |
| `pnpm build` original e final | Passou | Aviso existente de chunks acima de 500 kB; não é erro de build |
| `verify-adventure-entry.ts` | Passou | 101 estados de entrada, seleção/replay/imutabilidade; **não 101 partidas** |
| `verify-pilot-terrain.ts` | Passou | Proporção, ancoragem, comandos e geometria; não substitui playtest |
| `verify-published-parity.ts` | Passou | Dados/mapas de armazenamento falsos e bytes do atlas; **sem chamadas Firebase** |
| Suíte original `pnpm test` | 34 passaram; 1 falhou | Integração Firebase espera credencial staging ausente; falhou antes da chamada API. Não foi fornecida credencial nem usada conta real |
| Suíte final offline, excluindo `**/*.integration.test.ts` | **39/39 passaram**, 8 arquivos | Inclui 5 novas regressões de motor. Integração Firebase não aprovada |
| Novas regressões contra fonte original em worktree isolada | 4 falharam, 1 passou | Confirma detecção da rotação/apoio e semântica de pausa corrigidas |
| Regressões de navegador finais | **7/7 passaram** | Idle sem autopilot; pausa; visibilidade simulada; HUD; toque esquerda; multitouch; fase desbloqueada sintética |
| Verificação do build QA | Passou | Nenhuma página QA encontrada na saída |

As novas regressões do motor usam stubs de DOM/Canvas: não são capturas ou partidas. A revisão independente foi somente de código, sem dados reais; sua regressão identificada foi corrigida antes da fonte final testada.

## 9. Pendências para decidir a publicação no Site existente

1. **Bloqueadora:** concluir a fase 1 pelo percurso normal, sem teleporte/assistente de vitória, e comprovar portal, diálogo de vitória, moedas/itens/decoração em memória, retorno ao mapa e avanço orgânico para a próxima fase. Aceite recomendado com teclado e toque.
2. **Bloqueadora de integração da revisão:** revisar/aceitar o PR separado da correção e repetir o reteste da plataforma elevada na versão integrada escolhida. Não substituir o PR #4 nem mesclar automaticamente.
3. **Cobertura pendente:** ensaiar a borda final onde G3 caiu e os encontros de inimigos que consumiram vidas. Separar erro de timing/ausência de coyote time de defeito de colisão; não concluir impossibilidade nem mudar mecânicas apenas porque o bot perdeu.
4. **Risco não coberto por emulação:** teste em pelo menos um celular real, incluindo multitouch, rotação com dedos apoiados e segundo plano. Safari/iOS e Chrome Android nativos não foram validados.
5. **Fora deste recorte:** equivalência visual/autenticação isolada da fonte restaurada, contas, casa, minijogos e demais fases continuam com suas pendências históricas. A falha de integração Firebase precisa de ambiente staging autorizado se houver uma futura auditoria de contas.

**Não declarar as 100 fases testadas.** Só a fase 1 recebeu playtests; a fase 2 foi apenas iniciada com progresso sintético em um teste de entrada.

## 10. Evidências e reprodução

O pacote contém capturas `original-*`/`final-*` dos cinco viewports; antes/depois de rotação; resultado da tentativa; medições JSON; telemetria; logs de testes/build; vídeos brutos dos percursos válidos e scripts usados. Os arquivos de ensaios invalidados e os arquivos temporários de exportação não entram no pacote curado.

O vídeo **Meu-Pet-Comparacao-Rotacao.mp4** é uma edição curta de gravações reais do Canvas, sem áudio, com a regressão original seguida da correção. Capturas separadas registram HUD, controles e diálogos; o vídeo de Canvas não pretende mostrar toda a interface.

Reprodução local da fonte, sem credenciais de conta:

```bash
pnpm install --frozen-lockfile
pnpm dev -- --host 0.0.0.0 --port 5173
# Abrir /qa-review.html e selecionar cada viewport.
pnpm check
pnpm exec vitest run --exclude '**/*.integration.test.ts'
node --import tsx scripts/verify-adventure-entry.ts
node --import tsx scripts/verify-pilot-terrain.ts
node --import tsx scripts/verify-published-parity.ts
pnpm build
```

Os scripts de navegador do pacote utilizam Python Playwright com conexão CDP ao navegador de QA; seus caminhos de trabalho estão explicitados no código. Não executar esses roteiros contra produção nem fornecer logins/saves reais.

**Nenhuma publicação realizada. Nenhuma rotina reativada. Nenhum merge automático.**

## 11. Entrega confirmada

- **PR separado [#5 — QA: corrigir apoio na rotação e preservar pausa da Aventura](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/5)**, aberto em rascunho, com base no ramo de revisão. Sem merge.
- PR #4 continua aberto com HEAD `b60d71857036e750476eb491b782e14f74d50e55` após a criação do PR #5.
- Vídeo curto: **19 segundos**, MP4/H.264, 640×480, sem áudio. Cortes do vídeo original entre 31–40 s e do percurso corrigido entre 12–22 s; resolução normalizada antes dos cortes para preservar a rotação sem artefatos de exportação.
- Decisão final permanece **reprovação para publicação**, com correções e evidências prontas para revisão e pendência de conclusão da fase 1.

## 12. Continuação — aceite da fase 1 resolvido

A reprovação e os seis percursos acima descrevem a **rodada inicial**. A continuação solicitada pelo usuário acrescentou uma tentativa completa guiada no commit `c65876826dd54d53586781278f30b60f29875c8a`: **1 conclusão, 0 perdas de vida, 3 vidas no portal, 33,5053 s de motor, 623,9965 s de parede**, 13 moedas e 2 itens coletados. O jogo concedeu **2 estrelas, 195 moedas, Torre de escalada e Sardinha crocante ×2**. O mapa passou a fase 2 por conclusão orgânica; o botão principal, acionado por toque emulado, iniciou a fase 2 sem modificar progresso.

A investigação demonstrou contatos laterais válidos nos fracassos do bot e um salto tardio após perder apoio no vão de 85 px. O reteste lançou em x=4.562,34 e pousou em x=4.789,29 com 3 vidas. **Nenhuma mudança de física/dificuldade foi feita.** As 800 amostras apoiadas têm diferença máxima de 0 px e nenhuma superfície ausente.

O commit **`4df546807c789f2475ca0381ca97df4cb97095e5`** acrescenta 11 testes de contratos existentes e um helper de QA local. TypeScript, **50/50 testes offline**, invariantes, paridade falsa, Python e build passaram. O helper corrigido foi smoke-testado sem vencer fase. O runtime permanece idêntico ao commit jogado. A fase 2 apenas foi iniciada e pausada; não foi concluída.

- [Aceite completo e pendências restantes](ACCEPTANCE-STAGE1.md).
- [Vídeo editado da conclusão](evidence/acceptance/Meu-Pet-Conclusao-Fase-1.mp4), quadro completo, sem aceleração; pausas longas removidas.
- [Resumo verificável e hashes](evidence/acceptance/acceptance-summary.json).
- [Vitória](evidence/acceptance/organic-victory.png), [decoração/itens](evidence/acceptance/organic-decoration-reward.png), [moedas](evidence/acceptance/organic-coin-reward.png), [mapa orgânico](evidence/acceptance/organic-map-return.png), [fase 2 por toque](evidence/acceptance/organic-touch-phase2.png).

**QA-04 resolvida; aprovação funcional limitada da fase 1, sem autorização de publicação.** PR #4 preservado. PR #5 continua em rascunho, sem merge. A v10 permanece a referência pública, não modificada.
