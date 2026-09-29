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
