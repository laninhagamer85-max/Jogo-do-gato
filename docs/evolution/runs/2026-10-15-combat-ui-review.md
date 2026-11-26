# Piloto — revisão visual e usabilidade
Data: 15/10/2026, America/Sao_Paulo. Produto alvo: 1.9.6.
David confirmou conclusão e teste com sucesso da sala 1.9.5 e pediu revisão dos inimigos, feedback, inventário e controles.

## Implementado
- Besouro e lagarta em tons de floresta, volume de carapaça, olhos/antenas e patas alternadas durante deslocamento; pausa e redução de movimento respeitadas. Arte original em Canvas.
- Dano/cura menores (11–13 px, mesmo com zoom), cores suaves, contorno fino e texto numérico sem sufixo HP repetido. XP continua separado.
- Ícones vetoriais originais para fibra, âmbar, erva, fruta e broche. Inventário em cartões com quantidades na sala e guardadas.
- Uso rápido de erva/fruta junto aos controles; um toque consome somente quando há efeito. Uso na mochila retorna à partida sem passos extras.
- Faixa de coleta e resumo do objetivo no alto; controles e saída protegida mantidos. Em horizontal estreito, os consumíveis têm prioridade na faixa inferior.
- Hipótese explicitada ao usuário: lista para capturar interpretada como acompanhamento da coleta/objetivo. Arrastar/usar item de enigma ou pet específico carregando objetos não foi adicionado.

## Testes e limites
TypeScript aprovado. 140 testes offline/22 arquivos aprovados. Entrada da Aventura validada em 101 estados sintéticos. Paridade de conta/atlas preservada em fake storage (49 regiões/67 símbolos). Build de release aprovado com aviso existente de chunks grandes.
Inspeção jogável da nova arte/layout NÃO executada: control-browser indisponível. Não houve preview alternativo. A aprovação da partida 1.9.5 pelo usuário não comprova visual da 1.9.6. A publicação continua destinada à revisão do usuário, conforme autorização expressa de publicar e receber seu relatório.
Sem alterações na economia, progressão ou estrutura do save. Sem edição de partidas reais. Seis capítulos × dez salas e cartas permanentes continuam pendentes.
Referências técnicas deste piloto: MDN https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events e https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection (consultadas em 15/10/2026). Nenhum asset externo incorporado.
Publicação em preparação pelo mesmo Site; versão anterior 1.9.5 / Sites 24 preservada para rollback. Próximo: relatório em retrato e horizontal, legibilidade dos números, alcance dos botões e uso de itens.

## Resultado final desta tentativa
Implementação e 140 testes concluídos; GitHub código 50e5e02eb0cde48520d75540d6671b0a441da8d6. Fonte exata enviada ao Sites: 018464cb7155bae0863e970c78cfc5500d11cb1d.
Nada novo publicado. save_site_version rejeitou os pacotes como invalid_archive. Empacotador oficial retornou sucesso e gzip validou na execução produtora; a leitura posterior detectou arquivo truncado. Refeito com gzip padrão e compressão -9; o transporte ainda foi rejeitado. Sem versão salva e sem deploy para 1.9.6. A 1.9.5 / Sites 24 permanece pública. Retomar infraestrutura de pacote/transporte, preservando este código.

## Retentativa concluída — 15/10/2026, 09:27:22 (America/Sao_Paulo)
Publicado com sucesso: 1.9.6 / Sites 25.
URL: https://meupet.aquimeusite.chatgpt.site/
Saved version: appgprj_6ac40994d8d881919d46203a60801e46~appgver_0e7b980080ec819188afe869f6152dce
Deployment: appgdep_6ad0c693c860819189beb07cba5d40ce
Source commit: 018464cb7155bae0863e970c78cfc5500d11cb1d.
Bloqueio de pacote resolvido: archive oficial dividido em partes menores e reconstruído byte a byte; gzip validado em leituras independentes antes do upload. Sem mudança do código/build nem remoção de assets. Sites aceitou 377 arquivos, 81203200 bytes de tar normalizado. Um único deploy desta versão, status terminal succeeded.
Autorização expressa reiterada: “Públique precisamos testar”. Validação visual/jogável desta revisão permanece a cargo do relatório do usuário; 140 testes offline/build anteriores preservados.
Rollback: 1.9.5 / Sites 24, appgprj_6ac40994d8d881919d46203a60801e46~appgver_e24f36c761d88191a9edd4d82c2f9557.
