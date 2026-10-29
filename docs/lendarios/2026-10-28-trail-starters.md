# Trilha e lendários iniciais

Lendários do Rei abre a trilha de capítulos/salas após o acesso de um perfil existente. Novo perfil escolhe nome/opção de personagem e abre a trilha. Reutiliza ForestPuzzleAdventure e ExplorationCampaignMap com propriedades opcionais de marca/avatar; padrões do Meu Pet são preservados.

Kael é o inicial masculino; Lyra é a inicial feminina. Entitlement somente no adaptador lendariosSave, sem gastar materiais, dar XP, avançar salas ou trocar um lendário compatível já selecionado. Importações e saves existentes do novo jogo recebem o inicial de forma idempotente. O nome escolhido identifica o jogador na trilha e no HUD; a identidade canônica do lendário aparece separadamente. Arquétipos/personagens não são renomeados globalmente.

Verificação: TypeScript, build, 21 testes em lendariosSave/explorationSelection; masculino/feminino e preservação de seleção avançada/materiais/progresso. Chrome com perfis isolados: trilha de 40 salas, avatar Kael e Lyra, entrada na sala e HUD Helena QA / Lendário Lyra. Nenhuma conta real usada; fixtures removidas antes de compilar produção. Acesso permanece privado do proprietário.
