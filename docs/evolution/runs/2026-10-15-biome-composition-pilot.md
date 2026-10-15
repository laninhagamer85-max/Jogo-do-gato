# Piloto de composição de bioma — 15/10/2026

## Estado e origem

Implementado na fonte; aguardando validação visual real. Base pública mantida: produto **1.9.16**, Sites **35**, commit Sites `5c802bc84578f650694f556831662a8114318cee`. Ramo de colaboração `feat/exploration-combat-pilot-20261015`, base GitHub `a120b3007af7d89e3680aa62019f543f95ebd8f6`. As quatro fontes existentes modificadas foram comparadas integralmente com essa base antes do envio: correspondência confirmada. Sem force-push, merge de PR ou mensagem a terceiros.

David pediu aplicar a pesquisa e a nova skill. Aplicadas `criar-cenarios-biomas-2d`, `evoluir-meu-pet-virtual` e Sites. Fonte exata aberta pelo helper oficial de Sites; publicação atual confirmada por get_site. README e RETOMADA-MANUS históricos lidos sem usar o snapshot v8 como fonte. Nenhum AGENTS.md encontrado no checkout ou ancestrais consultados.

## Mudança delimitada

- Sala piloto de combate: mantém a grama aprovada e acrescenta trilha de terra, lago irregular, areia na margem e pequenas pedras da arte existente. Os três capítulos de charadas e a Aventura não recebem o novo lago nesta revisão.
- `biomeComposition.ts`: dados em unidades do mundo; módulo de lago reutilizável por origem/escala; polígonos amostrados de contornos suaves. Água, margem e props são camadas distintas. Os pequenos seixos decorativos são explicitamente não bloqueantes.
- `biomeCompositionView.ts`: materiais originais desenhados em Canvas, com gradação discreta e grãos determinísticos ancorados no mundo; bordas de terra/areia suavizadas. Não foram criados novos PNGs, não foram importadas artes externas nem geradas as quatro/três/três variantes do kit completo nesta etapa.
- Cache: grama, terra, areia e base da água são compostas juntas em UM buffer visível. Chave inclui a composição; não alterna uma entrada por material. Mantém o teto aproximado de 8 MP desse buffer (não uma alegação de 8 MP para toda a aplicação).
- Água: linhas suaves de ondulação e reflexo em camada dinâmica recortada pelo mesmo polígono do lago. Usa o tempo da simulação: pausa e inspeção congelam a água; movimento reduzido mantém aparência estática. A aparência animada ainda não foi observada em navegador.
- Colisão e navegação: contorno desenhado é o contorno bloqueante. Rotas por toque verificam também os trechos entre células, evitando cortar a margem curva. O pet não ganha natação, dano por água ou novas recompensas.
- Saves: a rotina existente de reposicionamento agora considera o lago; save antigo e loot que estejam sobre a água são deslocados para solo válido, preservando HP, XP, quantidade de itens e progressão. Verificado com dados fictícios, sem ler ou modificar saves reais.
- A versão exibida permanece 1.9.16 na publicação atual. Reservar o próximo número de produto apenas ao preparar uma entrega visual validada.

## Pesquisa aplicada

Pesquisa anterior completa: `docs/evolution/biome-composition-research-2026-10-15.md`, consultada em 15/10/2026. Fontes principais:

- https://doc.mapeditor.org/en/stable/manual/terrain/ — variantes e conexões entre materiais; adaptado por máscaras/polígonos no Canvas existente.
- https://factorio.com/blog/post/fff-219 — variedade em diferentes escalas e detalhes sobrepostos; relato de 01/12/2017, usado como técnica histórica.
- https://factorio.com/blog/post/fff-323 — separar água dinâmica do terreno estático; relato de 29/11/2019.
- https://factorio.com/blog/post/fff-346 — coerência entre margem visível e bloqueio; relato de 08/05/2020.
- https://deepnight.net/tutorial/the-level-design-of-dead-cells-a-hybrid-approach/ — composição com propósito e variação controlada; não copiar física, personagens ou arte.

## Verificação

TypeScript aprovado. Build de produção aprovado, com aviso preexistente de chunks grandes. Suíte offline: **201 testes em 28 arquivos aprovados**, incluindo nove testes novos. `git diff --check` aprovado.

Novos testes cobrem: transformação do módulo lago e seus props; água/margem física; alcance dos objetivos e desvios sem cortar margens; movimento contínuo barrado sem dano; migração de save/loot fictícios; igualdade entre polígono desenhado e bloqueante; comandos de água variando com tempo e estáticos com redução de movimento; reuso do cache combinado; cobertura de chão em **80 combinações** de cinco viewports, quatro cantos, zoom 1/2 e visão geral/seguir pet. São testes matemáticos e de comandos com Canvas simulado, não inspeção visual nem playtest.

A execução inicial da suíte completa também encontrou **um teste de integração Firebase reprovado por ausência de credencial de staging** (`getFirebaseAdminAuth()` nulo). Esse teste foi explicitamente excluído da suíte offline acima; não foi corrigido, ocultado ou declarado aprovado. Não houve tentativa de alterar credenciais nem acessar contas/jogadores.

**Navegador suportado `control-browser` indisponível.** Conforme Sites em ambiente managed-linux, não foi iniciado preview, instalado navegador nem improvisado caminho alternativo. Não houve captura do jogo, avaliação perceptiva de repetição, medida de FPS, playtest ou auditoria online de fases.

## Publicação, rollback e próximo passo

**Nada publicado nesta revisão.** A skill de evolução exige inspeção real em navegador suportado antes de publicar mudança visual/física. A 1.9.16 pública permanece intacta, assim como domínio, público, contas e progresso. Código salvo no ramo de colaboração para revisão; os commits desta entrega constam do histórico e de `state.json`.

Próximo passo: iniciar preview com navegador suportado; conferir 375×667, 375×812, 390×844, 844×390 e desktop; avaliar nitidez, transições, escala das pedras, ondulação, todos os cantos/zoom, coleta/combate/ponto seguro/saída e recarga de perfil isolado. Corrigir a arte conforme a inspeção e somente então preparar o próximo número e uma publicação oficial. Após aceite, ampliar o kit de variantes e compor dez salas distintas do capítulo 1 antes dos demais biomas. A meta de seis capítulos × dez salas continua pendente; esta revisão não implementa 60 salas.

Commit da implementação: `869272301e4c6cb297f7fc36fbbdd2dde4b4f7fd` (GitHub). A publicação Sites não recebeu push/deploy desta implementação.
