# Lendários do Rei1.0.9 — titularidade da Exploração

Base ativa1.0.8/Sites8, fonte02277b02266d97b79cfb938789af63f0a3918ecb. Meu Pet ativo1.52.3/Sites159. Comparação das fontes:189 arquivos de arte da Exploração idênticos. Cenários, ponte/castelo, NPCs, lendários, oficinas, saves e motor herdados já presentes. As diferenças próprias do Lendários (controles, poderes secundários, textos, conta, perfil,home e bestiário) foram preservadas. A correção nova de fechamento do guia da1.52.3 foi incorporada seletivamente em openPanel/dockAction, sem sobrescrever o componente independente.

Lendários é o destino exclusivo de melhorias da Exploração. AGENTS.md e docs/project-separation.json registram os IDs e o ramo próprio; a rotina existente recebeu a diretriz, sem alterar frequência ou criar outra tarefa. Meu Pet1.52.4 remove os dois menus e as rotas QA da Exploração; dados e fonte histórica preservados. Download do save anterior nas configurações produz JSON compatível com decodeSaved do Lendários. Não há migração silenciosa entre origens nem contas/saves reais alterados.

Validação: TypeScript,21 testes de save/importação, perfil, controles e ponte. Browser em fixtures isoladas: Meu Pet com Aventura100 e Minijogos, sem Exploração no menu/home ou dentro da Aventura; Lendários com motor, controles atuais e guia dispensável/reentrada. Login real não foi executado. Limite da prévia Meu Pet: WebGL indisponível para o cenário3D; menus e Aventura2D foram inspecionados, sem mudar renderizador.

Referências técnicas29/10/2026: MDN Window.localStorage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) e Same-origin policy (https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). Justificam importação explícita entre hosts. Históricos anteriores preservados e relatório recente do guia copiado para docs/lendarios/history.

Rollback: Lendários Sites8; Meu Pet Sites159. Não restaurar Exploração no Meu Pet em novos ciclos.
