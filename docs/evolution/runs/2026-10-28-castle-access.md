# Castelo: entrada ligada à ponte, passeio externo e fonte ilustrada

28/10/2026 · America/Sao_Paulo · produto1.51.0 · Estado: publicado, Sites155, status succeeded.

## Evidência e causa

Captura do usuário Screenshot_20261028-111524_Meu Pet.png: marcação vermelha na entrada sobre um pilar de rocha, azul indicando passeios/terreno inacessíveis e árvores projetadas sobre torres. A versão1.50.0 bloqueava um grande retângulo dentro do PNG e desenhava árvores procedurais depois do castelo. A ponte descia artificialmente para altura0 antes da entrada elevada; isso não correspondia ao pavimento da arte. O símbolo geométrico da praça não foi aceito pelo usuário.

Base recuperada pelo helper oficial:3a50530ffbfe0c3f6f590cbc491d4eb4df23725a. GitHub:d513011c029d1434b824f3c227dd399018058827, incluindo a revisão independente dos saves, preservada. Site existente público, produto1.50.0/Sites154. Nenhum AGENTS.md no checkout.

## Implementação

- Castelo v2 original: mesma arquitetura e escala30, entrada sudoeste refeita como patamar de pedra apoiado, sem pilar vertical interrompendo o acesso. Passeio pavimentado contínuo do lado esquerdo, pela frente e pelo lado direito, com escada leste para o chão. Árvores embutidas removidas da nova arte.
- Âncora real do pavimento(.17,.76) posicionada em(13.44,-5.91), preservando a ponte aprovada. Transformação uniforme; sem esticar x/y. Ponte, patamar e passeio na mesma altura1.
- Colisão usa polígonos separados para ilha/rocha, passeio e escada. Margens transparentes e torres projetadas não formam uma parede retangular no solo. Faces verticais e muralhas continuam bloqueadas. Limites do passeio conferidos contra a arte, incluindo a face frontal do patamar e o rochedo direito.
- Clareira de proteção exclui árvores, adereços e depósitos gerados na silhueta do castelo. Ordem de desenho permite a ponte sobrepor corretamente a face de apoio do patamar. A arte oculta personagens no terreno atrás das torres, mas não os do chão frontal ou do passeio.
- Removido módulo vetorial explorationCityView, medallion/estrela e detalhes vetoriais da fachada. Fonte de pedra e água azul em arte original substitui o poço ao evoluir para Cidade. Ponto do poço centralizado nas vilas do capítulo4, com mesmo ID e colisão existentes; rotas livres ao redor. Não altera economia, requisitos de evolução nem população.
- Fixtures isoladas adicionais para passeio esquerdo/direito, terreno traseiro e chão frontal; sem gravação na conta.
- Arte, hashes, âncoras e dimensões registrados em castle-promenade-v2-manifest.json. Originais gerados por imagegen, sem pixels externos. RGBA1254×1254→WebP qualidade94; sem redimensionamento ou edição de pixels posterior.

## Verificação

- Suíte completa925/925 testes,92 arquivos, antes do refinamento final dos limites do passeio. Após refinamento:44 testes pertinentes/4 arquivos aprovados.
- Testes reais de moveCombatPoint: terraço→ponte→portão→passeios esquerdo/frontal/direito→retorno; camp→escada leste→passeio→descida→camp. Raio.22 e passos.06. Também conferidos paredes/cliff bloqueados, transparência livre, ausência de árvores/recursos sobre castelo, circulação da fonte e save de Soren/XP/inventário.
- Auditoria de100 vilas por motor real nas salas31–40, resultado individual em ../evidence/2026-10-28-castle/village-audits.json. Não é percurso manual por100 vilas.
- Chrome suportado: encaixe visual ponte/patamar; Soren nos dois passeios e grama atrás do castelo; fonte na cidade39. Caminhada real pelo direcional observada no passeio esquerdo, de(11.94,-10.845) para(12.536176,-10.440941). Um comando de teclado em direção ao limite foi corretamente contido; não foi contado como passeio completo.
- Viewports375×667,375×812,390×844,844×390,1366×768; joystick inteiramente dentro. Iframe de teste; sem teste em aparelho físico. FPS e campanha completa não medidos.
- TypeScript aprovado. Build final e publicação serão registrados abaixo. Mantido aviso preexistente de bundle grande.

## Pesquisa aplicada

Consultada28/10/2026: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection — áreas de colisão separadas da imagem; https://docs.mapeditor.org/en/stable/manual/objects/ — polígonos para superfícies e pontos de conexão explícitos. Não alterado motor nem introduzida dependência.

## Publicação/rollback

Mesmo projeto appgprj_6ac40994d8d881919d46203a60801e46 e público existente. Rollback conhecido:Sites154, fontec29de72245189a24cbc61e1c9fc6cab82db2018a, versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_afaaccf8348081919fbe96f17c2e2132. IDs finais serão registrados após sucesso; sem segunda implantação por documentação.


## Resultado publicado

- GitHub código: 74df49ac7d301be361b0cfe724fd622fddac2701.
- Fonte Sites: 0408aeebba5521f1200937b4d403ed2229f9728c.
- Versão Sites155: appgprj_6ac40994d8d881919d46203a60801e46~appgver_3ed219df85908191bf5bd28bf82aa64b.
- Deployment: appgdep_6ae20bd95e98819181feb3f791b971af — succeeded.
- URL: https://meupet.aquimeusite.chatgpt.site
- Typecheck final aprovado; build oficial final23,04s.
- Repetidas100 auditorias pela interface pública:10/10 em cada sala31–40; evidência public-audits.json.
- Capturas reais da publicação em ../evidence/2026-10-28-castle/castle-public.jpg e fountain-public.jpg. Sem erros do aplicativo no console observado.
- Documentação/evidências salvas após sucesso, sem nova implantação.
