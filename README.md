# Meu Pet Virtual — Pudim

Uma versão responsiva e jogável de **Meu Pet Virtual**, criada a partir da referência visual enviada. A cena usa Babylon.js para compor um quarto ensolarado e um gatinho original; a interface traz necessidades, progressão, missão, loja e controles em português do Brasil.

## O que dá para jogar

- Alimente, dê banho, faça carinho e coloque o Pudim para dormir; acompanhe felicidade, fome, higiene e energia.
- Ganhe XP e moedas em minijogos de toques, memória e bolhas; complete uma missão de três brincadeiras para receber a recompensa.
- Desbloqueie e equipe skins ou compre boosts para as necessidades do pet.
- Pause, ligue/desligue efeitos sonoros e salve o progresso localmente no navegador.
- Use a interface no desktop ou no celular; o sprite, a cena e os painéis se reorganizam para telas verticais.

A implementação vanilla anterior foi mantida como [`legacy.html`](./legacy.html), com a arte de ambiente correspondente em [`file_000000001784820eb6982e449ac9f0ad.jpg`](./file_000000001784820eb6982e449ac9f0ad.jpg).

## Executar localmente

Requer Node.js 22+ e pnpm. Na raiz do repositório:

```bash
pnpm install
pnpm dev
```

Abra a URL local informada pelo Vite. Valide a checagem de tipos e o build de produção com:

```bash
pnpm check
pnpm build
```

O build estático sai em `dist/`. Os dados do pet ficam no `localStorage` deste navegador; limpar os dados do site reinicia a demonstração.

## Tecnologia e assets

React 19 + TypeScript + Vite, Babylon.js e Lucide. Os dois assets originais em WebP ficam em `src/assets/` e são importados no build — não dependem de storage externo. Consulte [`ASSETS.md`](./ASSETS.md) para a direção visual e dimensões.
