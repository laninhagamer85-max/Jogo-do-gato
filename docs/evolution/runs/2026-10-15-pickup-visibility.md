# Itens coletáveis legíveis — 15/10/2026

Produto alvo 1.9.13; base pública 1.9.12, Sites 31. Fonte base 0bcabb67a2948eb748c00ec78a594956892ab7a8.

Problema relatado: drops se confundem com a grama. Entrega: apresentação comum para os itens deixados pelos adversários e os pontos de coleta da sala. Base escura circular com borda creme, halo discreto, ícones maiores, quantidade em etiqueta escura e nome do item ao aproximar o gato (menos de 2 unidades). Depois da queda, flutuação suave de até .09 unidade, apenas visual. Sem raio de coleta novo, sem movimento dos dados de posição, sem mudança de drop/economia/inventário. Preferência reduzir movimentos mantém o halo/borda e elimina flutuação/pulsação.

Pesquisa consultada em 15/10/2026: MDN https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient (halo original desenhado em Canvas) e https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion (preferência já lida pelo loop). Nenhuma arte externa incorporada.

Verificação: TypeScript e 181 testes offline em 25 arquivos aprovados. Novas verificações cobrem espera de pouso, destaque estático em reduzir movimentos e amplitude/variação lenta; teste existente comprova que só coleta após a queda e não duplica item no save/reload. Build aprovado com aviso preexistente de chunk; entrada aprovada em 101 estados simulados; paridade aprovada com armazenamento fictício, sem Firebase.

Limites: sem control-browser, nenhum playtest ou inspeção visual real da revisão. Publicação para teste de David, autorizada anteriormente; não declarar aparência aprovada nem fases online concluídas. Preservados dados e identidade do gato. Uma sala piloto, sem expansão automática.

Publicação succeeded, produto 1.9.13 / Sites 32, https://meupet.aquimeusite.chatgpt.site em 15/10/2026 às 14:55:09 America/Sao_Paulo. Fonte Sites 97161b49b816024781d963a579fe317864f6a9ca; GitHub e53621017e79435d25b85e71748856f25109cb05; deployment appgdep_6ad113601aec8191bffe22e676530269. Rollback produto 1.9.12, Sites 31. Próximo: conferir destaque, tamanhos e coleta no aparelho em retrato e horizontal.
