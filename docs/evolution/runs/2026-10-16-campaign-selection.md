# 1.12.0 — seleção de campanha — 16/10/2026

Pedido: antes de entrar na Exploração, mostrar capítulos, salas concluídas, atual/próxima e bloqueadas; permitir escolher salas já vencidas para jogar novamente.

Entrega: painel da expedição com Continuar de onde parou, capítulo/sala/nome atuais, total concluído; dois cartões de bioma com contagem individual e grade de dez salas cada. Botões concluídos permitem repetir/retomar repetição; sala atual continua; salas bloqueadas permanecem visíveis e desabilitadas, com condição de desbloqueio. Trilhas clássicas de enigmas aparecem em seção própria. Não foram inventados outros biomas jogáveis.

Repetição separa tentativa e checkpoint da campanha: posição/HP/bolsa/objetivos/tempo da campanha ficam intactos. XP, estoque guardado e equipamento global acompanham a repetição; consumíveis gastos continuam gastos, saque só é guardado na conclusão. Tentativa parcial salva sua posição, inimigos, coleta e objetivos; novo replay de sala concluída começa uma tentativa nova. Recompensa de conclusão não é concedida novamente. Carta única permanece única. Repetição concluída retorna ao seletor automaticamente, sem avançar outras salas; campanha normal preserva seus portais automáticos.

Save v4 migra v1–v3. roomAttempts guarda snapshots limitados e sem aninhamento; só salas realmente concluídas podem abrir/salvar tentativas. Snapshots antigos e versões futuras são rejeitados. Avanço normal conserva as tentativas. Clientes anteriores rejeitam v4, protegendo de sobrescrita; rollback não permite jogar novo save em versão anterior. Sem edição de contas, autenticação, Minha Casa ou saves reais por ferramentas.

Verificação: TypeScript, 378 testes offline em31 arquivos (motor, seleção, persistência, idempotência, estados bloqueados/finalizados e HTML estático), build com aviso existente de bundle. Testes não são partidas em navegador. Browser suportado indisponível; toque, retrato/paisagem e aparência aguardam teste do usuário. Nenhum FPS medido. Não houve nova arte ou dependência.

Referências técnicas em16/10: https://react.dev/learn/preserving-and-resetting-state — separação da tentativa por instância; https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button — botões desabilitados, rótulos e foco.

Rollback anterior: produto1.11.0 / Sites59 / fonte `5dd283d5e5de2c62b61d6b9da2a57aaeb76b084c` / versão `appgprj_6ac40994d8d881919d46203a60801e46~appgver_d544641ad4788191acc19a7e2a543874`.

Publicação confirmada: produto1.12.0 / Sites60 / fonte `089303ac1ff2ffa68d3d0772b5c266a1a4d9d4e1` / versão `appgprj_6ac40994d8d881919d46203a60801e46~appgver_eaf99c8e081c8191889477f05e388595` / deployment `appgdep_6ad2774be4ac819191ae443bf7c5142f` / https://meupet.aquimeusite.chatgpt.site.
