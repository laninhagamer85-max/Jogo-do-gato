# Exploração — regras de produto confirmadas em 15/10/2026

Responsável: David / Web Agência AD. Especificação para desenvolvimento, ainda não implementação. Base pública conhecida: 1.9.4. A correção do piso contínuo já está em revisão separada e aguarda validação visual.

## Progressão e conteúdo
- Seis capítulos iniciais, dez salas por capítulo: 60 salas reais, com enigmas, desafios, coleta e dificuldade progressiva. Não apenas trocar o denominador do contador.
- Nível, XP e atributos de combate próprios da Exploração, separados do nível de cuidados da Minha Casa. Preservar o estado dos demais módulos.
- Construir e validar uma sala piloto antes de expandir os demais mapas. O piloto não deve exibir 60 salas como concluídas ou disponíveis se ainda não existem.

## HP, XP e feedback
- HP é vida; XP é experiência. As duas grandezas devem ter identificação e feedback distintos.
- Todo golpe válido mostra o dano efetivo sobre o alvo. Ao receber dano, o pet exibe número vermelho com sinal negativo e a barra de HP diminui. Inimigos também exibem o HP perdido.
- Cura mostra número verde positivo sobre o beneficiário e aumento da barra, limitado ao HP máximo. O número deve mostrar somente a cura efetiva, sem contar excesso.
- XP ganho aparece como +N XP; a subida do nível de combate tem feedback próprio. Se subir de nível também recuperar HP, exibir essa recuperação separadamente. A quantidade de recuperação/atributos será balanceada no piloto, sem confundir XP com HP.
- Mostrar níveis do pet e adversário e sinalizar desafio acima, equivalente ou abaixo do jogador. Dano depende de atributos/itens e pode ser balanceado por nível; não falsificar números apenas pelo efeito visual.
- Números flutuantes legíveis sem ocultar o alvo/controles. Sinal e rótulo identificam o evento além da cor. Movimento reduzido mantém a informação sem exigir animação intensa.
- Estilo infantil: patada, brilho, reação e derrota, sem sangue gráfico.

## Derrota e proteção dos desbloqueios
- HP zero devolve o pet ao último ponto seguro.
- Manter inventário consolidado, equipamentos, cartas e desbloqueios permanentes.
- Permitir perda parcial somente de materiais comuns coletados na sala/tentativa atual. Padrão inicial adotado pela implementação: 10% da quantidade elegível, arredondando para baixo. Registrar perda e informar claramente ao jogador.
- Itens-chave, cartas de decoração, equipamentos e conquistas permanentes ficam fora dessa penalidade. Não retirar itens obtidos em salas anteriores.
- Separar coleta da tentativa de inventário consolidado para impedir perda de itens antigos. Nenhum saldo negativo, perda duplicada por morte ou duplicação por recarga.
- Retorno seguro e HP de retomada serão calibrados no piloto, sem respawn hostil sobre o ponto seguro.

## Cartas de decoração
- São conquistas permanentes desbloqueadas na evolução da Exploração; não são mercadorias compradas com moedas ou dinheiro.
- Depois de conquistadas, aparecer como desbloqueadas nos módulos compatíveis e no catálogo da loja, sem botão de compra ou revenda.
- Preservar compras/decorações antigas: aplicar essa regra às novas cartas da Exploração, sem retirar itens existentes.
- Identificador único de desbloqueio e concessão idempotente. A instalação de decoração só em ambientes que a suportam, sem alterar saves reais para teste.

## Coleta, inventário, inimigos e respawn
- Inventário acessível durante a Exploração; consumíveis para HP/energia, bônus de ataque, materiais e equipamentos com descrições claras.
- Resumo ao concluir a sala e registro de recompensas já concedidas. Moedas/XP/recompensas dos outros modos não devem ser duplicadas por replay.
- Adversários reaproveitados da Aventura e novos, com força/HP/níveis distintos, padrões e tabelas de drops próprios.
- Inimigos distribuídos em posições válidas, sem bloquear entrada, mecanismo obrigatório ou área segura; reaparecem após intervalo.
- Cada derrota concede seu drop uma vez. Respawn gera novo encontro; salvar estado/identificadores para não duplicar a mesma concessão ao recarregar.
- Itens raros já existentes na Aventura podem cair de forma rara na Exploração usando o mesmo catálogo, sem criar duplicatas incompatíveis. Probabilidades e intervalos serão balanceados na sala piloto.

## Controles e câmera
- Direcional à esquerda; botões circulares sobre o cenário à direita para patada, poder e inventário. Alvos confortáveis, estados de indisponibilidade e recarga visíveis.
- Toque simultâneo entre movimento e ataque, teclado e mouse. Pausa/blur não acumulam golpes para executar depois.
- Zoom da câmera aproxima o duelo inteiro (pet, adversários e objetos), mantendo colisões e alvos coerentes; respeitar controle de visão geral da sala.
- Preservar layout horizontal aprovado; conferir retrato, paisagem, tablet e desktop.
- Salvar por perfil o nível de combate, XP, inventário, equipamentos, cartas, salas e checkpoint; migração preserva cuidados e progressos publicados.

## Sequência e aceite
1. Correção do piso contínuo e conferência visual.
2. Sala piloto: HP/XP separados, patada e dano, inimigo simples, coleta, inventário, checkpoint e derrota com proteção de cartas.
3. Equipamentos, consumíveis, poder, efeitos numéricos e salvamento seguro; testes de reentrada/recarga e recompensa idempotente.
4. Dez salas distintas no capítulo 1; depois demais capítulos/biomas até os seis capítulos definidos.
5. Registrar por sala versão, viewport, tipo de teste, tentativas, derrotas, tempo, recompensas e conclusão. Teste offline ou fixture não equivale a playtest.

As regras acima encerram as quatro perguntas de produto anteriores. Decisões de balanceamento indicadas como iniciais não são apresentadas como valores já testados. Não publicar o sistema como concluído antes da implementação e validação real correspondentes.
