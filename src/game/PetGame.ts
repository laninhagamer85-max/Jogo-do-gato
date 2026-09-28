export type PetStats = {
  felicidade: number;
  fome: number;
  higiene: number;
  energia: number;
};

export type PetGender = "menino" | "menina";
export type PetProfile = { name: string; age: number; gender: PetGender };
export type CompanionId = "mimi" | "tico";
export type SkinId = "tigrinho" | "laranja" | "pretinho" | "fantasia";
export type CareAction = "food" | "bath" | "love" | "sleep";
export type StoreItemId = "sardinha" | "novelo" | "banho" | "caminha";

export type GameState = {
  level: number;
  xp: number;
  xpMax: number;
  coins: number;
  missionProgress: number;
  missionClaimed: boolean;
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
};

export const MAX_LEVEL = 10;
export const CURRENT_SAVE_KEY = "meu-pet-virtual-save-v2";
export const LEGACY_SAVE_KEYS = ["meu-pet-virtual-save-v1", "pet_estado"] as const;

export const INITIAL_GAME_STATE: GameState = {
  level: 1,
  xp: 0,
  xpMax: 260,
  coins: 350,
  missionProgress: 0,
  missionClaimed: false,
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
};

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
const isSkinId = (value: unknown): value is SkinId => SKINS.some((item) => item.id === value);
const isCompanionId = (value: unknown): value is CompanionId => value === "mimi" || value === "tico";

export function createInitialGameState(): GameState {
  return {
    ...INITIAL_GAME_STATE,
    stats: { ...INITIAL_GAME_STATE.stats },
    inventory: { ...INITIAL_GAME_STATE.inventory },
    ownedSkins: [...INITIAL_GAME_STATE.ownedSkins],
    ownedCompanions: [],
  };
}

/** Normalize current and older browser saves without deleting the legacy copy. */
export function migrateGameState(value: unknown): GameState {
  if (!value || typeof value !== "object") return createInitialGameState();
  const parsed = value as Partial<GameState> & Record<string, unknown>;
  const base = createInitialGameState();
  const rawProfile = parsed.profile as Partial<PetProfile> | null | undefined;
  const profile = rawProfile && typeof rawProfile.name === "string" && (rawProfile.gender === "menino" || rawProfile.gender === "menina")
    ? { name: rawProfile.name.trim().slice(0, 18) || "Pudim", age: clamp(Number(rawProfile.age) || 1, 1, 25), gender: rawProfile.gender }
    : null;
  const ownedSkins = Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins.filter(isSkinId) : base.ownedSkins;
  const ownedCompanions = Array.isArray(parsed.ownedCompanions) ? parsed.ownedCompanions.filter(isCompanionId) : [];
  const level = Math.round(clamp(Number(parsed.level) || 1, 1, MAX_LEVEL));
  const inventory = parsed.inventory && typeof parsed.inventory === "object" ? parsed.inventory : {};
  const validSkin = isSkinId(parsed.skin) && ownedSkins.includes(parsed.skin) ? parsed.skin : "tigrinho";
  const numeric = (input: unknown, fallback: number, min: number, max: number) => {
    const number = Number(input);
    return Number.isFinite(number) ? clamp(number, min, max) : fallback;
  };
  const active = isCompanionId(parsed.activeCompanionId) && ownedCompanions.includes(parsed.activeCompanionId) ? parsed.activeCompanionId : null;

  return {
    ...base,
    ...parsed,
    level,
    xp: numeric(parsed.xp, 0, 0, 999999),
    xpMax: numeric(parsed.xpMax, 260, 1, 99999),
    coins: Math.round(numeric(parsed.coins, base.coins, 0, 9999999)),
    missionProgress: Math.round(numeric(parsed.missionProgress, 0, 0, 3)),
    missionClaimed: parsed.missionClaimed === true,
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
      sardinha: Math.round(numeric((inventory as Record<string, unknown>).sardinha, base.inventory.sardinha, 0, 999)),
      novelo: Math.round(numeric((inventory as Record<string, unknown>).novelo, 0, 0, 999)),
      banho: Math.round(numeric((inventory as Record<string, unknown>).banho, 0, 0, 999)),
      caminha: Math.round(numeric((inventory as Record<string, unknown>).caminha, 0, 0, 999)),
    },
    ownedCompanions,
    activeCompanionId: active,
  };
}

function awardXp(state: GameState, amount: number): GameState {
  let level = state.level;
  let xp = state.xp + amount;
  let xpMax = state.xpMax;
  let coins = state.coins;
  let missionProgress = state.missionProgress;
  let missionClaimed = state.missionClaimed;
  const ownedCompanions = [...state.ownedCompanions];
  let activeCompanionId = state.activeCompanionId;

  while (level < MAX_LEVEL && xp >= xpMax) {
    xp -= xpMax;
    level += 1;
    xpMax = Math.round(xpMax * 1.14);
    coins += 75;
    missionProgress = 0;
    missionClaimed = false;
    const unlocked: CompanionId | null = level === 3 ? "mimi" : level === 7 ? "tico" : null;
    if (unlocked && !ownedCompanions.includes(unlocked)) {
      ownedCompanions.push(unlocked);
      if (!activeCompanionId) activeCompanionId = unlocked;
    }
  }
  if (level === MAX_LEVEL) xp = Math.min(xp, xpMax);

  return { ...state, level, xp, xpMax, coins, missionProgress, missionClaimed, ownedCompanions, activeCompanionId };
}

export function tickPet(state: GameState): GameState {
  const rate = state.sleeping ? 0.35 : 1;
  return {
    ...state,
    stats: {
      felicidade: clamp(state.stats.felicidade - 0.35 * rate),
      fome: clamp(state.stats.fome - 0.7 * rate),
      higiene: clamp(state.stats.higiene - 0.45 * rate),
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
    return { state: next, message: "Miau! Adoro receber carinho!", ok: true };
  }

  stats.energia = clamp(stats.energia + (state.sleeping ? 10 : 20));
  next = { ...next, stats };
  return { state: next, message: state.sleeping ? `Acordei renovadinh${suffix}! Vamos brincar?` : "Zzz… um soninho vai fazer bem.", ok: true };
}

export function completeMinigame(state: GameState): GameState {
  const nextProgress = Math.min(3, state.missionProgress + 1);
  let next: GameState = {
    ...state,
    missionProgress: nextProgress,
    gamesPlayed: state.gamesPlayed + 1,
    coins: state.coins + 60 + (!state.missionClaimed && nextProgress >= 3 ? 200 : 0),
    missionClaimed: state.missionClaimed || nextProgress >= 3,
  };
  next = awardXp(next, 80);
  return next;
}

export function buySkin(state: GameState, skinId: SkinId): { state: GameState; message: string; ok: boolean } {
  const skin = SKINS.find((item) => item.id === skinId);
  if (!skin) return { state, message: "Esse visual não está disponível.", ok: false };
  if (state.ownedSkins.includes(skinId)) return { state: { ...state, skin: skinId }, message: `${skin.name} equipado!`, ok: true };
  if (state.coins < skin.price) return { state, message: "Ainda faltam algumas moedas.", ok: false };
  return {
    state: { ...state, coins: state.coins - skin.price, skin: skinId, ownedSkins: [...state.ownedSkins, skinId] },
    message: `${skin.name} desbloqueado!`,
    ok: true,
  };
}

export function buyBoost(state: GameState, stat: keyof PetStats): { state: GameState; message: string; ok: boolean } {
  const price = 100;
  if (state.coins < price) return { state, message: "Ainda faltam algumas moedas.", ok: false };
  const labels: Record<keyof PetStats, string> = { felicidade: "felicidade", fome: "fome", higiene: "higiene", energia: "energia" };
  return {
    state: { ...state, coins: state.coins - price, stats: { ...state.stats, [stat]: clamp(state.stats[stat] + 30) } },
    message: `Boost de ${labels[stat]} ativado!`,
    ok: true,
  };
}

export function buyStoreItem(state: GameState, itemId: StoreItemId): { state: GameState; message: string; ok: boolean } {
  const item = STORE_ITEMS.find((entry) => entry.id === itemId);
  if (!item) return { state, message: "Esse mimo não está disponível.", ok: false };
  if (state.coins < item.price) return { state, message: "Ainda faltam algumas moedas.", ok: false };
  return {
    state: { ...state, coins: state.coins - item.price, inventory: { ...state.inventory, [itemId]: state.inventory[itemId] + 1 } },
    message: `${item.name} foi para a mochila!`,
    ok: true,
  };
}

export function useStoreItem(state: GameState, itemId: StoreItemId): { state: GameState; message: string; ok: boolean } {
  const item = STORE_ITEMS.find((entry) => entry.id === itemId);
  if (!item || state.inventory[itemId] < 1) return { state, message: "Esse item não está na mochila.", ok: false };
  return {
    state: {
      ...state,
      inventory: { ...state.inventory, [itemId]: state.inventory[itemId] - 1 },
      stats: { ...state.stats, [item.stat]: clamp(state.stats[item.stat] + item.boost) },
      sleeping: itemId === "caminha" ? true : state.sleeping,
    },
    message: `${item.icon} ${item.name}: ${item.description.toLowerCase()}!`,
    ok: true,
  };
}

export function setPetProfile(state: GameState, profile: PetProfile): GameState {
  return { ...state, profile: { name: profile.name.trim().slice(0, 18) || "Pudim", age: clamp(Math.round(profile.age), 1, 25), gender: profile.gender } };
}

export function chooseCompanion(state: GameState, id: CompanionId | null): { state: GameState; ok: boolean; message: string } {
  if (id && !state.ownedCompanions.includes(id)) return { state, ok: false, message: "Esse amigo aparece durante a aventura." };
  return { state: { ...state, activeCompanionId: id }, ok: true, message: id ? "Seu companheiro já está pronto para brincar!" : "Hoje vamos explorar só nós dois." };
}
