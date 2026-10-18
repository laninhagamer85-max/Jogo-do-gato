# Aventura1.15.3 — alinhamento da trilha vertical

Solicitação: conferir vertical e horizontal e fazer pequeno ajuste de alinhamento no retrato. Inspeção real da1.15.2 em390×844 e844×390. Encontrado: marcadores nas curvas do primeiro mundo deslocados para cama/estantes; largura/altura incluíam10px da barra nativa e recortavam o eixo transversal.

Mudança: retrace manual das curvas verticais de cada painel sobre o piso pintado, amostragem por comprimento do percurso mantém10 níveis por mundo e ordem1..100. Patinhas e botões compartilham o centro da mesma curva. Medição da viewport por clientWidth/clientHeight, excluindo barras. Panorama horizontal e progressão para a direita preservados.

Verificação: TypeScript e24 testes de mapas passaram. Novo traçado do primeiro mundo conferido em composição estática interna (não é teste de navegador). Browser antes: perfil local Nino, sem completar/desbloquear fases; login pelo formulário seguro. Browser depois/publicação pendentes. Nenhuma alteração em saves, contas, física ou Exploração.

Pesquisa técnica pertinente já usada nesta mesma tarefa: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio; dimensões visuais mantidas. Medição clientWidth/clientHeight evita incluir área da barra. Nenhum novo asset ou imagegen nesta correção.

Rollback: produto1.15.2, Sites78, fonte da555e383efe04f54ed3203289193f42201e697b. Fonte foi recuperada do mesmo repositório Sites após limpeza automática da área temporária; assets conferidos por hash com os blobs completos do GitHub.
