# Lupa aprovada com atalhos — 1.9.36

Base publicada 1.9.35 / Sites54 / c77279a439922d8feef6327d5fe19c9fb0c65f0b. David aprovou proposta com lupa maior e controles presos à borda; pediu botão único com funções alternadas para tamanho, pausa, som e mochila, e publicação para testar.

Implementado: cinco posições fixas com botões de madeira/latão: som superior esquerdo, pausa/retomar no topo, mochila/fechar superior direito, ampliar/reduzir em UM botão inferior esquerdo e mapa completo/voltar embaixo. Lupa sem cabo e com terreno preenchendo a lente. Ampliação é do tamanho do minimapa, não do zoom da câmera do jogo. Foram removidos os atalhos antigos flutuantes.

Lupa normal136–168px e ampliada160–214px em retrato;124/158px em paisagem. Alvos de44px, viewport atualiza no resize. HUD tem largura reservada ao lado. Painéis não modais pausam a partida e ficam abaixo da lupa (à esquerda em paisagem), deixando o próprio botão disponível para fechar. ESC/P alternam pausa/retomar, I alterna mochila. Eventos de combate não capturam espaço/enter de botões focados. Trocar painel limpa entradas/destino, visão geral pausa e o mesmo slot permite voltar. Conta, saves, recompensas, vegetação, gramado e arte do portal preservados.

Verificação: TypeScript aprovado;213 testes em26 arquivos passaram;8 novos testes verificam transições e geometria dos cinco alvos em375×667,375×812,390×844,844×390,1366×768, normal/ampliado. Após ajuste de foco/retomada, TypeScript e8 testes específicos repetidos; build final aprovado, com aviso preexistente de chunks grandes. Norte posicionado abaixo do atalho de pausa. Essas verificações são offline/modeladas, não gameplay real. Navegador suportado permanece indisponível; nenhuma declaração de validação visual/FPS. Publicação explicitamente pedida para teste do usuário.

Arte: botão original imagegen baseado na moldura circular existente, madeira marrom pintada, latão fino, luz superior esquerda, centro preenchido de madeira sem símbolo/texto, alfa fora do círculo. Ícones do sistema existente inseridos pelo componente. 1254×1254RGBA convertido para WebP; arquivo client/public/forest-adventure/map-dock-button-v1.webp, SHA256 d635e05c11c0b4e85fbf105132e3bcfe71fbc05482a217f96e2a596c567251da. Sem material de terceiros.

Rollback: Sites54 / produto1.9.35. Conferir a publicação corrente antes de reverter. Próximo: usuário testa cada slot duas vezes, mochila/pause/visão geral, redimensionamento e foco em retrato/paisagem.

Publicação concluída com sucesso: produto 1.9.36 / Sites55; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_8da3efe91af88191b4c1a22dc764f416; deployment appgdep_6ad2573f3c648191b154975cd0e5549e; fonte 260acaf65552fd41d0c9cffea68672a1a2a24499; código GitHub 386858ab2dda2f233fbd6f561d04738084e69c4c. URL https://meupet.aquimeusite.chatgpt.site. Gameplay visual pendente de revisão do usuário no celular.
