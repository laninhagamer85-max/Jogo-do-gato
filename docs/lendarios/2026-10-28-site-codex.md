# Site: capítulos, lendários e enciclopédia

Home com quatro slides (castelo menor/equipamentos exclusivos; capítulos1–3/mestres/criaturas/recursos), paralaxe suave por ponteiro/rolagem, flutuação, controles anterior/próximo/seleção/pausa e respeito a movimento reduzido. Carrossel lento dos8lendários, com quatro disponíveis e quatro planejados claramente separados.

Guia /guia/ e páginas /guia/capitulo-1/, /guia/capitulo-2/, /guia/capitulo-3/, com30objetivos extraídos do código, mestre/carta e requisitos por sala. Bestiário /bestiario/ inclui8lendários,13tipos de criaturas/mestres e4005definições humanas; busca, filtros por tipo/capítulo,24fichas por página e detalhes expansíveis. Definições humanas são personagens autorais/procedurais do mundo, não dados de jogadores. Presença depende do estágio e do horário das vilas.

scripts/export-lendarios-codex.ts gera o catálogo durante o carregamento da configuração Vite específica. Fonte das descrições: LEGENDS, LEGEND_KITS, explorationBestiary, WORLD_VILLAGERS e EXPLORATION_ROOMS. Dados gerados não precisam ser versionados; dimensões dos atlas e exporter são fonte. Nenhuma habilidade foi inventada para os quatro planejados.

SVGs recortados com clipPath explícito, inclusive no espaço de letterbox do viewBox. Corrigidas artes de cristal/escama e fundo real do capítulo3. Arte original do projeto; sem assets externos novos. Catálogo separado em chunk de90KB gzip, carregado apenas nas páginas institucionais.

TypeScript/build e12testes de catálogo/saves passaram. Chrome: slides, filtro de3mestres, ficha/recompensas, busca Celina, layout de390px parahome/guia/bestiário. Não houve conta real nem alteração de progresso. Acesso do Site consultado como público; preservar essa configuração. Domínio próprio e loginFirebase continuam fora desta revisão.
