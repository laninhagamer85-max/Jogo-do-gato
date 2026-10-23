# 1.44.0 — aldeões originais e recuperação entre salas

Estado: validado, publicação em preparação. Base Site 1.43.0 /138, source cdebcfc0e4815652b42d8c10ce6974a44c044f24. Rollback: versão138.

## Entrega
- Gaspar (construtor), Helena (guerreira), Dalva (agricultora), Vicente (coletor), Celina (médica-alquimista), distribuídos nas vilas da sala1, cada um com identidade/arte própria e casa permanente. Não clonados em todas as salas.
- Atlas pintado transparente, 40 componentes completos. Frente/costas com duas poses; laterais usam o mesmo ciclo completo espelhado para manter a direção. Sem divisão na cintura. Heróis e saves existentes preservados.
- Celina cura por40 moedas e vende consumíveis raros existentes de seiva250/pérola350, uma poção por30min. Cobra inventário real, preserva limite, não ressuscita personagem caído, exige proximidade.
- Até2 viajantes por vila, retendo pelo menos2 moradores. Saída no início da tarde; retorno iniciado5min antes de anoitecer; sem múltiplas viagens no mesmo dia. Legados sem prazo retornam.
- Vilas só recebem categoria Cidade com24 trabalhos e desenvolvimento comunitário; manhã prioriza trabalho local.
- Corrigido personagem caído em0 segundos: recuperação absoluta independe de sala/castelo ativo, de conclusão da sala e de painel aberto. Mantém posição atual, restaura HP, limpa estado caído e concede2,5s de invulnerabilidade. Contagem original60s preservada.

## Pesquisa e validação
MDN https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout (2026-10-23): temporizadores podem atrasar em abas inativas; a recuperação compara o prazo persistido com Date.now em vez de contar frames.
- TypeScript aprovado.
- Suite offline836 testes/88 arquivos +4 testes específicos de rotina/alquimia. Firebase staging excluído por ausência de credencial.
- Teste de regressão: recuperar aos60s após mudar para adega/trono/exterior/outra sala e recarregar save, inclusive sala concluída; não recuperar antes do prazo.
- Navegador: fixture isolada mostra8s finais após sair do castelo, HP0→304, aviso removido e controles liberados. Horizontal844x390 e vertical390x844. Não é teste em telefone físico.
- Arte gerada com ferramenta de imagens; prompt: cinco identidades medievais pintadas, cinco linhas/oito colunas, caminhada em quatro direções, fundo transparente, corpo inteiro e margens. Asset client/public/forest-adventure/village/professions-v3.webp; metadados explorationProfessionArt.json.

Publicação e commits: preencher após retorno oficial. Nenhum save real usado.
