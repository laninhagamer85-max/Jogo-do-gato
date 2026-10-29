import {it,expect} from 'vitest';
import {WORLD_VILLAGERS,CHAPTER_VILLAGERS,chapterVillagerIdentity,activeVillageDefinitions,villagerAppearance,villageLayout,villageSettlements,villagerDefinition} from './explorationVillageLayout';
it('retains placement IDs while every chapter reuses its named visual identities',()=>{
 expect(WORLD_VILLAGERS).toHaveLength(4005);
 expect(CHAPTER_VILLAGERS.size).toBe(53);
 for(const d of WORLD_VILLAGERS){expect(villagerDefinition(d.id)).toBe(d);expect(d.name).toBe(chapterVillagerIdentity(d).name);expect(Math.floor(d.room/10)).toBe(Math.floor(chapterVillagerIdentity(d).room/10));}
 expect(villagerDefinition('tomas').name).toBe('Tomás');
 expect(villagerDefinition('celina-alquimista').name).toBe('Celina');
});
it('distributes a unique cast across eligible village homes with mixed growth',()=>{
 for(let room=0;room<40;room++)for(const level of [0,8,24]){
  const v={growth:Object.fromEntries(villageSettlements(room).map(t=>[t.id,t.slot%2===0?level:24]))};
  const cast=activeVillageDefinitions(v,room);
  expect(new Set(cast.map(villagerAppearance)).size).toBe(cast.length);
  expect(new Set(cast.map(d=>d.name)).size).toBe(cast.length);
  for(const d of cast){const h=villageLayout(room).homes[d.home];expect(h).toBeDefined();expect(h.settlement).toBe(d.settlement);}
  if(level===24)expect(new Set(cast.map(d=>d.settlement)).size).toBeGreaterThanOrEqual(5);
 }
});
