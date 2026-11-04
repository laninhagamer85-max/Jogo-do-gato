# Publicação da revisão Manus — 14/10/2026

Pedido explícito de David: validar a atualização do Manus e publicar no Site existente.

Fonte escolhida: PR #5, fix/qa-adventure-rotation-20261014, HEAD 609b1d0934ef62137017a9bd4ca86868eb23fcf2. PRs #4 e #5 não foram mesclados. As diferenças de client/scripts entre o Site v10 e o ramo foram recuperadas diretamente do commit. Não houve mudança de física/dificuldade durante a integração.

Entrega: terreno proporcional e sombras apenas na fase 1; apoio elevado preservado ao redimensionar; pausa explícita e HUD preservados. Contas, credenciais e saves não foram alterados.

## Evidência externa e limites

Relatório de aceite: https://github.com/laninhagamer85-max/Jogo-do-gato/blob/609b1d0934ef62137017a9bd4ca86868eb23fcf2/docs/evolution/reviews/2026-10-14-manus-qa/ACCEPTANCE-STAGE1.md

Manus executou Chromium isolado e matriz 375×667, 375×812, 390×844, 844×390 e 1366×768. Uma conclusão guiada por teclado da fase 1, sem teleporte, 0 mortes, 3 vidas, 33,5053 s de motor; 13 moedas, 2 itens, 2 estrelas, prêmio de 195 moedas, torre e 2 sardinhas. Retorno ao mapa e fase 2 por toque com desbloqueio orgânico. Não é partida humana nem online. A fase 2 somente foi iniciada. Não se declara auditoria de 100 fases.

Hashes locais de motor, níveis, PetGame e PlatformAdventure conferem exatamente com o acceptance-summary.json do Manus. Essa comparação preserva a validade das evidências externas; não representa um novo playtest aqui. Navegador gerenciado continua indisponível neste ambiente, sem preview alternativo. Celular físico, Safari/iOS e conclusão completa por toque permanecem pendentes, assim como autenticação staging fora deste escopo.

## Verificações locais

TypeScript aprovado; 50/50 testes offline aprovados; verificadores de terreno, entrada (101 estados, não partidas) e atlas/armazenamento falso aprovados. Nenhuma integração Firebase executada. Build de release aprovado com aviso existente de chunks grandes. Sem alterações de dependências. Assets antigos permanecem disponíveis para abas abertas.

## Publicação e rollback

Pacote será publicado pelo fluxo oficial de Sites no mesmo projeto público. A confirmação e IDs finais são registrados no ramo de colaboração depois do retorno do deploy. A v10 é o rollback imediato; não alterar progresso ao restaurá-la. A rotina permanece pausada até decidir a retomada separadamente.

Publicação confirmada: v11, appgprj_6ac40994d8d881919d46203a60801e46~appgver_0538219100148191ac0a851264317359; deployment appgdep_6acf8a138e048191bd527d5efb51817f, status succeeded, 2026-10-14T13:56:56.652209+00:00. Site commit 8faea77b76aebd0d6d8861c6cab21d2c2944e4b0. URL https://meupet.aquimeusite.chatgpt.site. Rollback imediato: v10.
