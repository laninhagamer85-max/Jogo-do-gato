# Clareira natural e insetos menores — 16/10/2026

## Pedido e base

David reprovou a artificialidade do gramado e a sequência regular de pedras/flores nas bordas da 1.9.20. Pediu insetos um pouco menores e confirmou que o piloto será a base visual do capítulo 1. Cada capítulo deve ter seu bioma, insetos, desafios, dificuldade por sala, drops e desbloqueios de cartas/acessórios.

Base pública observada: produto 1.9.20, Sites 39, commit `e7924f17c689d3c33f021b799fdef056a9d80b69`. GitHub colaboração `38136dec5a85837aaaa080fb9275e1d19c4a1c40`. O helper oficial abriu a fonte exata do Site. Não há AGENTS.md no checkout. A inspeção real da produção em navegador cloud confirmou borda alternada e grama saturada em paisagem. O navegador conseguiu renderizar a sala Canvas de exploração depois da apresentação; o aviso WebGL afeta a Minha Casa 3D.

## Revisão 1.9.21

- Nova arte original de grama pintada, em verde mais discreto, sem alterar a imagem por filtros. PNG gerado 1254×1254, convertido em WebP q92 sem recorte, ampliação ou recoloração. Origem, prompt e hash em `docs/evolution/grass-woodland-soft-v3.json`. Referência de direção: `backgrounds/clearing.webp`, não esticada como mapa.
- Bordas compostas por 17 grupos de samambaias, jardins de pedra, flores e madeira. Posições, escalas, profundidades, espaços e sobreposições definidos no mundo. Sem alternância uniforme e sem alterar o layout ao girar a tela. Bases de pedras/troncos decorativos ficam fora da área caminhável; os cinco obstáculos internos preservam sua geometria compartilhada. Grupos são reutilizáveis; isto não cria outros biomas.
- Lagarta e besouro passaram de .82 para .64 unidades de largura (cerca de 22% menores), com proporções da arte preservadas, sombras/barras ajustadas e pés apoiados. Raio de movimento .17, parada de aproximação .55 e alcance de contato .82; a tolerância do ataque do pet foi preservada. Não alterados HP, XP, taxa de drop, inventário ou quantidade de inimigos neste piloto.
- Cache LRU de chão e orçamento de 8 MP preservados; sem processamento de textura por frame, sem reintegrar lago/trilha reprovados.
- Direção de campanha registrada em `exploration-campaign-plan.json`: bioma por capítulo, encontros/drops/desafios por sala, níveis e quantidades graduais, desbloqueios explícitos e playtest. As 60 salas permanecem planejadas; nenhuma sala adicional, espécie ou tabela nova de drops é declarada pronta.

## Verificações e limites

TypeScript e build aprovados. 211 testes offline aprovados em 29 arquivos. A integração Firebase de staging falhou por ausência de credencial; não é um teste de arte nem uma regressão demonstrada. A execução offline final exclui explicitamente `server/auth/firebaseAdmin.integration.test.ts`. Novos testes cobrem geometria/objetivos das bordas, renderização real chamada para os dois sprites menores com proporções e apoio preservados, alcance de dano e passagem junto ao tronco com o raio menor. Saves fictícios, caminhos, coleta e recompensas continuam cobertos pelos testes anteriores.

O build novo não foi observado no navegador antes da publicação. `control-browser` está indisponível: não iniciado servidor alternativo de preview ou instalado navegador. Publicação para revisão de David no aparelho segue sua autorização persistente de testar as revisões visuais depois da publicação. Não alegar aceite visual, FPS medido, teste em retrato ou conclusão de salas por causa dos testes offline. O navegador público já aberto pode conferir a publicação após sucesso, mas não substitui o aparelho do usuário.

## Pesquisa aplicada

Fontes primárias consultadas em 16/10/2026:

- https://factorio.com/blog/post/fff-219 — diversidade em escalas diferentes e detalhes sobrepostos para romper a grade. Aplicação: grupos com função e intervalos irregulares, preservando rotas. Não incorporada arte do jogo.
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas — pré-renderização de operações repetidas e custo de escalas. Aplicação: preservado o cache existente em blocos, culling de props e orçamento limitado; nova composição não redesenha o terreno inteiro ao caminhar.

## Revisão no aparelho

Conferir Aventura → Exploração → Sala piloto: combate e coleta; gramado perto/longe, Ver sala, quatro bordas, retrato/paisagem, ida e volta, coleta e combate. Aceitar a base visual antes de implementar as dez salas distintas do capítulo 1. Rollback conhecido: 1.9.20 / Sites 39; preservar os saves e não sobrescrever uma publicação posterior.
