# Proposta: vilas vivas na Exploração

Estado: estudo, não implementado. Pedido de21/10/2026. Não faz parte da funcionalidade publicada1.35.0.

## Direção recomendada

Uma vila central pequena por capítulo, com povoados e casas isoladas nos ramais das trilhas. Evitar repetir uma cidade em cada uma das32 salas: manter natureza, respiro e descoberta. Cenários urbanos maiores podem vir como capítulos próprios. Começar por uma vila piloto de3 casas e4 moradores na Clareira dos Troncos, validada antes da expansão.

| Bioma | Assentamento | Moradores e tarefas |
| --- | --- | --- |
| Floresta | Madeira, hortas, cestos | Lenhador, coletora, carpinteira |
| Riacho | Cabanas ribeirinhas e pequenos deques | Pescador, carregadora, artesão |
| Outono | Madeira escura, folhas e horta medicinal | Herbalista, agricultor, comerciante |
| Nascentes rochosas | Casas baixas de pedra, pátios e depósitos | Mineiro, pedreira, ferreiro |
| Castelo | Dependências e oficinas interiores | Cozinheira, bibliotecário, ajudantes |

Humanos comuns na mesma linguagem pintada dos Lendários, com proporção compatível e roupas de trabalho, sem aparência de heróis/chefes. Cada morador tem nome, profissão, casa, personalidade, mochila limitada e relações. Arte original modular, ancoragem de mão e pé; animações de caminhada nas direções, descanso, coleta e transporte de cesto/saco. Sem figuras vetoriais. Casas com entrada, colisão e área livre em torno.

## Vida e interação

Rotina: sair de casa, escolher destino, caminhar, trabalhar, conversar ou compartilhar excedente e voltar à própria casa. Variação determinística de horários e pausas, sem rerrolar a cada câmera. Ferramentas e carga visíveis. Conservar inventário ao entregar/coletar, reservar destino para dois moradores não ocuparem a mesma árvore, impedir travamento se o recurso esgotar ou rota falhar. Falha de caminho provoca novo destino/retorno, não travessia de parede.

Facção pacífica separada dos hostis: inimigos não escolhem moradores como alvo e golpes não causam dano a eles. Moradores não atacam o jogador, não bloqueiam portais e cedem passagem. A travessia entre salas usa ligações reais e pontos de chegada; moradores podem ter rotas próprias autorizadas sem desbloquear salas do jogador por acidente. Casa de origem nunca muda quando atravessam outro estágio.

Interagir pode mostrar fala curta, profissão, pedido simples ou doação de excedente. Trocas entre moradores consomem estoque de quem dá e adicionam ao destinatário uma única vez, com identificação da operação. Doações ao jogador apenas de itens comuns, com limite e intervalo; sem armas, cartas ou gemas raras gratuitas. Recursos comunitários próprios reduzem a disputa com os primeiros recursos que o jogador precisa para evoluir. Economia e estoques limitados; nada nasce ilimitadamente por alternar salas.

## Integração ao motor existente

Manter React/Canvas, controles e saves. Separar definiçõesVillageDefinition/VillagerDefinition de estadosVillagerState e eventos. VillageDefinition contém casas, praça, recursos comunitários, pontos de conversa e conectores. VillagerState contém casa de origem, sala, posição, estado da rotina, objetivo, inventário, próxima decisão e último evento. Relógio de rotina independente de FPS, pausado conforme política de jogo. Transações não devem depender da quantidade de quadros.

Reutilizar pilotWalkable/pilotRoute, dados das trilhas e grafo de portais; acrescentar roteador social com cache e reserva de destinos. Separar busca de trajeto, deslocamento e desvio local. Recalcular trajeto só ao mudar destino ou detectar bloqueio; não a cada quadro. Ao chegar, parar e iniciar a atividade para evitar tremor no alvo.

No celular, proposta inicial de4 moradores com orçamento máximo de6 detalhados próximos. Fora da visão, atualização simplificada por eventos; outras salas mantêm casa, destino, estoque e horários em vez de animar todos os moradores dos32 mapas. Congelar/reconciliar o estado ao trocar sala. Não declararFPS sem medir. Salvamentos recebem versão e migração opcional preservando XP, itens e casas do jogador.

## Critérios do piloto

1. Quatro moradores completam casa→trabalho→casa sem água, paredes ou elevações inválidas.
2. Um visita outra casa/sala e volta à origem sem abrir portais para o jogador.
3. Hostis ignoram moradores; jogador não pode usá-los para bloquear passagens.
4. Estoques e doações conservam quantidades e não duplicam ao recarregar.
5. No celular horizontal/vertical, NPCs ficam legíveis, sem poluição e sem regressão de coleta/combate.
6. Depois da aprovação, criar kits dos demais biomas e povoar gradualmente os ramais existentes.

## Pesquisa técnica consultada em21/10/2026

- https://docs.godotengine.org/en/stable/tutorials/navigation/navigation_using_navigationagents.html — separar caminho/seguimento/desvio, encerrar seguimento ao chegar, evitar recalcular sem mudança de destino.
- https://docs.godotengine.org/en/stable/tutorials/navigation/navigation_optimizing_performance.html — geometria simplificada, limitar custo de consultas e processamento.
- https://github.com/godotengine/godot-demo-projects/blob/master/2d/finite_state_machine/state_machine/state_machine.gd — referência de organização por estados e transições.

São princípios adaptados ao motor existente; a proposta não migra o jogo para Godot nem incorpora código ou assets externos.

## Complemento: moradores guerreiros e duelo sem equipamentos

Proposta adicionada a pedido do usuário, ainda não implementada. Somente alguns moradores homens e mulheres, identificados pelo traje de guerreiro e nível alto, podem duelar. Cidadãos comuns seguem pacíficos. Esses guerreiros nunca iniciam agressão: respondem a um ataque do herói ou aceitam um desafio oferecido durante conversa, conforme o assunto/disposição. Diálogo oferece conversar, propor duelo e sair; mostra nível, regras e recompensa antes de aceitar.

Ao iniciar o duelo por qualquer uma das duas formas, o motor troca para uma sessão própria antes de aplicar o primeiro golpe: Lendário e aldeão usam apenas socos. Bloquear temporariamente armas, arco, poderes, efeitos/passivas de equipamentos e cura consumível. Evitar que o primeiro golpe armado cause dano e só depois desarme. Guardar referência do equipamento original sem retirar itens do inventário e restaurar ao terminar, sair ou recuperar uma sessão interrompida. O inventário não pode reativar poderes durante o combate.

Minha recomendação é tratar como treino amistoso, com vida da disputa separada doHP de exploração, sem morte ou perda de itens raros. Vitória pode dar experiência de treino, reputação ou recompensa comum limitada. Não definir aposta ou quantia sem especificação do usuário. Perder apenas encerra o desafio; ambos voltam à rotina. O nível alto do guerreiro continua visível, mas a luta respeita atributos de treino e golpes legíveis; sem habilidades escondidas. Cada vitória tem identificador persistente e intervalo para impedir duplicação de prêmios por recarga. Validar primeiro um guerreiro e uma guerreira no piloto.


## Atualização de implementação —1.36.0
Vila piloto da sala1 publicada:3casas/4moradores/rotinas/doações/treino sem armas e mercado comum com moedas e trocas. Relatório:../runs/2026-10-21-village-market-natural-trails.md. Expansão para outros biomas, catálogo de equipamentos e simulação completa intersalas continuam como desenho futuro.
