# 28/11/2026 — Alce das Marés e carregamento regional

## Pedido e base

Pedido direto de David: criar também o Alce das Marés, restrito às salas correspondentes e com o tema delas. Base canônica publicada **1.0.154 / Sites157**, fonte **afa2b751946dc28d59a7a9eba4392e51b811a186**. HEAD aberto pelo helper coincide com a publicação. Preservadas as correções anteriores, incluindo a cena do Alce das Neves nas41–50.

Lidos AGENTS.md e fonte atual. Identidade conferida no atlas ativo `forest-adventure/fauna/motion-4-v2.webp`, creaturePortrait e localFauna: corpo esguio, pelagem clara castanha, pintas brancas, pescoço claro, focinho fino, galhadas ramificadas sem neve; filtro das Marés saturate1.22/brightness1.07. Não foi reutilizado o antigo animal-4 estático com aparência robusta. Salas11–20 (índices internos10–19), bioma river. Referência regional `forest-adventure/trail-river-v1.webp`: rio turquesa, pedras claras, pequenas quedas, grama, flores azuis e cristais.

## Entrega

Nova arte original **tide-moose**, alce sozinho e tranquilo em margem gramada, rio turquesa e pequena cachoeira ao fundo, poucos cristais laterais. Composições próprias16:9/9:16, sem personagens adicionais, relógio, texto, marca ou interface pintada.

- `client/public/lendarios/loading/tide-moose-landscape-v1.webp`:1439×810, **227822bytes**.
- `client/public/lendarios/loading/tide-moose-portrait-v1.webp`:810×1440, **185486bytes**.
- Total **413308bytes (~403,6KiB)**, WebP qualidade86 com redução proporcional; sem distorcer/cortar personagem.
- Novo **TIDE_LOADING_SCENES**: alce novo + Rã Ametista, Caranguejo Azul, Guardião das Marés e Mestre das Marés já existentes.
- scenePool usa esse grupo apenas nos destinos internos10–19. Fora deles, pool geral mantido; inverno40–49 usa seu pool intacto. As artes antigas das Marés continuam elegíveis no pool geral como antes; somente a nova tide-moose é restrita11–20.
- A nova cena participa da alternância, não é obrigatória em todas as transições. A atual permanece enquanto a próxima não estiver pronta, inclusive na mudança de bioma.
-12casos novos de teste:10salas das Marés e limites externos9/20 (salas10/21).
- Notícia atualizada e produto **1.0.155**. Sem alteração de contas, dados, saves, física, personagens de gameplay, permissões ou domínio.
- Fonte enviada: **438d15afe090df7e42dde1f0c0e68eea0c2c24a5**.
- Revisão GitHub: **b66136188e8d75781141bb4c1c2ec648ddef3a1b**, patch e artes em docs/lendarios/reviews/2026-11-28/.

Gerenciador de download/decode, fila única e retenção atual+seguinte preservados. Pausa e exposição mínima1000ms após dois frames não foram alteradas; verificadas por fonte/contratos existentes, sem nova observação de gameplay. Não há espera obrigatória da sala pela arte.

## Arte e referências

Criada pela ferramenta integrada usando atlas ativo como referência de identidade e trail-river como referência de tema. Prompt paisagem: alce esguio com pintas e galhadas ramificadas, sem neve/barba, sozinho sobre grama, rio claro turquesa e pequena queda, pedras claras, flores/cristais discretos, pintado2D infantil, corpo inteiro terminando antes de60% da altura e espaço inferior para progresso. Retrato: recomposição natural da mesma cena, identidade preservada, galhadas/patas inteiras, topo livre para marca real e30%inferior para progresso. Nenhum asset externo incorporado.

Referências técnicas primárias consultadas nesta sequência de correções em28/11/2026:
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — só selecionar o par pronto, manter fallback na rejeição.
- https://web.dev/learn/design/picture-element — direção de arte e seleção por orientação.
Nenhuma dependência ou lockfile atualizado.

## Verificação

**50/50 testes em5arquivos**: loadingScenes, preparedLoadingScenes, loadingSceneLifecycle, loadingReveal e gameAssetLoading. Incluem300transições simuladas, erro/timeout, cancelamento e os12casos novos; os12casos de inverno permanecem passando. TypeScript do jogo e host aprovados. Build oficial Worker aprovado, **610arquivos preservados conferidos byte a byte**. Pacote707entradas sem harness; mesmo projeto/D1DB/R2null. Git limpo após helper.

Chrome no preview oficial; componente e gerenciador reais em harness isolado, sem conta ou saves:
-375×667,375×812,390×844,844×390,1366×768 inspecionados: alce inteiro, galhadas e cascos visíveis, progresso separado. Picture usou810×1440 em retrato e1439×810 em paisagem.
-Destino11 manteve rest durante preparação;12 exibiu tide-moose;13 amethyst-frog;20 tide-moose após aquecimento.
-Mudança41 manteve a atual temporariamente;42 exibiu snow-moose já preparada, confirmando o pool de inverno preservado.
-Oito acionamentos de progresso20→100% mantiveram cena e contador acumulado de Image7, sem nova preparação.
-Quatro erros induzidos em2tentativas do par novo (URL inexistente apenas no harness), rest permaneceu; URLs restaurados,13 preparou e19 exibiu tide-moose.
-Sem quadro verde observado nessas trocas; sem bytes transferidos do cache, heap, GC ou FPS medidos. Contador cumulativo de Image não mede instâncias vivas.

Sem aparelho físico ou gameplay de produção. Não auditadas100fases; tentativas/mortes/tempo/dificuldade/conclusão não medidos. Esta inspeção valida carregamento, não playtest de salas.

## Publicação

**Publicada1.0.155 / Sites158**, fonte `438d15afe090df7e42dde1f0c0e68eea0c2c24a5`. Versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_0363988c7eb8819194b9e751715a565f`, deployment `appgdep_6b0ae70d484481918a075cac90d0bfa1`, status **succeeded** em `2026-11-28T14:37:20.670971+00:00`.

[Jogo público](https://lendariosdorei.com.br/) · [URL da plataforma](https://lendarios-do-rei.aquimeusite.chatgpt.site). Chrome confirmou Ver.1.0.155 e a notícia do Alce das Marés na home. Artes inspecionadas no preview e verificadas no pacote; sem partida de produção.

Rollback de referência: Sites157/fonteafa2b751946dc28d59a7a9eba4392e51b811a186, somente sem publicação posterior. Pedido adicional direto após a correção das Neves; não é deploy duplicado da rotina. Nenhuma mudança de frequência/automação nem publicação no Meu Pet.

## Próximo

Conferir em aparelho físico. Para novas cenas, verificar o atlas realmente renderizado e associar o tema ao capítulo; manter isolamento dos grupos e fallback na mudança de bioma.
