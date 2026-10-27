import {describe,it,expect} from 'vitest';
import {EXPLORATION_ROOMS,campaignRoom,campaignEnemies} from './explorationCampaign';
import {nascentesElevations,plateauPoint} from './explorationNascentesLayout';
import {nascentesGeometry,nascentesHeight,returnPortal,portalDestination,castleGatePoint} from './explorationChapter4';
import {createCombatState,pilotRoute,pilotWalkable,stepCombat,tickCombatPortal,combatSnapshot,readCombatState} from './explorationCombat';
import {villageSettlements,villageLayout,roomVillagers,villageDoor} from './explorationVillageLayout';
import {worldEnemyDefinitions,ensureWilderness} from './explorationWilderness';
import {startExplorationTestRoom,saveVillageVisit} from './explorationSelection';
import {migrateChapter4Expansion} from './explorationChapter4Migration';

describe('ten authored Nascentes rooms for scenery review',()=>{
 it('has ten distinct rooms, two-way adjacent portals and a reserved Chapter 5 exit',()=>{
  expect(EXPLORATION_ROOMS).toHaveLength(40);
  const layouts=EXPLORATION_ROOMS.slice(30).map(r=>JSON.stringify([r.camp,r.exit,r.composition,nascentesElevations(r.index)]));
  expect(new Set(layouts).size).toBe(10);
  for(let i=30;i<39;i++){expect(portalDestination(i,'exit')).toBe(i+1);expect(portalDestination(i+1,'return')).toBe(i);}
  expect(portalDestination(39,'exit')).toBeUndefined();
  expect(campaignRoom(39).title).toBe('Encosta das Fontes');
 });
 for(let index=30;index<40;index++){
  it('room '+(index+1)+' has reachable portals, elevated villages and no placeholder hostiles',()=>{
   const s=createCombatState(index),room=campaignRoom(index);
   expect(s.gateOpen).toBe(true);
   for(const q of [room.exit,returnPortal(index),...room.nodes,...room.switches]){
    expect(pilotWalkable(q,true,.22,index),'blocked '+JSON.stringify(q)).toBe(true);
    expect(pilotRoute(room.camp,q,true,index).length,'unreachable '+JSON.stringify(q)).toBeGreaterThan(0);
   }
   for(const e of nascentesElevations(index)){
    const base=plateauPoint(.32,.845,e),top=plateauPoint(.34,.715,e);
    expect(nascentesHeight(top,index)).toBe(1);
    expect(pilotRoute(room.camp,top,true,index).length,'stair '+JSON.stringify(base)).toBeGreaterThan(0);
    if(e.villageSlot!==undefined){
     const town=villageSettlements(index)[e.villageSlot];
     expect(nascentesHeight(town,index)).toBe(1);
     for(const h of villageLayout(index).homes.filter(h=>h.settlement===e.villageSlot)){
      const door={x:h.x,y:h.y+.8};
      expect(nascentesHeight(door,index)).toBe(1);
      expect(pilotRoute(room.camp,door,true,index).length,'village door '+h.id).toBeGreaterThan(0);
     }
    }
   }
   expect(roomVillagers(index)).toHaveLength(100);
   expect(campaignEnemies(index)).toEqual([]);
   expect(worldEnemyDefinitions(ensureWilderness(s,1000))).toEqual([]);
   expect(nascentesGeometry(index)).toHaveLength(nascentesElevations(index).length);
  });
 }
 it('crosses review portals in both directions without stars or completion rewards',()=>{
  for(let index=30;index<39;index++){
   let s=createCombatState(index);s.xp=1942;s.bag.fibra=7;s.legends={unlocked:['soren'],active:'soren',weapons:[],weapon:'bow',signature:{tool:true,weapon:true}};
   s.player={...campaignRoom(index).exit};s=stepCombat(s,{},0);
   const saved=readCombatState(combatSnapshot(s));if(!saved.supported)throw Error();
   expect(saved.state.completedRooms).toEqual([]);expect(saved.state.claimedRooms).toEqual([]);
   for(let n=0;n<18;n++)s=tickCombatPortal(s,50);
   expect(s.roomIndex).toBe(index+1);expect(s.bag.fibra).toBe(7);expect(s.xp).toBe(1942);
   expect(s.roomStars).toEqual({});expect(s.legends?.active).toBe('soren');
   s.player=returnPortal(index+1);s.portalCooldownUntil=0;s=stepCombat(s,{},0);
   for(let n=0;n<18;n++)s=tickCombatPortal(s,50);
   expect(s.roomIndex).toBe(index);expect(s.bag.fibra).toBe(7);
  }
 });
 it('keeps the bonus castle separate from the reserved next chapter portal',()=>{
  let s=createCombatState(39);s.player={...campaignRoom(39).exit};s=stepCombat(s,{},0);
  expect(s.completed).toBe(false);expect(s.portalTarget).toBeUndefined();expect(s.message).toContain('capítulo 5');
  expect(pilotRoute(campaignRoom(39).camp,castleGatePoint,true,39).length).toBeGreaterThan(0);
  s.player={...castleGatePoint};s.time=1;s=stepCombat(s,{},0);expect(s.castle?.active).toBe(true);
 });
 it('remembers collection during menu visits without moving the campaign checkpoint',()=>{
  const base=createCombatState(2);base.completedRooms=[0,1];base.xp=800;
  let visit=startExplorationTestRoom(base,35);visit.collectedNodes=[campaignRoom(35).nodes[0].id];visit.roomCollectedFibers=4;
  const bank=saveVillageVisit(base,combatSnapshot(visit)),again=startExplorationTestRoom(bank,35);
  expect(bank.roomIndex).toBe(2);expect(bank.completedRooms).toEqual([0,1]);
  expect(again.roomIndex).toBe(35);expect(again.collectedNodes).toEqual(visit.collectedNodes);
 });
});

describe('old room 32 becomes room 40 exactly once',()=>{
 it('moves local progress, residents, layout, depletion and crafting while keeping the bank and character',()=>{
  const old={...combatSnapshot(createCombatState(39)),campaignVersion:16,roomIndex:31,completedRooms:[0,30,31],claimedRooms:[0,30,31],collectedNodes:['spring-31-f1'],roomCollectedFibers:4,roomStars:{31:2},roomVisits:{31:{collectedNodes:['spring-31-f1'],gateOpen:true}},roomAttempts:{31:JSON.stringify({roomIndex:31,campaignVersion:16})},village:{version:1,layoutVersion:2,visitedRooms:[0,31],growth:{'r31:s0':12},people:{'r31:v0':{room:31,x:0,y:0}},gifts:{'r31:v0':100}},workshop:{version:2,layouts:{31:{home:{x:8,y:9}}},nodes:{'g31:10:20':{remaining:0,respawnAt:10000}},job:{room:31}},xp:1003,stock:{fibra:87},legends:{unlocked:['kael','soren'],active:'soren',weapons:[],weapon:'bow',signature:{tool:true,weapon:true}}};
  const before=JSON.stringify(old),n=migrateChapter4Expansion(old) as any;
  expect(JSON.stringify(old)).toBe(before);
  expect(n.roomIndex).toBe(39);expect(n.completedRooms).toEqual([0,30,39]);expect(n.claimedRooms).toEqual([0,30,39]);
  expect(n.collectedNodes).toEqual(['spring-39-f1']);expect(n.roomVisits['39'].collectedNodes).toEqual(n.collectedNodes);
  expect(n.roomStars['39']).toBe(2);expect(JSON.parse(n.roomAttempts['39']).roomIndex).toBe(39);
  expect(n.village.growth['r39:s0']).toBe(12);expect(n.village.people['r39:v0'].room).toBe(39);expect(n.village.gifts['r39:v0']).toBe(100);
  expect(n.workshop.layouts['39']).toEqual(old.workshop.layouts['31']);expect(n.workshop.nodes['g39:10:20'].remaining).toBe(0);expect(n.workshop.job.room).toBe(39);
  expect(n.stock).toEqual(old.stock);expect(n.xp).toBe(old.xp);expect(n.legends).toEqual(old.legends);
  expect(migrateChapter4Expansion(n)).toBe(n);
 });
 it('allows a fresh room 32 save and preserves a legacy active castle at room 40',()=>{
  const fresh=readCombatState(combatSnapshot(createCombatState(31)));
  expect(fresh.supported&&fresh.state.roomIndex).toBe(31);
  const old=readCombatState({...combatSnapshot(createCombatState(39)),campaignVersion:16,roomIndex:31,castle:{active:true,room:'vestibulo',player:{x:0,y:3},visited:['vestibulo']}});
  expect(old.supported&&old.state.roomIndex).toBe(39);
  const future=readCombatState({version:4,campaignVersion:18});expect(future.supported).toBe(false);
 });
});
