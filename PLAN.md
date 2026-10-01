# Game Plan — Meu Pet Virtual: Uma Casa de Cada Vez

## Objetivo da expansão
Levar a campanha de dez casas a um pet game mais expressivo, móvel e jogável sem perder o save já existente. A sessão inicia com escolha de menino/menina, personagem entre três opções, idade e nome; segue por cuidados, capítulos, loja, missões, casas, amigos e desafios.

## Sistemas principais
- **Progressão:** XP por jogo e cuidado, limiar de nível mais demorado, 10 cenários e mapa que permite revisitar apenas casas desbloqueadas sem regredir o nível atual.
- **Personagens e fala:** seis gatos, animação de idle/caminhada/reação/level-up, interações por toque e vozes PT-BR por perfil; Mimi e Tico têm fala própria.
- **Match-3:** 8×8, troca por arrasto adjacente ou dois toques, metas crescentes, limite de jogadas, cascatas, efeito visual e áudio de combinação.
- **Decoração:** 100 props únicos (dez por casa), compra e guarda por cenário; móveis permanecem fixos às coordenadas do fundo sem controles até o toque; seleção libera arrasto, rotação, fixação e retorno à mochila. Parte dos itens depende de nível ou missões concluídas.
- **Presentes:** até duas recompensas temporizadas no quarto; expiram sem prêmio se o jogador não coletar.
- **UI:** preservar personagem e amigos livres de texto; ajustar cenário para retrato; painéis recolhíveis, nome temporário com piscada ao tocar no pet, balões que somem após a fala e ficha de perfil persistente.

## Riscos e decisões
1. **Estado legado:** migração aditiva, com valores padrão e cópias antes de reinicialização.
2. **Pointer/touch:** testar input tanto em tabuleiro como em props de cenário; impedir propagação para o clique de caminhada.
3. **Temporizadores:** expirar presentes também ao voltar de uma aba e nunca entregar recompensa a item vencido.
4. **Áudio:** respeitar preferência do usuário e gesto de ativação do browser; sem falas automáticas bloqueadas.
5. **Build:** Vite precisa empacotar assets locais para que o clone não dependa do WebDev.

## Verificação executada
- `pnpm check` e `pnpm build` nos projetos WebDev e Vite standalone.
- Smoke tests puros de perfil/seleção, 6 jogos até o segundo nível, desbloqueio/seleção de casa, compra/movimento/rotação/retorno de decoração e coleta/expiração de presente.
- Preview: onboarding de três passos, dez cenários e tabuleiro; troca por arrasto válida consome um movimento e atualiza a meta; modo decorar move prop; presente entrega moedas; mapa lista casas desbloqueadas.
- Save real conferido invariável ao testar presente, casas, decoração e cadastro não submetido na demo.
- Capturas desktop e mobile; o cenário em retrato foi ajustado para manter o pet inteiro visível.
- Onboarding: introdução e saudações menino/menina transcritas em PT-BR; cliques no browser confirmam os três MP3 corretos e não salvam perfil; check/build passam nas versões WebDev e Vite.
- Nova interação: clique no pet dispara `pet:blink`, revela o nome por ~2,6 s e fecha o balão ao fim da fala/fallback; perfil mostra idade, gênero, personagem, casa, nível, XP, moedas, companhia e status. No demo, seleção de móvel esconde/mostra controles, arrasto altera posição, rotação aplica 15° e Fixar oculta as ferramentas; desktop/mobile foram capturados e WebDev check/build passaram.
- Decoração: domínio tem 10 IDs por nível; compra é bloqueada e liberada corretamente por nível/missão; Vite SSR carregou 100 URLs distintas, o build incluiu os 96 novos WebP e o demo carregou 10 de 10 thumbnails únicos da Casa do Começo. Amostra de storage em todos os níveis respondeu HTTP 200; a ancoragem em desktop/retrato e o visual do pet sem obstrução foram verificados.

## Continuidade
A versão do app fica em `src/`; assets locais ficam em `src/assets/`; preservar `legacy.html`. Desenvolver neste branch/PR aberto e não mesclar automaticamente em `main`.


## Follow-up de experiência e instalação (2026-09-28)
O toque em área vazia apenas move o pet; a hitbox acompanha o personagem e clipes PT-BR nativos variam por gênero para toque e cuidado. O modo de tela limpa oculta os painéis, e a câmera exporta um PNG do canvas sem HUD (partilha do sistema em dispositivos compatíveis ou download). Itens de decoração fixos ficam atrás do pet e só sobem para primeiro plano durante edição. Presentes surgem a cada 4,5–7,5 minutos; ao abrir, mostram a recompensa (miniatura ou moedas) e somem em cerca de 2,9 s. O manifest/ícones permitem instalar, mas não há service worker ou cache offline nesta versão.

Validação final 2026-09-28: `pnpm check`, `pnpm build` e `git diff --check` passaram; `pnpm audit` completo e `pnpm audit --prod` retornaram zero advisories conhecidos. Toolchain resolvida: Vite 7.3.6, @vitejs/plugin-react 5.2.0 e Tailwind 4.3.3. O build mantém um aviso informativo de chunk Babylon de 1,17 MB (~287 KB gzip). A prévia local responde HTTP 200; a verificação visual final foi feita no preview WebDev desktop/mobile.


## Follow-up: aparência, presentes e moldura (2026-09-29)
- A prévia de personagem no onboarding atualiza o sprite da cena; selecionar skin aplica matiz mais claro/distinto e reação breve. O evento de aparência não sobrescreve animação de level-up.
- Decorações fixas mantêm cor natural, ganham escala levemente maior e ficam atrás do pet; a peça só sobe durante edição.
- A abertura do presente leva 1,55 s; depois, moedas ou item, miniatura, casa de origem e ação “Usar” ficam visíveis por até 15,5 s e somem com fade. O item vem da mesma casa do presente.
- Regras do catálogo: 18 peças ainda exigem missão mesmo no nível 10; no nível 1, 93/100 indisponíveis contam também as casas futuras.
- Moldura clicável usa retrato autorizado em todas as casas, legenda HTML do nome e modal com homenagem. Foi reposicionada por breakpoint para não cobrir etiquetas no mobile.


## Campanha principal de plataforma — status (2026-09-29)
- Implementado o mapa com **10 mundos × 10 fases**, usando os temas e a narrativa das dez casas existentes. O canvas 2D tem corrida/salto, gravidade, plataformas e vãos com colisão, moedas, inimigos/obstáculos, checkpoint, três corações, HUD, portal, pausa/retry e controles por teclado e toque.
- A campanha abre após o onboarding. As fases futuras e seus prêmios mostram cadeados; primeira conclusão concede uma peça única da casa temática e moedas. Replay mantém o melhor resultado sem repetir decoração/moedas. Progresso novo em `platformProgress` migra aditivamente no save v2.
- **Minha Casa** continua disponível como modo secundário: cuidados, loja, missões, dez casas decoráveis e 11 minijogos seguem funcionando e concedem XP/moedas para evolução do pet. Os saves continuam locais em `localStorage`; não há sincronização de progresso do jogador com GitHub.
- O quadro/homenagem de Allana permanece interativo no cabeçalho permanente da aventura e na cena da casa, com retrato hospedado e texto autorizado; a foto não foi adicionada ao repositório.
- QA da branch: typecheck + Vite build aprovados; regra de domínio verificou 100 fases/100 prêmios únicos, bloqueio sequencial, migração, unlock na primeira vitória e replay sem duplicação. Browser: mapa desktop/mobile (375×812), canvas real da fase 1, corrida, salto sobre o primeiro vão e retorno a Minha Casa.
- `?demo=platformer` abre a aventura com perfil fictício em memória e preserva o save real; `?demo=1` continua demonstrando Minha Casa/minijogos. PWA mantém manifesto/ícones, mas não tem service worker/cache offline. Branch de trabalho `feature/meu-pet-virtual-refresh`; PR #2 deve permanecer aberto, sem merge nem publicação do site.


## Correções pós-QA (2026-09-29)
Esta nota atualiza os bullets anteriores: a entrada normal após onboarding abre Minha Casa; a campanha lateral continua como modo principal de desafios e é acessível pelo seletor. A placa de Allana é um pequeno ornamento clicável sem foto, e a homenagem não contém imagem.

- Piso/colisor alinhados; topo de grama e laterais do chão legíveis, vãos delimitados, fundo da sala fixo, mundo/obstáculos em movimento e gato com animação lateral de corrida/pulo.
- As fases aparecem em carrossel horizontal, com cadeados nos prêmios não recebidos; retrato 375×812 e paisagem 812×375 verificados.
- Decorações são obtidas apenas ao vencer sua fase 1:1 e só podem ser aplicadas depois; level-up de cuidados/minijogos não dá decoração. Limite de uma peça por ID e dez itens por sala; replay não duplica moedas.
- QA real com AutoPilot DEV completou cinco fases seguidas: 5/100, fase 6 disponível e fase 5 premiada com três estrelas. Smoke tests validaram geometria 1–5, bloqueio antes da vitória, sequência, replay, migração sem duplicatas e level-up sem móveis.
- Import explícito dos shaders padrão GLSL corrigiu a sala Babylon escura; após retirar a instrumentação, evento `pet:scene-ready`, WebGL2 e pixels de cena válidos foram confirmados. Build/TypeScript passaram; apenas aviso informativo de chunk grande. Sem merge/publicação.


## Polimento final após revisão visual (2026-09-29)
- Esta atualização substitui a nota pós-QA acima sobre “placa sem foto”: a sala agora usa o porta-retrato flutuante com a imagem autorizada; ao tocar, abre modal com foto ampliada à esquerda e homenagem à direita, empilhado em telas estreitas.
- Ao vencer, a recompensa aparece em três cartões separados: objetivo/estrelas → decoração única da casa/fase → moedas; o último apresenta Próxima fase e Voltar ao mapa. Replay não duplica prêmios.
- O topo de grama/terra é a superfície real do percurso; há plataformas suspensas e rotas verticais, tema de sala fixo ao fundo e sprite lateral do gato selecionado. Web Audio cobre coleta de moeda, impacto/pisão, perda de vida e vitória.
- QA real completou cinco fases consecutivas no perfil demo e confirmou a fase 6 liberada. Capturas de gameplay em retrato 390×844 e paisagem 844×390 mostram piso, pet, HUD e controles sem corte; a moldura e o modal também foram abertos no browser e a foto carregou.
- TypeScript e build de produção do branch passaram; permanece apenas o aviso informativo de chunk grande do bundle Babylon. PR aberto; sem merge e sem publicação.


## Preferências de áudio independentes (2026-09-30)
- A engrenagem aparece na sala principal e na aventura; ambos os painéis oferecem sliders separados para música de fundo e efeitos, com valor percentual e foco acessível.
- A trilha chiptune é sintetizada via Web Audio API e possui barramento próprio; efeitos mantêm volume independente e o mute existente afeta apenas efeitos. Os dois valores são persistidos localmente no aparelho.
- Verificado no WebDev: sliders presentes nos dois modos, valores alterados independentemente e persistidos; valores originais restaurados depois do teste. TypeScript, build Vite e `git diff --check` passaram no WebDev e neste clone do PR. Capturas móveis 390×844 confirmaram o encaixe da engrenagem.


## Interface da sala, mochila e presentes (2026-09-30)
- Atalhos da sala organizados em coluna única à esquerda (status, cuidados, missões, loja, mochila e história), com painéis expansíveis e barra de nível compacta.
- Mochila exibe consumíveis e decorações únicas já conquistadas, com ações adequadas para usar ou posicionar; presentes podem conceder moedas, consumíveis ou decoração.
- Coleta idempotente: cada variante foi verificada no domínio e uma segunda coleta da mesma caixa é rejeitada. O popup fica centralizado, mostra uma recompensa por vez, tem X no topo, origem e ação Usar quando aplicável.
- Porta-retrato permanente, arrastável e minimizável; ícone Sobre abre a homenagem e Restaurar traz a moldura de volta. O botão minimizar foi elevado acima da moldura para manter alvos independentes.
- Browser demo confirmou prêmio de moedas uma única vez, fechamento pelo X, minimizar → Sobre → Restaurar; captura da sala desktop e validação móvel anteriores mantidas. TypeScript, build Vite e `git diff --check` aprovados.


## Tour interativo e navegação da sala (2026-09-30)
- A primeira visita abre um guia de seis passos após o onboarding; Configurações → Como jogar o reabre quando necessário.
- O guia destaca a sala, cuidados, missões, mochila, navegação/decoração e Aventura com marcadores `data-room-tour`. No desktop há recorte com spotlight; abaixo de 1000 px a experiência usa cartão modal central compacto. Progresso, pontos clicáveis, Voltar/Próximo/Pular/Fechar e setas de teclado permitem navegar sem perder contexto.
- `?demo=1&tour=1` abre o primeiro passo em perfil de demonstração, sem persistir save; `?demo=1` segue iniciando na sala.
- QA WebDev: typecheck, build de produção e `git diff --check` aprovados; primeiro passo capturado em 1280×720 e 375×812; Configurações → Como jogar reabriu o guia; o browser avançou pelos seis passos até “Vamos jogar”. O bundle continua emitindo apenas o aviso informativo de tamanho do chunk Babylon. Manter PR aberto; sem merge/publicação.


## Menus compactos e acesso à idealizadora (2026-09-30)
- A coluna permanente de cartões foi substituída por um dock de sete atalhos: Cuidar, Missões, Loja, Mochila, Casas, Decorar e História. Cuidar reúne as quatro necessidades/status e as quatro ações de cuidado; Missões abre um único painel de progresso. Loja, mochila, casas, decoração e história seguem a um toque de distância.
- O controle de tela limpa agora oculta cabeçalho/detalhes, mas mantém os atalhos à vista e operáveis. Em larguras até 900 px o dock vira uma trilha estreita à esquerda, com rótulos compactos, para liberar a área central do pet; os painéis de contexto só aparecem quando solicitados.
- O porta-retrato visual grande foi substituído pelo atalho discreto **ⓘ Sobre** à esquerda da cena. A foto autorizada e a homenagem continuam no modal: composição lado a lado no desktop e empilhada em telas estreitas.
- QA desta rodada: TypeScript, build de produção e `git diff --check` aprovados; screenshots demo em 1280×720 e 375×812; no browser foram abertos Cuidar, Missões, Loja, Mochila, Casas, Decorar, História, Sobre e o modo limpo, confirmando que os atalhos continuam acessíveis. O build conserva o aviso conhecido de chunks grandes do Babylon; a demo não altera o save real.
- Manter o PR #2 aberto; não fazer merge nem publicar o site.


## Revisão da navegação da sala após feedback (2026-09-30)
A proposta anterior de deixar sete ícones em uma barra foi substituída por uma hierarquia baseada nos objetivos do jogo. **Casas**, **Decorar**, **Cuidar** e **Missões** são os quatro atalhos permanentes; **Loja**, **Mochila** e **História** ficam agrupadas em **Mais do jogo**, sem perder acesso. Aventura continua no cabeçalho. Cuidar e Missões abrem painéis contextuais junto à navegação, sem modal central; Casas e Decorar preservam seus fluxos existentes.

O menu ganhou uma identidade visual lúdica de patinhas e cores quentes. Em desktop ele ocupa uma coluna lateral compacta; no retrato móvel organiza os quatro controles em dois pares no alto à esquerda para não cobrir o pet nem os presentes; em paisagem curta usa um painel lateral mais estreito com os mesmos controles. O modo de tela limpa mantém esse conjunto principal acessível. **Sobre** agora fica no canto inferior esquerdo, alinhado verticalmente à câmera no canto inferior direito, e continua abrindo o tributo com foto e texto.

QA desta revisão: build de produção e TypeScript aprovados; capturas em 1280×720, 375×812 e 844×390; no navegador, Cuidar e Missões abriram no próprio painel, Mais revelou Loja/Mochila/História, Loja e Mochila carregaram suas telas, História exibiu o capítulo, Casas e Decorar abriram seus fluxos, Sobre exibiu foto e texto, e o modo limpo preservou os atalhos. O passo 4 do tutorial aponta para Mais do jogo. Alteração destinada apenas ao PR #2, que permanece aberto, sem merge ou publicação do site.


## Validação de menus em retrato e paisagem (2026-09-30)
Esta revisão substitui a hierarquia descrita na anotação imediatamente anterior: **Aventura** agora é o cartão destacado acima do menu; **Casas**, **Decorar**, **Cuidar** e **Missões** ficam sempre expostos; **Mochila** tem atalho próprio; **Loja** e **História** ficam em **Mais do jogo**. Os ícones de patinha, casa, coração, estrela, mochila e controle usam a linguagem visual do pet.

Cuidar e Missões abrem uma coluna lateral completa ao lado dos controles em desktop/paisagem, sem rolagem interna; em retrato o menu recolhe para uma rail de ícones e abre a janela ao lado. Na paisagem, a barra de nível fica logo abaixo da marca e **Sobre**/**câmera** permanecem nos cantos inferiores da cena.

QA: TypeScript, build de produção e `git diff --check` passaram; screenshots demo revisados em 1280×720, 375×812, 844×390 e 667×375. No browser, Aventura abriu o mapa de campanha, Mochila abriu o inventário, Casas e Decorar abriram seus fluxos, Cuidar e Missões exibiram seus painéis, Mais do jogo mostrou Loja/História e o modal Sobre manteve foto e texto. O guia foi reaberto e as etapas 4 e 6 destacaram Mochila e Aventura. Capturas de painel podem usar `?demo=1&roomMenu=care|missions`; isso só existe no modo desenvolvimento/demo. O build conserva o aviso informativo conhecido de chunk grande do Babylon. O PR #2 continua aberto, sem merge ou publicação.


## Controles flutuantes e painéis laterais — 2026-09-30
Esta revisão substitui as hierarquias anteriores: **Aventura** ganha o cartão de maior destaque, acima dos atalhos; **Casas**, **Decorar**, **Cuidar**, **Petiscos**, **Missões**, **Mochila**, **Loja** e **História** ficam como botões independentes, sem uma caixa de menu envolvendo-os. Cada atalho usa cor e ícone próprios do Meu Pet. As barras de nível e missão ficam logo abaixo da marca; o botão de Minijogos fica junto da missão, e o resumo de fome/energia mostra necessidades imediatas sem abrir painel.

Cuidar mostra estado do pet e ações; Petiscos abre itens para alimentar; Missões, Minijogos (11 jogos), Mochila, Decoração e Casas abrem painéis laterais no cenário, sem modal central. Loja e História mantêm seus fluxos completos atuais. O modo de cena limpa esconde a interface adicional e preserva câmera, Sobre, mapa, decoração e alimentação. Em paisagem curta, Sobre alinha-se ao rodapé e ao lado oposto da câmera, fica fora do dock quando não há painel e some temporariamente enquanto um painel ocupa essa área.

QA demo: capturas visuais em 1280×720, 375×812, 844×390 e 667×375; em paisagem curta, as quatro ações de cuidado e os 11 minijogos ficam visíveis sem corte e sem rolagem interna. Cuidar/Missões/Minijogos, Casas e sobreposição de Sobre durante o painel foram revisados; mapa, decoração e petiscos foram abertos no modo limpo. TypeScript, build Vite e `git diff --check` aprovados; permanece somente o aviso conhecido do bundle grande de Babylon. A demo preserva o save real. PR #2 destinado a permanecer aberto, sem merge nem publicação.


## Restauração final da sala de duas colunas — 2026-09-30
A decisão atual substitui as revisões de menu flutuante acima: a sala segue o layout de 29/09 — status e cuidados à esquerda, pet ao centro, missões/loja/história à direita, atalhos Casas/Decorar na cena e rodapé Cuidar/Minijogos/Loja. O `Home.tsx` sincronizado preserva o gameplay atual e recupera minimização dos painéis, bandejas de cuidado com toque/drag-and-drop, atalho de alimentação no modo limpo e persistência de demo sem gravar o save real.

Ajustes incluídos: link Mochila na aba correta, remoção de navegação duplicada, Felicidade em rosa, brilho natural para decorações e tutorial compatível com os alvos/restauração. QA no preview em 1280×720, 375×812 e 844×390, além de 667×375; bandejas de cuidado verificadas acima do rodapé fixo; Sardinha (“Usar agora”) e Luminária lunar (“Usar agora”) exercitados, com a decoração entrando no modo de posicionamento. Hashes/chaves de `localStorage` não mudaram durante uma ação demo. TypeScript, Vite build e `git diff --check` passaram; permanece o aviso informativo de chunk Babylon >500 kB.

Atualização destinada ao PR #2 (`feature/meu-pet-virtual-refresh`), que deve permanecer aberto e sem merge; não publicar o site.


## Compatibilidade touch, zoom e inventário móvel — 2026-09-30
- Breakpoints da sala também reconhecem dispositivos touch (`pointer: coarse`), para que zoom/“site para computador” no celular não troque a sala empilhada por um layout desktop minúsculo. Em retrato touch com viewport CSS ampliada, o conteúdo fica centralizado com largura máxima de 640 px; cenário/canvas continua ocupando a tela.
- Em retrato, a arte 16:9 da casa fica inteira e centralizada na largura, sem cortar as laterais; o preenchimento da área restante mantém a mesma imagem em cover, sem faixa clara/escura. Paisagem e desktop mantêm o enquadramento verificado.
- A faixa de missão e o atalho Minijogos ficam acima do rodapé móvel; Aventura conserva rótulo em paisagem; Mimi segue visível no modo limpo. Loja mostra prévia de consumíveis e o atalho Mochila sem glifo duplicado; Mochila lista itens de cuidado, enquanto decorações únicas ficam em Decoração.
- QA demo: 375×812, 844×390, 667×375, 1280×720 e retrato touch com viewport ampliada 1200×2670. O teste ampliado confirmou `pointer: coarse`, coluna empilhada, dock de missão, rodapé, localização da casa e prévia da loja; o screenshot mostrou a UI centralizada e arte do cenário em tela cheia. Saves reais não foram usados.
- TypeScript, build Vite e `git diff --check` devem permanecer aprovados; atualizar PR #2 mantendo-o aberto, sem merge nem publicação.


### Verificação final do dock móvel
Após a primeira QA, foi corrigida sobreposição de 4 px entre Missão/Minijogos e o rodapé em retrato. A revalidação mediu 8 px em 375×812 e 11 px nas paisagens 844×390 e 667×375, sem clipping. O teste também confirmou Mochila apenas com itens de cuidado, decorações únicas em Decoração, modo limpo funcional e saves reais intactos.


## Correção do fundo da sala em retrato — 2026-09-30
- Causa: a tela alta do celular mostrava ao mesmo tempo o fundo 16:9 ampliado em cover e a sala completa em outra camada, aparentando faixas repetidas.
- Correção: centralizar a arte completa sem cortar as laterais e usar preenchimento desfocado com feather nas bordas em retrato; paisagem/desktop mantêm o fundo original.
- QA demo: 375×812, 844×390, 667×375, 1280×720 e rotação ao vivo sem reload retrato→paisagem→retrato. Asset e WebGL ativos, sem erro de navegador, save demo isolado. PR #2 permanece aberto; sem merge/publicação.


## Requisito atualizado: fundo vertical em tela cheia — 2026-09-30
O usuário esclareceu que a imagem deve preencher toda a tela em retrato. Isso substitui a versão portrait-fit com faixas desfocadas: a composição usa uma camada única em `cover`, preenchendo o canvas de cima a baixo; como a arte original é horizontal, as laterais são cortadas para manter a proporção. Paisagem/desktop mantêm o enquadramento original. QA demo em 375×812, 844×390, 667×375 e 1280×720, incluindo rotação sem reload; sem erro de runtime e sem alteração do save. PR #2 fica aberto, sem merge/publicação.


## Barra de progresso abaixo do título da missão — 2026-09-30
No dock móvel da tela principal, a barra de progresso fica diretamente abaixo do título e da contagem; o botão Minijogos permanece ao lado. Validação no demo: retrato 375×812, paisagem 844×390 e compacta 667×375; rotação ao vivo sem reload, sem clipping nem erro de console e sem alteração do save. Pedido de cenários verticais pausado por orientação do usuário; nenhuma imagem nova gerada. PR permanece aberto, sem merge/publicação.


## Proporção da barra em paisagem compacta — 2026-09-30
O progresso da missão usa `clamp(120px, 23vw, 190px)` em paisagem para equilibrar barra e atalho Minijogos em telas menores; o layout em retrato não muda. Medidas QA: 844×390 = 190 px; 667×375 = 153 px; 568×320 = 131 px. Barra abaixo do título, sem clipping/erros; build/typecheck ok. PR #2 segue aberto, sem merge/publicação.