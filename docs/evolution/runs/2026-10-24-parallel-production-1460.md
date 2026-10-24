# 1.46.0 — Receitas organizadas e produção simultânea

Pedido: ordenar oficina/fornalha por nível, cartões menores, rolar até ingredientes ao selecionar, arrastar e toque direto, confeccionar mais de um item nas construções.

## Implementação
- Filtros Todas/Ferramentas/Armas/Fornalha/Poções e poderes/Construções; ordem crescente de nível e nome pt-BR. Cards82×92px. Seleção faz scrollIntoView suave até a receita, respeitando reduced-motion.
- Toque no ingrediente preenche diretamente a quantidade exigida disponível no quadro. Arraste usa Pointer Capture, verifica destino por coordenadas atuais, cancela sem inserir fora da área, evita clique duplicado ao terminar drag; ghost em Popover top layer para manter alinhamento no dialog com blur; autoscroll perto das bordas. Quadro continua aceitando o fluxo antigo selecionar/depositar, sempre limitado à receita.
- Até3 trabalhos por construção física (Oficina/fornalha compartilham3; Poções3; Baú até3 sujeitos a exclusividade). Oficina e poções trabalham em paralelo, cada receita30s com sua barra. O painel fica aberto ao iniciar para permitir outra produção. Lista recolhível e retirada individual. Receitas repetíveis de materiais/consumíveis podem ocupar os3 espaços. Equipamento, melhoria e construção de mesmo alvo não duplicam enquanto em produção.
- job permanece primeiro trabalho para compatibilidade; jobs conserva demais, com IDs únicos monotônicos. Materiais debitados exatamente uma vez ao iniciar; capacidade futura de saída considera trabalhos pendentes. Retirada por jobId e rejeição de repetição; auto-claim procura qualquer pronto ao retornar ao abrigo. Salvamento/portais conservam todos os trabalhos e deadlines de relógio real. Campanha15 impede clientes anteriores de descartarem os trabalhos adicionais. Save antigo com job único é migrado.
- Construções pendentes e barras de atividade consultam o trabalho da construção correspondente; não confundir a produção de outra casa com a construção.

## Testes
TypeScript e845 testes em90 arquivos aprovados, excluídos Firebase dependentes de infraestrutura. Novos testes cobrem3 espaços, prédios independentes, reservas, reload/portal, retirada fora de ordem, nenhum prêmio duplicado, falha mantendo outro trabalho, bloqueio de equipamento duplicado e ordenação. Mock de Canvas atualizado para métodos de clipping introduzidos na1.45.2; não se removeu o clipping real.

Preview oficial844×390 e390×844, entrada por fixture Acampamento construído; sem saves de conta real. Drag real por ponteiro (mouse na viewport móvel) Madeira→quadro mudou0/2 para2/2 e habilitou Fabricar. Toque/clique direto iniciou segunda produção. Poções iniciou fruto enquanto dois carvões existiam; retirada individual dos dois resultados confirmou a separação. No retrato, dois ingredientes de cobre/carvão iniciaram refino; segundo cobre criou outro timer independente, ambos visíveis. Evidência docs/evolution/evidence/2026-10-24-parallel-production.jpg. Teste não equivale a hardware touch Android/iOS nem a longas sessões.

Referências técnicas2026-10-24: https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture ; https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView . Técnicas: captura até pointerup, posicionamento por clientX/Y, scroll dos ancestrais e respeito a movimento reduzido.

Rollback: produto1.45.2 / Site143; source644408684fa6b7c6568f2fcef973a6af44af03dd. GitHub basee3594deba414fccfe0c29363a2d3f13e86fdf7aa. Publicação pendente.
