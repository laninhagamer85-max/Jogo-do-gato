import type { PlatformSurface } from './platformerLevels';

/** Pilot only: expand to other stages only after a real stage-1 playtest. */
export const usesPilotTerrain = (stageId: number) => stageId === 1;

export function soilTiles(surface: PlatformSurface, cameraX: number, viewportWidth: number) {
  const width = 260;
  const height = width * 520 / 1024;
  const top = surface.y + Math.min(38, surface.height) - 2;
  const left = Math.max(surface.x, cameraX);
  const right = Math.min(surface.x + surface.width, cameraX + viewportWidth);
  const tiles: { x: number; y: number; width: number; height: number }[] = [];
  if (surface.height <= 38 || right <= left) return tiles;
  for (let x = Math.floor(left / width) * width; x < right; x += width) {
    for (let y = top; y < surface.y + surface.height; y += height) {
      tiles.push({ x: x - cameraX, y, width, height });
    }
  }
  return tiles;
}

/** Caller clips to the existing platform; the collision silhouette stays unchanged. */
export function drawPilotTerrain(
  ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  surface: PlatformSurface, cameraX: number, viewportWidth: number,
) {
  const left = Math.max(surface.x, cameraX);
  const right = Math.min(surface.x + surface.width, cameraX + viewportWidth);
  for (let x = Math.floor(left / 260) * 260; x < right; x += 260) {
    ctx.drawImage(image, 0, 0, 1024, 190, x - cameraX, surface.y, 260, Math.min(38, surface.height));
  }
  for (const tile of soilTiles(surface, cameraX, viewportWidth)) {
    ctx.drawImage(image, 0, 165, 1024, 520, tile.x, tile.y, tile.width, tile.height);
  }
}

export function drawPilotDepth(ctx: CanvasRenderingContext2D, surface: PlatformSurface, cameraX: number) {
  const x = surface.x - cameraX;
  const y = surface.y + Math.min(17, surface.height);
  const height = surface.height - (y - surface.y);
  if (height <= 0) return;
  const lip = ctx.createLinearGradient(0, y, 0, y + Math.min(12, height));
  lip.addColorStop(0, 'rgba(35, 27, 17, 0.28)');
  lip.addColorStop(1, 'rgba(35, 27, 17, 0)');
  ctx.fillStyle = lip;
  ctx.fillRect(x, y, surface.width, Math.min(12, height));
  const edge = Math.min(9, surface.width / 2);
  const side = ctx.createLinearGradient(x + surface.width - edge, 0, x + surface.width, 0);
  side.addColorStop(0, 'rgba(35, 27, 17, 0)');
  side.addColorStop(1, 'rgba(35, 27, 17, 0.24)');
  ctx.fillStyle = side;
  ctx.fillRect(x + surface.width - edge, y, edge, height);
}
