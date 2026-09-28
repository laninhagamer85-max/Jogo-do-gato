# Assets do jogo

**Direção de arte:** aventura felina ilustrada em perspectiva de livro infantil; madeira quente, tecidos macios, luz de fim de tarde, marinho e ciano, com acentos rosa, violeta e dourado. A interface acompanha a hierarquia da referência enviada sem copiar seus pixels.

O runtime independente importa estes arquivos locais por `src/game/assets.ts`. No WebDev, as mesmas mídias são servidas por storage gerenciado para manter leve o bundle do site.

## Cenários da campanha

| Nível | Casa/capítulo | Arquivo |
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

## Personagens e fala

| Recurso | Arquivo |
|---|---|
| Pudim — sprite transparente | `src/assets/meu-pet-gatinho.webp` |
| Quarto preservado da primeira versão | `src/assets/meu-pet-quarto.webp` |
| Boné — apresentação menino | `src/assets/acessorio-bone.webp` |
| Lacinho — apresentação menina | `src/assets/acessorio-laco.webp` |
| Mimi — gatinha companheira | `src/assets/companheira-mimi.webp` |
| Tico — cão companheiro | `src/assets/companheiro-tico.webp` |
| Voz PT-BR — boas-vindas | `src/assets/voz-boas-vindas.mp3` |
| Voz PT-BR — cuidado | `src/assets/voz-cuidado.mp3` |
| Voz PT-BR — mudança de nível | `src/assets/voz-nivel.mp3` |

Os dez cenários e personagens são originais. Cenários, acessórios e companheiros são WebP otimizados; os clipes de voz são MP3 curtos gerados em português brasileiro. A fala dinâmica do navegador só é usada se houver uma voz `pt-*`, evitando pronúncia em inglês.
