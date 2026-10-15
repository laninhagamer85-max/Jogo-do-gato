import { describe, expect, it } from 'vitest';
import { nextCompanionWaypoint, segmentClearsPet } from './companionNavigation';
import { followCompanionGround } from './companionMotion';

describe('companion separation around the main pet', () => {
  const bounds = { left: -3, right: 3, bottom: -3, top: 2 };
  const pet = { x: 0, y: 0, radius: 0.8 };
  it('takes a route around the pet instead of crossing its footprint', () => {
    let point = { x: -2, y: 0 };
    const target = { x: 2, y: 0 };
    let detoured = false;
    for (let i = 0; i < 3000 && Math.hypot(point.x - target.x, point.y - target.y) > 0.001; i++) {
      const waypoint = nextCompanionWaypoint(point, target, bounds, pet);
      expect(waypoint).not.toBeNull();
      const next = followCompanionGround(point, waypoint!, 16);
      expect(segmentClearsPet(point, next, pet)).toBe(true);
      detoured ||= Math.abs(next.y) > 0.5;
      point = next;
    }
    expect(detoured).toBe(true);
    expect(point.x).toBeCloseTo(target.x, 3);
    expect(point.y).toBeCloseTo(target.y, 3);
  });
  it('stops if a narrow corridor cannot accommodate a detour', () => {
    expect(nextCompanionWaypoint({ x: -2, y: 0 }, { x: 2, y: 0 }, { ...bounds, bottom: -0.3, top: 0.3 }, pet)).toBeNull();
  });
  it('keeps a clear direct path and rejects destinations inside the pet', () => {
    const target = { x: 2, y: -2 };
    expect(nextCompanionWaypoint({ x: -2, y: -2 }, target, bounds, pet)).toEqual(target);
    expect(nextCompanionWaypoint({ x: -2, y: 0 }, { x: 0, y: 0 }, bounds, pet)).toBeNull();
  });
  it('steps outward gradually when the user moves the pet onto the friend', () => {
    const from = { x: 0.1, y: 0 };
    const waypoint = nextCompanionWaypoint(from, { x: 2, y: 0 }, bounds, pet)!;
    const next = followCompanionGround(from, waypoint, 16);
    expect(Math.hypot(next.x, next.y)).toBeGreaterThan(Math.hypot(from.x, from.y));
    expect(Math.hypot(next.x - from.x, next.y - from.y)).toBeLessThan(0.02);
  });
});
