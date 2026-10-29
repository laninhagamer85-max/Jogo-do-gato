# Lendários do Rei — primeira entrega independente

Site de apresentação medieval e acesso exclusivo ao motor Exploração. Entrada própria em client/lendarios.html e client/src/lendariosMain.tsx. App.tsx, login, publicação e saves do Meu Pet não são alterados por esta aplicação.

Build no repositório compartilhado: node node_modules/vite/bin/vite.js build --config vite.lendarios.config.ts && node scripts/build-lendarios-routes.mjs. Saída dist/public, copiada para out/ para a hospedagem Sites. A publicação do novo Site usa seu próprio manifest; nunca substituir o project_id do Meu Pet no manifest raiz ao mesclar esta entrega.

Fonte recuperada do Site atual, commit e2e72a3998ad543916d73735ef27bad61e224ce1, motor 1.52.2. Base GitHub review/grass-option3-20261016. Novos módulos reutilizam Firebase e ExplorationCombatPilot. Não há cópia de dados de usuários ou credenciais de servidor.

Configuração pública Firebase de cliente existente preservada. O novo hostname deve ser autorizado em Firebase Authentication > Settings > Authorized domains para o provedor Google; conferir também as restrições de domínio do reCAPTCHA Enterprise/App Check existentes. Não remover proteções nem cadastrar chaves privadas no frontend.

Salvar por conta, namespace lendarios-do-rei:v1:<uid>, no navegador do novo endereço. Não há sincronização de saves entre dispositivos. Exportação JSON e importação validada de cópia do jogo anterior (profile + explorationCombatProgress); saves inválidos/futuros são preservados e recusados. Não há migração automática entre origens.

Multiplayer, duelos PvP e mercado entre jogadores são roadmap, não funcionalidades desta entrega. Nenhum personagem lendário é desbloqueado automaticamente.

QA: build e TypeScript; cinco testes de leitura/importação; Chrome em perfil isolado de teste, entrada real no motor, sem contas reais. O login com conta real e o provedor Google no hostname publicado dependem de verificação do proprietário. A fixture de QA é removida antes do build de produção.
