# 1.24.1 — Escadaria, encostas e margens naturais

Correção autorizada por David, apenas sala31, Jardim das Nascentes. Acesso ao platô usa arte original de escadaria de pedra em vez da ponte de madeira. Gramado continua no topo; encostas usam rochas pintadas e bordas com grama, sem contorno de plataforma pavimentada. Lagos preservam a mesma geometria de colisão e água animada, com pedras e plantas nas margens e grama exposta entre elas. Removido aro contínuo de pedra que parecia piscina. Mapa completo distingue a clareira do entorno florestal com enquadramento único em ambas orientações. Caminhada, lupa e mapa usam os mesmos materiais e assets.

Progressão, NPCs, recompensas, salas e campaignVersion5 preservados. Desafio12fibras+placas1/2/3 ainda libera acesso. Nenhum novo capítulo completo, sala ou NPC. A referência é direção de composição; não foi transformada em fundo único esticado nem copiada para o jogo.

Assets gerados originalmente por image_gen: stairs-nascentes-v3.webp1774×887 (crop13,24,1750,833), bank-nascentes-v2.webp2172×724 (crop15,20,2138,662). Escala uniforme e alpha real; escada desenhada4.6×2.19 unidades sobre corredor4×2.2, incluindo margem artística. Prompts completos, dimensões e hashes: client/public/forest-adventure/chapter4/stone-corrections-manifest.json. Arte regenerada após limpeza automática do ambiente, sem mudança da publicação anterior.

Validação: TypeScript aprovado;558testes em57arquivos aprovados. Integração FirebaseAdmin de staging não executável sem credencial (uma primeira execução confirmou essa ausência; execução offline final excluiu somente esse arquivo). Percurso completo, ordem das placas, colisão da água, acesso e retomada são cobertos pelos testes existentes. Browser isolado844×390: preparação do desafio pelo motor e caminhada real pela escada até platô.390×844: caminhada junto ao lago, água/margens e mapa completo; pausa automática na rotação preservou12/12fibras e3/3placas. Sem conta real escrita. Não é teste físico nem conclusão completa pelo navegador; FPS não medido.

A preparação de teste Escadaria liberada existe somente em /qa-exploration-lab, resolve coleta e placas usando stepCombat/pilotRoute e não altera saves. Perfil real continua obedecendo progressão.

Publicação pendente do fluxo oficial. Rollback1.24.0/Sites108, somente sem publicação posterior. Código base GitHub3b2c7604002bb3bfb6566bbdcc3d0886fc452cc9; Site27cdae75da4a2ba5f594ae8ee933fd209cbbb27e.

## Resultado confirmado

Publicado1.24.1/Sites109, succeeded. Versão `appgprj_6ac40994d8d881919d46203a60801e46~appgver_66bb2113e34c8191913cae71b4c5c338`, deployment `appgdep_6ad7ac0573bc81918bcb6ec7a83aed97`, fonte `cdc6ef1998973f65d7d288bddfd4868f94e694bb`. URL https://meupet.aquimeusite.chatgpt.site; público preservado. Build19.52s e gzip validado antes de salvar. Uma única publicação neste ciclo; documentos finais não geram nova publicação. Evidências: ../screenshots/meupet-1.24.1-stairs-horizontal.jpg e ../screenshots/meupet-1.24.1-lake-vertical.jpg. Branch GitHub review/grass-option3-20261016, atualização sem force com lease após comparar todos os arquivos alterados contra a base. Aceitação física pendente.
