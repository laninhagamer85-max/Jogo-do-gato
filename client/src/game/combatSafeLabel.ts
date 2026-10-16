type Point = { x: number; y: number };

/** Screen-space placement only: never changes the safe zone or saved positions. */
export function combatSafeLabel(width: number, height: number, tile: number, camp: Point, pet: Point, textWidth: number) {
  const w = textWidth + 12, h = 20;
  const box = { x: camp.x - w / 2, y: camp.y - tile * 1.08 - h, width: w, height: h };
  // Do not pin a world label to the screen edge when its landmark leaves the view.
  if (box.x < 8 || box.y < 8 || box.x + w > width - 8 || box.y + h > height - 8) return null;
  // Includes walking/attack lean and a small clearance around the head and feet.
  const body = { left: pet.x - tile * .62, right: pet.x + tile * .62,
    top: pet.y - tile * 1.02, bottom: pet.y + tile * .24 };
  if (box.x < body.right && box.x + w > body.left && box.y < body.bottom && box.y + h > body.top) return null;
  return box;
}
