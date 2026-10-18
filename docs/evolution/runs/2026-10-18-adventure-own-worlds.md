# Aventura — cenários próprios por mundo (1.14.7 em revisão)

Pedido: retirar os aspectos de Exploração da trilha da Aventura em celular horizontal e vertical.

Diagnóstico: mundos1/6 usavam placas/junções casa/floresta do módulo Exploração; outros8 repetiam3 vinhetas do mesmo fundo. Substituído somente o renderer decorativo da Aventura por AdventureWorldScenery: uma ilustração original GAME_ASSETS.levels por mundo, gradiente da paleta real da fase, percurso contínuo com10 materiais e patamares por fase. Casa, jardim, feira, telhado, praia, bosque, neve, biblioteca, observatório e festival preservam seus próprios assets. Nenhuma imagem /forest-adventure é renderizada no mapa da Aventura. Não usar TrialScenery, TrailSeams ou NaturalTrail nesse módulo. Exploração permanece no renderer anterior.

As coordenadas e numeração das100fases não mudam;100prêmios e10mascotes continuam reais. Pontas dos percursos encontram o centro da borda de cada mundo, em ambas orientações. Sem novos assets raster, dependências ou mudanças em save/contas/física. CSS limita a imagem a object-fit:contain (não cover), com bordas em máscara radial e sem3repetições. Esta composição é código nativo com arte original existente, não novos mapas pintados.

Pesquisa18/10/2026: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image — máscaras graduais sem recortar por cover; https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio — SVG dimensionado em coordenadas equivalentes à área real. Nenhum asset externo incorporado.

Verificação final: TypeScript,20testes de mapas/3arquivos e build passaram após ajuste de continuidade nas bordas. Aviso de chunks grandes já existente. Necessária inspeção visual real antes de publicação segundo skill evoluir-meu-pet-virtual. SITES_MANAGED_LINUX_CONTAINER=1 e control-browser não disponível: não iniciar servidor alternativo ou contornar preview. Não publicar até validação. Produção permanece1.14.6/Sites72. Rollback fonte82bfe6a17622f7bf7c85487b5447b15d498d54c0, GitHubbase d9d8586d52ce3ed46bd349f774b55de802e57c81.

GitHub implementação:9ef9215a3b042b367f153a4485122c9b2146f36e. Fonte Sites:1aa3ed665eb20b4ee27f38b7e1c86fe383afd303. Não publicar: preview suportado indisponível e verificação visual pendente.

Salva Sites73 (sem deploy):appgprj_6ac40994d8d881919d46203a60801e46~appgver_b13541c710d881919c0383407264fb9f. Produção continua1.14.6/Sites72.
