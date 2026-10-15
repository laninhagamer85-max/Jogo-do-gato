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

/** Each friend has its own directional artwork; filenames are stable across releases. */
export const COMPANION_WALK_FILES = {
  mimi: 'mimi-walk-v1.png',
  tico: 'tico-walk-v1.png',
  mimo: 'mimo-walk-v1.png',
  florita: 'florita-walk-v1.png',
  bigodito: 'bigodito-walk-v1.png',
  sol: 'sol-walk-v1.png',
  conchinha: 'conchinha-walk-v1.png',
  pingo: 'pingo-walk-v1.png',
  nevinha: 'nevinha-walk-v1.png',
  letrinha: 'letrinha-walk-v1.png',
  estrelinha: 'estrelinha-walk-v1.png',
  festeiro: 'festeiro-walk-v1.png',
} satisfies Record<CompanionId, string>;

export function companionWalkAtlas(id: CompanionId | null) {
  return id ? `/manus-storage/${COMPANION_WALK_FILES[id]}` : undefined;
}

/** Keep the original portrait still until its own walking texture is ready. */
export function companionWaitingForWalkArt(id: CompanionId | null, ready: boolean) {
  return Boolean(companionWalkAtlas(id)) && !ready;
}
