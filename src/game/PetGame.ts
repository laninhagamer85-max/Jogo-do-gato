import { DECORATIONS, getDecorationLockReason, type DecorationId } from "./decorations";

export { DECORATIONS, getDecorationLockReason } from "./decorations";
export type { DecorationDefinition, DecorationId } from "./decorations";

export type PetStats = {
  felicidade: number;
  fome: number;
  higiene: number;
  energia: number;
};

export type PetGender = "menino" | "menina";
export type PetCharacterId = "menino-prata" | "menino-laranja" | "menino-preto" | "menina-creme" | "menina-calico" | "menina-azul";
export type PetProfile = { name: string; age: number; gender: PetGender; characterId: PetCharacterId };
export type CompanionId = "mimi" | "tico";
export type SkinId = "tigrinho" | "laranja" | "pretinho" | "fantasia";
export type CareAction = "food" | "bath" | "love" | "sleep";
export type StoreItemId = "sardinha" | "novelo" | "banho" | "caminha";
export type DecorationPlacement = { id: string; itemId: DecorationId; x: number; y: number; rotation: number; anchor?: "background" | "viewport" };
export type SurpriseGift = {
  id: string;
  room: number;
  x: number;
  spawnedAt: number;
  expiresAt: number;
  reward: "coins" | "decoration";
  coins?: number;
  decorationId?: DecorationId;
};

export type GameState = {
  level: number;
  activeRoom: number;
  xp: number;
  xpMax: number;
  coins: number;
  missionProgress: number;
  missionClaimed: boolean;
  missionsCompleted: number;
  gamesPlayed: number;
  stats: PetStats;
  sleeping: boolean;
  skin: SkinId;
  ownedSkins: SkinId[];
  profile: PetProfile | null;
  tutorialComplete: boolean;
  inventory: Record<StoreItemId, number>;
  ownedCompanions: CompanionId[];
  activeCompanionId: CompanionId | null;
  decorInventory: Record<DecorationId, number>;
  roomDecorations: Record<string, DecorationPlacement[]>;
  gifts: SurpriseGift[];
};

export const MAX_LEVEL = 10;
export const CURRENT_SAVE_KEY = "meu-pet-virtual-save-v2";
export const LEGACY_SAVE_KEYS = ["meu-pet-virtual-save-v1", "pet_estado"] as const;

const EMPTY_DECOR: Record<DecorationId, number> = Object.fromEntries(DECORATIONS.map((item) => [item.id, 0])) as Record<DecorationId, number>;
const INITIAL_DECOR: Record<DecorationId, number> = { ...EMPTY_DECOR, bed: 1, plant: 1 };

export const INITIAL_GAME_STATE: GameState = {
  level: 1,
  activeRoom: 1,
  xp: 0,
  xpMax: 260,
  coins: 350,
  missionProgress: 0,
  missionClaimed: false,
  missionsCompleted: 0,
  gamesPlayed: 0,
  stats: { felicidade: 82, fome: 76, higiene: 90, energia: 88 },
  sleeping: false,
  skin: "tigrinho",
  ownedSkins: ["tigrinho"],
  profile: null,
  tutorialComplete: false,
  inventory: { sardinha: 1, novelo: 0, banho: 0, caminha: 0 },
  ownedCompanions: [],
  activeCompanionId: null,
  decorInventory: { ...INITIAL_DECOR },
  roomDecorations: {},
  gifts: [],
};

export const PET_CHARACTERS: Array<{ id: PetCharacterId; gender: PetGender; name: string; description: string; icon: string }> = [
  { id: "menino-prata", gender: "menino", name: "Pratinha", description: "Tabby cinza de olhos verdes", icon: "🐈" },
  { id: "menino-laranja", gender: "menino", name: "Pipoca", description: "Laranjinha cheio de energia", icon: "🐈" },
  { id: "menino-preto", gender: "menino", name: "Nino", description: "Tuxedo elegante e brincalhão", icon: "🐈‍⬛" },
  { id: "menina-creme", gender: "menina", name: "Luna", description: "Creme fofinha de olhos azuis", icon: "🐈" },
  { id: "menina-calico", gender: "menina", name: "Pintadinha", description: "Calico curiosa e colorida", icon: "🐈" },
  { id: "menina-azul", gender: "menina", name: "Íris", description: "Azul-acinzentada e sonhadora", icon: "🐈" },
];

export const SKINS: Array<{
  id: SkinId;
  name: string;
  price: number;
  icon: string;
  tint: string;
  description: string;
}> = [
  { id: "tigrinho", name: "Tigrinho", price: 0, icon: "🐱", tint: "#ffffff", description: "O clássico de olhos verdes" },
  { id: "laranja", name: "Laranjinha", price: 500, icon: "🐈", tint: "#fff6ed", description: "Uma dose extra de alegria" },
  { id: "pretinho", name: "Noir", price: 800, icon: "🐈‍⬛", tint: "#eef0ff", description: "Elegante e misterioso" },
  { id: "fantasia", name: "Fantasia", price: 1000, icon: "😺", tint: "#f8efff", description: "Brilho de outro planeta" },
];

export const STORE_ITEMS: Array<{
  id: StoreItemId;
  name: string;
  price: number;
  icon: string;
  description: string;
  stat: keyof PetStats;
  boost: number;
}> = [
  { id: "sardinha", name: "Sardinha crocante", price: 75, icon: "🐟", description: "Enche a barriguinha", stat: "fome", boost: 28 },
  { id: "novelo", name: "Novelo arco-íris", price: 90, icon: "🧶", description: "Um pouco mais de alegria", stat: "felicidade", boost: 26 },
  { id: "banho", name: "Espuma de nuvem", price: 105, icon: "🫧", description: "Um banho bem cheirosinho", stat: "higiene", boost: 28 },
  { id: "caminha", name: "Caminha de estrelas", price: 135, icon: "🛏️", description: "Recupera bastante energia", stat: "energia", boost: 32 },
];

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const validCharacter = (value: unknown): value is PetCharacterId => PET_CHARACTERS.some((item) => item.id === value);
const isSkinId = (value: unknown): value is SkinId => SKINS.some((item) => item.id === value);
const isCompanionId = (value: unknown): value is CompanionId => value === "mimi" || value === "tico";
const isDecorationId = (value: unknown): value is DecorationId => DECORATIONS.some((item) => item.id === value);

export function defaultCharacter(gender: PetGender): PetCharacterId {
  return gender === "menina" ? "menina-creme" : "menino-prata";
}

function normalizePlacement(value: unknown): DecorationPlacement | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<DecorationPlacement>;
  if (typeof item.id !== "string" || !item.id || !isDecorationId(item.itemId)) return null;
  return {
    id: item.id.slice(0, 80),
    itemId: item.itemId,
    x: clamp(Number.isFinite(Number(item.x)) ? Number(item.x) : 50, 0, 100),
    y: clamp(Number.isFinite(Number(item.y)) ? Number(item.y) : 72, 0, 100),
    rotation: ((Math.round(Number(item.rotation) || 0) % 360) + 360) % 360,
    anchor: item.anchor === "background" ? "background" : "viewport",
  };
}

export function createInitialGameState(): GameState {
  return {
    ...INITIAL_GAME_STATE,
    stats: { ...INITIAL_GAME_STATE.stats },
    inventory: { ...INITIAL_GAME_STATE.inventory },
    ownedSkins: [...INITIAL_GAME_STATE.ownedSkins],
    ownedCompanions: [],
    decorInventory: { ...INITIAL_DECOR },
    roomDecorations: {},
    gifts: [],
  };
}

/** Normalize current and older browser saves without deleting their original copy. */
export function migrateGameState(value: unknown, now = Date.now()): GameState {
  if (!value || typeof value !== "object") return createInitialGameState();
  const parsed = value as Partial<GameState> & Record<string, unknown>;
  const base = createInitialGameState();
  const rawProfile = parsed.profile as (Partial<PetProfile> & Record<string, unknown>) | null | undefined;
  const gender: PetGender | null = rawProfile?.gender === "menina" ? "menina" : rawProfile?.gender === "menino" ? "menino" : null;
  const selectedCharacter = validCharacter(rawProfile?.characterId) ? rawProfile.characterId : gender ? defaultCharacter(gender) : null;
  const profile = rawProfile && typeof rawProfile.name === "string" && gender && selectedCharacter
    ? { name: rawProfile.name.trim().slice(0, 18) || "Pudim", age: clamp(Number(rawProfile.age) || 1, 1, 25), gender, characterId: PET_CHARACTERS.find((item) => item.id === selectedCharacter)?.gender === gender ? selectedCharacter : defaultCharacter(gender) }
    : null;
  const ownedSkins = Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins.filter(isSkinId) : base.ownedSkins;
  const ownedCompanions = Array.isArray(parsed.ownedCompanions) ? parsed.ownedCompanions.filter(isCompanionId) : [];
  const level = Math.round(clamp(Number(parsed.level) || 1, 1, MAX_LEVEL));
  const inventory = parsed.inventory && typeof parsed.inventory === "object" ? parsed.inventory as Record<string, unknown> : {};
  const decorInventoryRaw = parsed.decorInventory && typeof parsed.decorInventory === "object" ? parsed.decorInventory as Record<string, unknown> : {};
  const validSkin = isSkinId(parsed.skin) && ownedSkins.includes(parsed.skin) ? parsed.skin : "tigrinho";
  const numeric = (input: unknown, fallback: number, min: number, max: number) => {
    const number = Number(input);
    return Number.isFinite(number) ? clamp(number, min, max) : fallback;
  };
  const active = isCompanionId(parsed.activeCompanionId) && ownedCompanions.includes(parsed.activeCompanionId) ? parsed.activeCompanionId : null;
  const rawRooms = parsed.roomDecorations && typeof parsed.roomDecorations === "object" ? parsed.roomDecorations as Record<string, unknown> : {};
  const roomDecorations: Record<string, DecorationPlacement[]> = {};
  Object.entries(rawRooms).forEach(([roomKey, rawItems]) => {
    const room = Number(roomKey);
    if (!Number.isInteger(room) || room < 1 || room > level || !Array.isArray(rawItems)) return;
    const placements = rawItems.map(normalizePlacement).filter((item): item is DecorationPlacement => item !== null).slice(0, 40);
    if (placements.length) roomDecorations[String(room)] = placements;
  });
  const activeRoom = Math.round(numeric(parsed.activeRoom, level, 1, level));
  const gifts: SurpriseGift[] = [];
  if (Array.isArray(parsed.gifts)) {
    parsed.gifts.forEach((raw) => {
      if (!raw || typeof raw !== "object" || gifts.length >= 2) return;
      const gift = raw as Partial<SurpriseGift>;
      if (typeof gift.id !== "string" || !gift.id || !Number.isFinite(Number(gift.expiresAt)) || Number(gift.expiresAt) <= now) return;
      const room = Math.round(numeric(gift.room, activeRoom, 1, level));
      const common = { id: gift.id.slice(0, 80), room, x: numeric(gift.x, 0.82, 0.12, 0.88), spawnedAt: numeric(gift.spawnedAt, now, 0, now + 1000), expiresAt: numeric(gift.expiresAt, now, now, now + 180000) };
      if (gift.reward === "coins") gifts.push({ ...common, reward: "coins", coins: Math.round(numeric(gift.coins, 80, 20, 500)) });
      else if (gift.reward === "decoration" && isDecorationId(gift.decorationId)) gifts.push({ ...common, reward: "decoration", decorationId: gift.decorationId });
    });
  }

  return {
    ...base,
    ...parsed,
    level,
    activeRoom,
    xp: numeric(parsed.xp, 0, 0, 999999),
    xpMax: numeric(parsed.xpMax, 260, 1, 99999),
    coins: Math.round(numeric(parsed.coins, base.coins, 0, 9999999)),
    missionProgress: Math.round(numeric(parsed.missionProgress, 0, 0, 3)),
    missionClaimed: parsed.missionClaimed === true,
    missionsCompleted: Math.round(numeric(parsed.missionsCompleted, Math.max(0, level - 1 + (parsed.missionClaimed === true ? 1 : 0)), 0, 9999)),
    gamesPlayed: Math.round(numeric(parsed.gamesPlayed, 0, 0, 999999)),
    stats: {
      felicidade: numeric(parsed.stats?.felicidade, base.stats.felicidade, 0, 100),
      fome: numeric(parsed.stats?.fome, base.stats.fome, 0, 100),
      higiene: numeric(parsed.stats?.higiene, base.stats.higiene, 0, 100),
      energia: numeric(parsed.stats?.energia, base.stats.energia, 0, 100),
    },
    sleeping: parsed.sleeping === true,
    skin: validSkin,
    ownedSkins: ownedSkins.length ? ownedSkins : ["tigrinho"],
    profile,
    tutorialComplete: parsed.tutorialComplete === true,
    inventory: {
      sardinha: Math.round(numeric(inventory.sardinha, base.inventory.sardinha, 0, 999)),
      novelo: Math.round(numeric(inventory.novelo, 0, 0, 999)),
      banho: Math.round(numeric(inventory.banho, 0, 0, 999)),
      caminha: Math.round(numeric(inventory.caminha, 0, 0, 999)),
    },
    ownedCompanions,
    activeCompanionId: active,
    decorInventory: Object.fromEntries(DECORATIONS.map((item) => [item.id, Math.round(numeric(decorInventoryRaw[item.id], base.decorInventory[item.id], 0, 999))])) as Record<DecorationId, number>,
    roomDecorations,
    gifts,
  };
}

function awardXp(state: GameState, amount: number): GameState {
  let level = state.level;
  let activeRoom = state.activeRoom;
  let xp = state.xp + amount;
  let xpMax = state.xpMax;
  let coins = state.coins;
  let missionProgress = state.missionProgress;
  let missionClaimed = state.missionClaimed;
  const ownedCompanions = [...state.ownedCompanions];
  let activeCompanionId = state.activeCompanionId;
  const decorInventory = { ...state.decorInventory };

  while (level < MAX_LEVEL && xp >= xpMax) {
    xp -= xpMax;
    level += 1;
    xpMax = Math.round(xpMax * 1.27);
    coins += 75;
    missionProgress = 0;
    missionClaimed = false;
    const unlocked: CompanionId | null = level === 3 ? "mimi" : level === 7 ? "tico" : null;
    if (unlocked && !ownedCompanions.includes(unlocked)) {
      ownedCompanions.push(unlocked);
      if (!activeCompanionId) activeCompanionId = unlocked;
    }
    const rewardDecor: Partial<Record<number, DecorationId>> = {
      2: "jardim-vaso-margaridas",
      4: "terraco-luzes-varal",
      6: "bosque-luminaria-vagalume",
      8: "biblioteca-nicho-livros",
    };
    const decor = rewardDecor[level];
    if (decor) decorInventory[decor] += 1;
    activeRoom = level;
  }
  if (level === MAX_LEVEL) xp = Math.min(xp, xpMax);

  return { ...state, level, activeRoom, xp, xpMax, coins, missionProgress, missionClaimed, ownedCompanions, activeCompanionId, decorInventory };
}

/** One care tick occurs every 30 seconds while the player is active. */
export function tickPet(state: GameState): GameState {
  const rate = state.sleeping ? 0.42 : 1;
  return {
    ...state,
    stats: {
      felicidade: clamp(state.stats.felicidade - 0.36 * rate),
      fome: clamp(state.stats.fome - 0.72 * rate),
      higiene: clamp(state.stats.higiene - 0.48 * rate),
      energia: clamp(state.stats.energia + (state.sleeping ? 1.1 : -0.35)),
    },
  };
}

export function performCare(state: GameState, action: CareAction): { state: GameState; message: string; ok: boolean } {
  const costs: Record<CareAction, number> = { food: 18, bath: 12, love: 0, sleep: 0 };
  const cost = costs[action];
  if (state.coins < cost) return { state, message: "Faltam moedas para esse cuidado.", ok: false };

  let next: GameState = { ...state, coins: state.coins - cost, sleeping: action === "sleep" ? !state.sleeping : false };
  const stats = { ...state.stats };
  const suffix = state.profile?.gender === "menina" ? "a" : "o";
  if (action === "food") {
    stats.fome = clamp(stats.fome + 25);
    stats.felicidade = clamp(stats.felicidade + 4);
    next = { ...next, stats };
    return { state: next, message: "Oba! Meu petisco favorito!", ok: true };
  }
  if (action === "bath") {
    stats.higiene = clamp(stats.higiene + 24);
    stats.felicidade = clamp(stats.felicidade + 3);
    next = { ...next, stats };
    return { state: next, message: `Banho tomado. Estou cheirosinh${suffix}!`, ok: true };
  }
  if (action === "love") {
    stats.felicidade = clamp(stats.felicidade + 18);
    stats.energia = clamp(stats.energia - 2);
    next = { ...next, stats };
    return { state: next, message: "Miau! Um carinho deixa meus bigodes em festa!", ok: true };
  }

  stats.energia = clamp(stats.energia + (state.sleeping ? 10 : 20));
  next = { ...next, stats };
  return { state: next, message: state.sleeping ? `Acordei renovadinh${suffix}! Vamos brincar?` : "Zzz… só mais cinco minutinhos…", ok: true };
}

export function completeMinigame(state: GameState): GameState {
  const nextProgress = Math.min(3, state.missionProgress + 1);
  let next: GameState = {
    ...state,
    missionProgress: nextProgress,
    missionsCompleted: state.missionsCompleted + (!state.missionClaimed && nextProgress >= 3 ? 1 : 0),
    gamesPlayed: state.gamesPlayed + 1,
    coins: state.coins + 60 + (!state.missionClaimed && nextProgress >= 3 ? 200 : 0),
    missionClaimed: state.missionClaimed || nextProgress >= 3,
  };
  next = awardXp(next, 50);
  return next;
}

export function buySkin(state: GameState, skinId: SkinId): { state: GameState; message: string; ok: boolean } {
  const skin = SKINS.find((item) => item.id === skinId);
  if (!skin) return { state, message: "Esse visual não está disponível.", ok: false };
  if (state.ownedSkins.includes(skinId)) return { state: { ...state, skin: skinId }, message: `${skin.name} equipado!`, ok: true };
  if (state.coins < skin.price) return { state, message: "Ainda faltam algumas moedas.", ok: false };
  return { state: { ...state, coins: state.coins - skin.price, skin: skinId, ownedSkins: [...state.ownedSkins, skinId] }, message: `${skin.name} desbloqueado!`, ok: true };
}

export function buyBoost(state: GameState, stat: keyof PetStats): { state: GameState; message: string; ok: boolean } {
  const price = 100;
  if (state.coins < price) return { state, message: "Ainda faltam algumas moedas.", ok: false };
  const labels: Record<keyof PetStats, string> = { felicidade: "felicidade", fome: "fome", higiene: "higiene", energia: "energia" };
  return { state: { ...state, coins: state.coins - price, stats: { ...state.stats, [stat]: clamp(state.stats[stat] + 30) } }, message: `Boost de ${labels[stat]} ativado!`, ok: true };
}

export function buyStoreItem(state: GameState, itemId: StoreItemId): { state: GameState; message: string; ok: boolean } {
  const item = STORE_ITEMS.find((entry) => entry.id === itemId);
  if (!item) return { state, message: "Esse mimo não está disponível.", ok: false };
  if (state.coins < item.price) return { state, message: "Ainda faltam algumas moedas.", ok: false };
  return { state: { ...state, coins: state.coins - item.price, inventory: { ...state.inventory, [itemId]: state.inventory[itemId] + 1 } }, message: `${item.name} foi para a mochila!`, ok: true };
}

export function useStoreItem(state: GameState, itemId: StoreItemId): { state: GameState; message: string; ok: boolean } {
  const item = STORE_ITEMS.find((entry) => entry.id === itemId);
  if (!item || state.inventory[itemId] < 1) return { state, message: "Esse item não está na mochila.", ok: false };
  return {
    state: { ...state, inventory: { ...state.inventory, [itemId]: state.inventory[itemId] - 1 }, stats: { ...state.stats, [item.stat]: clamp(state.stats[item.stat] + item.boost) }, sleeping: itemId === "caminha" ? true : state.sleeping },
    message: `${item.icon} ${item.name}: ${item.description.toLowerCase()}!`,
    ok: true,
  };
}

export function buyDecoration(state: GameState, itemId: DecorationId): { state: GameState; message: string; ok: boolean } {
  const item = DECORATIONS.find((entry) => entry.id === itemId);
  if (!item) return { state, message: "Essa decoração não está disponível.", ok: false };
  const locked = getDecorationLockReason(item, state.level, state.missionsCompleted);
  if (locked) return { state, message: `${item.name}: ${locked.toLowerCase()}.`, ok: false };
  if (state.coins < item.price) return { state, message: "Ainda faltam algumas moedas.", ok: false };
  return { state: { ...state, coins: state.coins - item.price, decorInventory: { ...state.decorInventory, [itemId]: state.decorInventory[itemId] + 1 } }, message: `${item.name} foi para sua mochila de decoração!`, ok: true };
}

export function selectRoom(state: GameState, room: number): GameState {
  if (!Number.isInteger(room) || room < 1 || room > state.level) return state;
  return { ...state, activeRoom: room };
}

export function placeDecoration(state: GameState, placement: DecorationPlacement): { state: GameState; ok: boolean; message: string } {
  const item = DECORATIONS.find((entry) => entry.id === placement.itemId);
  if (!item || state.decorInventory[placement.itemId] < 1) return { state, ok: false, message: "Esse item não está na mochila." };
  const locked = getDecorationLockReason(item, state.level, state.missionsCompleted);
  if (locked) return { state, ok: false, message: `${item.name}: ${locked.toLowerCase()}.` };
  const roomKey = String(state.activeRoom);
  const items = state.roomDecorations[roomKey] ?? [];
  if (items.length >= 20) return { state, ok: false, message: "Esta casa já está cheia de mimos." };
  const safePlacement = normalizePlacement(placement);
  if (!safePlacement) return { state, ok: false, message: "Não consegui posicionar esse item." };
  return {
    state: { ...state, decorInventory: { ...state.decorInventory, [placement.itemId]: state.decorInventory[placement.itemId] - 1 }, roomDecorations: { ...state.roomDecorations, [roomKey]: [...items, safePlacement] } },
    ok: true,
    message: "Decoração colocada! Ela fica presa ao cenário; toque nela para ajustar.",
  };
}

export function updateDecoration(state: GameState, id: string, patch: Partial<Pick<DecorationPlacement, "x" | "y" | "rotation" | "anchor">>): GameState {
  const roomKey = String(state.activeRoom);
  const items = state.roomDecorations[roomKey] ?? [];
  if (!items.some((item) => item.id === id)) return state;
  return { ...state, roomDecorations: { ...state.roomDecorations, [roomKey]: items.map((item) => item.id === id ? { ...item, ...patch, anchor: patch.anchor ?? item.anchor ?? "viewport", x: clamp(patch.x ?? item.x, 0, 100), y: clamp(patch.y ?? item.y, 0, 100), rotation: ((Math.round(patch.rotation ?? item.rotation) % 360) + 360) % 360 } : item) } };
}

export function removeDecoration(state: GameState, id: string): GameState {
  const roomKey = String(state.activeRoom);
  const items = state.roomDecorations[roomKey] ?? [];
  const item = items.find((candidate) => candidate.id === id);
  if (!item) return state;
  return { ...state, decorInventory: { ...state.decorInventory, [item.itemId]: state.decorInventory[item.itemId] + 1 }, roomDecorations: { ...state.roomDecorations, [roomKey]: items.filter((candidate) => candidate.id !== id) } };
}

export function spawnSurpriseGift(state: GameState, id: string, now = Date.now(), random: () => number = Math.random): GameState {
  const live = state.gifts.filter((gift) => gift.expiresAt > now);
  if (live.length >= 2) return { ...state, gifts: live };
  const reward = random() < 0.56 ? "coins" : "decoration";
  const decorChoices = DECORATIONS.filter((item) => !getDecorationLockReason(item, state.level, state.missionsCompleted));
  const gift: SurpriseGift = {
    id,
    room: state.activeRoom,
    x: random() < 0.5 ? 0.18 : 0.82,
    spawnedAt: now,
    expiresAt: now + 90000,
    reward,
    ...(reward === "coins" ? { coins: 70 + Math.floor(random() * 71) } : { decorationId: decorChoices[Math.floor(random() * decorChoices.length)]?.id ?? "plant" }),
  };
  return { ...state, gifts: [...live, gift] };
}

export function expireGifts(state: GameState, now = Date.now()): GameState {
  const gifts = state.gifts.filter((gift) => gift.expiresAt > now);
  return gifts.length === state.gifts.length ? state : { ...state, gifts };
}

export function collectSurpriseGift(state: GameState, id: string, now = Date.now()): { state: GameState; ok: boolean; message: string } {
  const gift = state.gifts.find((candidate) => candidate.id === id);
  if (!gift) return { state, ok: false, message: "Esse presente já não está mais aqui." };
  const withoutGift = { ...state, gifts: state.gifts.filter((candidate) => candidate.id !== id) };
  if (gift.expiresAt <= now) return { state: withoutGift, ok: false, message: "O presente expirou; outro pode aparecer logo." };
  if (gift.reward === "coins") return { state: { ...withoutGift, coins: withoutGift.coins + (gift.coins ?? 80) }, ok: true, message: `Presente surpresa! +${gift.coins ?? 80} moedas.` };
  const decorationId = gift.decorationId ?? "plant";
  const item = DECORATIONS.find((entry) => entry.id === decorationId)!;
  return { state: { ...withoutGift, decorInventory: { ...withoutGift.decorInventory, [decorationId]: withoutGift.decorInventory[decorationId] + 1 } }, ok: true, message: `Presente surpresa: ${item.name} para decorar!` };
}

export function setPetProfile(state: GameState, profile: PetProfile): GameState {
  const gender: PetGender = profile.gender === "menina" ? "menina" : "menino";
  const characterId = validCharacter(profile.characterId) && PET_CHARACTERS.find((item) => item.id === profile.characterId)?.gender === gender ? profile.characterId : defaultCharacter(gender);
  return { ...state, profile: { name: profile.name.trim().slice(0, 18) || "Pudim", age: clamp(Math.round(profile.age), 1, 25), gender, characterId } };
}

export function chooseCompanion(state: GameState, id: CompanionId | null): { state: GameState; ok: boolean; message: string } {
  if (id && !state.ownedCompanions.includes(id)) return { state, ok: false, message: "Esse amigo aparece durante a aventura." };
  return { state: { ...state, activeCompanionId: id }, ok: true, message: id ? "Seu companheiro já está pronto para brincar!" : "Hoje vamos explorar só nós dois." };
}
