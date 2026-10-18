# 1.14.8 — correção das bordas e da composição da Aventura

Pedido: inspecionar o módulo publicado e corrigir erros. Reproduzidos na 1.14.7: borda reta do fundo em retrato; faixa escura no encontro de mundos em paisagem; gato atual parcialmente fora da lateral inicial em paisagem; legendas dos mascotes sobre números vizinhos.

Causa da borda: máscara radial aplicada à caixa 351×800px, mas imagem 16:9 contida em apenas ~197px centrais. A máscara não atinge o limite real da imagem. Correção: caixa da imagem com aspecto intrínseco 16:9 e máscara nas próprias bordas. Nunca esticar ou aplicar cover.

Faixa escura: máscara nas extremidades de cada retângulo de mundo revelava o fundo azul escuro. Substituída por um único gradiente de campanha com dez cores ordenadas pelas salas reais; nenhuma máscara no retângulo do mundo. A dessaturação de áreas bloqueadas permanece no cenário/piso. Paletas interpolam continuamente. Numeração, prêmios, âncoras e saves preservados. Personagem atual centralizado acima da fase em paisagem, mascotes compactos sem texto sobre fases adjacentes; nome continua nos detalhes da fase.

Pesquisa 18/10/2026: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image e https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit — separar caixa da imagem e área da máscara. Nenhum asset de terceiros incorporado.

TypeScript e testes de mapas executados. Build e inspeção posterior pendentes. Usuário autorizou publicação para teste no turno anterior; manter essa autorização e revisar a versão publicada sem nova confirmação rotineira. Prévia local suportada indisponível; não improvisar servidor. Não alegar teste físico/touch/FPS ou conclusão de fases. Rollback é 1.14.7/Sites73, fonte 1aa3ed665eb20b4ee27f38b7e1c86fe383afd303. Exploração não alterada.
