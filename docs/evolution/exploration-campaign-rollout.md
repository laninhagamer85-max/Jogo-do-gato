# Expansão da Exploração — planejamento atualizado em 15/10/2026

Estado real: 1 sala de combate/coleta; campanha antiga com 3 capítulos × 2 salas de charadas. O piloto ainda precisa de revisão visual no aparelho após 1.9.15. Não há 60 salas jogáveis.

## Etapa atual e aceite do piloto
- Percorrer os quatro cantos, cinco dimensões e zoom 1–2 / Ver sala: nenhuma borda plana, moldura de mapa ou camada duplicada. Conferir nitidez enquanto caminha.
- Insetos menores, identidade e animações próprias mantidas; sem alteração de HP/dano nesta redução visual.
- Coletável com mesma arte da mochila, sombra sutil e movimento reduzido respeitado; conferir queda, coleta única, inventário, cura e energia.
- Morrer, retornar ao ponto seguro, sair, recarregar e repetir: XP de combate separado da Minha Casa, inventário antigo intacto, coleta atual conforme regra e recompensa única.
- Nenhuma mudança de save real por ferramentas. Registrar tentativa, morte, tempo e problema por sala/versão. Um teste de comando de desenho não substitui uma partida.

## Sequência confirmada
1. Aceitar a base visual/combate/coleta do piloto.
2. Transformar o capítulo 1 em dez salas REAIS distintas com mapa, objetivos, inimigos, loot e avanço; não apenas alterar o contador 1/2 para 1/10.
3. Transferir a mesma interface e controles às salas: direcional à esquerda, ataque/poder/interação à direita, mochila em grade sobre o cenário pausado, sair somente pela pausa com confirmação. Ajustar câmera à arte de cada bioma.
4. Aplicar o sistema aos capítulos 2 e 3, dez salas por capítulo, preservando as conquistas anteriores por uma migração explícita.
5. Criar capítulos 4, 5 e 6, cada um com dez salas e dificuldades/charadas próprias. Os nomes e biomas novos do JSON são propostas, ainda não publicados.

Planejamento de 60 salas: exploration-campaign-plan.json. Cada entrada está marcada planned_not_implemented; seus campos de auditoria permanecem vazios. O nome existente do capítulo 1 é Clareira dos Troncos; David o citou como Cachoeira dos Troncos. Nenhuma renomeação silenciosa nesta entrega.

## Biomas, água e inimigos
- Riacho: água como camada animada independente, ondulações e reflexos suaves, espuma só nas bordas/cachoeira, ponte e colisão na mesma geometria. Reduzir movimentos mantém superfície legível sem ondulação intensa. Não pintar um rio no chão atravessável.
- Floresta e noite: folhas, luzinhas e lanternas com efeitos locais discretos, sem competir com coletáveis e números de dano.
- Besouro e lagarta são os primeiros adversários, não os únicos. Novos inimigos por bioma terão arte, nível, HP/ataque/defesa, alcance, comportamento, respawn e tabela de drops próprios. Validar cada um antes da distribuição por capítulos.
- Curva sugerida de inimigos: capítulos 1–6 em faixas 1–4, 4–7, 7–10, 10–13, 13–16 e 16–20. Valores de design sujeitos a balanceamento, sem alterar o nível salvo atual.

## Recompensas e identidade visual
A Aventura usa ícones originais via drawPetSymbol e DECORATION_ASSETS para as 100 decorações; collectibleIcon é chave do atlas, não deve virar emoji de sistema na nova Exploração. Materiais de exploração e consumíveis podem ter IDs próprios, mas uma mesma identidade precisa aparecer no chão, mochila, atalhos e resultado. A 1.9.15 unifica os quatro materiais/consumíveis atuais usando SVGs exportados da arte original da mochila.

Próxima etapa de arte: aproximar materiais e bônus do acabamento ilustrado da Aventura; reaproveitar IDs de recompensas raras existentes com uma concessão idempotente por encontro. Não conceder recompensas da Aventura em massa, nem duplicar por replay. Cartas novas de decoração são desbloqueios permanentes, não itens comprados na loja; catálogo mostra conquistado. Equipamentos e cartas não entram na perda parcial da coleta comum da sala.

## Salvamento e migração antes da expansão
Separar progresso de campanha/room/checkpoint do combate global da Exploração. Preservar saves antigos, bestActions e capítulos concluídos, sem atribuir automaticamente dez salas concluídas a quem terminou duas. Usar identificadores estáveis por sala/encontro/recompensa e rejeitar versões futuras. A migração será testada antes de substituir a campanha antiga. Água, cartas e novos biomas ainda não implementados nesta revisão.
