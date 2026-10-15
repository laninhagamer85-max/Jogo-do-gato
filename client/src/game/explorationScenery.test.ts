import {describe,it,expect} from 'vitest';
import { groundVariations,GROUND_WORLD } from './explorationScenery';
import {combatView} from './explorationCombatView';
describe('non repeating woodland ground',()=>{
  it('preserves the same regional appearance after reload',()=>{expect(groundVariations(123)).toEqual(groundVariations(123));});
  it('allows distinct regional layouts without changing the combat map',()=>{expect(groundVariations(123)).not.toEqual(groundVariations(456));expect(new Set(groundVariations(123).map(v=>`${v.x}:${v.y}`)).size).toBe(18);});
  it.each([[375,667],[375,812],[390,844],[844,390],[1366,768]])('covers %i × %i in follow and overview modes without repeating the plane',(w,h)=>{
    for(const overview of [false,true])for(const p of [{x:1.5,y:1.5},{x:12.4,y:8.5}]){
      const v=combatView(w,h,p,1,overview);expect(v.left+GROUND_WORLD.left*v.tile).toBeLessThanOrEqual(0);expect(v.top+GROUND_WORLD.top*v.tile).toBeLessThanOrEqual(0);expect(v.left+(GROUND_WORLD.left+GROUND_WORLD.width)*v.tile).toBeGreaterThanOrEqual(w);expect(v.top+(GROUND_WORLD.top+GROUND_WORLD.height)*v.tile).toBeGreaterThanOrEqual(h);
    }
  });
});
