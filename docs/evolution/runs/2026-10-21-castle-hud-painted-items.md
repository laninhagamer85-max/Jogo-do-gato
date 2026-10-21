# Exploração1.31.0 — portão, HUD e arte pintada

Base: Site116/produto1.30.0, source7101be20b484b4777eab302fb7abb80c9a99e170; GitHub c380e005ae11e126a92b53158b3dde1c3f8bb383.

Mudanças: escada adicional do castelo com65% do comprimento anterior; mesma transformação uniforme para arte/colisão, desenhada atrás do castelo para não cobrir o portão. Castelo permanece10 unidades, sem encolhimento. Rampa física compacta permite gradiente maior somente na própria escada/entrada.

HUD passa a um grupo em fluxo: capítulo/sala, nome/nível, HP/energia, objetivos e aviso. Elimina coordenadas absolutas concorrentes. XP duplicado do topo oculto; progressão permanece nos dados.

Arte raster original: atlas4×3,1448×1086,12 células362². Fibras, erva, fruta, âmbar, broche, pérola, escama,3 cartas, espinhos e vapor. Mochila/drops usam mesma arte; seiva/cristal, armas, NPCs, árvores e estruturas já usam desenhos pintados existentes. Removidos fallbacks geométricos de coletáveis e formas poligonais de espinhos/vapor; aviso de perigo permanece efeito sutil. Ícones funcionais de navegação preservados. Não equivale a redesenhar todo o módulo Aventura.

Proveniência/prompt completo em client/public/forest-adventure/items/painted-atlas-manifest.json. Criado com imagegen integrado, WebP qualidade92 método0 preservando alfa. SVGs antigos ficam como recursos legados, sem consumo pelo inventário/drops. Exportador verifica atlas sem gerar marcação inválida.

Pesquisa em21/10/2026: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts ; https://docs.mapeditor.org/en/stable/manual/objects/ . Técnica: fluxo de layout sem colisão de caixas e objetos com âncoras/colisões compartilhadas.

Validação concluída: suíte completa62 arquivos615 casos,605 casos fora do componente passaram e9 falhas de renderização apontaram import React ausente; correção aplicada e os10 casos de arte passaram na repetição. TypeScript passou após corrigir anotação de CombatState da fixture preexistente. Diff whitespace passou. O ambiente estava lento: a suíte usou1 worker e limite60s por caso, sem mudar configuração do repositório. Firebase Admin integração externa excluída.

Navegador real isolado:844×390 e390×844, portão32→Vestíbulo atravessado por clique, mochila com novos itens, pausa/retomada e rotação. Medidas do HUD horizontal: header y100..154.73; vitais158.73..201.73; objetivo205.73..252.23; vertical header130..184.73; vitais189.73..236.73; objetivo241.73..288.23. Caixas separadas por4–5px. Captura em /workspace/scratch/meupet-131-castle-hud.png. Não equivale a teste em todos os celulares físicos.

A pedido adicional, pesquisa e plano de economia em docs/evolution/exploration-crafting-expansion-plan.json. Segundo atlas original criado com8 materiais e4 estações, declarado como preparado e ainda não habilitado no gameplay. Não altera os drops ou inventários existentes.

Publicação1.31.0 pendente. Anexo indisponível no caminho local, não lido através da Library conforme instrução do usuário. Rollback Site116/1.30.0.
