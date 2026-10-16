import { describe, expect, it } from 'vitest';
import { combatSafeLabel } from './combatSafeLabel';
import { combatView } from './explorationCombatView';
import { PILOT_CAMP } from './explorationCombat';

describe('safe-point label geometry (not browser validation)', () => {
  it.each([[375,667],[375,812],[390,844],[844,390],[1366,768]])('clears the resting pet at %i × %i', (w,h) => {
    for (const zoom of [1, 1.4, 2]) {
      const v = combatView(w,h,PILOT_CAMP,zoom);
      const p = { x:v.left+PILOT_CAMP.x*v.tile, y:v.top+PILOT_CAMP.y*v.tile };
      const box = combatSafeLabel(w,h,v.tile,p,p,66);
      if (box) expect(box.y+box.height).toBeLessThan(p.y-v.tile*1.02);
      // High zoom may legitimately hide an offscreen label.
      if (zoom === 1) expect(box).not.toBeNull();
    }
  });
  it('hides the label when the walking pet occupies its position', () => {
    expect(combatSafeLabel(500,500,70,{x:250,y:250},{x:250,y:180},66)).toBeNull();
  });
  it('does not clamp an offscreen landmark into the view', () => {
    expect(combatSafeLabel(500,500,70,{x:10,y:200},{x:400,y:400},66)).toBeNull();
    expect(combatSafeLabel(500,500,70,{x:250,y:20},{x:400,y:400},66)).toBeNull();
  });
  it('accounts for the measured text width', () => {
    const box=combatSafeLabel(500,500,70,{x:250,y:250},{x:400,y:400},100)!;
    expect(box.width).toBe(112);expect(box.x+box.width/2).toBe(250);
  });
});
