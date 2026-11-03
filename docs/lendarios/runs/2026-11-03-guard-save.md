# 03/11/2026 — Ocorrências da guarda nas salas finais

**Implementado e validado nos testes focados; revisão não publicada.** Produto proposto 1.0.30, base pública 1.0.29 / Sites31. Destino exclusivo Lendários do Rei: https://lendarios-do-rei.aquimeusite.chatgpt.site, projeto appgprj_6ae2a66e7f4c8191860c2d39db928ac7.

## Recuperação e mudança

A publicação avançou desde o último ciclo. Sites31 foi conferido com status nativo succeeded, deploy appgdep_6ae9b7d28a9c81919616077d089e68db, versão appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_3ace2eb965d48191a377eaed7fcd1117, fonte 3ae8885d0646768409fce04c3fa4c07b18a2e619. O checkout foi aberto pelo helper oficial. Produto do package.json: 1.0.29. A segunda consulta continuou retornando Sites31. O GitHub canônico ainda estava em d873800cae4d2b5de4172dd12090a9f82cc269ff, com documentação de1.0.17. Não reutilizamos seu runtime antigo.

Lidos AGENTS.md, README, README da aplicação, estado atual do Site e relatório runs/2026-11-03-sites-d1-setup.md, além do estado/relatório GitHub de02/11. O build agora inclui Worker e D1; mantidos manifest, bindings, migrações, serviços, login, interface e público existentes. Nenhum dado de jogador ou banco de produção foi acessado/modificado. Meu Pet Virtual não recebeu alteração de runtime ou deploy.

Problema concreto: readVillageOrder ainda recusava índices acima de31, embora EXPLORATION_ROOM_COUNT seja40. Ao recarregar, ocorrências válidas das salas33–40 desapareciam. O limite passa a usar a constante da campanha, mantendo rejeição de números negativos, fracionários, não numéricos, futuros e identidades de outra sala. O prazo original de detenção continua preservado; não há alteração de sanções, trajetos, colisão ou representação visual.

Acrescentados49 testes:40 índices válidos, snapshot/restore da sala40, sete entradas de sala inválidas/futuras e identidades de sala diferente. Antes da correção, nove falharam (oito salas finais e o roundtrip); depois todos passaram. Seis testes preexistentes da guarda voltaram a executar ao usar uma fixture real da sala11/núcleo2, com um guarda e dois adultos elegíveis. Permanecem as verificações de resposta, escolta, liberação aos60segundos, não punição de criança/vítima, rotina de terceiros e saída de rota inalcançável. A fixture anterior exigia um guarda no núcleo0 da sala1 que a seleção atual de aparências não oferece. Isso não foi mascarado como correção da população da sala1.

## Pesquisa primária —03/11/2026

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger — conservar validação estrita de índices inteiros sem coerção de strings.
- https://vitest.dev/guide/test-context.html — fixtures com estados de teste próprios; reutilizamos somente moradores reais e dados sintéticos. Nenhuma conta real ou estado do navegador foi usado.

Nenhuma arte/dependência nova; instalações respeitaram lockfiles existentes. Código não extraído de referências visuais.

## Verificação e limites

-55/55 testes de guarda e limites do save após a correção; baseline do teste novo: nove falhas e46aprovados em55testes.
-85/85 testes em nove arquivos de vila/rotinas/notícias/labels/ferramentas/gravação. Incluem os55 acima.
-78/78 testes em cinco arquivos de regressão de save do capítulo4, desempenho de snapshot e domínio/runtime/serviço multiplayer. São testes offline; não comprovam multiplayer ou D1 online.
-TypeScript do jogo e do host Worker aprovados.
-Build oficial scripts/build-lendarios-sites.mjs aprovado: jogo, rotas e Worker;421arquivos do jogo conferidos byte a byte entre a saída do cliente e os assets empacotados. Avisos existentes de chunks grandes/classificação estática de rotas. Lockfiles inalterados. Configurações, migrações e MULTIPLAYER_ENABLED preservados.
-git diff --check e aplicação do patch com --check --cached no índice original e aplicação reversa no checkout editado aprovados. O patch registra os dois arquivos alterados de guarda, o teste novo e o incremento de produto proposto; não foi aplicado ao runtime GitHub antigo.
-A suíte completa offline foi iniciada com dois workers, timeout de15s por teste e Firebase staging excluído. Não terminou dentro da janela de verificação e foi interrompida com Ctrl+C (exit130). Não há total final nem aprovação global. Os resultados parciais não substituem uma suíte concluída.
-Na fonte publicada sem a correção, execução isolada de cinco arquivos:70aprovados/13falhas em83testes. Outro arquivo de fauna:4aprovados/2falhas em6testes. São15falhas preexistentes verificadas nesse recorte: dez expectativas de ausência de hostis no capítulo4 (agora há fauna), duas de fauna/floresta, duas de identidades e uma de mensagem de autenticação. Os testes de população desse recorte passaram. Não reduzir ou apagar asserções sem reconciliar as regras atuais.
-Evidências resumidas em ../evidence/2026-11-03/: related-tests.log, save-host-tests.log, baseline-summary.log, baseline-wildlife-summary.log, build-summary.log e full-suite-partial.log. Os logs de baseline foram condensados para omitir grandes dumps de inimigos, mantendo asserções e totais.
-Sem nova inspeção visual ou playtest: alteração limitada à leitura de save e fixtures, sem mudar aparência, animação ou física. Não foi iniciada prévia, feito login, desbloqueio ou gravação de partida real. Fases online concluídas0; tentativas, mortes, duração de percurso e dificuldade não medidos.

## Publicação e continuidade

**Nenhuma versão salva ou publicada neste ciclo.** A correção focada está aprovada, mas a validação ampliada ficou incompleta e as15falhas citadas foram confirmadas na fonte pública atual. Preservamos a revisão em GitHub sem substituir a publicação recente. A revisão antiga de retry de gravação e de mensagens continua aguardando rebase sobre esta fonte; não foi aplicada silenciosamente.

Rollback/referência preservada: produto1.0.29, Sites31 e fonte citados acima. Não houve deploy para reverter, merge automático, force-push, mudança de domínio, acesso, credenciais, banco de produção ou rotina.

Próxima ação: reconciliar testes de fauna/identidades com o comportamento autorizado atual; investigar por que a suíte ampliada não termina e obter uma execução completa. Manter explícita a ausência de guarda na seleção da sala1 antes de alterar a distribuição dos moradores. Depois rebasear as correções pendentes, validar e publicar a próxima versão a partir da fonte atual do Site, sem restaurar a1.0.17.
