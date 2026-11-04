# Floresta — grama suave e sem repetição em blocos
Data: 15/10/2026, America/Sao_Paulo. Produto alvo: 1.9.10.
David apontou repetição da textura e preferiu o verde mais limpo anterior. Confirmou a direção de correção.

## Mudança
Nova arte original de grama baixa, verde suave e baixo contraste, com poucos detalhes. Sem trevos, folhas grandes ou motivos chamativos. Metadados, prompt e SHA256 em docs/evolution/ground-soft-v2.json.
Removidos createPattern e as cópias espelhadas da textura. Uma única superfície de mundo com margem além do mapa acompanha a câmera; a imagem é aplicada UMA vez nessa superfície, com variações amplas de cor determinísticas e discretas. Não se repetem quadros do cenário nem blocos simétricos. Cache de 1224×1368 pixels, aproximadamente 6,4 MiB por plano, substituído ao mudar o tema.
GroundTheme separa paleta e semente de variação, permitindo materiais diferentes nos próximos biomas. Somente a floresta foi alterada; não foram criados novos capítulos, biomas ou desafios nesta revisão. Objetos/colisão/HUD/inventário/ataque e saves preservados.

## Validação
TypeScript aprovado. 165 testes offline em 24 arquivos aprovados; inclui aparência determinística após reload, variação por semente e cobertura do chão nos cinco tamanhos de referência, em câmera normal e visão geral, por cálculos. Não equivalem a teste visual.
Build aprovado com aviso preexistente de chunks grandes. Entrada Aventura (101 estados sintéticos) e paridade de conta/atlas (49 regiões/67 símbolos, fake storage) aprovadas. Nenhum dado real de jogador alterado.
Arte inspecionada estaticamente. Gameplay visual não executado: control-browser indisponível. Publicação destinada à revisão do usuário, conforme autorização de publicar para testar.
Referência técnica reaproveitada: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern (consultada em 15/10/2026) — o padrão repetido foi removido desta implementação. A superfície agora usa drawImage ancorado à câmera.

## Publicação e próximos passos
Fonte exata anterior: 87be0e9ba507ec48a97b5f237c0812fae2974250, produto 1.9.9 / Sites 28. Ramo de colaboração feat/exploration-combat-pilot-20261015, sem merge/force-push.
Publicação em preparação. Rollback 1.9.9 preservado.
Próximo: David repetir a sala e avaliar cor, simplicidade, leitura de itens e ausência do efeito de ladrilhos ao mover/zoom. Após aceite, seguir com cenários e biomas distintos e desafios próprios, um piloto por vez.

## Publicação confirmada
1.9.10 / Sites 29 publicada em 15/10/2026 às 13:32:08 (America/Sao_Paulo).
URL: https://meupet.aquimeusite.chatgpt.site/
GitHub código: f85f4cca7972bc4ebc0fb56d49081135778e2551
Source commit: 97308fed0d76fe8cbaa728d6c41cec62ae38ab7a
Versão salva: appgprj_6ac40994d8d881919d46203a60801e46~appgver_f0aaaff933e481919546f44b87d0d3e9
Deployment: appgdep_6ad0ffda57f08191bb35b00f2f1b67bc — succeeded.
Pacote oficial validado com gzip antes do envio; 380 arquivos no tar normalizado, 91904000 bytes. Um único deploy desta revisão. Validação visual do usuário pendente; 165 testes offline e build aprovados.
