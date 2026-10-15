import type { GroundPoint, RoamBounds } from './companionMotion';

export type PetFootprint = GroundPoint & { radius: number };
export function segmentClearsPet(a: GroundPoint, b: GroundPoint, pet: PetFootprint) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const length2 = dx * dx + dy * dy;
  const t = length2 ? Math.max(0, Math.min(1, ((pet.x - a.x) * dx + (pet.y - a.y) * dy) / length2)) : 0;
  return Math.hypot(a.x + t * dx - pet.x, a.y + t * dy - pet.y) >= pet.radius - 1e-7;
}
const inBounds = (p: GroundPoint, b: RoamBounds) => p.x >= b.left && p.x <= b.right && p.y >= b.bottom && p.y <= b.top;

/** A tiny visibility graph around the pet's footprint; never cut through its body. */
export function nextCompanionWaypoint(from: GroundPoint, to: GroundPoint, bounds: RoamBounds, pet: PetFootprint): GroundPoint | null {
  const ring: GroundPoint[] = [];
  const radius = pet.radius * 1.04 + 0.045; // Chords between ring points also clear the circle.
  for (let i = 0; i < 16; i++) {
    const angle = i * Math.PI / 8;
    const point = { x: pet.x + Math.cos(angle) * radius, y: pet.y + Math.sin(angle) * radius };
    if (inBounds(point, bounds)) ring.push(point);
  }
  // If the player walks into the companion, let it step gently out, without teleporting.
  if (Math.hypot(from.x - pet.x, from.y - pet.y) < pet.radius) {
    return ring.sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0] ?? null;
  }
  if (!inBounds(to, bounds) || Math.hypot(to.x - pet.x, to.y - pet.y) < pet.radius) return null;
  if (segmentClearsPet(from, to, pet)) return to;
  const nodes = [from, to, ...ring];
  const costs = nodes.map(() => Infinity), previous = nodes.map(() => -1), visited = new Set<number>();
  costs[0] = 0;
  for (let step = 0; step < nodes.length; step++) {
    let nearest = -1;
    for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (nearest < 0 || costs[i] < costs[nearest])) nearest = i;
    if (nearest < 0 || !Number.isFinite(costs[nearest])) break;
    if (nearest === 1) {
      let next = 1;
      while (previous[next] > 0) next = previous[next];
      return nodes[next];
    }
    visited.add(nearest);
    for (let i = 0; i < nodes.length; i++) {
      if (visited.has(i) || !segmentClearsPet(nodes[nearest], nodes[i], pet)) continue;
      const cost = costs[nearest] + Math.hypot(nodes[i].x - nodes[nearest].x, nodes[i].y - nodes[nearest].y);
      if (cost < costs[i]) { costs[i] = cost; previous[i] = nearest; }
    }
  }
  return null; // No free route: remain still instead of crossing the pet.
}
