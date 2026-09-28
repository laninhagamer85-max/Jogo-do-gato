# Assets do jogo

**Direção de arte:** aventura felina ilustrada como livro 3D infantil; luz de fim de tarde, marinho/ciano, madeira quente, tecidos macios e expressões legíveis. Personagens, objetos e ícone são arte original criada para o jogo; as imagens e falas ficam locais no clone Vite e são incorporadas ao build.

## Casas da campanha

| Nível | Cenário | Arquivo |
|---:|---|---|
| 1 | Casa do Começo | `src/assets/nivel-01-lar.webp` |
| 2 | Estufa das Flores | `src/assets/nivel-02-jardim.webp` |
| 3 | Mercado dos Bigodes | `src/assets/nivel-03-feira.webp` |
| 4 | Terraço do Sol | `src/assets/nivel-04-telhado.webp` |
| 5 | Praia do Ronrom | `src/assets/nivel-05-praia.webp` |
| 6 | Bosque do Novelo | `src/assets/nivel-06-bosque.webp` |
| 7 | Montanha do Tico | `src/assets/nivel-07-neve.webp` |
| 8 | Biblioteca Secreta | `src/assets/nivel-08-biblioteca.webp` |
| 9 | Domo das Estrelas | `src/assets/nivel-09-observatorio.webp` |
| 10 | Casa das Novas Histórias | `src/assets/nivel-10-festival.webp` |

## Personagens, decoração e instalação

| Asset | Arquivo | Uso |
|---|---|---|
| Pudim de referência | `src/assets/meu-pet-gatinho.webp` | fallback/arte de abertura |
| Três meninos | `boy-prata.webp`, `boy-laranja.webp`, `boy-preto.webp` | escolha inicial masculina |
| Três meninas | `girl-creme.webp`, `girl-calico.webp`, `girl-azul.webp` | escolha inicial feminina |
| Boné e lacinho | `acessorio-bone.webp`, `acessorio-laco.webp` | acessórios visuais de perfil/fallback |
| Mimi e Tico | `companheira-mimi.webp`, `companheiro-tico.webp` | companheiros clicáveis |
| Árvore, caminha, planta, luminária | `decor-tower.webp`, `decor-bed.webp`, `decor-plant.webp`, `decor-lamp.webp` | decoração persistente por casa |
| Presente surpresa | `gift-surprise.webp` | recompensa temporária coletável |
| Ícone de arte | `app-icon.webp` | fonte visual do ícone do app |
| Ícones PWA | `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` | instalação compatível |

## Áudio

| Asset | Arquivo | Uso |
|---|---|---|
| Boas-vindas, cuidado e level-up base | `voz-boas-vindas.mp3`, `voz-cuidado.mp3`, `voz-nivel.mp3` | falas curtas em PT-BR |
| Level-up por perfil | `level-boy.mp3`, `level-girl.mp3` | timbres distintos |
| Abertura do onboarding e saudações do pet | `onboarding-intro.mp3`, `welcome-boy.mp3`, `welcome-girl.mp3` | introdução PT-BR e cumprimento masculino/feminino ao selecionar o personagem |
| Companheiros | `voice-mimi.mp3`, `voice-tico.mp3` | frases divertidas ao toque |
| Combinação match-3 | `match-combo.mp3` | chime curto para combos/cascatas |

Vite importa os arquivos por `src/game/assets.ts`; os assets não dependem do storage do WebDev. O modo `?demo=1` usa sprites de demonstração e nunca persiste no save ativo.
