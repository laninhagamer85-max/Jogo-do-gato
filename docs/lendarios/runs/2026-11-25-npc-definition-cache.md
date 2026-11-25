# 25/11/2026 — Reutilização das definições de NPCs

## Base e entrega
Lendários do Rei, fonte exata publicada `aeaab77263a8da7e92a8d952284280f45961eae4`, produto **1.0.145**, Sites148; deployment `appgdep_6b0689d65628819189b78e81903b0ede` succeeded em2026-11-25T07:10:30.863128+00:00. Fonte/HEAD coincidentes. O relatório GitHub ainda apontava1.0.142/Sites145;preservadas as revisões posteriores de HUD e mapas temporários. Lidos AGENTS, READMEs, retomada histórica, estado e relatório24/11. Documentação nativa histórica não foi usada como versão corrente.

Escolhida uma redução delimitada de trabalho no loop, dando continuidade à investigação dos travamentos ao andar/lutar. A lista de definições combinava novamente fauna, campanha, mestre e escoltas;simulação e desenho criavam novos índices por ID. Agora:
- Cache de uma configuração de fauna e uma combinação campanha/fauna, sem acumular todas as salas/contas.
- Invalidação por sala, seed do encontro, identidade da composição do mapa, disponibilidade e coordenadas de origem do mestre. Vida/posição atual/generation do mestre não mudam seus templates;estado vivo continua separado.
- Índice ReadonlyMap por identidade da lista em WeakMap, compartilhado pela simulação e desenho;sem modificar HP, colisão, movimento, prêmio ou save.
- Nova notícia e versão1.0.146. Sem dependências/lockfile novos, mudança de autenticação, domínio, público ou dados reais.
Arquivos: explorationWilderness.ts, explorationCombat.ts, explorationCombatView.ts, explorationEnemyDefinitionCache.test.ts, lendariosNews.ts e package.json.

## Pesquisa —25/11/2026
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap —metadados por identidade sem impedir coleta das chaves;índice não deve prolongar a vida das listas descartadas.
- https://web.dev/articles/speed-static-mem-pools —reduzir criação/descarte de objetos em rotinas frequentes pode reduzir pressão de coleta. Não se adotou pool nem se atribuiu a causa dos travamentos ao GC sem perfil.
Leitura de fontes primárias, sem copiar código/arte externa. Esta é uma hipótese de otimização localizada, não um diagnóstico completo do celular.

## Testes e medição
**33 testes relevantes aprovados em6arquivos**, contando a repetição isolada do inverno:4novos de cache, testes de mapas piloto, expansão do capítulo4, capítulo5, performance e regressão de movimento. O teste longo do capítulo5 excedeu5000ms em execução paralela;passou isoladamente (3/3), sem alterar teste/timeout. TypeScript jogo+host aprovados após gerar o catálogo pelo build. A primeira tentativa de tsc antes da geração apontou apenas os arquivos de catálogo ausentes e erros derivados.
Dois testes CivicSystems falham também na fonte1.0.145 restaurada:expectativa4005 aldeões contra5005 atuais e fixture que troca roomIndex sem recriar os inimigos da campanha, produzindo definição ausente. Confirmados7/9 na base, mesmos2erros;sem esconder, modificar essas expectativas ou alegar suíte completa.

Novos testes comparam o algoritmo anterior em40salas e2seeds, preservam templates durante90 passos simulados com movimento/ataque, verificam inverno, índices, separação de perfis e invalidação por configuração do mestre/mapa. Isso não é playtest dessas40salas.

Benchmark Node local:125definições,10000consultas por amostra,9amostras após aquecimento, ordem anterior/nova alternada. Medianas **282.039ms antes /2.754ms depois** para gerar lista+índice e consultar ID. Não mede FPS, quadro completo, GC ou desempenho em celular. JSON das amostras no diretório de revisão. Build oficial Worker aprovado, **600 arquivos preservados byte a byte**. Pacote final sem QA temporário;manifest mantém mesmo projeto,D1 DB eR2 null.

## Navegador e limites
Chrome, preview oficial, componente/motor reais em harness isolado com perfil “QA25 isolado”, onSave vazio e treino próprio do componente. O prop training cria sua partida separada na sala1;os valores preparados de sala4 não foram usados para alegar teste da sala5. Duas aberturas de treino, sem conta real, progressão persistida ou desbloqueio de conta.
- Caminhada pelo teclado observada:x2.65→3.55;NPCs em movimento e dano recebido;acionados ataque e poder por controles/teclas, energia caiu para~82%. Não foi comprovado abate/recompensa ou acerto ofensivo em NPC.
- Pausa e retomada reais;tempo13850ms idêntico em duas leituras separadas durante pausa.
- Sala/controles inspecionados em375×667,375×812,390×844,844×390 e1366×768. Nenhuma mudança de layout neste ciclo.
- Uma amostra final do harness:logic1.10ms,draw23.90ms,p95quadro65.40ms em janela de até300amostras. Antes, outra leitura mostroulogic6.70ms/draw59ms. São amostras de diferentes instantes/tamanhos no navegador remoto, **não comparação controlada de FPS antes/depois**. O custo de desenho ainda merece investigação.
O harness inicialmente ficou vazio/falhou ao importar seu módulo temporário. Corrigida a definição de import.meta.env apenas no bundle de QA e reiniciado o preview oficial após criação dos arquivos;validação só prosseguiu com jogo funcionando. Todos os arquivos de QA removidos antes de empacotar. Nenhuma mudança no código de produção para contornar infraestrutura.
Sem celular físico, medição real de heap/GC, auditoria100fases ou partida de produção. Tentativas de treino2;nenhuma morte observada até sair;tempo total/dificuldade/conclusão por fase não medidos. Novas artes de carregamento adiadas neste ciclo em favor da fluidez;gerenciador/cenas/preload/decode/pausa/intervalo mínimo mantidos sem alteração, sem alegar novo teste de rede/cache das telas.

## Publicação e rollback
**Publicada1.0.146, Sites149**, fonte `d4fb006b33e3844c20eb35027d6f82bdd6ed625e`.
Versão salva: `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_07b453b470b481918aa99d1055e57f6e`.
Deployment `appgdep_6b06c5f7199481919c539455fca76455`, succeeded em2026-11-25T11:26:57.991641+00:00.
[Jogo](https://lendariosdorei.com.br/) · [URL da plataforma](https://lendarios-do-rei.aquimeusite.chatgpt.site).
Uma revisão publicada neste ciclo. Rollback de referência:Sites148/fonteaeaab77263a8da7e92a8d952284280f45961eae4;somente se não houver publicação posterior. Nenhum force-push/merge automático ou mensagem a terceiros;Meu Pet não alterado/publicado. A primeira abertura do helper falhou em diretório não vazio;reaberto em pasta vazia. A credencial expirou antes de empacotar;renovada para o mesmo projeto,sem expor/gravar token.

Próximo:medir renderização durante caminhada/combate em aparelho físico e isolar terreno/vegetação/Canvas por cenário;continuar cenas originais em ciclo posterior, sem repetir as existentes. Não prometer que esta otimização eliminou os travamentos.

Conferência pública após deploy:Chrome confirmou Ver.1.0.146 e a notícia “Menos trabalho repetido durante a exploração” na home https://lendariosdorei.com.br/. Sem abrir conta/partida de produção. Um seletor de heading genérico não correspondia ao carrossel atual;leitura da página confirmou o conteúdo,sem regressão observada.
