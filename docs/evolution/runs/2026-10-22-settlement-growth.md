#1.37.0 — Povoados distribuídos e crescimento comunitário

Estado: publicado e confirmado pelo Sites. Base publicada1.36.0, Site nativo125; fonte d190e3e260587aad744fc67acf1133ff00a5bbb6. Inclui as correções de equipamentos/aviso da revisão1.36.1 que não foi publicada separadamente.

## Entrega
-32 salas externas, quatro biomas, dez núcleos separados por sala.40 moradores iniciais por sala (1.280 definições iniciais), crescendo até100 por sala (3.200 definições máximas). Geração determinística e IDs próprios; instanciação e salvamento apenas das populações visitadas. Arte pintada existente reutilizada com variação de paleta por bioma, nomes, papéis, níveis e posições. Não são3.200 sprites exclusivos.
-Povoado:4 moradores por núcleo; vila após8 trabalhos:6; cidade após24:10. Trabalhadores coletam, levam recursos à comunidade, visitam vizinhos e compartilham. Mercados compram/vendem/trocam recursos comuns, mantendo limites de estoque e moedas.
-Cidade transforma duas construções existentes em oficina e casa de cura, conservando suas áreas de colisão. Estações públicas permitem receitas, gastam materiais e aguardam30s; não concedem instalações particulares nem elevam a chance de melhoria gratuitamente. A construção não se expande livremente sobre caminhos: a primeira etapa usa lotes fixos e seguros. Novos estilos de edifícios e profissões adicionais permanecem próximos conteúdos.
-Simulação detalhada somente na sala atual e a até32 unidades do jogador; outras comunidades visitadas recebem resumo a cada30min no retorno, limitado a quatro ciclos por atualização. Não existe simulação permanente no servidor. Sem geração de itens para o jogador no resumo. Crescimento e timestamps são persistidos.
-Mapas completos mostram os dez núcleos, estágio atual e posição do jogador. Trilhas ramificadas passam pelos destinos reais. A proposta visual de novas estradas de pedra/areia apresentada anteriormente não foi aplicada sem a revisão visual solicitada.
-Acesso público temporário às salas31/32 agora é visita separada. Ao sair, o checkpoint e os desbloqueios reais da campanha permanecem; economia e coletados são preservados. Recuperação de salto antigo para31/32 retorna à primeira sala genuinamente inacabada, mantendo salas completas e inventário, sem inventar conquistas.

## Problemas encontrados e corrigidos
-Núcleos próximos interferiam em encontros ou entre si: separadas posições e reservadas clareiras.
-Busca de caminho longa custava demais: A* com heap e limite de expansão nos trajetos longos e nas Nascentes; cache espacial de construções e árvores de colisão. Rotinas não percorrem todas as3.200 definições por frame.
-Nova rota da escada do castelo atravessava uma quina inválida: ligação utiliza os dois pontos reais da escada. Teste percorre até entrar no castelo.
-Moradores novos inicialmente podiam nascer sobre barraca: seleção de posições livres no pátio verifica a mesma colisão do jogador.
-Áreas clicáveis de lojas/aldeões nas31/32 usam a câmera das Nascentes e descartam controles fora da tela.

## Validação
-777 testes aprovados em75 arquivos. Exclusão única: integração FirebaseAdmin que exige credencial externa de staging. Testes verificam portas/rotas em32 salas, crescimento e persistência, moradores de cidade em chão navegável, fabricação pública com gasto/tempo, checkpoint após testes31/32, progressão e portais existentes, duelo sem armas, inventário e limites comerciais.
-TypeScript e build oficial final aprovados (27,20s); pacote inclui o refinamento de nomes.
-Navegador de QA com perfil isolado: cidade no outono horizontal e Nascentes vertical, informações24/24 e10moradores, pedido de recurso comum respondido. Demais inspeções finais registradas antes da publicação.
-Conferência final encontrou sobreposição dos nomes dos moradores em grupos. Apenas o aldeão mais próximo recebe identificação; duelista mantém sua identificação própria. Vila do bosque vertical, vila do rio horizontal e cidades do outono/Nascentes foram inspecionadas; nenhuma escrita em conta real.
-Não foi medido FPS nem testado telefone físico. Não alegar campanha inteira jogada manualmente. Crescimento é local por perfil, não cidade global compartilhada entre contas.

## Referências técnicas consultadas em22/10/2026
-https://docs.godotengine.org/en/stable/classes/class_astar2d.html — grafo2D, custo e estimativa de caminho; técnica implementada no motor Canvas existente, sem migrar para Godot.
-https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame — animação por delta e pausa de abas ocultas; manter trabalho distante resumido, sem depender de frames executando fora da tela.
-As fontes do relatório de empunhadura continuam válidas para âncoras de imagem e timeout descartável.

## Publicação
Pendente. Mesmo Site público e domínio, sem alteração de autenticação, permissões, saves ou infraestrutura. Rollback:1.36.0, versão nativa125, saved_version appgprj_6ac40994d8d881919d46203a60801e46~appgver_752e8f0bb3e88191bd4574ccb5f01f0a.


## Publicação confirmada
Produto1.37.0, Sites127, saved_version appgprj_6ac40994d8d881919d46203a60801e46~appgver_1372c5c67508819195b1a7155efe320c.
Source 0f4d54727984096e5fc8fe44d6c292012a141b3d; GitHub faac2db53baee0c5960c709812b7c83e4e0cc7ff.
Deployment appgdep_6ad9fbf0e85081919f578efbd0c466b6 succeeded, 2026-10-22T12:05:27.618716+00:00. URL: https://meupet.aquimeusite.chatgpt.site.
Versão126 foi apenas salva, sem deploy; a publicação final usa a127. Documentação de revisão independente preservada. Nenhum redeploy para este registro.
