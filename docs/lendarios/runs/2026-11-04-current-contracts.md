# 04/11/2026 — Contratos de testes alinhados à campanha atual

**Entrega: testes e documentação; nenhuma alteração no jogo ou publicação nova.** Lendários do Rei, produto público1.0.38 / Sites40, https://lendarios-do-rei.aquimeusite.chatgpt.site. Projeto appgprj_6ae2a66e7f4c8191860c2d39db928ac7. Meu Pet Virtual permanece intacto.

## Fonte atual e escolha

Publicação conferida pelo status nativo succeeded: deploy appgdep_6aea3a40ee108191b781ad8ac70a95ec, versão appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_6742926fc5988191b8a9662c94a467c3, fonte5a7c9e428c2283aecddad07b278f41b42e0a6363. Checkout aberto com o helper oficial. O ramo GitHub canônico estava em3aaf47e81507f3558083eb39b8c4fafe61557b67, com referência pública antiga1.0.29/Sites31. Não reutilizado seu runtime antigo.

Lidos AGENTS.md, README, README da aplicação, estado atual do Site, relatório2026-11-03-island-performance-motion.md e relatório de elenco2026-10-29-aldeoes.md. Preservados o renderer/água recuperados da1.0.36, tablado da sala12, tamanho das ilhas, movimento/scheduler multiplayer, autenticação, Worker/D1 e seus bindings/migrações. A alteração não atua sobre os pedidos visuais recentes nem comprova FPS ou multiplayer em dois aparelhos.

Os testes ainda exigiam4.005nomes distintos, quando o contrato autorizado passou a53identidades por capítulo distribuídas em4.005posições com IDs persistentes. Também exigiam ausência total de inimigos no capítulo4, anterior aos encontros opcionais dos lagos. Isso gerava12falhas desatualizadas em três arquivos. A entrega corrige essas expectativas sem alterar código de produção, dados, saves, sprites, física ou dificuldade.

## Mudanças e critério de aceite

- exploration139.test.ts: distingue ID da posição e identidade/nome; protege105/100IDs por sala, nomes e aparências únicos no elenco ativo em40salas e estágios0/8/24. Verificações de gênero, arte e roupa preservadas.
- explorationCivicSystems.test.ts: exige4.005IDs únicos e53identidades, nomes coerentes por capítulo, crianças nas posições de cada núcleo, ausência de nomes repetidos no elenco ativo e distribuição por pelo menos cinco núcleos nas cidades completas. Não restaura a contagem antiga de pessoas.
- explorationChapter4Expansion.test.ts: mantém todas as verificações de caminhos, portais, escadas, portas, altura e geometria nas salas31–40. Exige encontros opcionais identificados como lake-hostile, IDs únicos, arte river-mobs, HP positivo, nível apropriado e posições caminháveis. A lista de inimigos do mundo deve conter esses encontros, enquanto os mestres/animais errantes não previstos para este capítulo continuam ausentes.

Não foram removidas verificações para ocultar falhas de jogabilidade. Antes da alteração,19aprovados e12falhas em31testes dos três arquivos. Depois,33/33 em quatro arquivos, incluindo os dois testes existentes do elenco.

## Pesquisa primária —04/11/2026

- https://vitest.dev/api/expect.html — comparações exatas, conjuntos e mensagens de falha contextualizadas; preservar asserções específicas em vez de aceitar qualquer saída.
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set — separar unicidade de IDs, nomes e aparências no conjunto correspondente.

Regras de produto fundamentadas no relatório de elenco e nas implementações correntes de campanha/lagos do próprio projeto. Nenhuma arte externa ou dependência incorporada.

## Validação

-33/33 testes dos quatro arquivos revisados/elenco;16,45s.
-Duas falhas simuladas detectadas: duplicar um ID de posição causa4004vs4005; remover a arte da criatura causa undefined vs river-mobs. Ambas retornaram exit1 como esperado. Alterações temporárias foram restauradas byte a byte antes da verificação final; não integram o patch ou a publicação.
-A primeira coleta adicional de pendências coincidiu com essas simulações; foi descartada como evidência final e repetida somente após restaurar as fontes. A execução final abaixo é a referência válida.
-Execução final de sete arquivos:40aprovados e9falhas em49testes,16,14s. Os33dos quatro arquivos revisados passam; continuam seis falhas da fixture antiga da guarda, duas de fauna e uma de mensagem de autenticação. Esses três arquivos não foram alterados. Correções anteriores de guarda/save/autenticação continuam em revisão, aguardando rebase sobre a fonte atual; não foram aplicadas silenciosamente.
-TypeScript do jogo e do host aprovados. Build oficial scripts/build-lendarios-sites.mjs aprovado, incluindo Worker e conferência byte a byte de426arquivos entre saída do jogo e assets empacotados. Avisos existentes de chunks/classificação de rotas. Lockfiles inalterados.
-git diff --check e git apply --check --cached do patch no índice original aprovados.
-Nenhuma suíte global nova iniciada: a execução anterior não terminou, e esta entrega trata do recorte identificado. Não declarar aprovação global ou redução para nove falhas em todo o repositório; nove é o total observado nesses sete arquivos.
-Sem navegador ou playtest neste ciclo, pois não houve mudança visual, física, animação ou runtime. Não houve login, escrita de save real ou acesso ao banco de jogadores. Fases online concluídas0; tentativas, mortes, tempo e dificuldade não medidos.

Evidências resumidas em ../evidence/2026-11-04/. Os logs com grandes dumps de inimigos foram condensados preservando asserções, casos e totais. Patch em ../reviews/2026-11-04/current-contracts.patch, aplicável à fonte Sites40; não aplicar sobre o ramo GitHub antigo sem reconciliar o runtime.

## Salvamento e continuidade

Testes e documentação preservados no repositório; versão de produto não incrementada. **Nenhuma revisão pública/deploy novo:** não existe mudança de comportamento do jogo a publicar neste ciclo. Referência pública/rollback mantida em1.0.38/Sites40, IDs acima. Nunca restaurar1.0.17ou1.0.29sobre as ilhas e multiplayer atuais.

Próxima ação: diagnosticar os dois casos de fauna com coordenadas/seed exatas, rebasear as revisões pendentes de save/guarda/autenticação na fonte atual e completar a validação antes de uma mudança de gameplay. A qualidade das ilhas e a fluidez em dois aparelhos continuam dependentes de playtest, sem garantia de FPS ou ausência de atraso de rede.

Fonte completa com testes/documentação enviada ao repositório do próprio Site: a92116222221a904302bb6baacffc804bcfc8242. Não foi salva versão de hospedagem nem iniciado deploy. A fonte pública permanece5a7c9e428c2283aecddad07b278f41b42e0a6363.
