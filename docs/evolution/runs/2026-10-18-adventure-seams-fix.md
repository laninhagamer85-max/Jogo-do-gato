# 1.14.8 — correção das bordas e da composição da Aventura

Pedido: inspecionar o módulo publicado e corrigir erros. Reproduzidos na 1.14.7: borda reta do fundo em retrato; faixa escura no encontro de mundos em paisagem; gato atual parcialmente fora da lateral inicial em paisagem; legendas dos mascotes sobre números vizinhos.

Causa da borda: máscara radial aplicada à caixa 351×800px, mas imagem 16:9 contida em apenas ~197px centrais. A máscara não atinge o limite real da imagem. Correção: caixa da imagem com aspecto intrínseco 16:9 e máscara nas próprias bordas. Nunca esticar ou aplicar cover.

Faixa escura: máscara nas extremidades de cada retângulo de mundo revelava o fundo azul escuro. Substituída por um único gradiente de campanha com dez cores ordenadas pelas salas reais; nenhuma máscara no retângulo do mundo. A dessaturação de áreas bloqueadas permanece no cenário/piso. Paletas interpolam continuamente. Numeração, prêmios, âncoras e saves preservados. Personagem atual centralizado acima da fase em paisagem, mascotes compactos sem texto sobre fases adjacentes; nome continua nos detalhes da fase.

Pesquisa 18/10/2026: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image e https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit — separar caixa da imagem e área da máscara. Nenhum asset de terceiros incorporado.

TypeScript e testes de mapas executados. Build e inspeção posterior pendentes. Usuário autorizou publicação para teste no turno anterior; manter essa autorização e revisar a versão publicada sem nova confirmação rotineira. Prévia local suportada indisponível; não improvisar servidor. Não alegar teste físico/touch/FPS ou conclusão de fases. Rollback é 1.14.7/Sites73, fonte 1aa3ed665eb20b4ee27f38b7e1c86fe383afd303. Exploração não alterada.

## Resultado
TypeScript,21testes de mapas/3arquivos e build passaram. Primeiro arquivo de upload recusado como inválido/incompleto; reempacotado com helper oficial, gzip -t e SHA256 conferidos; source permaneceu d90bb3a14f00f34b891c61c9ec63d3c789272d47. Salva Sites74 e publicada 1.14.8: appgprj_6ac40994d8d881919d46203a60801e46~appgver_8768f9eb29b481919f2675fc5891928a, deployment appgdep_6ad4be8a9c148191b4e3b7a40bb166f7 succeeded em2026-10-18T12:42:06Z. GitHub código 84d782b2b63e6b66620a016ef7ee9275c25a8b6b.
Browser live844×390/390×844 confirmou remoção de faixa escura e borda reta; imagemintrínseca351×197.44 em retrato e398.22×224em paisagem, quadro horizontal230px estável apósgiro,123imagens semfalha. Pet atualvisível e mascotes semlegenda sobre números. Ver prêmio Caminhaestrela bloqueado, fecharinfo, entrar fase1,pausar e voltaraomapapassaram0/100. Nenhuma faseconcluída. Provas:meupet-1148-horizontal-corrigida.jpg e meupet-1148-vertical-corrigida.jpg. Semteste físico/touch/FPS; cloud WebGLcontinuaindisponívelnaCasa3D, não alterado. Exploração preservada.
