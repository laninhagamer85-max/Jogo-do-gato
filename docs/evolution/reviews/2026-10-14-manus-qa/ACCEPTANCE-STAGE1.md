# Meu Pet Virtual — aceite da fase 1

**Continuação de 14/10/2026 · PR #5 · Web Agência AD**

## Decisão atual

**APROVADO o recorte funcional de aceite da fase 1:** percurso normal até o portal, vitória, recompensa, retorno ao mapa e desbloqueio orgânico da fase 2 foram comprovados no navegador de teste.

**Não é autorização de publicação nem aprovação das 100 fases.** Nenhum deploy, merge, force-push, login, backend ou save real foi utilizado. A referência pública continua na **v10**, conforme o repositório e a solicitação; a produção não foi jogada nem modificada.

O bloqueio **QA-04** do relatório anterior está resolvido neste recorte. Permanecem a revisão/integração da versão escolhida, testes em aparelho físico e as pendências históricas fora da Aventura.

## 1. Código identificado e trabalho preservado

| Referência | Identificação |
|---|---|
| Repositório | `laninhagamer85-max/Jogo-do-gato` |
| PR atualizado | [#5](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/5), ramo `fix/qa-adventure-rotation-20261014`, mantido em rascunho |
| PR preservado | [#4](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/4), ramo `recovery/mobile-review-20261009` |
| HEAD do PR #4 conferido | `b60d71857036e750476eb491b782e14f74d50e55` |
| Commit da partida concluída | **`c65876826dd54d53586781278f30b60f29875c8a`** |
| Commit novo de código de QA/testes | **`4df546807c789f2475ca0381ca97df4cb97095e5`** |
| Correção funcional anterior preservada | `b9353d4eb4186f169298d3e997a51d94ef186765` |
| Piloto de terreno preservado | `b044f19da926f0b34247be34ab64a658921b064c`, não publicado |

As referências remotas foram atualizadas antes de trabalhar e novamente antes de registrar as alterações. O ramo do PR #5 ainda tinha o mesmo HEAD ao receber o commit normal de QA. Nenhum commit do PR #4 foi substituído.

**Não foi alterada a física neste ciclo.** Motor, layout, economia e componente funcional continuam com os mesmos bytes do commit jogado. O resumo JSON registra hashes SHA-256 e diff vazio desses arquivos em relação ao commit novo. O código adicionado consiste em regressões e um roteiro de QA reutilizável, não em facilidades para vencer.

Foram relidos `README.md`, `recovery/RETOMADA-MANUS.md`, `docs/evolution/state.json` e o relatório anterior. O estado histórico de evolução não foi sobrescrito; o relatório do PR recebe a atualização e remete a este aceite.

## 2. Método e isolamento

> **Partida no motor real, guiada pelo agente; não foi um jogador humano ou uma partida online.** O agente escolheu lançamentos e pousos, e um roteiro executou teclado na interface, parando a corrida conforme a posição observada. Isso é diferente do bot adaptativo da rodada anterior e dos testes unitários.

- Cliente Vite, somente em `http://localhost:5173/qa-review.html`; partida dentro de `/qa-adventure.html`.
- Chromium 154.0.8037.57, Linux Sandbox, DPR 1. Viewport do jogo **390×844**, Canvas **368×403,109375**. Não é Safari/iOS ou Android físico.
- Pet de demonstração Pudim, perfil e progresso React **somente em memória**. Fixture sem Firebase, autenticação ou persistência.
- Requisições externas bloqueadas: o registro da sessão contém somente **GETs locais**, sem requisições externas e sem endpoints de contas/saves. `localStorage` e `sessionStorage` vazios.
- Corrida e salto por `ArrowRight`, `ArrowLeft`, `Space`; pausa/retomada por `Escape`. Decoração, moedas e mapa abertos pelos botões reais.
- Sem `autoplay=1`, teleporte, alteração de posição/velocidade/colisão, invulnerabilidade concedida ou chamada direta de vitória na partida.
- A leitura da instância React/motor foi instrumentação de observação. O maior deslocamento horizontal entre amostras ativas foi **15,15 px**; não ocorreu salto de posição por escrita de QA.
- Na partida concluída, o maior valor de invulnerabilidade observado foi **0** e as três vidas permaneceram intactas.

O início da fase 2 foi acionado depois da vitória e do retorno ao mapa por **toque emulado nativo do navegador**, sem escrever progresso. Foi pausado imediatamente; não constitui playtest completo da fase 2.

### Transparência da instrumentação

O JSON da primeira leitura inicial da sessão tem `state: null`: a leitura ocorreu antes de terminar o mount React. Esse dado foi preservado, não reconstruído como se tivesse sido observado. A entrada e o vídeo mostram **350 moedas, fase 1 e zero fases concluídas**; a fixture define esse mesmo estado.

O roteiro foi corrigido para esperar o botão/estado inicial, identificar o commit automaticamente e guardar estado antes/depois dos comandos. Um **smoke test automatizado** confirmou essa correção no commit `4df5468`, iniciando e pausando sem percorrer ou vencer uma fase. Esse smoke não é uma segunda conclusão.

A exportação original da vitória preserva as amostras completas. Depois da vitória foram reduzidos somente registros repetidos de pausa/estado terminal na telemetria canônica: **1.622 amostras**, incluindo todas as amostras de movimento ativo. Nenhuma física ou recompensa foi alterada por isso.

## 3. Percurso concluído e métricas

| Medida | Resultado desta continuação |
|---|---:|
| Tentativas completas novas da fase 1 | **1** |
| Conclusões | **1** |
| Perdas de vida / mortes | **0** |
| Derrotas | **0** |
| Vidas no portal | **3/3** |
| Tempo do motor até o portal | **33,5053 s** |
| Tempo de parede até o portal | **623,9965 s** |
| Moedas coletadas na fase | **13/28** |
| Itens temáticos coletados | **2/3** |
| Estrelas | **2/3** |
| Marco intermediário | **Ativado** |
| X no quadro de vitória | **5.545,38**, jogador de 52 px; portal em **5.593** |
| Erros de página/console registrados | **0** |

O tempo de parede inclui pausas longas de observação. O tempo do motor inclui a espera inicial sem movimento. **Não é uma marca de speedrun nem tempo de execução de uma criança.**

A rota utilizou chão e plataformas flutuantes existentes, descidas naturais para pegar os dois itens e saltos sobre patrulhas. Não foi necessário derrotar todos os inimigos nem coletar todas as moedas/itens para concluir; isso é o contrato atual do jogo, não uma regra nova.

O relatório anterior conserva **6 percursos medidos, sem conclusão**. Com esta continuação, o histórico tem **7 percursos válidos medidos da fase 1 e 1 conclusão**. Inicializações ociosas interrompidas durante preparação do encoder/terminal e o smoke do roteiro não foram contados como tentativas completas. Não houve perda de vida nessas preparações.

### Apoio visível × colisão

As **800 amostras apoiadas** desta sessão foram comparadas com a geometria real da fase 1 na altura do Canvas, usando as mesmas margens de 7 px do motor:

- Maior diferença entre pés físicos e superfície de apoio: **0 px**.
- Amostras apoiadas sem superfície correspondente: **0**.
- Capturas mostram terreno, emendas e sombras na segunda metade e no vão final, com câmera deslocada. Não foi encontrada nova falha de alinhamento ou textura esticada nessas amostras.

A medição é da caixa física e das superfícies desenhadas; não é análise pixel a pixel de todos os frames de animação do sprite.

## 4. Investigação das mortes anteriores

**Retificação importante do relatório inicial:** o percurso guiado anterior perdeu **uma vida por contato com inimigo e duas por queda**. A descrição anterior de duas perdas em inimigos estava incorreta. A telemetria mostra a segunda perda já com `grounded=false`, `vy=900` e `y=460,12`, seguida de respawn no marco. A classificação corrigida e as janelas dos quadros estão no pacote de evidências.

### Inimigos: colisão lateral, não stomp perdido demonstrado

Os três fracassos do bot adaptativo se repetiam na plataforma terrestre de `x=1.486,2` a `1.783,6`, perto do inimigo que patrulha aproximadamente `x=1.626–1.686`.

O bot chegava descendo ou já apoiado por volta de `x=1.598–1.608` e seguia correndo para a caixa do inimigo. Nos contatos apoiados, `vy=0`; no contato descendente, o pé anterior já estava abaixo do limite de stomp. O motor exige **descida e aproximação por cima**, não qualquer contato enquanto a tecla de salto está ativa.

Portanto, as perdas registradas são compatíveis com **contato lateral e política/timing inadequado do bot**. Não demonstram um inimigo impossível ou falha de colisão.

Nesta tentativa, o agente iniciou um novo salto ainda apoiado em `x≈1.532,79` e pousou após o inimigo em `x≈1.734,39`, mantendo 3 vidas. As outras patrulhas foram atravessadas com margens de lançamento/pouso, sem dano.

**Limite:** o stomp foi verificado em teste unitário com stub, não apresentado como uma ação visualmente realizada nesta partida. O percurso jogado desviou dos inimigos.

### Queda intermediária do guiado: pouso seguido de saída da margem

A segunda perda anterior ocorreu depois da plataforma de `x=2.897,8`. Em `x=3.160,98`, o gato já estava com `grounded=false` e `vy=29,4`: havia ultrapassado a margem efetiva de apoio após pousar. Parou ali e avançou de novo sem um salto aceito; a trajetória continuou descendente, chegou a `y=460,12` com `vy=900` e perdeu a vida por queda, voltando ao marco. Esses quadros não são compatíveis com uma segunda colisão de inimigo como causa da perda registrada.

No percurso concluído, o pouso foi escolhido mais para dentro, em `x=3.130,68`, seguido de um salto apoiado até a plataforma elevada seguinte. A vida foi preservada. Não foi necessário acrescentar coyote time ou mudar as caixas de colisão.

### Vão final: o segundo salto foi pedido tarde

Na tentativa guiada anterior:

1. O gato saltou de `x≈4.350` e pousou em `x=4.587,24` na plataforma que termina em `4.596,8`.
2. Ainda havia apoio válido: a margem esquerda da colisão era `x+7=4.594,24`.
3. Ao caminhar para `x=4.617,51`, perdeu o apoio; não houve salto aceito antes dessa saída.
4. A velocidade vertical ficou positiva, e a queda ultrapassou `altura+110`, consumindo a última vida.

A próxima plataforma começa em `x=4.681,8`: **vão de 85 px**. O motor atual só inicia salto estando apoiado; não tem coyote time. A evidência mostra timing de execução fora do apoio, **não uma colisão invisível demonstrada**. Não é possível atribuir o fracasso anterior apenas a soltura curta do Espaço: nesse trecho a limitação de subida por soltura não foi a causa comprovada.

No reteste concluído, o lançamento foi feito em **`x=4.562,34`**, ainda apoiado, com Espaço pressionado antes do deslocamento. O gato pousou em **`x=4.789,29`**, na plataforma elevada seguinte, com **3 vidas**. Continuou pelos últimos vãos até o portal.

**Decisão de engenharia:** preservar `JUMP_SPEED`, `GRAVITY`, velocidade de corrida, caixas de inimigos, regra de stomp e margens de colisão. Uma eventual discussão de acessibilidade/coyote time seria uma melhoria de produto separada, não uma correção exigida pela evidência atual.

## 5. Vitória, recompensa e desbloqueio orgânico

| Etapa real da interface | Evidência e resultado |
|---|---|
| Entrada no portal | `player.x + 52 ≥ goalX`; callback normal do motor, sem chamada de QA |
| Vitória | **“Missão cumprida!”**, Casa do Começo · 01, **2 estrelas** |
| Decoração | **Torre de escalada**, `decorInventory.tower = 1` |
| Itens | **Sardinha crocante ×2**; inventário passou de **1 para 3** |
| Moedas | **+195**, carteira observada de **350 para 545** |
| Retorno ao mapa | **Fase 2 · Casa do Começo**, **1 de 100 fases concluídas**, botão **Continuar aventura** |
| Progresso | `{ unlockedStage: 2, completedStages: [1], starsByStage: { "1": 2 } }` |
| Toque no botão principal | Abriu **“Fase 2: Atravesse a ponte saltitante”** sem injetar progresso |
| Estado após iniciar a fase 2 | Recompensas/progresso iguais aos do mapa; fase pausada, não concluída |

A recompensa segue a fórmula existente: **65 + 13 × 10 = 195 moedas**. Os botões de revelação não concedem o prêmio novamente; apenas apresentam o resultado já aplicado no callback orgânico. O estado após as etapas permaneceu consistente.

Não foi aberto o fluxo de casa para posicionar a decoração nem utilizada uma conta. O aceite aqui é da conquista e armazenamento em memória, não da persistência online.

## 6. Código novo e validação técnica

### Alterações no mesmo PR #5

- `PlatformerEngine.test.ts`: **8 contratos adicionais** — jump/latch/soltura, salto antes/depois da borda final, pouso na margem visível, stomp versus dano lateral, queda/respawn, coleta única e callback normal ao cruzar o portal.
- `PlatformStageCompletion.test.ts`: **3 testes adicionais** — prêmio da primeira conclusão/imutabilidade, replay sem duplicação e bloqueio de fase 2 antes de concluir a fase 1.
- `scripts/qa-adventure-acceptance.py`: roteiro interativo local, comandos de UI, gravação, estado/telemetria, bloqueio de alvo público e identificação do commit. Não é importado pelo aplicativo.

Os testes unitários usam **fixtures sintéticas e DOM/Canvas stubs**. Inclusive a posição de portal do teste unitário é artificial; **não foi usada na partida do navegador nem serve como evidência de conclusão**.

| Verificação nesta continuação | Resultado |
|---|---|
| `pnpm check` | **Passou** |
| Suíte offline, excluindo `**/*.integration.test.ts` | **50/50 testes**, 9 arquivos |
| Contratos de motor e recompensa | **16/16**, incluindo as 5 regressões anteriores |
| Entrada da Aventura | **Passou**, 101 estados; não 101 partidas |
| Terreno piloto | **Passou** |
| Paridade de atlas/armazenamento falso | **Passou**, sem Firebase |
| Python compile + smoke do helper corrigido | **Passaram** |
| `pnpm build` | **Passou**, aviso existente de chunk acima de 500 kB |
| Requisições da sessão jogada | **Somente GETs locais**, sem erros registrados |

A integração Firebase não foi executada/aprovada. A saída contém um asset cujo hash inclui as letras `qa`, mas isso não representa uma página QA; as fixtures permanecem fora dos inputs de release. Nenhuma publicação foi acionada.

## 7. Cobertura e pendências para a decisão no Site existente

1. **Resolvido:** QA-04, conclusão normal da fase 1, vitória/recompensa/mapa/fase 2 orgânica.
2. **Resolvido neste recorte:** investigação dos inimigos e do vão final. Nenhum bug novo de física demonstrado; contratos existentes fixados por regressões.
3. **Pendente:** revisar o PR #5 e escolher a versão a integrar ao Site existente. Repetir o smoke de rotação/pausa e o fluxo de recompensa nessa versão integrada; não houve merge automático.
4. **Pendente de cobertura:** uma conclusão completa por controles de toque. O percurso vencedor foi por teclado; o toque desta continuação comprova a entrada orgânica da fase 2, não toda a fase 1 por dedos.
5. **Pendente de dispositivo:** aparelho físico, multitouch, orientação com dedos apoiados, safe areas/barras do navegador e segundo plano, especialmente Safari/iOS e Chrome Android.
6. **Fora deste recorte:** contas, autenticação/persistência, equivalência visual histórica da casa/painel, minijogos e auditoria das demais fases.

A matriz **375×667, 375×812, 390×844, 844×390 e 1366×768** do relatório anterior continua válida para os mesmos arquivos funcionais. **Não foi feita uma conclusão completa em cada viewport nesta continuação**; houve uma conclusão em 390×844. A fase 2 só foi iniciada e pausada. **Não declarar as 100 fases testadas.**

## 8. Evidências e reprodução

O pacote de aceite reúne:

- Capturas da entrada, plataformas, vão final, vitória, decoração, moedas, mapa e fase 2 orgânica.
- Resumo JSON, estados, telemetria original/canônica, geometria, logs e hashes.
- **`Meu-Pet-Conclusao-Fase-1.mp4`**, edição de aproximadamente **2 min 23 s**, H.264, 480×1024, sem áudio. Mantém o quadro completo de 480×980 e acrescenta rodapé de identificação. **Somente pausas/esperas longas foram removidas; não houve aceleração.**
- **`conclusion-full-ui.webm`**, gravação original sem cortes, **1.078,72 s**, VP8, 480×980, sem áudio. Inclui todas as pausas e esperas de revelação. A gravação alterna o enquadramento inicial do iframe com o quadro da página QA; nenhum conteúdo do jogo foi removido na edição final.
- Lista de cortes e script FFmpeg para reprodução; script de QA e testes no ramo do PR #5.

Os quadros de portal, decoração, moedas, mapa e fase 2 foram inspecionados. A lista de cortes inclui folgas verificadas para a diferença de transporte entre telemetria e gravação. O arquivo original é a referência para continuidade integral; a edição não transforma decisões guiadas em partida humana.

```bash
pnpm install --frozen-lockfile
pnpm dev -- --host 0.0.0.0 --port 5173
# Abrir /qa-review.html; somente fixture em memória.
pnpm check
pnpm exec vitest run --exclude '**/*.integration.test.ts'
node --import tsx scripts/verify-adventure-entry.ts
node --import tsx scripts/verify-pilot-terrain.ts
node --import tsx scripts/verify-published-parity.ts
pnpm build
```

O helper exige Python Playwright, encoder de vídeo e o navegador QA com CDP. Executar apenas em ambiente local de teste. Comandos `move`/`jump` acionam teclas reais; `finish` salva e encerra a sessão. Não fornecer logins ou saves reais.

**Resultado entregue para revisão no PR #5. Nenhuma publicação, migração para o Site, rotina reativada ou merge realizado nesta etapa.**
