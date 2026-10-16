# Primeiro capítulo — 1.10.0 — 16/10/2026

David declarou os testes do piloto concluídos e pediu expansão e NPCs aleatórios por bioma com níveis e itens raros. Entrega: dez salas reais da Clareira dos Troncos; os outros cinquenta mapas continuam planejados. Preserva gramado aprovado, lupa e seis atalhos, câmera e campanha clássica.

Salas têm geometria, objetivos e inimigos próprios: coleta, combate, placas em sequência, chave, ponte sobre água bloqueada, uso efetivo de consumível, desvio e coleta opcional. Conclusão libera próximo mapa; recompensas de conclusão não repetem por replay. Saves v1 migram para v2 sem perder XP/estoque; versões futuras são rejeitadas. Clientes antigos rejeitam o save v2, portanto rollback não permite continuar novo progresso na versão anterior.

Escaravelho Esmeralda, Cogumelo Saltador e Guardião dos Troncos possuem atlas original de 4 quadros por espécie, níveis 2–5, HP/ataque/defesa, velocidade, percepção e alcance próprios. Encontros opcionais usam semente persistida e locais seguros: 1 nas salas 2–5, 2 nas salas 6–10. Sala piloto preservada. Chances raras: min(55%, 4% + nível × 5,5% + 15% para o guardião raro); exemplares nível 2 têm 15%, guardião nível 5 tem 46,5%. Materiais raros separados (Seiva luminosa e Cristal do bosque), coletados uma vez por geração do inimigo, preservados na derrota e guardados ao concluir. São colecionáveis sem receita nesta entrega.

Verificação: TypeScript, testes offline de movimentação, objetivos, duelos isolados, migração, persistência, saque e avanço; renderização estática e comandos Canvas. Não representam partidas completas em navegador. Browser suportado indisponível; toque, retrato/paisagem, FPS e balanceamento final aguardam teste do usuário. Sem edição de contas ou saves reais.

Artes originais geradas para este projeto: ponte 1983×793, chave 1254×1254, atlas NPC 1448×1086 (4×3), itens 1774×887 (2×1), WebP com alpha e escala uniforme. Sem assets de terceiros adicionados.

- `chapter1-bridge-v1.webp` SHA256 `424e94856df33de64a062f552f418f58cd658eef8b9fbbbea95a6594d8ce8cdc`
- `chapter1-key-v1.webp` SHA256 `2c1213d3aeb1f82cedc01598dfe94dce2d278d471b2bde0f286368f869f24701`
- `forest-mobs-v1.webp` SHA256 `a2dfaeb79af32397bb1c124523d601d929edfcf0370c9631a474054368e44555`
- `forest-rare-items-v1.webp` SHA256 `a4f1223748a1708358b662809d52bf29c9f7381cff0f0ec0e974a2618003bf7b`

Rollback anterior: Sites 57 / produto 1.9.38; versão `appgprj_6ac40994d8d881919d46203a60801e46~appgver_04a931166fc481918432d84bf25028f9`, fonte `3f91ca1881667d06bcbdefcbf564cea2c4be4342`. Preservar saves e considerar proteção v2 descrita acima.

Resultado final: TypeScript, 280 testes offline em 29 arquivos e build aprovados. Aviso existente de tamanho de bundle.
