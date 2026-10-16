# Gramado escolhido — opção 4 — 15/10/2026

David escolheu **“Aplique a opção 4”** após comparar quatro imagens. Aplicada a grama com musgo delicado na sala piloto de combate da Exploração, produto **1.9.19**. Escopo desta entrega: textura, chave de material/cor de contingência e número de versão. Não inclui o novo conjunto de árvores nem mudança nas salas de charadas dos capítulos 1–3.

## Origem e mudança

Site confirmado público na versão 37 / produto 1.9.18. Fonte exata recuperada pelo helper oficial em `4682bcb15fb760ee81ec1a8b44c5662f926f7b6f`; GitHub base `7d873b5450fac84c17a8466e76a04f44e3a2761f`. README, retomada histórica e estado corrente de colaboração lidos; nenhum AGENTS.md encontrado no checkout. Dependências reinstaladas do lockfile sem mudanças de dependências.

A imagem escolhida é a quarta prévia original criada com imagegen, `exec-69512618-e5a3-44ae-acf4-76c4ac31e0bc.png`, 1254×1254, SHA256 do original `364940809d41d20359c4bbc0b9ffcc0e4f6a6c7b8053fbdf4fdf13d758a1c921`. Não foi gerada outra versão para substituir a escolha. A mesma imagem foi apenas codificada em WebP qualidade 90, sem redimensionar, recortar, retocar ou mudar cores por código.

Asset publicado: `client/public/forest-adventure/grass-moss-option4-v1.webp`, 629016 bytes, SHA256 `dabb9d6bfecf1f3ff0149d450380fc9267f043d518fa44af47ccf77a1382d356`. Proveniência e prompt em `docs/evolution/grass-option4.json`.

`ExplorationCombatPilot.tsx` carrega o novo asset; `explorationScenery.ts` atualiza o ID/cor de contingência. Conservados o tamanho em unidades do mundo, parâmetros de mistura e cache LRU em blocos de 384 pixels da 1.9.18. Não ampliada a textura sobre todo o mapa. Controles, câmera/zoom, pet, itens, regras de combate e saves não recebem mudanças de lógica. A versão 1.9.18 permanece disponível para rollback.

## Verificação e limites

Arte escolhida inspecionada estaticamente. TypeScript e **22 testes existentes de terreno/cenário em dois arquivos aprovados**, incluindo cache, limite de memória, cobertura matemática dos cinco formatos e proporções dos props. `git diff --check` aprovado. Build final pelo helper oficial antes de empacotar. Suíte completa de 202 testes da 1.9.18 não foi repetida; não é apresentada como nova execução desta entrega.

Navegador `control-browser` indisponível em ambiente managed-linux. Nenhum preview foi iniciado nem navegador alternativo instalado. Não houve inspeção do jogo em execução, playtest ou medição de FPS. Aprovação da imagem de referência não comprova sua composição no jogo; publicar para revisão de David segue a autorização anterior de teste no aparelho e o pedido atual de aplicação. Registrar status/IDs apenas após retorno do deploy oficial.

## Próxima revisão

David: conferir a grama escolhida em retrato/paisagem, zoom 1–2 e Ver sala; caminhar e voltar pelo mesmo percurso para observar emendas, repetição e fluidez. Corrigir conforme evidências antes de expandir a composição do bioma para outros capítulos. A vegetação nova e a construção das dez salas por capítulo continuam pendentes.
