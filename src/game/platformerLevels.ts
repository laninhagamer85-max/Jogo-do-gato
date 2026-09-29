import { DECORATIONS, type DecorationDefinition } from "./decorations";
import { CAMPAIGN_LEVELS, getCampaignLevel } from "./levels";

export type PlatformPalette = {
  skyTop: string;
  skyBottom: string;
  farHill: string;
  nearHill: string;
  accent: string;
  hazard: string;
  star: string;
};

export const PLATFORM_PALETTES: PlatformPalette[] = [
  { skyTop: "#58b9ee", skyBottom: "#d3f4ff", farHill: "#9ad69d", nearHill: "#64ba83", accent: "#ffcf4a", hazard: "#ef6d86", star: "#fff4a8" },
  { skyTop: "#72d9e8", skyBottom: "#e5fff0", farHill: "#a6e580", nearHill: "#68c986", accent: "#ffdf65", hazard: "#ed7287", star: "#fffbd0" },
  { skyTop: "#70bdec", skyBottom: "#fff0cc", farHill: "#f2c77d", nearHill: "#df9b57", accent: "#f35e87", hazard: "#a84061", star: "#ffdf75" },
  { skyTop: "#617dda", skyBottom: "#ffc89f", farHill: "#8b89c4", nearHill: "#565e9f", accent: "#ffdc68", hazard: "#ec6383", star: "#fff0aa" },
  { skyTop: "#52c5e7", skyBottom: "#d3f5ff", farHill: "#f2d18d", nearHill: "#e6ad60", accent: "#ff7f63", hazard: "#cb5368", star: "#fff4be" },
  { skyTop: "#4eaf9b", skyBottom: "#d5f3c8", farHill: "#83bf75", nearHill: "#438b64", accent: "#ffe175", hazard: "#e86a82", star: "#fff5bb" },
  { skyTop: "#8bd8f0", skyBottom: "#edfaff", farHill: "#cee8f0", nearHill: "#a5d5e4", accent: "#6ac9ee", hazard: "#e76180", star: "#ffffff" },
  { skyTop: "#556b9f", skyBottom: "#e3c9ac", farHill: "#a49a9b", nearHill: "#655973", accent: "#ffd778", hazard: "#e35c74", star: "#ffedaa" },
  { skyTop: "#222e75", skyBottom: "#8357a8", farHill: "#4e54a3", nearHill: "#303c87", accent: "#ffe270", hazard: "#ff7698", star: "#fff7cc" },
  { skyTop: "#483c93", skyBottom: "#f29cbd", farHill: "#ab68aa", nearHill: "#794995", accent: "#ffe26c", hazard: "#f04f71", star: "#fffbd6" },
];

const STAGE_BEATS = [
  "Siga as patinhas douradas", "Atravesse a ponte saltitante", "Desvie dos guardiões de gelatina", "Encontre o caminho das alturas", "Ative o marco de amizade", "Pule por cima dos espinhos", "Resgate os petiscos perdidos", "Atravesse a trilha escondida", "Reúna as moedas brilhantes", "Chegue ao portal da próxima casa",
];

export type PlatformStage = {
  id: number;
  world: number;
  stageInWorld: number;
  title: string;
  subtitle: string;
  story: string;
  objective: string;
  reward: DecorationDefinition;
  palette: PlatformPalette;
  difficulty: number;
};

export function getPlatformStage(stageId: number): PlatformStage | undefined {
  if (!Number.isInteger(stageId) || stageId < 1 || stageId > 100) return undefined;
  const world = Math.ceil(stageId / 10);
  const stageInWorld = (stageId - 1) % 10 + 1;
  const chapter = getCampaignLevel(world);
  const reward = DECORATIONS.filter((item) => item.room === world)[stageInWorld - 1];
  if (!reward) return undefined;
  const subtitle = STAGE_BEATS[stageInWorld - 1];
  return {
    id: stageId,
    world,
    stageInWorld,
    title: `${chapter.location} · ${String(stageInWorld).padStart(2, "0")}`,
    subtitle,
    story: stageInWorld === 1 ? chapter.story : `${chapter.title}: ${subtitle.toLowerCase()} e descubra uma nova parte desta história.`,
    objective: stageInWorld === 10 ? "Alcance o portal dourado para fechar este mundo." : `${subtitle}. Alcance o portal para concluir a fase.`,
    reward,
    palette: PLATFORM_PALETTES[world - 1],
    difficulty: world * 10 + stageInWorld - 1,
  };
}

export function getPlatformWorld(world: number) {
  if (!Number.isInteger(world) || world < 1 || world > 10) return undefined;
  return CAMPAIGN_LEVELS[world - 1];
}

export type PlatformSurface = { x: number; y: number; width: number; height: number };
export type PlatformCoin = { id: number; x: number; y: number; collected: boolean };
export type PlatformEnemy = { id: number; x: number; y: number; minX: number; maxX: number; direction: number; speed: number };
export type PlatformHazard = { x: number; y: number; width: number; height: number };
export type PlatformLayout = {
  surfaces: PlatformSurface[];
  coins: PlatformCoin[];
  enemies: PlatformEnemy[];
  hazards: PlatformHazard[];
  checkpoint: { x: number; y: number };
  start: { x: number; y: number };
  goalX: number;
  worldWidth: number;
  groundY: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Deterministic, hand-tuned platform spacing keeps each generated route beatable on keyboard and touch. */
export function createPlatformLayout(stageId: number, viewportHeight: number): PlatformLayout {
  const stage = getPlatformStage(stageId) ?? getPlatformStage(1)!;
  const height = Math.max(180, viewportHeight);
  const groundY = Math.max(96, Math.min(height - 62, height * 0.78));
  const world = stage.world;
  const surfaceCount = 9 + Math.min(3, Math.floor((stageId - 1) / 30));
  const surfaces: PlatformSurface[] = [{ x: 0, y: groundY, width: 410, height: 150 }];
  let x = 410;
  let previousY = groundY;

  for (let index = 1; index <= surfaceCount; index += 1) {
    const width = 232 + ((stageId * 11 + index * 19) % 46) - Math.min(20, world * 2);
    const gap = 34 + ((stageId * 17 + index * 29) % 44) + Math.min(18, Math.floor(world * 1.6));
    const verticalWave = Math.sin(index * 1.73 + stageId * 0.31) * (22 + world * 1.2);
    const y = clamp(previousY + verticalWave, height * 0.57, groundY + 8);
    x += gap;
    surfaces.push({ x, y, width, height: 150 });
    x += width;
    previousY = y;
  }

  const coins: PlatformCoin[] = [];
  const enemies: PlatformEnemy[] = [];
  const hazards: PlatformHazard[] = [];
  surfaces.forEach((surface, index) => {
    if (index > 0) {
      const count = surface.width > 245 ? 2 : 1;
      for (let item = 0; item < count; item += 1) {
        const offset = count === 1 ? surface.width * 0.52 : surface.width * (0.34 + item * 0.34);
        coins.push({ id: coins.length, x: surface.x + offset, y: surface.y - 63 - ((stageId + index + item) % 3) * 7, collected: false });
      }
    }
    const hasEnemy = index >= 2 && index < surfaces.length - 1 && ((index + stageId) % 3 !== 0);
    if (hasEnemy) {
      // Keep the landing zone clear; patrols occupy the run-up to the next gap.
      const midpoint = surface.x + surface.width * 0.82;
      enemies.push({ id: enemies.length, x: midpoint, y: surface.y - 30, minX: surface.x + surface.width * 0.78, maxX: surface.x + surface.width * 0.86, direction: (index + stageId) % 2 ? 1 : -1, speed: 38 + world * 4 + stage.stageInWorld * 2 });
    }
    if (!hasEnemy && index >= 3 && stage.stageInWorld >= 4 && index < surfaces.length - 1 && ((index * 2 + stageId) % 4 === 0)) {
      // Spikes sit inside the gap-jump run-up, never under an enemy or at a landing point.
      hazards.push({ x: surface.x + surface.width * 0.80, y: surface.y - 30, width: 46 + (world % 3) * 5, height: 30 });
    }
  });

  const checkpointSurface = surfaces[Math.floor(surfaces.length / 2)];
  const lastSurface = surfaces[surfaces.length - 1];
  return {
    surfaces,
    coins,
    enemies,
    hazards,
    checkpoint: { x: checkpointSurface.x + checkpointSurface.width * 0.5, y: checkpointSurface.y },
    start: { x: 66, y: surfaces[0].y - 60 },
    goalX: lastSurface.x + lastSurface.width - 76,
    worldWidth: lastSurface.x + lastSurface.width + 120,
    groundY,
  };
}
