# 11/11/2026 — Lagarto Espinhoso no carregamento

**Validado em prévia e aguardando integração; não publicado.** A versão pública confirmada do [Lendários do Rei](https://lendarios-do-rei.aquimeusite.chatgpt.site) é **1.0.66**, Sites68, fonte `1375ccb983596d55df1ef4701f7c8e3a0fa5e694`. Publicação `appgdep_6af3da3daac48191a752a35316a01d39`, versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_367202c6759881918ac30eca55f0df3d`, status concluído.

## Mudança

O catálogo ganha uma oitava cena: o Lagarto Espinhoso repousa sozinho na grama, numa clareira com samambaias. Arte original gerada com ImageGen, usando a terceira linha de `client/public/forest-adventure/chapter4/hostiles-v1.png` para a identidade e a cena da raposa apenas para o acabamento. Direção do prompt: lagarto quadrúpede turquesa com espinhos verdes em forma de folhas, garganta clara e cauda curva; luz difusa, pedras suaves ao fundo, personagem inteiro centralizado e quarto inferior livre; sem texto, logotipo, relógio, barra, moldura ou outro personagem. Duas composições, 16:9 e 9:16.

- `client/public/lendarios/loading/thorn-lizard-landscape-v1.webp`: 1439×810, 105.826 bytes.
- `client/public/lendarios/loading/thorn-lizard-portrait-v1.webp`: 810×1439, 85.398 bytes.
- Total 191.224 bytes, cerca de 187 KiB. Conversão proporcional para WebP sem alterar as artes existentes.

Integrada somente a entrada em `client/src/lib/loadingScenes.ts`. O gerenciador existente continua preparando a próxima cena durante a jornada, decodificando as duas variantes antes de selecioná-las e retendo os grupos atual e seguinte. Mantidos o progresso do jogo, a pausa da simulação durante o carregamento e o mínimo de 1.000ms após a pintura. Sem alterações em portal, física, capítulos, acesso, saves, banco ou no Meu Pet Virtual.

## Pesquisa — 11/11/2026

- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — manter a troca depois da decodificação.
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture — seleção do enquadramento adequado à orientação.

## Validação

- 25/25 testes focados em cinco arquivos, cobrindo catálogo, preparação, falhas, recursos e revelação. TypeScript do jogo e do host passou. Build oficial Worker aprovado; 459 arquivos verificados entre a saída do jogo e os assets do host.
- Chrome na prévia oficial, componente real em página de teste isolada e sem login. Barra inteira em 375×667, 375×812, 390×844, 844×390 e 1366×768. Inspeção visual do personagem inteiro em 390×844 e 844×390.
- Quatro decodificações iniciais observadas (par de abertura e par do lagarto). Duas tentativas induzidas de preparar a raposa com URL inválida produziram quatro erros de imagem. O lagarto continuou visível; o progresso de teste foi de 30% para 40%. Ao restaurar a URL, o destino atual manteve a cena, e a raposa só apareceu na próxima troca, depois da decodificação.
- A rotação usou os dois WebP já preparados, com uma entrada de transferência observada por variante: 85.698 e 106.126 bytes incluindo overhead, sem uma nova transferência completa na volta ao retrato. Medição apenas da prévia local, sem extrapolar para rede móvel.
- O par novo ocupa cerca de 8,9 MiB de pixels RGBA; junto ao par de abertura, cerca de 20,9 MiB teóricos. Mesmo limite de dimensões do par da raposa. Não houve medição de heap/GPU, benchmark de FPS ou teste em aparelho físico.
- Prévia encerrada e página de QA removida. Nenhuma fase jogada, desbloqueada ou concluída; mortes, tentativas e duração de fase não se aplicam. Sem uso de saves reais.

## Publicação e próxima ação

O HEAD do repositório do Site aberto pelo helper era `7fa25a9ee94f68b6ddc6aa0d1d41a62e81d38c71`, descendente da fonte pública e com 23 arquivos de uma revisão da sala 41, incluindo cenário, combate e progressão. O ciclo usou uma worktree separada no commit publicado e não alterou esse HEAD. A revisão Sites68 ainda era a última salva após os testes. Não foi salva nem publicada uma nova versão do Site, nem reservado um número de produto: publicar o HEAD atual incluiria trabalho concorrente que não foi validado neste ciclo.

Patch e WebP na revisão `review/lendarios-thorn-lizard-loading-20261111`. Próximo: quando a sala 41 tiver sua própria publicação confirmada, aplicar apenas a entrada e os dois WebP à fonte pública mais recente, conferir a alternância novamente e publicar pelo fluxo oficial. Referência de retorno deste trabalho: Sites68, já no ar; nenhuma reversão foi acionada.
