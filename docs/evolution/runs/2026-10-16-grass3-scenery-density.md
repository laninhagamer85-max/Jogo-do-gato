# Gramado 3 e distribuição da clareira — 16/10/2026

David pediu testar outro gramado e melhorar o cenário vazio. A referência “E” foi esclarecida antes de trocar a imagem: David selecionou **3 — Natural uniforme**. Escopo: uma sala piloto de combate; produto preparado **1.9.20**, base pública 1.9.19 / Sites 38, fonte Sites `843606530fd9dd1b7d0f63107637900cf704c7aa`; GitHub base `d31dbb083f819b08cee6768f2b2de63bfc9e5f7c`. Fonte atual aberta pelo helper oficial; estado corrente consultado no ramo de colaboração.

## Implementação

- Aplicada a terceira imagem da comparação, sem gerar uma substituta: `exec-59713065-4f42-4b69-9cee-019343838295.png`. Codificação WebP qualidade 90, sem recorte/redimensionamento ou mudança de cores por código. Asset `client/public/forest-adventure/grass-natural-option3-v1.webp`, 1254×1254, 581956 bytes, SHA256 `1ca5d7882501c7f19882f2f8197556b28edd81401576a2553db03f3d2aa81523`.
- Acrescentados **22 grupos pequenos de samambaias/folhagens e flores** nos quatro setores internos, em posições fixas e agrupadas de forma irregular. Reutilizada a arte original `woodland-props-v2.png`. Vegetação baixa é atravessável, desenhada antes de itens e personagens, com espaço ao redor de coleta, ponto seguro, marco e saída.
- Acrescentados **três elementos sólidos**: toco antigo, grupo de pedras e tronco menor. Total do piloto: cinco objetos sólidos, com seis células de colisão. Aparência e bloqueios derivam dos mesmos dados de footprint. Os caminhos obrigatórios foram preservados nos testes.
- Desenho de props usa culling do retângulo efetivo, evitando enviar os que estão fora da câmera. Tamanho dos sprites mantém proporções e apoio no chão. Escala do gramado, mistura e cache LRU de blocos da correção 1.9.18 permanecem iguais; sem reconstrução do chão inteiro por câmera.
- A rotina existente de leitura/reposicionamento trata saves e drops que coincidam com os novos obstáculos. Testada em dados fictícios, preservando HP, energia, XP, inventário, equipamento e quantidade de loot. Nenhum save real foi lido/modificado por ferramentas.

Não reintegrados lago e trilha reprovados. Não alterados os controles, personagens, regras de combate, moeda, recompensas ou os capítulos legados de charadas. Esta entrega não implementa as 60 salas planejadas.

## Validação

TypeScript e **205 testes offline em 28 arquivos aprovados**. A suíte exclui explicitamente a integração Firebase de staging sem credencial, limitação anterior; nenhuma alegação de autenticação real testada. Três testes novos: distribuição e afastamento da vegetação; trechos contínuos das rotas para objetivos/encounters; recuperação de saves/loot em cada novo objeto, com portão aberto/fechado. A primeira execução detectou folhagem muito próxima de um coletável; a posição foi corrigida e a suíte aprovada. `git diff --check` aprovado. Build e pacote pelo fluxo oficial antes de publicação.

Arte fonte inspecionada estaticamente. **control-browser indisponível**: não iniciado preview, não instalado navegador alternativo e não executados playtest, medição de FPS, inspeção real de retrato/paisagem ou avaliação perceptiva de densidade/repetição. Testes de cobertura/proporção/câmera continuam matemáticos e de Canvas simulado. Publicação para teste de David segue a autorização persistente para revisão no aparelho; não transforma aprovação da imagem em aceite da composição final.

## Referências e próximo passo

Aplicada a pesquisa já registrada em `docs/evolution/biome-composition-research-2026-10-15.md`: grupos com espaços de respiro e salas com função, em vez de preencher uniformemente tudo. Referências anteriores: https://factorio.com/blog/post/fff-219 (detalhes e variedade) e https://deepnight.net/tutorial/the-level-design-of-dead-cells-a-hybrid-approach/ (salas com propósito). Não incorporada arte desses jogos.

David: comparar o gramado 3 e a densidade em retrato/paisagem, zoom e Ver sala; caminhar pelos grupos, coletar itens e verificar legibilidade durante combate. Ajustar antes de expandir a composição a outras salas e biomas. Rollback preservado na 1.9.19.
