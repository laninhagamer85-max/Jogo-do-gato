import {it,expect} from 'vitest';
import {castleView} from './explorationCastleView';
import {CASTLE_SIZE} from './explorationCastle';
it('covers phone viewports at every zoom without stretching and follows the player',()=>{
 for(const [w,h] of [[390,844],[844,390],[375,667]])for(const zoom of [.65,.9,1.15,1.4])for(const player of [{x:1,y:1},{x:8,y:8},{x:15,y:15}]){
  const v=castleView(w,h,player,zoom);expect(v.left).toBeLessThanOrEqual(0);expect(v.top).toBeLessThanOrEqual(0);expect(v.left+CASTLE_SIZE*v.tile).toBeGreaterThanOrEqual(w);expect(v.top+CASTLE_SIZE*v.tile).toBeGreaterThanOrEqual(h);
  expect(v.left+player.x*v.tile).toBeGreaterThan(0);expect(v.left+player.x*v.tile).toBeLessThan(w);expect(v.top+player.y*v.tile).toBeGreaterThan(0);expect(v.top+player.y*v.tile).toBeLessThan(h);
 }
 const a=castleView(390,844,{x:7,y:7},1.15),b=castleView(390,844,{x:8,y:8},1.15);expect(a.left).not.toBe(b.left);expect(a.top).not.toBe(b.top);
});
