# Correções do teste do usuário — v16 em preparação

David testou v15 com gato preto e relatou fragmento vizinho do PNG na Aventura horizontal, ponta da cauda, flutuação e ausência de orientação vertical/diagonal na Minha Casa. Pediu reduzir levemente o pet da Aventura. Autorização anterior: publicar revisão para teste visual do próprio usuário, sem gate de navegador prévio. Nenhuma validação visual local alegada.

## Base e implementação
Base publicada v15 / Sites e5070490c14c3d354c834f607c0438e64141346d / versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_af6642d34c4081918f211308ba287fae / deployment appgdep_6ad01353da7481919d96b2b91c618d23 (succeeded). V15 permanece rollback até próxima publicação.

- Processamento em memória de atlas: margem ao redor da divisão nominal recupera partes que atravessam a grade; componentes alfa desconectados são excluídos, retendo a região principal. Contorno diagonal usa conectividade de oito vizinhos para preservar cauda. Cache por imagem; fonte PNG original preservada.
- Todos os quadros usam escala comum e linha de apoio em 252/256; isso alinha contato no chão sem esticar cada frame independentemente.
- Aventura: desenho do piloto 15% menor em repouso e movimento, ponto de apoio preservado. Hitbox/física inalteradas, exigindo verificar percepção de colisão no teste do usuário.
- Exploração: alinhamento do desenho caminhando com a sombra no chão.
- Minha Casa: DynamicTexture recebe atlas normalizado, seleção de linha por direção real vertical/horizontal e perspectiva para diagonal para baixo. Direções superiores diagonais usam vista de costas mais próxima, espelhada; NÃO há nova arte diagonal superior exclusiva. Evita trocar a identidade da variante.
- Carregamento assíncrono invalida callbacks antigos ao mudar de perfil ou destruir cena; evita substituir textura do pet errado.

## Verificação e limites
92 testes offline passaram, TypeScript passou. Novos testes: remoção de fragmentos desconectados, preservação de cauda diagonal conectada, frame vazio e orientação nas oito direções. Análise de componentes do atlas preto original encontrou fragmentos separados por quadro (até milhares de pixels), compatível com a queixa do usuário. Isso não é playtest ou aprovação do resultado visual.

Build aprovado com aviso existente de chunks grandes. Navegador suportado de preview indisponível; sem teste visual local. Firebase staging sem credencial, sem integração autenticada. Nenhum save real alterado. Usuário fará inspeção de recortes, cauda, contato das patas/sombra, tamanho percebido, direção e horizontal/retrato após publicação autorizada.

Fonte de técnica: MDN Pointer Events e Canvas drawImage/getImageData; mudanças são tratamento de sprites na engine, não edição destrutiva das imagens originais. Atlas preto e prata gerados pela ferramenta integrada com arte original do projeto como referência.

## Publicação confirmada
V16 publicada em 14/10/2026 às 21:04:22 America/Sao_Paulo. Status succeeded. Site: https://meupet.aquimeusite.chatgpt.site . Commit Sites 325379f31e138270246d7e26ed80aaf059a76673; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_b7d8ac1804588191aa00c7a123247c13; deployment appgdep_6ad0187286f881918c810136654dadda. GitHub 726777ced125823f38a18f37785814bfb166d98f no PR9 sem merge. Rollback v15 preservado. Resultado da inspeção visual do usuário ainda pendente; não declarar movimento/recorte aprovados em aparelho real.

Fontes primárias consultadas: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData e https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage — leitura de alfa, limpeza e recorte do sprite em memória.
