import { describe, expect, it } from 'vitest';
import { advanceCompanionGait, companionWalkAtlas, companionWaitingForWalkArt, type CompanionGait } from './companionWalkAtlas';
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
  it('gives each enabled friend its own atlas and leaves others untouched', () => {
    expect(companionWalkAtlas('sol')).toContain('sol-walk');
    expect(companionWalkAtlas('mimo')).toContain('mimo-walk');
    expect(companionWalkAtlas('mimo')).not.toBe(companionWalkAtlas('sol'));
    expect(companionWalkAtlas('mimi')).toBeUndefined();
    expect(companionWalkAtlas('tico')).toBeUndefined();
    expect(companionWalkAtlas(null)).toBeUndefined();
  });
  it('returns to rest and keeps the last facing after a pause', () => {
    const moving = advanceCompanionGait(idle, { x: 1, y: 0 }, { x: 0.8, y: 0 });
    const stopped = advanceCompanionGait(moving, { x: 0.8, y: 0 }, { x: 0.8, y: 0 });
    expect(stopped).toEqual({ phase: 0, moving: false, direction: moving.direction });
  });
  it('prevents sliding on a slow or failed texture load, without freezing unconverted friends', () => {
    for (const id of ['mimo', 'sol'] as const) {
      expect(companionWaitingForWalkArt(id, false)).toBe(true);
      expect(companionWaitingForWalkArt(id, true)).toBe(false);
    }
    expect(companionWaitingForWalkArt('tico', false)).toBe(false);
    expect(companionWaitingForWalkArt(null, false)).toBe(false);
  });
  it('faces the planned first leg while keeping paws and position still during anticipation', () => {
    const point = { x: 1, y: -1 };
    const gait = advanceCompanionGait({ ...idle, phase: 0.5 }, point, point, { x: 0, y: -1 });
    expect(gait).toEqual({ phase: 0, moving: false, direction: { row: 0, mirror: true } });
    expect(point).toEqual({ x: 1, y: -1 });
  });
});
