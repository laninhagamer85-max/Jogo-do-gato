# 1.32.0 — Oficina, equipamentos e câmera do castelo

Estado: validado, preparando publicação no Site existente. Data: 2026-10-21, America/Sao_Paulo.

## Entrega
- Oficina na mochila: machado, picareta, baú único, bancada, fornalha e mesa de cura por perfil; melhorias, materiais e transferências do baú.
- Fabricação30s por prazo absoluto; uma fila global, reserva atômica dos ingredientes e retirada única. Concluir uma melhoria com falha consome os ingredientes, preserva o item e o nível anterior.
- Árvores/minérios coletáveis nas salas1–30, ferramentas exigidas, cinco unidades por ponto, toco/depósito gasto, renovação12h após esgotamento. Clearings reservam área livre; raízes têm colisão e entidades usam ordenação de profundidade.
- Materiais adicionais por espécie de NPC, com ouro/diamante em encontros avançados do terceiro capítulo. Mantidos drops comuns e raros anteriores.
- Quinze sprites originais pintados: machado, picareta, espada, faca e arco em metal/ouro/diamante. Progressão sequencial em níveis6/15/30; bônus8/18/30% sobre ataque da arma ou velocidade de coleta. Alcance original preservado. Ferramentas também aceleram3% por melhoria numérica. Personagem de combate agora pode atingir nível100, sem resetar XP.
- Câmera interna cobre viewport e acompanha personagem sem esticar arte; mapa completo permanece separado. Zoom+ e zoom− distintos à esquerda da lupa, oito alvos44px separados e margem direita corrigida.
- Escada compacta sobreposta somente abaixo da soleira do portão, mantendo porta visível; colisão e desenho continuam usando o mesmo transform.

## Evidências
- TypeScript passou antes das últimas alterações de apresentação; checagem final programada no empacotamento.
- Suíte completa:64 arquivos,622 casos passaram. Um caso de integração Firebase falhou por falta da credencial Admin de staging; nenhum ajuste de autenticação neste ciclo.
- Testes direcionados67 casos passaram; câmera e arte4 casos adicionais passaram. Testes novos: prazos30s/12h, cinco extrações, não duplicação, guarda/retirada, falha, pré-requisitos e15 células distintas.
- Navegador real com perfil isolado sem gravação na conta: fabricação de espada de metal, custos100→96, conclusão após30s, ataque atualizado e receita de ouro liberada; sala do castelo preenchendo844×390 e390×844; percurso por escada e entrada no castelo; extração exibindo5/5→4/5. Não equivale a percorrer todos os biomas ou teste em dispositivo físico.

## Pesquisa aplicada
Acessos em2026-10-21:
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now — prazos persistentes em milissegundos.
- https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API — temporizadores visuais não são autoridade de fabricação em abas ocultas.
- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/minecraftrecipe_furnace?view=minecraft-bedrock-stable — separar ingredientes, resultado e estação em dados de receita.

Sprites gerados pelo imagegen integrado. Manifestos e prompts completos junto aos atlases; conversão RGBA WebP92 sem editar pixels. Caminhos: client/public/forest-adventure/items/{harvesting-atlas,equipment-tiers}-v1.webp. Não foram incorporadas imagens licenciadas de terceiros.

## Limites e próxima etapa
Inventários e XP continuam compartilhados no perfil de Exploração; separação por Lendário, evolução da casa e recursos autorados no capítulo4/interior do castelo ainda pendentes. Estações usam sprites pintados existentes, brilho e nível, sem novas variantes estruturais completas. Os novos materiais de NPC são concedidos ao derrotar, enquanto os drops anteriores permanecem físicos. A probabilidade de melhoria não é compra ou aposta monetária.

## Rollback
Produto anterior1.31.0, native117. Site source base763ff01eae3f4f5bd9b6da6f52ca8955ebd78316; GitHub basec27ecfaaace09ebd41dffd57f29c7f5fa04bc057 no ramo review/grass-option3-20261016. Preservar domínio, contas e saves. IDs finais serão registrados após publicar.

## Publicação concluída
Produto1.32.0, versão nativa118. Status succeeded.
- Versão: appgprj_6ac40994d8d881919d46203a60801e46~appgver_654cf0d969348191825f07d1a372fbac
- Deploy: appgdep_6ad8e00deefc81918d9a6c0d0bfe58c8
- Fonte publicada: c50a9b76701335439c9c9d61c0934bb9e160f76d
- GitHub confirmado:6a2db1ab1c24c0fa915b21c97b65d065128c8dfc
- https://meupet.aquimeusite.chatgpt.site
- Typecheck final e build passaram.11 testes direcionados finais passaram após alterações de apresentação. Teste visual adicional: árvore5→0, toco e indicação de renovação12h.
- Evidência visual: docs/evolution/evidence/meupet-132-coleta-teste.jpg.
