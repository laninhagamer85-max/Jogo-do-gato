# Aventura 1.15.0 — mapa contínuo com pegadas

Problema: marcadores em linhas artificiais não seguiam o caminho da arte. Solução: 100 coordenadas traçadas sobre os pisos, escadas e pontes de uma única ilustração original, com pegadas discretas entre fases. Dez mundos, IDs e recompensas existentes preservados. Estrelas, cadeados e fase atual são UI dinâmica, sem alterar saves.

Navegação: esta arte é vertical; ambos os formatos de celular permitem arraste nos dois eixos e recentralização em Meu progresso. Não representa ainda um novo panorama com avanço para a direita. Botões de 44px, distância mínima 55.79px. Nenhuma expansão de jogabilidade além das 100 fases existentes.

Verificação: TypeScript, 23 testes dos mapas e build passaram (avisos de chunks já existentes). Preview local indisponível; publicação explicitamente pedida pelo usuário para teste, QA cloud após deploy. Não houve jogo completo nas 100 fases nem alteração de saves reais.

Pesquisa técnica em 18/10/2026: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox (coordenadas compartilhadas entre arte e marcadores); https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action (pan-x pan-y). Fundo gerado original, não reprodução de personagens da referência.

Rollback: Sites75, produto1.14.9, commit Sites7a452de31c315cfa13f4aac1f26792f09e901887. Escopo somente mapa da Aventura; Exploração preservada.

Status: preparando publicação.
