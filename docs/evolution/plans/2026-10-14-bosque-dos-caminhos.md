# Bosque dos Caminhos — campanha top-down original

**Data:** 14/10/2026 · **Estado:** implementação e QA do protótipo concluídas em branch próprio; aguardando revisão/decisão de integração · **Público:** Meu Pet Virtual, público infantil · **Release atual:** v12.

## Objetivo

Acrescentar ao jogo existente uma modalidade solo de exploração e puzzles vista de cima. O pet deve caminhar e interagir com animação legível, não parecer congelado. A campanha deve ter progressão e retomada por jogador, preservando o save e o acesso às modalidades existentes.

## Direção aprovada

- Título de trabalho: **Bosque dos Caminhos**. A modalidade fica separada da Aventura lateral de 100 fases, da casa e dos minijogos atuais.
- Campanha com **3 capítulos × 2 salas**; os capítulos desbloqueiam em sequência. A primeira sala ensina; a segunda combina o que foi aprendido. A sala 2 conclui o capítulo e libera o próximo. Capítulos vencidos podem ser rejogados.
- Capítulo 1, **Clareira dos Troncos**: movimento, empurrar tronco, placa de pressão, chave e portão; introdução segura.
- Capítulo 2, **Riacho das Luzinhas**: carregar/posicionar uma prancha para atravessar água, usar uma peça como peso e desviar de sentinelas gentis em patrulha.
- Capítulo 3, **Bosque das Lanternas**: combinar duas chaves/portas, objetos transportáveis e uma patrulha final; saída com celebração simples.
- Sem cronômetro, combate, derrota punitiva, compras, publicidade, placar online ou multiplayer. O contato com guardiões dá aviso visual/sonoro e uma recuperação curta no ponto seguro, sem retirar itens do pet.
- Controles: setas/WASD; ação contextual para interagir/pegar/empurrar; uso separado para posicionar/lançar o objeto carregado; Esc/P para pausar. Em telas touch, D-pad e botões grandes “Ação”/“Usar”. Soltar/cancelar input em pointercancel, perda de foco e troca de orientação.
- Animação top-down própria: repouso respirando, caminhada em quatro direções com passos alternados, giro, empurrar/carregar, susto/recuperação e conclusão. A identidade do personagem selecionado deve ser preservada. Aparência nunca controla colisão.
- Cenários originais de bosque, riacho e clareira noturna; leitura clara de piso, água, obstáculos, placas, portões, chaves e saída. As imagens enviadas servem de clima/paleta, não de spritesheets ou mapas a recortar. Nenhum desenho, mapa, personagem, texto ou áudio de Goof Troop será usado.
- Música ambiente e efeitos originais, suaves, controláveis pelo mute/volume existente e respeitando preferência por movimento reduzido.

## Persistência e privacidade

- Adicionar progresso versionado de campanha ao `GameState` já existente; o fluxo atual o persiste sob a chave local por conta ou pelo save do perfil autenticado. Não criar outra conta, chave de usuário, backend ou armazenamento paralelo.
- Persistir capítulos concluídos, próximo desbloqueio e melhor contagem de ações por capítulo. O estado da sala em andamento volta ao checkpoint seguro ao reabrir; não é preciso serializar posições físicas de guardiões.
- Migração aditiva: saves antigos começam com o capítulo 1 liberado; dados inválidos são normalizados sem apagar o arquivo original; versões futuras são preservadas e não sobrescritas.
- Sem moedas, XP, inventário ou itens de recompensa nesta modalidade; replay não altera a economia. A fixture `/qa-review.html` continua isolada em memória e não acessa conta, save, autenticação ou servidor.

## Arquitetura e verificação

- Manter domínio puro (salas, colisões, ações e progressão) separado de renderização Canvas, entrada React e áudio.
- Colisão baseada em geometria do mapa e AABB do ator, separada da arte. Movimento com delta-time limitado e passos de animação vinculados a movimento real; guardiões com rotas determinísticas.
- Testar cada sala, bloqueio/desbloqueio orgânico, chave/porta, pressão, objetos, reinício, pausa, dano/recuperação e migração. TypeScript, suíte offline, build e `git diff --check`.
- Browser QA no cliente local e fixture isolada, nos viewports 375×667, 375×812, 390×844, 844×390 e 1366×768; testar teclado e toque, rotação, pointercancel, sobreposições, alinhamento entre chão e colisão e console.
- Registrar claramente quais casos foram automatizados e qual percurso foi realmente jogado. A campanha nova não é evidência de teste das 100 fases laterais.

## Fontes e originalidade

- Referência mecânica geral: Ítalo Chianca, “Uma história de aprendizado com a Turma do Pateta”, Jogo Véio, https://jogoveio.com.br/cronica-turma-do-pateta/ (14/10/2026); leitura de ambiente, objetos e quebra-cabeças servem como conceitos gerais, sem reproduzir conteúdo.
- Referência contextual não oficial: transcrição de terceiro do manual Goof Troop, World of Nintendo, https://www.world-of-nintendo.com/manuals/super_nes/goof_troop.shtml (14/10/2026). Não copiar nomes, controles textuais, objetos, mapas, personagens, arte, áudio ou combinações específicas.
- Referências técnicas já consultadas: MDN (detecção de colisão 2D e Pointer Events) e Godot docs (animação de sprites 2D); runtime continua React/TypeScript/Canvas.
- Notas com data e URLs: `../exploration-research-notes-20261014.md` não está dentro do repositório; as URLs/fatos estão reproduzidos neste plano para continuidade.

## Limites de entrega

- Implementação somente na branch `feat/forest-path-chapter1-20261014`, derivada da fonte publicada em v12. Não usar WebDev, não criar outro Site, não mesclar, reescrever ou force-push nos PRs #4–#6, e não publicar. Entregar validações, relatório e PR separado para decisão posterior de integração no Site existente.
