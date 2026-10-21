# Castelo jogável — 1.28.0

As 19 imagens de salas fornecidas pelo usuário substituem o protótipo genérico. A planta geral fornecida abre no atalho de mapa da lupa e marca sala e posição do personagem. Conversões WebP mantêm as dimensões originais; proveniência e auditoria geométrica acompanham os assets em castle5/rooms.

- Mesmos controles, personagem, mochila, poderes, áudio e HUD da exploração externa.
- Polígonos de piso e obstáculos por sala; portas reais com brilho e 26 conexões bidirecionais (52 passagens internas), mais a saída para a encosta.
- Portas livres neste teste; nenhum NPC, desafio ou prêmio novo. Baús pintados são decoração nesta etapa.
- Migração do protótipo anterior para posições seguras; preserva progresso e itens externos. Cache limitado a quatro imagens de salas, mais a planta.

## Verificação

TypeScript aprovado. 593 testes em 59 arquivos aprovados, incluindo simulação de todas as 52 passagens internas e saída/reentrada. Integração Firebase Admin depende de credenciais de staging e foi excluída da suíte local.

Revisão no navegador com viewports móveis horizontal 844×390 e vertical 390×844: cenário fornecido, controles existentes, mapa geral, marcador e brilho nas portas. Travessia Jardim → Cozinha confirmada pela interface na vertical. Auditoria das 19 imagens/áreas realizada separadamente; não equivale a jogar manualmente todas as salas em aparelho físico.

Corrigidas instruções externas que apareciam na pausa e ao retomar um save dentro do castelo. Publicação em preparação; aprovação visual final das áreas de colisão cabe ao teste do usuário.
