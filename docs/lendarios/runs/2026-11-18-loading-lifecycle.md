# 18/11/2026 — Ciclo de vida das imagens de carregamento

Entrega de testes, sem alteração de produto nem publicação por este ciclo. O próximo passo registrado em 17/11 era validar transições repetidas e memória antes de acrescentar outra cena. Este ciclo amplia a proteção lógica das transições; não cria novas artes nem substitui a validação de desempenho em aparelho real.

## Estado e concorrência

Na abertura, o Lendários do Rei público era 1.0.84 / Sites 86, fonte `1c30a5dad15b60c6af18ac1f626f6235344c527f`. A fonte de trabalho `3f5584ebe19360c581b2eeff11075fca8ba6530f` continha 38 arquivos de uma revisão do Mestre das Marés. Usei um worktree isolado na fonte pública e não alterei essa revisão. Durante o trabalho ela foi publicada por outro fluxo: [1.0.85](https://lendarios-do-rei.aquimeusite.chatgpt.site), Sites 87, fonte `3f5584ebe19360c581b2eeff11075fca8ba6530f`, versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_0b54a79c987881919c890ce7b9c9412f`, deploy `appgdep_6afd8f1931088191acd73d6c0e1bd301`, status confirmado `succeeded`. Isso não é uma publicação deste ciclo. O módulo loadingScenes.ts, seus testes anteriores e loadingReveal.ts são idênticos entre as duas bases. Meu Pet Virtual intacto.

## Melhoria

Quatro testes adicionais em `client/src/lib/loadingSceneLifecycle.test.ts`, preservados junto ao patch em `docs/lendarios/reviews/2026-11-18`:

1. Exercitam o decodificador real por sua API pública, com Image controlada, e exigem que as duas orientações estejam decodificadas antes da troca.
2. Simulam falha de rede em uma orientação e atraso na outra. A fila não pode começar outro grupo antes de ambas terminarem; o destino atual permanece com a arte anterior. Verificam limpeza de callbacks e timers.
3. Simulam rejeição de decode() e timeout de 12 segundos. A falha mantém a arte, e a nova tentativa só acontece no destino seguinte.
4. Simulam 300 trocas entre bosque e inverno, com falhas periódicas e 20 renderizações por destino, sem downloads extras por renderização nem mais de um grupo em preparação. A imagem selecionada deve ter concluído preparação. Isso verifica pedidos em andamento, não prova coleta de lixo dos objetos ou memória da GPU.

## Pesquisa — 18/11/2026

- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — a Promise pode rejeitar por rede/dados inválidos; testar esse caminho independentemente do evento load.
- https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory — métrica não padronizada e limitada ao heap JS; não usá-la isoladamente para alegar memória de imagens ou desempenho móvel.

## Verificação e limites

- **30/30 testes focados**, seis arquivos. Incluem catálogo, preparação, ciclo de vida, progresso/revelação e exploração/performance lógica.
- Teste de sensibilidade: substituí temporariamente Promise.allSettled por Promise.all. Dois dos quatro novos testes falharam, detectando a liberação prematura da fila. Restaurei o módulo e confirmei diff vazio na fonte de produção.
- TypeScript do jogo e host passou. Build oficial Worker aprovado, com **551 cópias de assets verificadas** na base 1.0.84. Sem atualização de dependências/lockfiles.
- Nenhum navegador ou aparelho físico usado neste ciclo; não há alteração visual. Nenhuma medição de heap/FPS ou teste de partida, conta ou save real. As 300 transições são simulações de controle da fila, não 300 travessias jogadas.
- Nada salvo/publicado no Sites por este ciclo. O teste e o patch permanecem em revisão documental no GitHub para aplicação à fonte correspondente; não afirmar que a suíte do Site passou a incluir o arquivo.
- Nenhum rollback necessário: código de produção não foi alterado.

Próximo: medir transições repetidas em celular real, incluindo memória total do processo e fluidez. Reconciliar o teste com a fonte vigente ao integrá-lo; só então avançar para outra arte sem misturar revisões concorrentes.
