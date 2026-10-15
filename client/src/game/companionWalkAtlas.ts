import type { CompanionId } from './PetGame';
import type { GroundPoint } from './companionMotion';
import { homeWalkDirection } from './petFrameCleanup';

export type CompanionGait = { phase: number; direction: { row: number; mirror: boolean }; moving: boolean };
export function advanceCompanionGait(gait: CompanionGait, previous: GroundPoint, current: GroundPoint, lookAt?: GroundPoint): CompanionGait {
  const dx = current.x - previous.x, dy = current.y - previous.y;
  const travel = Math.hypot(dx, dy);
  if (travel <= 0.00001) {
    const direction = lookAt && Math.hypot(lookAt.x - current.x, lookAt.y - current.y) > 0.00001
      ? homeWalkDirection(lookAt.x - current.x, lookAt.y - current.y) : gait.direction;
    return { phase: 0, direction, moving: false };
  }
  return { phase: (gait.phase + travel / 0.72) % 1, direction: homeWalkDirection(dx, dy), moving: true };
}

/** Roll out one house at a time; each friend keeps its own artwork. */
export function companionWalkAtlas(id: CompanionId | null) {
  if (id === 'sol') return '/manus-storage/sol-walk-v1.png';
  if (id === 'mimo') return '/manus-storage/mimo-walk-v1.png';
  return undefined;
}

/** Keep the original portrait still until its own walking texture is ready. */
export function companionWaitingForWalkArt(id: CompanionId | null, ready: boolean) {
  return Boolean(companionWalkAtlas(id)) && !ready;
}
