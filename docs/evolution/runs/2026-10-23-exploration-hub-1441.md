# 1.44.1 — mapa maior na entrada da Exploração

Status: validado, preparando publicação. Base Site139 /1.44.0, source b40514963b7f0708b25714cc85647025feb42651. Rollback: versão139. Solicitação: Screenshot_20261023-153955_Meu Pet(1).png, grande bloco de testes antes da trilha.

## Alteração
- Quadro de testes substituído por menu nativo details/summary “Testes”, fechado inicialmente e com Escape para recolher. Mantém visita às vilas, sala31 e sala32/castelo e os mesmos callbacks existentes.
- Cabeçalho, nome do pet e Continuar jogo compactados; alvo de continuar44px. Retrato: duas linhas; paisagem: uma linha.
- Main e mapa usam flex com min-height0; a trilha recebe altura restante, largura disponível e safe-area inferior. Texto explicativo permanece recolhível.
- Alteração só na tela de escolha da Exploração. Cenários, posições das salas, Aventura, controles da partida, progresso, recompensas e autenticação preservados.
- Fixture /qa-exploration-hub usa componente real e save isolado; nenhum dado de conta alterado.

## Validação
TypeScript aprovado;27 testes de trilha/seleção/progresso aprovados. Preservados README, teste adicional de recuperação e relatório da revisão paralela do GitHub75d9b53f1c8b6bdc1440a52f09473118a1a07477; teste do castelo repetido9/9.
Navegador cloud, fixtures (não telefone físico):
| Viewport | Mapa útil medido |
|---|---|
|390x844|352x586|
|375x667|337x415|
|375x812|337x555|
|844x390|814x230|
|1366x768|1326x554|
Continuar visível, menu abre/recolhe com Escape, acesso à sala31 confirmado. Marcos atuais/concluídos/bloqueados e rolagem vertical/horizontal preservados. Não é playthrough da campanha.

Pesquisa: MDN https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length e https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Viewport (2026-10-23), uso de altura disponível e viewport dinâmica; sem novas bibliotecas ou assets.

Build e publicação: preencher após retorno oficial.
