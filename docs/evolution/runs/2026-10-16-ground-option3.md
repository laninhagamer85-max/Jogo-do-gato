# Opção 3 aplicada à fonte — 16/10/2026, America/Sao_Paulo

David escolheu a terceira das três propostas e pediu preservar as opções 1 e 2 para uso futuro. Três imagens originais geradas nesta conversa: musgo suave, grama fina e musgo com grama. Guardadas em `client/public/forest-adventure/ground-proposals-20261016/`, com nomes, seleção e hashes no manifesto. WebP q93, 1254×1254; sem resize, edição de cor ou composição por script. PNGs originais permanecem nas imagens da conversa.

## Integração

Fonte atual do Site, aberta pelo helper oficial: `763edb8b72a2de65e7d2b7dc9a3858832e9af7fb`, produto 1.9.30, Sites 49. Somente textura do chão do piloto trocada pela opção 3 e identidade do cache atualizada. Escala 3,8, espaçamento 1,71, jitter 0,152, opacidade 0,68 e iluminação atuais preservados. Plantas, musgo decorativo, inimigos, controles, mapa, colisões e saves não alterados. As opções 1 e 2 ficam reservadas, não são carregadas pela sala.

Ramo de colaboração estava atrás do terreno da publicação; base GitHub `93a664bd2b5fc1660dcfb9e128703f4e83c7cf8c`. Revisão salva separadamente em `review/grass-option3-20261016`, sem sobrescrever esse ramo ou descartar ajustes pendentes de outros colaboradores. O renderer e ajustes de outras frentes do GitHub são preservados nesse ramo; testes aqui relatados usam a fonte exata do Site com a troca delimitada. Antes de publicar a partir do ramo, reconciliar novamente a fonte do Site e o HEAD; não usar um build antigo. Nenhum PR mesclado.

## Validação

TypeScript, build de produção e 222 testes offline em 30 arquivos aprovados na fonte do Site. Integração Firebase staging excluída por falta de credencial. Os três hashes das texturas no build correspondem ao manifesto. Aviso preexistente de chunks grandes mantido. Não foi executada partida, teste de conta, FPS ou inspeção real nos cinco viewports. Nenhuma conta/save de jogador lido ou alterado.

Navegador control-browser indisponível. Nenhum preview alternativo iniciado. Depois de informado desse limite, David pediu explicitamente “Públique para mim testar”, autorizando esta publicação para revisão no aparelho. Preparando produto 1.9.31; não alegar aceite visual nem medição de fluidez por testes offline. A confirmação final de publicação será registrada após o resultado do serviço.

Pesquisa consultada em 16/10/2026: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas — preservado pré-render/cache existente para evitar trabalho de textura por frame. Sem arte externa incorporada.

## Próximo passo

Comparar escala dos detalhes, emendas e repetição nos cinco viewports, visão geral e zoom durante caminhada; confirmar harmonia com a vegetação aprovada e fluidez. Preservar proporção da textura e as outras duas opções. Rollback: restaurar somente o caminho anterior do background e o id do material; nenhuma migração de saves necessária. Publicação e fonte atuais devem ser conferidas novamente antes de qualquer deploy.
