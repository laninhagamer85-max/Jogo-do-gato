#1.33.3 — Coleta nas árvores do bioma, trilhas e renovação de30min
2026-10-21 America/Sao_Paulo. Estado validado, aguardando pacote.

Maioria das árvores existentes dos bosques procedurais e das Nascentes coletável, com seleção determinística aproximada75%, respeitando água e mesmo piso. As árvores mantêm arte/escala do bioma; viram toco ao esgotar5madeiras. Identidade por sala/coordenadas independe de câmera/zoom, também fora do setor inicial. Consulta por células próximas com cache256; saves esparsos até4096 pontos em vez de300. Props de missão, troncos e tocos decorativos não foram convertidos em árvores.

Renovação de todas as árvores, pedras e minérios reduzida12h→30min. Workshop.version2 converte prazo antigo uma vez preservando início da espera e itens; campaignVersion11 protege o novo save de clientes antigos. Textos e contagem atualizados. Coleta continua com ferramenta e troca visual de arma da1.33.2.

Trilhas de terra pintada ramificam do acampamento para portal, marco, recursos e quatro direções. Caminhos calculados com navegação/colisão real, com cache por sala e textura em escala de mundo. Não altera desbloqueios de portais/escadas. Lupa e mapa completo exibem as mesmas trilhas. Interior do castelo preservado. Trilhas do setor não representam geração infinita de estradas.

Pesquisa MDN Map https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map consultado2026-10-21: cache limitado por chave de célula, identidade independente de viewport. Reutilizadas técnicas Canvas clip/globalAlpha consultadas no ciclo anterior. Skills evolução Meu Pet Virtual e criar-cenarios-biomas-2d aplicadas, sem novos assets de terceiros.

Validação: TypeScript;672 testes em68 arquivos passaram, depois cobertura de trilhas ampliada de5para32salas e32 testes passaram. Verificações de coleta, save/reload, não duplicação, maioria de árvores em cinco biomas/regiões, expiração de30min e migração única. Todos os segmentos das trilhas nas32salas passam pela linha de navegação real. Navegador isolado: árvore comum das Nascentes5→0, toco e30min visíveis,29min em contagem, trilhas em mapa/lupa;844x390,390x844,375x667,375x812,1366x768. Controles e orientação inspecionados; sem celular físico e sem aguardar30min reais. Nenhuma conta real alterada. Sem medição deFPS.

Evidências: ../evidence/meupet-1333-trilhas-coleta.jpg e ../evidence/meupet-1333-mapa-trilhas.jpg.

Rollback1.33.2 Site121, versãoappgprj_6ac40994d8d881919d46203a60801e46~appgver_00f3d3b0e4508191b6c27f117f5e3e94; deploymentappgdep_6ad92bd8a2e48191b9c510e6e0f2d325. Fontebase22a460f8232ad01f5eefb01bc22829fb958cc5b0. Fonte recuperada pelo helper oficial antes de editar após manutenção do workspace.

Refino visual final: largura central reduzida0,72→0,42 unidade, transparência e bordas suaves; curvas arredondadas até0,16unidade. Conferido bioma de riacho no desktop e844x390, sem alterar o grafo de navegação. Evidência final ../evidence/meupet-1333-trilhas-final.jpg.

Publicado1.33.3 Site122 com sucesso. Fonte57f3bf3f7ce90ad25a059350447353fd2295d481; GitHub1567e9acb5db0850ad95a75e89fc6cfdd1031c5b; versãoappgprj_6ac40994d8d881919d46203a60801e46~appgver_38a0006d12e081919937d7356bd20769; deploymentappgdep_6ad9389c125c8191aa4de59096d2f2f3. Build18.57s. URL https://meupet.aquimeusite.chatgpt.site
