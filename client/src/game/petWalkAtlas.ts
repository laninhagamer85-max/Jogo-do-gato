import { cleanWalkAtlas } from "./petFrameCleanup";
import type { PetCharacterId } from "./PetGame";
/** Original variant-specific pilot atlases: four columns and directional rows. */
export const PET_WALK_PILOT = '/manus-storage/menino-prata-walk-pilot-v1.png';
const PILOT_ATLASES: Partial<Record<PetCharacterId, string>> = {
  'menino-prata': PET_WALK_PILOT,
  'menino-preto': '/manus-storage/menino-preto-walk-pilot-v1.png',
};
export function petWalkAtlas(characterId: PetCharacterId | null | undefined) {
  return characterId ? PILOT_ATLASES[characterId] : undefined;
}
export function walkFrame(distance: number) { return Math.floor(Math.max(0, distance) * 4) % 4; }
export function drawWalkFrame(ctx: CanvasRenderingContext2D, image: HTMLImageElement, row: number, phase: number, x: number, y: number, width: number, height: number) {
  const source = cleanWalkAtlas(image);
  const cellWidth = ("naturalWidth" in source ? source.naturalWidth : source.width) / 4, cellHeight = ("naturalHeight" in source ? source.naturalHeight : source.height) / 4;
  ctx.drawImage(source, walkFrame(phase) * cellWidth, row * cellHeight, cellWidth, cellHeight, x, y, width, height);
}
