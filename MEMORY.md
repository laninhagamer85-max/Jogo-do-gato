# Memória de continuidade

- Repositório-base: `laninhagamer85-max/Jogo-do-gato`. A versão vanilla permanece em `legacy.html`; a experiência atual está em React/Vite/Babylon sob `src/`.
- Branch de trabalho: `feature/meu-pet-virtual-refresh`; PR #2 fica aberto para revisão, sem merge automático em `main`.
- O projeto WebDev `meu-pet-virtual` mantém preview iterável. O clone GitHub usa mídia local em `src/assets/`; a exceção é o retrato autorizado da idealizadora, referenciado por URL do storage gerenciado.
- Escopo atual: dez capítulos/casas; onze minijogos; seis gatos; seleção em três passos; fala e som em PT-BR; match-3 com drag-to-swap 8×8; movimento de pet; mapa de casas desbloqueadas; decoração móvel por casa; presente com expiração; PWA com ícone.
- O progresso fica local neste navegador. O modo `?demo=1` é em memória, não salva no storage e agora mostra móveis/presente fictícios para demonstração.
- QA final: builds e typechecks passaram no WebDev e no clone; smoke tests cobriram perfil, curva de XP, casas, decoração, coleta/expiração; no browser, o drag válido do match-3 consome uma jogada e o arrasto de decoração muda a posição sem alterar o save real. Nesta fatia, o toque no pet emitiu `pet:blink`, mostrou o nome por 2,6 s e o balão desapareceu após a fala/fallback; a ficha do perfil mostrou idade, gênero, capítulo, progresso, companhia e quatro cuidados. Móveis não exibem ferramentas até seleção; arrasto, rotação e fixação foram exercitados em `?demo=1` sem salvar o progresso real.
- Onboarding de áudio: introdução em PT-BR e saudações masculinas/femininas adicionadas como MP3; transcrições verificadas; teste no browser confirmou intro → `welcome-boy.mp3`/`welcome-girl.mp3`, sem submeter o perfil. Ambos os builds passaram e o PR #2 continua aberto, sem merge automático.
- Ao sincronizar: copiar frontend em `client/src/` para `src/` (sem backend), manter `src/game/assets.ts` com imports locais e adicionar assets de geração/ícones; executar `pnpm check`, `pnpm build` e `git diff --check` antes do push.

- Catálogo de decoração (2026-09-28): 100 itens únicos (dez por cenário), com 96 novos WebP RGBA 384×384 e quatro props legados; assets somam 3.346.716 bytes (13–62 KB cada). IDs, preços, salas e requisitos ficam em `src/game/decorations.ts`; âncoras do fundo em `src/game/decorationCoordinates.ts`; manifesto detalhado em `docs/decoration-catalog.json`.
- Verificação adicional: o loader SSR do Vite resolveu os 100 URLs locais sem erro; `dist` contém os 96 sprites novos; o demo WebDev carregou 10/10 thumbnails únicos na primeira casa e uma imagem de amostra por cada uma das dez casas retornou HTTP 200. Typecheck/build dos dois projetos passaram. Os móveis continuam bloqueados/fixos até seleção e os requisitos por nível/missão foram testados nos dois caminhos de compra.

- Follow-up 2026-09-28: Home, GameCanvas, SceneDecoration, cena Babylon, áudio PT-BR e CSS sincronizados do WebDev; clipes de toque/cuidado para menino/menina são arquivos locais Vite. Atualizar `src/game/assets.ts` manualmente ao acrescentar mídias: preservar imports em `src/assets/` e o mapa local dos 100 props.
- QA WebDev: clique vazio sem voz, toque aciona MP3 masculino, modo limpo esconde painéis, coleta exibe moedas e desaparece; captura do canvas retorna PNG de ~3–4 MB e fallback cria download com nome próprio sem gravar no teste. PR #2 segue aberto; não mesclar.
- Segurança/build (2026-09-28): `pnpm audit` full/prod = 0 advisories conhecidos; Vite 7.3.6, React plugin 5.2.0, Tailwind 4.3.3. `pnpm check`, build e diff-check passaram. Bundle Babylon ainda tem alerta de tamanho (1,17 MB, ~287 KB gzip); é aviso de otimização, não falha. Preview estático local retorna HTTP 200.

- Follow-up 2026-09-29: moldura da idealizadora adicionada a todos os cenários com legenda acessível, modal do texto autorizado e âncora responsiva; foto permanece no storage e não é copiada ao repo. Prévia/skin do pet agora têm reação visual; sequência de level-up não é sobrescrita por eventos de aparência.
- Presentes: 1,55 s para abrir; prêmio legível por 15,5 s, com origem/casa, miniatura e ação “Usar”; o item recebido pertence à casa que originou o presente. Catálogo: 18 peças com missão pendente mesmo no nível 10, zero missões contadas.


- Campanha principal de plataforma (2026-09-29): `PlatformerEngine.ts` e `platformerLevels.ts` implementam 100 fases em dez mundos; `platformProgress` migra no save v2. Cada primeira vitória premia a decoração da sala e moedas; replay não duplica. Cuidado/minijogos continuam no modo Minha Casa e mantêm a evolução XP/moedas do pet. O jogo não envia saves ao GitHub/cloud.
- QA no clone da branch: `tsc --noEmit`/Vite build passaram; smoke test puro contou 100 IDs únicos, fase futura bloqueada, progressão 1→2, migração e replay idempotente. Browser verificou mapa em desktop e 375×812, corrida/salto no canvas e a alternância Minha Casa. `?demo=platformer` preserva o save. PR #2 segue em `feature/meu-pet-virtual-refresh`, sem merge/publicação.


- Follow-up pós-QA (2026-09-29): sem foto no quadro/modal de Allana; ornamento nativo clicável afastado do pet. Minha Casa abre na entrada normal; campanha permanece acessível pelo seletor.
- Shader Babylon corrigido por imports explícitos default GLSL em `scene.ts`; debug removido depois de confirmar `pet:scene-ready`, WebGL2 e pixel opaco na sala.
- AutoPilot em desenvolvimento completou cinco fases reais; mapa mostrou 5/100 e fase 6 liberada, e a vitória da fase 5 exibiu três estrelas, decoração e moedas. Carrossel confirmado em retrato 375×812 e paisagem 812×375; demo não gravou save.
- Decoração só é aplicada depois da vitória da fase correspondente, uma por ID e até dez por casa. Level-up do pet não mais concede móveis. Testes puros cobrem 100 itens, fases 1–5, bloqueio/sequência, recompensa, replay sem farming, migração sem duplicatas e level-up sem móveis.
- Build/TypeScript/diff-check passaram; aviso de chunk Babylon é informativo. Assets locais `src/assets/` foram preservados. PR #2 continua aberto, sem merge ou publicação.


- Atualização visual posterior (2026-09-29): substitui a nota de “placa sem foto”; a sala mostra o retrato autorizado na moldura flutuante, que abre um modal com a foto ampliada à esquerda e o texto aprovado à direita. O PR contém a referência de imagem gerenciada, como documentado em ASSETS.md.

- Áudio independente (2026-09-30): `platformerAudio.ts` sintetiza trilha chiptune e centraliza SFX em dois barramentos Web Audio. `AudioVolumeControls` é compartilhado pela engrenagem da sala e da aventura; música/efeitos ficam persistidos em `localStorage` sob `meu-pet-platform-audio-v1`. O mute existente silencia somente efeitos, não a música; vozes do pet permanecem inalteradas. Browser confirmou valores independentes e persistência; WebDev e clone do PR passaram TypeScript/build. PR #2 segue aberto, sem merge/publicação.

- UI/itens (2026-09-30): Home sincronizada do WebDev com painel lateral e mochila; presentes aceitam moeda, consumível ou decoração e a coleta repetida é bloqueada. QA browser em demo: abriu +110 moedas uma vez, o X fechou sem selecionar móvel; porta-retrato minimizou, o ícone Sobre abriu a homenagem e Restaurar trouxe a moldura de volta. TypeScript/build e smoke test das três recompensas passaram; preview de demo preserva o save real.


- Tour de sala (2026-09-30): primeira visita após criação do perfil recebe guia interativo com seis etapas; Configurações → Como jogar reabre-o. `TutorialOverlay.tsx` usa `data-room-tour`, spotlight desktop e modal central conciso em telas estreitas; oferece progresso, pontos, teclado, voltar, pular e concluir. `?demo=1&tour=1` inicia passo 1 sem escrita no save; demo normal continua fechada.
- QA: typecheck/build/diff-check aprovados no WebDev; screenshots 1280×720 e 375×812 sem clipping; browser confirmou reabertura pelas Configurações e avanço até a etapa final. PR #2 `feature/meu-pet-virtual-refresh` permanece aberto, sem merge nem publicação.


- UI da sala (2026-09-30): coluna alta substituída por dock de sete atalhos — Cuidar, Missões, Loja, Mochila, Casas, Decorar e História. Um único drawer de Cuidar agrega barras de necessidades e ações; outro mostra progresso de missões. O botão de tela limpa recolhe o cabeçalho/detalhes, mas não esconde os atalhos; em mobile o dock compacto fica na borda esquerda para não cobrir o pet.
- Homenagem: `CreatorPlaquePicker.tsx` agora rende somente ícone de informação + “Sobre” no canto esquerdo da cena; removeu o porta-retrato grande/draggable. `CreatorTributeModal.tsx` mantém retrato autorizado e texto aprovado, lado a lado no desktop e empilhados em mobile.
- QA da reorganização: typecheck, Vite build e diff-check passaram; screenshots 1280×720 e 375×812 confirmam a cena desobstruída; browser abriu Cuidar, Missões, Loja, Mochila, Casas, Decorar, História, o modal da idealizadora e confirmou que a tela limpa preserva a navegação. A demo foi usada, sem tocar no save normal. O PR #2 permanece aberto, sem merge/publicação.

- Referências da revisão 2026-09-30: preview demo em https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1 e PR #2 em https://github.com/laninhagamer85-max/Jogo-do-gato/pull/2; foram usados para verificação, sem publicação do site.


## Estado atual da navegação da sala — 2026-09-30
Feedback posterior substituiu o dock de sete atalhos por quatro ações sempre expostas: **Casas**, **Decorar**, **Cuidar** e **Missões**. **Loja**, **Mochila** e **História** ficam sob **Mais do jogo**; Aventura permanece no cabeçalho. Os painéis de cuidado e missão são parte da coluna/área lateral, não modais centrais. Em retrato, a grade compacta fica no alto à esquerda; em paisagem curta e desktop, usa coluna lateral. O modo de tela limpa mantém os quatro atalhos e Mais visíveis.

O atalho **Sobre** está no canto inferior esquerdo da cena e alinhado à câmera no canto inferior direito; o modal mantém a foto autorizada e o texto à direita. QA no preview demo: Cuidar, Missões, Mais, Loja, Mochila, Casas, Decorar, História, Sobre, tela limpa e o alvo atualizado do passo 4 do tutorial foram exercitados; dimensões verificadas em 1280×720, 375×812 e 844×390. O PR #2 estava aberto no branch `feature/meu-pet-virtual-refresh` (head pré-sync `e7b5140`); manter aberto, sem merge/publicação.


## Atualização da navegação após QA de orientação — 2026-09-30
Esta nota substitui a hierarquia da entrada anterior: Aventura destacada no alto da navegação; Casas, Decorar, Cuidar e Missões expostos; Mochila em atalho próprio; Loja/História dentro de Mais do jogo. Cuidar/Missões abrem painéis laterais completos; retrato usa a rail compacta com janela à direita, e paisagem usa painel adjacente sem esticar os botões. A faixa de nível fica sob a marca em paisagem. Sobre e câmera estão alinhados ao rodapé da cena.

QA no demo em 1280×720, 375×812, 844×390 e 667×375; browser confirmou Aventura/campanha, Mochila/inventário, Casas, Decorar, Cuidar, Missões, Mais do jogo e o modal Sobre. Tutorial reaberto pelas Configurações; passos 4 e 6 verificados. TypeScript, Vite build e `git diff --check` passaram. PR #2 autorizado segue aberto, sem merge/publicação.


## Navegação atual da sala — 2026-09-30 (revisão final)
Substitui as notas anteriores: a Aventura é o botão de destaque acima de um grupo de atalhos independentes e coloridos — Casas, Decorar, Cuidar, Petiscos, Missões, Mochila, Loja e História — sem contêiner lateral. Logo abaixo da marca ficam as barras de nível e missão; Minijogos fica junto da barra de missão, e o resumo de necessidades exibe fome/energia prioritárias. Cuidar abre estado e ações; Petiscos, Missões, Minijogos, Mochila, Decorar e Casas usam painéis adjacentes no cenário. Loja/História preservam os fluxos completos existentes.

Tela limpa oculta a UI adicional, mantendo câmera, Sobre, mapa, decoração e alimentação. Em paisagem curta, Sobre fica no rodapé, depois do dock; esconde enquanto o painel ocupa essa área para não cobrir ações e reaparece ao fechar. Em modo limpo ele retorna ao canto inferior esquerdo, alinhado com a câmera.

QA no demo em 1280×720, 375×812, 844×390 e 667×375. Revisados painéis de Cuidar, Missões e Minijogos; todas as quatro ações de cuidado e os 11 jogos cabem em paisagem curta sem corte; mapa, decoração e petiscos continuam funcionais no modo limpo. TypeScript, build e diff-check passaram; build mantém apenas o aviso de chunk grande do Babylon. Preview: https://3000-iq758tlsmeljsgb03xc3g-23cfac3e.us1.manus.computer/?demo=1. PR #2 (`feature/meu-pet-virtual-refresh`) deve continuar aberto, sem merge/publicação.