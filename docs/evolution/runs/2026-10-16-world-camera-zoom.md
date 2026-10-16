# Zoom da câmera — 2026-10-16

Base Sites: 260acaf65552fd41d0c9cffea68672a1a2a24499 (produto 1.9.36). Mesmo projeto, domínio, contas e saves.

Pedido: aproximar pet e cenário, independente do tamanho da lupa. A câmera já aceitava zoom, mas o componente mantinha valor fixo em 1.

Implementado: controles Câmera +/−, entre 1× e 2× em passos de 0,25; alvos de 44 px e indicação da escala. Limites desabilitam o respectivo botão; inspeção de mapa completo suspende controles e preserva aproximação ao voltar. Cancelamento da rota por toque ao alterar escala. Mesma projeção já usada pelo desenho e pela conversão de toque; física, recompensas e saves inalterados.

Verificação: TypeScript passou; 45 testes direcionados passaram. Teste novo cobre escalas em 375×667, 390×844, 844×390 e 1366×768, projeção inversa do toque, cobertura do fundo e independência do mapa completo. São cálculos offline, não sessões reais em navegador. Build de produção passou.

Bloqueio: control-browser não disponível. Skill de evolução exige inspeção real antes de publicar mudanças visuais. Fonte salva para revisão; publicação não iniciada. Conferir posições e interação por toque nos dois modos de orientação antes de publicar. Nenhuma conta real alterada.

Pesquisa técnica (16/10/2026):
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale — escala uniforme de objetos e posições.
- https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect — coordenadas do toque relativas à área visível.

Rollback: manter publicação corrente; descartar somente commit deste ciclo se rejeitado.


## Publicação autorizada para teste
David solicitou explicitamente: “Publique e eu vou fazer o teste”. Recuperada fonte Sites e7e1228f445b663a083ae9f324aad2e318e5b222 com a mudança já salva, sem substituir por ramo GitHub anterior. Rótulo atualizado para1.9.37 para distinguir da1.9.36 pública. Conferência visual continua pendente no aparelho. Recompilar pelo helper de release antes de empacotar; não usar o arquivo world-camera-review.zip de outro ambiente, cujo conteúdo/manifesto não correspondem ao fluxo corrente.

Publicação concluída: produto1.9.37 / Sites56; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_a396c5f269408191967c4fe6ce42f6a5; deployment appgdep_6ad260f1eefc8191a90ebee882f5b709; fonte 4009a9561013ed5ed21b31b51acdeede01872e58; GitHub 78c49bd6f6f4897488c6282e5b4801154288b304. TypeScript/build e214 testes game aprovados. URL https://meupet.aquimeusite.chatgpt.site. Aparência e toque pendentes do teste do usuário.
