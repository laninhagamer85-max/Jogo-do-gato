# Aventura 1.15.0 — mapa contínuo com pegadas

Problema: marcadores em linhas artificiais não seguiam o caminho da arte. Solução: 100 coordenadas traçadas sobre os pisos, escadas e pontes de uma única ilustração original, com pegadas discretas entre fases. Dez mundos, IDs e recompensas existentes preservados. Estrelas, cadeados e fase atual são UI dinâmica, sem alterar saves.

Navegação: esta arte é vertical; ambos os formatos de celular permitem arraste nos dois eixos e recentralização em Meu progresso. Não representa ainda um novo panorama com avanço para a direita. Botões de 44px, distância mínima 55.79px. Nenhuma expansão de jogabilidade além das 100 fases existentes.

Verificação: TypeScript, 23 testes dos mapas e build passaram (avisos de chunks já existentes). Preview local indisponível; publicação explicitamente pedida pelo usuário para teste, QA cloud após deploy. Não houve jogo completo nas 100 fases nem alteração de saves reais.

Pesquisa técnica em 18/10/2026: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox (coordenadas compartilhadas entre arte e marcadores); https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action (pan-x pan-y). Fundo gerado original, não reprodução de personagens da referência.

Rollback: Sites75, produto1.14.9, commit Sites7a452de31c315cfa13f4aac1f26792f09e901887. Escopo somente mapa da Aventura; Exploração preservada.

Status: preparando publicação.

## Correção observada no navegador — 1.15.1
A publicação 1.15.0 revelou centralização com dimensões provisórias: layout memoizado não repetia o efeito após ResizeObserver. Efeito agora depende da largura e altura medidas; contempla abertura e rotação. Verificação cloud prossegue após correção.

## Publicação e QA final
Produto 1.15.1, Sites 77. Fonte Sites c6e46e41fdab4443976ca4a573fc332ea1c890b0; código GitHub 89fc13338754af8125c4626f258da8d40cff0443. Versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_66bbd0af76d081919bbdcf3d2565fa14; deployment appgdep_6ad4cd27d8c881919d8c8df9272b9c94, succeeded. URL https://meupet.aquimeusite.chatgpt.site.

Inspeção real cloud em iframe 844×390 e390×844: após correção, fase atual contida na viewport do mapa na abertura e mudança de orientação. Prévia da fase100 exibe Lanterna da Festa e Festeiro, jogar bloqueado. Fase1 abriu, pausou e retornou sem completar nem desbloquear fases. Não equivale a testar fisicamente telefone ou jogar100fases.

Limitação explícita: a arte continua vertical em paisagem, com arraste nos dois eixos; retrato mostra parte das curvas e exige deslocamento lateral. Arte gerada em724×2172, WebP812958bytes. Progresso preservado, Exploração não alterada. Capturas: meupet-1151-vertical.jpg / meupet-1151-horizontal.jpg. Próximo: avaliação do usuário no celular.
