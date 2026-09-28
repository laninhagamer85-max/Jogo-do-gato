# Meu Pet Virtual — Uma Casa de Cada Vez

Uma aventura de bichinhos para navegador, em português do Brasil, baseada no projeto existente e na direção visual enviada. O gatinho ganha nome e personalidade; a cada nível a história avança para uma casa nova, encontra amigos e libera brincadeiras.

## Comece a jogar

O primeiro acesso inicia uma campanha nova no **nível 1**. Dê nome ao pet, informe a idade e escolha menino (boné) ou menina (lacinho); em seguida, o guia interativo explica cuidados, campanha, loja e jogos. O perfil e o progresso ficam somente no `localStorage` deste navegador.

## O que está incluído

- **10 capítulos/casas**, com histórias, cenários originais e progressão por XP.
- **11 minijogos jogáveis**: Colheita de Petiscos (match-3), Patas Velozes, Memória Felina, Bolhas de Peixe, Pescaria do Pudim, Labirinto do Novelo, Eco de Miados, Arruma a Caminha, Esconde-esconde, Salto de Patinhas e Caça aos Brinquedos.
- Cuidados de felicidade, fome, higiene e energia; alimentação, banho, carinho, sono e mochila de itens.
- Missões de três partidas, moedas, loja de itens/skins/boosts e companheiros Mimi e Tico.
- Animação do pet e interações, sons opcionais, falas geradas em PT-BR, pausa e painéis que podem ser minimizados.
- Layout adaptável para desktop e celular; controles por toque e, no labirinto, setas ou WASD.
- Modo visual de demonstração que não sobrescreve o save: `/?demo=1`. Para abrir um jogo específico, por exemplo: `/?demo=1&play=colheita`.

A implementação HTML vanilla anterior foi preservada em [`legacy.html`](./legacy.html). O ambiente de trabalho WebDev usa mídia hospedada; este repositório importa os mesmos assets localmente e pode ser executado sem depender do storage do WebDev.

## Executar localmente

Requer Node.js 22+ e pnpm. Na raiz do repositório:

```bash
pnpm install
pnpm dev
```

A URL local será exibida pelo Vite. Verifique os tipos e o build de produção com:

```bash
pnpm check
pnpm build
```

A saída estática fica em `dist/`. Para limpar uma campanha de teste, use as configurações do jogo; o código também preserva cópias de saves anteriores antes de reiniciar ou migrar.

## Tecnologia e mídia

React 19, TypeScript, Vite, Babylon.js e Lucide. Cenários, sprites, acessórios e clipes de áudio ficam em `src/assets/` e são incorporados ao build pelo Vite. Consulte [`ASSETS.md`](./ASSETS.md), [`PLAN.md`](./PLAN.md) e [`STRUCTURE.md`](./STRUCTURE.md).
