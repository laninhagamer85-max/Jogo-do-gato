# Gramado próximo da arte do capítulo 1 — 16/10/2026

David pediu verificar a incompatibilidade de cores da 1.9.21 e aproximar o piloto da Clareira dos Troncos. A inspeção do jogo publicado em paisagem confirmou chão oliva de textura fina contra folhagens mais claras, saturadas e pintadas. Não confundir a redução de saturação anterior com aceite de arte pelo usuário.

## Revisão 1.9.22

Base: Sites 40 / `3855e6697699dd2dd111cabf8a27e5b104087d95`; GitHub `1fdffde7d7a3c9448dce129f553d526a80832285`. Mesma identidade, domínio e público. Helper oficial reabriu a fonte atual, preservando os registros da publicação anterior. Credencial expirada foi renovada pelo conector para o mesmo Site.

Criada uma textura original pelo imagegen usando o arquivo **real** `client/public/forest-adventure/backgrounds/clearing.webp` como referência direta. Saída isolada de solo, não o background inteiro ampliado. Recupera os verdes luminosos e a linguagem de pinceladas/folhas da ilustração. `grass-chapter1-painted-v4.webp`, 1254×1254, WebP q92, sem filtros de cor, ampliação ou recorte. Prompt exato, origem e hash registrados em `grass-chapter1-painted-v4.json`.

Escala dos patches passou de 1.88–2.12 para 2.82–3.18 unidades, ampliando o traço pintado sem mudar a escala dos personagens e objetos. Passo e jitter cresceram na mesma proporção, preservando a cobertura opaca e a mistura. Cache LRU de 8 MP continua limitado a blocos e reutilizado durante a caminhada. No zoom máximo de telas com DPR alto pode haver reamostragem: a imagem tem 1254 pixels reais, não se declara uma textura 2K.

Preservados os grupos de borda, os insetos menores, os obstáculos, colisões, progressão, coleta, drops e controles da 1.9.21. Esta revisão não aplica ainda o combate a todas as salas do capítulo nem cria outros biomas.

## Verificação

Rodar TypeScript, testes pertinentes de grama/cobertura/cache/bioma e build do release. Teste novo mede cobertura opaca no material efetivamente enviado ao renderer, inclusive em coordenadas negativas. Os testes anteriores de cobertura em cinco dimensões, zoom e visão geral são matemáticos/Canvas simulado, não screenshots móveis.

Managed preview com control-browser permanece indisponível; nenhum servidor ou navegador alternativo instalado. Publicação para comparação no aparelho segue autorização persistente do usuário; não é aceite visual. A publicação pode ser inspecionada no navegador público já autenticado após sucesso. Não declarar fluidez, FPS, retrato ou equivalência perfeita de cor sem medição/observação correspondente.

Pesquisa técnica da revisão imediatamente anterior continua aplicável: https://factorio.com/blog/post/fff-219 e https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas, consultadas em 16/10/2026. Nenhuma arte desses jogos foi utilizada.

Próximo passo: comparar com a clareira original em retrato/paisagem, Ver sala e zoom de combate. Rollback conhecido: produto 1.9.21 / Sites 40; manter saves e não sobrescrever publicação posterior.

TypeScript, build e 33 testes pertinentes de terreno/cenário/bioma aprovados. A suíte de 211 testes offline da 1.9.21 não foi repetida integralmente nesta troca de arte. Nenhuma nova verificação de integração Firebase foi executada.

## Publicação

Produto 1.9.22 / Sites 41, implantação succeeded. Commit Sites `f2d17db2cae5adf7898b443a08a0a96e79a3a095`; código GitHub `4324394c548e95735083f17773c33c5fe6de744b`. Versão `appgprj_6ac40994d8d881919d46203a60801e46~appgver_34b5eb038b6081918cd8be9790820e30`, deployment `appgdep_6ad1b242ad7481919440ee149610f69b`. URL: https://meupet.aquimeusite.chatgpt.site. Primeiro pacote gzip estava incompleto; recusado pelo Sites sem implantação. Refeito com helper oficial em novo caminho, validado por leitura integral e hash idêntico da textura; segunda gravação aprovada. Aceite no aparelho pendente.

Após sucesso, recarregado o jogo e aberto Aventura → Exploração → sala piloto → Ver sala. A imagem em paisagem confirma o solo mais claro, as novas marcas pintadas, grupos de borda e os dois insetos menores preservados. A variação tonal ainda é perceptível em área grande: a semelhança estética e o grau de contraste dependem da comparação de David. Não declarar equivalência perfeita ao capítulo, aprovação de arte, retrato ou FPS.
