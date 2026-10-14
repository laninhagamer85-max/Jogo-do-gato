import { describe, it, expect } from 'vitest';
import { walkFrame } from './petWalkAtlas';
describe('walk atlas frame selection', () => {
  it('cycles four contact poses by distance and freezes without travel', () => {
    expect([0,.25,.5,.75,1].map(walkFrame)).toEqual([0,1,2,3,0]);
    expect(walkFrame(.5)).toBe(walkFrame(.5));
    expect(walkFrame(-2)).toBe(0);
  });
});
