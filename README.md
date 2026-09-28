# Meu Pet Virtual — Uma Casa de Cada Vez

Uma aventura felina de navegador, em português do Brasil, baseada na arte de referência do projeto. Escolha um gatinho, cuide dele, faça amigos, combine petiscos e explore uma campanha de dez casas com histórias e ambientes próprios.

## Comece a jogar

O primeiro acesso guia o jogador por três passos: escolha menino ou menina, selecione um entre três personagens daquele grupo e informe nome e idade. O tutorial interativo explica cuidados, cenário, missões, casas, decoração, presentes, loja e minijogos. A aventura começa no nível 1; o perfil e progresso ficam no `localStorage` deste navegador.

## O que está incluído

- **10 níveis/casas** com cenários ilustrados, capítulos de história, XP e desbloqueios graduais. Casas conquistadas podem ser visitadas e mantêm sua própria decoração.
- **11 minijogos jogáveis**: Colheita de Petiscos (match-3), Patas Velozes, Memória Felina, Bolhas de Peixe, Pescaria do Pudim, Labirinto do Novelo, Eco de Miados, Arruma a Caminha, Esconde-esconde, Salto de Patinhas e Caça aos Brinquedos.
- **Match-3 de destaque** com tabuleiro 8×8, arrastar/soltar ou selecionar com dois toques, objetivos de coleta, jogadas limitadas, cascatas, efeitos animados e som de combinação. A dificuldade aumenta com o nível.
- **Seis gatos selecionáveis** (três meninas e três meninos), acessórios temáticos, personagens companheiros e falas curtas engraçadas ativadas por toque.
- **Interação e animação**: o pet caminha até o ponto tocado, reage a carinho e cuidados, pisca e se movimenta; falas em português e vozes de subida de nível variam conforme o perfil.
- **Decoração por casa**: compre itens, entre em modo decorar, mova e gire objetos na cena ou devolva-os à mochila.
- **Presentes surpresa temporizados** aparecem no cenário, podem dar moedas ou itens e desaparecem se não forem coletados a tempo.
- Cuidados de felicidade, fome, higiene e energia; alimentação, banho, carinho, sono, mochila, missões, moedas, loja de itens/skins/boosts e configurações.
- Painéis laterais minimizáveis, salvamento local, opção de sons, layout responsivo e controles de teclado/toque. No labirinto, use setas ou WASD.
- Modo de demonstração isolado que **não sobrescreve o save**: `/?demo=1`. Para iniciar um jogo específico, use `/?demo=1&play=colheita`.
- Manifesto PWA e ícones próprios para instalação em dispositivos compatíveis.

A versão HTML vanilla anterior foi preservada em [`legacy.html`](./legacy.html). Este repositório inclui imagens e áudio localmente; não depende do storage do WebDev.

## Executar localmente

Requer Node.js 22+ e pnpm. Na raiz do repositório:

```bash
pnpm install
pnpm dev
```

O Vite exibirá a URL local. Verifique tipos e build de produção com:

```bash
pnpm check
pnpm build
```

A saída estática fica em `dist/`. O código preserva cópias de saves anteriores ao reiniciar ou migrar o progresso.

## Tecnologia e mídia

React 19, TypeScript, Vite, Babylon.js, Tailwind e Lucide. Cenários, sprites, acessórios, decoração e clipes PT-BR ficam em `src/assets/` e são incorporados ao build. Consulte [`ASSETS.md`](./ASSETS.md), [`PLAN.md`](./PLAN.md) e [`STRUCTURE.md`](./STRUCTURE.md).
