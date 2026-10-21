#1.33.2 — Obra visível e coleta nas Nascentes
2026-10-21 America/Sao_Paulo. Validado, aguardando publicação.

Estruturas aparecem no local definitivo durante os30s, com arte pintada revelada gradualmente, barra, porcentagem e segundos. Após iniciar pelo painel da casa, retorna ao cenário; ao acabar, tocar na estrutura abre o painel para concluir. Serviços só liberam depois de retirar resultado. Footprint reservado e persistência usam o job existente, sem alterar saves/economia. Melhorias de construções também mostram progresso.

Durante o golpe de coleta, arma deixa de ser renderizada e o machado/picareta ilustrado acompanha a mão do Lendário; gato usa a animação existente de ferramenta. Arma equipada/posse não são modificadas e ela reaparece após o golpe. Efeito de ataque comum suprimido durante coleta.

Salas31/32: quatro pontos cada, madeira/pedra/cobre/ferro, espaçados fora de água, relevos bloqueados, objetivos e construções. Ferro exige picaretaNv2; até5 unidades e12h de renovação preservados. Guia atualizado. Interior do castelo continua sem coleta. Não há novos NPCs.

Pesquisa: MDN https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip e https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha consultadas2026-10-21, recorte e transparência da arte existente com save/restore do contexto. Sem nova arte de terceiros.

Validação: TypeScript passou;663 testes em66 arquivos passaram, Firebase staging excluído por credencial ausente. Novos testes: obra pendente/colisão/progresso/save/claim único,8 pontos acessíveis por rota real, coleta sem alterar arma e renderização troca/restauração da arma. Navegador isolado844x390 e390x844: coleta real de árvore5→4 nas salas31 e32 comKael; baú construindo18%, retirada após30s; casa de poções14% visível vertical. Sem dados de jogador real. Sem aparelho físico. Evidência ../evidence/meupet-1332-obra-vertical.jpg.

Rollback1.33.1 Site120, versãoappgprj_6ac40994d8d881919d46203a60801e46~appgver_b72f323a008881918c7935e37a97aa63; deploymentappgdep_6ad9297c4a948191852ad499324e82f8. Fonte based0b6fb6d77f7ed77eecb2af0a0444a150b8e8013.
