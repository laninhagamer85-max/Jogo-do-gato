# Exploração — sala piloto de combate
Data: 15/10/2026 (America/Sao_Paulo)
Estado: implementado, aguardando validação visual/jogável.
Base: af6a1184f2c41b8bafc41d4f2166f672871a2dd3; publicação preservada: 1.9.4, Sites 23.

## Entrega
Uma sala piloto acessível no mapa da Exploração, separada das trilhas existentes. Motor TypeScript puro, renderização Canvas e controles React. Piso contínuo da revisão anterior incluído. Caminhada reutiliza atlas próprio do personagem; simulação espera o carregamento da arte, evitando deslizar com imagem parada.
Nível/XP de combate separados da Minha Casa. Patada direcional, poder com custo de energia, besouro nível 1 e lagarta nível 3, perseguição, colisão e linha de visão. Dano real negativo vermelho no alvo, cura real positiva verde, XP separado; redução de movimento respeitada.
Coleta de fibra/âmbar/erva, estoque e bolsa da tentativa, cura/energia, broche equipável +4 de ataque. Respawn em 45 segundos de tempo ativo, sem nascer em cima do pet ou enquanto seu drop aguarda coleta. Chance experimental de broche 12%; conclusão garante broche. Isso é equipamento, NÃO carta de decoração.
Objetivo: seis fibras + um adversário superado; interagir no marco e alcançar a saída. Conclusão deposita coleta e fica persistida, sem recompensas duplicadas.
HP zero retorna ao acampamento com HP restaurado, preserva XP/estoque/equipamento e desconta floor(10%) de fibra/âmbar na bolsa da tentativa; percentual é padrão inicial ajustável, não decisão explícita do usuário.
Save aditivo por perfil em explorationCombatProgress, migração de saves antigos e preservação de schemas futuros. Nenhum dado real de jogador foi alterado.
Controles sobre o cenário, teclado/WASD, toque para caminhar, zoom, visão geral pausada, mochila e confirmação para sair; pausa por aba oculta/perda de foco. A organização visual ainda precisa de inspeção real.

## Verificação
- TypeScript aprovado.
- 140 testes offline aprovados em 22 arquivos, incluindo 15 novos casos de combate/saves.
- Build de release aprovado; aviso preexistente de chunks grandes.
- Verificador de entrada aprovado em 101 estados sintéticos; não são percursos jogados.
- Paridade de conta/atlas aprovada com storage falso: 49 regiões/67 símbolos; nenhuma chamada de conta real.
- Testes do piloto cobrem velocidade/diagonal/rota curta, cooldown/direção, dano final, kill/drop após reload, perda parcial, cura limitada, energia, coleta única, objetivo/saída, schema futuro, separação de progressão, respawn, derrota e parede.
- Navegador: NÃO executado. Ambiente managed-linux sem control-browser. Não foi criado preview alternativo.
- 375×667, 375×812, 390×844, 844×390 e desktop aguardam inspeção real, teclado/toque e recarga isolada.
- Nenhuma fase real concluída nesta execução; nenhum teste online de 100 fases.

## Referências consultadas
Acesso em 15/10/2026:
- https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection — separação entre hitbox e apresentação; colisão delimitada.
- https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events — captura/liberação de ponteiro e cancelamento para controles móveis.
Arte dos adversários desenhada originalmente em Canvas; nenhuma extração de sprites ou asset de terceiros novo.

## Publicação e próximo passo
Nada publicado. A skill evoluir-meu-pet-virtual exige inspeção real para alterações visuais/física; ferramenta necessária indisponível. A 1.9.4 permanece no ar em https://meupet.aquimeusite.chatgpt.site/.
Revisão isolada: feat/exploration-combat-pilot-20261015. Commit é o que contém este relatório; não houve merge nem force-push.
Rollback: descartar a revisão não publicada; Site público intacto.
Próximo: jogar o piloto em cinco viewports com perfil isolado, validar dano/derrota/coleta/saída/reload e navegação. Depois implementar cartas de decoração permanentes e expandir para seis capítulos × dez salas reais, com progressão de enigmas. O piloto não entrega essas 60 salas nem catálogo de cartas.
