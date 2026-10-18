# 1.14.3 — mapa ilustrado com trilha planejada

Estado: em implementação. David autorizou implementação e publicação para teste em 18/10/2026, após aprovar o conceito mostrado no board exec-ea18eb76-5268-48f1-862c-40b8190adf3b.png.

Escopo piloto: dois capítulos existentes de Exploração (floresta/riacho) e mundos 1 e 6 da Aventura (casa/jardim e bosque). Preservar arte dos outros oito mundos e usar o conector discreto existente neles; não alegar dez mundos redesenhados. Não mudar mapas jogáveis, desafios, NPCs, saves ou recompensas. Duas orientações autoradas separadamente, dois trechos distintos por bioma, cinco nós por trecho. Sem reutilizar a mesma vinheta três vezes, sem `cover` ou faixa raster colada.

Arte: doze fundos originais em geração, três famílias × duas orientações × duas variantes. Referência privada do usuário como direção visual. Os fundos são assets do seletor, não terreno de colisão do jogo. Geometria dos nós normalizada à arte e escala uniforme 2:3 retrato / 3:2 paisagem. Culling de imagens via lazy-loading nativo. Sem alegação de FPS.

Pesquisa reaproveitada da revisão anterior (18/10): https://kleeam.artstation.com/projects/L3lDBv (composição por regiões); https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit (proporção); nenhuma arte de terceiros incorporada.

Fonte inicial Sites: 81784cf2e0b6920a40c5c770bc5e9680cf675f01, publicação 1.14.2, Sites68, saved appgprj_6ac40994d8d881919d46203a60801e46~appgver_bba603b4a4c0819188e39e9fde1936dc, deployment appgdep_6ad43d18e1c081918bc2d62570aa5134. GitHub base 307c1db0fb84b618ad9565168a2e8eba50f353f9.

Verificação: em andamento. Browser visual indisponível; não declarar screenshot de jogo ou partida real. O usuário explicitamente solicitou publicar para testar após ser informado dessa limitação no ciclo anterior.

## Implementação final
Doze artes originais, em `client/public/forest-adventure/map-*-v2.webp`; manifest com dimensões reais, tamanhos e SHA256 em `docs/evolution/trail-art-v2-manifest.json`. Retrato 1024×1536, paisagem 1536×1024, conversão WebP qualidade82 sem redimensionamento. Duas entradas de paisagem corrigidas com imagegen para conectar no centro da borda. Âncoras calibradas após olhar cada imagem, em `trailArt.ts`; o prompt não é tratado como prova de posição. Caminho integrado dispensa qualquer traço SVG sobre os quatro conjuntos integrados. Legado dos oito outros mundos permanece com fundo original e conector discreto.

A UI mantém retorno ao progresso, replay e recompensas reais; usa dourado/madeira, menos NPCs cosméticos sobre o seletor e itens visíveis, com nome no painel selecionado. Removido aviso de expansão que cobriria a última sala. Mapas horizontais têm altura mínima para não recortar as fases, com rolagem externa disponível na Exploração.

Verificação: TypeScript e 436 testes offline/43arquivos passaram. Testes incluem integridade dos doze WebP, orientações/variantes distintas, geometria das âncoras, nenhum caminho sobreposto na Exploração, progresso e recompensas preservados. Falhas intermediárias: referência de teste ao nome antigo atualizada; comparação de ponto flutuante corrigida para tolerância; teste de integridade detectou um arquivo temporariamente vazio e ele foi regenerado da imagem original antes da validação final. SSR precisava de React global como nos testes anteriores. Não houve playtest, screenshot de UI, verificação de FPS nem teste Firebase de staging. Build final passou com o aviso existente de chunks grandes; SHA256 dos doze assets no pacote confere com o manifest.

Prompt comum de arte (built-in imagegen): fundos full-bleed pintados, vista superior 3/4, caminho contínuo entre centros de bordas, cinco clareiras vazias, vegetação/NPCs fora do trajeto, sem números, texto, pet, marcadores ou UI. Variações: floresta com casa na árvore e riacho; riacho com cristais e ponte; casa/jardim com deck, tapete e cottage. Cada orientação foi desenhada separadamente. Estas ilustrações de seletor não adicionam pontes interativas ou colisões aos níveis jogáveis.

## Publicação concluída
Produto 1.14.3 / Sites 69. GitHub código f79dc56998a18d1c07a6063fb4a3e32983703670. Sites source 09949f2ebd91e39bc692dbc370ecb382ed88c69f; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_3f197a3889c88191a10efcb134233f7d; deployment appgdep_6ad44550b638819180db7141fce6eb44; status succeeded. URL https://meupet.aquimeusite.chatgpt.site. Autorização explícita de David para publicar e testar no dispositivo; revisão visual de UI e partidas permanecem pendentes. Não houve alteração de conta ou save real.
