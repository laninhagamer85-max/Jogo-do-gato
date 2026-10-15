import type { CompanionId } from './PetGame';
import type { GroundPoint } from './companionMotion';
import { homeWalkDirection } from './petFrameCleanup';

export type CompanionGait = { phase: number; direction: { row: number; mirror: boolean }; moving: boolean };
export function advanceCompanionGait(gait: CompanionGait, previous: GroundPoint, current: GroundPoint): CompanionGait {
  const dx = current.x - previous.x, dy = current.y - previous.y;
  const travel = Math.hypot(dx, dy);
  if (travel <= 0.00001) return { ...gait, phase: 0, moving: false };
  return { phase: (gait.phase + travel / 0.72) % 1, direction: homeWalkDirection(dx, dy), moving: true };
}

/** Roll out one house at a time; do not borrow another friend's identity. */
export function companionWalkAtlas(id: CompanionId | null) {
  return id === 'sol' ? '/manus-storage/sol-walk-v1.png' : undefined;
}
