# Release do protótipo do Manus — 14/10/2026

David trouxe autorização registrada no Manus para publicar a cadeia #4–#6 com as pendências conhecidas do protótipo. A publicação ocorre aqui no Sites existente; a sessão WebDev do Manus não está vinculada ao destino e não foi usada para deploy.

Fonte escolhida: PR #6, feat/pet-motion-20261014, d0a5d08c7f7564a9d3c0adeaa6a9758d2c460103. Runtime idêntico ao commit testado 0338794415abfecdb2d65177a12ec65e18046e7e; o diff entre esses commits contém somente o relatório. As alterações funcionais são copiadas diretamente para a fonte do Site, sem merge de PRs.

Entrega: modo experimental Exploração do Bosque, puzzle de tronco/placa/portão/chave/saída em memória, sem persistência ou recompensas; poses de repouso, corrida, subida, queda e pouso na Aventura existente. Nenhuma mudança de hitbox, física ou economia. A animação não é ainda um ciclo de patas com múltiplos frames.

Evidências externas: docs/evolution/reviews/2026-10-14-pet-motion/REPORT.md no mesmo commit. Manus relata matriz 375×667, 375×812, 390×844, 844×390 e 1366×768; puzzle resolvido com 21 movimentos de seta, toque, pausa/retomada e reinício; corrida/salto no Canvas. Automação em navegador isolado, não jogador humano ou partida online. Sem erros de runtime relatados. O texto antigo do relatório cita v10; a versão pública imediatamente anterior confirmada aqui é v11.

Pendências aceitas: sprites de corrida ainda são uma pose deformada; sem teste em celular físico ou Safari/iOS; primeira sala experimental sem campanha, salvamento ou economia; pequenas rolagens descritas no relatório. Não declarar 100 fases validadas. Navegador gerenciado local indisponível; nenhuma inspeção browser independente feita aqui. Preservada a evidência externa do runtime idêntico.

Checks locais: TypeScript, 60 testes offline, invariantes de entrada/terreno/paridade e build. Resultado final registrado no ramo de colaboração após o retorno. Integração Firebase excluída; nenhum save/conta real usado. Assets e configuração de conta existentes preservados.

Publicação pelo fluxo oficial no projeto appgprj_6ac40994d8d881919d46203a60801e46, acesso público inalterado. Rollback imediato: v11, appgprj_6ac40994d8d881919d46203a60801e46~appgver_0538219100148191ac0a851264317359. PRs continuam sem merge; rotina não reativada.

Resultado final: TypeScript e 60/60 testes offline passaram, todos os verificadores passaram e build aprovado (aviso existente de chunks grandes). Publicação v12 confirmada, status succeeded, 2026-10-14T16:59:10.706299+00:00. Version appgprj_6ac40994d8d881919d46203a60801e46~appgver_cec6532f0bdc8191a33f639e51a1f20f; deployment appgdep_6acfb4c402f08191966514c9a43d6ad4; source 47a07c607879a443b2fe9b2686795e118a2495ba. URL https://meupet.aquimeusite.chatgpt.site. Sem merge/force-push.
