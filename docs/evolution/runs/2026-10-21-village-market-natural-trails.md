# 1.36.0 — Vila piloto, comércio e composição das trilhas

Estado: validado, aguardando pacote e publicação. Base Site28eeede / produto1.35.0 / publicação124. Mesma identidade Site appgprj_6ac40994d8d881919d46203a60801e46 e GitHub laninhagamer85-max/Jogo-do-gato, branch review/grass-option3-20261016, HEAD esperado7bf474f9f90cddddde0341c61622c9985a05db88. Datas America/Sao_Paulo.

## Entrega
- Vila dos Troncos somente na sala1: três casas distintas, praça com poço, duas barracas e empório. Acesso pela exploração em Visitar Vila dos Troncos, sem substituir o checkpoint da campanha. Casas/objetos bloqueiam os pés e participam da ordenação por profundidade.
- Quatro humanos com arte original: Tomás/Lia coletam estoques comunitários limitados, visitam vizinhos e compartilham recursos comuns. Tomás pode visitar a sala2 e retornar. Humanos não são inimigos; as criaturas não os têm como alvo. Atualização distante é resumida, não uma simulação completa de mundo persistente.
- Bento/Maia oferecem treino por diálogo ou reação à provocação próxima. Somente mãos, HP de treino separado e equipamentos preservados. Consumíveis, poderes e troca de equipamentos bloqueados. Uma recompensa de60XP/fruta/reputação por treinador a cada24h. Recarregar encerra treino em segurança.
- Mercado: comprar/vender/trocar madeira/pedra/erva/fruta. Moedas persistidas no progresso da vila começam em0; vender ou trocar permite iniciar. Confirmação explícita, limites de inventário, oito unidades de estoque por produto e reposição em30min. Compra custa mais que venda. Equipamentos/cartas/itens únicos não entram no catálogo deste piloto; ampliação fica para próximo ciclo.
- Trilhas: no Capítulo4 a chamada passa a ocorrer após o chão, antes de água, relevo, escadas, castelo e portais. Os platôs conservam a alvenaria já pintada. Fora dos platôs, contornos irregulares com variação de largura/transparência substituem strokes de pontas redondas. Material único por bioma; pátio contínuo na vila. Polígonos calculados uma vez por sala/semente, cache64. Caminhos não alteram colisões ou rotas desbloqueadas.
- Quatro atlas originais RGBA convertidos inteiros para WebP q94; origem, briefs, dimensões e recortes documentados em forest-adventure/village/manifest.json. Não houve extração de arte de terceiros.

## Verificação
- 723 testes aprovados em73arquivos; Firebase Admin integration excluído por depender de credencial staging externa. Cobrem32salas/rotas, rotina/doação, moedas e estoque persistidos, falhas atômicas, renovação, proteção de equipamentos, duelo e checkpoint.
- TypeScript aprovado antes das últimas mudanças pontuais de enquadramento/cache; rerun/check e build oficial exigidos no pacote.
- Navegador cloud pelo preview oficial, perfil isolado sem conta real.390x844 e844x390. Mercado: venda2frutas gerou6moedas; compra1erva debitou6 e aumentou8→9; troca5madeira por2frutas concluída. Corrigido contraste branco sobre pergaminho observado em QA.
- Treino aceito pelo diálogo, poderes/consumíveis suspensos, soco reduziu Bento172→142, encerramento preservouHP de exploração. HUD vertical reduzido para manter área central visível.
- Inspeção visual de pátio/portal31 e entrada do castelo32 nas duas orientações: nenhum desenho da nova trilha por cima do portal, escada ou platô. Os anexos relatados no histórico estavam indisponíveis em scratch; revisão feita no código e na execução real do preview.
- Sem medição deFPS nem teste em aparelho físico. Não declarar as32salas jogadas manualmente.

## Pesquisa reaproveitada do desenho da vila
A* e rotas esparsas, estados locais e atualização fora da câmera; aplicados no motor Canvas/TypeScript existente, sem migração para Godot. Consulta2026-10-21:
- https://docs.godotengine.org/en/stable/tutorials/navigation/navigation_using_navigationagents.html
- https://docs.godotengine.org/en/stable/tutorials/navigation/navigation_optimizing_performance.html
- https://github.com/godotengine/godot-demo-projects/blob/master/2d/finite_state_machine/state_machine/state_machine.gd

## Publicação
Pendente. Não confundir fonte1.36.0 com versão em produção até retorno final do deploy. Rollback: versão salva1.35.0 nativa124, appgprj_6ac40994d8d881919d46203a60801e46~appgver_64ae3ea8f2508191b936d7cdfbbdfb03.
