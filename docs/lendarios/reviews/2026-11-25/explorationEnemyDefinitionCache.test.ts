import {expect,it} from 'vitest';
import {createCombatState,stepCombatFrame,pilotWalkable} from './explorationCombat';
import {campaignEnemies,campaignRoom,type CampaignEnemy} from './explorationCampaign';
import {villageSafeAt} from './explorationVillageLayout';
import {WINTER_ENEMIES} from './explorationWinterTrial';
import {ensureWilderness,settlementWildlife,masterTemplate,wildernessDefinitions,worldEnemyDefinitions,worldEnemyIndex} from './explorationWilderness';
import type {CombatState} from './explorationCombat';
// Output oracle: published 1.0.145 algorithm, deliberately uncached.
function publishedWildernessDefinitions(s:CombatState):CampaignEnemy[]{if(s.roomIndex>=30||!s.village?.wilderness)return [];const out=[...settlementWildlife(s.roomIndex,s.encounterSeed)],chapter=Math.min(3,Math.floor(s.roomIndex/10)),master=s.village?.wilderness?.masters[chapter];if(master?.room===s.roomIndex&&!master.nextAt){const d=masterTemplate(chapter);out.push({...d,x:master.homeX,y:master.homeY});const escorts=settlementWildlife(s.roomIndex,s.encounterSeed).slice(0,3);for(let i=0;i<escorts.length;i++){const q={x:master.homeX+(i-1)*1.7,y:master.homeY+2},base=escorts[i];if(pilotWalkable(q,true,.3,s.roomIndex)&&!villageSafeAt(s.roomIndex,q))out.push({...base,...q,id:`master-escort:${chapter}:${i}`,hp:Math.ceil(base.hp*1.5),leash:30});}}return out;}
it('matches published definitions across all 40 temperate rooms and separate encounter seeds',()=>{
 for(let room=0;room<40;room++)for(const seed of [42,917]){
  const s=ensureWilderness(createCombatState(room,seed),1000);
  expect(wildernessDefinitions(s)).toEqual(publishedWildernessDefinitions(s));
  expect(worldEnemyDefinitions(s)).toEqual([...campaignEnemies(room,s.encounterSeed),...publishedWildernessDefinitions(s)]);
 }
 const winter=createCombatState(40);winter.winterTrial=true;
 expect(worldEnemyDefinitions(winter)).toBe(WINTER_ENEMIES);
});
it('reuses definitions and index across walking, damage and master movement without sharing live HP',()=>{
 let s=ensureWilderness(createCombatState(0,42),1000);
 const master=s.village!.wilderness!.masters[0];master.room=s.roomIndex;
 const a=worldEnemyDefinitions(s),index=worldEnemyIndex(a),before=JSON.stringify(a);
 master.hp=1;master.x+=2;master.y+=1;master.generation++;
 expect(worldEnemyDefinitions(s)).toBe(a);
 for(let i=0;i<90;i++){
  s=stepCombatFrame(s,{dx:i<45?1:-1,dy:0,attack:i%15===0},1000/30);
  const definitions=worldEnemyDefinitions(s);
  expect(definitions).toBe(a);expect(worldEnemyIndex(definitions)).toBe(index);
 }
 expect(JSON.stringify(a)).toBe(before);
 for(const definition of a)expect(index.get(definition.id)).toBe(definition);
});
it('invalidates when master home, availability, encounter or room geometry changes',()=>{
 const s=ensureWilderness(createCombatState(0,771),1000),master=s.village!.wilderness!.masters[0];
 s.roomIndex=master.room;
 let previous=worldEnemyDefinitions(s);
 for(const change of [()=>{master.homeX+=3;},()=>{master.homeY+=2;},()=>{master.nextAt=10000;},()=>{master.nextAt=0;},()=>{s.encounterSeed++;}]){
  change();const next=worldEnemyDefinitions(s);expect(next).not.toBe(previous);
  expect(next).toEqual([...campaignEnemies(s.roomIndex,s.encounterSeed),...publishedWildernessDefinitions(s)]);previous=next;
 }
 const room=campaignRoom(s.roomIndex),original=room.composition;
 try{room.composition={id:'cache-test',regions:[...(original?.regions??[])]};expect(worldEnemyDefinitions(s)).not.toBe(previous);}
 finally{room.composition=original;}
});
it('does not reuse another profile or an evicted configuration',()=>{
 const first=ensureWilderness(createCombatState(0,112),1000),a=worldEnemyDefinitions(first);
 const other=ensureWilderness(createCombatState(1,113),1000);worldEnemyDefinitions(other);
 expect(worldEnemyDefinitions(first)).not.toBe(a);expect(worldEnemyDefinitions(first)).toEqual(a);
 const noVillage={...first,village:undefined};
 expect(worldEnemyDefinitions(noVillage)).toBe(campaignEnemies(first.roomIndex,first.encounterSeed));
 expect(worldEnemyDefinitions(first)).toEqual(a);
});
