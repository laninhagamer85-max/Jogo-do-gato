# Navegação da sala e iluminação da clareira — 16/10/2026

David pediu três acessos diretos na primeira tela após login: Aventura, Exploração e Minijogos. No retrato, preservar a visão central da sala e do pet; adaptar no paisagem. A expansão progressiva do mapa fica planejada, sem implementação neste ciclo. A correção visual autorizada do piloto usa a aparência real do capítulo 1 como base.

## Fonte e comparação

Fonte Sites 41 / f2d17db2cae5adf7898b443a08a0a96e79a3a095; código GitHub 499f2ac3e0e3c050dd5d85538961fe444fbb1cc7. Reaberto pelo helper oficial. Os oito arquivos alterados existentes tiveram o blob comparado com o HEAD do GitHub; todos iguais. Nenhum AGENTS.md no checkout. Código desta revisão: 3febb7ec4681a91913c015caf8cd4c01379ed1c5.

Inspeção real da versão 1.9.22, em paisagem: piloto muito amarelo/luminoso, com manchas diagonais; sala 1 do capítulo 1 tem bordas sobrepostas e centro suave. A fonte ForestPuzzleAdventure desenha clearing.webp sobre #416a3c com alpha .48 e depois rgba(20,40,29,.22). A revisão anterior só usou a arte original, sem considerar essa iluminação de apresentação.

## Alterações

- Uma faixa com os três modos, ícones vetoriais e rótulos, alvos de no mínimo 44 px. Removidos os atalhos Aventura duplicados no cabeçalho. Exploração abre diretamente a seleção de capítulos, reutilizando a rota e a preservação de progresso existentes, sem passar pelo mapa lateral.
- No retrato, Cuidar/Status/Mochila ficam nas bordas inferiores. Painéis de cuidados e status fechados inicialmente e abertos sob demanda; toque em área livre fecha o painel. O conteúdo usa os painéis existentes. Centro livre por padrão, missão no rodapé e demais atalhos de foto/casas/decor preservados. Tela limpa mantém sua função.
- CSS próprio carregado depois do CSS legado, com variantes de retrato e paisagem; tutorial atualizado para os acessos atuais. Não foi medida a posição em um aparelho ainda.
- Gramado usa a mesma base, opacidade e sombra do capítulo 1 renderizado. A textura aprovada e os patches/cache continuam os mesmos; a mistura reduz o contraste tonal das manchas, sem afirmar remoção de repetição perceptiva antes da comparação.
- Atlas de folhagens/pedras/troncos recebe sombra coerente em canvas transparente separado, calculado uma vez por imagem com source-atop. Custo adicional do atlas atual: 6 MiB, separado do LRU de terreno de 8 MP. Não há filtro/processamento de imagem por frame. Pet, inimigos, coleta, textos e barras não recebem essa redução de alpha.

Sem novas salas, biomas, espécies, drops ou regras de progressão. O desbloqueio/revelação de mapa é uma próxima etapa, não conteúdo pronto. Não alterados dados de conta, domínio, autenticação ou permissões.

## Verificação e limites

TypeScript aprovado e 212 testes offline em 29 arquivos aprovados. Integração Firebase de staging excluída por ausência de credencial, sem alegação de autenticação testada pela suíte. Testes de cobertura de terreno ajustados para as duas camadas de iluminação; não substituem comparação visual. Build do release aprovado, preservando os atlas e a configuração pública existente.

control-browser/preview gerenciado indisponível: não iniciado preview alternativo, não instalado navegador. A autorização persistente e explícita para publicar e revisar no aparelho continua aplicável; não equivale a aceite. O navegador público já autenticado permite inspecionar a produção depois do deploy, sem medir retrato ou FPS. Sua Minha Casa 3D avisa WebGL indisponível, limitando a comparação do pet no cenário 3D.

Fontes primárias consultadas em 16/10/2026:
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation — source-atop preserva os vazios do atlas.
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas — pré-renderização dos desenhos repetidos, preservado cache limitado.

Próximo: publicar uma revisão no mesmo Site, verificar três acessos no navegador público e revisar no celular em retrato/paisagem antes de expandir. Rollback: 1.9.22 / Sites 41, somente se continuar sendo o predecessor imediato.

## Publicação e inspeção confirmadas

Produto 1.9.23 / Sites 42. Status succeeded; commit Sites 15e491444fd4055200f6a226d6cc663383905bb0; código GitHub 3febb7ec4681a91913c015caf8cd4c01379ed1c5. Versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_8525cc60460c819181dbae320b9ba415; deployment appgdep_6ad1b5faaf3881918d456ececb04ffcc. URL https://meupet.aquimeusite.chatgpt.site. Arquivo tar integralmente legível; manifesto confere com o projeto.

No navegador público autenticado, conferidos os três botões no alto da sala de estar: Aventura abre mapa e volta, Minijogos abre o catálogo de 11 jogos e fecha, Exploração abre diretamente os capítulos. Entrou no piloto e observou o gramado em câmera próxima e Ver sala: amarelo/brilho e contraste das manchas reduzidos; a avaliação estética final é de David. A textura ainda pode mostrar repetição; não alegar eliminação. Minha Casa segue sem WebGL neste navegador, portanto não se verificou o pet 3D, nem retrato móvel ou fluidez/FPS. Não completada nenhuma fase nem concedidas recompensas. Sessão mantida em inspeção pausada.
