# Conta, nome e evolução do jogador — 1.0.6

Base: release 1.0.5 / Site v5 / commit 74724143af90c4fc7190c1fc94413040f8d1fd06.

Cadastro por e-mail agora solicita nome (2–28 caracteres), valida antes de criar a conta e salva em Firebase displayName. A preparação inicial herda esse nome; contas Google usam o nome do provedor. Contas antigas sem displayName podem escolher na preparação. Saves existentes mantêm seus nomes e progresso.

Minha jornada contém abas Perfil e evolução / Minha conta: nome editável, e-mail e método de acesso, link de redefinição de senha para e-mail/senha, orientação de senha Google, exportação e retorno à trilha. Renomear atualiza o save local e o perfil Firebase; falha no Firebase reverte a alteração local. Não há campo para senha em texto, alteração de e-mail ou exclusão nesta revisão.

Dentro da sala, tocar no nome/Nv abre perfil. Também acessível na pausa e na aba Perfil das configurações da trilha. Estatísticas derivam das funções reais do jogo: nível, XP e próximo patamar, vida, energia, ataque, salas, estrelas, lendários e progresso por capítulo. Abrir o perfil pausa a sala pelo mecanismo existente. Acesso à conta solicita salvamento antes de sair.

QA: fixture em memória no navegador, sem conta real. Renomeado Helena QA para Aurora QA; trilha, HUD e perfil refletiram o nome; 142 XP, uma sala e três estrelas preservados. Perfil dentro da sala abriu e acesso à conta retornou com segurança. Configurações e conta inspecionadas no desktop; ficha de perfil inspecionada em iframe 390×740. Harness removido antes do build final. Typecheck/build e testes de nomes, patamares de XP e saves executados. Integração com criação real de conta, atualização Firebase e entrega de e-mail não foi testada com credenciais reais; não alegar esse E2E.

Estado: validado para publicação. Rollback: Site v5. Sem mudanças de motor, NPCs ou população.
