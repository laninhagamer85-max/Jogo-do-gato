# 1.27.0 — Castelo e correções de elevação

Estado atual: PUBLICADO1.27.0 / Sites112 em21/10/2026. Histórico abaixo preserva o checkpoint anterior.
Base publicada: 1.26.0 / Sites111, source eafc76b5d8bf85981139b498f64d81b2e648f07c. Checkout base aac3ac7ba6f9bac1b1b2f6f3b677d4c8494f6bd8. GitHub lease 5793a8853714445b917ad277aa2fd3306bda1225.

## Escopo

- Plataformas sem árvores/escadinha incorporadas; árvores independentes do bioma com colisão nas raízes, ordenação por profundidade e mesma composição no mapa.
- Escadaria independente com transformação uniforme entre dois pés medidos; polígono caminhável usa a mesma transformação. Recorte físico em runtime remove halo residual fora da pedra. Sem deformação independente dos eixos.
- Marcador vermelho “Você está aqui” no mapa completo do exterior, com legenda contida no viewport.
- Portão do castelo na sala32 conecta ao Capítulo5 como ramificação. A campanha principal continua com32 salas: não inventamos salas33–40 para acomodar o castelo.
- Interior fechado de seis cômodos: Vestíbulo, Guarda, Biblioteca, Trono, Arsenal, Refeitório. Móveis ilustrados independentes; colisões; passos em quatro direções com atlas existente; Lendário/equipamento existente preservado.
- Grafo único para portas, transições bidirecionais e mapa completo. Todos os portais livres nesta etapa. Joystick, teclado e toque com busca de percurso. Retorno ao exterior pelo Vestíbulo; cooldown e ponto de chegada evitam loops.
- Progresso de visita/posição persistido junto ao save existente. Inventário, HP e XP não são duplicados. Exterior pausa ao entrar. Sem NPCs, recompensas ou desafios novos dentro do castelo nesta rodada de composição/navegação.

## Pesquisa e direção técnica

Documentação oficial consultada em20/10/2026: https://docs.godotengine.org/pt-br/4.x/tutorials/2d/using_tilemaps.html . Aproveitados apenas princípios de separar desenho, colisão e navegação, e de ordenar objetos pela profundidade. Motor mantido React/Canvas. Arte gerada original do kit interior; castelo exterior é referência fornecida pelo usuário. Manifestos de assets registram recortes, âncoras e limitações.

## Verificação

Typecheck e573 testes offline passaram no fechamento do checkpoint. Build de produção concluído pelo helper oficial; archive íntegro (gzip -t). Source de revisão enviado:324b6aea66d0e0f8a18502d8c02a73228e1dc7f5. Integração FirebaseAdmin excluída por exigir credencial staging, sem alterar autenticação.

Navegador real em fixture isolada (sem escrita em conta): observado portal exterior32 → Vestíbulo → Salão do Trono; mapa de seis cômodos e ligações visível em844×390 e390×844. Após mudar para vertical e fechar o mapa, captura do navegador travou; duas operações e até reset retornaram timeout300s. Não confundir esse timeout da ferramenta com bug confirmado do jogo.

PENDENTE antes de publicar: inspecionar visualmente escadaria/pé superior/inferior das duas plataformas; retorno jogado do castelo ao exterior; navegar visualmente os outros quatro cômodos; conferir controles e recorte em375×667 e844×390; capturar prova visual final. Os testes automatizados cobrem portas/chegadas/colisões/saves, mas não substituem essa inspeção.

A publicação permanece1.26.0. Preservar este checkpoint e retomar QA quando o navegador responder. Não publicar só por terminar build.

## Retomada de publicação —21/10/2026

Ambiente recuperado do source ab2461479129c6366794bba8c1f858c2d9a66b4b após limpeza automática. Dependências restauradas pelo helper oficial, sem alterar versões.

Corrigida quantização dos destinos de toque nas portas laterais: coordenadas de borda agora são aproximadas para uma célula caminhável antes do trecho final. Adicionadas áreas de toque transparentes/acessíveis sobre os próprios portais; o personagem caminha, sem teletransporte por botão. Testes percorrem todas as ligações e saída através dos movimentos reais do motor.

575 testes offline e typecheck passaram. QA em fixture isolada: entrada exterior32 → Vestíbulo → retorno ao exterior32, com HP/XP preservados; sala31 com escada independente e deslocamento nos degraus em844×390; sala32 com pátio/árvores e mapa completo/marcador em375×667. Sem teste físico em aparelho nem autenticação staging nesta rodada.

Estado: validação de publicação em andamento; IDs finais serão registrados após o deployment.

## Publicação concluída

Versão1.27.0 / Sites112. Source16dc524efcae3bc886e452a7354e91902baa33e3. GitHubdfdad39435ede4103f5911fbc7045ed4918779a9. Saved version appgprj_6ac40994d8d881919d46203a60801e46~appgver_4cd838fccb408191b0bdd7fbdf4e2143. Deployment appgdep_6ad8416cb930819191fb3b86d18d1eff: succeeded. URL https://meupet.aquimeusite.chatgpt.site.575 testes, typecheck e build passaram; integraçao FirebaseAdmin staging não executada por ausência de credencial. Browser QA foi isolado, não em conta real/aparelho físico. Não alegar percurso visual pelos seis cômodos: entrada/retorno foram jogados, portas de todos os cômodos foram percorridas na simulação de movimento.

Rollback: versão1.26.0 / appgprj_6ac40994d8d881919d46203a60801e46~appgver_2f4d75100ab08191b0f87107e56f7330. Próximo passo: teste do usuário, especialmente composição interna e plataforma/árvores. Nenhum NPC/desafio interno adicionado nesta primeira validação.
