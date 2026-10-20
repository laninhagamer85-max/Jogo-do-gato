import {it,expect} from 'vitest';
import {EXPLORATION_ROOMS,campaignEnemies,campaignRoom,campaignWaterBlocks} from './explorationCampaign';
import {createCombatState,stepCombat,combatSnapshot,readCombatState,tickCombatPortal,useRareCombatItem,equipCombatCard,combatAttack,combatMaxHp,pilotRoute,pilotWalkable,clearPilotLine,type CombatState} from './explorationCombat';
import {minimapDiscovered} from './explorationMinimap';
const fixture=(index:number)=>{const s=createCombatState(index,42);s.completedRooms=Array.from({length:index},(_,i)=>i);return s;};
const read=(s:CombatState)=>{const r=readCombatState(combatSnapshot(s));if(!r.supported)throw Error();return r.state;};
it('automatically teleports through30 consecutive portals, preserving all permanent progression',()=>{
 let s=createCombatState();s.xp=1200;s.stock.erva=7;s.rareStock.cristal=2;s.rareEquipped='cristal';s.cards=['roots'];s.activeCard='roots';
 for(let index=0;index<30;index++){
  s.completed=true;s.completedRooms.push(index);s.claimedRooms.push(index);s=read(s);
  const before=s;for(let i=0;i<16;i++)s=tickCombatPortal(s,50);expect(s.roomIndex).toBe(index);
  s=tickCombatPortal(s,50);expect(s.roomIndex).toBe(index+1);expect(s.xp).toBe(1200);expect(s.stock.erva).toBe(7);expect(s.rareEquipped).toBe('cristal');expect(s.activeCard).toBe('roots');expect(s.revision).toBeGreaterThan(before.revision);expect(s.completed).toBe(false);expect(s.player).toEqual(campaignRoom(index+1).camp);expect(read(s).roomIndex).toBe(index+1);
 }
 const last=fixture(31);last.completed=true;expect(tickCombatPortal(last,5000)).toBe(last);
});
it('reload during the teleport resumes without replay, extra rewards or free supplies',()=>{
 let s=fixture(9);s.completed=true;s.portalElapsed=600;s.rareStock.seiva=3;s.stock.erva=0;
 s=read(s);for(let i=0;i<5;i++)s=tickCombatPortal(s,50);
 expect(s.roomIndex).toBe(10);expect(s.stock.erva).toBe(0);expect(s.rareStock.seiva).toBe(3);expect(s.completedRooms.filter(i=>i===9)).toHaveLength(1);expect(tickCombatPortal(s,50)).toBe(s);
});
it('caps a stalled frame and ignores invalid portal time',()=>{
 const s=fixture(1);s.completed=true;expect(tickCombatPortal(s,5000).portalElapsed).toBe(50);expect(tickCombatPortal(s,-1)).toBe(s);expect(tickCombatPortal(s,NaN)).toBe(s);
});
it.each([4,10,14])('bridge room %i has no route between banks with its deck removed',index=>{
 const room=campaignRoom(index),bridge=room.bridge;expect(bridge).toBeDefined();expect(pilotRoute(room.camp,room.exit,false,index).length).toBeGreaterThan(0);
 try{room.bridge=undefined;expect(pilotRoute(room.camp,room.exit,false,index)).toEqual([]);expect(campaignWaterBlocks({x:8.5,y:5.5},.22,room)).toBe(true);}finally{room.bridge=bridge;}
});
it.each([9,19,29])('room %i requires its master, guarantees a single rare card and never respawns the master',index=>{
 const room=campaignRoom(index),def=campaignEnemies(index,42).find(e=>e.boss)!;let s=fixture(index);s.xp=1800;s.hp=combatMaxHp(s.xp);s.roomCollectedFibers=room.fibers;s.defeated=99;s.defeatedEnemyIds=s.enemies.filter(e=>e.id!==def.id).map(e=>e.id);s.hasRoomKey=true;s.switchStep=room.switches.length;s.player={...room.marker};
 expect(stepCombat(s,{interact:true},0).gateOpen).toBe(false);
 s.enemies.forEach(e=>{e.hp=e.id===def.id?1:0;e.respawnAt=1e9;});s.player={x:def.x-.65,y:def.y};s.facing={x:1,y:0};s=stepCombat(s,{attack:true},0);
 const card=index===29?'amber':index===9?'roots':'tide';expect(s.cards).toEqual([card]);expect(s.activeCard).toBe(card);expect(read(s).cards).toEqual([card]);
 s=stepCombat(s,{attack:true},50);expect(s.cards).toEqual([card]);s.time=1e6;s=stepCombat(s,{},0);expect(s.enemies.find(e=>e.id===def.id)!.hp).toBe(0);
 s.player={...room.marker};expect(stepCombat(s,{interact:true},0).gateOpen).toBe(true);
});
it('rare healing only consumes when useful; equipment toggles without consuming the item',()=>{
 let s=createCombatState();s.rareStock={seiva:2,cristal:1,perola:1,escama:1};expect(useRareCombatItem(s,'seiva')).toBe(s);s.hp=10;s=useRareCombatItem(s,'seiva');expect(s.hp).toBe(70);expect(s.rareStock.seiva).toBe(1);s=useRareCombatItem(s,'perola');expect(s.hp).toBe(100);expect(s.rareStock.perola).toBe(0);
 const attack=combatAttack(s);s=useRareCombatItem(s,'cristal');expect(combatAttack(s)).toBe(attack+6);s=useRareCombatItem(s,'escama');expect(s.rareEquipped).toBe('escama');expect(s.rareStock.escama).toBe(1);s=useRareCombatItem(s,'escama');expect(s.rareEquipped).toBe(null);
});
it('equipped rare cards change the real power effect and preserve selection in saves',()=>{
 let s=fixture(1);s.cards=['roots','tide'];s=equipCombatCard(s,'roots');s.player={x:6,y:5.5};s.enemies[0].x=6.5;s.enemies[0].y=5.5;s=stepCombat(s,{power:true},0);expect(s.enemies[0].slowUntil).toBe(2000);s=equipCombatCard(s,'tide');s.hp=60;s.attackAt=0;s=stepCombat(s,{power:true},50);expect(s.hp).toBe(75);expect(read(s).activeCard).toBe('tide');
});
it('old minimap discoveries migrate by world position as the area grows',()=>{
 const r=readCombatState({version:2,minimapVersion:2,player:{x:1.5,y:1.5},exploredCells:[(8+5)*26+12+6],xp:500,stock:{ambar:7}});if(!r.supported)throw Error();expect(minimapDiscovered(r.state.exploredCells,{x:12.5,y:8.5})).toBe(true);expect(r.state.stock.ambar).toBe(7);expect(r.state.xp).toBe(500);expect(r.state.version).toBe(4);
 expect(readCombatState({version:5}).supported).toBe(false);
});
it('NPC populations and levels increase between biomes and every random encounter is navigable',()=>{
 expect(campaignEnemies(19,42).length).toBeGreaterThan(campaignEnemies(10,42).length);expect(campaignEnemies(10,42).length).toBeGreaterThan(campaignEnemies(1,42).length);
 });
it.each(EXPLORATION_ROOMS)('room $index: random encounters have reachable cells for stable seeds',room=>{
 for(const seed of [1,42,999])for(const def of campaignEnemies(room.index,seed))expect(pilotRoute(room.camp,def,false,room.index).length,`${room.index}:${seed}:${def.id}`).toBeGreaterThan(0);
});
it('a creature pursues nearby targets then returns home outside its leash',()=>{
 let s=fixture(10),def=campaignEnemies(10,42).find(e=>e.id==='river-crab')!,e=s.enemies.find(e=>e.id===def.id)!;
 s.player={x:def.x-.9,y:def.y};for(let i=0;i<5;i++)s=stepCombat(s,{},50);e=s.enemies.find(e=>e.id===def.id)!;expect(e.x).toBeLessThan(def.x);
 s.player={x:1.5,y:1.5};const before=e.x;s=stepCombat(s,{},50);e=s.enemies.find(e=>e.id===def.id)!;expect(e.x).toBeGreaterThan(before);
});

it('master special attacks telegraph before damage and can be avoided by retreating',()=>{
 const initial=()=>{const s=fixture(19),def=campaignEnemies(19,42).find(e=>e.boss)!;s.enemies.forEach(e=>{if(e.id!==def.id){e.hp=0;e.respawnAt=1e9;}else e.specialAt=3000;});s.player=[{x:def.x-1.4,y:def.y},{x:def.x+1.4,y:def.y},{x:def.x,y:def.y+1.4},{x:def.x,y:def.y-1.4}].find(p=>pilotWalkable(p,false,.22,19)&&clearPilotLine(p,def,false,19))!;expect(s.player).toBeDefined();s.time=3000;return s;};
 let hit=stepCombat(initial(),{},0);expect(hit.enemies.find(e=>e.id==='river-master')!.windupUntil).toBe(3900);expect(hit.hp).toBe(100);for(let i=0;i<18;i++)hit=stepCombat(hit,{},50);expect(hit.hp).toBeLessThan(100);
 let escaped=stepCombat(initial(),{},0);escaped.player={...campaignRoom(19).camp};for(let i=0;i<18;i++)escaped=stepCombat(escaped,{},50);expect(escaped.hp).toBe(100);
});
it('preserves the full late-biome population of common and rare pending drops on reload',()=>{
 const s=fixture(19),defs=campaignEnemies(19,42);s.enemies.forEach(e=>{e.hp=0;e.respawnAt=1e9;});
 s.loot=defs.flatMap(e=>[{id:`${e.id}:0`,x:e.x,y:e.y,item:e.item,quantity:1},{id:`${e.id}:0:rare`,x:e.x,y:e.y,item:'ambar' as const,rare:e.spriteRow===1?'perola' as const:'escama' as const,quantity:1}]);expect(s.loot.length).toBeGreaterThan(20);expect(read(s).loot).toHaveLength(s.loot.length);
});
