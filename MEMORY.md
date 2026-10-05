# Memory

- A base GitHub mais adequada é `laninhagamer85-max/Jogo-do-gato`, um jogo HTML vanilla; a alternativa `Meu-primeiro-jogo-de-peixe` é de obstáculos aquáticos. A nova experiência React/Babylon também foi espelhada em branch/PR dedicado para revisão; preservar esse fluxo, sem mesclar em `main` automaticamente.
- O projeto WebDev `meu-pet-virtual` contém a versão de trabalho e o preview; a cena é Babylon com dez fundos originais. O domínio do jogo permanece em TypeScript puro e client-side.
- A primeira campanha começa no nível 1, após onboarding com nome, idade e menino/menina (boné/lacinho). O tutorial explica cuidados, capítulos, minijogos e loja; pode ser reaberto nas configurações.
- Há dez casas/capítulos e onze minijogos jogáveis, com match-3 central, missão 3/3, XP, moedas, itens, skins e companheiros Mimi/Tico. As missões ficam concluíveis antes do próximo limiar de XP.
- Saves legados continuam sob as chaves originais. Um estado v2 avançado sem perfil é copiado para `meu-pet-virtual-save-v2-archive` e começa uma história nível 1; a opção de novo jogo arquiva a cópia ativa. O modo `?demo=1` nunca persiste progresso; `&play=colheita` abre o puzzle.
- Assets são originais e ficam em storage gerenciado. Vozes PT-BR foram geradas em clipes curtos e só reproduzem quando a voz está habilitada.

- UX de diálogo/perfil/decoração: balão ancorado sobre o pet desaparece ao `ended` de voz/TTS ou após fallback; callbacks de TTS cancelado são neutralizados. O toque dispara `pet:blink` e mostra apenas o nome por ~2,6 s; a ficha em Configurações exibe personagem, gênero, idade, casa, nível, XP, moedas, companheiro e necessidades. Móveis ficam fixos até o toque, depois revelam drag/rotação/Fixar/guardar; setas do teclado movem o selecionado. Browser `?demo=1` confirmou seleção, arrasto, rotação, fixação, perfil e fim da fala sem alterar o save real. Typecheck/build e capturas desktop/mobile passaram.

- Expansão de decoração (2026-09-28): catálogo com 100 peças únicas — dez por cenário — exportadas em WebP transparente 384×384; 96 novas artes e quatro sprites legados reempacotados, total otimizado de ~3,35 MB. As 100 URLs do storage são únicas e estão em `client/src/game/decorationAssets.ts`; gates por nível/missão ficam em `game/decorations.ts`. Compra/colocação foram testadas bloqueadas e desbloqueadas; amostra HTTP de um asset por nível respondeu 200.
- Verificação de ancoragem: item colocado no centro do stage ficou na mesma coordenada de tela após round-trip desktop/retrato; toque seleciona, controles aparecem apenas depois, arrasto e rotação de 15° funcionam e Fixar os oculta. Demo móvel ajustada com peças visíveis fora da área do pet; compra do demo não escreve no save real.
- Sincronização: manter `laninhagamer85-max/Jogo-do-gato` no branch `feature/meu-pet-virtual-refresh` ligado ao [PR #2](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/2); atualizar esse PR, sem mesclar em `main` automaticamente.

- Follow-up 2026-09-28: cliques vazios só movimentam; a hitbox segue o pet e voz de toque/cuidado é clipe humano PT-BR por gênero. Modo de tela limpa, foto PNG do canvas sem HUD (partilha/download), recompensas de presente animadas e itens fixos atrás do pet; item sobe apenas durante edição.
- Segurança/tooling: removidos `axios`, `nanoid` e `streamdown` sem uso; migração do servidor para Express 5.2.1 com fallback `/{*splat}`; Vitest e pacotes de tooling inativos removidos; Vite/Tailwind/PostCSS/ESBuild atualizados. `pnpm check`, `pnpm build`, `pnpm audit` e `pnpm audit --prod` passaram com zero advisories conhecidos. Save continua localStorage, sem criptografia.
- PWA: manifest/ícones instaláveis existem, mas ainda não há service worker — instalação não garante funcionamento offline; shell e mídias exigem rede quando não estiverem em cache do navegador.

- Follow-up 2026-09-29: moldura de Allana em todas as casas com foto autorizada em storage, legenda HTML acessível e modal de homenagem; nenhuma foto adicionada ao repositório GitHub. A placa foi alinhada fora dos controles móveis. Menino/menina/personagem têm prévia imediata; skins usam matizes mais distinguíveis e reação de seleção, sem encerrar o evento de level-up.
- Presentes: espera 1,55 s para abrir e revelação legível por até 15,5 s; item mostra miniatura/casa de origem e “Usar”, e a regra pura entrega decoração do cenário do presente. Catálogo mantém 18 peças mission-locked mesmo no nível 10 (com zero missões contadas); no nível 1, 93/100 indisponíveis considerando as casas futuras.

- Campanha principal de plataforma (2026-09-29): 100 fases em dez mundos; o canvas próprio usa física, colisões, moedas, inimigos, checkpoint, vidas e portal. `platformProgress` migra aditivamente no save v2. Primeira conclusão entrega decoração única + moedas; replay não entrega de novo. Cuidados/minijogos em Minha Casa continuam apoiando a evolução por XP/moedas. Saves permanecem no `localStorage`; não existe sincronização de save com GitHub.
- QA: WebDev `tsc --noEmit`/Vite build aprovados; assets WebP gerenciados verificados e captura da aventura passou após compactação. No clone GitHub, smoke test puro confirmou 100 recompensas únicas, sequência/bloqueio, migração e não duplicação; browser confirmou mapa desktop/mobile, início da fase 1, corrida/salto e retorno ao pet care. `?demo=platformer` é isolado e não grava save; PWA não tem cache offline.
- Sincronização prevista no branch `feature/meu-pet-virtual-refresh`/PR #2; manter aberto sem merge e sem publicar o site.

- Correção pós-teste 2026-09-29: nenhuma imagem da Allana aparece mais na placa nem no modal; ambos usam emblema/texto e a placa pequena, fixa e clicável está fora do pet. O clique foi verificado no browser; modal contém o texto autorizado e zero imagens.
- O canvas Babylon escuro era provocado por shaders padrão não registrados no bundle Vite; imports explícitos dos módulos `default.vertex.js`/`default.fragment.js` em `scene.ts` resolveram. Verificação final pós-remoção do debug: evento `pet:scene-ready`, WebGL2, canvas 1280×1100 e pixel opaco `[65,114,18,255]`; cena visível no screenshot.
- Ajuste do platformer alinhou o spawn do gato com a superfície, tornou plataformas/vãos/obstáculos mais legíveis, manteve a imagem da casa como fundo fixo e animou o gato de lado. Mapa carrossel verificado em portrait 375×812 e landscape 812×375.
- Móveis agora são exclusivos das vitórias da fase correspondente; `awardXp` de cuidados/minijogos não entrega decoração. Smoke tests cobriram 100 IDs distintos, stages 1–5, bloqueio pré-vitória, progressão, item único, replay sem farming, migração de duplicatas e level-up sem móvel.
- AutoPilot somente DEV, na rota `?demo=platformer&autoplay=1&qa-stages=5`, concluiu cinco fases reais em sequência: mapa exibiu 5/100, fase 6 disponível, e fase 5 mostrou 3 estrelas + moedas/recompensa. Demo não escreve no save real.
- `tsc --noEmit`, `vite build` e `git diff --check` passaram. Build registra aviso de tamanho de chunk Babylon; não houve falha. A entrada normal após onboarding deve permanecer em Minha Casa, com o seletor para acessar a campanha; não publicar nem mesclar o PR #2.

- Áudio independente (2026-09-30): `platformerAudio.ts` sintetiza uma trilha chiptune ambiente e centraliza os SFX em dois barramentos Web Audio. `AudioVolumeControls` é compartilhado pela engrenagem da sala e pelo painel da aventura; sliders música/efeitos ficam em `localStorage` sob `meu-pet-platform-audio-v1`. O mute de SFX não desliga a música, e as vozes do pet continuam no sistema existente. QA browser confirmou valores independentes, persistência e ausência de erros; typecheck/build passaram. Sincronizar ao PR #2 sem merge/publicação.


- Tour da sala (2026-09-30): primeiro acesso abre um passo a passo interativo de seis etapas após a criação do perfil; Configurações → Como jogar reabre o tour. `TutorialOverlay.tsx` posiciona o spotlight pelos marcadores `data-room-tour`, apresenta modal central compacto em viewport estreita e oferece progresso, navegação por teclado/botões e saída acessível. A rota de revisão `?demo=1&tour=1` abre o passo 1 sem tocar no save; `?demo=1` mantém o tour fechado.
- QA nesta rodada: typecheck, build Vite e `git diff --check` passaram; preview desktop 1280×720 e celular 375×812 mostraram o passo 1 sem clipping; a reabertura via Configurações → Como jogar funcionou. Build conserva o aviso informativo existente sobre chunk de Babylon. O PR #2 é `laninhagamer85-max/Jogo-do-gato`, branch `feature/meu-pet-virtual-refresh`; manter aberto, sem merge/publicação.


- UI da sala (2026-09-30): coluna alta substituída por dock de sete atalhos — Cuidar, Missões, Loja, Mochila, Casas, Decorar e História. Um único drawer de Cuidar agrega barras de necessidades e ações; outro mostra progresso de missões. O botão de tela limpa recolhe o cabeçalho/detalhes, mas não esconde os atalhos; em mobile o dock compacto fica na borda esquerda para não cobrir o pet.
- Homenagem: `CreatorPlaquePicker.tsx` agora rende somente ícone de informação + “Sobre” no canto esquerdo da cena; removeu o porta-retrato grande/draggable. `CreatorTributeModal.tsx` mantém retrato autorizado e texto aprovado, lado a lado no desktop e empilhados em mobile.
- QA da reorganização: typecheck, Vite build e diff-check passaram; screenshots 1280×720 e 375×812 confirmam a cena desobstruída; browser abriu Cuidar, Missões, Loja, Mochila, Casas, Decorar, História, o modal da idealizadora e confirmou que a tela limpa preserva a navegação. A demo foi usada, sem tocar no save normal. O PR #2 permanece aberto, sem merge/publicação.

- Referências da revisão 2026-09-30: preview demo em https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1 e PR #2 em https://github.com/laninhagamer85-max/Jogo-do-gato/pull/2; foram usados para verificação, sem publicação do site.

- Estado externo verificado em 2026-09-30 antes desta rodada: PR #2 aberto no branch `feature/meu-pet-virtual-refresh`, head `e7b5140`; a revisão visual usa o preview de demonstração `https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1` (PR: `https://github.com/laninhagamer85-max/Jogo-do-gato/pull/2`).


## Estado atual da navegação da sala — 2026-09-30
Feedback posterior substituiu o dock de sete atalhos por quatro ações sempre expostas: **Casas**, **Decorar**, **Cuidar** e **Missões**. **Loja**, **Mochila** e **História** ficam sob **Mais do jogo**; Aventura permanece no cabeçalho. Os painéis de cuidado e missão são parte da coluna/área lateral, não modais centrais. Em retrato, a grade compacta fica no alto à esquerda; em paisagem curta e desktop, usa coluna lateral. O modo de tela limpa mantém os quatro atalhos e Mais visíveis.

O atalho **Sobre** está no canto inferior esquerdo da cena e alinhado à câmera no canto inferior direito; o modal mantém a foto autorizada e o texto à direita. QA no preview demo: Cuidar, Missões, Mais, Loja, Mochila, Casas, Decorar, Sobre, tela limpa e o alvo atualizado do passo 4 do tutorial foram exercitados; dimensões verificadas em 1280×720, 375×812 e 844×390. O PR #2 estava aberto no branch `feature/meu-pet-virtual-refresh` (head pré-sync `e7b5140`); manter aberto, sem merge/publicação.


## Atualização da navegação após QA de orientação — 2026-09-30
Esta nota substitui a hierarquia da entrada anterior: Aventura destacada no alto da navegação; Casas, Decorar, Cuidar e Missões expostos; Mochila em atalho próprio; Loja/História dentro de Mais do jogo. Cuidar/Missões abrem painéis laterais completos; retrato usa a rail compacta com janela à direita, e paisagem usa painel adjacente sem esticar os botões. A faixa de nível fica sob a marca em paisagem. Sobre e câmera estão alinhados ao rodapé da cena.

QA no demo em 1280×720, 375×812, 844×390 e 667×375; browser confirmou Aventura/campanha, Mochila/inventário, Casas, Decorar, Cuidar, Missões, Mais do jogo e o modal Sobre. Tutorial reaberto pelas Configurações; passos 4 e 6 verificados. TypeScript, Vite build e `git diff --check` passaram. PR #2 autorizado segue aberto, sem merge/publicação.


## Navegação atual da sala — 2026-09-30 (revisão final)
Substitui as notas anteriores: a Aventura é o botão de destaque acima de um grupo de atalhos independentes e coloridos — Casas, Decorar, Cuidar, Petiscos, Missões, Mochila, Loja e História — sem contêiner lateral. Logo abaixo da marca ficam as barras de nível e missão; Minijogos fica junto da barra de missão, e o resumo de necessidades exibe fome/energia prioritárias. Cuidar abre estado e ações; Petiscos, Missões, Minijogos, Mochila, Decorar e Casas usam painéis adjacentes no cenário. Loja/História preservam os fluxos completos existentes.

Tela limpa oculta a UI adicional, mantendo câmera, Sobre, mapa, decoração e alimentação. Em paisagem curta, Sobre fica no rodapé, depois do dock; esconde enquanto o painel ocupa essa área para não cobrir ações e reaparece ao fechar. Em modo limpo ele retorna ao canto inferior esquerdo, alinhado com a câmera.

QA no demo em 1280×720, 375×812, 844×390 e 667×375. Revisados painéis de Cuidar, Missões e Minijogos; todas as quatro ações de cuidado e os 11 jogos cabem em paisagem curta sem corte; mapa, decoração e petiscos continuam funcionais no modo limpo. TypeScript, build e diff-check passaram; build mantém apenas o aviso de chunk grande do Babylon. Preview: https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1. PR #2 (`feature/meu-pet-virtual-refresh`) deve continuar aberto, sem merge/publicação.


## HUD e atalhos diretos de cuidado — 2026-09-30
- Estado atual: Aventura destacada; Casas, Decorar, Mochila e Loja em atalhos compactos; nível/missão compactos junto da marca, História junto ao nível e Minijogos junto da missão. Felicidade/Fome/Higiene/Energia ficam sempre visíveis. Quatro ações de cuidado coloridas substituem o botão genérico Cuidar.
- Cada cuidado abre bandeja lateral quando há item compatível. Itens mostram quantidade/efeito, aceitam toque para usar e são `draggable`; a hitbox do pet aceita `drop`. Sem consumível, manter o cuidado nativo e a alternativa de refeição por moedas. Browser demo confirmou Fome 58→86 usando Sardinha crocante e Higiene 82→100 usando Espuma de nuvem.
- Grade dos 11 minijogos mostra ícone, título, objetivo e Jogar; Colheita de Petiscos abriu corretamente. Modo de tela limpa mantém olho, Sobre, câmera, mapa/Casas, Decoração e Alimentar; mapa testado e agora permanece visível.
- QA em 1280×720, 375×812, 844×390 e 667×375; TypeScript/build/diff-check passaram (aviso conhecido de chunk Babylon). Estado de preview demo: https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1. Instrução desta rodada: checkpoint WebDev somente; não sincronizar PR, mesclar ou publicar.


## Menu atual após restauração solicitada — 2026-09-30
Restaurada a navegação de duas colunas escolhida pela usuária, equivalente ao checkpoint de 29/09 (`eda3263`): status/cuidados à esquerda, pet no centro, missão/loja/história à direita e navegação inferior Cuidar/Minijogos/Loja. Isso substitui as notas posteriores sobre controles flutuantes e cuidados diretos. Preservados cena atual, overlays, progressão, tutorial, áudio, presentes e homenagem; Mochila continua acessível no cabeçalho da Loja. Validação: TypeScript/build e diff-check passaram; demo revisada em desktop, retrato e paisagem. Sem push, merge ou publicação.


## Alvo de sincronização confirmado — 2026-09-30
- O [PR #2](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/2) está **OPEN** em `laninhagamer85-max/Jogo-do-gato`, branch `feature/meu-pet-virtual-refresh` → `main`; head remoto confirmado via GitHub API: `9347b409facc0adf652e707d36554d205dfce603`. A autorização vigente é atualizar este PR, mantendo-o aberto; não fazer merge nem publicar o site.
- Preview demo usado nesta validação: https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1 . Dados do jogo e modo demo permanecem isolados do save real.


## QA incremental da sala em duas colunas — 2026-09-30
- Em Chromium headless, a bandeja de cuidado foi aberta no demo e medida em 375×812, 844×390 e 667×375; o painel rolou para dentro da viewport, com o último botão visível acima do rodapé fixo. Correção: aguardar dois `requestAnimationFrame` antes do `scrollIntoView`, após a expansão React.
- Tutorial `?demo=1&tour=1`: copy dos seis passos corresponde à sala restaurada; os alvos de missão/minijogos, Mochila, Casas/Decorar e Aventura existem e o frame de spotlight coincide com cada alvo no desktop. O passo de cuidados ensina toque/arrastar item.
- Checklist concluído nesta rodada: build/diff-check, rotas e interações dos atalhos, save-isolation, registro em PLAN/MEMORY e validação para checkpoint/PR estão cobertos; o push ainda será feito separadamente.


## Fechamento da revisão da sala — 2026-09-30
Esta entrada final substitui o checklist incremental acima. A decisão atual é manter a sala de duas colunas do checkpoint de 29/09: status/cuidados à esquerda; pet no centro; missões, loja e história à direita; atalhos Casas/Decorar na cena e rodapé Cuidar/Minijogos/Loja. Não retomar os menus flutuantes.

Verificações demo: toque e drag-and-drop de itens de cuidado no pet; alimentação no modo limpo; painel de cuidado alcançável acima do rodapé fixo em 375×812, 844×390 e 667×375; destinos Casas/Decorar/Mochila/Minijogos; recompensa Sardinha e decoração Luminária lunar com botão “Usar agora”; tutorial de seis passos alinhado ao menu; decorações renderizadas com brilho natural. Após usar cuidado em `?demo=1`, o conjunto de chaves e os hashes de `localStorage` permaneceram iguais (valores do save não foram expostos). Build final: TypeScript, Vite, bundle do servidor e diff-check aprovados; só permanece o aviso de chunk grande do Babylon.

A atualização autorizada é somente no PR #2 de `laninhagamer85-max/Jogo-do-gato`, branch `feature/meu-pet-virtual-refresh`; manter aberto, não mesclar e não publicar o site. Preview demo: https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1.


## Retrato móvel, zoom e Mochila — 2026-09-30
A sala passa a usar breakpoints de toque (`pointer: coarse`) além da largura, evitando que viewport CSS alargada por zoom/site desktop troque para o layout desktop. Retrato touch amplo centra o HUD em até 640 px sem limitar o canvas. A arte 16:9 da casa permanece inteira, sem recorte lateral; a área adicional usa preenchimento da mesma imagem. A faixa Missão/Minijogos, Aventura em paisagem, atalho Mimi no modo limpo e preview da Loja foram revistos. Removido o glifo duplicado de Mochila no cabeçalho; Mochila contém consumíveis utilizáveis, decoração única fica na aba Decoração. QA demo em 375×812, 844×390, 667×375, 1280×720 e 1200×2670 com touch emulado; no viewport ampliado o dock, rodapé e painéis continuam no modo móvel, com conteúdo centralizado. Nenhum save real foi usado.


### Espaçamento final Missão/rodapé
QA inicial detectou interseção de 4 px em retrato; offsets foram ajustados. Re-teste: dock da missão a 8 px do rodapé em 375×812 e 11 px em 844×390 e 667×375. Abas da loja sem ícone duplicado, Mochila com consumíveis e nenhuma decoração única; 3 decorações apenas em Decoração. Modo limpo mantém Mimi visível, saves demo inalterados e console sem erros.


## Fundo da sala em retrato — correção final (2026-09-30)
A causa da imagem em faixas era a sobreposição do fundo 16:9 ampliado em cover com a versão completa da mesma sala. Em retrato, o fundo agora usa uma cópia ambiente desfocada atrás da sala inteira, centralizada sem corte lateral e com bordas suavemente transparentes; em paisagem/desktop o render original permanece. QA demo: 375×812, 844×390, 667×375, 1280×720 e rotação real sem reload retrato→paisagem→retrato; asset/WebGL ativos, zero erros no console e save local intacto. Sem publicação.


## Fundo vertical preenchendo o visor — requisito atualizado (2026-09-30)
A pedido do usuário, a solução anterior de imagem completa centralizada com faixas desfocadas foi removida. Em retrato a arte horizontal agora ocupa 100% do canvas por `cover`, sem bandas ou sobreposição; preserva proporção, então corta laterais. Paisagem/desktop não mudam. Validado no demo em 375×812, 844×390, 667×375 e 1280×720, incluindo rotação sem reload; WebGL/carregamento de asset ok, zero erros e save demo inalterado.


## Dock móvel de missão — título antes da barra (2026-09-30)
A barra fica agora diretamente abaixo do título/contagem da missão; o botão Minijogos permanece ao lado. Testado em retrato 375×812, paisagem 844×390 e compacta 667×375, além de rotação ao vivo. Nenhum clipping, erro de console ou alteração do save demo. Pedido de fundos verticais próprios foi pausado antes de gerar qualquer imagem.


## Barra da missão em paisagem compacta — 2026-09-30
Largura do progresso: `clamp(120px, 23vw, 190px)` em paisagem; retrato continua ocupando a largura disponível. Medido em 844×390: 190 px; 667×375: 153 px; 568×320: 131 px. Barra abaixo do título e dentro do dock; zero erro de console, demo save inalterado; typecheck/build passaram. Alteração direcionada ao PR #2, aberto e sem merge/publicação.


## HUD vertical e mapa móvel da Aventura — 2026-10-01
O HUD em retrato mantém a barra de nível no topo e mostra abaixo missão, Aventura (100 fases) e Minijogos (11 jogos). Os quatro status aparecem lado a lado e recolhem/expandem; Cuidar fica expandido com quatro ações em lista vertical; Mochila inicia fechada à direita e abre inline apenas itens de cuidado utilizáveis, sem misturar decoração.
A tela de mapa da Aventura agora mantém no celular as mesmas informações do desktop: personagem/nome, mundo e casa, descrição, desafio atual, progresso de fases, medalhas/troféus e seletor/carrossel de etapas. QA em 375×812, 390×844, 844×390 e 667×375, além de 1280×720 desktop; no mapa, todas as seções permanecem visíveis e dentro do painel, sem overflow nas duas orientações móveis. Status/Cuidar e mochila exercitados; itens de decoração ausentes da Mochila; console sem erros e localStorage do demo inalterado.
