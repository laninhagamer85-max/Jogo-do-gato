# Meu Pet Virtual — revisão móvel e colaboração

Atualização: 09/10/2026. Responsável: Web Agência AD / David.

## Base preservada

- Fonte editável: `sites/prepare-meu-pet-virtual-20261005`, commit `c146e1c39f22d7728d8d8bda8d9e3f5d5d5bb844`.
- Distribuição publicada v7: commit Sites `e35d4340f766801b36450ff2ab620dca367d1af8`.
- Trabalho desta etapa: ramo `recovery/mobile-review-20261009`.
- `recovery/published-v7/` contém os 193 arquivos públicos originais da v7. `v7-manifest.json` registra seus hashes SHA-256.
- `client/public/manus-storage/` contém as 158 mídias recuperadas. O atlas de ícones fica em `client/public/ui/`.

O código editável antecede a v7. A v7 tem mudanças de ícones e painel de conta ainda não conciliadas integralmente com os componentes React recuperados. **Não publicar o build padrão como substituto da v7 antes dessa conciliação.** Os dois estados estão preservados neste ramo, com origem identificada.

## Correções implementadas

- Novo CSS final `client/src/components/AdventureMobile.css`, aplicado após os estilos antigos.
- Gato de 104 × 108 px à esquerda em retrato, nome de 16 px e descrição de mundo de 15 px.
- Abas de mundos e cartões de fases com textos maiores e rolagem horizontal própria.
- Direções de 64 × 64 px; salto de 76 × 76 px; controles auxiliares de pelo menos 44 px.
- Diálogos de pausa/recompensa usam a tela móvel disponível e podem rolar, inclusive na horizontal.
- Centralização da fase disponível passa a rolar somente o carrossel. A página não salta para baixo ao abrir o mapa.
- Lockfile sincronizado com o patch Wouter já presente; nenhuma versão de dependência foi atualizada. Scripts de instalação de dependências continuam explicitamente bloqueados.
- A configuração do patch aparece também em `package.json#pnpm` para o pnpm 10.4.1 fixado pelo projeto; o arquivo de workspace atende ao pnpm 11 usado pelo ambiente. Isso evita divergência na instalação com lockfile congelado.
- Desenvolvimento do cliente: `pnpm dev`. O fluxo anterior com Express permanece em `pnpm dev:server`.

## Como executar

1. Instalar as dependências com o lockfile: `pnpm install --frozen-lockfile`.
2. Rodar `pnpm dev` e abrir `/qa-review.html` para a revisão local da aventura.
3. A demonstração usa estado apenas em memória: não faz login, não lê partidas reais nem grava progresso de contas. Essas páginas não fazem parte do build de produção.
4. `pnpm check` verifica TypeScript. `pnpm build` gera o cliente e o servidor editáveis, ainda sujeitos à conciliação da v7.
5. `pnpm build:recovery` gera `out/` a partir da distribuição v7 preservada, com apenas o CSS móvel e uma substituição exata e verificada da expressão de rolagem. As regras de autenticação, progresso, recompensas e o atlas permanecem na distribuição original.

O build de recuperação verifica os 193 hashes antes de produzir qualquer saída. Toda a pasta de módulos recebe um novo caminho para evitar mistura entre arquivos em cache; imports entre módulos continuam relativos. Não editar o JavaScript minificado manualmente. A solução definitiva é conciliar os componentes e voltar a um único build de fonte.

## Verificações realizadas

- Instalação com lockfile e verificação de dependências concluídas no ambiente de trabalho.
- A compatibilidade do lockfile também foi conferida com o pnpm 10.4.1 do projeto, usando `install --lockfile-only --frozen-lockfile --ignore-scripts`.
- Build Vite e TypeScript sem erros.
- Revisão no navegador usando o componente real com partida de demonstração em quadros de 390 × 844, 375 × 812 e 844 × 390 px.
- Conferidos: gato/textos, ausência de overflow horizontal global em 375 px, início da fase 1, renderização do cenário, dimensões dos controles, pausa e retorno ao mapa.
- Diálogo cortado na horizontal foi reproduzido e corrigido; sua área passou a cobrir os 390 px disponíveis.
- Verificada exclusão das páginas de QA do build de produção.
- Comparação de bytes: a saída altera o HTML, a expressão de rolagem do módulo principal e os caminhos de pré-carregamento de dois módulos. O CSS novo é adicionado. O restante do código e todas as mídias permanecem iguais; os 193 arquivos da cópia original ficam intactos.

Estes testes não são uma conclusão das 100 fases, uma auditoria completa dos minijogos nem um teste de autenticação com conta real. A publicação online não foi alterada nesta recuperação. O backup não contém dados, senhas ou partidas dos jogadores.

## Próxima entrega do Manus

Criar um ramo a partir desta revisão e trabalhar por PR, sem substituir `main` nem mesclar PRs existentes automaticamente.

1. Conciliar o painel de conta e o componente `pet-symbol`/atlas da v7 com a fonte React. Verificar login, saída, isolamento do progresso por conta e recursos da casa.
2. Auditar os tamanhos dos ícones dentro de cada minijogo. A correção atual cobre a aventura.
3. Criar **uma fase piloto** de floresta com escadas, pontes, plataformas em alturas distintas e câmera vertical, usando as referências enviadas como direção visual.
4. Validar colisões, subida/descida, câmera, controles e recompensa antes de expandir as fases.
5. Evoluir a seleção de mundos para ilhas. Resolver a relação entre gatos jogáveis, novas espécies e mascotes sem alterar silenciosamente os saves.
6. Registrar testes por fase: dispositivo, dificuldade, bugs, recompensa e se o resultado veio de simulação ou de uma partida realmente concluída na conta online.

As cinco referências originais continuam no registro de retomada do projeto. Não estão embutidas neste ramo; as mídias aqui são as usadas pela v7. Não declarar a implementação das novas referências como concluída.

## Continuação de 12/10/2026

Painel de conta, componente SVG do atlas e desenho Canvas dos itens/perigos foram restaurados na fonte de colaboração. Consulte `docs/evolution/runs/2026-10-12.md`. A implementação ainda aguarda validação real em navegador e conta isolada; não publicar o build padrão antes dessa conferência. A cópia v7 e o build de recuperação permanecem intactos.

## Atualização de 13/10/2026

O histórico acima descreve a recuperação anterior. A fonte recebeu o painel de conta e atlas, publicados na v9; a v10 acrescentou sombras/enquadramento da casa em 12/10. A equivalência visual e autenticação isolada permanecem pendentes. O build de release atual é `scripts/build-sites-release.mjs`; o build preservado da v7 continua como recuperação histórica. O piloto de terreno da fase 1 de 13/10 está apenas no ramo, sem deploy. Consultar `docs/evolution/runs/2026-10-13.md` antes de publicar.


## Continuação: atualização Bosque dos Caminhos — 14/10/2026

- **Versão pública:** v12 no Site existente, commit publicado `47a07c607879a443b2fe9b2686795e118a2495ba`. A atualização descrita abaixo está em desenvolvimento e não está publicada.
- **Fonte/branch:** repositório `laninhagamer85-max/Jogo-do-gato`, branch local `feat/forest-path-chapter1-20261014`, derivada do runtime `feat/pet-motion-20261014` já publicado na v12. PRs #4–#6 são preservados; não fazer merge automático, force-push ou substituição.
- **Escopo aprovado:** modalidade solo top-down original “Bosque dos Caminhos”, três capítulos com duas salas, puzzles gentis e progressão sem combate, vidas, cronômetro ou moeda. A Aventura lateral permanece; sua animação articulada de corrida/salto foi preservada. O modo novo tem cadência de caminhada visual ligada ao movimento, cenários próprios, música/efeitos Web Audio próprios no mixer atual e toggle de efeitos.
- **Save:** progresso `forestPathProgress` versionado e aditivo dentro de `GameState` existente por conta/perfil. A fixture `/qa-review.html` usa estado sintético em memória, sem login ou saves reais; nenhum perfil real foi lido ou alterado.
- **QA feita:** inputs normais automatizados no browser completaram as duas salas do capítulo 1 e liberaram o capítulo 2; na primeira sala do capítulo 2, teclado colocou a prancha na água e um pointer touch emulado moveu o pet, depois `pointercancel` soltou o D-pad. Pausa/retomada preservou a sala. Medições de tela/jogo e seleção em 375×667, 375×812, 390×844, 844×390 e 1366×768 não mostraram overflow horizontal ou botão de entrada cortado. Console sem erro reportado nesta interação. Isto não é uma partida humana nem conclusão dos seis mapas.
- **Pendências antes de aceitar:** playthrough real guiado das seis salas; revisão visual final da cadência do pet; TypeScript/suíte offline/build/diff-check do estado final; teste em aparelho móvel físico e validação de persistência com perfil staging isolado; anexar capturas/vídeo ao relatório/PR.
- **Regra de release:** não publicar nesta etapa. Não declarar as 100 fases laterais testadas. Revisar o plano `docs/evolution/plans/2026-10-14-bosque-dos-caminhos.md`, o checklist `TODO.md`, o estado `docs/evolution/state.json` e o relatório `docs/evolution/runs/` antes de decidir a próxima ação.


## Resultado final da QA do Bosque — 14/10/2026

As linhas de QA/pendências da seção acima registravam o ponto anterior à conclusão do capítulo 3 e estão supersedidas por este resultado:

- A fixture isolada completou, por entradas de teclado/toque sintetizadas na UI normal, as seis salas em sequência. O desbloqueio dos capítulos 2 e 3 ocorreu organicamente; a sala final mostrou “Capítulo concluído” e a seleção confirmou os três capítulos como concluídos. Não houve teleporte, invulnerabilidade ou chamada direta de vitória; **não foi uma partida humana**, e nenhum login/save real foi usado.
- Métricas exibidas na conclusão: C1S1 **24 passos/5 ações**; C1S2 **48/9**; C2S1 **17/2**; C2S2 **67/10**; C3S1 **21/4**; C3S2 **71/8**. O modo intencionalmente não tem relógio nem vidas; duração ativa e contatos com guardiões não foram instrumentados.
- Seleção/layout foram medidos em **375×667, 375×812, 390×844, 844×390 e 1366×768**; o playthrough completo foi em 390×844. TypeScript, **73 testes offline**, build e `git diff --check` passaram. O build não contém páginas QA nem strings/atributos de telemetria; segue o aviso de chunks maiores que 500 kB. O clipe MP4 de 6,65 s é silencioso e serve como evidência visual.
- Permanecem pendentes: validação em aparelho físico, persistência/migração em perfil de staging e decisão sobre spritesheets direcionais completos para a etapa de produção. A animação procedural de caminhada é aceita apenas como estado do protótipo até essa decisão.
- A v12 permanece no Site existente. Os PRs #4–#6 seguem preservados; esta atualização será proposta em PR separado contra `feat/pet-motion-20261014`, sem merge nem deploy automático. Consulte o [relatório QA](docs/evolution/reviews/2026-10-14-bosque-dos-caminhos/REPORT.md) e as [evidências](docs/evolution/reviews/2026-10-14-bosque-dos-caminhos/evidence/).
