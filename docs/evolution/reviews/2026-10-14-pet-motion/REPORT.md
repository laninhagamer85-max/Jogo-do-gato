# Atualização do Meu Pet Virtual — movimento e Exploração do Bosque

**Estado:** protótipo funcional em revisão — **não publicado e ainda não aprovado para release**
**Ramo:** `feat/pet-motion-20261014`, derivado do PR #5
**Revisão:** [PR #6 (draft)](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/6)
**Commit de runtime testado:** `0338794415abfecdb2d65177a12ec65e18046e7e`
**Ambiente:** fixture local `qa-review.html`, Browser Sandbox, perfil/partida sintéticos e em memória. Sem login, backend de contas, saves reais ou alteração da versão pública.

## O que entrou

- A Aventura lateral existente ganhou estados visuais de repouso, corrida, subida, queda e aterrissagem. A apresentação alterna o retrato sentado e a pose corrida já disponível e aplica respiração, oscilação, inclinação e compressão/alongamento visual. Nenhuma dessas transformações muda hitbox, física, colisão ou recompensa.
- Foi adicionada a modalidade solo **Exploração**, com câmera vista de cima: empurrar o tronco até a placa, abrir o portão, pegar a chave e alcançar a saída. Há teclado (setas/WASD), botões de toque, pausa/retomada, dica, reinício e tela de conclusão. O estado existe somente na sessão; não cria progresso, prêmio ou save.
- A Aventura e os níveis existentes continuam acessíveis pelo seletor.

A crônica indicada foi usada somente como referência geral para exploração top-down e resolução ambiental de puzzles. Não foram reutilizados nomes, personagens, mapas, textos ou arte do jogo citado.

## Testes executados

### Automatizados

- `pnpm check` — passou.
- `pnpm exec vitest run --exclude '**/*.integration.test.ts'` — **10 arquivos e 60 testes passaram**. Inclui seis testes novos do puzzle e as regressões existentes/de animação do motor lateral. Testes que dependem de integrações reais foram deliberadamente excluídos.
- `scripts/verify-adventure-entry.ts` — passou (101 estados de progresso, limites de fase, rótulos e imutabilidade de save sintético).
- `scripts/verify-pilot-terrain.ts` — passou (geometria, câmera, mosaicos e comandos de desenho).
- `pnpm build` — passou. O Vite ainda reporta o chunk existente `GameCanvas` acima de 500 KB; também há aviso de configuração antiga `pnpm` ignorada pelo pnpm instalado.
- `git diff --check` — passou.

### Navegador / partida de teste

| Viewport da fixture | Resultado observado |
|---|---|
| 375×667 | Sem overflow horizontal; controles dentro da área visível. A área experimental tem rolagem vertical curta para conteúdo complementar. |
| 375×812 | Sem overflow horizontal ou rolagem vertical necessária para o tabuleiro e controles. |
| 390×844 | Layout do tabuleiro e controles sem overflow horizontal. |
| 844×390 | Regra compacta de paisagem; tabuleiro e controles cabem, rolagem residual medida de 2 px. |
| 1366×768 | Layout de desktop sem overflow horizontal; nota complementar abaixo da dobra (rolagem de 85 px). |

- **Automação de navegador, não partida humana:** 21 movimentos discretos por setas resolveram a única sala de puzzle pelo percurso normal; a placa/portão, chave, saída e diálogo de conclusão apareceram na sequência esperada. Não houve teleporte nem chamada direta de vitória.
- Um toque no controle móvel deslocou o pet; os botões de pausar, retomar e reiniciar foram exercitados.
- Na Aventura, entradas temporizadas de teclado movimentaram o personagem e provocaram um salto pela física real; os frames do Canvas foram exportados durante corrida e salto.
- Nenhum erro de runtime apareceu no console durante essas interações. Não foi feita validação manual com dispositivo físico.
- Este trabalho testa uma sala do modo novo e os contratos existentes do motor; **não declara as 100 fases testadas**.

## Evidências

- [Frame do Canvas — corrida](evidence/platform-run-canvas.png)
- [Frame do Canvas — salto](evidence/platform-jump-canvas.png)
- [Tabuleiro do puzzle — início](evidence/forest-puzzle-canvas.png)

Os três PNGs são capturas do Canvas local, sem controles do navegador nem dados de conta.

## Pendências antes de considerar release

1. **Ciclo de corrida:** a atualização elimina a aparência completamente imóvel por troca de pose e movimento visual, mas usa uma única imagem de corrida por pet, não um atlas de passos quadro a quadro. Para a naturalidade final solicitada, produzir e revisar frames próprios para cada pet (ou uma animação articulada equivalente) e fazer nova revisão visual.
2. **Arte enviada:** a folha de ilhas é uma composição de cenas, não uma spritesheet pronta de caminhada. Não foi importada como textura runtime nem cortada às pressas; requer separação/limpeza e conferência de transparência. A imagem de gameplay com marca d'água permanece apenas referência e não foi incorporada.
3. Fazer playtest manual em celular físico, especialmente repetição/ritmo do D-pad, áreas de toque e leitura do diálogo em orientação horizontal.
4. A primeira sala é um protótipo fechado. Conteúdo/campanha adicional, progressão, recompensas e persistência permanecem fora de escopo.

**Produção:** nenhuma publicação, sincronização com o Site existente, migração ou mudança de versão. A versão pública permanece a v10. PR #4 e PR #5 foram preservados.
