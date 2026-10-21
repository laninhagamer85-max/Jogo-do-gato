# 1.34.0 — Teste público do castelo e Tesouro Real

Estado: validado; publicação em andamento.

Base conhecida: produto 1.33.3, Site nativo122, fonte479bc279ec18cdff2c6b3448702bbfbe4c1d7645. Rollback: republicar pacote anterior122.

## Comportamento

- Acesso temporário às salas31 e32 e ao castelo para qualquer jogador, com entradas visíveis no menu Exploração. Nenhum capítulo anterior é marcado como concluído por esse acesso.
- Cinco baús na sala do trono; quatro teletransportam para o exterior ou salas distantes. Cada armadilha troca obrigatoriamente a posição do verdadeiro, antes de teletransportar, e persiste a ordem.
- Primeiro acerto por personagem concede Carta da Coroa, espada, picareta, machado e Explosão Real. Outra visita concede materiais, cristal, consumíveis e Carta do Arsenal. Equipar na mochila, aba Tesouro Real.
- Armaduras imóveis e estátuas distribuídas por sala com posições estáveis; longe de entradas, portas e baús. Armaduras perigosas derrubam por proximidade, aguardam60s reais e revivem no ponto seguro da sala. Parede bloqueia alcance. Salvamento comHP0 não passa pela antiga revivificação imediata.
- Escada externa: removida a segunda escada sobreposta. Colisão alinhada à escadaria que já integra a pintura do castelo, com patamar separado do portão.
- Atlas original pintado, RGBA, para baús, armaduras, estátuas e seis recompensas. Retângulos individuais preservam silhuetas. Sem bibliotecas novas ou alterações de autenticação.

## Verificação

703 testes em69 arquivos aprovados (Firebase Admin externo excluído, sem credenciais de integração). Caminhos das19 salas continuam atravessáveis; teste caminha pela escada até entrar no castelo. Novos casos cobrem20 armadilhas consecutivas, mudança obrigatória e persistência da ordem, exclusividade por personagem, repetição, desbloqueio de teste sem completar capítulos e recuperação aos60s. Typecheck aprovado.

Navegador cloud, fixtures isoladas sem salvar na conta:844×390 e390×844. Baú falso teletransportou para fora; baú verdadeiro entregou itens; mochila mostrou arte e equipou espada e poder; armadura derrubou, apresentou contagem e recuperou automaticamente o jogador para304/304HP ao terminar os60s. Não é teste em aparelho físico.

## Limites

Estado econômico segue a arquitetura existente por conta/perfil e persistência do jogo; não altera a autoridade do backend. Acesso de teste é temporário via CASTLE_TEST_ACCESS. Datas e recompensas são locais como os demais sistemas de exploração existentes.
