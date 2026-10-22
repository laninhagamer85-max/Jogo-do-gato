# 1.38.0 — Vida dos povoados e navegação

Estado: publicada — 1.38.0, Sites 128.

## Escopo
- Aldeões 16% maiores, poses laterais estáveis e espelhadas; oito novos cidadãos pintados (crianças, idosos, nobres e comerciantes). As fases de crescimento revelam novos perfis. Famílias não duelam.
- Retorno ao interior das casas, desaparecendo na entrada; conversa compacta sobre o aldeão, encerra por inatividade de 20 segundos; comércio em grade e painéis verdes translúcidos.
- Cada passagem entre salas escolhe manhã/tarde/noite com semente e contador persistidos. Na mesma sala, avança de período a cada 30 minutos de jogo ativo. Relógio visual independente dos recursos, presentes e economia; pausas não contam. Interior do castelo conserva iluminação própria.
- Noite com área iluminada de dez unidades ao redor do personagem e lampião pintado dos moradores que circulam à noite.
- Primeiro Lendário: nível 6, sala inicial concluída, 60 fibras e 20 âmbar; nenhum cristal ou seiva. Lendários já adquiridos preservados.
- Piso das vilas: removido o polígono isolado da Vila 1; textura do bioma com máscara de desgaste irregular, bordas suaves e entradas unidas às trilhas em todos os núcleos. Cidades recebem pedra no centro. Máscaras pré-calculadas em cache, sob casas e personagens.
- Câmera externa afasta até 0,25. Mapa completo amplia de 1 a 4 vezes, arrasta, centraliza no jogador e restaura a visão geral. Lupa e atalhos podem ser recolhidos. Inspeção pausa a partida.

Casa do jogador ampliada de 1,55 para 3,6 unidades de altura, oficina 3,5, casa de poções 3,3 e abrigo do baú 2,8; arte pintada original por bioma preservada. Bases novas usam maior espaçamento e proteção; seleção e construção acompanham o tamanho. Posições personalizadas antigas são preservadas.

## Desempenho
Reproduzida cidade com quadro inicial médio de 750,08 ms (amostra fria de sete desenhos). Atlas grandes excediam o cache de 12 milhões de pixels, recolorindo continuamente. Cidadãos/mercados agora usam recortes pintados em cache e o teto de 20 milhões comporta o conjunto completo do outono; teste de regressão verifica reutilização. Trilhas compiladas em Path2D e recortes fora da câmera evitam redesenho inútil. Rotas limitadas a duas novas buscas por atualização. Resumos de cidades a cada cinco segundos; salvamento periódico também a cada cinco segundos, mantendo salvamentos imediatos de eventos importantes. Após correção, amostra da mesma cidade afastada: média 30,59 ms, p95 54,70 ms em 19 desenhos; outra amostra noturna média 24,30 ms, p95 48,40 ms. São tempos de processamento no navegador da cloud, não FPS garantido em dispositivos físicos. Custo de primeira abertura do mapa completo ainda pode ser maior, pois percorre a região toda; zoom/pan usam a imagem já desenhada.

Corrigido também Canvas apagando ao redimensionar na inspeção pausada: dimensões de layout sem transformação, buffer só redimensiona quando necessário e invalida desenho.

## Recursos
Novos WebPs originais gerados com ImageGen, transparência preservada: village/families-v1.webp, citizens-v1.webp e lantern-v1.webp. Manifesto e recortes versionados. Briefs: moradores humanos de vila medieval no estilo ilustrado do jogo, quatro personagens por atlas, seis poses (frente, costas e lateral), sem texto; lampião de mão separado. Nenhuma imagem de terceiros incorporada.

## Referências técnicas
Consultadas em 2026-10-22: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter e https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation — painéis com desfoque e iluminação por máscara separada. Sem dependências novas.

## Verificação
Typecheck; testes de relógio, preservação, receita e cache; suíte de campanha. QA em partida isolada, sem saves reais: cidade, noite e mapa em celular 390×844 e 844×390. Suíte completa: 785 testes passaram e um teste excedeu o tempo durante concorrência com a inspeção gráfica; rerun isolado de progressão e trilhas: 81 testes passaram, sem aumentar timeout. Testes novos de cache/relógio: 11 passaram. Sem teste em telefone físico. Primeira geração de caminhos e mapa completo pode custar aproximadamente 1–2 segundos a frio; fluxo normal reutiliza geometria e máscaras. Demais IDs serão registrados após conclusão.

Rollback: versão pública anterior 1.37.0, deployment appgdep_6ad9fbf0e85081919f578efbd0c466b6, fonte 0f4d54727984096e5fc8fe44d6c292012a141b3d.

## Resultado final
Build oficial 41,81s e typecheck aprovados. A última suíte completa teve 787 testes aprovados e uma regressão de colocação ao mover a casa; o espaçamento padrão foi corrigido. Rerun de base, construção e progressão: 92 testes aprovados, incluindo 32 acessos às construções e a perseguição do inimigo. Não foram aumentados timeouts. Quando a casa ampliada encobre o personagem, o telhado fica transparente; aplica-se também a oficina/baú/poções.

GitHub: 2f61920a253f94fab818c5ef04060a077200ccfb. Fonte publicada: 0f558ed18fcd6276f50601c09d105a2462770385. Versão salva: appgprj_6ac40994d8d881919d46203a60801e46~appgver_7f29bd0197848191894d500228aa40dc. Deployment: appgdep_6ada0f2999688191a1e3995f56b984e8, succeeded. URL: https://meupet.aquimeusite.chatgpt.site.

Provas: ../proofs/2026-10-22-base.jpg e ../proofs/2026-10-22-map-horizontal.jpg. Consulta do mapa usa ampliação da imagem já desenhada: a nitidez dos elementos pequenos é limitada no zoom máximo, sem criação de caminho automático por toque. Arraste implementado com captura de ponteiro; ampliação, centralização e recolhimento verificados no navegador.
