import {expect,it} from 'vitest';
import {createCombatState,pilotWalkable} from './explorationCombat';
import {WORLD_VILLAGERS,villageDoor,villageSettlements} from './explorationVillageLayout';
import {tickVillage} from './explorationVillage';
it('gives every citizen a distinct stable name and varied trainer clothing',()=>{
 expect(new Set(WORLD_VILLAGERS.map(d=>d.name)).size).toBe(WORLD_VILLAGERS.length);
 for(const room of [0,10,23,31])expect(new Set(WORLD_VILLAGERS.filter(d=>d.room===room&&d.warrior).map(d=>d.clothing)).size).toBeGreaterThan(1);
});
it('trainers in the reported autumn city walk and resume their routine',()=>{
 let s=createCombatState(23,42);s.village!.growth=Object.fromEntries(villageSettlements(23).map(t=>[t.id,24]));
 const d=WORLD_VILLAGERS.find(d=>d.room===23&&d.warrior&&d.birthStage===2)!;
 const door=villageDoor(d.home,23);s.player={...door};s=tickVillage(s,0,1000);
 const c=s.village!.people[d.id];Object.assign(c,door,{task:'visit',timer:0});
 let moved=false,cycle=false;
 for(let t=0;t<60000;t+=50){s=tickVillage(s,50,1000+t);const n=s.village!.people[d.id];moved ||=Math.hypot(n.x-door.x,n.y-door.y)>.8;cycle ||=n.cycle>0;expect(pilotWalkable(n,true,.2,23)).toBe(true);}
 expect(moved).toBe(true);expect(cycle).toBe(true);
});
