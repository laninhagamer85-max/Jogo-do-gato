export type PetStats = {
  felicidade: number;
  fome: number;
  higiene: number;
  energia: number;
};

export type SkinId = "tigrinho" | "laranja" | "pretinho" | "fantasia";
export type CareAction = "food" | "bath" | "love" | "sleep";

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
};

export const INITIAL_GAME_STATE: GameState = {
  level: 5,
  xp: 320,
  xpMax: 500,
  coins: 1250,
  missionProgress: 1,
  missionClaimed: false,
  gamesPlayed: 1,
  stats: { felicidade: 85, fome: 70, higiene: 92, energia: 65 },
  sleeping: false,
  skin: "tigrinho",
  ownedSkins: ["tigrinho"],
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
  { id: "laranja", name: "Laranjinha", price: 500, icon: "🐈", tint: "#ffbb75", description: "Uma dose extra de alegria" },
  { id: "pretinho", name: "Noir", price: 800, icon: "🐈‍⬛", tint: "#8294bb", description: "Elegante e misterioso" },
  { id: "fantasia", name: "Fantasia", price: 1000, icon: "😺", tint: "#d8c5ff", description: "Brilho de outro planeta" },
];

const clamp = (value: number) => Math.max(0, Math.min(100, value));

function awardXp(state: GameState, amount: number): GameState {
  let { level, xp, xpMax, coins } = state;
  xp += amount;
  while (xp >= xpMax) {
    xp -= xpMax;
    level += 1;
    xpMax = Math.round(xpMax * 1.12);
    coins += 50;
  }
  return { ...state, level, xp, xpMax, coins };
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

export function performCare(
  state: GameState,
  action: CareAction,
): { state: GameState; message: string; ok: boolean } {
  const costs: Record<CareAction, number> = { food: 18, bath: 12, love: 0, sleep: 0 };
  const cost = costs[action];
  if (state.coins < cost) return { state, message: "Faltam moedas para esse cuidado.", ok: false };

  let next: GameState = { ...state, coins: state.coins - cost, sleeping: action === "sleep" ? !state.sleeping : false };
  const stats = { ...state.stats };
  if (action === "food") {
    stats.fome = clamp(stats.fome + 25);
    stats.felicidade = clamp(stats.felicidade + 4);
    next = { ...next, stats };
    return { state: next, message: "Que delícia! Meu petisco favorito!", ok: true };
  }
  if (action === "bath") {
    stats.higiene = clamp(stats.higiene + 24);
    stats.felicidade = clamp(stats.felicidade + 3);
    next = { ...next, stats };
    return { state: next, message: "Banho tomado. Estou cheirosinho!", ok: true };
  }
  if (action === "love") {
    stats.felicidade = clamp(stats.felicidade + 18);
    stats.energia = clamp(stats.energia - 2);
    next = { ...next, stats };
    return { state: next, message: "Miau! Adoro receber carinho!", ok: true };
  }

  stats.energia = clamp(stats.energia + (state.sleeping ? 10 : 20));
  next = { ...next, stats };
  return {
    state: next,
    message: state.sleeping ? "Acordei renovado! Vamos brincar?" : "Zzz… um soninho vai fazer bem.",
    ok: true,
  };
}

export function completeMinigame(state: GameState): GameState {
  const nextProgress = Math.min(3, state.missionProgress + 1);
  let next: GameState = {
    ...state,
    missionProgress: nextProgress,
    gamesPlayed: state.gamesPlayed + 1,
    coins: state.coins + 60,
  };
  next = awardXp(next, 80);
  if (nextProgress >= 3 && !state.missionClaimed) {
    next = { ...next, coins: next.coins + 200, missionClaimed: true };
  }
  return next;
}

export function buySkin(state: GameState, skinId: SkinId): { state: GameState; message: string; ok: boolean } {
  const skin = SKINS.find((item) => item.id === skinId);
  if (!skin) return { state, message: "Esse visual não está disponível.", ok: false };
  if (state.ownedSkins.includes(skinId)) {
    return { state: { ...state, skin: skinId }, message: `${skin.name} equipado!`, ok: true };
  }
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
  const labels: Record<keyof PetStats, string> = {
    felicidade: "felicidade",
    fome: "fome",
    higiene: "higiene",
    energia: "energia",
  };
  return {
    state: { ...state, coins: state.coins - price, stats: { ...state.stats, [stat]: clamp(state.stats[stat] + 30) } },
    message: `Boost de ${labels[stat]} ativado!`,
    ok: true,
  };
}
