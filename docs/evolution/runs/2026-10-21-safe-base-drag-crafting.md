# 1.33.0 — Base segura e fabricação por arraste

Data: 2026-10-21, America/Sao_Paulo. Estado: validação concluída, empacotamento pendente.

Casa, baú, oficina e casa de poções separados no cenário exterior. Arte original pintada em quatro biomas. Instalações construídas acompanham o jogador entre as salas; posição por sala preservada. Organizar construções permite arraste e alternativa por botões. Mover a casa move o conjunto, mantendo a proteção. Colocação rejeita água, obstáculos, missões e sobreposição.

Baú com categorias e grades separadas, transferência de materiais, cura, raros e armas sem duplicar equipamento. Oficina com catálogo, ingredientes arrastáveis, confirmação antes de gastar e produção de 30 segundos. Poções e cartas/poderes desbloqueados podem receber melhorias. Novos e antigos jogadores recebem ferramentas fracas sem perder ferramentas superiores. CampaignVersion10 impede clientes antigos de sobrescrever os novos campos.

Pesquisa técnica: MDN Pointer events, https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events e https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture (consultados em 2026-10-21). Aplicação: captura de ponteiro, cancelamento seguro, toque e alternativa por teclado.

Navegador real em perfil isolado: 844x390 e390x844. Abertura do baú pelo cenário, guardar/retirar espada, guardar madeira, arraste de construção com confirmação, arraste de ingredientes e fabricação de carvão com retirada após30s. Evidência: ../evidence/meupet-133-bau-vertical.jpg. Não foram alterados saves reais.

Limites: sem teste físico de celular nem campanha completa; interiores do castelo mantêm sua composição atual. Inventários/XP separados por lendário e evolução visual da casa ficam para outro ciclo. Firebase integração depende de credencial de staging ausente; autenticação não mudou.

Rollback: versão1.32.0, Site versão118, deployment appgdep_6ad8e00deefc81918d9a6c0d0bfe58c8. Fonte base4d932f48482a0f2bff7c176e27cb34adc98fda2b; GitHub basec99e4f5ce3633be3db546b597c0e77e8f2ce55f7. Publicação será registrada após sucesso nativo.

Validação final: 658 testes passaram em65 arquivos; integração Firebase excluída por falta de staging.
