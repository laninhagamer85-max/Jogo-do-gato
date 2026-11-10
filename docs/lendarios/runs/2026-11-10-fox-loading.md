# 10/11/2026 — Raposa do Bosque no carregamento

Produto alvo **1.0.58**. Base pública1.0.57/Sites59, projeto `appgprj_6ae2a66e7f4c8191860c2d39db928ac7`, fonte `947d48b757ebcc9028221b80cee70837efa0b313`, publicação `appgdep_6af2b9733df881918d1d76cbe28398ab` conferida como concluída. Destino exclusivo https://lendarios-do-rei.aquimeusite.chatgpt.site. Preservado o piloto de sombras da Vila1/sala15. Meu Pet Virtual não foi editado.

## Entrega

Uma cena original em dois enquadramentos: Raposa do Bosque do capítulo4 adormecida na grama. Referências próprias: tela do javali para acabamento e `hostiles-v1.png` para pelagem, orelhas e cauda. Geração com imagegen integrado, sem arte externa; composição ampla e composição vertical separadas, sem texto, relógio, logotipo ou progresso pintados. Prompt: raposa ruiva sozinha, enrolada de olhos fechados num prado tranquilo, peito/face e ponta da cauda claros, patas escuras, flores discretas, luz suave; manter toda a silhueta no centro e o quarto inferior livre para a interface.

- `client/public/lendarios/loading/fox-landscape-v1.webp`: 1439×810, 79.270bytes.
- `client/public/lendarios/loading/fox-portrait-v1.webp`: 810×1439, 75.364bytes.
- Total154.634bytes (151KiB). Redimensionamento proporcional e compressão WebP, sem alterar outras cenas. Catálogo agora com sete cenas. Barra, logotipo e progresso continuam sendo componentes da aplicação.
- A preparação inicial e a próxima cena são serializadas. Antes, a entrada numa sala durante a decodificação inicial podia iniciar outro grupo ao mesmo tempo. A seleção continua vinculada ao destino e só troca por uma cena já decodificada; prepara apenas a próxima, deduplica a imagem usada nas duas orientações e conserva a atual em erro. Se a arte inicial falhar durante a entrada, a próxima pode ser preparada sem bloquear o jogo. Preservados 1.000ms mínimos após o paint e a pausa da simulação enquanto os recursos não estão prontos.

## Pesquisa primária — 10/11/2026

- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — só disponibilizar uma cena depois da decodificação.
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture — enquadramento escolhido por orientação.
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit — cobertura proporcional sem esticar o personagem.

## Validação

-25/25 testes focados em cinco arquivos: catálogo, preparação, falhas, pausa/revelação, recursos e desempenho. Dois testes novos cobrem entrada antecipada, preparação serial e recuperação de falha inicial.
- TypeScript do jogo e do host aprovados. Build oficial Worker/D1 aprovado,453arquivos conferidos entre a saída do jogo e os assets do host. Lockfiles, ambiente, dados e migrações preservados.
- Chrome na prévia oficial, componente real numa página isolada, sem login. Verificadas dimensões375×667,375×812,390×844,844×390e1366×768. Barra inteiramente dentro da área útil. Arte observada em retrato390×844 e paisagem844×390, raposa inteira e texto sobre a faixa inferior. A primeira tentativa do seletor de teste escolheu o javali: a escolha aleatória já havia sido capturada pelo módulo. A inicialização determinística foi corrigida apenas na página de QA.
- Quatro decodificações no início: duas da cena inicial e duas da raposa. Após seleção da raposa, duas falhas reais de imagem foram induzidas com URL inexistente. Arte mantida, progresso30→40%, sem quadro verde observado na falha. Recuperar a rede não troca o destino em andamento; o próximo destino exibiu o javali preparado. Rotação usou as duas URLs corretas. Reutilização observada com transferência de300bytes no recurso já baixado, compatível com revalidação local. Não medir latência de rede do público com a prévia.
- Orçamento de memória: par da raposa ≈8,9MiB em RGBA; com o par inicial ≈20,9MiB teóricos para as duas cenas retidas pelo gerenciador. Não é medição de heap, GPU ou memória total do navegador. Sem aparelho físico, benchmark de FPS ou teste de cada frame de rotação. Página de QA removida antes do empacotamento.
- Nenhuma partida, fase, morte ou save real foi alterado. Esta validação é da tela de carregamento, não playtest de campanha. Nenhum avanço de sala/tempo de percurso aferido.

Rollback: 1.0.57 / Sites59, versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_1b6eddef5c388191afce12f493e55942`. Não reverter se houver publicação posterior. Código candidato aprovado para salvar/publicar pelo fluxo oficial; resultado final deve ser registrado no ramo de colaboração. Próximo passo: validar no celular real em transições repetidas e variar o próximo personagem sem aumentar o número de cenas retidas.

Fonte candidata enviada ao Sites: 23adc8ce8e34f200efd9cbb37fd08114ea868ec3. O status final de publicação fica no estado canônico.
