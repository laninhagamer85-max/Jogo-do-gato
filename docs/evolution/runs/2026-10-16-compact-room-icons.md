# Atalhos compactos e ícones da biblioteca — 16/10/2026

David reprovou o formato/cores dos três atalhos da 1.9.23 e o painel Cuidar grande no retrato. Pediu os ícones ilustrados já disponíveis no jogo, incluindo Mochila/Cuidar/Status.

Base pública: produto 1.9.23 / Sites 42, fonte 15e491444fd4055200f6a226d6cc663383905bb0. GitHub b0b243151c49607e8360c467d742267170a467a6; quatro blobs conferidos iguais antes de alterar. Código desta revisão a4e49ad94a70b3bbfa1cdd14820ef0af346fd79e. Reaberta fonte com helper oficial, sem AGENTS.md. Mesmo projeto/domínio/público.

## Revisão 1.9.24

- Três atalhos com o mesmo acabamento azul escuro/translúcido dos painéis, sem três fundos de cores diferentes. Faixa menor: até 390 px no desktop e 330 px no retrato; alvos de ao menos 44 px.
- Ícones do atlas existente: bota/Aventura, folhas/Exploração, controle/Minijogos, patinha/Cuidar, coração/Status e cesta de itens/Mochila. Atlas não contém mochila desenhada; a cesta já existente representa o inventário, com o rótulo Mochila preservado. Aliases semânticos adicionados ao registro, sem arte nova ou emojis do sistema.
- Banho/Carinho/Dormir passaram a usar as respectivas artes existentes de banho, coração e caminha; Alimentar já usava a maçã do atlas. Sem ícones brancos nesses botões.
- Grade de cuidados do retrato passou da coluna de quatro ações altas para 2×2, em painel de até 252 px, padding 8 px, altura pelo conteúdo. Corrigidos tamanhos mínimos/posicionamento herdados. Ícones 26 px, ações >=50 px. Subpainel de itens só cresce quando acionado, dentro da rolagem existente. Status acompanha a largura compacta; o centro da sala continua livre quando os painéis estão fechados.

Navegação, consumo de itens, saves, cenário da clareira e progressão preservados. Sem expansão de mapa ou salas neste ciclo.

## Verificação

TypeScript, 212 testes offline em 29 arquivos e build aprovados. Integração Firebase de staging segue excluída por ausência de credencial. Nenhum teste novo para espelhar CSS; testes existentes de ícones/paridade preservados.

control-browser/preview gerenciado indisponível; sem servidor ou navegador alternativo. Publicação para teste no aparelho segue autorização persistente e explícita. A inspeção publicada em desktop pode conferir aparência e caminhos, mas não é teste de retrato/FPS. Minha Casa 3D continua sem WebGL neste navegador. Revisão mobile final pendente.

Próximo: publicar no mesmo Site e conferir a faixa/ícones no navegador público, depois David compara o painel Cuidar e o espaço central no telefone. Rollback conhecido: produto 1.9.23 / Sites 42, somente enquanto predecessor imediato.

## Publicação confirmada

Produto 1.9.24 / Sites 43, succeeded. Fonte Sites 76dacf405cf5a19286d8252b00dce50a68f9676b; versão appgprj_6ac40994d8d881919d46203a60801e46~appgver_12d8f80299b081918e1f6989c7670ad4; deployment appgdep_6ad1b84b099081919eeefec09bb3ffb7. Pacote integralmente legível e manifesto conferido. URL https://meupet.aquimeusite.chatgpt.site.

No navegador público autenticado, recarregada a sala de estar e observados os três botões menores com o mesmo fundo e ícones ilustrados de bota/folhas/controle, além das artes de banho/coração/caminha no Cuidar. Cenário 3D indisponível por WebGL; retrato, abertura dos painéis móveis e fluidez no telefone ainda não observados. Não afirmar validação mobile. Nenhuma recompensa ou conclusão de fase realizada nesta revisão.
