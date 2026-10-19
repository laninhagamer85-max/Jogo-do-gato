import { describe, expect, it, vi } from 'vitest';
import { EXPLORATION_WORLD } from './explorationWorld';
import { MINIMAP_WIDTH, MINIMAP_HEIGHT, MINIMAP_REVEAL_RADIUS, revealMinimap } from './explorationMinimap';

/** Original exhaustive algorithm is the output oracle, not a browser/playtest. */
function exhaustive(previous: readonly number[], player: {x:number;y:number}) {
  const visible = new Set(previous);
  for(let y=0;y<MINIMAP_HEIGHT;y++)for(let x=0;x<MINIMAP_WIDTH;x++)
    if(Math.hypot(x+EXPLORATION_WORLD.left+.5-player.x,y+EXPLORATION_WORLD.top+.5-player.y)<=MINIMAP_REVEAL_RADIUS)visible.add(y*MINIMAP_WIDTH+x);
  return visible.size===previous.length?previous:[...visible].sort((a,b)=>a-b);
}

describe('bounded minimap discovery is equivalent to the published scan', () => {
  it('matches the original scan at every cell center and fractional offset', () => {
    const previous=Object.freeze([0,4,140,300,719]);
    for(let y=0;y<MINIMAP_HEIGHT;y++)for(let x=0;x<MINIMAP_WIDTH;x++)for(const offset of [0,.37]){
      const p={x:EXPLORATION_WORLD.left+x+.5+offset,y:EXPLORATION_WORLD.top+y+.5-offset};
      expect(revealMinimap(previous,p)).toEqual(exhaustive(previous,p));
    }
    expect(previous).toEqual([0,4,140,300,719]);
  });
  it('retains the inclusive radius boundary and its floating point neighbours', () => {
    for(const dx of [-MINIMAP_REVEAL_RADIUS,0,MINIMAP_REVEAL_RADIUS])
      for(const dy of [-MINIMAP_REVEAL_RADIUS,0,MINIMAP_REVEAL_RADIUS])
        for(const epsilon of [-1e-12,0,1e-12]){
          const p={x:1.5+dx+epsilon,y:1.5+dy+epsilon};
          expect(revealMinimap([],p)).toEqual(exhaustive([],p));
        }
  });
  it('handles outer positions and invalid coordinates just like the original', () => {
    for(const x of [-100,-8.1,22.1,100,NaN,Infinity,-Infinity])
      for(const y of [-100,-7.1,17.1,100,NaN,Infinity,-Infinity]){
        const previous=[0,19,719];
        expect(revealMinimap(previous,{x,y})).toEqual(exhaustive(previous,{x,y}));
      }
  });
  it('keeps earlier discoveries and returns the same array when nothing new is revealed', () => {
    const p={x:1.5,y:1.5},first=revealMinimap([],p);
    expect(revealMinimap(first,p)).toBe(first);
    const all=Object.freeze(Array.from({length:MINIMAP_WIDTH*MINIMAP_HEIGHT},(_,i)=>i));
    expect(revealMinimap(all,{x:7,y:5})).toBe(all);
  });
  it('checks at most 49 distances instead of all 720 in one discovery call', () => {
    const distance=vi.spyOn(Math,'hypot');
    try {
      revealMinimap([],{x:7.37,y:5.12});
      expect(distance.mock.calls.length).toBeGreaterThan(0);
      expect(distance.mock.calls.length).toBeLessThanOrEqual(49);
      expect(MINIMAP_WIDTH*MINIMAP_HEIGHT).toBe(720);
    } finally { distance.mockRestore(); }
  });
});
