# 20/11/2026 — Novidades atuais e acesso às atualizações

Base confirmada do Lendários do Rei: **1.0.104**, Sites 107, fonte `40ed5879090aab375c2b4151557bee7e2cf896c3`. O HEAD do Site coincidia com a publicação. Foram lidos AGENTS.md, README, README da aplicação, documentação de recuperação, estado e relatório anterior. A fonte atual inclui as mudanças recentes da fauna, captura e sincronização; todas preservadas. Nenhuma alteração no Meu Pet Virtual.

## Problema e entrega

A home ainda fixava a notícia do capítulo4 (1.0.53), acompanhada de três notícias antigas, mesmo com a1.0.104 publicada. A página de novidades ainda anunciava quatro capítulos e40salas. Isso dificultava encontrar as alterações recentes e contradizia o catálogo público de cinco capítulos.

Em `client/src/LendariosNews.tsx`:
- O destaque usa a primeira notícia da lista de publicações, com sua versão, categoria, título e resumo.
- Os três atalhos seguintes usam as três notícias imediatamente anteriores, sem repetir o destaque.
- O link “Ler a atualização” abre o artigo correspondente em /novidades/. Removidos o rótulo fixo “CAPÍTULO4 · SALAS31–40”, os números decorativos dessas salas e a instrução de progressão que não se aplicava a todas as notícias.
- A quantidade de capítulos vem de `lendariosCodex.json`, catálogo público já utilizado pelo site. Não foi importado o catálogo privado nem dados de conta.
- Notícia da1.0.105 registrada em `client/src/lib/lendariosNews.ts`; versão de produto em package.json. Sem mudar CSS, dependências, modelos de personagem, físicas, combate ou saves.

## Pesquisa — 20/11/2026

- https://www.w3.org/WAI/tutorials/page-structure/headings/ — manter a hierarquia existente de títulos e conteúdo compreensível.
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a — preservar links nativos para os artigos identificados por fragmento, em vez de acrescentar controles de navegação artificiais.

## Validação

- **23/23 testes existentes** de acesso, instalação e controles aprovados. Não são testes de gameplay nem uma execução da suíte completa.
- TypeScript do jogo e host aprovado. Build oficial Worker aprovado, com **574 assets preservados conferidos byte a byte**. Nenhuma atualização de dependência/lockfile.
- Chrome na prévia oficial, carregando as páginas reais do site em iframe de dimensões controladas:375×667,375×812,390×844,844×390 e1366×768. O destaque e os três cartões couberam lateralmente nas cinco larguras; a coluna lateral de novidades também.
- Destaque mostrou1.0.105; atalhos mostraram1.0.104,1.0.103 e1.0.102. Foram clicados o destaque e cada um dos três atalhos; abriram /novidades/ com os fragmentos corretos:novidades-em-dia,poção-arrastar,sincronizacao-salas e movimentos-fauna. O fragmento com acentos foi codificado pelo navegador e o artigo abriu.
- A página mostrou “5 capítulos para explorar”. Foram inspecionados o quadro em retrato e sua disposição em duas colunas na horizontal. Essa é uma conferência da interface web, não um teste de toque/aparelho físico.
- Sem login, partidas reais, desbloqueios ou acesso a saves. Não foram criadas novas cenas de carregamento nesta correção de navegação; as existentes e a fila de preparação permanecem intactas. Sem alegação de auditoria de fases ou medição de memória/FPS.
- Página de QA removida antes do pacote.

Próximo: testar a navegação em celular real e revisar a rotação automática do carrossel. A fonte contém um avanço com módulo fixo4 apesar de haver7slides; a correção dessa outra área não faz parte desta entrega.

## Publicação

**Publicada a 1.0.105**, Sites 108, fonte `e4fd2418438591d178c4ec06ba076276417da2e6`, versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_6b18e0b5d9e48191a6fa47a64e4a0c60`, deploy `appgdep_6b00352bd88c8191953cc43bcef889d8`, status `succeeded`, concluído em `2026-11-20T11:55:34.123327+00:00`.

Na conferência posterior em produção, a home exibiu o destaque 1.0.105. O link “Ler a atualização” abriu [o artigo publicado](https://lendarios-do-rei.aquimeusite.chatgpt.site/novidades/#novidades-em-dia); a página mostrou os cinco capítulos. Não foi necessário login. [Código em patch](https://github.com/laninhagamer85-max/Jogo-do-gato/blob/18a0cef1111ec74af3b5f8046c6b6c340a686fb3/docs/lendarios/reviews/2026-11-20/current-news.patch), preservado antes da publicação.

Rollback de referência: 1.0.104 / Sites107, versão `appgprj_6ae2a66e7f4c8191860c2d39db928ac7~appgver_171e457824608191a087e5994077d43b`, deploy `appgdep_6afff33c1cb08191b1c6149c9ac183ff`. Reverter somente se a1.0.105 continuar ativa e houver regressão confirmada; preservar qualquer publicação posterior. Público, domínio, autenticação e dados dos jogadores mantidos.
