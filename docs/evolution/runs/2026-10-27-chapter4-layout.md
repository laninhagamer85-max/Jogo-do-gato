# Capítulo 4: composição, acessos e ponte medieval — 1.49.0

Data:27/10/2026, America/Sao_Paulo. Base publicada1.48.2/Sites152, fonte058283b5eb42669432c63e246e1931cce02e9e9c; abertura atual8a9c633eb9eeefab0d94a0e6258da3c6fa9fa762. GitHub70fc1af0e8b3658427e7bef92c10839e9da4fe42, ramo review/grass-option3-20261016. Nenhum dado de jogador alterado.

## Problema e entrega

David relatou portais ocultos por edifícios, vilas compactas, casas junto a bordas de platôs, moradores presos, diferenças de acabamento e escadas com escalas variáveis. Pediu também atmosfera medieval no Castelo Bônus e, durante a implementação, aprovou a nova escada, solicitou elevação medieval correspondente e ponte longa até a entrada do castelo, com atenção aos ângulos e proporções.

- Portais31–40 em clareiras próprias; sem sobreposição de telhados, separados do acampamento. Impede novas construções do jogador dentro de4unidades desses portais. Rótulos legíveis no mapa, retorno40 afastado do rótulo do capítulo5.
- Vilas elevadas espaçadas em terraços42unidades, com casas, serviços, trabalho e portas apoiados inteiramente no piso. Vizinhanças baixas próximas às encostas reposicionadas. Novo teste cobre construções baixas encostadas em cliffs, além do apoio superior e das silhuetas junto aos portais.
- Três superfícies coerentes: pedra, grama e terraço medieval com alvenaria e parapeito baixo. Removido o repasse de terra das trilhas sobre pátios de pedra para evitar diferenças de textura. Novas artes originais em RGBA, convertidas inteiras para WebP94, sem edição de pixels. Manifesto: client/public/forest-adventure/chapter4/village-platforms-v3-manifest.json, incluindo origem, dimensões, hashes, briefs e âncoras.
- Dois modelos de escada, com extensão de5,524unidades constante, independente do tamanho do platô. Transformação uniforme e mesmos pontos para desenho e colisão.
- Moradores não rejeitam mais segmentos retos livres com mais de3unidades. Movimento passa pela função real usada pelo jogador; percursos longos entre vilas usam trechos limitados. layoutVersion3 reposiciona moradores antigos do capítulo4 sem apagar estoque, moedas ou progresso.
- Castelo Bônus ganha perfil de som separado: notas graves, quinta suave, pequenas frases e eco, respeitando volume, mute e pausa. Exterior mantém Nascentes.
- Sala40: terraço medieval a sudoeste e castelo ampliado uniformemente10→18unidades. Âncoras de porta, patamar e escada derivam da mesma colocação da imagem. Ponte de aproximadamente26unidades liga o terraço à base da escada da porta frontal; segue para nordeste. Direção inicial pela lateral rejeitada na prévia, nunca publicada.
- A ponte usa arte própria na direção correta, sem virar pilares de cabeça para baixo ou deformar eixos. Centros dos extremos, piso navegável e desenho compartilham uma única transformação. Posição do terraço ajustada à inclinação da arte, mantendo os pilares verticais. Suave transição de navegação para o patamar, escada e porta; ida e volta sem teletransporte. Depósitos, vegetação e pontos de missão afastados da ponte/parapeitos.
- Teste isolado oferece as duas junções da ponte. Cabeçalho do teste passou a ocupar sua altura real em celular, mantendo controles dentro do quadro. Não altera autenticação nem o HUD da campanha.

## Pesquisa aplicada

Consultada27/10/2026:
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage — preservar proporção e separar retângulos da imagem/colocação.
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques — síntese, envelopes e agendamento de áudio sem arquivo externo.
- https://docs.godotengine.org/en/stable/tutorials/navigation/navigation_using_navigationagents.html — distinguir planejamento de caminho de execução e recuperação; conceito aplicado ao motor Canvas existente, sem migração.

## Verificação

- TypeScript aprovado. Build oficial24,61s aprovado, aviso preexistente de chunk grande.
-915/915 testes do jogo aprovados;49 focados passaram após os refinamentos finais de vegetação/coleta. O único teste anterior que esperava escada menor que3,1 foi atualizado à nova medida deliberada, repetido e aprovado. Não há falhas pendentes.
-100/100 povoados na auditoria final,63827 passos pela função de movimento/colisão. Arquivo chapter4-layout-1490-audits.json. Simulação isolada, não caminhada manual contínua de100vilas.
- Testes específicos da ponte: mesma escala nos dois eixos, extremos coincidentes, direção sudoeste→nordeste, porta vinculada à arte e percurso terraço→ponte→porta→ponte→terraço usando movimento real.
- Rotinas de moradores executadas por90segundos simulados nos centros elevados33/35/37/39, com ciclos ou estoque evoluindo e posições caminháveis.
- Inspeção de todas as salas31–40 no navegador; mapas e close das duas junções. Cinco dimensões de iframe:375×667,375×812,390×844,844×390,1363×768; joystick dentro de todos os quadros. Página temporária removida antes do build.
- Castelo acessado em390×844; som ativado sem erro de aplicação observado. Erros de extensão do navegador desconsiderados. Não é aprovação auditiva da trilha.
- Sem telefone físico, medição de FPS ou campanha completa. Não promete ausência absoluta de qualquer bug. Animais, insetos e Mestre continuam aguardando aprovação do cenário.

## Publicação

Publicado1.49.0/Sites153. Versão salva: appgprj_6ac40994d8d881919d46203a60801e46~appgver_a47db3f3cf288191adc06bc52fa778f9. Deployment appgdep_6ae0af91f05081919413ecd4e0e19230, succeeded em27/10/2026 11:05 America/Sao_Paulo. Fonte Sites24c1cb4f7261fb132341284cde7a470ae49a6ac1; código GitHubac5d0e6a2bec6ed4c92469f7022480697a256d1b.

Conferência pública final: salas31–40 com100/100 auditorias aprovadas; junção ponte/terraço e ponte/escada do castelo vistas em close, sem os pontos de coleta sobrepostos. Visão geral confirma direção e portais separados. Evidências: chapter4-public-1490-audits.json e public-1490-bridge-castle/bridge-terrace/room40.jpg. Documentação posterior não exige nova publicação. Rollback somente se não houver publicação posterior:1.48.2/Sites152, mantendo campaignVersion17 e dados dos jogadores.
