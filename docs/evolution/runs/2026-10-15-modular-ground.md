# Chão modular com densidade fixa — 15/10/2026

Alvo produto 1.9.16, base pública 1.9.15 / Sites 34, fonte ad6369b33c3f0cf0bfacd75979c81c033abf0e1a.

Evidência: captura Screenshot_20261015-153156_Meu Pet.png fornecida por David, inspecionada. A imagem única 1254×1254 ampliada sobre 30×32 unidades fazia trevos ficarem maiores que o gato e perderem nitidez. A cobertura corrigida na 1.9.15 não corrigia a densidade. David autorizou usar blocos repetidos se as emendas e o padrão não ficarem evidentes.

Entrega: textura original de grama curta e miúda sem trevos/elementos reconhecíveis grandes. Asset client/public/forest-adventure/grass-block-v1.png; prompt e SHA em docs/evolution/grass-block-v1.json. Gerada com ferramenta imagegen integrada e inspecionada estaticamente. Não é usada uma imagem ampliada do mapa inteiro.

Motor reutilizável terrainTexture.ts: patches de ~2 unidades com variação de escala, espaçamento .9, deslocamento irregular, quatro orientações e reflexão determinados por hash de coordenadas e semente. Bordas de 18% suavizadas por composição destination-in; os núcleos opacos cobrem os espaços entre blocos, sem preenchimento plano exposto. Sem alternância previsível por paridade ou novo sorteio por frame. Repetição da arte existe tecnicamente, com mistura espacial para disfarçar o padrão, não alegação de unicidade de pixels.

Cache: apenas o trecho visível com margem .75 unidade; composição reaproveitada enquanto a câmera continua dentro desse trecho. Densidade acompanha tile×DPR, com teto aproximado de 8 milhões de pixels por buffer. Mudança de zoom, dimensão, material ou imagem do bioma refaz o cache. Máscara do asset calculada uma vez; culling de patches externos. Não gera bitmap do mundo inteiro, nem camada fixa de outro cenário.

Reuso: TerrainMaterial expõe ID, semente, tamanho, espaçamento, variação e borda; mesma renderização poderá receber areia, terra ou neve em assets próprios. Não criados outros biomas agora. Gato, inimigos, controles, itens, regras de combate e saves preservados.

Verificação: TypeScript e 192 testes offline/27 arquivos aprovados. Teste de cobertura do renderer em 200 combinações de viewport/canto/zoom/visão geral mantido com buffers reais simulados. Quatro novos testes: cobertura por núcleo opaco incluindo coordenadas negativas, escala limitada/distribuição fixa de orientações, densidade nativa nos zooms móveis e teto de memória, cache reaproveitado em movimento curto e invalidado por zoom/imagem nova. Estas são verificações matemáticas/de comandos com Canvas simulado, não inspeção de pixels em navegador. Build aprovado com aviso preexistente de chunk; entrada aprovada em 101 estados simulados e paridade aprovada com armazenamento fictício.

Pesquisa consultada 15/10/2026: MDN https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas (cache local e alta densidade) e https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation (máscara destination-in). Arte original sem incorporação de imagens externas.

Limites: control-browser indisponível. Nenhum navegador, medição de FPS em aparelho, inspeção real de emendas nem playtest executados. Publicação para revisão de David autorizada; nitidez, percepção de repetição e fluidez aguardam teste no aparelho, inclusive em zoom 2. Nenhum save real alterado por ferramentas. Piloto permanece uma sala, 60 salas continuam em planejamento.

Publicação em preparação. Rollback 1.9.15 / Sites 34. Após aceite: dez salas distintas no capítulo 1, antes de migrar demais capítulos.
