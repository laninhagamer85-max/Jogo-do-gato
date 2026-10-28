# Meu Pet Virtual 1.52.2 — junções da sala40

A imagem do usuário confirmou dois defeitos: o redesenho do tabuleiro cobria personagens no terraço/apron fora da faixa antiga; a faixa física estreita não representava toda a pavimentação visível. O Empório também tinha o telhado sobre o acesso. A escada frontal destoava da câmera isométrica.

- Piso da ponte traçado pelo interior pavimentado, com bordas e patamares; três faixas de ida/volta mantêm altura1. Chão continua camada0, colunas sólidas. Saves antigos sem camada nas áreas novas permanecem no chão, salvo piso elevado/apron reconhecidos.
- Ordem de desenho considera todos os atores e construções elevados, inclusive nas duas junções. Empório da vila elevada movido para xcentro+4/ycentro+8, com footprint inteiro sobre o piso.
- Escada isométrica original stairs-isometric-v1.webp, RGBA1254², builtin imagegen, convertida WebP94/method6. Topo/base/polígono físico usam uma transformação uniforme. Apenas a escada do terraço medieval da40 muda de modelo. Manifesto adjacente registra origem,hash,prompt completo e âncoras. Imagem de referência: plateau-medieval-v1.webp; nenhuma arte externa incorporada.
- A ponte recebe gradação de cor sepia(.08),saturate(.65),hue-rotate(-18deg),brightness(1.03) tanto na base quanto nos recortes de oclusão, aproximando a pedra do castelo sem alterar arquitetura ou recortar sua arte.

## Verificação

TypeScript passou e build18.07s passou; aviso preexistente de chunks grandes. Suite client944/944 em96arquivos; depois9/9 específicos da ponte após nova asserção de ordem visual. Auditoria100/100 vilas31–40,63.425passos simulados, JSON em evidence/2026-10-28-junctions/village-audits.json. Testes incluem subida/descida de todas as escadas, apoio das construções, três faixas da ponte, colisão de pilares/minérios e preservação de save/lendário.

Chrome suportado: prévia da escada, chegada ao castelo (13.44,-5.91;bridgeLevel1), retorno ao terraço(-9.68,8.801489362;fora da faixa) e Soren visível nas junções. As travessias completas foram executadas pelo motor stepCombat em fixtures isoladas, não por um percurso manual contínuo de teclado. Nenhuma conta real alterada; sem telefone físico. Interface não mudou; verificações anteriores dos cinco formatos são mantidas, sem alegar nova inspeção física móvel.

Pesquisa técnica usada: MDN 2D collision detection https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection e propriedades de objetos Tiled https://docs.mapeditor.org/en/stable/manual/custom-properties/ (consultadas28/10/2026); colisão separada do visual e metadados de camada. Motor permanece Canvas/TypeScript.

## Revisão anterior1.52.1

Sites157, fonte7f9396934931b89cd0379ef62334a6cda483a3a2, deployment appgdep_6ae23a1e357c8191b6e2b7a405514016, succeeded. Corrigiu área frontal/lateral das colunas, colisão dos minérios31–40, aproximação para coleta e reposicionamento local de saves cobertos por obstáculos.942testes e100vilas/63.376passos passaram. Ajustou também simplificação de trilhas para verificar o raio real do jogador. Esses resultados e a evidência anterior foram preservados.

Rollback desta revisão: Sites157. Projeto, domínio, autenticação, saves e progresso existentes preservados.

## Publicação confirmada

Sites158, produto1.52.2, succeeded.
- Fonte Sites: 9773136628a96bc8409c29b71e59b4e5971fbac8
- GitHub código: 1fd31badecde26ac1e587fa0ff08d9c26c1765a8
- Versão: appgprj_6ac40994d8d881919d46203a60801e46~appgver_f474160d009c819180ed51c747c906be
- Deployment: appgdep_6ae2810f8b4881918e394a4991ba8334
- URL: https://meupet.aquimeusite.chatgpt.site
- No jogo público: ida ao castelo bridgeLevel1 e volta ao terraço confirmadas; escada inspecionada; sem erros de aplicação capturados no console público. Capturas bridge-castle,bridge-terrace e stairs no diretório de evidência.
