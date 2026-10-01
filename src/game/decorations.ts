export type DecorationSeed = readonly [
  id: string,
  name: string,
  icon: string,
  price: number,
  description: string,
  unlockLevel?: number,
  missionsRequired?: number,
];

const ROOM_SEEDS = {
  1: [
    ["tower", "Torre de escalada", "🪵", 360, "Um cantinho alto para observar"],
    ["bed", "Caminha estrela", "🛏️", 220, "Um lugar macio para sonhar"],
    ["plant", "Vaso de catnip", "🌿", 120, "Verde e divertido para a casa"],
    ["lamp", "Luminária lunar", "🌙", 280, "Uma luz quentinha para a noite"],
    ["casa-tapete-nuvem", "Tapete Nuvem", "☁️", 150, "Um pouso fofinho para patinhas"],
    ["casa-cesto-novelo", "Cesto de Novelos", "🧶", 180, "Novelos coloridos sempre à mão"],
    ["casa-quadro-peixes", "Quadro dos Peixinhos", "🐟", 190, "Uma paisagem deliciosa para admirar"],
    ["casa-mesa-petiscos", "Mesinha de Petiscos", "🍪", 250, "Um lugar especial para os lanchinhos", 3],
    ["casa-relogio-patinhas", "Relógio de Patinhas", "🐾", 310, "O tempo passa em ritmo de ronrom", undefined, 1],
    ["casa-arranhador-peixe", "Arranhador Peixe-Rei", "🐠", 430, "Um desafio de escalada com cauda" , 2],
  ],
  2: [
    ["jardim-arco-flores", "Arco de Flores", "🌼", 260, "Uma entrada florida para a estufa"],
    ["jardim-banco-folha", "Banco Folha", "🍃", 220, "Descanso fresquinho entre as plantas"],
    ["jardim-vaso-margaridas", "Vaso de Margaridas", "🌼", 180, "Flores alegres que seguem o sol"],
    ["jardim-fonte-orvalho", "Fonte de Orvalho", "💧", 390, "Água brilhante para ouvir de pertinho"],
    ["jardim-toquinho-cogumelo", "Banquinho Cogumelo", "🍄", 240, "Um assento macio de floresta"],
    ["jardim-rede-lanterna", "Redinha de Jardim", "🪢", 340, "Balança de leve entre as folhas"],
    ["jardim-casinha-passaros", "Casinha de Passarinhos", "🐦", 290, "Amigos cantores fazem visita"],
    ["jardim-mobile-borboletas", "Móbile de Borboletas", "🦋", 320, "Asas coloridas dançam no ar", undefined, 2],
    ["jardim-regador-azul", "Regador Azul", "🚿", 160, "Um toque de água para as flores", undefined, 3],
    ["jardim-ponte-musgo", "Ponte de Musgo", "🌱", 460, "Atravesse o jardim em passos fofos", 3],
  ],
  3: [
    ["mercado-banca-peixes", "Banca de Peixes", "🐟", 360, "A feira mais cheirosa da cidade"],
    ["mercado-carrinho-petiscos", "Carrinho de Petiscos", "🛒", 420, "Lanchinhos para toda a turma"],
    ["mercado-caixa-sardinhas", "Caixote de Sardinhas", "🐟", 230, "Um estoque bem guardado"],
    ["mercado-barril-peixinhos", "Barril de Peixinhos", "🪣", 280, "Peixes de brinquedo para brincar"],
    ["mercado-toldo-listrado", "Toldo Listrado", "⛱️", 390, "Sombra fresca para a feira"],
    ["mercado-pote-biscoitos", "Pote de Biscoitos", "🍪", 200, "Biscoitinhos crocantes e seguros"],
    ["mercado-cesta-frutas", "Cesta de Frutinhas", "🍊", 180, "Cores docinhas para enfeitar", undefined, 4],
    ["mercado-placa-bigodes", "Placa dos Bigodes", "🐱", 340, "O letreiro oficial da feirinha", undefined, 3],
    ["mercado-tapete-escamas", "Tapete de Escamas", "✨", 310, "Brilha como um cardume"],
    ["mercado-fonte-moedas", "Fonte de Moedas", "🪙", 520, "Uma fonte dourada de boa sorte", 4],
  ],
  4: [
    ["terraco-espreguicadeira", "Espreguiçadeira Solar", "☀️", 410, "Um lugar quentinho para tomar sol"],
    ["terraco-luzes-varal", "Varal de Luzinhas", "✨", 320, "Pequenas estrelas no terraço"],
    ["terraco-telescopio", "Telescópio de Bolso", "🔭", 480, "Espie os telhados e o céu"],
    ["terraco-catavento", "Catavento de Patinhas", "🌬️", 260, "Gira com a brisa da cidade"],
    ["terraco-ninho-passaro", "Ninho do Telhado", "🪺", 240, "Um cantinho para visitantes", undefined, 5],
    ["terraco-vaso-sol", "Vaso Girassol", "🌻", 220, "Um girassol que acompanha o dia"],
    ["terraco-almofada-nuvem", "Almofada Nuvem", "☁️", 210, "Conforto macio sob o céu azul"],
    ["terraco-lanterna-pata", "Lanterna de Pata", "🏮", 370, "Ilumina as aventuras noturnas", undefined, 4],
    ["terraco-banco-luar", "Banco do Luar", "🌙", 390, "Veja a cidade descansar"],
    ["terraco-tapete-estrelas", "Tapete de Estrelas", "⭐", 520, "Uma constelação para suas patas", 5],
  ],
  5: [
    ["praia-cadeira-concha", "Cadeira Concha", "🐚", 390, "Um assento de sereia felina"],
    ["praia-guarda-sol", "Guarda-Sol Coral", "⛱️", 430, "Sombra gostosa perto da areia"],
    ["praia-castelo-areia", "Castelo de Areia", "🏰", 360, "Um castelinho para arranhar"],
    ["praia-prancha-peixe", "Prancha Peixinho", "🏄", 340, "Pegue uma onda imaginária"],
    ["praia-boia-patinhas", "Boia de Patinhas", "🛟", 230, "Flutue num mar de brincadeira", 6],
    ["praia-bandeja-perolas", "Bandeja de Pérolas", "🦪", 310, "Tesouros trazidos pelas ondas"],
    ["praia-caranguejo-pelucia", "Caranguejo de Pelúcia", "🦀", 280, "Um amigo macio que anda de lado"],
    ["praia-fonte-conchas", "Fonte das Conchas", "🌊", 490, "Uma onda tranquila dentro de casa", undefined, 5],
    ["praia-almofada-estrela", "Almofada Estrela-do-Mar", "⭐", 250, "Descanso com jeito de verão"],
    ["praia-banco-madeira", "Banco de Madeira do Mar", "🪵", 470, "Madeira lisa polida pela maré", 6],
  ],
  6: [
    ["bosque-luminaria-vagalume", "Pote de Vagalumes", "✨", 330, "Pontinhos de luz no bosque"],
    ["bosque-mesa-toco", "Mesinha de Toco", "🪵", 310, "Um tronco firme para apoiar brinquedos"],
    ["bosque-rede-folhas", "Rede de Folhas", "🍃", 420, "Balanço tranquilo entre galhos"],
    ["bosque-ponte-troncos", "Ponte de Tronquinhos", "🌳", 440, "Um caminho de aventura felina"],
    ["bosque-banco-bolota", "Banco de Bolota", "🌰", 230, "Assento pequeno de esquilo"],
    ["bosque-tapete-musgo", "Tapete de Musgo", "🌿", 250, "Parece pisar numa nuvem verde"],
    ["bosque-pinha-brinquedo", "Pinha de Brincar", "🌲", 190, "Um brinquedo natural e leve", undefined, 7],
    ["bosque-lago-sapo", "Lago dos Sapos", "🐸", 390, "Um lago quietinho com nenúfares", undefined, 6],
    ["bosque-cogumelo-luz", "Cogumelo-Lanterna", "🍄", 360, "Uma luz mágica debaixo das árvores"],
    ["bosque-casa-arvore", "Casinha na Árvore", "🏡", 540, "Um esconderijo nas alturas", 7],
  ],
  7: [
    ["neve-cama-iglu", "Caminha Iglu", "🧊", 440, "Um abrigo quentinho na neve"],
    ["neve-luminaria-floco", "Luminária Floco", "❄️", 360, "Brilho gelado sem fazer frio"],
    ["neve-trenozinho", "Trenó de Bigodes", "🛷", 410, "Deslize numa aventura imaginária"],
    ["neve-caneca-cacau", "Caneca de Cacau", "☕", 220, "Um mimo quente para a montanha", undefined, 8],
    ["neve-tapete-luvas", "Tapete de Luvas", "🧤", 260, "Patas aquecidas depois da neve"],
    ["neve-pinheiro", "Pinheiro Nevado", "🎄", 390, "Um pinheiro cheio de flocos"],
    ["neve-cristal-gelo", "Cristal de Gelo", "💎", 460, "Um brilho azul da montanha"],
    ["neve-cesto-cachecois", "Cesto de Cachecóis", "🧣", 310, "Cachecóis macios para a turma", undefined, 7],
    ["neve-boneco-patinha", "Boneco de Neve Patinha", "⛄", 300, "Um novo amigo para a varanda"],
    ["neve-banco-cabana", "Banco da Cabana", "🪵", 500, "Descanso seguro depois da trilha", 8],
  ],
  8: [
    ["biblioteca-nicho-livros", "Nicho de Livros", "📚", 480, "Uma caminha entre histórias"],
    ["biblioteca-torre-livros", "Pilha de Livros", "📖", 330, "Livros empilhados para explorar", undefined, 9],
    ["biblioteca-globo-patinhas", "Globo das Patinhas", "🌍", 420, "Descubra novos lugares no mapa"],
    ["biblioteca-escadinha", "Escadinha de Leitura", "🪜", 360, "Suba com cuidado até a prateleira"],
    ["biblioteca-luminaria-leitura", "Luminária de Leitura", "💡", 310, "Uma luz calma para as páginas"],
    ["biblioteca-apoio-bigodes", "Apoios de Bigode", "🐈", 280, "Seguram seus livros preferidos"],
    ["biblioteca-tubo-pergaminho", "Tubo de Pergaminhos", "📜", 260, "Mapas antigos bem protegidos"],
    ["biblioteca-pena-tinteiro", "Pena e Tinteiro", "🪶", 350, "Anote a próxima aventura", undefined, 8],
    ["biblioteca-almofada-atlas", "Almofada Atlas", "🗺️", 290, "Sonhe com viagens pelo mundo"],
    ["biblioteca-corujinha", "Corujinha de Pelúcia", "🦉", 450, "Uma guardiã das histórias", 9],
  ],
  9: [
    ["observatorio-telescopio-lunar", "Telescópio Lunar", "🔭", 520, "Olhe de perto as crateras da lua"],
    ["observatorio-poltrona-lua", "Poltrona Lua Crescente", "🌙", 460, "Um assento macio para observar"],
    ["observatorio-mobile-planetas", "Móbile dos Planetas", "🪐", 390, "Planetas coloridos giram no espaço"],
    ["observatorio-arranhador-foguete", "Arranhador Foguete", "🚀", 550, "Decole para uma missão de brincadeira"],
    ["observatorio-globo-estelar", "Globo Estelar", "✨", 480, "Um pequeno universo na sala"],
    ["observatorio-lanterna-cosmica", "Lanterna Cósmica", "🌌", 420, "Luz azul para noites estreladas"],
    ["observatorio-meteoritos", "Pedras de Meteorito", "☄️", 370, "Pedrinhas brilhantes do espaço"],
    ["observatorio-tapete-constelacao", "Tapete Constelação", "⭐", 410, "Ligue as estrelas com as patas", undefined, 9],
    ["observatorio-cometa-brinquedo", "Cometa de Brincar", "☄️", 310, "Rastro luminoso para perseguir", undefined, 10],
    ["observatorio-vaso-lua", "Vaso da Lua", "🌒", 430, "Uma planta que floresce ao luar", 10],
  ],
  10: [
    ["festival-varal-bandeirolas", "Varal de Bandeirolas", "🎊", 430, "Cores para celebrar a jornada"],
    ["festival-trofeu-pata", "Troféu Patinha Dourada", "🏆", 590, "Uma lembrança das grandes aventuras"],
    ["festival-mesa-bolo", "Mesa do Bolo", "🎂", 550, "O centro da festa da turma"],
    ["festival-arco-baloes", "Arco de Balões", "🎈", 490, "Uma entrada cheia de alegria"],
    ["festival-suporte-mascaras", "Suporte de Máscaras", "🎭", 390, "Fantasia para todos os bigodes"],
    ["festival-tambor-pata", "Tambor de Patinhas", "🥁", 360, "Ritmo para o festival felino", undefined, 10],
    ["festival-fonte-confetes", "Fonte de Confetes", "🎉", 620, "Uma chuva de papel colorido"],
    ["festival-cabine-fotos", "Cabine de Fotos", "📸", 570, "Guarde o retrato da turma"],
    ["festival-carro-alegorico", "Carrinho de Desfile", "🚗", 650, "Um desfile para os amigos", undefined, 10],
    ["festival-lanterna-estrela", "Lanterna da Festa", "🏮", 470, "Uma luz dourada para novas histórias", 10],
  ],
} as const satisfies Record<number, readonly DecorationSeed[]>;

type RoomSeedUnion = (typeof ROOM_SEEDS)[keyof typeof ROOM_SEEDS][number];
export type DecorationId = RoomSeedUnion[0];

export type DecorationDefinition = {
  id: DecorationId;
  room: number;
  name: string;
  icon: string;
  price: number;
  description: string;
  unlockLevel: number;
  missionsRequired?: number;
};

function buildRoom(room: number, seeds: readonly DecorationSeed[]): DecorationDefinition[] {
  return seeds.map(([id, name, icon, price, description, unlockLevel, missionsRequired]) => ({
    id: id as DecorationId,
    room,
    name,
    icon,
    price,
    description,
    unlockLevel: unlockLevel ?? room,
    ...(missionsRequired ? { missionsRequired } : {}),
  }));
}

export const DECORATIONS: DecorationDefinition[] = [
  ...buildRoom(1, ROOM_SEEDS[1]),
  ...buildRoom(2, ROOM_SEEDS[2]),
  ...buildRoom(3, ROOM_SEEDS[3]),
  ...buildRoom(4, ROOM_SEEDS[4]),
  ...buildRoom(5, ROOM_SEEDS[5]),
  ...buildRoom(6, ROOM_SEEDS[6]),
  ...buildRoom(7, ROOM_SEEDS[7]),
  ...buildRoom(8, ROOM_SEEDS[8]),
  ...buildRoom(9, ROOM_SEEDS[9]),
  ...buildRoom(10, ROOM_SEEDS[10]),
];

/** Stable 1:1 mapping: each of ten room pieces is earned by the matching stage in its world. */
export function getDecorationStageId(id: DecorationId): number | null {
  const item = DECORATIONS.find((entry) => entry.id === id);
  if (!item) return null;
  const inRoom = DECORATIONS.filter((entry) => entry.room === item.room);
  const stageInWorld = inRoom.findIndex((entry) => entry.id === id);
  return stageInWorld < 0 ? null : (item.room - 1) * 10 + stageInWorld + 1;
}

export function getDecorationLockReason(
  item: DecorationDefinition,
  level: number,
  missionsCompleted: number,
): string | null {
  if (level < item.unlockLevel) return `Desbloqueia no nível ${item.unlockLevel}`;
  if (item.missionsRequired && missionsCompleted < item.missionsRequired) {
    const remaining = item.missionsRequired - missionsCompleted;
    return `Complete ${remaining} ${remaining === 1 ? "missão" : "missões"}`;
  }
  return null;
}
