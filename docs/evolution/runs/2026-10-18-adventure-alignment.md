# Aventura1.15.3 — alinhamento da trilha vertical

Solicitação: conferir vertical e horizontal e fazer pequeno ajuste de alinhamento no retrato. Inspeção real da1.15.2 em390×844 e844×390. Encontrado: marcadores nas curvas do primeiro mundo deslocados para cama/estantes; largura/altura incluíam10px da barra nativa e recortavam o eixo transversal.

Mudança: retrace manual das curvas verticais de cada painel sobre o piso pintado, amostragem por comprimento do percurso mantém10 níveis por mundo e ordem1..100. Patinhas e botões compartilham o centro da mesma curva. Medição da viewport por clientWidth/clientHeight, excluindo barras. Panorama horizontal e progressão para a direita preservados.

Verificação: TypeScript e24 testes de mapas passaram. Novo traçado do primeiro mundo conferido em composição estática interna (não é teste de navegador). Browser antes: perfil local Nino, sem completar/desbloquear fases; login pelo formulário seguro. Browser depois/publicação pendentes. Nenhuma alteração em saves, contas, física ou Exploração.

Pesquisa técnica pertinente já usada nesta mesma tarefa: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio; dimensões visuais mantidas. Medição clientWidth/clientHeight evita incluir área da barra. Nenhum novo asset ou imagegen nesta correção.

Rollback: produto1.15.2, Sites78, fonte da555e383efe04f54ed3203289193f42201e697b. Fonte foi recuperada do mesmo repositório Sites após limpeza automática da área temporária; assets conferidos por hash com os blobs completos do GitHub.

## Publicação e conferência final
Produto1.15.3, Sites79, fonte7cc32d3abc935038e95c81ffcd69c15d225e911f, código GitHub47d6e6b22200922c1aeb2f7f98fdf4c4c86facc3. Versãoappgprj_6ac40994d8d881919d46203a60801e46~appgver_336e6cb901e48191954923c714d47418, deploymentappgdep_6ad4f93d3c1c81918b649f392214193b, succeeded. URLhttps://meupet.aquimeusite.chatgpt.site.

Browser real cloud:390×844 vertical clientWidth341/scrollWidth341;844×390 horizontal clientHeight214/scrollHeight214. Nenhum overflow no eixo transversal. Marcadores e patinhas do primeiro mundo conferidos sobre o piso após retrace; fase15 exibe Banquinho Cogumelo e permanece bloqueada, sem alterar progresso. Rotação e Meu progresso conferidos. Apenas inspeção de UI; não100partidas nem teste físico de telefone.

Capturas em docs/evolution/screenshots/2026-10-18-1153-vertical.jpg e2026-10-18-1153-horizontal.jpg. Uma captura intermediária do jardim expirou; seletores e prêmio foram inspecionados, mas não alegamos validação visual detalhada de todos os100marcadores no navegador. Sem novos assets de cenário neste ciclo.

Fontes adicionais: https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth e https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight, consultadas18/10/2026 para excluir barras da área útil.

Estado: publicado para avaliação do usuário. Não publicar novamente apenas por este registro.
