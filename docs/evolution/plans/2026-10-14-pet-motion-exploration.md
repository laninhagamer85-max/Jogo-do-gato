# Atualização: movimento do pet e Exploração do Bosque

**Escopo confirmado:** melhorar movimento do pet na Aventura e acrescentar uma modalidade separada de exploração/puzzles vista de cima. PR #5 permanece preservado; trabalho em branch próprio derivada dele. Nada vai ao Site público nesta etapa.

## Direção de produto

Aventura existente de plataforma lateral continua como está. Nova entrada **Exploração** oferece uma partida solo curta, em câmera superior, com um pet do perfil: caminhar, empurrar um tronco para uma placa, abrir uma passagem, pegar a chave e chegar à saída. A primeira entrega é um protótipo jogável de uma sala, com instruções, pausa/retomada, reinício e conclusão. Sem segundo jogador, login, save, recompensa, economia ou progresso compartilhado nesta primeira versão. O resultado fica apenas no estado da sessão.

A referência editorial é [Uma história de aprendizado com a Turma do Pateta, Jogo Véio](https://jogoveio.com.br/cronica-turma-do-pateta/). O texto descreve um jogo SNES cooperativo de visão superior, resolução de puzzles por ações/posicionamento e cooperação para avançar. Aplicaremos somente a ideia geral de exploração ambiental e puzzles; cenário, personagem, nome, textos, layouts e arte serão próprios do Meu Pet Virtual. O novo modo será solo e sem cópia de Goof Troop.

## Direção visual e assets

Usar o estilo acolhedor e legível do Meu Pet Virtual: azul-marinho nas molduras, verde-musgo e verde-lima no bosque, amarelo suave para objetivo, placas com cantos arredondados, ilustração simpática, contraste alto e controles grandes. Animação sem flashes, sem tremor e respeitando movimento reduzido.

A maquete geral enviada inspira a hierarquia do HUD; a tela de seleção inspira cartões ilustrados de mundo/pet. A cena de floresta com marca d'água é somente referência e não será incorporada ao jogo. A folha transparente das ilhas é arte lateral, adequada ao modo plataforma já existente, não ao mapa visto de cima; ela não será fatiada como atlas top-down. O PNG tem canal alpha, mas foram observados segmentos coloridos soltos na imagem; sua adequação para runtime precisará de limpeza e revisão em tarefa visual separada. Na primeira sala de Exploração, reutilizar o pet do perfil já incluído no projeto e formas/ícones próprios no Canvas, mantendo os assets existentes.

## Implementação no projeto

- `PlatformerEngine` mantém movimento/colisões/recompensas. Nova camada visual decide entre repouso, corrida, subida, queda e aterrissagem; usa o retrato sentado e a pose corrida existentes, com respiração, passo, inclinação, compressão e alongamento. Nenhum transform visual altera hitbox, física ou saldo.
- Novo componente React `ForestPuzzleAdventure` recebe o perfil atual e oferece volta à Aventura/casa. Novo módulo lógico puro `forestPuzzle` controla o estado da sala e valida empurrões, placa, portão, chave e saída. Renderização independente em Canvas, com teclado e botões de toque.
- `PlatformAdventure` apenas expõe a nova opção no seletor; não substitui os 100 níveis nem modifica suas regras.
- Suíte unitária cobre transições de animação e regras/puzzles. TypeScript, 60 testes offline, invariantes de entrada/terreno e build foram executados; a tela foi exercitada no Browser Sandbox com teclado e toque sintético.

## Estado em 2026-10-14

- Protótipo de uma sala jogável em memória integrado ao seletor; rota de teclado resolveu portão, chave e saída; toque, pausa e retomada foram exercitados.
- A Aventura lateral e a física permanecem como estavam; a animação apenas troca a pose idle/run e aplica movimento visual dependente de velocidade/queda/aterrissagem.
- Pendente para uma etapa visual antes de release: fatiar/limpar a folha de ilhas fornecida e criar/revisar frames próprios de corrida por pet. A folha fornecida é uma composição, não uma spritesheet pronta de movimento.
- Não publicado, sem logins ou saves reais. Ver `../reviews/2026-10-14-pet-motion/REPORT.md` para resultados e evidências.

## Fora de escopo agora

Produção, hospedagem, integração em Site, saves/recompensas persistentes, campanha de múltiplas salas, cooperação online, compra/moedas, spritesheet novo, reautoria de arte, redesign completo das 100 fases ou afirmar testes de todas as fases.
