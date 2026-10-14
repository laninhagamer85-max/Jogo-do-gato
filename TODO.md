# TODO — atualização Bosque dos Caminhos

## Entregue nesta branch

- [x] Integrar ao seletor da Aventura um modo solo top-down, com retorno à Aventura/Minha Casa, seleção de capítulos, pausa, retomada e saída.
- [x] Implementar 3 capítulos × 2 salas, com progressão orgânica, puzzles gentis, chaves/portões, objetos/ponte e guardiões não violentos; sem combate, cronômetro, vidas ou recompensa econômica.
- [x] Guardar `forestPathProgress` versionado e aditivo no `GameState` existente, por conta/perfil, sem alterar moedas, XP ou inventário; preservar versões futuras e normalizar dados inválidos com segurança.
- [x] Criar ambientes originais de bosque e riacho, trilha chiptune e efeitos por Web Audio, integrados ao mixer/mute existente.
- [x] Vincular a cadência visual de caminhada do pet ao deslocamento no modo top-down; preservar na Aventura lateral a animação articulada de corrida/salto da v12.
- [x] Implementar teclado e pointer/touch, cancelar direção em `pointercancel`, perda de foco e troca de orientação, e preservar a sala ao pausar/retomar/redimensionar.
- [x] Concluir por inputs normais de UI as seis salas da fixture isolada: capítulos 1→2→3 desbloqueados organicamente, duas salas por capítulo, sem teleportes, invulnerabilidade ou chamada direta de vitória. **Foi um playthrough guiado por eventos sintéticos de navegador, não uma partida humana nem um save real.** Métricas e capturas estão no relatório.
- [x] Revisar a seleção e o layout jogável em 375×667, 375×812, 390×844, 844×390 e 1366×768; o playthrough completo ocorreu em 390×844. A captura do harness desktop não cobre toda a largura visual, então a medição DOM foi usada para 1366×768.
- [x] Verificar pausa/retomada, início por teclado e toque emulado, soltura após `pointercancel`, conclusão final e retorno ao mapa com os três capítulos “Concluído”.
- [x] Executar TypeScript, 73 testes offline pertinentes, build e `git diff --check`; verificar que fixture HTML e strings/atributos de telemetria não aparecem no bundle de produção. Build mantém aviso de chunks grandes já registrado.
- [x] Anexar capturas das seis conclusões, desbloqueio orgânico, campanha concluída e vídeo curto reencodado para playback. Vídeo de evidência não contém áudio.
- [x] Manter v12 no Site existente; esta atualização não foi publicada. Preservar PRs #4–#6, sem merge, force-push ou substituição.

## Pendências para uma decisão de integração/publicação

- [ ] Validar controles, rotação, safe areas e áudio em aparelho móvel físico; o browser de QA é emulado.
- [ ] Validar migração/persistência com perfil de staging isolado; a fixture não usa login, servidor, conta ou save real.
- [ ] Decidir se a animação procedural de caminhada é suficiente para o protótipo ou se a produção exigirá spritesheets completas de quatro direções. A cadência foi vista em gameplay; não foram criados frames direcionais completos.
- [ ] Fazer revisão de release web independente (instalação fora do Manus, contas/isolamento, painel, segurança, backup/restauração e política de privacidade) antes de qualquer deploy.
- [ ] Integrar apenas após decisão explícita; não declarar as 100 fases laterais testadas e não publicar esta branch automaticamente.

**Métricas:** o modo não tem relógio nem sistema de vidas/mortes. O relatório registra passos e ações exibidos por sala; o tempo de jogo ativo e a contagem de contatos com guardiões não foram instrumentados, portanto não são inferidos.
