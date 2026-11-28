# 28/11/2026 — Correção solicitada: Alce das Neves nas salas41–50

## Base e identidade

Pedido direto de David após a publicação1.0.153: conferir o alce no bestiário e criar o das Neves para as salas correspondentes. Fonte atual aberta pelo helper: `f130c8d99a17d10384b53b70305580cf1156b0a8`, produto1.0.153 / Sites156, HEAD publicado sem revisão intermediária.

A inspeção real do [bestiário público](https://lendariosdorei.com.br/bestiario/) confirmou corpo esguio, pintas claras e galhadas ramificadas. O alce robusto da cena anterior não correspondia à arte atual animada. A fonte estática animal-4 usada anteriormente diverge do atlas motion-4-v2 usado pelo bestiário. A conferência somente de metadados e imagem estática foi insuficiente; a referência canônica agora é a arte efetivamente renderizada.

Consultada a fonte publicada com explorationBestiary() e creaturePortrait(): Alce das Folhas nas salas21–30; Alce das Neves, mãe e filhote nas41–50. Índices internos40–49 correspondem às salas visíveis41–50. Referência desta entrega: `client/public/forest-adventure/chapter5/winter-hostile-6.webp`, exatamente o retrato atual do Alce das Neves adulto: pelagem castanha com pintas brancas, peito claro, pernas finas, neve no dorso e galhadas ramificadas.

## Entrega

- Nova arte original do alce correto sozinho, calmo e apoiado no chão, em clareira com grama/neve e pinheiros ao fundo.
- Paisagem1439×810: `client/public/lendarios/loading/snow-moose-landscape-v1.webp`, **197142bytes**.
- Retrato810×1439: `client/public/lendarios/loading/snow-moose-portrait-v1.webp`, **178964bytes**.
- Total **376106bytes (~367,3KiB)**, WebP qualidade86 e thumbnail proporcional; sem esticar ou cortar personagem. ParRGBA teórico~8,89MiB, não heap medido.
- Nova entrada **snow-moose** no pool de inverno, exclusivamente para destinos internos40–49. Participa da alternância com as duas cenas de gelo existentes, não aparece em todas as transições obrigatoriamente.
- Entrada forest-moose retirada do pool geral e notícia anterior substituída por informação correta. Arquivos antigos sem referência preservados para recuperação; não usados na alternância.
-12casos novos de teste:10salas do intervalo e limites externos39/50 (salas40/51).
- Produto **1.0.154**, notícia atualizada, sem mudança de save, login, acesso, domínio, física ou atores do jogo.
- Fonte enviada **afa2b751946dc28d59a7a9eba4392e51b811a186**.
- Patch e novas artes em docs/lendarios/reviews/2026-11-28/, commit **61deb85d5ae6610409435f4a7c069f68d566dd8a**.

Mantidos download/decode antecipados, preparação única, retenção dos pares atual e seguinte e fallback atual em falha/pendência. Ao mudar de bioma sem a próxima imagem pronta, a anterior pode permanecer temporariamente; não se substitui por quadro vazio. Preservadas pausa da simulação e exposição mínima1000ms após dois frames, verificadas por fonte e testes, não por nova partida.

## Produção das imagens

Ferramenta integrada de geração, sem material externo. Referência de personagem: winter-hostile-6.webp; referência de estilo: geada-portal-landscape-v2.webp, sem copiar heróis/portal. Prompt-base: alce esguio com pintas e neve exatamente como referência, sozinho em grama com neve, floresta invernal ao fundo, pintado2D infantil, corpo inteiro, espaço para marca real e progresso real, sem texto/interface/relógio/mais personagens.

Paisagem foi recomposta para reduzir o alce e terminar os cascos perto de62% da altura, liberando o painel inferior em844×390. Retrato foi recomposto naturalmente9:16, mantendo galhadas e patas inteiras. Nenhuma imagem gerada representa caminhada animada.

O ambiente ficou sem espaço durante instalação e a primeira cópia gerada ficou vazia. Os bytes íntegros retornados pela ferramenta foram recuperados; imagens abertas/convertidas com sucesso antes do build. Removidos somente outputs/dependências recriáveis e checkouts antigos comprovadamente limpos e já publicados, preservando o código atual. Instalações e build retomados sem atualizar dependências.

## Pesquisa — 28/11/2026

- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — imagem pronta antes da seleção e tratamento de rejeição.
- https://web.dev/learn/design/picture-element — composição própria por orientação no picture já existente.
- Bestiário público atual e fonte exata publicada como referência de identidade, em vez de arquivos históricos isolados.

## Verificação

**38/38 testes em5arquivos**: loadingScenes, preparedLoadingScenes, loadingSceneLifecycle, loadingReveal e gameAssetLoading. Incluem300transições simuladas e12novos casos do intervalo de inverno. TypeScript do jogo e host aprovados. Build oficial Worker aprovado: **608arquivos preservados verificados byte a byte**; pacote705entradas sem harness QA; mesmo manifestprojeto/D1DB/R2null. Git limpo após helper.

Chrome no preview oficial, GameLoadingScreen e gerenciador reais em harness isolado, sem conta ou saves:
-375×667,375×812,390×844,844×390,1366×768: personagem inteiro, galhadas/cascos visíveis e painel livre; portrait810×1439 e landscape1439×810 selecionados por orientação.
-Entrada de destino41 manteve rest enquanto preparava; destino42 exibiu snow-moose,43 geada-portal,50 snow-moose após aquecimento.
-Oito acionamentos de progresso20→100% mantiveram cena e contador acumulado de Image7, sem novas preparações.
-Mudança para51 manteve temporariamente a atual enquanto preparava pool geral, conforme fallback existente; limites de seleção fora do inverno aprovados por testes.
-Quatro erros de imagem induzidos em2tentativas do par snow-moose por URL inexistente apenas no harness; rest permaneceu completo. Restaurados URLs,43 preparou e49 exibiu alce novamente.
-Sem quadro verde observado nas trocas inspecionadas. Contador cumulativo não é quantidade viva de imagens; sem bytes de cache, GC, heap ou FPS medidos.

Sem aparelho físico, gameplay de produção ou auditoria100fases. Tentativas, mortes, duração, dificuldade e conclusão por fase não medidos; o harness valida carregamento, não playtest de salas. Conta/saves não foram alterados ou usados para desbloquear conteúdo.

## Publicação

**Publicada1.0.154 / Sites157**, fonte `afa2b751946dc28d59a7a9eba4392e51b811a186`. Versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_f00984dc937881919e69424c595b35da`; deployment `appgdep_6b0ae44ff6688191abc36b83fa34f435`; status **succeeded** em `2026-11-28T14:25:39.718808+00:00`.

[Jogo público](https://lendariosdorei.com.br/) · [URL da plataforma](https://lendarios-do-rei.aquimeusite.chatgpt.site). Chrome confirmou Ver.1.0.154 e a notícia do Alce das Neves na home pública. Arte inspecionada no preview e verificada no pacote, sem partida de produção.

Rollback de referência Sites156/fontef130c8d99a17d10384b53b70305580cf1156b0a8, somente sem revisão posterior. Correção adicional solicitada diretamente pelo usuário após o ciclo anterior; não é reexecução ou deploy duplicado do ciclo já concluído. Nenhuma mudança no Meu Pet.

## Próxima ação

Conferir experiência em aparelho físico. Antes de novas cenas, confrontar nome, salas e arte efetivamente renderizada no bestiário/engine; evitar usar versões estáticas antigas como identidade sem verificar o atlas ativo.
