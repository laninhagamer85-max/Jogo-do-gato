# 1.39.1 — Portal direto entre salas

Corrigida a saída automática para a trilha após 850ms ao repetir salas 1–30. Todas as partidas usam agora tickCombatPortal, inclusive portais de retorno. A interface não anuncia mais volta ao mapa. A saída continua manual.

O replay mantém a memória da sala atual da campanha e das salas visitadas. Ao alcançar a fronteira da campanha o salvamento passa a aceitar sua continuação, sem desbloquear destinos distantes nem conceder novamente recompensas de salas já concluídas.

Validação: 61 testes de seleção/progressão passaram; TypeScript passou. Teste isolado no navegador: passagem de sala repetida 1→2 em 844×390 e 11→12 em 390×844, sem saída para seleção. Build oficial antes da publicação. Nenhuma conta real alterada nos testes.
