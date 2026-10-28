# Meu Pet Virtual 1.52.0 — ponte e acabamento do castelo

Publicado em 28/10/2026, Sites156. A sala40 separa passagem inferior e tabuleiro superior: o jogador vindo do terreno continua no chão, esbarra nas três colunas e fica oculto pelo tabuleiro ao passar por baixo. A camada superior exige entrada pelas extremidades conectadas ao terraço/castelo. As bordas bloqueiam saída lateral; o portal do castelo requer altura superior. Navegação e moradores carregam a camada; save/reload preserva a escolha de camada e Soren.

A imagem original castle-gate-v4.webp suaviza o perímetro sem borda preta e reduz o primeiro degrau leste a uma laje junto ao terreno. Editada com imagegen a partir do castelo existente, RGBA1254×1254 convertido para WebP94/method6, sem redimensionamento. Geometria, entrada frontal, ponte e âncoras mantidas. Origem/hash e instrução de edição registrados em client/public/forest-adventure/chapter4/castle-bridge-layers-manifest.json. Prompt final: mudar somente o primeiro espelho inferior da escada direita para laje fina, praticamente rente ao chão; preservar patamar superior, largura, direção, arquitetura e transparência limpa.

## Verificação

- TypeScript e build oficiais passaram; build final18.14s, aviso preexistente de tamanho de chunks.
- Suite completa931/931 em93 arquivos. Depois,6/6 testes específicos reforçados passaram: ida/volta sob ponte, alturas distintas no mesmo ponto, três pilares, acesso superior e guarda lateral, save/reload, desvio de pilar por navegação.
- Auditoria das100 vilas31–40:100/100,63.327 passos simulados; JSON em evidence/2026-10-28-bridge-layers/village-audits.json.
- Chrome suportado: Soren oculto sob tabuleiro, visível sobre ele no mesmo x/y, visível no chão após completar passagem inferior pelo motor. Movimento curto real observado. O percurso inferior completo usa stepCombat em fixture isolada, não um percurso contínuo manual de teclado.
- Castelo leste inspecionado no cenário: primeiro degrau baixo e perímetro integrado. Cinco tamanhos844×390,390×844,375×667,375×812,1366×768 inspecionados; formatos estreitos incluíram painel pausado. Nenhum telefone físico utilizado.
- O helper DOM apresentou timeouts em alguns comandos já efetivados; estado nativo confirmou resultados. Não houve alteração de conta real ou recompensa de campanha.

Referências consultadas em28/10/2026: https://docs.godotengine.org/en/stable/tutorials/physics/physics_introduction.html (separação de colisão); https://docs.mapeditor.org/en/stable/manual/layers/ (camadas independentes). Implementação permanece no motor atual.

Rollback: Sites155, fonte0408aeebba5521f1200937b4d403ed2229f9728c; artev2 preservada.

## Publicação e confirmação pública

Sites156 / produto1.52.0, status succeeded.
- Fonte Sites: 581206b5866e6e6f7952810955b39306cba1433c
- GitHub código: f9f3a6c3c9597734860e68b24cc3bed9ff32bb44
- Versão: appgprj_6ac40994d8d881919d46203a60801e46~appgver_93a0f0792ee081919cdd69c1465c7ca0
- Deployment: appgdep_6ae217238dfc8191a70736522bb445ee
- URL: https://meupet.aquimeusite.chatgpt.site
- Na URL pública, castelo leste e passagem inferior concluída pelo motor confirmados; saída x0.4391489362/y8.5734042555, camada none (terreno). Capturas meupet152-castle.jpg e meupet152-under-exit.jpg no diretório de evidência. Console capturado: mensagens de extensão Chrome, sem erro de aplicação observado.
