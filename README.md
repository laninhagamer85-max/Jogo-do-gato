# Meu Pet Virtual — Uma Casa de Cada Vez

Uma aventura felina de navegador, em português do Brasil, baseada na arte de referência do projeto. A campanha principal é um platformer lateral 2D com 100 fases em dez mundos; cuidados, minijogos, loja e decoração continuam como modo secundário para evoluir o pet e ganhar XP/moedas.

## Comece a jogar

O primeiro acesso guia o jogador por três passos: escolha menino ou menina, selecione um entre três personagens daquele grupo e informe nome e idade. Depois, a aventura começa no mapa de fases. O tutorial explica controles, objetivos e recompensas; o botão **Minha Casa** mantém os cuidados, minijogos e loja acessíveis. Perfil e progresso ficam no `localStorage` deste navegador.

## O que está incluído

- **Aventura principal:** 100 fases de plataforma lateral 2D, distribuídas por dez mundos temáticos e dez etapas por mundo, com história, dificuldade crescente, vidas, moedas, inimigos, obstáculos, checkpoints e portal de chegada. Teclado e controles touch são aceitos.
- **100 decorações como recompensas:** cada etapa desbloqueia uma peça única da casa temática; itens ainda não ganhos aparecem com cadeado. A progressão é salva, fases futuras ficam bloqueadas e revisitas não concedem o mesmo prêmio novamente.
- **Modo Minha Casa:** dez cenários ilustrados e revisáveis, cuidados, loja, missões, decoração móvel e presentes temporizados continuam apoiando a evolução do pet.
- **11 minijogos jogáveis**: Colheita de Petiscos (match-3), Patas Velozes, Memória Felina, Bolhas de Peixe, Pescaria do Pudim, Labirinto do Novelo, Eco de Miados, Arruma a Caminha, Esconde-esconde, Salto de Patinhas e Caça aos Brinquedos. Os minijogos ajudam a ganhar XP e moedas.
- **Match-3 de destaque** com tabuleiro 8×8, arrastar/soltar ou selecionar com dois toques, objetivos de coleta, jogadas limitadas, cascatas, efeitos animados e som de combinação. A dificuldade aumenta com o nível.
- **Seis gatos selecionáveis** (três meninas e três meninos), acessórios temáticos, personagens companheiros e falas curtas engraçadas ativadas por toque.
- **Interação e animação**: o pet caminha até o ponto tocado, reage a carinho e cuidados, pisca e se movimenta; falas em português e vozes de subida de nível variam conforme o perfil.
- **Decoração por casa**: compre itens, entre em modo decorar, mova e gire objetos na cena ou devolva-os à mochila.
- **Presentes surpresa temporizados** aparecem no cenário, podem dar moedas ou itens e desaparecem se não forem coletados a tempo.
- Cuidados de felicidade, fome, higiene e energia; alimentação, banho, carinho, sono, mochila, missões, moedas, loja de itens/skins/boosts e configurações.
- Painéis laterais minimizáveis, salvamento local, opção de sons, layout responsivo e controles de teclado/toque. No labirinto, use setas ou WASD.
- Modos de demonstração isolados que **não sobrescrevem o save**: `/?demo=1` para Minha Casa e `/?demo=platformer` para a aventura. Para abrir um minijogo específico, use `/?demo=1&play=colheita`.
- Manifesto PWA e ícones próprios para instalação em dispositivos compatíveis; esta versão ainda não tem service worker/cache offline, portanto a instalação não garante funcionamento sem rede.

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
