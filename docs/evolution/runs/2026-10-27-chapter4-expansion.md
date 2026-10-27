# Capítulo 4: dez salas de visitação — 1.48.0

27/10/2026, America/Sao_Paulo. Validado, preparando publicação.

## Entrega

David pediu salas31–40 no bioma atual, antigas31/32 preservadas como31/40, vilas humanas no chão ou platôs, circulação livre para revisão e Castelo Bônus opcional na40. A revisão de cada sala após publicação também foi solicitada. Animais, insetos e Mestre aguardam aprovação dos cenários.

| Sala | Composição | Vilas elevadas | Portal principal |
| --- | --- | --- | --- |
|31|Jardim das Nascentes original + terraço oeste|núcleo2|platô original|
|32|Vila da Clareira|vilas no chão; mirante livre|chão|
|33|Mirante dos Artesãos|centro inteiro|platô|
|34|Lago das Hortas|núcleo2|chão|
|35|Vila das Duas Alturas|centro e núcleo3|chão|
|36|Bosque das Pedreiras|vilas no chão; dois mirantes|platô|
|37|Terraços da Colheita|centro e núcleo3|chão|
|38|Refúgio das Águas|núcleo2|chão|
|39|Praça dos Guardiões|centro e núcleo3|platô|
|40|Encosta das Fontes, antiga32|núcleo2; castelo a leste|reserva para capítulo5|

Dez povoados por sala usam crescimento, comércio, casas e rotinas humanas existentes. Vilas elevadas têm disposição compacta própria. A planta de cada platô define desenho, piso, escada, colisão e navegação. Trilhas superiores usam recorte pelo mesmo polígono da colisão. Pedra/grama usam os assets originais aprovados, sem novas imagens ou edição de bitmap.

A visitação não concede estrelas nem conclui desafios. A coleta é lembrada ao revisitar. O portal final informa que o capítulo5 está em preparação; não cria uma sala41 fictícia. Castelo Bônus é uma ramificação opcional da40. Não há hostis, Mestre errante ou escoltas provisórias do bioma anterior no capítulo4.

## Fonte e preservação

- Base Sites: ce14bdbd04df232c636c93514874b0a37b477856, Sites149 / produto1.47.3.
- Base GitHub: eb5a1cdab709a675dacfd2f41edaacdb2d260e0f, review/grass-option3-20261016.
- Retomada de Soren/Ayla já corrigida na1.47.3, preservada.
- campaignVersion17 protege saves novos de clientes antigos.
- Migração única: antiga32 para40, incluindo checkpoint, visitas, coleta, estrelas, tentativas, moradores/IDs, recursos esgotados, construções e produções. Economia, HP, XP, lendário e reivindicações do castelo mantidos.
- Ordem de geração das identidades anteriores preservada; novos nomes continuam únicos.
- A visita pelo mapa/área de testes mantém o checkpoint real da campanha.
- Rollback: ce14bdbd04df232c636c93514874b0a37b477856, versão salva appgprj_6ac40994d8d881919d46203a60801e46~appgver_a04c33f164988191a79bb8571d8bf370. Clientes antigos rejeitam save17 em vez de apagá-lo; não converter dados para forçar downgrade.

## Pesquisa

Consultada em27/10/2026:
- https://docs.mapeditor.org/en/stable/manual/objects/ — pontos, polígonos e conexões como dados autorais separados da arte.
- https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection — geometrias de colisão consistentes com apoio dos objetos e percursos.

## Validação anterior à publicação

- TypeScript e build oficial passaram; build final35,94s, aviso preexistente de chunks grandes.
- 892 casos únicos de jogo aprovados. Lote final891/892; uma verificação de trilhas expirou durante execução paralela com build. Arquivo de trilhas repetido isoladamente41/41. Sem falhas de asserção pendentes; não equivale a medida de FPS ou teste de integração Firebase.
- Novos16 casos: dez layouts/escadas/portas, ausência de hostis, portais bidirecionais sem prêmios, migração, visitas e Castelo Bônus separado.
- Verificação dos100 povoados:60262 passos da mesma função de movimento/colisão usada pelo jogo, portas de todas as casas e apoio das construções elevadas. Zero bloqueios no resultado final.
- Resultado completo: docs/evolution/evidence/chapter4-routes-20261027.json.
- Navegador prévia: salas33/35, vila elevada, humanos, casas/serviços e mapa geral; formatos375×667,375×812,390×844,844×390,1363×768 em iframe.
- Corrigidos na verificação: grafo ignorava segundo platô; construções junto ao portal; posição de poço/paço/comércio; desenho pausado não atualizava ao carregar imagens das vilas/platôs.
- Sem login ou alterações em saves reais, sem celular físico ou campanha completa. Percursos dos100 povoados são simulação do motor, não caminhada manual contínua no navegador.

## Publicação e revisão posterior

Aguardando publicação. Completar IDs e observações por sala após revisar a versão pública.
