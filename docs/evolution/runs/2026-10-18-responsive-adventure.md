# Aventura1.15.2 — enquadramento e orientação

Pedido: reduzir zoom aparente no celular vertical e orientar cenário/progressão horizontal para a direita. Inspeção cloud da1.15.1 confirmou mundo1158px para viewport793px e orientação is-vertical em paisagem. A mesma largura fixa recortava a maior parte da arte em retrato.

Mudança: dois atlas originais com dez mundos cada, gerados com imagegen a partir da arte anterior como referência de estilo. Retrato: painéis2:3, encaixados integralmente na largura disponível, rolagem somente vertical. Paisagem: painéis panorâmicos40:9, encaixados na altura disponível, rolagem somente horizontal; objetos e prédios permanecem em pé. Trilhas de pegadas e100 botões calculados nas mesmas coordenadas dos painéis, fases preservadas. Bordas têm sobreposição e máscara de transição. Cabeçalho de entrada compacto no retrato.

Assets: client/public/manus-storage/adventure-worlds-portrait-v2.webp (1619×971,5colunas×2linhas), adventure-worlds-landscape-v2.webp (1672×941,2colunas×5linhas). Os atlas não possuem números ou status. Arte8 contém biblioteca e elementos de observatório, em continuidade com a referência; não altera os cenários jogáveis.

Prompt base (built-in imagegen): original colorful painterly casual adventure map, cozy cat home, flower greenhouse, fish market, sunny rooftops, seashell beach, woodland, snowy cabin, magical library, star observatory, cat festival. Portrait atlas5×2, each cell full2:3 world, path bottom-to-top with S curves. Landscape atlas2×5, upright scenery with left-to-right winding path. No UI, letters, numbers, locks, stars or characters. Arquitetura horizontal nunca é obtida girando a arte vertical.

Pesquisa18/10/2026: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio (painel inteiro sem crop); https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/orientation (verificação de formato; navegação também responde ao resize medido). Referências técnicas, não assets incorporados.

Verificação: TypeScript e24 testes dos mapas passaram antes do ajuste final de máscara; verificação final em andamento. Preview local não disponível; usuário autoriza publicação para teste e QA cloud após publicar. Sem alteração de contas, saves, Exploração ou física. Não equivale a jogar100fases. Rollback: produto1.15.1/Sites77, fontec6e46e41fdab4443976ca4a573fc332ea1c890b0.
