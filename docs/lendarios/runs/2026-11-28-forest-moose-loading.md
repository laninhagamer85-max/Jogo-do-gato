# 28/11/2026 — Alce dos Troncos no carregamento

## Base e entrega

Site canônico Lendários do Rei, produto **1.0.152 / Sites155**, fonte publicada `e475e8c2e1af44dbdd201f5e7bd7b5e43606572a`. HEAD aberto pelo helper coincide com a publicação. Lidos AGENTS.md, README, README da aplicação, retomada histórica, estado e relatório anterior. GitHub de revisão ainda é histórico de runtime; sua aplicação antiga não foi publicada. Preservadas as correções recentes de conta, sincronização, salvamento periódico e separação da ilustração dos recursos obrigatórios da sala.

Nova cena original **forest-moose**, Alce dos Troncos adulto sozinho em uma clareira tranquila de pinheiros e bétulas, com folhas douradas. Identidade conferida em explorationFauna.ts (moose[0], faunaArt4) e no asset atual forest-adventure/fauna/animal-4.webp: pelagem castanha, grandes galhadas palmadas claras, focinho alongado, barba escura, pernas inferiores mais claras e cascos escuros. Não é cervo ou rena. Sem personagens adicionais, interface pintada, relógio, textos ou marcas; nenhum asset externo incorporado.

## Código e arquivos

- client/public/lendarios/loading/forest-moose-landscape-v1.webp:1439×810, **135790 bytes**.
- client/public/lendarios/loading/forest-moose-portrait-v1.webp:810×1439, **148306 bytes**.
- Total **284096 bytes (~277,4KiB)**. WebP qualidade86, redimensionamento proporcional; RGBA teórico do par ~8,89MiB, sem medição real do heap.
- Entrada antes de tide-master em loadingScenes.ts; notícia em lendariosNews.ts; package.json **1.0.153**.
- Fonte enviada `f130c8d99a17d10384b53b70305580cf1156b0a8`.
- Patch e imagens em docs/lendarios/reviews/2026-11-28/, commit `58b04f878bdb0e6788081ee54d4f19b1c57f4edb`.
- Apenas5arquivos de runtime alterados. Mesmo projeto/D1 DB/R2 null; nenhuma alteração de dependência ou lockfile, saves, login, permissões ou domínio.

O gerenciador existente foi mantido: preparação e decode antecipados, retenção dos pares atual/seguinte, imagem atual quando a próxima falha ou ainda não está pronta. Pausa da simulação e intervalo mínimo1000ms após dois frames preservados por fonte/contrato; não observados novamente em partida. A ilustração continua separada dos recursos obrigatórios da sala.

## Pesquisa — 28/11/2026

Fontes primárias abertas e aproveitadas:
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — selecionar imagens prontas e tratar rejeição, evitando quadro vazio.
- https://web.dev/learn/design/picture-element — composições diferentes por orientação usando picture existente.

## Arte e revisão visual

Paisagem original16:9 e recomposição retrato9:16 criadas pela ferramenta integrada com referência de identidade do alce atual e referência de estilo da tela do Gaio. Brief: alce calmo de corpo inteiro, quatro cascos apoiados, galhadas intactas, clareira pintada infantil, céu livre para marca real e grama inferior para progresso.

A inspeção inicial identificou que em844×390 o título ficava perto das patas na paisagem. A arte horizontal foi recomposta pela ferramenta: alce menor e mais ao fundo, cascos terminando por volta de62% da altura; área inferior livre. Novo build e inspeção real844×390/1366×768 confirmaram separação do título. Retrato não sofreu alteração após sua validação.

## Verificação

**26/26 testes em5arquivos**: loadingScenes, preparedLoadingScenes, loadingSceneLifecycle, loadingReveal e gameAssetLoading. Incluem300transições simuladas, timeout, erro/rejeição e cancelamento. TypeScript do jogo e host aprovados. Build oficial Worker final aprovado; **606 arquivos preservados verificados byte a byte**. Pacote703entradas, sem arquivos do harness; manifest e Worker presentes. Git limpo após envio pelo helper.

Chrome no preview oficial, GameLoadingScreen e gerenciador reais em harness isolado, sem login ou saves:
- 375×667,375×812,390×844,844×390 e1366×768 inspecionados, alce inteiro, sem distorção, galhadas/focinho/cascos visíveis. Paisagem final reinspecionada nos dois tamanhos.
- Picture selecionou portrait810×1439 e landscape1439×810 conforme orientação.
- Sequência observada **rest → forest-moose → forest-jay → forest-moose**, com retorno aquecido; bytes do cache não medidos.
- Oito acionamentos de progresso20→100%, mesma cena e contador acumulado de Image estável6.
- Falha induzida só no harness por URL inexistente no par novo:4erros em2tentativas; rest permaneceu visível. Após restaurar URLs, destino2 manteve rest durante preparação e destino3 exibiu alce.
- Na reinspeção final, mudança de destino antes de a próxima arte ficar pronta manteve rest; destino seguinte selecionou o alce já decodificado. Sem quadro verde observado nas trocas inspecionadas.
- Random.92 e erros só no harness; removido do pacote. Contador cumulativo de Image não mede objetos vivos/heap. Limite atual+seguinte conferido na fonte/testes, sem forçar GC.

Sem aparelho físico, FPS/GC/heap medidos, gameplay de produção ou auditoria100fases. Por fase: tentativas, mortes, tempo, dificuldade e conclusão **não medidos**. Não alegada melhoria de fluidez ou caminhada animada. Nenhum dado dos jogadores alterado.

## Publicação

**Publicada1.0.153 / Sites156**, fonte `f130c8d99a17d10384b53b70305580cf1156b0a8`. Versão salva `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_0d95f080345c8191ae866c1089b6c1a8`, deployment `appgdep_6b0ac50bc9948191b70d6ab5ee61ab8f`, status **succeeded** em `2026-11-28T12:12:06.806533+00:00`. [Jogo público](https://lendariosdorei.com.br/) · [URL da plataforma](https://lendarios-do-rei.aquimeusite.chatgpt.site).

Chrome confirmou Ver.1.0.153 na home pública e a presença da nova notícia. Artes conferidas no preview e pacote; sem partida ou inspeção direta dos novos arquivos no domínio público.

Rollback de referência: Sites155 / fonte e475e8c2e1af44dbdd201f5e7bd7b5e43606572a, somente se não houver revisão posterior. Uma revisão no máximo neste ciclo, nenhuma publicação no Meu Pet. Sem mensagens a terceiros, force-push ou merge automático. Rotina existente preservada.

## Próximo

Validar em aparelho físico e continuar a investigação de renderização durante caminhada/combate. Próximas artes devem usar outro personagem existente, sem repetir o alce ou as cenas anteriores.


## Correção posterior solicitada pelo usuário — 28/11/2026

A identidade visual desta cena foi contestada por David. A imagem estática usada diferia do atlas ativo do bestiário. A cena forest-moose foi retirada da seleção na1.0.154 / Sites157 e substituída pela entrega do Alce das Neves no pool41–50. Este relatório permanece histórico, não representa o estado atual. Ver [correção](2026-11-28-snow-moose-correction.md).
