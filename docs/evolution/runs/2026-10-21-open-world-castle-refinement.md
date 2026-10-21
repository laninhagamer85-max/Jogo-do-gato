# Exploração contínua e ajustes do castelo — 1.29.0

## Alterações

- Portas internas usam a mesma animação de luz e partículas da entrada externa, com paleta azul-violeta. Não acrescentam arcos.
- Colisão circular contínua contra arestas dos obstáculos; oito amostras do apoio contra o piso. Bases de colunas e vasos bloqueadas. Navegação por toque no castelo aproxima cada ponto com tolerância de0,015unidade, evitando cortar os cantos dos canteiros.
- Jardim: fonte acompanha a borda real e canteiros possuem recortes curvos, liberando o passeio central. Corredores laterais e biblioteca mantêm portas alcançáveis.
- Escadas das salas31/32 reassentadas com sobreposição no patamar. Escada adicional de pedra conecta o chão ao portão do castelo; imagem, colisão, altura e rota compartilham a transformação uniforme. Saída retorna à base segura.
- As32salas externas passam a permitir caminhada além do antigo círculo, com terreno em blocos e grupos determinísticos de vegetação conforme o bioma. Câmera acompanha sem muro invisível; mapa geral inclui o jogador distante. Conteúdo de missões/NPCs existente preservado.
- Grafo de portais liga salas consecutivas para ida e volta, incluindo fronteiras dos capítulos. Só destinos desbloqueados são acessíveis. Estado local, coleta, desafios e inimigos de cada sala persistem; inventário global não é reabastecido ao retornar. Não libera novos capítulos ou desafios artificialmente.

## Verificação e limites

TypeScript aprovado. Suíte de598testes/60arquivos cobriu as52portas internas, as31ligações externas nos dois sentidos, migração de saves, inventário, bloqueio de destinos e acesso ao castelo pela escada usando movimento real do motor. Uma execução sob carga teve timeout no teste existente de cache de terreno; repetição isolada aprovada (9 testes), registrada no log129-timeout-recheck.log. Integração Firebase Admin excluída por exigir credenciais de staging.

Navegador com viewport844×390: personagem percorreu a nova escada. Viewport390×844: jardim, circulação lateral da fonte e portais violetas inspecionados. As19salas internas possuem cobertura automática de passagem; não foram jogadas todas manualmente em dispositivo físico. Exportação da captura final do navegador excedeu o tempo limite; inspeções anteriores na sessão foram concluídas. Não há medição de FPS em aparelho físico.

## Referências técnicas consultadas em21/10/2026

- https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection — apoio físico simples e testes de colisão.
- https://docs.mapeditor.org/en/stable/manual/objects/ — polígonos e pontos de ligação independentes da arte.

Sem novos assets: reutiliza as imagens fornecidas do castelo e o kit original já publicado. Rollback: produto1.28.0, Sites113. Publicação concluída.

## Publicação confirmada

- Site: https://meupet.aquimeusite.chatgpt.site
- Fonte: ba9ea5dc02953074c32324cea402076bdc5d5c9a
- GitHub: 182175e626923a0b8cbffa7bfad94f2a9f120b68
- Sites: 114
- Versão salva: appgprj_6ac40994d8d881919d46203a60801e46~appgver_5e15e33441d881918589c2db8d5119f2
- Deploy: appgdep_6ad8879f9b508191b709462cea068603 — succeeded
