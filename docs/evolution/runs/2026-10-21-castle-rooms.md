# Castelo jogável — 1.28.0

As 19 imagens de salas fornecidas pelo usuário substituem o protótipo genérico. A planta geral fornecida abre no atalho de mapa da lupa e marca sala e posição do personagem. Conversões WebP mantêm as dimensões originais; proveniência e auditoria geométrica acompanham os assets em castle5/rooms.

- Mesmos controles, personagem, mochila, poderes, áudio e HUD da exploração externa.
- Polígonos de piso e obstáculos por sala; portas reais com brilho e 26 conexões bidirecionais (52 passagens internas), mais a saída para a encosta.
- Portas livres neste teste; nenhum NPC, desafio ou prêmio novo. Baús pintados são decoração nesta etapa.
- Migração do protótipo anterior para posições seguras; preserva progresso e itens externos. Cache limitado a quatro imagens de salas, mais a planta.

## Verificação

TypeScript aprovado. 593 testes em 59 arquivos aprovados, incluindo simulação de todas as 52 passagens internas e saída/reentrada. Integração Firebase Admin depende de credenciais de staging e foi excluída da suíte local.

Revisão no navegador com viewports móveis horizontal 844×390 e vertical 390×844: cenário fornecido, controles existentes, mapa geral, marcador e brilho nas portas. Travessia Jardim → Cozinha confirmada pela interface na vertical. Auditoria das 19 imagens/áreas realizada separadamente; não equivale a jogar manualmente todas as salas em aparelho físico.

Corrigidas instruções externas que apareciam na pausa e ao retomar um save dentro do castelo. Publicação 1.28.0 concluída; aprovação visual final das áreas de colisão cabe ao teste do usuário.

## Publicação confirmada

- Site: https://meupet.aquimeusite.chatgpt.site
- Fonte: b3b17aad00debadd8aefa0abf98cfb78bd5825f3
- GitHub: 1bf363a1a59e8a9e522fc579bf819cc50a8c437f
- Sites versão 113: appgprj_6ac40994d8d881919d46203a60801e46~appgver_b212c4918688819183aacfce94ce30cd
- Deploy: appgdep_6ad87cf81c64819193c39262178200af — succeeded
- Rollback preservado: versão 112 / produto 1.27.0.
