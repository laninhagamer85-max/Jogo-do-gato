# Mapa ilustrado da sala piloto — 15/10/2026

Entrega 1.9.11: chão pintado original compatível com a direção aprovada, atlas de seis objetos separado do fundo, tronco e pedras agrupados com geometria declarativa compartilhada entre desenho, colisão e rotas. Perímetro com 16 agrupamentos irregulares em vez de 44 objetos por quadrícula. Câmera e controles sobre o cenário mantidos. Sem mapa completo achatado ou novo quadro dentro do fundo.

Saves: posições cobertas pela nova geometria são deslocadas para ponto caminhável próximo; preserva HP, XP, estoque, mochila, geração dos encontros e drops legítimos pendentes. Não houve ação em contas reais. Guardas de versão futura mantidas.

Arte original gerada para este projeto, inspecionada estaticamente. Manifesto: docs/evolution/pilot-map-art-v2.json. Não extraída da prévia nem de imagens de terceiros.

Pesquisa consultada em 15/10/2026: MDN https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection (hitboxes simples e geometria consistente); https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas (cache do plano estático). Não foi incorporado código externo.

Validação: TypeScript aprovado, 170 testes offline em 25 arquivos aprovados, build aprovado com aviso preexistente de tamanho de chunk, seleção inicial 101 estados aprovada e paridade aprovada com armazenamento fictício. Cinco novos testes cobrem geometria compartilhada, objetivos alcançáveis, rota ao redor do tronco, migração de jogador/drop e rejeição de drop fora dos limites. Testes existentes verificam cobertura matemática do chão nos cinco tamanhos; isto não é inspeção visual.

Limites: control-browser indisponível; nenhum navegador/playtest executado. Publicação para revisão de David autorizada expressamente na conversa. Apenas uma sala piloto atualizada; não há 60 salas implementadas ou 100 fases auditadas. Aprovação anterior do piloto não valida este novo desenho.

Publicação: aguardando empacotamento oficial. Rollback: produto 1.9.10, Sites 29, commit 97308fed0d76fe8cbaa728d6c41cec62ae38ab7a.

Próximo passo: testar passagens e leitura de objetos no celular/horizontal antes de expandir biomas e novas salas.
