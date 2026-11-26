# 26/11/2026 — Guardião das Marés no carregamento

## Base e mudança

Base confirmada: **1.0.146, Sites 149**, fonte `d4fb006b33e3844c20eb35027d6f82bdd6ed625e`, deployment `appgdep_6b06c5f7199481919c539455fca76455` succeeded em 25/11/2026 11:26:57 UTC. O helper abriu HEAD idêntico à publicação. Lidos AGENTS.md, README, README da aplicação, retomada histórica, estado e relatório de 25/11. O ajuste de reutilização de definições dos NPCs foi preservado sem alteração; esta entrega não reavalia os travamentos.

Nova cena original **river-guardian**: Guardião das Marés, subchefe de pedra da sala 20, sentado na grama junto a um lago com juncos. Identidade baseada na terceira linha do atlas atual `forest-adventure/river-mobs-v1.webp`: cabeça pequena redonda, corpo de rochas cinzas, olhos ciano, musgo e cristais turquesa. Conferido nome e spriteRow:2 de `river-master` em explorationCampaign.ts. Não é o Mestre das Marés, caranguejo gigante já representado na alternância.

Arte original criada pela ferramenta integrada, usando o atlas apenas como referência de identidade e o carregamento atual como referência de estilo. Personagem sozinho, tranquilo, corpo inteiro, sem relógio, texto ou interface pintada. Composição nova com lago, juncos e duas pedras claras ao longe. Nenhum asset externo incorporado.

## Integração e tamanho

- `client/public/lendarios/loading/river-guardian-landscape-v1.webp`: 1439×810, 157794 bytes.
- `client/public/lendarios/loading/river-guardian-portrait-v1.webp`: 810×1439, 137906 bytes.
- Total: **295700 bytes, aproximadamente 288,8 KiB**. Redimensionamento proporcional e WebP qualidade 86; sem distorção.
- RGBA teórico do par: aproximadamente 8,89 MiB; **não é medição real de heap**.
- Entrada adicionada antes de tide-master em `client/src/lib/loadingScenes.ts`, notícia em `client/src/lib/lendariosNews.ts`, produto **1.0.147** em package.json.
- Fonte enviada: `617a4e4e6cc2a9554763620f7b67af3898b46bb7`.
- Revisão preservada no GitHub: `be05be80cc387f8946fef7559612d172ccefaa27`, em `docs/lendarios/reviews/2026-11-26/`, com patch e as duas artes. Fonte antiga do ramo GitHub não foi usada para substituir o Site.

Gerenciador não modificado: download/decode antecipados, imagem atual quando a próxima não está pronta ou falha, fila única, retenção limitada aos pares atual/seguinte. Pausa da simulação e intervalo mínimo de 1000 ms após dois frames mantidos; não houve novo playtest de gameplay para observar a pausa.

## Pesquisa — 26/11/2026

Fontes primárias abertas:
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — manter a próxima imagem fora da seleção até terminar a decodificação e tratar rejeições.
- https://web.dev/learn/design/picture-element — composições por orientação usando o picture existente.

Sem dependência nova ou atualização de lockfile.

## Testes

**26/26 testes em cinco arquivos**: loadingScenes, preparedLoadingScenes, loadingSceneLifecycle, loadingReveal e gameAssetLoading. Incluem 300 transições simuladas, erro, rejeição de decode, timeout e cancelamento do reveal. São testes de contrato/simulação, não partida jogada.

TypeScript do jogo e host aprovados. Build oficial Worker aprovado, **602 arquivos preservados verificados byte a byte**. Tar conferido sem QA temporário; manifest preserva projeto, D1 DB e R2 null.

Chrome no preview oficial, componente GameLoadingScreen e gerenciador reais em harness isolado, sem conta ou save:
- Inspeção em 375×667, 375×812, 390×844, 844×390 e 1366×768: golem completo, cristais/pés visíveis, margens e área para progresso, sem distorção.
- Em paisagem, picture selecionou o arquivo de 1439×810; em retrato, 810×1439.
- Sequência real observada: rest → river-guardian → blue-crab → river-guardian, com retorno após aquecimento do cache. Bytes transferidos do cache não foram medidos.
- Progresso manual de 20% a 100% em oito acionamentos, mesma cena, contador de objetos Image permaneceu em 6; não foram preparadas novas cenas por atualização de progresso.
- Falha induzida apenas no harness, trocando os dois URLs da nova cena por arquivo inexistente: 4 erros em duas tentativas. Rest permaneceu completo/visível. Restaurados os URLs: destino 2 manteve rest durante preparação e destino 3 selecionou river-guardian.
- Sem quadro verde observado durante essas transições. Não é prova de todos os aparelhos ou condições de rede.
- O contador acumulado de Image é instrumentação de criação, não quantidade de imagens vivas nem medição de memória. Limite de retenção coberto por contrato e inspeção da fonte, sem forçar GC.
- Random determinístico .88 e falhas somente no harness; arquivos temporários removidos antes do pacote.

Sem celular físico, FPS/heap/GC medidos, partida de produção ou auditoria das 100 fases. Tentativas, mortes, tempo, dificuldade e conclusão por fase: **não medidos neste ciclo**, pois não alterou gameplay. Não foi alegada melhoria de FPS.

## Produção das artes

Paisagem: ilustração original infantil 2D pintada, golem da terceira linha do atlas com rochas cinzas, cabeça pequena e olhos ciano, musgo e cristais turquesa, sozinho sentado com mãos nos joelhos e pés visíveis, junto a lago com juncos e duas pedras ao longe; corpo central, parte inferior livre para progresso e topo esquerdo para logo real, sem UI/texto/relógio/marca.
Retrato: recomposição 9:16 da mesma identidade/pose, personagem inteiro central com margens laterais, topo aproximadamente 25% e parte inferior 30% livres; sem esticar nem simplesmente cortar a paisagem. Enquadramentos finais conferidos no navegador.

## Publicação

**Publicada 1.0.147, Sites 150**, em 26/11/2026. Versão salva `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_21bbc9e158d48191b5119bd32aa82cb8`, deployment `appgdep_6b081fea7ff881919f24ee6b32257aac`, status **succeeded** em `2026-11-26T12:03:03.079745+00:00`. [Jogo público](https://lendariosdorei.com.br/) · [URL da plataforma](https://lendarios-do-rei.aquimeusite.chatgpt.site).

Chrome confirmou Ver.1.0.147 e a notícia “O Guardião das Marés repousa junto ao lago” na home pública. As artes e a alternância foram conferidas no preview antes da publicação e as cópias verificadas no build; não foi iniciada partida de produção nem feita inspeção direta dos novos arquivos no domínio público. Uma única revisão publicada neste ciclo. Não houve publicação no Meu Pet, alteração de domínio, público, contas, saves, credenciais de jogadores ou faturamento; sem force-push, merge automático ou mensagens a terceiros. A rotina existente foi preservada.

Rollback de referência: Sites 149 e fonte d4fb006b33e3844c20eb35027d6f82bdd6ed625e, apenas se não houver revisão posterior.

## Próxima ação

Conferir em aparelho físico a alternância e continuar a investigação de custo de desenho durante caminhada/combate. Acrescentar cenas de outros personagens em ciclos posteriores, sem repetir os já existentes.
