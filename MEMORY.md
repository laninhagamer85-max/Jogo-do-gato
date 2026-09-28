# Memória de continuidade

- Repositório-base: `laninhagamer85-max/Jogo-do-gato`; a versão vanilla antiga foi preservada em `legacy.html`.
- PR de implementação: https://github.com/laninhagamer85-max/Jogo-do-gato/pull/2 — branch `feature/meu-pet-virtual-refresh`; manter revisão por PR, sem mesclar `main` automaticamente.
- WebDev `meu-pet-virtual` é o preview de trabalho. O GitHub tem cópia Vite independente, assets WebP/MP3 locais e imports por `?url`; WebDev usa storage gerenciado.
- O jogo começa no nível 1 com cadastro nome/idade/menino ou menina; boné/lacinho muda junto do perfil. Guia inicial reabrível, dez capítulos e onze minijogos.
- Saves anteriores não devem ser apagados. `?demo=1` deve continuar sem persistir no save.
- QA nesta versão: onboarding e cinco passos do tutorial; reabertura do tutorial; voz de boas-vindas solicita o MP3 PT-BR; quatro painéis minimizam/restauram; todos os 11 jogos abriram; Eco de Miados, labirinto por WASD, Caça aos Brinquedos, Pescaria e uma troca match-3 válida foram exercitados. Dados fictícios do browser devem ser removidos/restaurados antes da entrega.
- A voz dinâmica do navegador só deve tentar síntese se houver voz `pt-*`; clipes gerados cobrem boas-vindas, cuidado e nível.
