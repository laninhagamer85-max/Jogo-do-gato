# 1.45.2 — Recortes de equipamentos e oficina compacta

Pedido e evidência: Screenshot_20261024-043322_Meu Pet.png, mostrado pelo usuário; machados cristal/lendário exibiam fragmentos das linhas adjacentes.

Causa: retângulos alpha das linhas sobrepostas incluíam cantos das outras ferramentas. Solução no renderizador, sem redesenhar ou modificar o atlas: componentes alpha existentes (20 silhuetas >5000pixels), envoltória com margem2pixels e metadados percentuais de clip. Verificação geométrica de todos20 recortes encontrou zero pixels de outros componentes principais dentro de cada clip. Ícones CSS usam polygon; Canvas usa o mesmo limite no desenho de armas e coleta. Mantida proporção1.45.1.

Oficina: cards104px retrato/96px paisagem, texto de até2linhas (descrição completa ao selecionar), ícones48px, resumo inicial menor, descrição e ingredientes próximos, quadro de montagem125px. Selo circular roxo no topo direito mostra nível de personagem necessário para desbloquear a receita/material; aria-label e title explicitam essa distinção do nível de melhoria da ferramenta. Selo também no catálogo e itens fabricados da aba Equipar. Cabeçalho tem fundo para não sobrepor o texto ao rolar.

Validação: TypeScript aprovado e20 testes pertinentes aprovados (EquipmentTiers, HeldPose, EquipmentInventory). Preview oficial844×390 e390×844: seleção de machado cristal e lendário, recortes limpos em cards e quadro de receita, níveis45/60 visíveis. Sem saves reais alterados. A inspeção não equivale a teste de todos os equipamentos em combate prolongado. Evidência docs/evolution/evidence/2026-10-24-clean-equipment.jpg.

Referência técnica consultada nesta sessão: MDN drawImage e Using images (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage ; https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images). Técnica: separar retângulo de amostragem da silhueta de clipping, manter a razão do sprite e reutilizar os metadados entre interface e mundo.

Rollback: produto1.45.1 / Site142; source ae901b6985cd26f4ea106e0dc79ceb11e55c16bf. GitHub base85a446da2ee2271e3b321226206a9356a0b57eb0. Publicação pendente.
