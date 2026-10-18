# 1.14.5 — ligações ilustradas entre regiões

Em implementação, retomada do pedido durante conferência da1.14.4. Nova referência: 3caa94de2cda93ccea2e1320d94c03114ecfe611.jpeg (Farm Heroes), usar apenas direção composicional: terrenos em patamares, margens coerentes e pontes entre regiões, sem copiar logo, UI, animais ou arte do jogo de terceiros.

Problema observado no navegador: a1.14.4 ganhou área útil e removeu a borda rígida, mas as imagens ainda se reconhecem como placas diferentes com mistura de detalhes. Objetivo: cobrir a junção com uma composição ilustrada original planejada, não ampliar os fundos nem deslocar níveis. Interface compacta e identidade distinta dos módulos da1.14.4 preservadas.

Plano delimitado: oito ligações originais (casa/jardim, floresta, riacho, floresta→riacho × duas orientações). Assets de ligação têm orientação inversa à do scroll: mapa vertical usa remendo paisagem1536×1024 atravessando a largura; mapa horizontal usa remendo retrato1024×1536 atravessando a altura. Tamanho renderizado uniforme2:3/3:2, cobrindo .444 de um trecho e preservando as âncoras calibradas. Máscara só nas extremidades, centro opaco; não alterar os doze fundos. Referências reais dos dois lados enviadas ao imagegen para cada composição. Essas pontes são ilustrações do seletor; nenhuma nova ponte jogável está sendo criada.

Base publicada1.14.4/Sites70: e24e553c65894858f229daf3819c28f5c22b7b34; saved appgprj_6ac40994d8d881919d46203a60801e46~appgver_06dbaf38addc8191854299b38599cdd2; deployment appgdep_6ad44aabd8bc8191a14ae4d2b4740676. GitHub base e4168a547c912ded927cd6e7d1068d0bd6bb9d0c. Mesma URL, contas e saves.

Verificação e publicação pendentes. Navegador autenticado disponível somente1363×936; nenhum método de resize anunciado. Não alegar teste em celular retrato. Usar screenshot do proprietário como evidência anterior, e cenários reais em paisagem após publicar. Os oito mundos legados de Aventura continuam com arte original.

## Pedido adicional de1:33
David pediu conferir celular horizontal após atualizar e compor Aventura com os cenários próprios de cada mundo/nível. Mantidos oito backgrounds originais GAME_ASSETS.levels e casa/bosque ilustrados compatíveis dos mundos1/6; itens reais e mascotes continuam por fase, sem usar o riacho genérico de Exploração na Aventura. Teste de fonte cobre a correspondência de cenários e recompensa da fase52.

Preparada página isolada de QA `qa-map-viewport.html` com iframe same-origin sem bypass de login, sem dados de save artificiais e sem vínculo no fluxo normal do jogo. Botões definem o viewport real do iframe em844×390 ou390×844; não é CSS aplicado sobre a página principal nem emulação de toque/DPR. O próprio app recebe resize e mediaqueries reais. Inspeção browser usando essa página ainda pendente; não alegar teste físico. Nenhum cabeçalho de segurança foi alterado.

## Implementado
Oito WebP originais qualidade82 sem redimensionar. Manifest em `docs/evolution/trail-junctions-v1-manifest.json`, com dimensões, origem, nomes PNG de geração e SHA256. `trailJunction.ts` define composição e proporção, `TrailSeams` usa centro opaco e bordas suaves, protegendo o terreno original sob os botões com máscaras radiais. Não mudar as âncoras para acomodar erros de geração. Cenários por mundo e recompensas por fase conferidos em teste SSR de Aventura. Viewport horizontal curto recebeu redução do cartão inicial, espaçamentos e altura mínima, mantendo rolagem vertical de segurança para não cortar controles.

TypeScript passou. 440 testes offline/43arquivos passaram. Build passou com aviso existente de chunks grandes; os20assets (12fundos+8ligações) do pacote conferem com seus manifests. Nenhuma sala/fase jogada, nenhum FPS medido, nenhuma emulação de toque/DPR. Inspeção após publicação em quatro combinações de módulo/orientação ainda pendente.

## Publicação e QA concluídos — 1.14.6
1.14.5 publicada como Sites71, source2420ca8a6b52321d887f6286f14984242e8a4b1c, deployment appgdep_6ad44eb8a9308191958a2aa7256636d3. No QA real de844×390 e390×844, encontrado crescimento do mapa da Exploração ao girar vertical→horizontal: frame ultrapassava2500px, gerando zoom. Correção delimitada1.14.6: frame sem flex-grow e altura explícita calc(100dvh - 150px) em celular horizontal. Não alterar saves, níveis ou âncoras. TypeScript e build passaram novamente;440testes do ciclo1.14.5 mantidos, sem repetir suíte para alteração apenasCSS/version.

1.14.6/Sites72: source82bfe6a17622f7bf7c85487b5447b15d498d54c0; saved appgprj_6ac40994d8d881919d46203a60801e46~appgver_872277fc8c98819192ee48752d5f7408; deployment appgdep_6ad45083c1bc8191ab5a2decd85ce6a9 succeeded. GitHub implementação7d834e51df2e082f1b235479661dbcc6fcb450ff.

Rechecados os dois seletores nas duas orientações. Frame horizontal Aventura230px, Exploração240px após giro; sem overflow horizontal de documento (390=390 e844=844). Botões info/fechar/retorno acessíveis; Aventura precisa de pequena rolagem vertical para ver todo o mapa horizontal. Percorrida trilha até fase100 e sala20 sem desbloqueios artificiais;141 imagens da Aventura sem falha de carregamento. Prêmios e mascotes reais mantidos, oito mundos legados usam seus backgrounds próprios (não novos mapas ilustrados). Cenários novos e junções ainda não equivalem pixel a pixel à referência; oito mundos legados mantêm vinhetas com limites visuais perceptíveis e precisam futura composição autoral. Pequena legenda do mestre pode ficar cortada na extremidade final.

Provas visuais locais: meupet-1146-aventura-horizontal.jpg, meupet-1146-aventura-vertical.jpg, meupet-1146-exploracao-horizontal.jpg. Teste foi navegador cloud com viewport real em iframe, não celular físico/touch/DPR/FPS. Nenhuma fase jogada/completada. WebGL indisponível no cloud impede casa3D, fora deste ajuste dos seletores2D.
