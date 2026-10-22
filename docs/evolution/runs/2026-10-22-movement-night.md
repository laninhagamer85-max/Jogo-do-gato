# 1.39.2 — Movimento e iluminação noturna

Inclui a correção dos portais da 1.39.1 (versão salva, substituída por esta antes da publicação).

- Iluminação do jogador: alcance reduzido de 10 para 5 passos; lanternas dos moradores preservadas.
- Navegação: cache limitado a 20 mil arestas estáticas de caminho, separado por sala/portão e invalidado quando muda a composição/ponte. Construções móveis do jogador não usam cache. Mantido o roteiro com pontos intermediários: tentativa de encurtamento foi descartada porque os testes detectaram dificuldades de movimento próximas a obstáculos.
- Salvamento: aldeões com posição válida não recalculam os pontos de nascimento durante cada leitura. A tela de capítulos não reconstrói a campanha enquanto a sala está aberta.
- Lupa: atualização de terreno limitada a uma vez a cada 200ms, usando a posição mais recente e sem reduzir a resolução das imagens.
- Telemetria isolada inclui tempo da lógica, sem custo de instrumentação em produção.

Validação: 795 testes/77 arquivos passaram. Teste Firebase Admin de integração excluído por falta de credencial de staging. TypeScript e build oficial verificados. Navegador: caminhada na cidade, noite em 844×390 e 390×844. Amostras de desenvolvimento antes/depois não constituem benchmark de telefone físico: antes média48,87ms/p9567,70ms; após aquecimento média34,68ms/p9538,60ms, lógica1,00ms. Não há promessa de FPS em todos os aparelhos.

Contas e saves reais não foram alterados nos testes.

Publicado: produto 1.39.2 / Sites 131; deploy appgdep_6ada3fc3bbb48191bcb3fd04eba34d77; status succeeded; https://meupet.aquimeusite.chatgpt.site.
Código GitHub: 71d1cd31f75334bf68daaa22e03ccf79eead2b01.
