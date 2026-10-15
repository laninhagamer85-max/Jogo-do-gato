# Nitidez e proporções da Exploração — 15/10/2026

Base pública: produto 1.9.11, Sites 30, fonte 1c4b222c031591f69d4f1aab506597fb79919b6f. Revisão alvo 1.9.12.

Evidência: inspecionadas as capturas fornecidas Screenshot_20261015-143958_Meu Pet.png (retrato) e Screenshot_20261015-143949_Meu Pet.png (paisagem). Gramado com formas grandes desfocadas, tronco achatado, elementos do perímetro esticados e aviso atravessando a região central do gato na horizontal.

Causas: imagem de chão 1254px distribuída por 34×38 unidades, cache de 36px/unidade ampliado pela câmera; destino dos objetos com escalas independentes em X/Y sobre células quadradas com transparência. Densidade do Canvas limitada a 2 em telas com DPR superior.

Correções: fundo pintado passa a ser apenas variação de cor suave, com detalhes vetoriais de folhas/grama na resolução do Canvas, sem ampliar essa camada de detalhes. Distribuição por hash de coordenadas mundiais: não repete um carimbo e não desliza com a câmera. Renderização limitada às células visíveis com quatro preenchimentos agrupados. Recorte dos seis objetos pelos limites reais do conteúdo transparente, escala uniforme contida na área de desenho e ancoragem pelo pé. Mantidas geometrias de colisão, progresso e mapas. Canvas acompanha DPR até 3, com limite de aproximadamente 6 milhões de pixels para controlar memória. Aviso reposicionado na faixa superior horizontal.

Pesquisa técnica consultada em 15/10/2026: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage (recorte e dimensões naturais); https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas (limitar operações e buffer). Arte existente original mantida; grama vetorial nativa escrita na fonte. Não alteradas imagens de referência.

Verificação: TypeScript aprovado, 178 testes offline em 25 arquivos. Novas verificações preservam proporção e apoio dos seis objetos em cinco dimensões/zoom, escala real de desenho do tronco, distribuição fixa não repetida da grama e densidade em rotação/memória do buffer. Build aprovado (aviso preexistente de chunk grande), entrada aprovada em 101 estados simulados e paridade aprovada com armazenamento fictício; sem chamadas Firebase.

Limites: sem control-browser, não houve inspeção real do jogo, benchmark de desempenho em aparelho nem partida online. Capturas do usuário comprovam o problema anterior, não a correção. Publicação para revisão do usuário autorizada na conversa; aguardando retorno visual em retrato e horizontal. Nenhum save real alterado. Uma sala piloto; sem alegação de 60 salas ou 100 fases auditadas.

Publicação: em preparação. Rollback produto 1.9.11, Sites 30. Próximo: David conferir nitidez, escala e passagens; depois continuar itens/adversários/biomas.
