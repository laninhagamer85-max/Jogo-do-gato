# 1.24.0 — Sala piloto do Capítulo 4

Escopo autorizado: apenas sala 31, Jardim das Nascentes. Sem NPCs novos nem salas32–40. As próximas variações aguardam aprovação de David.

Solo verde pintado, pedras claras e musgo, três nascentes, vegetação distribuída, casa de telhado verde e platô elevado. Quatro materiais originais gerados para o jogo; procedência, tamanhos e hashes no manifesto `client/public/forest-adventure/chapter4/assets-manifest.json`. Texturas repetidas em unidades do mundo, sem ampliar uma imagem completa do cenário.

Desafio: coletar12fibras e ativar placas1/2/3 em ordem; isso libera a rampa. Subida pelas laterais do platô é bloqueada; o acesso e o roteamento respeitam altura e água. Portal conclui o piloto. Capítulo parcial tem exatamente uma sala e contador correto. Prévia isolada na tela Exploração permite testar sem gravar na conta. Progresso real permanece sequencial. Abrigo muda apenas neste bioma nesta entrega.

Persistência: campaignVersion5 na nova sala, preservada ao equipar lendário ou rejogar. Leitores antigos recusam a nova versão, evitando reduzir sala31 para30. Salas anteriores preservadas.

Validação: TypeScript passou;558/558 testes em57arquivos passaram, sem integração FirebaseAdmin de staging por ausência de credencial. Testes exercitam coleta, ordem errada/correta das placas, abertura, subida, bloqueio lateral, retomada e conclusão com inventário sem duplicação. Browser isolado em844×390 e390×844: casa, solo, mapa completo, retorno ao pet e controles observados. Não foi uma conclusão completa pelo navegador; conclusão foi verificada no motor headless. Sem medição de FPS ou teste em telefone físico.

Pesquisa técnica consultada20/10/2026: https://docs.mapeditor.org/en/stable/manual/terrain/ — transições por materiais; https://www.redblobgames.com/pathfinding/a-star/introduction.html — navegação com obstáculos. Nenhum conteúdo desses sites foi copiado para arte.

Publicação: fonte preparada para o Site existente; identificadores finais serão registrados após confirmação do serviço. Revisão de aceitação: densidade vegetal, leitura do relevo, estilo do solo/casa e desafio no celular. Só depois expandir o capítulo e criar NPCs.

## Publicação confirmada

1.24.0, Sites108, status succeeded. Versão `appgprj_6ac40994d8d881919d46203a60801e46~appgver_07d8463dbdac81918bf19495353dcf7b`; deployment `appgdep_6ad77e5d9fd08191b70918fb214568ed`; fonte `fba08c2c682628e5f5c1ccd7a5d0e511f975399b`. URL https://meupet.aquimeusite.chatgpt.site, público preservado. Build18.73s; arquivo gzip validado antes de salvar. GitHub código `d0175bb0828272e80f753d97081fc12fcefc79be`, branch `review/grass-option3-20261016`, atualização sem force e com lease. Capturas `../screenshots/meupet-1.24.0-horizontal.jpg` e `../screenshots/meupet-1.24.0-vertical.jpg`. Inspeções adicionais375×667 e375×812; telefone físico pendente.

Rollback disponível1.23.1/Sites107 (`appgprj_6ac40994d8d881919d46203a60801e46~appgver_84aa8a74e5e481918b24b08c03a7c765`), somente se não houver publicação posterior. Uma única publicação neste ciclo.
