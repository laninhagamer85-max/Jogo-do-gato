# Composição natural de terrenos e biomas — pesquisa de 15/10/2026

Pedido de David: pesquisar antes de produzir novos cenários, aproveitando a melhora da grama e criando biblioteca de grama, água, terra, areia, lago e pedras para os biomas. Esta entrega é pesquisa/especificação e criação de skill. Não inclui nova arte, mapa jogável, água animada ou publicação do jogo.

## Diagnóstico da captura

Na Screenshot_20261015-155214_Meu Pet.png, o detalhe do solo é mais fino que na versão ampliada anterior. Entretanto, manchas claras/escuras recorrentes fazem todo o chão parecer o mesmo material. Rotacionar um único bloco disfarça emendas, mas conserva seus traços marcantes. A solução proposta acrescenta variedade de materiais, transições e composição, em vez de apenas aumentar a frequência dos blocos ou o ruído.

## Fontes primárias e técnicas aproveitáveis

1. **Tiled — Using Terrains:** https://doc.mapeditor.org/en/stable/manual/terrain/ — documenta conexões por lados/cantos, probabilidades de alternativas e limites de transformação. Aplicação: encaixar as margens entre superfícies com regras explícitas. Consultado em 15/10/2026.
2. **Godot — Using TileSets:** https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html — documenta terrenos com colisão, navegação e metadados. Aplicação: adotar contratos equivalentes em JSON/TypeScript, conservando nosso Canvas. Consultado em 15/10/2026.
3. **Tiled — Using Templates:** https://docs.mapeditor.org/en/latest/manual/using-templates/ — descreve objetos reutilizáveis. Aplicação: padronizar as peças; uma sala/lago completo precisa de dados de composição adicionais. Consultado em 15/10/2026.
4. **Factorio FFF-219**, publicado em 01/12/2017: https://factorio.com/blog/post/fff-219 — relato histórico sobre misturar escalas de terreno, pequenas decorações e detalhes sobrepostos para reduzir a leitura da grade. Aplicação: base discreta mais grupos de detalhe e objetos. Consultado em 15/10/2026.
5. **Factorio FFF-323**, publicado em 29/11/2019: https://factorio.com/blog/post/fff-323 — descreve água sutil e dificuldades de animá-la quando o solo utiliza cache. Aplicação proposta: camada dinâmica de água separada do cache estático; não copiar o shader nem trocar nosso motor. Consultado em 15/10/2026.
6. **Factorio FFF-346**, publicado em 08/05/2020: https://factorio.com/blog/post/fff-346 — relata divergências entre margens desenhadas e contato do jogador. Aplicação: validar a geometria efetiva junto às bordas e pontes. Consultado em 15/10/2026.
7. **Deepnight — The Level Design of Dead Cells:** https://deepnight.net/tutorial/the-level-design-of-dead-cells-a-hybrid-approach/ — relato do desenvolvedor combinando salas desenhadas, conexões e restrições de encontros. Aplicação proposta: módulos com propósito e variações compatíveis, não salas inteiras sorteadas sem solução. Consultado em 15/10/2026.
8. **Kenney — Tiny Town:** https://kenney.nl/assets/tiny-town — exemplo modular 2D com licença CC0 informada. Referência de organização; estilo pixel não substitui nosso estilo pintado. Nenhum asset baixado/incorporado. Consultado em 15/10/2026.

Estas são referências de técnica. Números, paleta, orçamento e composição abaixo são propostas para nosso jogo, não regras prescritas por esses autores.

## Sistema proposto para o Meu Pet Virtual

| Parte | Conteúdo | O que deve permanecer separado |
| --- | --- | --- |
| Materiais de base | grama clara/escura discreta, terra seca/úmida, areia | escala em unidades do mundo e variantes |
| Transições | grama-terra, terra-areia, areia-água; grama-água se a margem exigir | regra de encaixe e forma da margem |
| Água | lago/riacho, ondulação, reflexo leve e espuma localizada | animação, profundidade e bloqueio |
| Objetos | pedras, troncos, arbustos, ponte | sprite, âncora, profundidade e colisão |
| Composições prontas | lago com pedras, clareira com terra, riacho com ponte | rotas, entradas/saídas, pontos seguros e coleta |

Um bloco composto pode reunir lago, faixa de areia e pedras, mas não deve ser uma única foto achatada: dentro dele, a água continua animável, cada pedra mantém colisão própria e as passagens permanecem conhecidas. Assim a mesma composição pode receber outro contorno, vegetação e recompensa sem recriar o cenário inteiro.

## Primeiro kit e composição piloto

Proposta inicial de orçamento: quatro variantes discretas de grama, três de terra e três de areia, uma família de água com superfície/animação e transições dos pares realmente usados. Não é necessário gerar todos os pares possíveis de terreno.

Montar primeiro uma sala com lago irregular deslocado do centro, faixa de areia acompanhando parte da margem, terra formando trilha, pedras agrupadas em uma lateral e um desvio opcional com coleta. Entrada e saída terão caminho garantido; checkpoint ficará fora do alcance inicial dos inimigos. Alternar espaços abertos e grupos de detalhe, sem cercar toda a tela com o mesmo arbusto.

Preservar iluminação, escala do gato e controles aprovados. Restringir repetição de variantes marcantes próximas e manter semente estável por sala. Medir densidade na resolução física e no zoom 2; não esticar novamente um mapa inteiro. Usar a base terrainTexture.ts como detalhe fino, não como responsável por lago, ponte ou colisão.

A fonte atual mantém um buffer de terreno por contexto Canvas. Alternar a renderização de grama e areia nesse mesmo contexto provocaria invalidações sucessivas. Antes da integração, compor as regiões estáticas juntas ou adaptar o cache para múltiplas regiões com orçamento total compartilhado; 8 MP por material não equivale a 8 MP no total. Este achado veio da leitura do nosso código durante a avaliação de uso da skill.

Água animada será desenhada por cima/de forma independente do solo estático: não pode ficar congelada dentro do cache de grama. Ondulação deve ter continuidade entre blocos e movimento reduzido precisa manter a superfície legível.

## Validação antes de aplicar aos capítulos

Conferir combinações de margem, cantos, ilhas e ponte; geometria de colisão e caminhos obrigatórios; área de combate, coleta e ponto seguro. Comparar os cinco formatos, os quatro cantos, zoom e Ver sala. Registrar separadamente build/testes matemáticos e observação real do jogo. Não declarar ausência perceptiva de repetição apenas por uma fórmula ou captura estática.

A próxima entrega de implementação deve integrar UMA composição e receber revisão visual. Depois usar o kit para dez salas distintas no capítulo 1 e expandir aos seis capítulos, seguindo exploration-campaign-rollout.md. A pesquisa não implementa essas 60 salas nem concede itens/saves.

## Skill reutilizável

Nome: criar-cenarios-biomas-2d. Criada com skill-creator, com referências de fontes, contrato de composição e contexto do Meu Pet Virtual. Uso: pesquisar e especificar kits; depois, quando solicitado, gerar arte, integrar geometrias e verificar piloto. Foi validada estruturalmente e aplicada por um agente em contexto independente numa tarefa de planejamento somente leitura. A avaliação identificou a limitação de cache por contexto e separou proposta, dados e validações; o achado foi incorporado às instruções. Não houve teste de arte/água/jogabilidade ou ação no Site. Não substitui Sites nem a skill evoluir-meu-pet-virtual para publicação e coordenação.

Skill salva na coleção de skills em 15/10/2026; commit 1c36cc6 confirmado no push. Nenhuma nova versão do jogo publicada nesta etapa.
