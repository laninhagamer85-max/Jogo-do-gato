# Correção de terreno e engasgos — 15/10/2026

Base: produto 1.9.17 / Sites 36, fonte `a84a9222cba41b2b62b1fd41566d2126c5742af0`; GitHub `db0c1b508345d7a4d2a345fa000ea259d0372766`. Entrega preparada: **1.9.18**, para revisão de David no aparelho. A autorização explícita anterior de publicar para ele testar permanece aplicável à correção; não é aceite visual desta versão.

## Evidência e diagnóstico

David reprovou a composição e relatou travamento ao caminhar. Captura `Screenshot_20261015-163608_Meu Pet.png` aberta e inspecionada: grama muito contrastada, manchas recorrentes, trilha e lago de aparência plana incompatíveis com os props pintados. Uma captura estática não permite medir o travamento.

A leitura da fonte mostra um candidato concreto para os engasgos: o cache visível completo era reconstruído ao sair da margem de .75 unidade, repetindo escalas de patches e milhares de primitivas dos materiais. Não houve perfil de CPU/GPU no navegador; esta é uma hipótese de engenharia apoiada pelo código, não uma medição de causa exclusiva.

## Correção delimitada

- Removidos do renderer ativo o lago, areia, trilha e pequenos seixos experimentais. Removido também o bloqueio da água; o chão liberado volta a ser caminhável. Os módulos permanecem na biblioteca de código para redesenho, sem serem confundidos com conteúdo aprovado.
- Nova textura original de grama menos contrastada, gerada pela ferramenta imagegen integrada. Arquivo final `client/public/forest-adventure/grass-block-v2.webp`, 1254×1254, 517174 bytes, SHA256 `f9fe79567913b7bc223ac74716455b0fcf0aa53112f09f14bdffe840a198a5fb`. Conversão de formato WebP qualidade 90, sem redimensionar nem editar a arte com Python. Original da geração preservado fora da pasta publicada. Prompt completo em `docs/evolution/grass-block-v2.json`.
- `terrainTexture.ts`: cache de pequenos blocos de 384×384 pixels, com gutter de um pixel, ancorados no mundo. Movimento desenha novamente blocos já compostos e constrói somente os que entram na tela. Retorno ao mesmo local reutiliza blocos ainda residentes. LRU descarta antes de alocar e limita a soma dos blocos residentes a 8 milhões de pixels, além da máscara da imagem fonte. Cada bloco usa as mesmas coordenadas de patches para continuidade das bordas.
- Densidade nativa preservada nos formatos móveis testados matematicamente; resolução total visível limitada em telas muito grandes. Mudanças de textura, zoom/densidade e composição invalidam corretamente o cache. Sem promessas de FPS ou ausência perceptiva de emenda antes do teste no aparelho.
- HP, inventário, XP, recompensas, controles e identidade do pet preservados. Save/loot no local do lago removido conserva posição e itens; nenhum save real lido ou alterado por ferramentas.

## Pesquisa e validação

MDN, consultado em 15/10/2026: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas — reutilizar desenho pré-renderizado, evitar refazer primitivas/escala desnecessariamente e considerar a densidade de pixels. Aplicado por cache granular em Canvas existente, sem novo motor ou dependências.

TypeScript e **202 testes offline em 28 arquivos aprovados**. Suíte executada com exclusão explícita do teste de integração Firebase de staging sem credencial, limitação já registrada na entrega anterior; nenhuma alegação de autenticação validada. `git diff --check` aprovado. Build final pelo helper oficial de Sites antes de salvar/publicar.

Testes adaptados ao renderer real: reutilização no retorno; somente nova faixa no deslocamento; limite de memória em percurso longo; invalidação de zoom/imagem/composição; cobertura das cinco dimensões em cantos/zoom/visão geral; liberação da barreira do lago e preservação de saves fictícios. Testes da biblioteca experimental de lago continuam separados do comportamento do piloto ativo.

Imagem da nova grama inspecionada estaticamente. **Sem control-browser:** não foi iniciado preview nem executado playtest, medição de FPS, inspeção de pixels do renderer ou comparação de fluidez em aparelho. Os testes usam Canvas simulado e não provam que o travamento desapareceu. Publicação para teste de David segue sua autorização existente; o parecer visual negativo sobre a 1.9.17 permanece registrado.

## Retomada

Conferir publicação final e registrar IDs. David deve comparar caminhada contínua e ida/volta em retrato/paisagem, zoom e Ver sala; conferir grama, itens e controles. Se persistir engasgo, capturar perfil real de frames e separar terreno, desenho de sprites, React e persistência antes de outra mudança ampla. Só retomar lago/trilha quando houver arte compatível e revisão visual; não expandir a composição reprovada aos capítulos.
