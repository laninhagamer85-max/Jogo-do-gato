/** Original silver kitten pilot atlas: 4 columns, four directional rows. */
export const PET_WALK_PILOT = '/manus-storage/menino-prata-walk-pilot-v1.png';
export function walkFrame(distance: number) { return Math.floor(Math.max(0, distance) * 4) % 4; }
export function drawWalkFrame(ctx: CanvasRenderingContext2D, image: HTMLImageElement, row: number, phase: number, x: number, y: number, width: number, height: number) {
  const cellWidth = image.naturalWidth / 4, cellHeight = image.naturalHeight / 4;
  ctx.drawImage(image, walkFrame(phase) * cellWidth, row * cellHeight, cellWidth, cellHeight, x, y, width, height);
}
