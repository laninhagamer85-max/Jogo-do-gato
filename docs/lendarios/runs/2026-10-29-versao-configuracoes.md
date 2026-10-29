# Versão e legibilidade das configurações

Release do produto: 1.0.5; identificação independente da versão de hospedagem e do esquema dos saves. Base publicada: Site v4, commit a5a62623f638fd179149403bbab3d31740f02446.

Versão vem de package.json, exibida como Ver. 1.0.5 no canto inferior direito de todas as rotas (site, login, trilha e jogo) e no rodapé das configurações. Rótulo discreto, sem captura de toque e com safe-area. Atualizações futuras devem alterar package.json.

A regra global de vidro escurecia o fundo das configurações sem atualizar os textos escuros. O diálogo agora possui paleta opaca própria: pergaminho claro, texto verde escuro, botões verdes com texto claro, seletor com cores explícitas e abas que quebram linha no celular.

QA em Chrome: quatro abas legíveis no desktop, Áudio e Salas em iframe de 390×740; controles, rolagem e versão visíveis. Trilha real montada com fixture em memória; sem autenticação ou alteração de saves reais. Harness temporário removido e build de produção recompilado sem rotas QA.

População: diagnóstico, sem alterar o elenco nesta revisão. Existem 12 aparências por capítulo (17 no primeiro) para dez núcleos em cada sala. Recomendação: criar mais aparências originais para moradores fixos, complementar com visitantes itinerantes e horários de trabalho/feira. Para 4–6 moradores simultâneos em dez vilas, o alvo é 40–60 identidades visuais por capítulo. Trocar só nome ou cor não resolve a repetição. A implementação dessa ampliação não está incluída nesta revisão.

Validação: TypeScript, build e testes de catálogo/saves; inspeção real do painel no navegador. Rollback: Site v4. Estado: validado, publicação em seguida.
