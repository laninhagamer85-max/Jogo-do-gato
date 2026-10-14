# Piloto de caminhada e câmera — 14/10/2026

Pedido autorizado: preservar a aparência da v12, caminhar naturalmente em Aventura e Exploração, cenário maior, controles sobrepostos e inspeção por arraste. Base Sites v14 7ab48d7; base GitHub PR8 868fc1a. Sem rollback completo da aplicação.

## Implementado, aguardando validação visual
- Piloto apenas menino-prata: atlas original de 4x4 poses criado pela ferramenta de imagem integrada a partir do arquivo original boy-prata_33684c26.webp. Aventura usa linha lateral durante deslocamento, pose sentada original em repouso; salto usa uma pose fixa, ainda sem sequência dedicada de salto/queda/pouso.
- Exploração usa poses frente/costas/lateral para a variante prata; esquerda espelhada. Fase calculada pelo deslocamento real. Bloqueio/repouso interrompe caminhada; sem desaceleração artificial da fase.
- Outras cinco variantes mantêm renderer anterior até criação e aprovação de suas próprias poses. Nenhuma recoloração automática nem troca de conta/personagem.
- Câmera próxima com piso de 48px/tile e preenchimento do painel. Controles sobrepostos com captura somente pelos botões; mapa recebe arraste fora deles.
- Inspeção por arraste/Ver sala suspende a simulação. Voltar ao pet ou entrada direcional retorna ao acompanhamento. Coordenadas de câmera independentes do puzzle.
- Saída/reinício permanecem protegidos. Não foram adicionadas vidas, economia, novos capítulos ou alterações de save. Esses requisitos continuam no backlog do piloto.

## Arte
Asset: client/public/manus-storage/menino-prata-walk-pilot-v1.png. Gerado como nova arte com referência privada do próprio jogo; não usa Disney/Capcom. Prompt: preservar gato cinza listrado, olhos verdes, boné e coleira ciano e medalha dourada; atlas 4 colunas x 4 linhas com caminhada lateral, frente, costas e lateral em perspectiva; fundo transparente, mesma escala, patas alternadas e sem pose sentada no movimento. A geração foi inspecionada estaticamente; alinhamento durante animação ainda não validado. Não representa aprovação artística definitiva nem cobertura das seis variantes.

## Pesquisa técnica
Consultadas em 14/10/2026: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events (captura/liberação/cancelamento por dedo); https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/pointer-events (overlay permite passagem fora de botões).

## Verificação
TypeScript passou. 87 testes offline passaram, incluindo preenchimento da câmera, foco independente, interrupção da caminhada e seleção de quadros. Integração Firebase não aprovada: credencial de staging ausente. Nenhuma credencial solicitada ou alterada. Build aprovado com aviso existente de chunks grandes. Testes são simulados, não partidas.

Ambiente gerenciado sem control-browser: não iniciar preview nem navegador alternativo. A skill exige inspeção de animação antes de publicar. Sem playtest, vídeo, celular físico ou medições de ergonomia/FPS. Não declarar aprovação em retrato/paisagem. Precisam ser conferidos cortes dos frames, alinhamento das patas, fidelidade à v12, salto, câmera e botões encobrindo objetos, multitouch, arraste e retorno após rotação.

## Continuação
Validar piloto nos viewports exigidos, incluindo tablet, antes de ampliar. Depois: cinco variantes, poses próprias de salto/queda/pouso, três capítulos de dez salas, checkpoint seguro, bônus sem duplicação, cinco vidas separadas por modo e recuperação gratuita por tempo. Preço/intervalo de recuperação ainda não implementados.

Nenhum deploy nesta revisão; v14 permanece no ar. Rollback da fonte: retirar apenas os arquivos deste piloto; não reverter publicação nem saves reais. Rotina recorrente continua pausada.

## Extensão autorizada para Minha Casa
Reutiliza atlas prata no deslocamento já existente por pet:move. Ao chegar ao destino/dormir volta à textura original sentada. Frame por distância, direção horizontal espelhada, sem oscilação de salto na caminhada. Sem movimento automático adicional, sem alteração dos botões/cuidados/economia. Babylon UV, virada, contato no chão e WebGL ainda exigem QA visual. Demais variantes inalteradas.

## Continuação — revisão de segurança da câmera e entrada
- Área útil da câmera desconta altura real dos controles (ResizeObserver) e HUD: o pet e a visão geral ficam acima do overlay, inclusive junto à borda inferior. Canvas permanece ocupando o painel.
- E/F durante inspeção passam pelo mesmo bloqueio das ações de toque, evitando ação pendente inesperada ao retomar. Drag é limpo com blur/pausa.
- Aventura usa deslocamento real para voltar à pose sentada quando o comando segue pressionado na borda.
- Minha Casa não aplica mais reação de salto ao comando de caminhar.
- Novos testes simulados: área útil com rotação/visão geral; fase imóvel em colisão; seleção da imagem sentada na borda com input mantido. TypeScript e 87 testes passaram. Novo build aprovado, com aviso existente de chunks grandes.
- Navegador suportado continua ausente; sem preview alternativo ou publicação. Não ampliar conteúdo antes do aceite visual do piloto.
