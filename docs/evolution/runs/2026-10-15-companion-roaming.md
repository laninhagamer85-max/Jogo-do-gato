# Amigos: passeio independente — candidato 1.9

David pediu completar os movimentos dos pets e depois corrigir os amigos; esclareceu que o amigo deve passear aleatoriamente no cenário, em vez de apenas seguir o pet. Base Sites: 223dbb02ec6a0f6fb8be7ea5b873c2f0fb1586f1, produto 1.8 (contador Sites 18). GitHub: PR9 fix/pet-walk-camera-20261014, head 2d1840de15223de77dc01a654289375e35d324f9. O blob scene.ts das duas fontes é adaa8c61bd8b348252142fe4228af8da4ab7b83e; nenhuma fonte antiga substituída.

Implementado: destinos aleatórios no retângulo de chão visível, velocidade limitada pelo tempo decorrido, pausa de 2–5 segundos entre trajetos, interrupção durante sono e reinicialização do enquadramento ao girar a tela. Removida oscilação vertical e horizontal contínua; sprite e sombra usam o mesmo ponto de apoio. O amigo passeia independentemente do movimento do pet. Sem mudanças de saves, economia, hitbox do pet ou controles. Não há colisão com móveis implementada neste ciclo.

Os seis pets já possuem atlas próprios associados na fonte; isso não constitui validação visual. Não foram geradas novas artes neste ciclo. Amigos ainda usam imagem estática: caminhada com patas, direções e expressões permanece pendente. Não confundir passeio da imagem com ciclo de caminhada final.

Verificação: 109 testes offline em 18 arquivos aprovados, incluindo repouso, chegada sem oscilação, independência de FPS, destino aleatório, pausa e sono. TypeScript aprovado. Build final aprovado, com o aviso existente de chunks grandes. Código confirmado no GitHub pelo commit f462070cd2653105dacacb499399ac9a1e46948f. Navegador control-browser não disponível no ambiente gerenciado: nenhuma inspeção dinâmica, nenhum preview improvisado e nenhuma publicação. Critério visual da skill exige inspeção antes de publicar.

Pesquisa técnica em 15/10/2026: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame — usar tempo decorrido para manter a velocidade entre telas de frequências diferentes; limitar o salto ao retomar uma aba.

Código em ramo separado fix/companion-room-roaming-20261015, sem merge nem force-push. Próximos passos: validar movimento em navegador suportado nos tamanhos retrato/paisagem, completar animação própria de Mimi/Tico sem mudar suas identidades e validar os seis pets. Depois retomar organização vertical e indicadores; expansão da Expedição permanece posterior. Rotina diária reativada em 15/10 e prioridades atualizadas, sem criar duplicata.

## Publicação para teste autorizada
David pediu explicitamente publicar para verificar no celular e enviar relatório, após ser informado das patas e QA visual pendentes. Esta instrução substitui o gate de navegador local para esta revisão. Produto 1.9; contador Sites 19 previsto. Preservada 1.8 para retorno: appgprj_6ac40994d8d881919d46203a60801e46~appgver_dfab45f0ae6c819192379a6d3c4228b4. Não afirmar animação completa.

## Resultado confirmado
Produto 1.9 publicado. Sites versão 19, appgprj_6ac40994d8d881919d46203a60801e46~appgver_d469d3c764f881919c516942f2b54464; deployment appgdep_6ad04bb9b3bc8191b6c6d3cd9b34fb29, status succeeded, 2026-10-15T03:43:07.835473+00:00. Fonte 604b4e95d0c18f4ea7fdfe8e51c9d93f19f561bb. URL https://meupet.aquimeusite.chatgpt.site. TypeScript e build finais aprovados. 109 testes offline aprovados. QA visual não executada; David fará a revisão móvel conforme pedido explícito. Animação das patas continua pendente. Nenhum merge/force-push ou alteração de saves.
