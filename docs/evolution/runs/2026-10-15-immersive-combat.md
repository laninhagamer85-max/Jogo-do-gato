# Exploração imersiva — revisão de arte, controles e combate
Data: 15/10/2026, America/Sao_Paulo. Produto alvo: 1.9.8.
Origem: três capturas fornecidas por David (duas do jogo e uma referência de disposição de controles). Imagens inspecionadas; terceira usada como referência de organização, sem extração/cópia de personagens ou UI.

## Implementação delimitada na sala piloto
- Canvas em toda a área disponível do jogo, sem faixa de cabeçalho reservada. HUD flutuante compacto; indicadores e objetivos discretos no alto, mochila/som/pausa no canto, câmera com botões circulares. As barras do sistema Android pertencem ao navegador/SO e não são removidas por esta mudança.
- Direcional analógico circular com captura de ponteiro, zona neutra, intensidade proporcional, diagonais limitadas, liberação/cancelamento e pausa. Teclado e toque no chão mantidos. Ataque principal maior no canto direito e poder/marco menores ao redor. Consumíveis ao centro inferior. Alvos de toque pelo menos 44 px. Saída continua protegida.
- Câmera acompanha a região central do pet em retrato/horizontal; fundo pinta todo o viewport, inclusive além das bordas lógicas. Colisão original preservada, bordas visuais com folhagem e pedras no lugar dos retângulos chapados.
- Novo atlas ilustrado original em PNG RGBA, 4 poses de caminhada do besouro e 4 da lagarta, com espelhamento horizontal. Inspeção estática e alpha conferidos; não são 16 direções. Carapaça/fibra/textura e volume substituem os insetos geométricos. Manifesto/proveniência: docs/evolution/enemy-art-v1.json. SHA256 995bf8760f388b034d78e21551499f81b77109cca64b45b189229fabcbd07a58. Arte gerada com ferramenta integrada, sem sprites extraídos da referência.
- Ataque do pet com antecipação/avanço/retorno, quadros do atlas próprio de caminhada e pata frontal articulada por Canvas, respeitando direção e cor. Não foi criado atlas de ataque redesenhado quadro a quadro; trata-se de composição procedural com a arte existente. Dano/cooldown permanecem do motor, sem novos golpes automáticos.
- Sons originais sintetizados de patada, poder e coleta; dano usa efeito existente. Disparos por evento aceito no motor, com desbloqueio por gesto e preferência global de som/volume. Som mutado não toca. Nenhum arquivo sonoro de terceiros.
- Drop visível com ícone correspondente, quantidade, arco de queda de 500ms e permanência no chão até aproximação. Coleta bloqueada antes de pousar; horário da queda persiste no save. Saves antigos sem campos de queda continuam legíveis. Sem alterações no nível da Minha Casa ou nas recompensas únicas.

## Validação
TypeScript aprovado. 154 testes offline em 23 arquivos aprovados, incluindo direcional proporcional/diagonal/neutralização, câmera em 375×667, 375×812, 390×844, 844×390 e 1366×768 por cálculos, pose/repouso, redução de movimento e queda/coleta única após reload. Esses cálculos NÃO são inspeção visual nos viewports.
Build de release aprovado (aviso existente de chunks grandes). Entrada da Aventura: 101 estados sintéticos aprovados, sem percursos jogados. Paridade de conta/atlas: 49 regiões/67 símbolos, fake storage, nenhum dado real alterado.
Navegador e escuta real do áudio: não executados; control-browser indisponível no ambiente. Não houve preview alternativo. Publicação para revisão do próprio usuário conforme autorização reiterada de publicar para testar; não se declara visual/áudio aprovados.

## Pesquisa técnica (15/10/2026)
- https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture — manter controle do mesmo toque ao sair do círculo, encerrar captura ao soltar/cancelar.
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices — desbloqueio em gesto, preferências de áudio, volume e contexto existente.

## Publicação e sequência
Código em feat/exploration-combat-pilot-20261015, fonte Sites exata recuperada da 1.9.7, commit 9f03845c5a7ca3de0b3874e08b2583a906abbc13. Sem merge/force-push e sem alterações em partidas reais.
Publicação em preparação. Rollback: 1.9.7 / Sites 26, versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_7f4918ea4dfc8191995c54bb48953191.
Próximo: repetir a sala e relatar tamanho/posição dos controles, visibilidade do pet, estilo dos inimigos, ataque/áudio e queda/coleta. Expansão de capítulos e cartas de decoração permanecem fora desta revisão.

## Publicação concluída
1.9.8 / Sites 27 publicada em 15/10/2026, 11:57:36 (America/Sao_Paulo).
URL: https://meupet.aquimeusite.chatgpt.site/
GitHub código: 2e57fcdced8cf9e91bcc1c978b516d5d693759f7
Source commit: e14c79260fdb91b9f4bf7f004efee95f82ea7df7
Saved version: appgprj_6ac40994d8d881919d46203a60801e46~appgver_14c779ff1d90819184b04fba60f48c4f
Deployment: appgdep_6ad0e9be35d8819193636d4c9564422f — succeeded.
Pacote oficial reconstruído a partir de partes para evitar truncamento, gzip validado em duas leituras, 301 arquivos e 75008000 bytes no tar normalizado. Um único deploy desta versão. Publicação não equivale à validação de gameplay/áudio; aguarda relatório do usuário.
