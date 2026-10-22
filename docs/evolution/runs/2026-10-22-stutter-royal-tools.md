# 1.39.3 — Picos durante caminhada/combate e ferramentas da Coroa

Base/rollback: produto1.39.2; fonte388901a0d41a48a9af1b75facef8f7f15e80d4b9; publicação anterior Sites131. Mesmo projeto, público e contas.

## Diagnóstico e mudanças

- Leitura do save revalidava toda a vila/oficina/quest para cada roomVisits. Agora dados globais são validados uma única vez e reutilizados apenas internamente para sanitizar as memórias locais. Teste com32 salas confirma uma chamada a readVillage, memórias individuais e totais preservados; não altera dados recebidos.
- A deduplicação do salvamento ativo usa a revisão do motor, evitando serialização JSON integral extra a cada coleta, derrota e autosave. Fronteiras de save e validação de entrada preservadas.
- Itens/NPCs/casas usam células rasterizadas em cache limitado; não recalculam filtros Canvas a cada frame. Personagens fora da câmera não são desenhados; permanecem na simulação. Animação do gato preparada durante carregamento, antes da entrada na sala.
- Buffer do cenário limitado a2× a densidade e1,8 milhão de pixels. Layout, zoom, UI e imagens originais preservados; reduz nitidez máxima em aparelhos de DPR alto para reduzir carga de GPU. Removido backdrop blur apenas dos controles sobre o cenário em movimento; janelas pausadas continuam translúcidas/desfocadas.
- Ferramentas da Coroa equipadas e legitimamente conquistadas ignoram o nível mínimo de coleta. Machado para árvores; picareta para todos os minérios. Ferramentas comuns, cooldown, distância, esgotamento e renovação continuam validados. Texto contextual explica que não há limite de nível. Não adiciona novos depósitos de ouro/diamante; a regra já suporta níveis futuros quando definidos no catálogo.

## Pesquisa técnica

MDN, consultada2026-10-22: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas — reaproveitar desenhos fora da tela, evitar filtros e redesenhos repetidos e limitar custo de escala.

## Validação

802 testes/79 arquivos passaram, incluindo coleta especial Nv1 em todos os minérios existentes, níveis futuros de ouro/diamante em definições canônicas isoladas, ferramentas comuns ainda bloqueadas, cooldown/esgotamento e32 memórias. Firebase Admin staging excluído por falta de credencial, sem relação com o patch. TypeScript aprovado; build oficial antes da publicação.

QA no navegador em partida isolada: caminhada, ataque com ganho de XP/Nv2, controles móveis horizontal/vertical. Sem alterações em contas/saves reais. Telemetria de desenvolvimento identificou cerca de15ms na seção de itens antes do cache e abaixo de1ms após preparar o cache; o custo de desenho total continua variando no navegador remoto. Não foi feito benchmark em telefone físico; não se promete eliminação universal de engasgos.
