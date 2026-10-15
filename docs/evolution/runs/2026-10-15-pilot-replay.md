# Repetir sala piloto — correção de bloqueio
Data: 15/10/2026, America/Sao_Paulo. Versão alvo: 1.9.7.
Problema relatado por David: após concluir a sala, a tela “Sala piloto concluída” impede novos testes da 1.9.6.

## Mudança
Botão “Repetir sala piloto” na tela de conclusão, com retorno ao acampamento e reinício de inimigos, coletas e objetivo da tentativa. Nível/XP de combate, estoque, bolsa existente, equipamento, energia, histórico de derrotas e sequência aleatória são preservados; HP é restaurado no ponto seguro. Não repõe ervas/frutas iniciais.
Novo indicador completionRewardClaimed: saves antigos com completed=true são tratados como bônus já recebido. A conclusão repetida guarda a nova coleta, mas não entrega o broche outra vez. XP e coleta das novas lutas continuam normais; o bônus de conclusão é único.
Revisão monotônica preservada para não ser rejeitada pelo salvamento. Nenhuma partida real foi editada.

## Validação
Casos novos: replay preserva progressão/inventário; migração da conclusão antiga; conclusão repetida idempotente; reload da tentativa reaberta; tentativa ativa não é reiniciada.
TypeScript, suíte offline e build: resultados registrados após execução nesta revisão.
Sem teste em navegador suportado: control-browser indisponível. Publicação autorizada para revisão do próprio usuário, conforme instruções anteriores de publicar para testar. Sem alegação de teste visual real.
Mesma fonte exata da publicação 1.9.6 recuperada pelo fluxo oficial Sites, commit 018464cb7155bae0863e970c78cfc5500d11cb1d; não foi usada fonte antiga do recovery.
Rollback: 1.9.6 / Sites 25 preservada. Nenhum merge/force-push.
Próximo: David atualizar a página e entrar em Exploração → Sala piloto → Repetir sala piloto.

Resultados: TypeScript aprovado, 144/144 testes offline em 22 arquivos, build aprovado (aviso existente de chunks grandes).

## Publicação confirmada
1.9.7 / Sites 26 publicada em 15/10/2026 às 11:03:28 (America/Sao_Paulo).
URL: https://meupet.aquimeusite.chatgpt.site/
Source commit: 9f03845c5a7ca3de0b3874e08b2583a906abbc13
GitHub código: 08295a37ba7dd372874c78ad448992cde40e70fa
Versão salva: appgprj_6ac40994d8d881919d46203a60801e46~appgver_7f4918ea4dfc8191995c54bb48953191
Deployment: appgdep_6ad0dd193dac8191955a12ae5aa1f08a — succeeded.
Pacote oficial validado com gzip antes do upload. Nenhuma tentativa de deploy duplicada. Save real do usuário não foi editado; reabertura depende do toque explícito no novo botão. Validação visual pelo usuário segue pendente.
