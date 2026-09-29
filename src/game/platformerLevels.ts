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
  grass: string;
  grassLight: string;
  soil: string;
  soilShadow: string;
  terrainTint: string;
};

/** Every house gets its own floor colors while the side-view grass tile stays readable. */
export const PLATFORM_PALETTES: PlatformPalette[] = [
  { skyTop: "#58b9ee", skyBottom: "#d3f4ff", farHill: "#9ad69d", nearHill: "#64ba83", accent: "#ffcf4a", hazard: "#ef6d86", star: "#fff4a8", grass: "#54a935", grassLight: "#91dc58", soil: "#aa673b", soilShadow: "#75472f", terrainTint: "#e6ffd5" },
  { skyTop: "#72d9e8", skyBottom: "#e5fff0", farHill: "#a6e580", nearHill: "#68c986", accent: "#ffdf65", hazard: "#ed7287", star: "#fffbd0", grass: "#69bd37", grassLight: "#b0e967", soil: "#a56e3f", soilShadow: "#71492e", terrainTint: "#eeffd8" },
  { skyTop: "#70bdec", skyBottom: "#fff0cc", farHill: "#f2c77d", nearHill: "#df9b57", accent: "#f35e87", hazard: "#a84061", star: "#ffdf75", grass: "#75a83c", grassLight: "#bfd65b", soil: "#a96339", soilShadow: "#70412d", terrainTint: "#fff0c1" },
  { skyTop: "#617dda", skyBottom: "#ffc89f", farHill: "#8b89c4", nearHill: "#565e9f", accent: "#ffdc68", hazard: "#ec6383", star: "#fff0aa", grass: "#579b61", grassLight: "#a9d87a", soil: "#a46b4f", soilShadow: "#71453d", terrainTint: "#ffe0c6" },
  { skyTop: "#52c5e7", skyBottom: "#d3f5ff", farHill: "#f2d18d", nearHill: "#e6ad60", accent: "#ff7f63", hazard: "#cb5368", star: "#fff4be", grass: "#56aa75", grassLight: "#a0e59c", soil: "#b88355", soilShadow: "#81583d", terrainTint: "#e1fbff" },
  { skyTop: "#4eaf9b", skyBottom: "#d5f3c8", farHill: "#83bf75", nearHill: "#438b64", accent: "#ffe175", hazard: "#e86a82", star: "#fff5bb", grass: "#327b43", grassLight: "#7eca53", soil: "#8d5837", soilShadow: "#573d2d", terrainTint: "#d9ffd1" },
  { skyTop: "#8bd8f0", skyBottom: "#edfaff", farHill: "#cee8f0", nearHill: "#a5d5e4", accent: "#6ac9ee", hazard: "#e76180", star: "#ffffff", grass: "#7bcbd4", grassLight: "#d7ffff", soil: "#a2c5d5", soilShadow: "#658ca7", terrainTint: "#edffff" },
  { skyTop: "#556b9f", skyBottom: "#e3c9ac", farHill: "#a49a9b", nearHill: "#655973", accent: "#ffd778", hazard: "#e35c74", star: "#ffedaa", grass: "#78684a", grassLight: "#d4b982", soil: "#87644a", soilShadow: "#533d36", terrainTint: "#ffe8c9" },
  { skyTop: "#222e75", skyBottom: "#8357a8", farHill: "#4e54a3", nearHill: "#303c87", accent: "#ffe270", hazard: "#ff7698", star: "#fff7cc", grass: "#537b8e", grassLight: "#9ee2ed", soil: "#68567e", soilShadow: "#403455", terrainTint: "#e2dcff" },
  { skyTop: "#483c93", skyBottom: "#f29cbd", farHill: "#ab68aa", nearHill: "#794995", accent: "#ffe26c", hazard: "#f04f71", star: "#fffbd6", grass: "#63a45f", grassLight: "#c2e57a", soil: "#9f5b58", soilShadow: "#643c53", terrainTint: "#ffe0e8" },
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

export type PlatformSurface = { x: number; y: number; width: number; height: number; kind: "ground" | "floating" };
export type PlatformCoin = { id: number; x: number; y: number; collected: boolean };
export type PlatformEnemy = { id: number; x: number; y: number; minX: number; maxX: number; direction: number; speed: number };
export type PlatformHazard = { x: number; y: number; width: number; height: number };
export type PlatformLayout = {
  surfaces: PlatformSurface[];
  groundSurfaces: PlatformSurface[];
  floatingSurfaces: PlatformSurface[];
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

/**
 * Deterministic, beatable side-scroller routes: wide ground ledges set the jumping rhythm,
 * raised one-way ledges add vertical exploration, and the world's palette defines its floor.
 */
export function createPlatformLayout(stageId: number, viewportHeight: number): PlatformLayout {
  const stage = getPlatformStage(stageId) ?? getPlatformStage(1)!;
  const height = Math.max(180, viewportHeight);
  const groundY = Math.max(96, Math.min(height - 72, height * 0.77));
  const world = stage.world;
  const sectionCount = 15 + Math.min(5, Math.floor((stageId - 1) / 20));
  const groundSurfaces: PlatformSurface[] = [{ x: 0, y: groundY, width: 360, height: 120, kind: "ground" }];
  let x = 360;
  let previousY = groundY;

  for (let index = 1; index <= sectionCount; index += 1) {
    const width = 252 + ((stageId * 17 + index * 23) % 62) - Math.min(24, world * 2);
    const gap = 54 + ((stageId * 13 + index * 29) % 36) + Math.min(12, Math.floor(world * 1.1));
    const verticalWave = Math.sin(index * 1.37 + stageId * 0.29) * (24 + world * 1.2);
    const y = clamp(previousY + verticalWave, height * 0.56, groundY + 16);
    x += gap;
    groundSurfaces.push({ x, y, width, height: 120, kind: "ground" });
    x += width;
    previousY = y;
  }

  const floatingSurfaces: PlatformSurface[] = [];
  groundSurfaces.forEach((surface, index) => {
    if (index < 2 || index >= groundSurfaces.length - 1) return;
    if ((index + stage.stageInWorld) % 2 === 0) {
      const width = 112 + ((stageId + index * 13) % 28);
      const lift = 76 + ((stageId * 3 + index * 7) % 30);
      const fx = surface.x + 22 + ((index * 11 + stageId) % 22);
      floatingSurfaces.push({ x: fx, y: Math.max(height * 0.39, surface.y - lift), width, height: 64, kind: "floating" });
      // Raised ledges and occasional stair-step platforms add readable up/down routes.
      if (stageId >= 3 && (index + stageId) % 4 === 0 && width + 92 < surface.width) {
        floatingSurfaces.push({ x: fx + width + 7, y: Math.max(height * 0.32, surface.y - lift - 66), width: 92, height: 64, kind: "floating" });
      }
    }
  });

  const surfaces = [...groundSurfaces, ...floatingSurfaces].sort((a, b) => a.x - b.x || a.y - b.y);
  const coins: PlatformCoin[] = [];
  const enemies: PlatformEnemy[] = [];
  const hazards: PlatformHazard[] = [];
  groundSurfaces.forEach((surface, index) => {
    const coinCount = surface.width > 270 && (index + stage.stageInWorld) % 2 === 0 ? 2 : 1;
    for (let item = 0; item < coinCount; item += 1) {
      const offset = coinCount === 1 ? surface.width * 0.52 : surface.width * (0.35 + item * 0.3);
      coins.push({ id: coins.length, x: surface.x + offset, y: surface.y - 60 - ((stageId + index + item) % 3) * 7, collected: false });
    }
  });
  floatingSurfaces.forEach((surface) => coins.push({ id: coins.length, x: surface.x + surface.width / 2, y: surface.y - 39, collected: false }));

  groundSurfaces.forEach((surface, index) => {
    if (index < 2 || index >= groundSurfaces.length - 1) return;
    const useEnemy = (index + stageId) % 3 !== 0;
    if (useEnemy) {
      // Keep a readable run-up to the pit and landing zone; the patrol remains on a wide ledge.
      const midpoint = surface.x + surface.width * 0.57;
      const patrol = Math.min(30, surface.width * 0.12);
      enemies.push({ id: enemies.length, x: midpoint, y: surface.y - 28, minX: midpoint - patrol, maxX: midpoint + patrol, direction: (index + stageId) % 2 ? 1 : -1, speed: 40 + world * 3 + stage.stageInWorld });
    } else if (index >= 3 && stage.stageInWorld >= 3 && (index + stageId) % 2 === 0) {
      hazards.push({ x: surface.x + surface.width * 0.58, y: surface.y - 24, width: 34 + (world % 3) * 5, height: 24 });
    }
  });

  const checkpointSurface = groundSurfaces[Math.floor(groundSurfaces.length / 2)];
  const lastSurface = groundSurfaces[groundSurfaces.length - 1];
  return {
    surfaces,
    groundSurfaces,
    floatingSurfaces,
    coins,
    enemies,
    hazards,
    checkpoint: { x: checkpointSurface.x + checkpointSurface.width * 0.5, y: checkpointSurface.y },
    start: { x: 66, y: groundSurfaces[0].y - 60 },
    goalX: lastSurface.x + lastSurface.width - 76,
    worldWidth: lastSurface.x + lastSurface.width + 180,
    groundY,
  };
}
