import { describe, it, expect } from 'vitest';
import { walkFrame, petWalkAtlas } from './petWalkAtlas';
describe('walk atlas frame selection', () => {
  it('cycles four contact poses by distance and freezes without travel', () => {
    expect([0,.25,.5,.75,1].map(walkFrame)).toEqual([0,1,2,3,0]);
    expect(walkFrame(.5)).toBe(walkFrame(.5));
    expect(walkFrame(-2)).toBe(0);
  });
});

describe('variant-specific art selection', () => {
  it('loads the black kitten art without replacing it with the silver variant', () => {
    expect(petWalkAtlas('menino-preto')).toContain('menino-preto-walk');
    expect(petWalkAtlas('menino-preto')).not.toBe(petWalkAtlas('menino-prata'));
    expect(petWalkAtlas('menina-calico')).toContain('menina-calico-walk');
    expect(petWalkAtlas(null)).toBeUndefined();
  });
});
