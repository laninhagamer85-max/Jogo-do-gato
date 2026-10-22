# 1.39.0 — Correções das vilas, mapa e produção

Estado: validado em testes, inspeção visual e publicação em andamento.

## Problemas verificados nas imagens do jogador
Mapa com nomes de todas as construções sobrepostos. Cabeças cortadas porque os atlas usavam quatro linhas de altura idêntica, mas a arte ultrapassa essas linhas. Nomes sem relação com a aparência e repetidos. Praça de pedra de baixa resolução contrastando com a trilha. Casas transparentes e colisão insuficiente. Produção sem acompanhar todos os trabalhos no cenário.

## Implementação
- No mapa geral, ocultados nomes individuais de casas, lojas e base; um identificador curto por núcleo (P=povoado, V=vila, C=cidade). Lupa oculta durante consulta para liberar área. Localização preservada.
- Recortes por limites reais das linhas dos dois atlas, sem editar os PNGs/WebPs originais. Nomes masculinos/femininos vinculados à aparência e nomes completos únicos entre os cem moradores possíveis de cada sala. Quatro variações de roupa com rosto original preservado. IDs e saves preservados.
- Praças usam a mesma areia/terra e escala das trilhas, inclusive nas cidades, eliminando o piso de pedra pixelado que destoava. Textura 512px separada da máscara suave 128px; cache limitado a dezesseis áreas. Não é necessário novo asset.
- Construções opacas; colisões do corpo ampliadas. Casa padrão recuada em relação ao nascimento e retorno após derrota na frente da casa. Layouts personalizados preservados. Área de organização ampliada até aproximadamente oito unidades, com visão mais ampla; a proteção de combate mantém o raio anterior.
- Até trinta depósitos comuns de pedra/cobre/ferro por sala fora dos centros, com IDs estáveis e o mesmo estado de coleta/renovação para jogador e aldeões. Parte dos trabalhadores faz viagens de mineração a cada três ciclos; as buscas de rota continuam limitadas por atualização. Um encontro opcional perto do núcleo principal quando há percurso válido, sem aumentar a quantidade de inimigos da campanha ou alterar IDs.
- Todos os trabalhos exibem progresso na construção de origem; ao iniciar a interface fecha para mostrar a produção. Após trinta segundos, conclusão automática quando o jogador está na área de fabricação. Caso esteja distante, resultado permanece pronto para retirada, sem perda. Chance das melhorias depende do nível e das instalações, limitada a 95%; criação comum continua garantida. Sucesso acrescenta o item/nível uma única vez; falha conserva o equipamento e nível anterior. Aviso e efeito distintos com botão para ver a grade de itens/equipamentos. Resultado visual transitório não é salvo.

## Verificação e referências
Suíte completa: 793 testes/77 arquivos aprovados. Últimos ajustes de origem do trabalho: 14 testes direcionados aprovados e typecheck. Partida isolada em navegador cloud, sem alterar contas ou saves reais. Comparação visual dos formatos 844×390 e 390×844. Cidade com tempo de processamento amostrado de 21,75 ms em média (14 desenhos, amostra fria, p95 123,90 ms); não é promessa de FPS em telefone físico. Primeira geração de caminhos e mapa completo ainda pode ter custo superior à execução contínua.

Referências técnicas consultadas em 2026-10-22: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas (pré-renderização e cache de objetos repetidos); https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled (escala de raster e suavização). Sem dependências novas nem arte de terceiros.

Rollback: publicação anterior 1.38.0, Sites 128, deployment appgdep_6ada0f2999688191a1e3995f56b984e8; fonte 0f558ed18fcd6276f50601c09d105a2462770385.
