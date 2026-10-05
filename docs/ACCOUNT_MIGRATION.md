# Meu Pet Virtual — transferência entre contas Manus

Snapshot de origem: checkpoint WebDev `686d28a` (2026-10-05). Este ramo é uma cópia de código para importação; não é uma publicação nem substitui o projeto de origem.

## O que este ramo contém

Código React/Express/tRPC, schema e migrações Drizzle, testes, documentação de autenticação e lógica do jogo. O ramo foi criado isoladamente para migração; os ramos e PRs anteriores permanecem intactos.

## O que não contém

Nenhum `.env`, chave privada ou valor secreto. Defina as configurações necessárias no painel protegido da conta/projeto de destino; não copie `DATABASE_URL` da origem. A base de destino deve ser nova e receber as migrações deste ramo. Reconfigure as integrações Firebase através do formulário seguro.

Os binários de jogo referenciados em `/manus-storage/` são armazenados separadamente e não fazem parte do Git. Use o pacote de assets separado e reenvie cada ficheiro ao armazenamento Manus do projeto de destino; depois atualize os caminhos devolvidos em `client/src/game/assets.ts`, `client/src/game/decorationAssets.ts` e demais referências. Não apague o armazenamento da origem.

## Dados atuais da origem

A consulta agregada de 2026-10-05 encontrou zero registos em `users`, `guardian_accounts`, `child_profiles`, `auth_sessions`, `notice_acknowledgements` e `admin_audit_events`, e um registo em `security_events`. Não existem contas de teste, perfis infantis ou progresso de jogo na base para copiar. O único evento de segurança não é exportado para o repositório.

## Base e autenticação no destino

1. Criar o projeto WebDev destino em modo não publicado e importar este ramo.
2. Usar a base de dados provisionada para o destino e aplicar a migração Drizzle existente segundo o fluxo WebDev; confirmar schema com consultas agregadas.
3. Configurar Firebase e App Check no painel protegido, verificar Google, email/senha, email verificado, TOTP e token App Check antes de permitir registos reais.
4. Reexecutar `pnpm check`, `pnpm test`, `pnpm build` e o QA de isolamento apenas contra a base de desenvolvimento.
5. O domínio oficial atual continua associado à origem. Validar no preview do destino primeiro; não publicar, não mover nem desligar o domínio até o destino estar validado e o operador confirmar a troca.

**Bloqueadores conhecidos (2026-10-05):** TOTP/MFA continua desativado no Identity Platform; a emissão do token App Check foi limitada (`appCheck/throttled`) e a chave/site key reCAPTCHA ainda precisa de validação do hostname oficial no destino. Não criar contas reais nem publicar enquanto estes controlos estiverem pendentes.

## Domínio canónico

A origem permanece `https://meupetgame-4hwhw32b.manus.space`. No destino, `CANONICAL_SITE_ORIGIN` pode apontar para o domínio oficial depois de a plataforma o atribuir/reassociar. O valor deve ser definido no ambiente protegido do servidor. Até à transferência confirmada, manter o domínio ligado à origem e não publicar o destino.
