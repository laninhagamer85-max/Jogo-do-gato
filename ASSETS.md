# Assets

**Art direction:** aventura felina ilustrada em 3D de livro infantil; iluminação de fim de tarde, marinho/ciano, madeira quente, tecidos macios e rostos expressivos. Os seis gatos usam a mesma linguagem material e luz do sprite original do Pudim, com silhueta e pelagem próprias. UI não deve cobrir os rostos nem os companheiros.

## Cenários da campanha existentes

| Nível | Cenário | Size | URL no jogo |
|---:|---|---|---|
| 1 | Casa do Começo | 1920×1080 viewport | `/manus-storage/nivel-01-lar_5a7be3d2.webp` |
| 2 | Estufa das Flores | 1920×1080 viewport | `/manus-storage/nivel-02-jardim_c6748045.webp` |
| 3 | Mercado dos Bigodes | 1920×1080 viewport | `/manus-storage/nivel-03-feira_e7681b3d.webp` |
| 4 | Terraço do Sol | 1920×1080 viewport | `/manus-storage/nivel-04-telhado_eb67ef05.webp` |
| 5 | Praia do Ronrom | 1920×1080 viewport | `/manus-storage/nivel-05-praia_cd543731.webp` |
| 6 | Bosque do Novelo | 1920×1080 viewport | `/manus-storage/nivel-06-bosque_f6f3b9ac.webp` |
| 7 | Montanha do Tico | 1920×1080 viewport | `/manus-storage/nivel-07-neve_76e65b80.webp` |
| 8 | Biblioteca Secreta | 1920×1080 viewport | `/manus-storage/nivel-08-biblioteca_1f35f2af.webp` |
| 9 | Domo das Estrelas | 1920×1080 viewport | `/manus-storage/nivel-09-observatorio_0ab887b5.webp` |
| 10 | Casa das Novas Histórias | 1920×1080 viewport | `/manus-storage/nivel-10-festival_66c3d976.webp` |

## Pets e companhia

| ID | Descrição | Size | URL no jogo |
|---|---|---:|---|
| Pudim | Sprite original preservado/fallback | 300×300 px | `/manus-storage/meu-pet-gatinho_11ce8df9.png` |
| menino-prata | Tabby prata, boné azul-petróleo | 300×360 px | `/manus-storage/boy-prata_33684c26.webp` |
| menino-laranja | Laranja, boné azul-marinho | 300×360 px | `/manus-storage/boy-laranja_d9796f62.webp` |
| menino-preto | Tuxedo preto, boné dourado | 300×360 px | `/manus-storage/boy-preto_954326d9.webp` |
| menina-creme | Creme, lacinho rosa | 300×360 px | `/manus-storage/girl-creme_d39b0cb1.webp` |
| menina-calico | Calico tricolor, lacinho coral | 300×360 px | `/manus-storage/girl-calico_fece88f9.webp` |
| menina-azul | Cinza-azulada, lacinho lilás | 300×360 px | `/manus-storage/girl-azul_75498a70.webp` |
| Mimi | Gatinha companheira | 160×160 px | `/manus-storage/companheira-mimi_bc963ec5.webp` |
| Tico | Cachorrinho companheiro | 160×160 px | `/manus-storage/companheiro-tico_da6d680c.webp` |

Boné dos três personagens menino: `/manus-storage/acessorio-bone_b2ac489b.webp`; lacinho dos três personagens menina: `/manus-storage/acessorio-laco_0330607b.webp`.

## Decoração, presentes e instalação

**Coleção por cenário:** 100 sprites WebP RGBA únicos, 384×384 px (13–62 KB cada), dez peças para cada uma das dez casas. Quatro móveis legados foram mantidos; as 96 novas artes são assets individuais com fundo transparente. Tamanho total otimizado: 3.346.716 bytes.

| Nível | Cenário | Itens temáticos | Desbloqueios adicionais |
|---:|---|---:|---|
| 1 | Casa do Começo | 10 | Nível e missões iniciais |
| 2 | Estufa das Flores | 10 | Progressão de nível e missões |
| 3 | Mercado dos Bigodes | 10 | Progressão de nível e missões |
| 4 | Terraço do Sol | 10 | Progressão de nível e missões |
| 5 | Praia do Ronrom | 10 | Progressão de nível e missões |
| 6 | Bosque do Novelo | 10 | Progressão de nível e missões |
| 7 | Montanha do Tico | 10 | Progressão de nível e missões |
| 8 | Biblioteca Secreta | 10 | Progressão de nível e missões |
| 9 | Domo das Estrelas | 10 | Progressão de nível e missões |
| 10 | Casa das Novas Histórias | 10 | Progressão de nível e missões |

Cada URL exclusiva está em `client/src/game/decorationAssets.ts`; nomes, cenário, preço, requisitos e caminho de storage estão em `docs/decoration-catalog.json`. O jogador vê o motivo do bloqueio na loja; níveis ou missões ainda pendentes impedem compra e colocação.

| Asset | Papel | Size | URL no jogo |
|---|---|---:|---|
| Presente surpresa | objeto que cai no quarto e é coletado | 96×112 px | `/manus-storage/gift-surprise_b76a0e8d.webp` |
| Ícone do Meu Pet | PWA/favorito/app instalado | 512×512 px | `/manus-storage/app-icon_5164c636.webp` |

## Voz e som

| Asset | Papel | Arquivo/URL |
|---|---|---|
| Introdução | abertura PT-BR do onboarding | `/manus-storage/onboarding-intro_8ecc6b01.mp3` |
| Boas-vindas menino | fala de onboarding masculina | `/manus-storage/welcome-boy_d22a0e56.mp3` |
| Boas-vindas menina | fala de onboarding feminina | `/manus-storage/welcome-girl_6f356a4f.mp3` |
| Boas-vindas base | frase PT-BR de fallback | `/manus-storage/voz-boas-vindas_487ef5ce.mp3` |
| Cuidado | fala PT-BR de interação | `/manus-storage/voz-cuidado_0e8c8bfd.mp3` |
| Level-up menino | timbre jovem masculino | `/manus-storage/level-boy_832a2a02.mp3` |
| Level-up menina | timbre jovem feminino | `/manus-storage/level-girl_4aa80753.mp3` |
| Mimi | frase engraçada ao tocar | `/manus-storage/voice-mimi_55dee263.mp3` |
| Tico | frase engraçada ao tocar | `/manus-storage/voice-tico_8f84daf9.mp3` |
| Match | chime de combinação/cascata | `/manus-storage/match-combo_c86aadd7.mp3` |
| Toque menino | reação natural PT-BR ao tocar no gatinho | `/manus-storage/pet-tap-boy_148f8d0b.mp3` |
| Toque menina | reação natural PT-BR ao tocar na gatinha | `/manus-storage/pet-tap-girl_7ebb90e7.mp3` |
| Cuidado menino | agradecimento natural PT-BR do gatinho | `/manus-storage/pet-care-boy_8e18ef48.mp3` |
| Cuidado menina | agradecimento natural PT-BR da gatinha | `/manus-storage/pet-care-girl_35dd9364.mp3` |

Novos sprites de runtime ficam otimizados fora do diretório do projeto WebDev e hospedados em storage gerenciado. Para o clone GitHub independente, as fontes equivalentes vivem em `src/assets/` e são importadas pelo Vite. O manifest de instalação é pequeno; o ícone usa o PNG hospedado em storage no WebDev.


## Retrato da idealizadora (2026-09-29)

| Asset | Papel | Dimensões | URL no WebDev |
|---|---|---:|---|
| Foto original otimizada de Allana Gabriela | Retrato da moldura permanente em cada casa e do modal de homenagem; imagem sem texto rasterizado | 1000×1407 px, WebP (~212 KB) | `/manus-storage/allana-gabriela-portrait_0da1a95d.webp` |

A foto foi fornecida e seu uso público no jogo foi autorizado. A moldura, legenda “Allana Gabriela” e texto informativo são elementos acessíveis da interface; não estão gravados nos pixels do retrato. O botão sobre a moldura abre a biografia da idealizadora.


## Aventura lateral (2026-09-29)

| Asset | Uso | Dimensões | Tamanho otimizado | URL no jogo |
|---|---|---:|---:|---|
| Plataforma de grama | Tile visual do chão/plataformas do canvas | 2560×1440 | 382.810 bytes | `/manus-storage/platform-grass_c043c1f0.webp` |
| Portal dourado | Objetivo visual de chegada | 1920×1920 | 349.324 bytes | `/manus-storage/goal-portal_e4d6bfa1.webp` |

Os WebP substituíram no runtime as versões PNG originais (3,1–3,9 MB cada), reduzindo o download total das duas imagens de ~7 MB para ~0,70 MB, sem alterar a geometria do jogo. Originais ficam fora do diretório do projeto em `webdev-static-assets/meu-pet-platformer/`.


## Arte da aventura após polimento (2026-09-29)

| Asset | Uso | Formato/dimensões | URL no WebDev |
|---|---|---|---|
| Piso grama-terra lateral | Superfície walkable de plataformas suspensas e do solo; o topo da imagem coincide com a linha de colisão | WebP RGBA, 1024×1024 | `/manus-storage/grass-earth-side-tile_30281d00.webp` |
| Gato menino prata | Sprite lateral de corrida/pulo para o personagem selecionado | WebP RGBA, otimizado | `/manus-storage/menino-prata-run_7ef210ee.webp` |
| Gato menino laranja | Sprite lateral correspondente | WebP RGBA, otimizado | `/manus-storage/menino-laranja-run_7312d456.webp` |
| Gato menino preto | Sprite lateral correspondente | WebP RGBA, otimizado | `/manus-storage/menino-preto-run_1fb44eca.webp` |
| Gata menina creme | Sprite lateral correspondente | WebP RGBA, otimizado | `/manus-storage/menina-creme-run_91a56382.webp` |
| Gata menina calico | Sprite lateral correspondente | WebP RGBA, otimizado | `/manus-storage/menina-calico-run_f1dd7f6b.webp` |
| Gata menina azul | Sprite lateral correspondente | WebP RGBA, otimizado | `/manus-storage/menina-azul-run_1e430122.webp` |

Os assets são selecionados pelo `characterId` já salvo no perfil. As plataformas usam textura repetida de grama/terra, sombra suave e enfeites de topo; o sprite mantém uma leve oscilação de corrida e orientação para esquerda/direita. A aventura não usa o retrato sentado do cenário como personagem.

## Efeitos sonoros do platformer (2026-09-29)

Sons gerados pelo Web Audio API, sem arquivos adicionais: moedas (arpejo agudo), salto (tom ascendente), impacto em monstro (bump curto), vida perdida (descida grave) e conclusão (acorde/arpejo de quatro notas). Todos respeitam o botão de som existente.