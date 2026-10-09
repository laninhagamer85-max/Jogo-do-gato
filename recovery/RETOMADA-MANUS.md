# Meu Pet Virtual — revisão móvel e colaboração

Atualização: 09/10/2026. Responsável: Web Agência AD / David.

## Base preservada

- Fonte editável: `sites/prepare-meu-pet-virtual-20261005`, commit `c146e1c39f22d7728d8d8bda8d9e3f5d5d5bb844`.
- Distribuição publicada v7: commit Sites `e35d4340f766801b36450ff2ab620dca367d1af8`.
- Trabalho desta etapa: ramo `recovery/mobile-review-20261009`.
- `recovery/published-v7/` contém os 193 arquivos públicos originais da v7. `v7-manifest.json` registra seus hashes SHA-256.
- `client/public/manus-storage/` contém as 158 mídias recuperadas. O atlas de ícones fica em `client/public/ui/`.

O código editável antecede a v7. A v7 tem mudanças de ícones e painel de conta ainda não conciliadas integralmente com os componentes React recuperados. **Não publicar o build padrão como substituto da v7 antes dessa conciliação.** Os dois estados estão preservados neste ramo, com origem identificada.

## Correções implementadas

- Novo CSS final `client/src/components/AdventureMobile.css`, aplicado após os estilos antigos.
- Gato de 104 × 108 px à esquerda em retrato, nome de 16 px e descrição de mundo de 15 px.
- Abas de mundos e cartões de fases com textos maiores e rolagem horizontal própria.
- Direções de 64 × 64 px; salto de 76 × 76 px; controles auxiliares de pelo menos 44 px.
- Diálogos de pausa/recompensa usam a tela móvel disponível e podem rolar, inclusive na horizontal.
- Centralização da fase disponível passa a rolar somente o carrossel. A página não salta para baixo ao abrir o mapa.
- Lockfile sincronizado com o patch Wouter já presente; nenhuma versão de dependência foi atualizada. Scripts de instalação de dependências continuam explicitamente bloqueados.
- A configuração do patch aparece também em `package.json#pnpm` para o pnpm 10.4.1 fixado pelo projeto; o arquivo de workspace atende ao pnpm 11 usado pelo ambiente. Isso evita divergência na instalação com lockfile congelado.
- Desenvolvimento do cliente: `pnpm dev`. O fluxo anterior com Express permanece em `pnpm dev:server`.

## Como executar

1. Instalar as dependências com o lockfile: `pnpm install --frozen-lockfile`.
2. Rodar `pnpm dev` e abrir `/qa-review.html` para a revisão local da aventura.
3. A demonstração usa estado apenas em memória: não faz login, não lê partidas reais nem grava progresso de contas. Essas páginas não fazem parte do build de produção.
4. `pnpm check` verifica TypeScript. `pnpm build` gera o cliente e o servidor editáveis, ainda sujeitos à conciliação da v7.
5. `pnpm build:recovery` gera `out/` a partir da distribuição v7 preservada, com apenas o CSS móvel e uma substituição exata e verificada da expressão de rolagem. As regras de autenticação, progresso, recompensas e o atlas permanecem na distribuição original.

O build de recuperação verifica os 193 hashes antes de produzir qualquer saída. Toda a pasta de módulos recebe um novo caminho para evitar mistura entre arquivos em cache; imports entre módulos continuam relativos. Não editar o JavaScript minificado manualmente. A solução definitiva é conciliar os componentes e voltar a um único build de fonte.

## Verificações realizadas

- Instalação com lockfile e verificação de dependências concluídas no ambiente de trabalho.
- A compatibilidade do lockfile também foi conferida com o pnpm 10.4.1 do projeto, usando `install --lockfile-only --frozen-lockfile --ignore-scripts`.
- Build Vite e TypeScript sem erros.
- Revisão no navegador usando o componente real com partida de demonstração em quadros de 390 × 844, 375 × 812 e 844 × 390 px.
- Conferidos: gato/textos, ausência de overflow horizontal global em 375 px, início da fase 1, renderização do cenário, dimensões dos controles, pausa e retorno ao mapa.
- Diálogo cortado na horizontal foi reproduzido e corrigido; sua área passou a cobrir os 390 px disponíveis.
- Verificada exclusão das páginas de QA do build de produção.
- Comparação de bytes: a saída altera o HTML, a expressão de rolagem do módulo principal e os caminhos de pré-carregamento de dois módulos. O CSS novo é adicionado. O restante do código e todas as mídias permanecem iguais; os 193 arquivos da cópia original ficam intactos.

Estes testes não são uma conclusão das 100 fases, uma auditoria completa dos minijogos nem um teste de autenticação com conta real. A publicação online não foi alterada nesta recuperação. O backup não contém dados, senhas ou partidas dos jogadores.

## Próxima entrega do Manus

Criar um ramo a partir desta revisão e trabalhar por PR, sem substituir `main` nem mesclar PRs existentes automaticamente.

1. Conciliar o painel de conta e o componente `pet-symbol`/atlas da v7 com a fonte React. Verificar login, saída, isolamento do progresso por conta e recursos da casa.
2. Auditar os tamanhos dos ícones dentro de cada minijogo. A correção atual cobre a aventura.
3. Criar **uma fase piloto** de floresta com escadas, pontes, plataformas em alturas distintas e câmera vertical, usando as referências enviadas como direção visual.
4. Validar colisões, subida/descida, câmera, controles e recompensa antes de expandir as fases.
5. Evoluir a seleção de mundos para ilhas. Resolver a relação entre gatos jogáveis, novas espécies e mascotes sem alterar silenciosamente os saves.
6. Registrar testes por fase: dispositivo, dificuldade, bugs, recompensa e se o resultado veio de simulação ou de uma partida realmente concluída na conta online.

As cinco referências originais continuam no registro de retomada do projeto. Não estão embutidas neste ramo; as mídias aqui são as usadas pela v7. Não declarar a implementação das novas referências como concluída.
