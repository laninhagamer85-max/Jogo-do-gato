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
