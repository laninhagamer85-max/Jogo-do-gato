# Estrutura do jogo

## Experiência e UI
- `client/src/pages/Home.tsx` — composição de cenário/HUD, perfil carregado, navegação, save, história, missão, loja, configurações, modo demo e state owner da sessão.
- `client/src/components/GameCanvas.tsx` — ciclo de vida React/Babylon, resize e limpeza de engine/cena; carregamento lazy para não bloquear a interface.
- `client/src/components/OnboardingFlow.tsx` — cadastro do nome, idade e gênero/apresentação visual.
- `client/src/components/TutorialOverlay.tsx` — guia passo a passo inicial e reabrível.
- `client/src/components/MiniGameBoard.tsx` — roteador dos desafios e dez jogos além do puzzle principal.
- `client/src/components/MatchThreeBoard.tsx` — tabuleiro de combinar itens, metas, movimentos e estado de vitória.
- `client/src/index.css` — design system, HUD, tutoriais, modais, tabuleiros e breakpoints.

## Domínio e cena
- `client/src/game/PetGame.ts` — tipos e regras puras do pet, progressão, save/migração, cuidados, missão, itens, skins e companheiros.
- `client/src/game/decorations.ts` — 100 móveis, dez por casa, preços e requisitos de desbloqueio por nível/missão.
- `client/src/game/decorationCoordinates.ts` — conversão de coordenadas do fundo 16:9 para o viewport, para manter cada peça presa à mesma área do cenário.
- `client/src/game/levels.ts` — conteúdo editorial dos dez capítulos e catálogo das 11 modalidades.
- `client/src/game/matchThree.ts` — geração do tabuleiro, busca de combinações, swaps, cascatas, gravidade e pontuação do match-3.
- `client/src/game/scene.ts` — cena ortográfica, backgrounds por capítulo, sprite/personagem, acessórios, companion e reações.
- `client/src/game/audio.ts` — reprodução dos clipes PT-BR e fala personalizada respeitando o gesto de usuário.
- `client/src/game/assets.ts` / `client/src/game/decorationAssets.ts` — mapa único das mídias e URLs individuais dos 100 sprites hospedados no storage gerenciado.

## Dados e privacidade local
- O jogo é client-only; não usa backend ou conta.
- O save ativo é `meu-pet-virtual-save-v2` neste navegador.
- A nova história começa no nível 1. Saves legados permanecem nas chaves anteriores; um save v2 sem perfil e já avançado recebe uma cópia `meu-pet-virtual-save-v2-archive` antes da inicialização nova.
- Reiniciar arquiva a cópia ativa com chave timestamp. `?demo=1` usa estado de demonstração em memória e não sobrescreve o save.

## Documentação de execução
- `PLAN.md` — escopo, risco e critérios de validação.
- `ASSETS.md` — proveniência e inventário de mídia.
- `MEMORY.md` — decisões entre sessões e estado do repositório/PR.
- `docs/decoration-catalog.json` — IDs, nomes, preços, níveis, missões e caminhos de storage dos 100 itens.


## Servidor, privacidade e instalação
- `server/index.ts` — servidor estático Express 5.2.1; serve `dist/public` e encaminha rotas da SPA. Não expõe API de jogo nem autenticação.
- PWA usa `client/public/manifest.webmanifest` e ícones; não há registro de service worker/cache offline neste estado.
- O save fica apenas em `localStorage` no navegador; não é criptografado. Auditoria `pnpm audit` (produção e conjunto completo) zerada em 2026-09-28.


## Moldura e seleção visual (2026-09-29)
- `client/src/components/CreatorPlaquePicker.tsx` — hitbox acessível/resp. ancorado às coordenadas do fundo; mostra a legenda do nome e abre a homenagem.
- `client/src/game/scene.ts` — renderiza o retrato WebP como mesh por cima de todos os fundos, sincroniza posição/tamanho no resize e anima troca de personagem/skin sem interferir no level-up.
- `client/src/pages/Home.tsx` — modal com foto e biografia; prévia de personagem, origem de prêmio por casa e tempo de leitura do presente.
- A foto está em storage gerenciado; borda e legenda são interface, mantendo o arquivo de retrato sem texto rasterizado.


## Campanha lateral e modos (2026-09-29)
- `client/src/components/PlatformAdventure.tsx` — mapa 10×10, mundos/fases, tutorial, HUD, botões de toque, vitória/retry, cadeados e retorno à casa.
- `client/src/components/PlatformAdventure.css` — tema arcade responsivo para desktop e celular.
- `client/src/game/PlatformerEngine.ts` — simulação Canvas 2D sem acoplamento React: delta-time, input, física, colisões, moedas, inimigos, checkpoints, vidas e goal.
- `client/src/game/platformerLevels.ts` — 100 layouts determinísticos, paletas por casa, narrativa, dificuldade e recompensas 1:1 com o catálogo.
- `client/src/game/PetGame.ts` — save/migração aditiva de `platformProgress`, unlock sequencial e prêmio idempotente.
- `client/src/pages/Home.tsx` — aventura como entrada após onboarding; Minha Casa continua secundária e preserva os sistemas de cuidados e minijogos.
- `client/src/game/assets.ts` — plataformas/portal WebP via storage gerenciado; as demais fontes seguem no storage da aplicação.
- `/?demo=platformer` abre mapa/fase de demonstração sem persistir; `/?demo=1` mantém a demo da casa.