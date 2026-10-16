# Zoom na borda da lupa — 1.9.38

David confirmou que a1.9.37 funcionou e pediu remover a barra de zoom que ocupa espaço. Fonte pública4009a9561013ed5ed21b31b51acdeede01872e58 recuperada pelo fluxo Sites; mesmo domínio/projeto.

Ajuste: removida barra Câmera com dois botões/output; um único botão ZoomIn/ZoomOut, na posição inferior direita da borda, alterna1×/2×. Botão inferior esquerdo continua +/− apenas para tamanho da lupa, sem alterar câmera. Mantidos som, pausa, mochila e mapa completo. Alvos44px e estilo original de madeira. Controle da câmera desabilitado em visão geral, preserva zoom ao voltar e cancela rota por toque ao mudar escala como antes. Física, vegetação, contas, saves e recompensas sem alterações. Sem nova arte.

Teste de layout agora cobre seis alvos em375×667,375×812,390×844,844×390,1366×768, lupa normal/ampliada. Novo teste verifica alternância e retorno a1× de valores intermediários. Conferência visual/toque ainda dependem do usuário porque control-browser está indisponível.

Rollback: Sites56 / produto1.9.37. Próximo: usuário testa os dois controles distintos (tamanho e câmera), ida/volta ao mapa e orientações.

TypeScript, build e215 testes game em26 arquivos aprovados. Build preserva aviso preexistente de chunks grandes. Sem inspeção real em navegador neste ciclo.

Publicação concluída: produto1.9.38 / Sites57; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_04a931166fc481918432d84bf25028f9; deployment appgdep_6ad263674d6481918f78a7f0ad6038ec; fonte 3f91ca1881667d06bcbdefcbf564cea2c4be4342; GitHub 9e334f8a139ce09d41bb30640bbd2566dd644c06. URL https://meupet.aquimeusite.chatgpt.site. TypeScript/build e215 testes aprovados. Visual/toque aguardam usuário.
