# 24/11/2026 — Caranguejo Azul nas telas de carregamento

## Base e mudança
Site Lendários do Rei, fonte exata `ad93ebd87f83f247bb6a011a5944362b01af389f`, produto1.0.141, Sites144, deployment `appgdep_6b0427d7356881919a341c0546b6ec06` succeeded em2026-11-23T11:47:45.402645+00:00. HEAD coincidia com a publicação. Lidos AGENTS, README, README da aplicação, documentação histórica de retomada, estado e relatório23/11. A fonte atual inclui o ajuste de fluidez;ele foi preservado, não reimplementado ou reavaliado por esta entrega. Nenhuma mudança/publicação no Meu Pet, conta, saves, domínio ou acesso. Sem merge automático/force-push e sem mensagens a terceiros.

Nova cena original `blue-crab`: Caranguejo Azul pequeno, com carapaça turquesa salpicada, ventre creme, pinças laranja/douradas baixas e olhos âmbar, sozinho na grama. Identidade baseada na primeira linha do atlas atual `forest-adventure/river-mobs-v1.webp`;estilo de pintura baseado no carregamento atual. É um NPC diferente do Mestre das Marés já representado. Composição com salgueiros e curva de rio ao longe, sem relógio, texto ou interface pintada. Arte criada pela ferramenta integrada, sem incorporar asset externo.

## Integração e tamanho
- `client/public/lendarios/loading/blue-crab-landscape-v1.webp`:1439×810,138446bytes.
- `client/public/lendarios/loading/blue-crab-portrait-v1.webp`:810×1439,115712bytes.
- Total254158bytes (~248.2KiB);WebP qualidade86, redimensionamento proporcional. Estimativa RGBA do par8.89MiB, sem medição real do heap.
- Entrada em `client/src/lib/loadingScenes.ts`, notícia em `client/src/lib/lendariosNews.ts`, package.json1.0.142.
- Fonte enviada: `bb0f0f93ca1e6922915ef03d2abea0c3e54f398c`.
- Patch e cópias das duas artes em `docs/lendarios/reviews/2026-11-24/`;runtime antigo do ramo GitHub não foi usado para substituir o Site.

Gerenciador preservado sem alteração:preparação antecipada, decode de ambas as orientações antes da seleção, imagem atual em falha, uma fila e retenção de atual+seguinte. Pausa da simulação e intervalo mínimo de1000ms após dois frames não foram alterados. Não houve nova partida para observar a pausa em gameplay.

## Pesquisa —24/11/2026
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode —manter decode e tratamento de rejeição antes de apresentar a próxima imagem.
- https://web.dev/learn/design/picture-element —enquadramentos específicos por orientação pelo picture existente.
Sem nova dependência ou atualização de lockfile.

## Recuperação do ambiente
O ambiente estava sem espaço durante a instalação e gravação das imagens. Conferido que o checkout22/11 estava limpo;removidos somente seus node_modules, out/dist e cópias geradas, além do tar antigo cuja versão permanece salva no Sites. Código e histórico preservados. Instalação reiniciada pelo helper oficial e concluída. A primeira gravação da nova arte ficou incompleta;usada somente a imagem completa/decodificada. Não foi publicado pacote com arquivo truncado. O helper instalado mudou para1.2.0-relay;usado o caminho atual após a tentativa inicial com o caminho antigo inexistente.

## Testes e limites
- **26/26 em5arquivos**:loadingScenes,preparedLoadingScenes,loadingSceneLifecycle,loadingReveal e gameAssetLoading. Incluem300 transições simuladas, rejeição/timeout/falha e cancelamento do reveal;sem alegação de suíte completa ou playtest.
- TypeScript do jogo e host aprovados. Build oficial Worker aprovado, **595 arquivos verificados byte a byte**.
- Chrome na prévia oficial com componente e gerenciador reais em harness isolado, sem login/save. Random determinístico e falhas somente no harness, removido antes do pacote.
- Inspeção visual em375×667,375×812,390×844,844×390 e1366×768:personagem inteiro e barra legível, sem distorção. Picture escolheu o arquivo paisagem1439×810 em844×390.
- Progresso20→100% em8acionamentos, mesma cena e contador6objetos Image sem novas preparações. Sequência observada:rest→blue-crab→amethyst-frog→blue-crab, com retorno em cache aquecido;sem medir bytes do cache.
- Download do par substituído por URL inexistente:4erros em2tentativas;rest permaneceu visível. Restauradas as URLs, destino2 manteve rest durante preparação e destino3 exibiu blue-crab. Sem quadro verde observado.
- Tar conferido sem qa-loading, manifest com mesmo projeto/D1/R2 e artes idênticas às aprovadas.
- Sem celular físico, FPS/heap real, partida de combate, save real ou desbloqueio. Auditoria das100fases não executada;tentativas/mortes/tempo/dificuldade por fase:não medidos neste ciclo.

## Prompt de produção
Paisagem16:9:caranguejo pequeno da primeira linha do atlas, turquesa salpicado/creme/pinças laranja-douradas/olhos âmbar, postura tranquila com pinças baixas, sozinho em gramado de pintura infantil2D, salgueiros distantes e rio discreto, corpo inteiro central40% da largura e35–62% da altura,30% inferior livre para progresso real, céu livre no topo esquerdo, sem texto/interface/relógio/marca. Não usar o mestre gigante com runas.
Retrato9:16:recompor a mesma identidade/pose naturalmente sem esticar, central60% da largura com margens de grama,42–63% da altura, topo25% e parte inferior30% livres para interface real. As margens finais foram conferidas no navegador.

## Publicação
**Publicada1.0.142, Sites145**. Fonte `bb0f0f93ca1e6922915ef03d2abea0c3e54f398c`, versão salva `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_ebf4c6a65db48191bf0f4e560ea2d5a9`, deployment `appgdep_6b05723a96148191a7eb204a4505debe` succeeded em `2026-11-24T11:17:27.251183+00:00`. Uma única revisão publicada. [Jogo público](https://lendariosdorei.com.br/) e [URL da plataforma](https://lendarios-do-rei.aquimeusite.chatgpt.site). Inicialmente o domínio ainda mostrou1.0.141 e a tentativa de abrir diretamente a nova arte retornou falha HTTP. A página de erro não pôde ser observada por restrição do navegador;nenhuma tentativa de contornar essa restrição. Após cerca de48segundos, uma nova conferência da home confirmou Ver.1.0.142 e a notícia “O Caranguejo Azul descansa na margem”. Isso é compatível com atualização ainda em propagação, mas a causa específica da primeira falha HTTP não foi comprovada. Verificação direta do arquivo público ficou inconclusiva;não foi repetida. Arte e alternância foram validadas na prévia antes da publicação e no arquivo final do pacote. Sem alegação de partida de produção. Público, domínio, contas e saves preservados. Rollback de referência:Sites144 e fontead93ebd87f83f247bb6a011a5944362b01af389f, apenas se não existir revisão posterior.

Próximo:validar em aparelho físico e avaliar outro personagem ainda ausente. Qualquer correção de movimento exige seu próprio playtest, independente desta cena.
