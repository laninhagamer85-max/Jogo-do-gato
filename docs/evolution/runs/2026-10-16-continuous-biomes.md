# 1.11.0 — campanha contínua — 16/10/2026

Pedido: passagem automática pelo portal, progressão salva por sala, dificuldade/NPCs crescentes, mestre e carta rara no final, segundo bioma com dez etapas, itens raros úteis. Correção adicional: screenshot 15:29 mostra lago chapado; usuário exige estilo ilustrado e ponte que realmente permita avançar.

Implementação: vinte salas, Clareira dos Troncos e Riacho dos Cristais. Portal acumula 850 ms de tempo ativo e muda sem escolhas; recarga de sala concluída também avança automaticamente. Pausa/aba oculta congelam o tempo. Sem tela de tentar novamente. Final da expansão exibe conclusão salva; próximos quatro capítulos não foram implementados.

Dados reutilizáveis de capítulo/sala/bioma/inimigo/mestre/recompensa. Salas do rio variam geometria, lagos, coleta, placas, chave, recuperação e ponte. População cresce de 2 no piloto para até 12 no fim, conforme pontos seguros disponíveis, níveis 1–10, raios, velocidades e território próprios. Caranguejo Azul, Rã Ametista e Mestre das Marés com atlas de quatro quadros por espécie. Mestre dos Troncos (280 HP, Nv6) e Marés (420 HP, Nv10) são maiores e obrigatórios; golpe de área sinalizado 900 ms antes, respawn do mestre desativado. Objetivos de combate nas novas salas contam adversários distintos.

Cartas raras garantidas ao vencer o mestre: Coração dos Troncos (poder desacelera por 2 s), Coração das Marés (poder cura até15HP). Uma carta ativa, descrição e equipar/retirar na mochila; aquisição explica função. Seiva cura60, Pérola cura90, Cristal dá+6 ataque, Escama reduz4 no dano comum. Cura só consome com HP faltante; equipamentos não são consumidos e apenas um raro ativo por vez. Material raro em bolsa permanece protegido na derrota. Não altera XP/moedas/decor da Minha Casa.

Área 30×24 com limite elíptico e margens orgânicas. Minimap v3 migra células v1/v2 por posição do mundo. Save v3/campanha v2 preserva progresso anterior, carta, equipamento raro, semente e objetivos. Clientes anteriores rejeitam novo save, protegendo de sobrescrita; rollback não torna novo progresso jogável em cliente anterior.

Lagos: água raster original ilustrada, recorte pelo polígono físico, pedras/plantas de margem esparsas, reflexos suaves por tempo de simulação, movimento reduzido respeitado. Salas de ponte agora têm rio bloqueado contínuo de norte a sul, com deck único atravessável; lago decorativo contornável não é usado como falsa barreira.

Pesquisa técnica em 16/10/2026: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame (delta temporal, suspensão em aba oculta); https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection (mesma geometria no desenho, colisão e caminho). Nenhum asset externo incorporado.

Artes geradas originalmente para o projeto pelo imagegen: NPCs1448×1086 RGBA (4×3), props1536×1024 RGBA (3×2), portal1374×1145 RGBA, água1536×1024 RGB. NPCs, props e portal usam escala uniforme; água mantém proporção nos patches mundiais. Prompts: atlas de caranguejo/rã/golem quatro poses por linha; seis props isolados de rio em 3×2; arco de pedras/cristais com água luminosa; material de água turquesa ilustrada sem margens/linhas retas. Revisões de props preservadas fora do projeto, apenas versão final incorporada.

- `client/public/forest-adventure/river-mobs-v1.webp` SHA256 `ffba05cfc8d6300fd83499ace5891df0418d5f82a4f4eb8fd31e5c3e016b29f3`
- `client/public/forest-adventure/river-props-v1.webp` SHA256 `3b64380d2d5fd941b39b3f1973ee3debfdc033a3015f6cd36dd9a2f20ecafbf9`
- `client/public/forest-adventure/river-portal-v1.webp` SHA256 `3280d8b9095ff2d43af480af8485cb7c348b06a482f5a03b4904945ad127e27a`
- `client/public/forest-adventure/painted-water-v1.webp` SHA256 `88dc6a0da31fead08f9437b4303fbe6848d5927e05f0dc4c209394caea2b2ffd`

Verificação: typecheck, motor offline, caminhos com/sem ponte, objetivos de vinte salas, duelos com nível apropriado, teletransporte, migração, persistência e recompensas, renderização estática e comandos Canvas. Sem navegador suportado; não medidos FPS, toque, retrato/paisagem ou partidas reais. Usuário explicitamente pediu publicar para testar após conclusão; isso não equivale a aceite visual desta versão. Sem alteração de saves reais por ferramentas.

Rollback anterior: produto1.10.0 / Sites58 / fonte `a5eba01779aae6a898d44ffa9483943df8cd51c1` / versão `appgprj_6ac40994d8d881919d46203a60801e46~appgver_da98708fc60c81919a84702d35a9bdf6`.

Resultado: TypeScript, 367 testes offline em 30 arquivos e build aprovados. Aviso existente de tamanho de bundle. Nenhum resultado de navegador ou FPS alegado.
