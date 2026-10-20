# Áreas conectadas — 1.26.0

Sala31 reconstruída com chão de material em chunks, lago com geometria própria, conjunto de elevação fornecido pelo usuário, escadaria correspondente, abrigo e portais independentes. A imagem completa1.25 não é usada como cenário nesta revisão. Sala32 Encosta das Fontes é uma segunda composição jogável para validar conexão, com outro conjunto de elevação gramada, lago/desafio em posições diferentes. Sem novos NPCs nesta validação.

Terreno e câmera continuam fora do antigo círculo e do retângulo de visão geral. Não há parede de perímetro. O conteúdo de missão é um setor autorado: solo e bosques continuam além, mas isto NÃO significa uma campanha infinita com missões geradas, nem streaming de rede de capítulos inteiros. Material usa LRU8MP existente, terreno calculado apenas em chunks visíveis. Árvores externas e vegetação são fixas em coordenadas/seed do mundo e descartadas fora da vista. Recursos visuais carregados por sala e reaproveitados pelo cache HTTP.

Portais:30→31 continua compatível;31→30(retorno ao bosque);31→32(pátio após desafio);32→31(retorno livre ou atalho após desafio). Grafo explícito em explorationChapter4.ts. Destinos indicados sobre os portais. Transição automática850ms ativos, offset e cooldown500ms na chegada; pausa não avança. Memórias locais preservam coleta, placas, gate, inimigos, loot e descoberta. Inventário/HP/XP/equipamentos ficam globais e não são duplicados. Entrada pelo mapa nas novas áreas é visita persistente, sem reset de coleta. Capítulos anteriores conservam seu replay.

Save campaignVersion7 / nascentesSceneVersion3. Migração da composição1.25 reloca uma vez ao abrigo e mantém materiais, IDs de coleta e desafio já liberado. Save no meio do retorno não conclui uma missão pendente. Dados de versões futuras continuam rejeitados.

Arte: elevações do usuário1254×1254 com alfa preservado; árvores originais1774×887 com4retângulos explícitos e âncoras de raiz; solo original1254×1254. ConversãoWebP e manifestos SHA256/origem no diretório chapter4. Não alegamos4K, equivalência pixel a pixel ou nitidez ilimitada no zoom2x. Conjuntos de elevação ainda incluem árvores/vegetação pintadas; não se trata de converter cada folha em objeto individual.

Pesquisa20/10/2026: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html — camadas, reuso de conjuntos, formas de colisão/navegação e agrupamento do desenho. Aplicação conceitual no Canvas existente, sem migrar motor. https://docs.mapeditor.org/en/stable/manual/using-objects/ indisponível na consulta; não usada como evidência.

Validação: TypeScript aprovado;563testes offline aprovados (FirebaseAdmin de staging excluído por ausência de credenciais). Depois da variação visual dos bosques externos,7testes de terreno/viagem também passaram. Navegador isolado: caminhada em degraus e pátio, passagem31→32 e retorno32→31 via clique, mantendo12fibras e3placas; inspeção visual390×844 e844×390.375×667,375×812 e1366×768 sem overflow horizontal no DOM e canvas dentro do viewport. Sem conta real alterada, teste físico de telefone ou FPS medido.

Rollback:1.25.0/Sites110 fonte9b122752d3519ca038d2af284acb20c8f65edd60, versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_512cfd25663c81918e8d6d7f7d8731a1.

Publicação1.26.0/Sites111 concluída; fonte eafc76b5d8bf85981139b498f64d81b2e648f07c; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_2f4d75100ab08191b0f87107e56f7330; deployment appgdep_6ad7fe74cdb4819193056cf666d8a3db; URL https://meupet.aquimeusite.chatgpt.site. Build19.52s aprovado, aviso de chunks grandes já existente.
