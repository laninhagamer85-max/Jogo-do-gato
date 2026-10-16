# Expansão e minimapa — pedido de David em 16/10/2026

Implementar após a revisão da textura do gramado.

- Área jogável deve acompanhar o mapa, com limites naturais em vez do perímetro retangular atual.
- Minimapa na parte superior, com aparência de pequena lupa/janela de visão geral.
- Miniatura do mapa com ponto vermelho indicando posição do pet, atualizada durante deslocamento.
- Áreas ainda não exploradas permanecem escuras (névoa de exploração), reveladas conforme avanço.
- Distinguir área não visitada de região ainda bloqueada na progressão; não liberar conteúdo apenas por desenhá-lo no minimapa.
- Preservar saves e controles móveis; não encobrir HUD. Definir persistência da descoberta por perfil e sala com migração segura.
- Verificar colisão, rotas por toque, câmera, limites naturais, primeiro acesso/reload e minimapa em retrato/paisagem.

Estado: requisito registrado, ainda não implementado. Não faz parte da revisão 1.9.28 do piso.

## Complemento solicitado

Minimapa circular no canto superior direito, mostrando o pet com ponto vermelho e marcadores diferenciados de objetivos/metas, desafios, pontos de interesse e inimigos próximos para orientar o jogador. Respeitar névoa de exploração; alcance de detecção e regras de visibilidade a definir na implementação. Não inventar objetivos que não existam no estado do jogo.
