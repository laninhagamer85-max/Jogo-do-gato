# Capítulo 4 — proporção dos acessos e centros medievais

Data: 28/10/2026 · America/Sao_Paulo · versão de produto 1.50.0
Estado: validado, preparando publicação no mesmo Site.
Base: produto 1.49.0; Sites153; fonte Sites73eb48808125160593015c111519e7acc0b9dc42; GitHub b788090c760153f42b2439d67023facb3b865ca2.

## Problema e alteração

A foto do usuário mostrou uma escada monumental junto ao personagem na sala31. A extensão anterior era5,524 unidades em qualquer plataforma. Os degraus agora usam escala uniforme proporcional ao tamanho da plataforma: extensão2,07–4,14 unidades (redução25–63%). Um patamar superior apoiado na face rochosa conecta o piso original à escada menor. Piso e colisão usam os mesmos pontos; material original reaproveitado na mesma escala, sem deformar os sprites. Os dois modelos permanecem.

O castelo da sala40 cresce uniformemente de18 para30 unidades (+66,7%). Origem, porta, escadaria curta, área de apoio e bloqueio acompanham a mesma transformação. A chegada aprovada da ponte permanece exatamente(13.44,-5.91): comprimento, direção, largura e pilares da ponte não mudam.

A inspeção revelou minério sobre a base da escada da sala35. A distribuição de depósitos agora reserva1,2 unidade ao redor de todas as áreas caminháveis das escadas. IDs dos recursos e saldos existentes são preservados.

## Leitura da referência de cidade

A imagem foi analisada como direção visual, sem extrair pixels ou incorporar arte de terceiros.

| Elemento observado | Aplicação neste ciclo |
| --- | --- |
| Praça ampla de pedra com desenho central | Incrustação de pedra com roseta, inteiramente caminhável, nos centros de estágio Cidade do capítulo4 |
| Edifício cívico destacado | Paço existente10% maior, estandartes, luminárias e pequenas floreiras dentro da base já bloqueada |
| Barracas e comércio | Preservadas barracas, empório, poço, oficina e casa de cura existentes, com acessos livres |
| Paisagismo delimitado | Floreiras discretas junto à fachada, sem ocupar a porta |
| Muralhas, torres e portões | Preservada a linguagem do terraço medieval; não foi criado um cerco que fecharia as trilhas |
| Cidade populosa | Mantidos moradores humanos, rotinas, guarda e identidades existentes; este ciclo não adiciona novos sprites nem duplica NPCs para simular multidão |

Os novos detalhes são desenho Canvas original, adaptados à escala do jogo. Aplicação condicionada à evolução real da vila; a fixture Cidade evoluída apenas demonstra o resultado sem gravar na conta. Novos animais, insetos e Mestre continuam fora deste ciclo de revisão visual.

## Validação

- TypeScript sem erros.
- Suíte completa:916 testes/90 arquivos aprovados antes do refinamento final de distribuição de minério e camada da praça; após esse refinamento,84 testes pertinentes/5 arquivos aprovados. Novo teste reserva os acessos dos depósitos.
- Novo teste percorre subida, patamar e descida de todas as escadas usando moveCombatPoint real, raio.22, passos.06; ida/volta terraço→ponte→porta do castelo também aprovada.
- Auditoria de100 vilas:63.927 passos reais do motor, dez vilas por sala,31–40:10/10 em cada sala. Portas, centros e apoio das construções elevados conferidos automaticamente.
- Prévia Chrome suportada: sala31, mirantes32/34/36/38, vilas elevadas33/35/37/39, junção com castelo40. Revisão em fixture isolada; não equivale a percorrer manualmente100 vilas.
- Iframe de viewport:375×667,375×812,390×844,844×390,1366×768; joystick totalmente dentro de todos. Coordenadas(x,y,w,h): (12,528.25,126.75,126.75), (12,673.25,126.75,126.75), (12,700.1875,131.8125,131.8125), (12,272,110,110), (12,620,136,136).
- Sem aparelho físico, medição de FPS, campanha inteira, dificuldade, mortes ou tempo de conclusão. Não medidos.

## Referências técnicas

Consultadas em28/10/2026:
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform — transformação compartilhada para arte e geometria; escala uniforme.
- https://docs.mapeditor.org/en/stable/manual/objects/ — âncoras e regiões de objetos explícitas, em vez de posições independentes de arte e colisão.

## Publicação e rollback

Publicar no mesmo projeto appgprj_6ac40994d8d881919d46203a60801e46, público. Registrar IDs finais após sucesso, sem segunda publicação para documentação.
Rollback conhecido: Sites153, versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_a47db3f3cf288191adc06bc52fa778f9, fonte24c1cb4f7261fb132341284cde7a470ae49a6ac1. Não reverter alterações posteriores de colaboradores.
