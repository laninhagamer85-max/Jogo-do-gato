export type GroundPoint = { x: number; y: number };
export type RoamBounds = { left: number; right: number; bottom: number; top: number };
export type CompanionRoam = { point: GroundPoint; target: GroundPoint | null; pauseMs: number };

/** Follow on the floor with bounded speed, independently of display refresh rate. */
export function followCompanionGround(current: GroundPoint, target: GroundPoint, elapsedMs: number): GroundPoint {
  const dx = target.x - current.x, dy = target.y - current.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return current;
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(40, elapsedMs)) : 0;
  const step = Math.min(distance, elapsed * 0.00265);
  if (step === distance) return { ...target };
  return { x: current.x + dx / distance * step, y: current.y + dy / distance * step };
}

/** Random destinations are selected only after resting, not once per render frame. */
export function roamCompanion(state: CompanionRoam, bounds: RoamBounds, elapsedMs: number, sleeping: boolean, random = Math.random): CompanionRoam {
  if (sleeping) return state;
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(40, elapsedMs)) : 0;
  if (state.pauseMs > 0) return { ...state, pauseMs: Math.max(0, state.pauseMs - elapsed) };
  if (!state.target) {
    return { ...state, target: {
      x: bounds.left + random() * (bounds.right - bounds.left),
      y: bounds.bottom + random() * (bounds.top - bounds.bottom),
    } };
  }
  const point = followCompanionGround(state.point, state.target, elapsed);
  if (point.x === state.target.x && point.y === state.target.y) return { point, target: null, pauseMs: 2000 + random() * 3000 };
  return { ...state, point };
}
