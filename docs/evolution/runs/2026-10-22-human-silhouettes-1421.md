# 1.42.1 — Silhuetas inteiras e identificação dos aldeões
Estado: validado, aguardando publicação. Base1.42.0, Site136, sourcefa7e331e837b3115e79c6b17399666530d692b64. Rollback136.

## Diagnóstico e mudança
A imagem enviada mostra nome/atividade sobrepostos ao aviso de novidade acima do mesmo aldeão. A renderização anterior desenhava esses textos em baselines independentes praticamente iguais. Agora uma única pilha organiza nome, novidade e balão de fala, com espaçamento explícito. Não foi constatado que as duas linhas fossem dois corpos na imagem. Reforçada a deduplicação por ID além da aparência original; teste inclui residentes e comerciantes visitantes nas32 salas.

A correção lateral anterior separava retângulos de pernas e tronco, girando-os em torno de uma cintura fixa. Isso produzia bordas retas/gaps em alguns quadros. Removida a articulação por recortes. Humanos e Lendários desenham uma silhueta completa por quadro, usando os quadros originais de caminhada; esquerda espelha o corpo inteiro, cadência continua ligada ao deslocamento e parado/redução de movimento preservados. Sem geração de novos sprites, sem recolorir roupa, sem mudar armas, combate, colisões ou saves.

Adicionada uma prévia QA-only dos12 desenhos humanos originais ao laboratório de animação para verificar todas as famílias, crianças, idosos, comerciantes, nobres e guardas usando o renderer real.

## Verificação
- TypeScript aprovado;830 testes/86 arquivos aprovados. Integração Firebase staging excluída por credencial ausente, sem alteração de autenticação.
- Teste de desenho rejeita recortes/rotações de fragmentos; sequência lateral usa ambos quadros completos; nomes/falas não compartilham baseline; IDs, nomes e aparências deduplicados nas32 salas incluindo visitantes.
- Navegador suportado: Lyra/Kael nas8 direções e12 humanos em esquerda/direita/parado/frente; silhuetas inteiras observadas. Partida isolada com aviso de novidade em844×390 e390×844, sem nome sobreposto. Não é teste de telefone físico, campanha completa ou medição de FPS.
- Prova:docs/evolution/proofs/2026-10-22-1421-labels.jpg. Build oficial pendente no empacotamento.
- Arquivo parcial de PNG não rastreado encontrado após recuperação do checkout foi preservado fora da fonte, não publicado.

## Referências técnicas consultadas2026-10-22
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage — quadros completos com ancoragem consistente, sem montar retângulos de membros.
- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame — ciclo de prévia com tempo, cancelamento ao desmontar; sem alterar o loop de simulação.

## Publicação
Pendente no mesmo Site, GitHub com lease antes da publicação.
