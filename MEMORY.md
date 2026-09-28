# Memória de continuidade

- Repositório-base: `laninhagamer85-max/Jogo-do-gato`. A versão vanilla permanece em `legacy.html`; a experiência atual está em React/Vite/Babylon sob `src/`.
- Branch de trabalho: `feature/meu-pet-virtual-refresh`; PR #2 fica aberto para revisão, sem merge automático em `main`.
- O projeto WebDev `meu-pet-virtual` mantém preview iterável. O clone GitHub usa mídia local em `src/assets/` e não depende de `/manus-storage/`.
- Escopo atual: dez capítulos/casas; onze minijogos; seis gatos; seleção em três passos; fala e som em PT-BR; match-3 com drag-to-swap 8×8; movimento de pet; mapa de casas desbloqueadas; decoração móvel por casa; presente com expiração; PWA com ícone.
- O progresso fica local neste navegador. O modo `?demo=1` é em memória, não salva no storage e agora mostra móveis/presente fictícios para demonstração.
- QA final: builds e typechecks passaram no WebDev e no clone; smoke tests cobriram perfil, curva de XP, casas, decoração, coleta/expiração; no browser, o drag válido do match-3 consome uma jogada e o arrasto de decoração muda a posição sem alterar o save real.
- Onboarding de áudio: introdução em PT-BR e saudações masculinas/femininas adicionadas como MP3; transcrições verificadas; teste no browser confirmou intro → `welcome-boy.mp3`/`welcome-girl.mp3`, sem submeter o perfil. Ambos os builds passaram e o PR #2 continua aberto, sem merge automático.
- Ao sincronizar: copiar frontend em `client/src/` para `src/` (sem backend), manter `src/game/assets.ts` com imports locais e adicionar assets de geração/ícones; executar `pnpm check`, `pnpm build` e `git diff --check` antes do push.
