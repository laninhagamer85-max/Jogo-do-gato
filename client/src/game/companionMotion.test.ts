import { describe, expect, it } from 'vitest';
import { followCompanionGround, roamCompanion, type CompanionRoam } from './companionMotion';

describe('grounded companion following', () => {
  it('stays still without a destination change, without idle bobbing', () => {
    let point = { x: 2, y: -1 };
    for (let frame = 0; frame < 1000; frame++) point = followCompanionGround(point, { x: 2, y: -1 }, 16);
    expect(point).toEqual({ x: 2, y: -1 });
  });
  it('covers the same distance at 30, 60 and 120 fps', () => {
    const results = [30, 60, 120].map(fps => {
      let point = { x: 0, y: 0 };
      for (let frame = 0; frame < fps; frame++) point = followCompanionGround(point, { x: 10, y: 0 }, 1000 / fps);
      return point.x;
    });
    results.forEach(x => expect(x).toBeCloseTo(0.8, 8));
  });
  it('converges exactly without overshooting or oscillating after arrival', () => {
    const target = { x: -0.1, y: 0.1 };
    let point = { x: 0, y: 0 };
    for (let frame = 0; frame < 100; frame++) point = followCompanionGround(point, target, 16);
    expect(point).toEqual(target);
  });
  it('does not jump after a hidden tab or move on an invalid time step', () => {
    const start = { x: 0, y: 0 }, target = { x: 3, y: 4 };
    const next = followCompanionGround(start, target, 10000);
    expect(Math.hypot(next.x, next.y)).toBeCloseTo(0.032);
    for (const delta of [-20, NaN, Infinity, 0]) expect(followCompanionGround(start, target, delta)).toEqual(start);
  });
});

describe('independent room roaming', () => {
  const bounds = { left: -2, right: 2, bottom: -3, top: 0 };
  it('rests first, then chooses a bounded destination without needing pet movement', () => {
    const initial: CompanionRoam = { point: { x: 0, y: -1 }, target: null, pauseMs: 20 };
    const resting = roamCompanion(initial, bounds, 20, false, () => 0.75);
    expect(resting.point).toEqual(initial.point);
    const chosen = roamCompanion(resting, bounds, 16, false, () => 0.75);
    expect(chosen.target?.x).toBeCloseTo(0.55);
    expect(chosen.target?.y).toBeCloseTo(-0.6);
    expect(roamCompanion(chosen, bounds, 16, false).point.x).toBeGreaterThan(0);
  });
  it('arrives, rests for 4–8 seconds and does not pick a new target every frame', () => {
    let state: CompanionRoam = { point: { x: 0, y: -1 }, target: { x: 0.01, y: -1 }, pauseMs: 0 };
    state = roamCompanion(state, bounds, 16, false, () => 0.5);
    expect(state).toEqual({ point: { x: 0.01, y: -1 }, target: null, pauseMs: 6000 });
    const paused = roamCompanion(state, bounds, 16, false, () => { throw new Error('must not choose during rest'); });
    expect(paused.point).toEqual(state.point);
  });
  it('freezes both walking and resting while the pet sleeps', () => {
    const state: CompanionRoam = { point: { x: 0, y: -1 }, target: { x: 2, y: -2 }, pauseMs: 0 };
    expect(roamCompanion(state, bounds, 16, true)).toBe(state);
    const resting = { ...state, target: null, pauseMs: 100 };
    expect(roamCompanion(resting, bounds, 16, true)).toBe(resting);
  });
});
