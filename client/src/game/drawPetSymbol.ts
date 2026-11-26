import { getPetSymbol } from "./petIconAtlas";

let atlas: HTMLImageElement | undefined;
/** Published atlas rendering, restored to editable source. Does not affect hitboxes. */
export function drawPetSymbol(ctx: CanvasRenderingContext2D, symbol: string, x: number, y: number, size: number) {
  if (!atlas) { atlas = new Image(); atlas.src = "/ui/pet-icons-atlas-v1.png"; }
  if (!atlas.complete || !atlas.naturalWidth) return;
  const icon = getPetSymbol(symbol);
  const scale = Math.min(size / icon.width, size / icon.height);
  ctx.save();
  ctx.translate(x - icon.width * scale / 2 - icon.x * scale, y - icon.height * scale / 2 - icon.y * scale);
  ctx.scale(scale, scale);
  ctx.clip(new Path2D(icon.clip));
  ctx.drawImage(atlas, icon.x, icon.y, icon.width, icon.height, icon.x, icon.y, icon.width, icon.height);
  ctx.restore();
}
