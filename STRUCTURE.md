# Estrutura

- `src/main.tsx` — entrada React da aplicação Vite independente.
- `src/pages/Home.tsx` — composição de HUD e cenário, estado da sessão, save local, histórias, missões, loja, configurações e modo demo.
- `src/components/GameCanvas.tsx` — integração React/Babylon com lifecycle e resize.
- `src/components/OnboardingFlow.tsx` — perfil inicial; `TutorialOverlay.tsx` — guia passo a passo e reabrível.
- `src/components/MiniGameBoard.tsx` — dez minijogos; `MatchThreeBoard.tsx` — puzzle match-3.
- `src/game/PetGame.ts` — estado, migração, necessidades, XP, missões, cuidados e loja.
- `src/game/levels.ts` — capítulos e catálogo dos onze jogos.
- `src/game/matchThree.ts` — criação do tabuleiro, movimentos, matches, cascatas e gravidade.
- `src/game/scene.ts` — ambientes por nível, pet, boné/lacinho, companheiros e animações.
- `src/game/audio.ts` — clipes e síntese de voz em português quando disponível.
- `src/game/assets.ts` + `src/assets/` — mapa de mídia e assets locais.
- `src/index.css` — tokens, HUD, modais, tabuleiros e breakpoints.

## Dados e privacidade
O jogo não requer backend ou conta. O save ativo usa `meu-pet-virtual-save-v2` no `localStorage`; as chaves legadas são preservadas. Uma campanha sem perfil começa no nível 1, e cópias são arquivadas antes de reinício. `?demo=1` mantém o estado fictício somente em memória.

## Contexto operacional
`PLAN.md` contém escopo e critérios de QA; `ASSETS.md` registra a arte; `MEMORY.md` preserva decisões entre sessões. O `legacy.html` anterior continua disponível na raiz.
