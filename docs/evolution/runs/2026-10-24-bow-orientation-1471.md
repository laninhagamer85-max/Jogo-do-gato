# 1.47.1 — Orientação de arcos em movimento

Estado:publicado com sucesso. Data do usuário:24/10/2026,America/Sao_Paulo.

Pedido:Arco de Soren invertido ao andar; conferir Ayla.

Base:produto1.47.0/Sites146; fonte atual14d139e9e74777297c52beb4962f8c05fd36e9b2. Ramo GitHub review/grass-option3-20261016 em01db862166ca69240ee145e152b05ab28e16004f. Checkout isolado recuperado da fonte remota; a cópia scratch anterior não estava disponível. Helper de abertura completado após bootstrap de fetch raso autenticado em memória; nenhuma credencial persistida. Um arquivo temporário de checkout foi preservado e excluído localmente da sincronização.

## Causa e mudança

O Arco das Brumas tem a curva à esquerda e a corda à direita no desenho original. O marco de mira apontava para a corda, fazendo a frente pintada ficar oposta ao deslocamento. Os arcos dos atlas de materiais têm a mesma diferença, em diagonal. Corrigidos os marcos:signature bow (-X) e tier bow (diagonal inferior esquerda). O arco inicial original possui a curva no lado direito e mantém seu marco. Rotação continua em torno da empunhadura, preservando escala, balanço e âncora na mão.

A espada de Ayla já apontava corretamente para fora; foi verificada em caminhada e ataques sem modificar sua orientação. A correção compartilhada dos arcos vale quando Ayla ou outro Lendário equipa esses itens. Sem alterações em imagens, receitas, atributos, habilidades, níveis ou saves.

Prévia isolada de animação ganhou opção Exclusivo do Lendário para testar o mesmo equipamento nativo usado no cenário.

## Verificação

- TypeScript passou.
-36testes em4arquivos passaram. Regressão usa marcos físicos da curva e da corda independentes dos dados de mira, em8direções×4fases de passo e3proporções. Inclui ponta/pomo da Espada Rubra e variante exclusiva nas verificações de empunhadura.
- Build de produção passou,18,26s.
- Navegador suportado:mesmo renderer do jogo em fixture sem dados reais; Soren/Arco das Brumas andando e atacando nas8direções; Ayla/Espada Rubra andando e atacando; Ayla/arco de ouro andando. Quadros completos e âncora da mão preservados. Prévia1363×936; sem afirmação de teste em aparelho físico ou campanha completa.
- Evidências:docs/evolution/evidence/2026-10-24-soren-bow-walk-1471.jpg e2026-10-24-ayla-gold-bow-1471.jpg.

## Referências aplicadas

https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate —24/10/2026; rotação ao redor da origem deslocada até a mão, com ângulo medido pela frente real do objeto.

https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform —24/10/2026; preservar ordem das transformações e o isolamento save/restore, sem espelhar o corpo ou reorientar outras armas.

## Publicação e rollback

Publicação confirmada:produto1.47.1,Sites147,status succeeded. URL:https://meupet.aquimeusite.chatgpt.site

Versão:appgprj_6ac40994d8d881919d46203a60801e46~appgver_0c805536a7708191b9616d370b70b725

Deployment:appgdep_6add6a6caf108191a34917c083b706dc

Fonte Sites:d66b2e9f3b5ca3d3dc3ade009614c503fa87886c. Registro posterior apenas documental, sem novo deploy. Rollback possível para1.47.0/Sites146 apenas na ausência de publicação posterior; nenhuma mudança de esquema nesta correção. Atualizar registro após sucesso, sem novo deploy documental.

GitHub: cfd0b65403344f92e8e453f1afc5aeea894327c1, sincronizado no ramo de colaboração com lease.
