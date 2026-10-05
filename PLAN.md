# Game Plan: Meu Pet Virtual — Uma Casa de Cada Vez (Expansão 2)

## Objetivo
Tornar o pet game mais expressivo e jogável, preservando o save da campanha de dez casas. O jogador escolhe sexo/apresentação, um de seis gatos, depois idade e nome; pode movimentar o pet no cenário, decorar cada casa, coletar presentes temporários, revisitar casas conquistadas e jogar um match-3 mais longo.

## Fatias de risco

### A. Input de mundo, caminhada e decoração contextual
- **Risco:** hit testing e coordenadas podem conflitar com os overlays e desalinhar em retrato.
- **Abordagem:** canvas recebe somente cliques que passam pelos controles HTML; converter pointer em ortho-world, limitar caminhada à área visível; cliques em gato, companheiro e presente geram eventos tipados. Decorações são fixas até serem selecionadas; o segundo gesto arrasta; rotação, Fixar e retorno à mochila aparecem somente na seleção.
- **Verificar:** clique vazio faz o gato andar e parar dentro da cena; hit do amigo fala sem mover; toque seleciona decoração, drag altera e persiste posição; rotação/Fixar/guardar funcionam; tecla de seta ajusta a peça; botão/modal não movimenta o pet.

### B. Migração e conteúdo temporário
- **Risco:** perder saves existentes, itens comprados ou presentes offline expirados.
- **Abordagem:** migração aditiva em `migrateGameState`; defaults para personagens, rooms, inventário decorativo e placements; presentes têm `createdAt`/`expiresAt`, máximo de dois por casa e são filtrados ao carregar.
- **Verificar:** save v2 anterior preserva nível/XP/moedas/companheiros; casa ativa válida; presentes expirados somem em reload sem conceder prêmios.

### C. Match-3 por arrasto e curva de dificuldade
- **Risco:** pointer/touch pode registrar duas jogadas, combos, movimentos ou prêmios duplicados.
- **Abordagem:** manter lógica pura; interface suporta seleção por toque/clique e arrasto adjacente com `pointer capture`, com trava de clique duplicado. Metas e movimentos sobem por capítulo; cascatas reproduzem um som original, efeitos e pontuação.
- **Verificar:** swap arrastado adjacente válido/inválido; fallback em dois toques; cascata conta corretamente; vitória única; restart recomeça.

## Main build
- Seis gatos originais (três menino, três menina); onboarding em 3 passos: sexo → gato → idade/nome.
- Movimento livre por clique, passeio de companheiros e falas contextuais PT-BR com timbres diferentes por personagem.
- Curva de XP mais longa, necessidades caem um pouco mais rápido e mudança de nível fecha overlays para mostrar fala/celebração e nova casa.
- Mapa de casas para voltar a qualquer cenário desbloqueado; progresso continua no nível máximo, sem regredir.
- Inventário para decoração (comprar/receber, posicionar, selecionar para mover/girar/fixar e guardar mantendo o item); guardar placements por casa e desenho adaptado a mobile.
- Presentes surpresa caem em até duas vagas, ficam 90 s e entregam moedas ou decoração ao tocar/coletar.
- HUD compacta para dar espaço à cena, sem rótulos permanentes sobre pet/amigos; no toque o pet pisca e revela o nome por instantes, e fala em balão sobre a cabeça que some ao terminar; configurações abrem ficha completa do perfil.
- Ícone instalado/PWA com imagem original e manifest.

## Assets
Campanha de 10 casas com 10 decorações temáticas únicas por cenário (100 no total), WebP transparente de 384×384 otimizado; as quatro peças legadas permanecem compatíveis e cada ID aponta para seu asset próprio. Uma parte do catálogo só abre por nível ou missões concluídas; caminhos WebDev ficam em `client/src/game/decorationAssets.ts`, requisitos em `client/src/game/decorations.ts` e mídia empacotada para Vite em `src/assets/decorations/`.

## Verificação
- `pnpm check` e `pnpm build` na versão WebDev e no clone Vite do PR.
- Regras puras: migração de perfil/room, progressão lenta, compra/recompensa, expiração de presente e placement persistente.
- Navegador: onboarding sequencial e seis escolhas, caminhar/clique, amigo clicável, presente cai/coleta/expira, decoração move/rota e permanece ao revisitar casas.
- Match-3: mouse arrastar, toque e fallback, cascata/áudio, metas/limites por capítulo e sem recompensa duplicada.
- Nível-up: todas as janelas fecham, casa muda, animação/fala toca uma vez.
- Capturas desktop e mobile verificam cena livre, sem texto sobre personagens; instalar ícone e manifest válidos; nenhum erro no console.
- Demo `?demo=1`: clique no pet emite `pet:blink`, revela nome e fecha fala após término/fallback; ficha lista idade, gênero, personagem, casa, nível, XP, moedas, companhia e quatro necessidades. Móveis ocultam ferramentas até seleção; arrasto, giro em 15° e Fixar testados sem escrita no save real.
- Decoração: exatamente 10 IDs por casa e 100 URLs únicas; compra/colocação bloqueadas antes do requisito e aceitas depois; amostra HTTP 200 em todos os níveis; coordenadas de fundo preservadas em desktop e retrato.


## Follow-up de experiência, offline e segurança (2026-09-28)
- Toque vazio no cenário move o pet sem chamar sua voz; a hitbox acompanha o personagem. Fala usa clipes PT-BR nativos específicos por gênero para toque e cuidado, sem SpeechSynthesis do navegador.
- Modo de tela limpa oculta os painéis sem perder o acesso aos controles essenciais; a câmera exporta um PNG do canvas Babylon sem HUD (partilha nativa no celular ou download no desktop).
- Decorações fixas são renderizadas atrás do pet; somente a peça selecionada é elevada para edição. Presentes aparecem a cada 4,5–7,5 min e a abertura mostra a recompensa antes de desaparecer gradualmente.
- PWA: manifesto e ícones permitem instalação, mas ainda não existe service worker nem cache offline; a experiência requer rede para shell/arte/áudio não armazenados.
- Segurança: servidor estático usa Express 5.2.1; `pnpm audit` completo e `pnpm audit --prod` retornaram zero advisories conhecidos nesta verificação. O jogo não tem conta/API e grava o save em `localStorage`, sem criptografia; não é um teste de penetração.
- Verificação mais recente: `pnpm check`, `pnpm build` e `git diff --check` concluídos após upgrades do tooling; conferir preview desktop/mobile e PR antes do handoff.


## Follow-up: aparência, presentes e quadro da idealizadora (2026-09-29)
- Seleção de personagem no onboarding troca o sprite da cena imediatamente; troca de skin aplica matiz mais perceptível e um salto curto de confirmação. Eventos de aparência não sobrescrevem a reação de level-up.
- Itens fixos mantêm a cor natural, ficam ligeiramente maiores e atrás do pet; somente a peça em edição vem para a frente.
- A abertura do presente leva 1,55 s; depois, item/moedas, miniatura, casa de origem e ação “Usar” ficam disponíveis por até 15,5 s antes do fade, podendo ser dispensados. Teste puro confirmou que item e origem pertencem à mesma casa.
- Mais itens exigem progressão: na casa de nível 10, 18 peças ainda pedem missões; no nível 1, 93/100 ficam indisponíveis por nível/missão ao contar também as casas futuras.
- Retrato autorizado aparece em uma moldura fixa em cada casa; nome na placa é legenda acessível separada da foto; toque abre a homenagem com o texto aprovado.
- Verificado por build/typecheck e captura desktop/mobile; revalidar o label em viewport móvel após reposicionar a placa.


## Follow-up: aventura de plataforma como campanha principal (2026-09-29)

### Tarefas de risco

#### Física 2D, colisões e controles responsivos
- **Por que isolada:** saltos, aterrissagem, colisão nas bordas e controles touch precisam permanecer determinísticos em 60/30 FPS e em diferentes larguras.
- **Abordagem:** mundo lateral em canvas 2D com coordenadas lógicas fixas, delta-time limitado, plataformas e obstáculos data-driven, câmera horizontal simples; teclado e botões touch atualizam ações sem espalhar leitura de teclas pelo domínio. Cada hit aplica invulnerabilidade curta e reposiciona no checkpoint; três vidas esgotadas oferecem repetir.
- **Verificar:** iniciar→correr→pular→aterrissar, pulo em plataforma, coletar moeda, tomar dano/respawn, checkpoint, derrota/retry, chegada ao portal; direção e controles de toque correspondem ao movimento; sem saltos por frame perdido.

#### Campanha persistida e prêmio único por estágio
- **Por que isolada:** 10 mundos × 10 estágios correlacionam estágio global, casas, 100 decorações, moedas e save existente; concluir/repetir não pode duplicar itens.
- **Abordagem:** progresso versionável em `GameState`, migrado aditivamente; desbloqueio sequencial global, replay dos estágios anteriores; cada estágio concede uma decoração temática única e moedas uma única vez. Mapa mostra os dez itens do mundo, disponíveis como miniaturas ou cadeados. As casas/cuidados/minijogos permanecem acessíveis por navegação.
- **Verificar:** 1→2, travar estágio futuro, abrir próximo mundo após o décimo, concluir/repetir sem duplicar moedas/decoração, reload preserva estágio/estrelas, save v2 antigo migra com campanha no começo.

### Construção
- Modo principal após onboarding: aventura side-scroll com 10 mundos derivados dos cenários existentes, 10 fases por mundo, história curta, dificuldade crescente, corações, moedas coletáveis, obstáculos/inimigos simples, checkpoints, som de jogo, tela de pausa e HUD legível.
- Ao concluir fase, animação/baú revela moedas, item de decoração do cenário e ação de ver coleção/voltar; o mapa visual destaca os 10 móveis da casa atual e mantém os não ganhos com cadeado. Os 100 itens existentes tornam-se recompensas de fase e continuam utilizáveis na casa.
- Retrato de Allana deixa de parecer overlay separado: fica como quadro pequeno/ornamento fixo, atrás do pet, em ponto narrativo natural de cada sala. A hitbox acessível fica alinhada ao item; tocar abre a homenagem; o item não é selecionável como mobiliário movível.
- Seleção/edição de móveis não altera a textura/material: item fixo permanece em cor natural e a sobreposição de seleção serve apenas como feedback de contorno.
- O quarto, cuidados, loja, missões e 11 minijogos existentes continuam como segundo modo (“Minha Casa”); o save local não é descartado.

### Verificação
- `pnpm check`, `pnpm build`, `git diff --check`; regras puras para sequenciamento/recompensa/migração e 10×10 associação casa→decoração.
- QA browser desktop e mobile: teclado, toque, modo retrato, seleção de fase, lives, moedas, pausa, porta/goal, reward chest, grid 10 itens locked/unlocked, replay sem duplicação; retorno à casa e ao retrato.
- Sem arte quebrada, colisão impossível ou HUD sobre o personagem; nenhuma exceção de runtime; confirmar redução de movimento e visibilidade do foco/controles touch.


## Campanha principal de plataforma — status (2026-09-29)
- Implementado mapa com **10 mundos × 10 fases**, cada mundo derivado de uma casa existente. O canvas 2D tem corrida/salto, gravidade, colisão com plataformas, vãos, inimigos e obstáculos, moedas, checkpoint, três corações, HUD, portal, pausa/retry e botões de toque.
- A aventura abre após onboarding; fases/prêmios futuros mostram cadeados. Primeira conclusão entrega uma decoração única da casa temática e moedas; replay não duplica. `platformProgress` é adicionado ao save v2 por migração segura.
- **Minha Casa** segue como modo secundário, sem retirar cuidados, perfil, loja, missões, presentes, decorações ou 11 minijogos; esses sistemas mantêm os ganhos de XP/moedas para evolução do pet. O save fica local no navegador; sincronização com GitHub é de código/assets via PR, não dos dados de jogo.
- Quadro/homenagem de Allana continua interativo tanto na casa quanto no cabeçalho da aventura; foto hospedada não é copiada para o projeto.
- Verificação: `tsc --noEmit` e `vite build` passaram no WebDev; assets WebP respondem pela rota gerenciada. Capturas desktop/mobile (375×812) mostram mapa, cadeados, botões e quadro; fase 1 foi iniciada e corrida/salto e retorno à casa foram exercitados no clone GitHub. Smoke test puro da branch cobre 100 recompensas únicas, avanço, migração, bloqueio futuro e replay sem duplicação.
- `?demo=platformer` usa perfil de demonstração em memória sem escrever no save; `?demo=1` continua a demo da casa. PWA mantém manifesto/ícones, mas não inclui service worker/cache offline. Não publicar o site nem mesclar o PR automaticamente.


## Correções após teste de jogabilidade (2026-09-29)

Esta seção substitui qualquer nota anterior que ainda mencione retrato na placa ou entrada obrigatória na Aventura: a placa não exibe foto, e a entrada normal após onboarding abre Minha Casa, mantendo a campanha acessível pelo seletor.

- A placa da idealizadora é um ornamento pequeno e interativo, sem retrato no cenário ou no modal; o toque abre apenas a homenagem aprovada. A posição fica fora da frente do pet.
- A cena de cuidados estava escura no Vite por falta de registro dos shaders GLSL padrão: `scene.ts` importa explicitamente os módulos `default.vertex.js` e `default.fragment.js`. A cena Babylon voltou a renderizar; a instrumentação temporária foi removida.
- Ajustes da aventura: spawn/colisor alinhados ao topo da superfície, plataformas com topo de grama e laterais/solo claramente legíveis, vãos reconhecíveis, fundo da casa estático, câmera/obstáculos deslocando-se e pet lateral animado em corrida/pulo.
- O mapa apresenta as fases como carrossel horizontal com foco na atual e próximos prêmios/cadeados; revisado em 375×812 (retrato) e 812×375 (paisagem).
- Todas as 100 decorações seguem a correspondência exclusiva 1:1 com fases, sem repetição global e limite de 10 por sala. Level-up por cuidados/minijogos não concede mais móveis; a decoração só pode ser aplicada após vencer a fase correspondente. Replay não duplica moedas nem prêmio.
- QA final: AutoPilot de desenvolvimento concluiu cinco fases seguidas, exibiu 5/100 e liberou a fase 6; a fase 5 terminou com três estrelas e recompensa única. Testes puros também cobriram geometria das fases 1–5, bloqueio antes da vitória, desbloqueio sequencial, replay, migração sem duplicatas e level-up sem decoração. Perfil `?demo=platformer` não grava no save normal.
- TypeScript e build de produção passaram. Vite emite somente o aviso já conhecido de chunk grande de Babylon; sem erro de build.


## Polimento de jogabilidade e recompensas (2026-09-29)
- A vitória agora revela **um cartão por vez**: (1) missão concluída/estrelas; (2) decoração da casa que foi alcançada, com imagem e origem; (3) moedas ganhas e, no último cartão, opções para próxima fase ou mapa. Replay explicita que não duplica item/moedas.
- Percursos foram ampliados de 12–17 para 15–20 trechos, com plataformas elevadas em rotas alternadas e alguns degraus de duas alturas; os obstáculos são tratados como alvos de salto pelo piloto QA.
- O chão do canvas usa a textura side-view grama/terra como superfície real de todas as plataformas, incluindo as suspensas. A primeira linha de pixels do terreno coincide com o topo de colisão; o fundo da sala permanece fixo enquanto os elementos do percurso/câmera avançam.
- O personagem desenhado agora é uma sprite original lateral selecionada pelo perfil (seis variantes), com inclinação/bounce durante corrida e sombra no chão; mantém fallback procedural se a imagem não carregar.
- Web Audio API acrescenta timbres distintos para coleta de moeda, salto, impacto em monstro, perda de vida e vitória. O mute existente silencia esses sons, e notas de vitória sobrevivem à desmontagem do motor tempo suficiente para tocar.
- Verificação já concluída nesta rodada: TypeScript, Vite build e `git diff --check`; capturas de mapa em 1280×800, 375×812 e 812×375 não mostram corte/overflow. **A QA real de cinco fases e capturas da fase em retrato/paisagem ainda estão em execução.**


## Resultado final da rodada de polimento (2026-09-29)
A QA real no preview completou as fases 1–5 consecutivamente, mostrou os três cartões de recompensa em sequência e liberou a fase 6. Capturas de gameplay em retrato (390×844) e paisagem (844×390) mostram fundo da sala, topo de grama/terra alinhado à colisão, gato lateral escolhido, HUD e controles sem corte. Na sala, a moldura flutuante carregou o retrato autorizado; seu clique abriu modal responsivo com imagem ampliada à esquerda e informação à direita. Efeitos sintetizados cobrem moeda, impacto/pisão, perda de vida e vitória. TypeScript e build de produção passaram; não houve publicação.


## Preferências de áudio independentes (2026-09-30)
- A engrenagem de configurações está disponível tanto na tela principal da sala quanto no HUD da aventura; ambos abrem sliders separados para **música de fundo** e **efeitos sonoros**, com valor percentual visível e suporte a teclado/foco.
- A campanha agora tem trilha chiptune sintetizada via Web Audio API, respeitando o volume próprio. Os efeitos existentes usam um barramento separado; o botão de mute continua silenciando efeitos sem mutar a música. A preferência de cada canal é persistida no `localStorage` do aparelho e restaurada ao entrar no jogo.
- Verificação: TypeScript e build de produção passaram; o browser confirmou os dois sliders na sala e na aventura, alterou cada canal independentemente, verificou a gravação local e restaurou os valores de teste. Capturas mobile 390×844 revisaram a engrenagem em ambas as telas; console sem erros.


## Tour interativo e navegação da sala (2026-09-30)
- A entrada de primeira visita apresenta um guia curto de seis passos depois do onboarding; a engrenagem de Configurações mantém a opção **Como jogar** para reabrir a qualquer momento.
- O guia destaca o cenário e os atalhos reais via `data-room-tour`; o cartão explica passeio/interação com o pet, cuidados, missões, loja/mochila, casas/decoração e Aventura. No desktop o recorte acompanha o alvo e o cartão evita a área destacada quando há espaço; abaixo de 1000 px, usa modal compacto central. Inclui progresso, pontos de navegação, Voltar/Próximo/Pular/Fechar, setas do teclado e respeito a movimento reduzido.
- `?demo=1&tour=1` abre o primeiro passo na demo sem persistir save, para facilitar revisão visual; a demo comum continua iniciando com o tour fechado.
- QA desta rodada: TypeScript, build de produção e `git diff --check` passaram; preview WebDev validado em 1280×720 e 375×812; Configurações → Como jogar reabriu o guia e o browser mostrou o passo 1 com controles de progresso e próximo. O build mantém apenas o aviso informativo já conhecido de chunk grande do Babylon. Confirmar novamente o branch do PR após a cópia seletiva; não mesclar nem publicar.


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


## Atalhos diretos de cuidado e HUD mais compacto — 2026-09-30
- Aventura é o atalho de maior destaque; abaixo, Casas, Decorar, Mochila e Loja usam botões menores independentes, coloridos e com ícones próprios. A faixa de nível/missão foi reduzida e fica junto à marca; História acompanha o nível, e Minijogos abre pela faixa de missão.
- Os quatro estados — Felicidade, Fome, Higiene e Energia — ficam visíveis junto à marca. Alimentar, Banho, Carinho e Dormir aparecem sempre como atalhos diretos com ícone, cor e percentual; deixa de existir o botão genérico Cuidar.
- Se houver consumível correspondente, o atalho abre uma bandeja lateral contextual. Alimento e demais itens podem ser tocados para usar ou arrastados ao pet; sem item, o cuidado segue pelo fluxo existente/alternativa de refeição. Teste real na demo: Sardinha crocante elevou Fome de 58% para 86%; Espuma de nuvem elevou Higiene de 82% para 100%.
- Minijogos agora são cartões em grade com ícone, nome, objetivo curto e botão Jogar. QA abriu a grade de 11 opções e iniciou Colheita de Petiscos com sucesso.
- Tela limpa mantém apenas o controle de tela, câmera, Sobre, mapa/Casas, decoração e Alimentar; os três atalhos funcionam como ícones independentes. O mapa foi corrigido para não sumir atrás de uma regra antiga de ocultação.
- QA visual: 1280×720, 375×812, 844×390 e 667×375. TypeScript, build Vite e `git diff --check` passaram; o build emite apenas o aviso conhecido de chunk Babylon >500 kB. A demo usa estado temporário.
- Esta rodada foi solicitada para checkpoint WebDev somente: não fazer push, merge nem publicação.


## Menu restaurado a pedido — versão de 29/09 (2026-09-30)
A solicitação posterior escolheu explicitamente a versão de duas colunas do checkpoint `eda3263`, substituindo a reorganização de botões flutuantes e o HUD de cuidados diretos das notas anteriores. A tela volta a mostrar status e cuidados no painel esquerdo, cena no centro, e missão/loja/história no painel direito; o rodapé volta a oferecer Cuidar, Minijogos e Loja. Mantidos os sistemas atuais do jogo, a mochila acessível pela Loja, o modal de minijogos, configurações/áudio, tutorial, presentes, retrato Sobre e progresso local.

Apliquei apenas o layout/estrutura de navegação da versão selecionada, mantendo o centro de cena e overlays atuais. QA: TypeScript/build Vite e `git diff --check` passaram; screenshots demo revisados em 1280×720, 375×812, 844×390 e 667×375. Nenhum push, merge ou publicação nesta rodada.


## Fechamento: sala clássica restaurada e polida (2026-09-30)
Esta decisão substitui as propostas de menus flutuantes registradas acima: manter a disposição escolhida de 29/09, com status/cuidados à esquerda, cenário do pet ao centro e missões/loja/história à direita, além dos atalhos Casas/Decorar no cenário e navegação inferior Cuidar/Minijogos/Loja.

Foram preservados os recursos atuais e corrigidos os pontos desta revisão: bandejas de cuidados usam consumíveis por toque ou arrastar-e-soltar no pet; o painel de cuidado rola para a área visível após abrir em telas baixas; o modo limpo mantém o atalho de alimentação e sua bandeja sem bloquear cliques; o atalho Mochila leva à aba correta; não há botão duplicado para Casas; a barra Felicidade volta ao rosa; decorações usam tintas difusa/emissiva brancas para cor natural; e os textos/alvos do tutorial correspondem à sala restaurada.

QA em demo: desktop 1280×720, retrato 375×812, paisagem 844×390 e paisagem curta 667×375; bandejas testadas sem recorte sob o rodapé fixo; fluxos de cuidado, arrastar alimento, mapa/decorar, Mochila e 11 minijogos revisados; “Usar agora” foi exercitado tanto com Sardinha (recompensa/item consumido) quanto com Luminária lunar (inicia posicionamento na Casa 1). A hash do localStorage permaneceu idêntica antes/depois de uma ação demo, sem expor valores de save. TypeScript, build Vite, bundle do servidor e `git diff --check` passaram; permanece apenas o aviso conhecido de chunk do Babylon >500 kB.

Destino GitHub previamente autorizado: atualizar `laninhagamer85-max/Jogo-do-gato` / PR #2 (`feature/meu-pet-virtual-refresh`), mantendo aberto, sem merge ou publicação. Preview de QA: https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1.


## Compatibilidade touch, zoom e inventário móvel — 2026-09-30
- Breakpoints da sala também reconhecem dispositivos touch (`pointer: coarse`), para que zoom/“site para computador” no celular não troque a sala empilhada por um layout desktop minúsculo. Em retrato touch com viewport CSS ampliada, o conteúdo fica centralizado com largura máxima de 640 px; cenário/canvas continua ocupando a tela.
- Em retrato, a arte 16:9 da casa fica inteira e centralizada na largura, sem cortar as laterais; o preenchimento da área restante mantém a mesma imagem em cover, sem faixa clara/escura. Paisagem e desktop mantêm o enquadramento verificado.
- A faixa de missão e o atalho Minijogos ficam acima do rodapé móvel; Aventura conserva rótulo em paisagem; Mimi segue visível no modo limpo. Loja mostra prévia de consumíveis e o atalho Mochila sem glifo duplicado; Mochila lista itens de cuidado, enquanto decorações únicas ficam em Decoração.
- QA demo: 375×812, 844×390, 667×375, 1280×720 e retrato touch com viewport ampliada 1200×2670. O teste ampliado confirmou `pointer: coarse`, coluna empilhada, dock de missão, rodapé, localização da casa e prévia da loja; o screenshot mostrou a UI centralizada e arte do cenário em tela cheia. Saves reais não foram usados.
- TypeScript, build Vite e `git diff --check` devem permanecer aprovados; atualizar PR #2 mantendo-o aberto, sem merge nem publicação.


## Ajuste final de espaçamento do rodapé — 2026-09-30
A medição automatizada encontrou 4 px de sobreposição entre a faixa Missão/Minijogos e o rodapé em retrato. O dock foi elevado; na nova QA o espaço medido ficou em 8 px no retrato 375×812 e 11 px nas paisagens 844×390 e 667×375, sem corte de controles. Mochila/Decoração, modo limpo, demo sem alteração do save e console limpo também passaram.


## Correção do fundo da sala em retrato — 2026-09-30
- Causa: a tela alta de celular ampliava a textura 16:9 em cover e, ao mesmo tempo, desenhava a sala inteira em outro plano; as duas imagens ficavam visíveis como faixas sobrepostas.
- Correção: em retrato, manter a sala completa e sem corte lateral no centro; substituir a cópia nítida do fundo por preenchimento ambiente desfocado da mesma casa e aplicar feather transparente nas bordas. Paisagem e desktop continuam usando o enquadramento original.
- Verificação demo: 375×812, 844×390, 667×375 e 1280×720; também rotacionado ao vivo retrato→paisagem→retrato sem recarregar. Textura carregada, WebGL ativo, console sem erros e localStorage inalterado. Não publicar.


## Requisito atualizado: fundo vertical em tela cheia — 2026-09-30
O usuário esclareceu que a imagem deve preencher toda a tela na orientação vertical. Isso substitui a solução portrait-fit com faixas desfocadas: retrato agora usa uma única camada de cenário em `cover`, cobrindo 100% do canvas de cima a baixo e de lado a lado; para manter a proporção da arte horizontal, as laterais são cortadas. Paisagem/desktop conservam o enquadramento original. QA demo 375×812, 844×390, 667×375 e 1280×720; rotação em tempo real, WebGL e asset aprovados, sem erro no console e sem alterar o save.


## Barra de progresso abaixo do título da missão — 2026-09-30
No dock móvel da tela principal, a barra de progresso foi movida para imediatamente abaixo do título e do contador de progresso; o atalho Minijogos ocupa a coluna ao lado. Layout validado em retrato 375×812, paisagem 844×390 e paisagem compacta 667×375; rotação sem reload, sem clipping, WebGL/texturas ok, console sem erros, localStorage demo intacto. Geração de cenários verticais pausada conforme pedido mais recente; nenhuma nova imagem foi gerada.


## Proporção da barra em paisagem compacta — 2026-09-30
A largura do progresso de missão em paisagem usa `clamp(120px, 23vw, 190px)` para manter proporção visual nos celulares compactos, sem alterar o dock em retrato. QA: 844×390 = 190 px; 667×375 = 153 px; 568×320 = 131 px; abaixo do título, contida na coluna de texto, sem clipping/erros, save demo preservado. Build/typecheck aprovados. PR #2 aberto; sem merge/publicação.


## HUD vertical e mapa da Aventura em celulares — 2026-10-01
- Em retrato, o bloco da missão fica abaixo do nível; ao lado, os atalhos sempre visíveis Aventura (100 fases) e Minijogos (11 jogos). Felicidade/Fome/Higiene/Energia começam visíveis com recolher/expandir; Cuidar permanece expandido, com ações em coluna; Mochila começa recolhida, ao lado, e abre a lista utilizável sem modal. Decorações não aparecem na lista de consumíveis.
- O mapa da Aventura conserva no celular a estrutura do desktop: identificação do pet, mundo/casa, descrição, desafio/objetivo, progresso do mundo/campanha, troféus e faixa/carrossel de fases.
- QA demo: retrato 375×812 e 390×844; paisagem 844×390 e 667×375; desktop 1280×720. Seções do mapa visíveis dentro dos cartões, barra de história sem overflow nas duas orientações móveis, controles recolhíveis e mochila verificados, saves inalterados e console sem erros. Não publicar.
