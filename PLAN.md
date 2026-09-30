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
