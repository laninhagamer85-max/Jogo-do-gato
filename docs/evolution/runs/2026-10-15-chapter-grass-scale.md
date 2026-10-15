# Fundo de capítulo, escala e sombra de coleta — 15/10/2026

Alvo produto 1.9.14. Base pública 1.9.13 / Sites 32, fonte 97161b49b816024781d963a579fe317864f6a9ca.

Referências inspecionadas: capturas Screenshot_20261015-122910_Meu Pet.png, Screenshot_20261015-145604_Meu Pet.png e Screenshot_20261015-145538_Meu Pet.png. David prefere o gramado pintado da primeira e considera grandes os elementos das outras duas. Direção adicional às 15:00: destaque de item pode ser apenas sombra leve.

Entrega: reutilizar backgrounds/clearing.webp original como camada única ancorada no mundo, enquadrada na área 14×10 da sala, com proporção preservada e suavização apenas nas bordas externas. Retirado gramado esparso novo do plano jogável. Fundo fora da sala é continuação de cor do chão; câmera segue sem imagem duplicada presa à tela. Cache da sala 1344×960, sem distribuir a textura por toda área de padding 34×38.

Reduções de arte: tronco principal 3.25 para 2.1 unidades de largura (~35%), pedras 2.3 para 1.4 (~39%); conjuntos decorativos do perímetro aproximadamente metade. Contenção uniforme de proporção mantida. Colisões do tronco reduzidas de 3 para 2 células e pedras de 2 para 1: os espaços liberados ficam transitáveis. Posições válidas/saves, XP, coleta e inimigos mantidos; proteção de reposicionamento continua disponível. Gato e controles preservados.

Itens: conforme preferência mais recente, removidos halo, círculo escuro e borda luminosa da 1.9.13. Agora há apenas sombra suave de contato, ícone e flutuação discreta (suprimida em reduzir movimentos). Nome/quantidade só ao aproximar. Não mudou raio de coleta nem dados do inventário.

Pesquisa técnica reaproveitada da consulta de 15/10/2026: MDN drawImage https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage (crop sem esticar), Canvas optimizing https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas (cache) e createRadialGradient https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient (sombra). Não há arte externa nova.

Verificação: 183 testes offline em 25 arquivos, incluindo recorte dentro da origem com proporção preservada e passagem nas células liberadas; verificações de drop/pouso/save e reduzir movimentos preservadas. TypeScript e build aprovados (aviso preexistente de chunk); entrada aprovada em 101 estados simulados e paridade aprovada com armazenamento fictício. Capturas do usuário são do estado anterior. Não há control-browser; nenhuma inspeção real da revisão, partida ou benchmark realizado. Publicação para revisão de David autorizada; aparência pendente em retrato/horizontal. Uma sala piloto, sem 60 salas ou 100 fases concluídas.

Publicação succeeded, produto 1.9.14 / Sites 33, https://meupet.aquimeusite.chatgpt.site em 15/10/2026 às 15:04:56 America/Sao_Paulo. Fonte Sites 1ba82a6d107fd2a45ef0ae488e5b5756f455558b; GitHub 894468514c842c95b2ec80a6b1eb4d9429b37909; deployment appgdep_6ad115b070588191984bcf0d274d3cf4. Rollback 1.9.13 / Sites 32. Próximo: David conferir escala, gramado e sombra no aparelho.
