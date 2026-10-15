export type GroundPoint = { x: number; y: number };
export type RoamBounds = { left: number; right: number; bottom: number; top: number };
export type CompanionRoam = { point: GroundPoint; target: GroundPoint | null; pauseMs: number };

/** Follow on the floor with bounded speed, independently of display refresh rate. */
export function followCompanionGround(current: GroundPoint, target: GroundPoint, elapsedMs: number): GroundPoint {
  const dx = target.x - current.x, dy = target.y - current.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return current;
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(40, elapsedMs)) : 0;
  const step = Math.min(distance, elapsed * 0.0008);
  if (step === distance) return { ...target };
  return { x: current.x + dx / distance * step, y: current.y + dy / distance * step };
}

/** Random destinations are selected only after resting, not once per render frame. */
export function roamCompanion(state: CompanionRoam, bounds: RoamBounds, elapsedMs: number, sleeping: boolean, random = Math.random, pet?: PetFootprint): CompanionRoam {
  if (sleeping) return state;
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(40, elapsedMs)) : 0;
  const displacedByPet = pet && Math.hypot(state.point.x - pet.x, state.point.y - pet.y) < pet.radius;
  if (state.pauseMs > 0 && !displacedByPet) return { ...state, pauseMs: Math.max(0, state.pauseMs - elapsed) };
  if (!state.target) {
    const local = {
      left: Math.max(bounds.left, state.point.x - 1.1), right: Math.min(bounds.right, state.point.x + 1.1),
      bottom: Math.max(bounds.bottom, state.point.y - 0.8), top: Math.min(bounds.top, state.point.y + 0.8),
    };
    const target = { x: local.left + random() * (local.right - local.left), y: local.bottom + random() * (local.top - local.bottom) };
    return { ...state, pauseMs: 0, target };
  }
  const waypoint = pet ? nextCompanionWaypoint(state.point, state.target, bounds, pet) : state.target;
  if (!waypoint) return { ...state, target: null, pauseMs: 1200 };
  const point = followCompanionGround(state.point, waypoint, elapsed);
  if (point.x === state.target.x && point.y === state.target.y) return { point, target: null, pauseMs: 4000 + random() * 4000 };
  return { ...state, point };
}
import { nextCompanionWaypoint, type PetFootprint } from './companionNavigation';
