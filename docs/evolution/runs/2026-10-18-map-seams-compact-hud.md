# 1.14.4 — emendas e espaço do cenário

Pedido: David anexou Screenshot_20261018-010931_Meu Pet.png e pediu inspeção dos dois módulos, nas duas orientações, correção da linha entre imagens e dos painéis grandes, preservando posições aprovadas e características próprias de Aventura/Exploração.

## Evidência real anterior
Login seguro browserAuth concluído; perfil Nino criado apenas no navegador de revisão, pois não havia perfil local. Nenhuma alteração no save do aparelho do proprietário, nenhuma sala vencida, nenhuma fase desbloqueada artificialmente. A casa 3D mostrou WebGL indisponível neste navegador; os seletores 2D funcionaram. Inspeção autenticada dos dois módulos publicada1.14.3 a1363×936: emenda vertical rígida visível entre as placas. Aventura: moldura608.39px, painel superior53px, inferior97.19px, cenário452.2px. Exploração: moldura616.11px, superior53px, inferior79.19px, cenário477.92px. Retrato: evidência do screenshot fornecido, não um teste de navegador móvel. Tentativa de atalho DevTools não mudou viewport; não usar isso como prova de orientação.

## Mudança
TrailSeams mistura faixas de borda em torno das junções internas e de capítulo, com máscara alfa cujo centro é opaco. Usa o próprio recurso já carregado, sem novo asset, sem alterar escala ou âncoras. Mistura apenas as extremidades, não deve ser descrita como uma nova ilustração perfeitamente contínua. As áreas bloqueadas mantêm filtro cinza.

Título flutuante compacto em vez de faixa de largura total. Detalhes ficam fechados inicialmente; seleção de etapa ou botão de informações abre o painel, que pode ser fechado. Retorno ao progresso fecha o painel. Instruções longas em detalhes expansíveis. Cartão inicial da Aventura compacto. Aventura mantém interface azul/turquesa e progresso dourado; Exploração usa verde/madeira. Número de fases/salas, saves, recompensas, motores de jogo, geometria das âncoras e os doze arquivos de arte permanecem iguais.

## Verificação
TypeScript passou, 437 testes offline em43arquivos passaram e build passou (aviso de chunks grandes existente). Teste novo cobre junções internas/de capítulo em ambas orientações, bloqueio cinza e ausência de mutação de âncoras. Integração Firebase excluída por credencial de staging ausente. Inspeção pós-publicação dos dois módulos em paisagem pendente; retrato móvel continua sem ambiente de resize disponível. Não alegar quatro viewports testados ou playtest.

Pesquisa reutilizada: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit e composição por regiões https://kleeam.artstation.com/projects/L3lDBv, consultadas em18/10. Regra do renderer: não ampliar nem reposicionar as placas para esconder a emenda.

Rollback: 1.14.3/Sites69, source09949f2ebd91e39bc692dbc370ecb382ed88c69f, saved appgprj_6ac40994d8d881919d46203a60801e46~appgver_3f197a3889c88191a10efcb134233f7d. GitHub base522d8b183d8bbcc9a759bfa04efac8d040b269b0. Preservar alterações posteriores de colaboradores e saves.
