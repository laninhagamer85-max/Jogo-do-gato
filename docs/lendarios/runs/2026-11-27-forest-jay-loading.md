# 27/11/2026 — Gaio dos Troncos no carregamento

## Base e entrega

Site canônico Lendários do Rei, produto **1.0.151 / Sites 154**, fonte publicada `a53ec16f1ae0d944bcd9855d133527a1c97f998b`. Deployment `appgdep_6b08fbf96a588191b5afc8109f16d1f6` confirmado succeeded em 27/11/2026 03:42:04 UTC. HEAD aberto pelo helper coincidia com a publicação. O relatório GitHub ainda indicava 1.0.147/Sites150: a fonte atual prevaleceu, preservando as correções posteriores de primeiro acesso, sincronização, coleta/salvamento periódico e entrada de salas sem depender da arte de espera.

Lidos AGENTS.md, README, README da aplicação, retomada histórica, estado e último relatório. A cópia executor da orientação de evolução não estava disponível; foi lida a cópia cloud atual e suas referências. Sem alteração da orientação ou da rotina.

Nova cena original **forest-jay** do Gaio dos Troncos, sozinho na grama de uma clareira ensolarada, asas dobradas e pés apoiados. Identidade conferida em explorationFauna.ts (birds[0], faunaArt:0) e no asset atual `forest-adventure/fauna/animal-0.webp`: plumagem castanha/dourada, face e garganta claras, linha escura junto ao olho, bico curto cinza-escuro, faixas azuis e pretas na asa e cauda castanha. Não foi confundido com variantes Batedor/Vigia/Real ou com o Martim-pescador.

Arte original produzida pela ferramenta integrada, usando o sprite como referência de identidade e a tela atual como referência de estilo. Nova composição de clareira com árvores ao fundo, trevos e galho distante; sem lago, personagens adicionais, texto, relógio ou interface pintada. Nenhum asset externo incorporado.

## Código e arquivos

- `client/public/lendarios/loading/forest-jay-landscape-v1.webp`: 1439×810, **153852 bytes**.
- `client/public/lendarios/loading/forest-jay-portrait-v1.webp`: 810×1439, **129964 bytes**.
- Total **283816 bytes (~277,2 KiB)**, WebP qualidade86 e redimensionamento proporcional. RGBA teórico do par: ~8,89 MiB, sem medição real do heap.
- Nova entrada antes de tide-master em loadingScenes.ts, notícia em lendariosNews.ts e package.json **1.0.152**.
- Fonte enviada: `e475e8c2e1af44dbdd201f5e7bd7b5e43606572a`.
- Patch e cópias das duas imagens preservados no GitHub em `docs/lendarios/reviews/2026-11-27/`, commit `b92fc745bc212c1cad3aa2ee1a320a514e63f4df`.

O gerenciador de carregamento não foi alterado: download/decode antecipados, fila única, retenção dos pares atual/seguinte e permanência da imagem atual quando a próxima falha ou está pendente. A separação entre ilustração e recursos obrigatórios da sala, introduzida na1.0.149, foi preservada. Pausa da simulação e mínimo de1000ms após dois frames mantidos por fonte/contrato, sem novo playtest para observar a pausa em gameplay.

## Pesquisa — 27/11/2026

Fontes primárias abertas:
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — seleção somente após decode e tratamento de rejeição, evitando imagem vazia.
- https://web.dev/learn/design/picture-element — composições específicas por orientação no picture existente.

Nenhuma dependência ou lockfile atualizado.

## Verificação

**26/26 testes em5arquivos**: loadingScenes, preparedLoadingScenes, loadingSceneLifecycle, loadingReveal e gameAssetLoading. Incluem300 transições simuladas, erro, timeout/rejeição e cancelamento do reveal. TypeScript do jogo e host aprovados. Build oficial Worker aprovado, **604 arquivos preservados verificados byte a byte**. Pacote sem harness QA; manifest preserva mesmo projeto, D1 DB eR2 null.

Chrome no preview oficial, componente GameLoadingScreen e gerenciador reais em harness isolado, sem login ou saves:
- 375×667,375×812,390×844,844×390 e1366×768 inspecionados: pássaro inteiro, bico/cauda/pés visíveis, área inferior livre para progresso, sem distorção.
- Picture selecionou portrait810×1439 em retrato e landscape1439×810 em paisagem.
- Sequência observada: **rest → forest-jay → river-guardian → forest-jay**, com retorno após aquecimento do cache. Não foram medidos bytes transferidos do cache.
- Oito acionamentos de progresso20→100%, sem trocar a cena ou preparar novas imagens;contador acumulado de Image permaneceu6.
- Falha induzida só no harness por URL inexistente no par novo:4erros em2tentativas. Rest permaneceu completo e visível.
- Após restaurar os URLs, destino2 manteve rest durante preparação e destino3 exibiu forest-jay. Sem quadro verde observado nessas trocas.
- Random .9 e falhas somente no harness, removido antes do pacote. Contador de criação de Image não mede objetos vivos/heap;retenção limitada verificada pela fonte e testes, sem forçar GC.

Sem aparelho físico, FPS/GC/heap medidos, partida de produção ou auditoria100fases. Tentativas, mortes, tempo, dificuldade e conclusão por fase: **não medidos**, pois esta entrega não executou fases nem alterou gameplay. Não alegada melhoria de fluidez. Não foram repetidos testes de conta/salvamento;seus arquivos não foram alterados.

## Prompts e produção

Paisagem16:9: Gaio dos Troncos da referência atual, sozinho e calmo na grama, asas dobradas com faixas azul-preto, plumagem castanha, garganta clara, pés e cauda inteiros, clareira ensolarada com árvores/trevos/galho ao longe, estilo pintado infantil2D. Parte inferior30% reservada ao progresso real e topo esquerdo livre para logo real;sem texto/UI/relógio/marca.
Retrato9:16: recomposição natural da mesma identidade e pose, corpo inteiro central com margens laterais para telas altas, topo25% e parte inferior30% livres;sem esticar nem apenas cortar a paisagem. Resultado final conferido no navegador.

## Publicação

**Publicada 1.0.152, Sites 155**. Versão salva `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_39fd103ad7fc8191bedfc22c23034277`, deployment `appgdep_6b0971c52a6c81918dcb9c399fa25b61`, status **succeeded** em `2026-11-27T12:04:32.369624+00:00`. [Jogo público](https://lendariosdorei.com.br/) · [URL da plataforma](https://lendarios-do-rei.aquimeusite.chatgpt.site).

Chrome confirmou Ver.1.0.152 e a notícia “O Gaio dos Troncos descansa na clareira” na home pública. Uma única revisão publicada. As artes foram inspecionadas no preview e verificadas no pacote;sem partida ou inspeção direta dos arquivos novos no domínio de produção. Nenhuma publicação no Meu Pet ou mudança de domínio, acesso, contas ou dados dos jogadores. Sem mensagens a terceiros, merge automático ou force-push;rotina existente preservada.

Rollback de referência: Sites154/fontea53ec16f1ae0d944bcd9855d133527a1c97f998b, somente se não houver revisão posterior.

## Próximo

Validar em aparelho físico;continuar a investigação separada de renderização durante caminhada/combate e novas cenas sem repetir personagens já representados.
