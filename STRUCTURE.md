# Estrutura do jogo

## Experiência e UI
- `src/main.tsx` — entrada React e CSS global.
- `src/pages/Home.tsx` — composição de cena/HUD, navegação, história, save, loja, casas, decorações, missão, onboarding, demo e state owner.
- `src/components/GameCanvas.tsx` — ciclo de vida React/Babylon, resize e limpeza da engine/cena; carregamento lazy.
- `src/components/OnboardingFlow.tsx` — três passos: gênero, escolha entre três gatos, idade/nome.
- `src/components/TutorialOverlay.tsx` — guia inicial e reabrível.
- `src/components/MiniGameBoard.tsx` — roteador dos desafios e dez jogos além do puzzle principal.
- `src/components/MatchThreeBoard.tsx` — tabuleiro 8×8, arrasto/tap, metas, cascatas, dificuldade e conclusão.
- `src/components/SceneDecoration.tsx` — colocação/movimento/rotação de móveis e presente surpresa temporário.
- `src/index.css` — design system, HUD, painéis minimizáveis, overlays, minijogos e breakpoints.

## Domínio, cena e mídia
- `src/game/PetGame.ts` — tipos/regras puras, save/migração, perfil, progresso, casas, inventário e presentes.
- `src/game/levels.ts` — dez capítulos e catálogo editorial das onze modalidades.
- `src/game/matchThree.ts` — geração do tabuleiro, swaps, matches, cascatas e gravidade.
- `src/game/scene.ts` — cena Babylon, movimento por clique, fundos, personagem, companheiros e reações.
- `src/game/audio.ts` — falas PT-BR por personagem, voice cues, efeitos e respeito à preferência sonora.
- `src/game/assets.ts` — imports locais de `src/assets/`; não depende de storage remoto.
- `public/manifest.webmanifest` e ícones `public/icon-*.png` — metadados instaláveis do PWA.

## Dados e privacidade local
- O app é client-only, sem backend ou conta.
- O save fica em `localStorage` neste navegador e permanece local.
- Uma nova aventura começa no nível 1; saves anteriores são arquivados antes de reiniciar ou migrar.
- `?demo=1` usa estado de teste em memória, incluindo decoração/presente demonstrativos, sem substituir o save real; `&play=colheita` abre diretamente o match-3.

## Documentação
- `README.md` — visão geral e instruções locais.
- `PLAN.md` — escopo, riscos e critérios de verificação.
- `ASSETS.md` — inventário e caminhos da mídia.
- `MEMORY.md` — decisões entre sessões e estado da branch/PR.
