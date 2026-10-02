# Auditoria de segurança — Meu Pet Virtual

- **Data:** 1 de outubro de 2026 (America/Sao_Paulo)
- **Repositório:** [laninhagamer85-max/Jogo-do-gato](https://github.com/laninhagamer85-max/Jogo-do-gato) — público
- **Branch de trabalho:** `security/audit-privacy-hardening-2026-10`
- **Pull request:** [#3](https://github.com/laninhagamer85-max/Jogo-do-gato/pull/3), aberto para `feature/meu-pet-virtual-refresh`, sem merge.
- **Commit inicial:** `5fa34b6c7f95b53c8d45f194cacd904d51196409`.
- **Commit final verificado:** `e8254ab730daefee8405c2d27e5072da586473cf`.
- **Ambiente avaliado:** checkout local da aplicação estática e preview local de produção em `127.0.0.1:4174`. **Nenhuma publicação/deploy foi feita.**

## 1. Resumo executivo

A aplicação avaliada é um jogo single-player executado no navegador. Não foi encontrado backend de jogo, banco de dados, login, sessão, API de pontuação, upload de arquivos ou painel administrativo no caminho de execução examinado. O perfil do pet, progresso, inventário e preferências são armazenados no `localStorage` do navegador. Assim, não há dados de contas distintas entre as quais testar IDOR, mas também não existe autoridade no servidor para proteger moedas, recompensas ou progresso contra edição local.

**Nenhum padrão de segredo de alta confiança foi encontrado** nos 552 registros de objetos Git alcançáveis e nos arquivos atuais, incluindo build e logs. `pnpm audit` não encontrou vulnerabilidades conhecidas no lockfile consultado. Isso reduz o risco observado, mas não prova que o repositório ou o sistema estejam 100% seguros.

Foram implementados, na branch indicada:

- aviso explícito de armazenamento local e exclusão de dados;
- confirmação antes da remoção, limitada às chaves do Meu Pet;
- cópia de recuperação rotativa, evitando criar backups novos sem limite a cada reinício;
- CSP compatível com os recursos usados pelo jogo e cabeçalhos de segurança no servidor Vite/preview;
- CI de leitura, com ações fixadas por SHA, sem secrets e sem etapa de deploy;
- atualização semanal de dependências via configuração do Dependabot.

O principal risco de privacidade residual é que a página e o repositório públicos contêm uma identificação e imagem pessoais da jovem idealizadora, previamente autorizadas pelo usuário. Essa divulgação é deliberada no produto atual, mas continua sendo dado identificável de uma menor e merece revisão periódica de consentimento e necessidade. Também permanecem pendentes verificações/configurações externas do GitHub e do host de produção, detalhadas abaixo.

## 2. Arquitetura e dados

| Área | Resultado verificado |
|---|---|
| Frontend | React 19 + TypeScript/Vite; Babylon.js na sala e Canvas 2D na aventura. |
| Backend / banco | Nenhum backend ou banco de dados de jogo identificado no fluxo avaliado. |
| Autenticação / autorização | Não aplicável ao jogo atual: não há contas nem rotas autenticadas identificadas. |
| Persistência | `localStorage`; os dados pertencem ao perfil do navegador/origem, não a uma conta sincronizada. |
| Dados do perfil | Nome escolhido para o pet (limitado a 18 caracteres), idade do pet, gênero/aparência e ID do personagem. O formulário pede idade do **pet**, não da criança. |
| Outros dados locais | Progresso, moedas/recompensas virtuais, inventário, casas, decoração, necessidades e preferências de áudio/voz/painéis. Não foi identificado armazenamento de contato ou localização. |
| Foto/compartilhamento | A foto é composta a partir do cenário/canvas e oferecida ao mecanismo de compartilhamento/download do dispositivo; não há endpoint de upload identificado. |
| Serviços externos | Google Fonts é permitido pela política de conteúdo. O componente de mapa existe no código, mas não foi encontrado como integração ativa da página do jogo. Não foi encontrado analytics ou envio de perfil para serviço remoto. |
| Rotas | Aplicação de página única com tela inicial/jogo e fallback. Nenhuma rota administrativa ou API de jogo foi identificada. |
| Hospedagem | Foi verificado apenas o preview local de produção. TLS, HSTS e cabeçalhos servidos pelo domínio real não foram inspecionados. |

## 3. Achados priorizados

| Gravidade / estado | Falha ou risco | Evidência sem dados sensíveis | Correção / resultado |
|---|---|---|---|
| **Alto — risco residual de privacidade** | Identificação e imagem da idealizadora menor são conteúdo público do produto/repositório. | A informação está nos módulos e ativos públicos do jogo. Há autorização explícita anterior para exibição; isso não elimina o risco de exposição ampla ou cópia por terceiros. | **Não removi nem alterei** esse conteúdo, para preservar o escopo já autorizado. Recomenda-se revalidar consentimento/necessidade e, se mudar a decisão, retirar imagem e dados das fontes públicas por um commit normal; apagar arquivos não remove cópias já baixadas nem reescreve o histórico. Não é uma avaliação jurídica de LGPD/COPPA. |
| **Médio — limitação arquitetural, aceitável para single-player** | O navegador controla o save e, portanto, moedas, recompensas e progresso podem ser alterados pelo próprio usuário. | Estado inteiramente em `localStorage`; nenhuma validação/autorização de servidor ou transação de compra real identificada. | **Não há falha de autorização entre contas no produto atual**, pois não existem contas/API. Mantido o comportamento offline. Se houver ranking online, compras reais ou sincronização, mover a autoridade para um backend e validar cada operação no servidor antes de lançar esses recursos. |
| **Médio — implantação não verificada** | O host público pode não enviar CSP e demais cabeçalhos mesmo com as configurações no Vite. | Os cabeçalhos foram confirmados apenas no preview local; o acesso ao host público não fez parte desta validação. Uma meta CSP ajuda a restringir recursos, mas `frame-ancestors` não é aplicado por meta tag. | CSP também é incorporada ao HTML do build; o preview envia CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`. **Pendente:** configurar/verificar cabeçalhos de resposta e HTTPS/HSTS no host real; nenhuma configuração de produção foi alterada. |
| **Baixo — retenção local** | Backups de reinícios antigos podem permanecer no navegador; saves e preferências persistem até limpeza manual. | Versões anteriores gravavam cópias datadas; o app não tinha ação dedicada de exclusão dos dados do jogo. | Agora novos reinícios mantêm uma cópia rotativa, o texto informa armazenamento local e a confirmação apaga apenas chaves do jogo (prefixos `meu-pet-` e a chave legada `pet_estado`). Backups legados existentes podem permanecer até a exclusão explícita. Testes confirmam que chaves de outros apps/origem não são removidas. |
| **Verificado — XSS** | Risco de apelido ser interpretado como HTML. | Busca estática não encontrou `dangerouslySetInnerHTML`, `innerHTML`/`outerHTML` atribuídos, `eval`, `new Function` ou `document.write`; o apelido foi validado no carregamento e limitado a 18 caracteres. | Teste no preview com perfil fictício cujo apelido continha marcação: o texto apareceu escapado no DOM (`&lt;...&gt;`), sem criar elemento a partir do apelido. Nenhum endpoint de entrada no servidor existe para validar. |
| **Verificado — segredos no código** | Credenciais comprometidas no histórico, build, logs ou configuração. | Varredura local de padrões de alta confiança em **552 objetos Git alcançáveis**, arquivos do checkout, build e logs: zero correspondências. Valores não são reproduzidos. | Nenhuma rotação foi indicada pela varredura. **Limite:** varreduras por padrão têm falsos negativos; a listagem de secrets do GitHub não estava acessível ao token e não foi lida. |
| **Verificado — dependências** | Dependências vulneráveis ou instalação sem lock. | 4 dependências diretas e 9 de desenvolvimento; registry pnpm configurado como o registry oficial npm; versão/lockfile preservados. `pnpm audit`: “No known vulnerabilities found”. | Nenhuma atualização de pacote foi necessária. Foram adicionados CI com `pnpm audit` e configuração semanal do Dependabot para updates de versão. O job do GitHub ainda depende da execução após abertura do PR. |
| **Pendente — configuração de repositório** | Ações do GitHub permissivas; proteção de `main` não comprovada; estados de secret scanning indisponíveis para reconsulta. | `viewerPermission=ADMIN`, repositório público; API atual informou `allowed_actions=all` e `sha_pinning_required=false`. APIs de lista de secrets e alertas retornaram **403**; proteção de `main` retornou **404**. Um snapshot somente leitura anterior nesta mesma auditoria registrou secret scanning e push protection habilitados, detecção de padrões não-provider e verificação de validade desabilitadas; não foi possível revalidar esses toggles agora. | Workflow novo usa permissões `contents: read`, `persist-credentials: false`, actions pinadas por SHA, sem secrets e sem deploy. Dependabot semanal foi configurado no repositório. **Não alterei** settings externos, secrets, regras de branch nem permissões existentes. Proteção da branch requer definição explícita de revisões/checks/bypass para não bloquear o mantenedor. |
| **Não aplicável** | SQL/NoSQL injection, CSRF de sessão, IDOR, uploads, prompt injection, abuso de login/API e isolamento entre duas contas. | Nenhum SQL/NoSQL, login, sessão, formulário remoto, conta, upload, IA, API de conta ou ranking foi identificado no jogo avaliado. | Não foram inventados testes contra serviços inexistentes. Caso sejam adicionados, essas verificações tornam-se necessárias antes do lançamento. |

## 4. Testes executados

| Teste | Resultado |
|---|---|
| `pnpm test` | **Passou: 3/3** testes do armazenamento. Cobrem preservação do backup legado, backup rotativo do save anterior e exclusão restrita às chaves do jogo. Node 22 emitiu apenas o aviso conhecido de `--experimental-strip-types`. |
| `pnpm check` | **Passou:** `tsc --noEmit`. |
| `pnpm build` | **Passou:** Vite produziu o build; CSP está presente no HTML compilado. Aviso não bloqueante de bundle grande (chunk Babylon/Canvas acima de 500 kB). |
| `pnpm audit` | **Passou:** nenhum advisory conhecido no lockfile consultado. |
| YAML + políticas do workflow | **Passou:** workflow e Dependabot parseados; permissões limitadas a `contents: read`; nenhum passo de deploy; ações fixadas por SHA. |
| `git diff --check` | **Passou:** sem erros de whitespace. |
| CI GitHub | **Passou:** `Quality and dependency security/validate` concluiu com sucesso (45 s) no commit final `e8254ab`. |
| Preview local de produção + console | **Passou:** HTTP 200 em loopback, aplicação/WebGL2 renderizados, CSP e cabeçalhos presentes, sem erro de runtime/CSP após recarga limpa. Testado também `fetch(data:)` usado para transformar a imagem do canvas em Blob. |
| UX de exclusão | **Passou com dados fictícios:** abrir/cancelar não apaga; confirmar remove dados prefixados do jogo e preserva uma chave de outro app/origem. O perfil sintético de XSS foi apagado após o teste. |
| Host/domínio publicado | **Não verificado:** sem teste de TLS/HSTS/cabeçalhos no domínio real; nenhuma alteração de `allowedHosts` ou publicação foi feita. |
| CI GitHub | **Não executado ainda:** workflow foi validado localmente e será acionado pelo PR. |

## 5. GitHub, configurações externas e itens pendentes

- O repositório é público e o checkout está associado ao PR de feature #2, que permanece separado. As alterações de segurança estão em uma branch dedicada e devem ser apresentadas em um PR próprio para a branch da feature; não devem ser mescladas nem publicadas sem nova autorização.
- O job de CI adiciona typecheck, testes, build e audit em `pull_request` e `push` para `main`. As actions `checkout` e `setup-node` são fixadas por SHA; o workflow não usa secrets, não concede escrita e não publica artefatos. O check `Quality and dependency security/validate` passou no commit final.
- O arquivo Dependabot agenda atualizações semanais agrupadas por produção/desenvolvimento. A chave de **Dependabot security updates** do GitHub é uma configuração externa diferente e não foi alterada; o snapshot anterior a registrou desativada, mas não foi possível confirmar o estado atual.
- A listagem de secrets e alertas do GitHub retornou 403. **Nenhum nome ou valor de secret foi exposto ou reproduzido.** A API também não retornou dados de proteção de `main` (404). O mantenedor deve revisar essas opções na interface do repositório.
- O setting atual de GitHub Actions permite todas as actions e não exige pin por SHA. O workflow novo já fixa suas duas actions; não alterei a política global do repositório.
- **Proteção de branch não aplicada:** a API retornou 404 para a proteção de `main` e a lista de rulesets retornou vazia. Exigir PR, número de aprovações, checks obrigatórios, bypass de administradores e bloqueio de force-push/deleção afetam o fluxo de trabalho e precisam de escolha explícita. Recomendo no mínimo exigir PR e bloquear force-push/deleção; para checks obrigatórios, selecionar `validate`, que já passou no PR.
- **Produção não tocada:** host real, settings de deploy, configurações GitHub, dados reais de navegador e histórico Git não foram alterados. Nenhum teste destrutivo, de carga ou em serviço de terceiros foi realizado.

## 6. Aplicação e reversão

A aplicação é feita pelo PR dedicado: revisar o diff, aguardar os checks e decidir separadamente se deseja mesclar. Não há migração de servidor. A exclusão local de dados só ocorre após ação explícita no jogo e não pode ser desfeita; o helper/teste preserva dados de outras aplicações. Para reverter o hardening no repositório, fechar o PR antes de merge ou, após merge autorizado, usar um commit de reversão normal — **não reescrever o histórico**.

## 7. Limitações e risco residual

Esta auditoria é estática e funcional, não um pentest externo nem certificação. Não houve acesso às configurações privadas de secrets/alertas do GitHub nem ao painel do host de produção. Também não foram testadas contas, uploads ou APIs porque não existem no fluxo avaliado. Uma varredura por regex não substitui secret scanning do provedor. A aplicação continua sendo um jogo offline sem proteção de servidor contra edição do save; isso só se torna um risco de integridade para terceiros caso sejam introduzidas contas, ranking online, compras reais ou sincronização.
