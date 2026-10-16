# Vegetação rasteira — 16/10/2026

Pedido de David: aproximar gramado do musgo e distribuir a vegetação das bordas no interior, permitindo passagem do pet.

Base Sites: eb56883dc7661a15b8712aa8c1e285777adfc798 (1.9.26). Ajuste base #52783e → #486b29; textura, sombras, seed e densidade preservadas. Seis manchas do atlas existente (índice 2) acrescentadas em coordenadas fixas, abaixo dos personagens e fora de ROOM_WALLS. Sem novas mídias ou alterações de saves.

Código: 0cbdcc0607e2c311c33392fd9d2eebe8a0f51f2e e 27c98e73a54b307c8de0081f71a79cfd9549385f.

TypeScript aprovado; 188 testes existentes de client/src/game passaram; build scripts/build-sites-release.mjs aprovado com aviso já existente de chunks grandes. Nenhuma partida online concluída. Inspeção dos atlas originais realizada, não equivale a gameplay.

Referência técnica consultada em 16/10/2026: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha — composição existente da textura sobre base opaca preservada.

Estado: compilado, aguardando validação visual. control-browser indisponível; preview não iniciado conforme Sites. Nada publicado neste ciclo. Próxima ação: conferir vegetação, passabilidade e tom em retrato/paisagem antes da publicação. Rollback: reverter somente os dois commits de código deste ciclo; produção permanece inalterada.
