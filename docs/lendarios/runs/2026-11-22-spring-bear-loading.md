# 22/11/2026 — Repouso do Urso Protetor das Nascentes

## Fonte e escopo
Fonte exata do Site: `af2cd09d34a726b62037e4910827064b68b64fab`, produto1.0.130, Sites134, deploy `appgdep_6b029982e56c819189aa40d3c2dd9e78` succeeded em2026-11-22T07:28:21.280547+00:00. HEAD coincidia. AGENTS, README, README da aplicação, recuperação histórica, estado e run21/11 lidos. O carrossel pendente de21/11 já está incorporado nesta fonte; não republicamos Sites127 nem atribuímos a falha anterior de CPU a uma causa não demonstrada. Atualizações concorrentes da Arena e captura preservadas.

Entrega exclusivamente ao Lendários do Rei. Nova cena original `spring-bear`, sem outra cena deste personagem na lista anterior. Urso de pedra cinza, musgo, folhas, cipós e cristais turquesa, sozinho e repousando na grama; identidade baseada na arte atual `boss-guardian-concept-v1.png`. Estilo baseado na tela atual do Lagarto Espinhoso. Sem interface, relógio, texto ou marca pintada. Arte gerada pela ferramenta integrada, não material externo incorporado.

## Arquivos e integração
- `client/public/lendarios/loading/spring-bear-landscape-v1.webp`:1439×810,149062bytes.
- `client/public/lendarios/loading/spring-bear-portrait-v1.webp`:810×1439,105322bytes.
- Total254384bytes (~248.4KiB). Estimativa RGBA decodificada do par8.89MiB, calculada por pixels×4; não é medida do heap do navegador.
- `client/src/lib/loadingScenes.ts`:entrada acrescentada à alternância, sem mudar o gerenciador.
- `client/src/lib/lendariosNews.ts` e package.json:produto1.0.131.
- Fonte enviada ao repositório nativo:`bda74d612be71fce4ed8308ee71c568cf4843ec2`.
- Patch de código e cópias das duas artes em `docs/lendarios/reviews/2026-11-22/`. O runtime antigo do ramo GitHub não substitui a fonte do Site.

Mantidos seleção somente após download e decode das duas orientações, imagem atual em erro, uma fila por vez e retenção atual+seguinte. Nenhuma mudança em física, combate, conta, saves, memória de progresso, pausa da simulação ou intervalo mínimo de1000ms após dois frames. A preservação da pausa foi conferida na fonte; não foi realizada uma nova partida.

## Pesquisa técnica —22/11/2026
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode —preservar preparação antes da troca e tratamento de rejeição.
- https://web.dev/learn/design/picture-element —enquadramentos específicos por orientação usando o picture existente.
Sem nova dependência e sem assets externos.

## Validação
26/26 testes em5arquivos:loadingScenes,preparedLoadingScenes,loadingSceneLifecycle,loadingReveal e gameAssetLoading. Incluem falha/rejeição/timeout,300 transições simuladas e cancelamento do reveal. TypeScript jogo e host aprovados. Build oficial Worker aprovado,583 arquivos preservados verificados byte a byte; não é declaração de suíte completa ou playtest.

Chrome com prévia oficial, componente real GameLoadingScreen e gerenciador real em harness isolado de QA, sem login, sem saves. Seleção determinística só no harness. A primeira versão vertical cortava as laterais em390×844:recomposta pela geração de imagem com personagem menor, depois revalidada. Arte final inteira nos cinco tamanhos375×667,375×812,390×844,844×390 e1366×768. Progresso atualizado sem trocar cena nem disparar novos downloads (contador6 permaneceu6). Troca normal observada rest→spring-bear→thorn-lizard. Alteração de orientação selecionou portrait/landscape pelo picture sem deformação; barras e logo reais separados da arte.

Falha de download induzida apenas no harness:URLs do par do urso substituídas por arquivo inexistente. Quatro eventos de erro em duas tentativas;rest permaneceu visível, sem tela verde. Após restaurar URLs, primeiro destino preservou rest enquanto preparava, seguinte selecionou spring-bear. Teste de reutilização com cache aquecido faz parte da sequência; não medimos bytes transferidos do cache ou tempo em dispositivo físico.

Após rebuild, a prévia perdeu o frame temporariamente;foi reiniciada pelo fluxo oficial e a inspeção final concluída. Harness e arquivos temporários removidos antes de empacotar;tar conferido sem qa-loading. Sem celular físico, FPS, heap real, auditoria de fases, novo teste de multiplayer ou100fases concluídas. Métricas de fase:tentativas/mortes/tempo/nivel de dificuldade não medidos neste ciclo de carregamento.

## Prompt final de produção
Paisagem:ilustração original16:9, estilo infantil2D pintado da tela atual do lagarto, personagem urso de pedra da arte original atual, cinza/musgo/folhas/cipós/cristais/olhos ciano, sozinho e deitado em gramado ensolarado tranquilo, silhueta inteira central, poucas pedras/samambaias laterais, parte inferior28% de grama livre para UI real;sem texto, logo, interface, relógio ou marca.
Retrato:recompor a mesma identidade e pose em9:16 sem esticar, personagem central reduzido24% em relação ao primeiro retrato, até64% da largura com margens laterais18%, entre37–64% da altura, topo livre para logo e parte inferior28% livre para progresso. Conversão WebP qualidade86, redimensionamento proporcional sem distorção.

## Publicação
**Publicada1.0.131, Sites135**. Deployment `appgdep_6b02d19be3fc81919987d21d549dafd5` terminou em succeeded em `2026-11-22T11:27:44.383522+00:00`. Versão salva `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_faaf8cba5ca481919b3e44d251356ea1`. [Jogo público](https://lendariosdorei.com.br/) e [URL da plataforma](https://lendarios-do-rei.aquimeusite.chatgpt.site). Depois da publicação, Chrome confirmou Ver.1.0.131 e a notícia “O Urso das Nascentes descansa na trilha” na home. A imagem vertical pública foi aberta e inspecionada em810×1439. Não foi realizada partida de produção para forçar uma cena aleatória. Sem mudança em domínio, acesso, contas ou saves. Uma única revisão publicada no ciclo. Rollback de referência:Sites134 e fonteaf2cd09d34a726b62037e4910827064b68b64fab, somente se nenhuma publicação posterior.

Próximo:validar em celular físico e avaliar a próxima cena de personagem ainda não representado, a partir da fonte atual;novo teste em aparelho físico continua pendente.
