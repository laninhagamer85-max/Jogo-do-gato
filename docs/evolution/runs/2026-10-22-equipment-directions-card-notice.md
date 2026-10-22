#1.36.1 — Empunhadura e aviso de carta

Estado: integrado à1.37.0, aguardando publicação conjunta;1.36.1 não foi publicado separadamente. Base fonte Site d190e3e260587aad744fc67acf1133ff00a5bbb6, produto1.36.0, versão nativa125; GitHub esperado0d0460af9061ae79de3aa68b813bfac00bca52d6.

## Problemas e correções
- Espada real tinha ponta/cabo invertidos: rotação assumia uma diagonal genérica, enquanto a arte original aponta para baixo/esquerda. Novo módulo explorationHeldPose.ts descreve punho e extremidade útil em coordenadas normalizadas por família de bitmap. Calcula rotação pelo vetor punho→ponta em vez de compensação fixa. O punho permanece na mão durante o arco do golpe.
- Aplicado também a espada/adaga/arco iniciais, versões metal/ouro/diamante e machado/picareta, incluindo os reais. Versões melhoradas estavam usando um ponto fixo fora do cabo; ferramentas reais têm o cabo no lado oposto ao atlas comum. Flecha mantém seu eixo horizontal de origem. Camadas atrás/na frente do corpo continuam pela direção do ator.
- Aviso Carta rara conquistada era uma condição permanente baseada no histórico do mestre. Agora exibe apenas nova derrota observada na sessão, fecha em8segundos e possui botão Fechar. Entrada em save com mestre já vencido não recria aviso. Carta, inventário e efeitos permanecem intactos. Texto não afirma equipada quando os dois espaços já podem estar ocupados.
- Laboratório isolado ampliado para famílias de equipamento/material e casos de carta nova/antiga. Não lê nem modifica perfil real.

## Prévia de estradas
Usuário pediu mostrar antes de aplicar. Gerada comparação visual pedra/areia larga nos biomas bosque/rio/outono/nascentes. Anexos acessíveis confirmaram o piso do platô circulado vermelho como referência e estrada amarela circulada verde como problema. As trilhas NÃO foram alteradas neste hotfix. Proposta continua para análise do usuário. Na versão publicada1.36.0, a vila ainda era piloto na sala1. A expansão posterior está documentada no relatório de crescimento da1.37.0.

## Validação
-737 testes/74arquivos aprovados; somente Firebase staging integration excluído por credencial externa. Novos casos verificam punho fixo e ponta no semiplano frontal em8direções e5posições do golpe; arco de ataque permanece menor que90graus.
-TypeScript aprovado; build oficial será executado no empacotamento.
-Navegador preview oficial isolado: espada real e picareta real, arco ouro, adaga diamante e machado metal em8direções. Direção correta e cabo na mão. Sala30 carregada com mestre vencido sem aviso; nova derrota mostrou o aviso e botão Fechar; waitFor(hidden) confirmou encerramento automático sem interação.
-Não houve playtest em telefone físico nem medição deFPS. Não alegar todas as combinações jogadas manualmente.

## Referências técnicas consultadas2026-10-22
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate — mover a origem para o punho antes de rotacionar e desenhar o bitmap com offset de sua âncora.
- https://react.dev/reference/react/useEffect — temporizador descartado no cleanup e acionado pela conquista nova, não por histórico persistente.

## Publicação
Pendente. Rollback1.36.0 versão125, appgprj_6ac40994d8d881919d46203a60801e46~appgver_752e8f0bb3e88191bd4574ccb5f01f0a. Preservar público, domínio e contas.
