# 19/11/2026 — Mestre das Marés no carregamento

Base confirmada: Lendários do Rei 1.0.85, Sites 87, fonte `3f5584ebe19360c581b2eeff11075fca8ba6530f`. HEAD do Site coincidia com essa publicação. Nada do Meu Pet Virtual foi modificado. Campanha, mestre, capturas, bestiários, conta e saves foram preservados.

## Entrega

Nova cena original do Mestre das Marés, sozinho e tranquilo sobre a grama junto ao litoral. A identidade vem de `client/public/forest-adventure/chapter2/master-crab-motion-v1.webp`: caranguejo azul/índigo, ventre creme, espiral turquesa, olhos em hastes e pinça maior. O acabamento usa a tela publicada da Raposa do Bosque como referência. Duas composições geradas separadamente pelo ImageGen integrado, sem extrair sprites, sem texto, relógio, logo, barra ou interface pintada.

Prompts de produção: ilustração familiar de RPG pintada; manter todas as patas e pinças visíveis, personagem centralizado, iluminação suave e espaço inferior de grama para o progresso real. Horizontal 16:9 com margem superior para o logotipo; vertical 9:16 recomposta, não recortada nem esticada, com o caranguejo na faixa central e espaço acima e abaixo. A vertical usa a nova horizontal como referência de identidade.

- `client/public/lendarios/loading/tide-master-landscape-v1.webp`: 1440×810, 163.284 bytes.
- `client/public/lendarios/loading/tide-master-portrait-v1.webp`: 810×1440, 155.502 bytes.
- Total 318.786 bytes (aprox.311 KiB). Apenas redimensionamento proporcional e compressão WebP de qualidade 87, sem alterar a composição. Arquivos originais não substituem artes anteriores.
- Entrada adicionada em loadingScenes.ts; o gerenciador não mudou. Mantém a fila única, atual+seguinte, download/decodificação das duas variantes, imagem anterior em falha, pausa da simulação e mínimo 1.000 ms.
- Integra à suíte o teste de ciclo de vida preparado em 18/11, com expectativa ajustada à nova última cena. A notícia da1.0.86 aparece no quadro público e home.

## Pesquisa — 19/11/2026

- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — selecionar somente imagens já decodificadas; conservar a arte visível em falhas.
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture — variantes apropriadas à orientação sem distorcer o personagem.

## Verificação

- 30/30 testes focados em 6 arquivos, incluindo 300 transições simuladas entre biomas e erros parciais. Não é playtest.
- TypeScript do jogo e do host aprovado. Build oficial Worker aprovado; 558 arquivos preservados verificados byte a byte. Sem mudança de dependências/lockfiles.
- Chrome na prévia oficial, componente GameLoadingScreen real em página isolada sem login: 375×667, 375×812, 390×844, 844×390 e 1366×768. Barra inteira nos cinco tamanhos. Inspeção visual em 390×844 e 844×390:caranguejo e ambas as pinças inteiros;sem esticar.
- Forçadas duas tentativas de preparar a próxima cena com URLs inválidas: 4 erros de imagem, nenhuma troca para fundo vazio;Mestre visível e progresso de teste 30→40%. Restaurada a rede de teste, o lagarto foi selecionado somente no destino seguinte com preparação concluída. Entrar no inverno manteve o lagarto até a troca seguinte para a cena decodificada do Mestre Lobo. Saída do inverno manteve a arte atual enquanto preparava a geral.
- Rotação reutilizou cada variante já baixada (uma entrada de recurso por URL);quatro decodificações iniciais, do par de abertura e novo par. O gerenciador mantém apenas os grupos atual e seguinte. Estimativa RGBA do novo par 8,9 MiB, da mesma ordem do lagarto anterior. Sem medição de memória do processo/GPU, FPS ou aparelho físico;sem alegação de melhoria de fluidez.
- Nenhuma partida em fase ou save real usado. A auditoria das fases não avançou neste ciclo. Páginas/JS/CSS de QA removidos antes do pacote.

## Publicação e retomada

**Publicada a 1.0.86 em 19/11/2026**, Sites 88, fonte `e96d3e6c67db9f4b2a28d8c740674b0d07e035de`, versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_94e100f56d0081918eef32bcf0355ae1`, publicação `appgdep_6afedaedc3588191baf6a412f8a50171`, status `succeeded`. Público, domínio e configurações de acesso preservados.

Na verificação posterior, a página pública de novidades inicialmente permaneceu no carregamento. Após um único reload exibiu a notícia nova e Ver.1.0.86. O arquivo horizontal público abriu com 1440×810 pixels. Isso é uma conferência de produção de página/asset, sem login nem teste de partida.

[Patch, imagens e relatório de validação](https://github.com/laninhagamer85-max/Jogo-do-gato/tree/5dc133e255398dd741ed9cdbff27f0549b70a5b3/docs/lendarios/reviews/2026-11-19). Os arquivos finais de arte fazem parte da fonte em `client/public/lendarios/loading/`.

Rollback: versão 1.0.85, Sites87, versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_0b54a79c987881919c890ce7b9c9412f`, deploy `appgdep_6afd8f1931088191acd73d6c0e1bd301`. Só reverter se a1.0.86 ainda for a revisão ativa e houver regressão confirmada; não substituir trabalho posterior.

Próximo: verificar transições repetidas em celular real e medir fluidez/memória. Na conferência de novidades, o texto de encerramento ainda citava quatro capítulos/40salas apesar da notícia do quinto capítulo; revisar esse texto em ciclo separado, sem alegar auditoria dos capítulos.
