# Clareira ampliada — 1.9.34

Base: Site 1.9.33, commit 17c0bd0b182a9287d393b6e82704cb4e5f4ffcdb. David solicitou implementação e publicação para testar no celular.

Área elíptica de 26×20 unidades substitui a barreira de 12×8 caminhável; câmera acompanha o pet e enquadra toda a área em visão geral. Vegetação anterior preservada, novos grupos esparsos e margem de floresta arredondada. Gramado da 1.9.32 preservado sem alteração de textura, cor ou orientação. A geometria do mundo não muda ao girar o aparelho; o enquadramento acompanha o viewport.

Minimapa ampliado; migração explícita dos índices antigos 14×10 para coordenadas mundiais, sem perda de descobertas. Leitura de coordenadas negativas e preservação de XP/itens testadas em dados isolados.

Portal original gerado com imagegen: arco pintado de madeira/pedras/musgo transparente, sem texto/vetor/personagens, luz superior esquerda. Prompt pede vista 3/4 superior, cores naturais e abertura transparente. Arquivo: client/public/forest-adventure/woodland-portal-v1.webp. Brilho e cinco luzes suaves somente quando ativo; respeita reduzir movimento. Mesma posição de interação e mesma conclusão piloto: esta revisão não acrescenta dez salas.

Verificação: TypeScript e 195 testes em 24 arquivos de game passaram. Inclui caminhos além das quatro bordas anteriores, saves na expansão e migração de descoberta. Browser QA e FPS não medidos: control-browser indisponível, sem improvisar outro navegador. Publicação autorizada para revisão do usuário, não validação visual concluída. Ajustada tolerância de cobertura em teste para 1e-7 devido a arredondamento de ponto flutuante.

Referências técnicas consultadas em 16/10/2026: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection (separação de decoração/hitbox); https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage (dimensões de sprites).

Rollback: preservar versão 52 do Sites (1.9.33), não reverter publicação posterior. Próximo: usuário testa retrato/paisagem, atravessa as quatro antigas bordas, retorna ao abrigo, verifica minimapa, portal e fluidez.

Publicação concluída: Sites 53 / produto 1.9.34, appgdep_6ad232b2bda08191bd52c7bdfa261da6; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_42e6378904508191b8a330b3faed6669; fonte aec0e87bfb11056203e92311d9682c77c0b34f0c; código GitHub 74a2bade7a4ed5649e6288d93b0941c5515d79b8. Build aprovado. URL https://meupet.aquimeusite.chatgpt.site. Aparência/fluidez aguardam teste do usuário.
