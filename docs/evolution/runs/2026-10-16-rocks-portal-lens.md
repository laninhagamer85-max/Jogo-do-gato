# Pedras, portal e lupa circular — 1.9.35

Base publicada: 1.9.34 / Sites 53 / aec0e87bfb11056203e92311d9682c77c0b34f0c. Pedido explícito de David: corrigir sobreposição do pet nas pedras, melhorar ângulo/nitidez/brilho do portal, distribuir vegetação, preencher minimapa em estilo lupa e publicar para testar. Refinamento: somente parte circular, SEM CABO.

Capturas analisadas: Screenshot_20261016-122030_Meu Pet.png (pet sobre pedra perto do abrigo) e Screenshot_20261016-123824_Meu Pet.png (portal frontal e minimapa retangular). Não foram editados saves reais.

## Implementação
- Colisão elíptica nos apoios de todas as pedras/troncos das antigas bordas, derivada das dimensões dos props desenhados. pilotWalkable, movimento, rotas por toque, inimigos e reposicionamento de save usam a mesma regra. Folhagem baixa continua atravessável. Profundidade dos sprites continua ordenada pelo apoio.
- Nova arte de portal em perspectiva elevada 3/4 com madeira/pedras/musgo, largura 1.95 unidades. Arco participa da ordenação por profundidade; luz no chão e interior, 12 partículas suaves de tamanho maior, movimento reduzido estático. Gatilho/objetivos/recompensas anteriores preservados.
- Vegetação determinística em grupos esparsos por toda a clareira, com afastamento das plantas existentes e respiro em abrigo, saídas e itens. Sem tocar no gramado aprovado da 1.9.32.
- Lupa apenas circular: terreno e props reais preenchem a abertura; projeção local norte para cima segue o pet, raio 6 unidades. Descobertas mantidas, regiões novas escuras, sem grade/retângulo vetorial. Pet vermelho, itens/objetivos/inimigos próximos. Moldura pintada de madeira/latão, sem cabo.
- Portal de floresta implementado; variantes de gelo/deserto discutidas com David são planejamento para os respectivos futuros biomas, não assets publicados neste ciclo.

## Verificação
TypeScript e 205 testes em 25 arquivos de game aprovados. Dez novos casos cobrem cada apoio de pedra, movimento em 90 frames em direção à pedra do abrigo, migração de save com XP/HP/itens intactos, rotas contínuas aos objetivos/quatro direções ampliadas, distribuição de vegetação, projeção e descoberta do minimapa, luz ativa/inativa e redução de movimento do portal. Build aprovado (aviso de chunks grandes preexistente). Navegador control-browser indisponível; nenhuma declaração de gameplay visual/FPS ou conclusão online. Publicação solicitada para revisão no aparelho.

## Arte original
Prompt do portal: editar v1 preservando materiais, aumentar elevação da câmera e yaw 25°, pernas mais baixas, arco espesso e luz interior verde/dourada legível, transparência verdadeira, sem texto/vetor/personagens. Prompt da moldura circular: remover cabo/conector da proposta de lupa, centralizar aro perfeitamente circular de madeira/latão, abertura transparente, sem texto/vetor. Somente as versões finais foram integradas.
[
  {
    "path": "client/public/forest-adventure/woodland-portal-v2.webp",
    "sha256": "679f7f4cc227272395f01ec7e66c288281ffc21f1a9e03e144840dc106d36e48",
    "dimensions": [
      1254,
      1254
    ],
    "origin": "original built-in imagegen RGBA; converted to WebP quality93",
    "rights": "original generated asset, no third-party extraction"
  },
  {
    "path": "client/public/forest-adventure/map-lens-circle-v1.webp",
    "sha256": "8846188f6ce0225a1b1003c0a65b5c448dca4879253c8a6335d9589f2829c1ee",
    "dimensions": [
      1254,
      1254
    ],
    "origin": "original built-in imagegen RGBA; converted to WebP quality93",
    "rights": "original generated asset, no third-party extraction"
  }
]

Referências técnicas já consultadas em 16/10: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection e https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage — colisão por apoios e escala uniforme.

Rollback: versão Sites 53 / produto 1.9.34; preservar publicações posteriores. Próximo: testar perto do abrigo, caminhos por toque, portal ativo, lupa cheia e legibilidade nas duas orientações. Não foram adicionadas novas salas nesta revisão.

Publicação concluída: produto 1.9.35 / Sites 54; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_7b5696b9b4388191a6778bbabb49256e; deployment appgdep_6ad24bbabbf88191b273da926bbbb759; fonte c77279a439922d8feef6327d5fe19c9fb0c65f0b; código GitHub 6d9d4a629b55bef04eea20d0e356c63305dd048c. URL https://meupet.aquimeusite.chatgpt.site. Build e TypeScript aprovados, 205 testes. Gameplay visual e fluidez aguardam usuário.
