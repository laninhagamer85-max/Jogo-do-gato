# Correção visual da Exploração — cenário único, golpe e inventário
Data: 15/10/2026 (America/Sao_Paulo). Produto alvo 1.9.9.
David forneceu duas capturas da 1.9.8 e duas referências de inventário. As quatro foram inspecionadas. Capturas revelaram regressões: fundo enquadrado duplicado, vegetação em esferas verdes e uma pata procedural atravessando o rosto.

## Implementado
- Removidos o fundo fixo de tela e a segunda imagem do mapa sobreposta. Agora há UM plano de chão ancorado nas coordenadas do mundo, seguindo a câmera. Textura original de grama/musgo, sem moldura; repetição espelhada nas bordas para evitar emendas duras. Não é o mesmo cenário completo desenhado duas vezes. Cache de textura 768×768 para limitar memória.
- Substituídas as esferas por atlas original de pedras com musgo, samambaias, troncos e arbustos de folhas. Placa rústica no marco e tronco no bloqueio substituem retângulos chapados. Objetos ordenados por apoio no chão em relação ao pet/inimigos. Colisores lógicos conservadores mantidos, não se declara alinhamento visual validado em browser.
- Removido o membro artificial desenhado sobre o rosto. O golpe mantém a arte/cores/acessórios do pet, avanço/retorno e rastro curto à frente do corpo. Não foi gerada animação de patada inédita quadro a quadro; continua composição com o atlas existente, sem braço adicional.
- Mochila como painel lateral com backdrop transparente: cenário continua visível e combate fica pausado. Grade de slots quadrados, quantidade, seleção, categorias, descrição, ação de usar/equipar e fechar fixo no topo. Só itens atuais; espaços vazios são visuais e não introduzem limite de capacidade. Cartas futuras não são fingidas como disponíveis. Referências de terceiros usadas apenas para organização; nenhum ícone/arte delas extraído.
- Direcional extraído para componente compartilhado na sala piloto e nos capítulos de enigmas. Mesma captura de toque, zona neutra e cancelamento; nos enigmas, eixo dominante gera uma direção cardinal, sem mudar a física/regras. Botões de ação em disposição circular, sem transformar enigmas em combate.
- Sem alterações de contas, saves reais, XP/recompensas, replay ou domínio.

## Arte e fontes
Arte original criada pela ferramenta integrada de imagens; inspeção estática das duas imagens realizada. Arquivos/prompts/proveniência e hashes em docs/evolution/woodland-art-v1.json. Chão 1254×1254 RGB; atlas 1536×1024 RGBA, seis elementos. Não foram extraídos materiais de imagens com marca-d'água.
Referências técnicas consultadas em 15/10/2026:
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern — padrão de chão vinculado à câmera, sem fundo de viewport duplicado.
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog — painel modal com pausa/foco e cenário visível por backdrop transparente.

## Testes e limites
TypeScript aprovado. 158 testes offline/23 arquivos aprovados; novos casos de navegação cardinal, mudança do direcional, neutralização e coexistência com tecla física. Build de release aprovado (aviso de chunk grande existente). Entrada Aventura: 101 estados sintéticos aprovados. Paridade conta/atlas: 49 regiões/67 símbolos em fake storage, sem ações de conta real.
Navegador obrigatório control-browser indisponível; não houve servidor ou browser alternativo. Imagens e código inspecionados, porém não se declara playtest da nova revisão. Publicação para revisão de David, conforme autorização reiterada de publicar para testar.

## Publicação e próximos passos
Fonte exata 1.9.8 / Sites 27 recuperada pelo helper oficial: e14c79260fdb91b9f4bf7f004efee95f82ea7df7. Revisão no ramo feat/exploration-combat-pilot-20261015, sem merge/force-push.
Publicação em preparação; rollback 1.9.8 / Sites 27 preservado.
Próximo aceite: fundo único ao mover/zoom, colisão e profundidade dos obstáculos, golpe sem sobreposição no rosto, mochila em retrato/horizontal e direcional dos capítulos.
Depois consolidar arte e contraste dos itens coletáveis; seguir com novos adversários e desafios em uma sala por vez antes de ampliar os capítulos. Sem alegação de 60 salas ou 100 fases testadas.

## Conferência final e publicação
Recorte dos sprites dos inimigos ajustado a partir dos limites alpha inspecionados: pés aproximados ao apoio no chão e barras/títulos acima do corpo. Sem declaração de playtest visual.
TypeScript, 158 testes e build repetidos com sucesso após esse ajuste.
Publicado: 1.9.9 / Sites 28, 15/10/2026 às 13:07:20 (America/Sao_Paulo).
URL: https://meupet.aquimeusite.chatgpt.site/
GitHub código: 9d4d82b537c2fd90e59659e7db46eab926e230fa
Source commit: 87be0e9ba507ec48a97b5f237c0812fae2974250
Versão salva: appgprj_6ac40994d8d881919d46203a60801e46~appgver_a6e84b7735e0819182305e0aa48954e2
Deployment: appgdep_6ad0fa105514819181d600b3f11dc3b2 — succeeded.
Pacote oficial reconstruído por partes para evitar truncamento, gzip validado em duas leituras antes de upload. 354 arquivos e tar normalizado de 86968320 bytes. Um único deploy concluído. Nenhuma partida real alterada. Revisão visual aguarda relatório de David.
