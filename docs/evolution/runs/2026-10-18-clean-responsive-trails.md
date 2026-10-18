# 1.14.2 — mapas mais limpos e orientação responsiva

Estado: implementado, aguardando validação visual; produção permanece 1.14.1.

## Problema e mudança
Os dois screenshots fornecidos por David mostram textura de pedra muito contrastante, imagem de fundo ampliada e painéis ocultando as fases. Restaurada progressão para a direita na paisagem; retrato continua para cima. A orientação é a do dispositivo, não a proporção restante depois de descontar painéis. IDs, saves, estrelas, desbloqueios, NPCs e prêmios preservados.

Substituída a faixa rasterizada larga por marcas de passagem pontilhadas, finas e sem ruído/filtros. Fundo recomposto em três vinhetas proporcionais por capítulo, com `object-fit: contain` e bordas atenuadas sobre cor-base. Essa composição reutiliza a arte existente, sem ampliar uma ilustração para cobrir 1440px. As vinhetas repetem a ilustração do bioma; não são novos desenhos exclusivos. Nome de capítulo e seleção saem da área rolável; retorno ao progresso compacto. NPCs de mapa ligeiramente menores.

## Pesquisa utilizada (consultada em 2026-10-18)
- https://kleeam.artstation.com/projects/L3lDBv — relato do artista de Candy Crush: composição por regiões, cores e marcos visuais. Somente inspiração; nenhuma arte de terceiros incorporada.
- https://whimsygames.co/portfolio/ui_ux-design-stylization/ — portfólio do estúdio: hierarquia entre percurso, cenário, nós e recompensas. Somente inspiração.
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit — `contain` preserva a proporção e toda a imagem, evitando o recorte de `cover`.

## Verificação
TypeScript passou. 432 testes offline em 42 arquivos passaram, incluindo geometria de 20 salas em cinco tamanhos, estabilidade ao expandir capítulos, orientação explícita mesmo com mapa retrato curto, numeração/recompensas de 100 fases e estado sem mutação. Uma execução inicial incluiu a integração Firebase e falhou por ausência da credencial de staging; a execução offline excluiu explicitamente testes de integração.

Build passou com aviso já existente de chunks grandes. Nenhuma fase jogada neste ciclo. Sem teste visual de navegador ou medição de FPS. Não chamar SSR/checagem matemática de teste visual. Conforme a skill de evolução, não publicar até a inspeção real em navegador suportado.

Rollback: produção 1.14.1, Sites 67, commit 26a8ca219529a6f6f0883cf60f70c637eff57979; nenhum deploy neste ciclo. GitHub base b050d558d03a0e55440e53098329c443bf39dba4, ramo review/grass-option3-20261016. Não restaurar produção antiga sobre trabalho posterior de outro colaborador.
