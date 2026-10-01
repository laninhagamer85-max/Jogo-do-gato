import type { CompanionId } from "./PetGame";

export type MiniGameId = "patas" | "memoria" | "bolhas" | "colheita" | "pescaria" | "labirinto" | "sequencia" | "organizar" | "ratinho" | "salto" | "colecao";
export type MiniGameMode = "tap" | "memory" | "match3" | "fishing" | "maze" | "sequence" | "sort" | "shell" | "timing" | "collection";

export type MiniGameDefinition = {
  id: MiniGameId;
  mode: MiniGameMode;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
};

export const MINI_GAMES: MiniGameDefinition[] = [
  { id: "colheita", mode: "match3", title: "Colheita de Petiscos", subtitle: "Combine 3 ou mais itens de gato", icon: "🐟", badge: "DESTAQUE" },
  { id: "patas", mode: "tap", title: "Patas velozes", subtitle: "Siga as patinhas que aparecem", icon: "🐾", badge: "REFLEXO" },
  { id: "memoria", mode: "memory", title: "Memória felina", subtitle: "Encontre os pares de brinquedos", icon: "🧠", badge: "MEMÓRIA" },
  { id: "bolhas", mode: "tap", title: "Bolhas de peixe", subtitle: "Estoure as bolhas antes que subam", icon: "🫧", badge: "REFLEXO" },
  { id: "pescaria", mode: "fishing", title: "Pescaria do Pudim", subtitle: "Pegue os peixinhos e evite as botas", icon: "🎣", badge: "ATENÇÃO" },
  { id: "labirinto", mode: "maze", title: "Labirinto do Novelo", subtitle: "Guie a patinha até o rato de feltro", icon: "🧶", badge: "CAMINHO" },
  { id: "sequencia", mode: "sequence", title: "Eco de Miados", subtitle: "Repita a sequência de brinquedos", icon: "🎵", badge: "RITMO" },
  { id: "organizar", mode: "sort", title: "Arruma a Caminha", subtitle: "Separe brinquedos e petiscos", icon: "🧺", badge: "ORGANIZAÇÃO" },
  { id: "ratinho", mode: "shell", title: "Esconde-esconde", subtitle: "Descubra em qual caixa está o rato", icon: "🐭", badge: "OBSERVAÇÃO" },
  { id: "salto", mode: "timing", title: "Salto de Patinhas", subtitle: "Acerte o tempo e passe pelo aro", icon: "🐈", badge: "TEMPO" },
  { id: "colecao", mode: "collection", title: "Caça aos Brinquedos", subtitle: "Encontre os itens pedidos no jardim", icon: "🪁", badge: "BUSCA" },
];

export type CampaignLevel = {
  level: number;
  title: string;
  location: string;
  story: string;
  objective: string;
  backdropIndex: number;
  companionUnlock?: CompanionId;
  reward: number;
};

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  { level: 1, title: "O primeiro ronronar", location: "Casa do Começo", story: "Uma porta azul se abre para um lar quentinho. Você escolhe o nome do seu novo amigo e juntos descobrem que uma grande aventura pode começar no lugar mais acolhedor do mundo.", objective: "Conheça sua casa e complete três brincadeiras.", backdropIndex: 1, reward: 100 },
  { level: 2, title: "O jardim das borboletas", location: "Estufa das Flores", story: "Pudim encontra um jardim secreto atrás da janela. Entre flores gigantes e borboletas curiosas, surge o primeiro mapa: cada lugar guarda uma brincadeira nova.", objective: "Explore o jardim e cuide do seu pet.", backdropIndex: 2, reward: 120 },
  { level: 3, title: "A feirinha dos petiscos", location: "Mercado dos Bigodes", story: "Na feirinha, uma gatinha laranja chamada Mimi procura alguém para dividir um peixinho. Ela vira a primeira grande amiga da turma e passa a aparecer nas aventuras.", objective: "Dê boas-vindas à Mimi e siga a trilha dos sabores.", backdropIndex: 3, companionUnlock: "mimi", reward: 140 },
  { level: 4, title: "O telhado dos bigodes", location: "Terraço do Sol", story: "Com Mimi ao seu lado, Pudim sobe até um terraço cheio de luzinhas. Lá de cima, a cidade parece um tabuleiro e uma trilha dourada aponta o caminho para o mar.", objective: "Brinque no terraço e complete três desafios.", backdropIndex: 4, reward: 160 },
  { level: 5, title: "A enseada das conchas", location: "Praia do Ronrom", story: "O grupo chega a uma casinha junto à praia. O vento traz o cheiro do mar e um mapa de conchas revela que a próxima aventura fica numa floresta de brinquedos.", objective: "Colecione conchas e encha a barra de experiência.", backdropIndex: 5, reward: 180 },
  { level: 6, title: "O bosque das bolinhas", location: "Bosque do Novelo", story: "No bosque, bolinhas de lã rolam sozinhas por uma ponte de corda. Pudim e Mimi seguem as pistas entre cogumelos macios e descobrem uma trilha de pegadas na neve.", objective: "Encontre as pegadas e complete três brincadeiras.", backdropIndex: 6, reward: 200 },
  { level: 7, title: "O chalé da neve", location: "Montanha do Tico", story: "Uma luz dourada pisca no chalé. Lá está Tico, um cachorrinho creme muito gentil que ficou preso na neve — agora ele também faz parte da turma e ajuda a achar o caminho.", objective: "Receba Tico e escolha quem vai acompanhar o passeio.", backdropIndex: 7, companionUnlock: "tico", reward: 230 },
  { level: 8, title: "A biblioteca dos bigodes", location: "Biblioteca Secreta", story: "Tico encontra um livro escondido em uma prateleira baixa. As páginas contam a história de uma casa construída para receber todos os pets e trazem o mapa de um observatório.", objective: "Descubra a história e complete desafios do livro.", backdropIndex: 8, reward: 260 },
  { level: 9, title: "O observatório das patinhas", location: "Domo das Estrelas", story: "Pelo telescópio, os amigos avistam uma estrela em forma de pata. Ela aponta para a Casa Dourada, onde a aventura começou — e onde todos vão se encontrar.", objective: "Siga a estrela e prepare o último capítulo.", backdropIndex: 9, reward: 300 },
  { level: 10, title: "O festival da casa dourada", location: "Casa das Novas Histórias", story: "Pudim, Mimi e Tico inauguram o grande lar da turma. Luzes, brinquedos e amigos celebram a jornada. O livro termina aqui — mas a casa e as próximas histórias continuam esperando por você.", objective: "Celebre o primeiro arco de dez níveis!", backdropIndex: 10, reward: 500 },
];

export function getCampaignLevel(level: number): CampaignLevel {
  return CAMPAIGN_LEVELS[Math.max(0, Math.min(CAMPAIGN_LEVELS.length - 1, level - 1))];
}
