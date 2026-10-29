# Conta fora da sala, estatísticas e dois poderes — 1.0.7

Base: release 1.0.6 / Site v6 / commit e88f15aa6d989b0f7059a205feea9311a90ec968. Mesmo Site e público.

Conta: botão Minha conta na trilha, antes de iniciar uma sala. Removidas estatísticas da tela de conta, removida a aba Perfil das configurações pré-sala e removido o acesso direto à conta no painel da sala. Estatísticas ficam no HUD e no painel Perfil e evolução, acessível pelo nome e pela pausa, com verde escuro, dourado e texto claro. Corrigida largura do botão do nome para não cortar o início do texto.

Versão: dentro da sala, rótulo Ver. 1.0.7 centralizado abaixo dos três itens rápidos, sem fundo. O selo global do site fica oculto enquanto uma sala está montada.

Comandos: espada no ataque; picareta/machado no botão principal quando há recurso próximo e não há ameaça ou interação social/cívica prioritária. Nesse contexto o botão principal executa a interação real de coleta, com as mesmas validações de ferramenta, nível, estoque e intervalo. F continua como alternativa. Duelo mantém soco. Removida a opção Voltar ao gato da coleção e ajustadas referências textuais dos controles, guias e equipamento para Lendários. Identificadores internos e caminhos antigos de assets/saves permanecem compatíveis; não houve recriação das artes de construções antigas.

Dois poderes: aba Poderes na mochila. Espaço 1 usa Q; espaço 2 usa R, exige nível 6 e habilidade diferente já desbloqueada por carta (ou Explosão de energia). Botão secundário aparece somente equipado e utilizável pelo nível. Cada uso custa 25 de energia; intervalo global de ataques compartilhado, sem duplo lançamento simultâneo. Campo secondaryPower opcional, validado ao importar/ler saves e preservado em portais, replay e visitas. Trocar o primário para a mesma habilidade limpa o secundário. Recusa poderes não desbloqueados, duplicados e alterações em duelo.

Verificação: TypeScript e build de produção; testes de segundo poder, coleta contextual, equipamentos, apresentação, seleção, saves, combate e castelo. Chrome com fixtures em memória: Pulso das Marés recuperou vida; mineração pelo botão principal reduziu depósito de 5/5 para 4/5; nível 1 ocultou segundo botão e desabilitou segundo seletor. Conta acessada pela trilha sem estatísticas. Painel de estatísticas sem link de conta, tema legível. Layouts desktop, iframe 390×740 e 844×390. Inspeção de retângulos DOM sem sobreposição entre botões, itens e direcional; no retrato, também sem sobreposição com aviso da casa. Nenhuma conta ou save real alterado. Harness removido antes da publicação.

Estado: validado, publicação pelo Sites em seguida. Rollback: Site v6. Regras de nível 6 / 25 energia definidas nesta revisão, ajustáveis em ciclo futuro.
