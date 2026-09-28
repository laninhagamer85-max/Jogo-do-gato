# Plano — Meu Pet Virtual: Uma Casa de Cada Vez

## Visão
Um jogo de navegador em português brasileiro sobre cuidar de um pet, fazer amigos e explorar uma primeira campanha narrativa de dez casas. React organiza a experiência; Babylon.js compõe cenários e pet; regras de jogo permanecem em TypeScript puro.

## Escopo implementado
- Onboarding de nome, idade e apresentação visual menino/boné ou menina/lacinho; tutorial de cinco passos que também pode ser reaberto.
- Necessidades e cuidados; inventário, moedas, loja, skins, boosts, missão por nível e progresso por XP.
- Dez capítulos com cenário próprio, história e liberação gradual de Mimi e Tico.
- Onze jogos completos, incluindo o match-3 de coleta, além de reflexo, memória, pesca, labirinto, sequência, organização, observação, timing e busca.
- Animação/reação do pet, vozes gravadas em PT-BR, opção de som/voz, pausa e painéis minimizáveis.
- Modo `?demo=1` em memória, sem sobrescrever o save do jogador.

## Riscos e tratamento
1. **Babylon + React:** inicialização única, render loop e listeners limpos no unmount; resize desktop/mobile e carregamento lazy.
2. **Progresso antigo:** nova campanha inicia no nível 1; migração/reinício arquiva cópias em vez de apagar saves.
3. **Tabuleiros:** lógica match-3 separada; cascata/gravity e objetivo por itens; partidas completadas concedem recompensa uma vez.
4. **Áudio do navegador:** clipes gerados são disparados por ação do jogador; fala dinâmica só usa voz identificada como português.
5. **Portabilidade:** o GitHub inclui assets compactados localmente; o WebDev aponta para storage gerenciado.

## Verificação
- `pnpm check` e `pnpm build` neste repositório e no projeto WebDev.
- Testar primeiro acesso, perfil menino/menina, passos/reabertura do tutorial, painel minimizável, voz, e modo demo sem persistência.
- Lançar cada um dos onze jogos; completar puzzles representativos e conferir feedback/recompensa.
- Capturar visualmente o onboarding, cenário desktop/mobile e tabuleiro; testar HTTP dos assets e preservar `legacy.html`.
