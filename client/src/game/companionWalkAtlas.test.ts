import { describe, expect, it } from 'vitest';
import { advanceCompanionGait, companionWalkAtlas, type CompanionGait } from './companionWalkAtlas';
import { walkFrame } from './petWalkAtlas';

describe('Sol walking tied to actual displacement', () => {
  const idle: CompanionGait = { phase: 0, direction: { row: 1, mirror: false }, moving: false };
  it('alternates four frames over a travelled stride and stops at rest', () => {
    let gait = idle;
    const frames: number[] = [];
    for (let i = 0; i < 4; i++) {
      gait = advanceCompanionGait(gait, { x: 0, y: 0 }, { x: 0.18, y: 0 });
      frames.push(walkFrame(gait.phase));
    }
    expect(frames).toEqual([1, 2, 3, 0]);
    expect(advanceCompanionGait(gait, { x: 1, y: 0 }, { x: 1, y: 0 })).toMatchObject({ phase: 0, moving: false });
  });
  it('uses the travelled direction including detours, rather than the original destination', () => {
    expect(advanceCompanionGait(idle, { x: 0, y: 0 }, { x: -0.1, y: 0 }).direction).toEqual({ row: 0, mirror: true });
    expect(advanceCompanionGait(idle, { x: 0, y: 0 }, { x: 0, y: 0.1 }).direction.row).toBe(2);
    expect(advanceCompanionGait(idle, { x: 0, y: 0 }, { x: 0, y: -0.1 }).direction.row).toBe(1);
  });
  it('keeps rollout limited to the house-four identity', () => {
    expect(companionWalkAtlas('sol')).toContain('sol-walk');
    expect(companionWalkAtlas('mimi')).toBeUndefined();
    expect(companionWalkAtlas('tico')).toBeUndefined();
    expect(companionWalkAtlas(null)).toBeUndefined();
  });
});
