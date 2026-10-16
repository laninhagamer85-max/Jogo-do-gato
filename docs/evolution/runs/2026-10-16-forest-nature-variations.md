# Floresta viva e respawn independente — 1.9.25

Solicitação: menos repetição no gramado e nas samambaias, jardim atravessável, raios de sol, movimento discreto, fauna sem combate e casinha no ponto seguro. Respawn por nível/raridade independente da coleta. David autorizou concluir, publicar e analisar online.

## Implementação

- Quatro materiais de grama originais com variantes por coordenadas estáveis, rotação/espelhamento e bordas mescladas. Cache LRU continua limitado a 8 milhões de pixels.
- Seis variedades de plantas baixas substituem samambaias repetidas; jardins atravessáveis nas posições anteriores, com balanço suave em torno da base.
- Dois feixes de sol sutis e estáticos. Duas borboletas e uma abelha da biblioteca ilustrada, voo local sem hitbox, ataque ou coleta. Redução de movimento congela fauna e plantas.
- Casinha existente do Bosque ao lado do spawn, proporção preservada, profundidade compartilhada com o gato e pequena base sólida. Spawn e objetivos acessíveis; relocação existente protege saves antigos cobertos pela base.
- Besouro comum Nv1: 30s; lagarta incomum Nv3: 60s. Regra inicial: (30 + 5 × (nível − 1)) segundos × raridade (comum 1, incomum 1,5, raro 2). Raro é apenas uma configuração para futuras espécies; nenhum raro foi criado.
- Contagem desde a derrota, em tempo ativo da sala. Item não impede retorno. Mantém distância segura de 2 unidades no spawn do inseto.
- Uma pilha por espécie (duas na sala). Derrotas seguintes somam quantidade e renovam prazo. Fibra dura 180s; âmbar 90s. Save preserva prazo/quantidade de gerações anteriores e coleta única. Estoque permanente não expira.
- Configuração por bioma preparada; somente floresta/piloto alterada. Campanha não expandida.

## Arte

Criada com ImageGen nesta conversa e inspecionada. Apenas codificação WebP q93 por Pillow, sem redesenho por script.
- grass-variants-v6.webp: 1254×1254 RGB, quatro células 627×627, 474508 bytes. Brief: variações calmas de grama ilustrada, verdes harmonizados com capítulo 1, sem objetos grandes.
- walkable-garden-v1.webp: 1536×1024 RGBA, seis células 512×512, 513552 bytes. Brief: tufos, folhas arredondadas, musgo, flores esparsas, folhas lanceoladas e mistura, sem samambaias, transparente.
- Casinha: asset existente manus-storage/bosque-casa-arvore_0200432f.webp, reutilizado sem alteração.

## Verificação

TypeScript aprovado; 221 testes offline em 30 arquivos aprovados; Firebase staging excluído por falta de credenciais. Build de produção aprovado, com avisos já existentes de tamanho de chunks. Cobertura: variantes/crops/cache, proporção/ancoragem de plantas, movimento reduzido, voo limitado, rotas do abrigo, respawn com item, timers por nível/raridade, expiração e persistência da coleta entre gerações.

Preview gerenciado indisponível sem control-browser. Usuário autorizou publicação para testar; inspeção pública será registrada depois. Retrato, FPS móvel e aceitação artística pendentes. Nenhuma fase concluída.

## Pesquisa em 16/10/2026

- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas — pré-renderização e cache de elementos repetidos.
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion — respeitar preferência de redução de movimento decorativo.

## Publicação

Preparando. Rollback: 1.9.24, commit Sites 76dacf405cf5a19286d8252b00dce50a68f9676b. IDs e análise serão acrescentados após sucesso do serviço.

## 1.9.25 publicada e inspecionada

GitHub: 5ca43a7fd9c0c869fcc5dad98b015b253904137a; Sites: c24a41664f97dee3383c204444f276a4174eb318; versão interna 44; appgprj_6ac40994d8d881919d46203a60801e46~appgver_38326b2e9d008191b7973c7ab8c56764; deployment appgdep_6ad1c1c1135081918fca59d352502f2f, succeeded em 2026-10-16T06:19:04.422079+00:00.

Inspeção real em paisagem: grama com menos repetição, novas plantas e flores visíveis, borboletas/abelha em movimento, casinha original à direita do camp. Percorridas esquerda, parte inferior e direita; obstáculo/tronco bloquearam passagem corretamente. Gato recebeu dano e retornou ao ponto seguro após derrota; nenhum material perdido. Parte superior não concluída. Respawn e persistência foram testados offline; não observados por ciclo completo online. Sem medição de FPS ou retrato.

## Ajuste solicitado durante a inspeção — 1.9.26

David aprovou aspecto do gramado, musgo, flores e borboletas. Pediu: casinha reconhecível como casa de gato no canto esquerdo; insetos pequenos sobre troncos/plantas; leve aproximação da cor do gramado à das plantas, preservando a vegetação aprovada. Mistura de rocha/areia/grama na mesma sala ficou expressamente para outras situações.

- Casa de gato original gerada via ImageGen com transparência, baseada apenas no estilo do asset próprio existente. Madeira, entrada baixa, almofada, símbolo de pata e telhado verde, sem escada/tronco de suporte. WebP q93, 1254×1254, 363452 bytes; mantida a proporção. Posição x0,45/y1,9 à esquerda do spawn (1,5/1,5), pequena base fora do corredor.
- Dois mini besouros ambientais sobre o tronco e o toco usam o primeiro quadro do atlas existente em escala 0,16 unidade; abelha junto de plantas em 0,13 unidade. Movimento local limitado, congelado com redução de movimento. Sem entidades de combate, XP, loot ou hitbox.
- Somente base do gramado passou de #416a3c para #52783e. Textura, mistura, distribuição e cor das plantas preservadas. A tentativa intermediária de tingir folhagem foi abandonada antes de publicar, conforme a correção de David.
- 222 testes passaram; build final em andamento. Não foram implementados terrenos mistos nem expansão de campanha.

## Publicação final e análise real — 1.9.26

GitHub código: 4b95cb468263a339796dc869b0c9639cc6584921. Sites: eb56883dc7661a15b8712aa8c1e285777adfc798; versão interna 45; appgprj_6ac40994d8d881919d46203a60801e46~appgver_805df287976c8191a1cd9c576bdcba8d; deployment appgdep_6ad1c4e03b04819188b22a4412e0d6a3; sucesso em 2026-10-16T06:32:24.066505+00:00. URL: https://meupet.aquimeusite.chatgpt.site.

222 testes/30 arquivos e TypeScript aprovados; build final aprovado. Interrupção durante primeiro salvamento da 1.9.26: serviço ainda mostrava versão 44; salvamento retomado sem novo deploy duplicado e concluído como versão 45. Native deploy confirmou succeeded.

Reabri a publicação e entrei em Exploração → Sala piloto. Casinha de gato aparece à esquerda, no chão, com o gato do lado de fora; tom do gramado levemente aproximado dos verdes das plantas. Pequenos insetos pousados aparecem sobre toco/tronco. Percurso real pela parte superior, direita, parte inferior contornando os sólidos e lateral esquerda, retornando ao ponto seguro. Pet recebeu 9 de dano e coletou automaticamente 3 fibras e 1 erva; não houve ataque comandado, XP, desbloqueio nem conclusão de sala. A inspeção não simula resultados de respawn online; esses seguem cobertos pelos testes offline.

Análise: integração de grama/plantas melhor e abrigo mais reconhecível. Feixes de luz ainda têm limites retos perceptíveis; texto de local seguro pode se aproximar da cabeça conforme posição; HUD sobrepõe elementos no modo de visão geral. Registrar para próximo ciclo, sem alterar a versão após a instrução de limitar o ajuste atual à tonalidade. Retrato e FPS não medidos. Screenshot de evidência em docs/evolution/screenshots/meupet-1.9.26-safe-house.jpg.

SHA256 casinha nova: 0644430946dd078baeb4f76e2c93e85621f365282fc83439b456d5bf361bf528. Nenhum terreno misto novo, bioma novo ou expansão foi publicado.
