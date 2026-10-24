# 1.45.1 — Proporção de equipamentos na mão

Correção solicitada: armas e ferramentas muito grandes em relação ao personagem após a expansão do catálogo1.45.0.

Causa: novos recortes justos eram esticados para um quadrado e ampliados em1.25×; a diagonal de espadas ultrapassava o corpo. Ferramentas e Coroa também usavam escalas independentes muito grandes.

Mudança: tamanho máximo por família relativo ao mesmo tile/personagem: espada .62, faca .36, arco .66, machado e picareta .64. `heldItemSize` preserva razão da imagem, compartilhado por armas normais, Coroa e ferramentas durante coleta (inclusive aldeões). Flecha reduzida de .62 para .38tile. Mantidas âncoras de mão/rotação, movimento, alcance, dano, níveis, receitas, saves e ícones de seleção. Prévia do equipamento usa o mesmo renderizador do cenário.

Pesquisa técnica 2026-10-24: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage e https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images . Técnica: razão entre dimensões de origem/destino preservada; limite pela maior dimensão, sem esticar PNG para quadrado.

Validação: TypeScript aprovado; 23 testes pertinentes aprovados (HeldPose, Workshop, EquipmentInventory). Preview oficial em844×390 e390×844; espada madeira, giro e demonstração; Coroa equipada e lateral com lâmina para fora; coleta de árvore passou de5/5 para4/5, ferramenta menor junto à mão. Sem erros da aplicação no console; avisos da extensão cloud separados. Não foi medido FPS nem realizado teste prolongado de combate. Evidência docs/evolution/evidence/2026-10-24-equipment-scale.jpg. Conta isolada, sem alterações em saves reais.

Rollback: produto1.45.0 / Site141, source bb937af1a1cd0002c1559631486269b9fa915a56. GitHub base7c77f7ac4021036d7b1434dac8ce85904788dc8f.

Publicação: pendente de retorno oficial.

## Publicado
Produto1.45.1 / Sites142; succeeded.
Source ae901b6985cd26f4ea106e0dc79ceb11e55c16bf
GitHub 54bec73e8e0938ea79f1bf55ca8b63c88bc66eb2
Version appgprj_6ac40994d8d881919d46203a60801e46~appgver_4adcb79600408191bdebcf607ebd161f
Deployment appgdep_6adc5ead58348191a16536460a6050c2
URL https://meupet.aquimeusite.chatgpt.site
TypeScript, build produção e23 testes aprovados. Visual conferido no preview isolado; publicação confirmada pela resposta oficial, sem alegar inspeção de conta de produção.
