# Zoom na borda da lupa — 1.9.38

David confirmou que a1.9.37 funcionou e pediu remover a barra de zoom que ocupa espaço. Fonte pública4009a9561013ed5ed21b31b51acdeede01872e58 recuperada pelo fluxo Sites; mesmo domínio/projeto.

Ajuste: removida barra Câmera com dois botões/output; um único botão ZoomIn/ZoomOut, na posição inferior direita da borda, alterna1×/2×. Botão inferior esquerdo continua +/− apenas para tamanho da lupa, sem alterar câmera. Mantidos som, pausa, mochila e mapa completo. Alvos44px e estilo original de madeira. Controle da câmera desabilitado em visão geral, preserva zoom ao voltar e cancela rota por toque ao mudar escala como antes. Física, vegetação, contas, saves e recompensas sem alterações. Sem nova arte.

Teste de layout agora cobre seis alvos em375×667,375×812,390×844,844×390,1366×768, lupa normal/ampliada. Novo teste verifica alternância e retorno a1× de valores intermediários. Conferência visual/toque ainda dependem do usuário porque control-browser está indisponível.

Rollback: Sites56 / produto1.9.37. Próximo: usuário testa os dois controles distintos (tamanho e câmera), ida/volta ao mapa e orientações.

TypeScript, build e215 testes game em26 arquivos aprovados. Build preserva aviso preexistente de chunks grandes. Sem inspeção real em navegador neste ciclo.
