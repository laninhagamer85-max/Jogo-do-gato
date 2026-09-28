# Game Plan — Meu Pet Virtual: Uma Casa de Cada Vez

## Objetivo da expansão
Levar a campanha de dez casas a um pet game mais expressivo, móvel e jogável sem perder o save já existente. A sessão inicia com escolha de menino/menina, personagem entre três opções, idade e nome; segue por cuidados, capítulos, loja, missões, casas, amigos e desafios.

## Sistemas principais
- **Progressão:** XP por jogo e cuidado, limiar de nível mais demorado, 10 cenários e mapa que permite revisitar apenas casas desbloqueadas sem regredir o nível atual.
- **Personagens e fala:** seis gatos, animação de idle/caminhada/reação/level-up, interações por toque e vozes PT-BR por perfil; Mimi e Tico têm fala própria.
- **Match-3:** 8×8, troca por arrasto adjacente ou dois toques, metas crescentes, limite de jogadas, cascatas, efeito visual e áudio de combinação.
- **Decoração:** 100 props únicos (dez por casa), compra e guarda por cenário; móveis permanecem fixos às coordenadas do fundo sem controles até o toque; seleção libera arrasto, rotação, fixação e retorno à mochila. Parte dos itens depende de nível ou missões concluídas.
- **Presentes:** até duas recompensas temporizadas no quarto; expiram sem prêmio se o jogador não coletar.
- **UI:** preservar personagem e amigos livres de texto; ajustar cenário para retrato; painéis recolhíveis, nome temporário com piscada ao tocar no pet, balões que somem após a fala e ficha de perfil persistente.

## Riscos e decisões
1. **Estado legado:** migração aditiva, com valores padrão e cópias antes de reinicialização.
2. **Pointer/touch:** testar input tanto em tabuleiro como em props de cenário; impedir propagação para o clique de caminhada.
3. **Temporizadores:** expirar presentes também ao voltar de uma aba e nunca entregar recompensa a item vencido.
4. **Áudio:** respeitar preferência do usuário e gesto de ativação do browser; sem falas automáticas bloqueadas.
5. **Build:** Vite precisa empacotar assets locais para que o clone não dependa do WebDev.

## Verificação executada
- `pnpm check` e `pnpm build` nos projetos WebDev e Vite standalone.
- Smoke tests puros de perfil/seleção, 6 jogos até o segundo nível, desbloqueio/seleção de casa, compra/movimento/rotação/retorno de decoração e coleta/expiração de presente.
- Preview: onboarding de três passos, dez cenários e tabuleiro; troca por arrasto válida consome um movimento e atualiza a meta; modo decorar move prop; presente entrega moedas; mapa lista casas desbloqueadas.
- Save real conferido invariável ao testar presente, casas, decoração e cadastro não submetido na demo.
- Capturas desktop e mobile; o cenário em retrato foi ajustado para manter o pet inteiro visível.
- Onboarding: introdução e saudações menino/menina transcritas em PT-BR; cliques no browser confirmam os três MP3 corretos e não salvam perfil; check/build passam nas versões WebDev e Vite.
- Nova interação: clique no pet dispara `pet:blink`, revela o nome por ~2,6 s e fecha o balão ao fim da fala/fallback; perfil mostra idade, gênero, personagem, casa, nível, XP, moedas, companhia e status. No demo, seleção de móvel esconde/mostra controles, arrasto altera posição, rotação aplica 15° e Fixar oculta as ferramentas; desktop/mobile foram capturados e WebDev check/build passaram.
- Decoração: domínio tem 10 IDs por nível; compra é bloqueada e liberada corretamente por nível/missão; Vite SSR carregou 100 URLs distintas, o build incluiu os 96 novos WebP e o demo carregou 10 de 10 thumbnails únicos da Casa do Começo. Amostra de storage em todos os níveis respondeu HTTP 200; a ancoragem em desktop/retrato e o visual do pet sem obstrução foram verificados.

## Continuidade
A versão do app fica em `src/`; assets locais ficam em `src/assets/`; preservar `legacy.html`. Desenvolver neste branch/PR aberto e não mesclar automaticamente em `main`.
