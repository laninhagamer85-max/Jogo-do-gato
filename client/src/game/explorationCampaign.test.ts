import {describe,it,expect} from 'vitest';
import {EXPLORATION_ROOMS,campaignRoom,campaignWaterBlocks} from './explorationCampaign';
import {createCombatState,readCombatState,combatSnapshot,pilotWalkable,pilotRoute,clearPilotWalkLine,stepCombat,consumeCombatItem,advanceCombatRoom,replayCompletedCombat,combatMaxHp,type CombatState} from './explorationCombat';
import {createInitialGameState,saveExplorationCombatProgress} from './PetGame';

const read=(s:CombatState)=>{const r=readCombatState(combatSnapshot(s));if(!r.supported)throw Error('Unsupported');return r.state;};
const fixture=(index:number)=>{const s=createCombatState(index);s.completedRooms=Array.from({length:index},(_,i)=>i);s.claimedRooms=[...s.completedRooms];return s;};
const walk=(s:CombatState,target:{x:number;y:number})=>{
 const path=pilotRoute(s.player,target,s.gateOpen,s.roomIndex);expect(path.length).toBeGreaterThan(0);
 for(const next of path){let n=0;while(!s.completed&&Math.hypot(next.x-s.player.x,next.y-s.player.y)>.04&&n++<80){const d=Math.hypot(next.x-s.player.x,next.y-s.player.y),gain=Math.min(1,d/.15);s=stepCombat(s,{dx:(next.x-s.player.x)/d*gain,dy:(next.y-s.player.y)/d*gain},50);}expect(n).toBeLessThan(80);}
 return s;
};
describe('ten authored chapter-one rooms',()=>{
 it('contains ten distinct playable layouts and varied challenges',()=>{
  expect(EXPLORATION_ROOMS).toHaveLength(10);
  expect(new Set(EXPLORATION_ROOMS.map(r=>JSON.stringify([r.walls,r.nodes,r.marker,r.exit]))).size).toBe(10);
  expect(EXPLORATION_ROOMS.filter(r=>r.switches.length).length).toBe(2);
  expect(EXPLORATION_ROOMS.filter(r=>r.key).length).toBe(2);
 });
 it.each(EXPLORATION_ROOMS)('room $index: all authored goals and encounters have valid paths',room=>{
  for(const target of [room.camp,room.marker,room.exit,...room.nodes,...room.enemies,...room.switches,...(room.key?[room.key]:[])]){
   expect(pilotWalkable(target,false,.22,room.index),JSON.stringify(target)).toBe(true);
   if(target===room.camp)continue;
   const route=pilotRoute(room.camp,target,false,room.index);expect(route.length,`${room.index}: ${JSON.stringify(target)}`).toBeGreaterThan(0);
   route.forEach((p,i)=>expect(clearPilotWalkLine(i?route[i-1]:room.camp,p,false,.22,room.index)).toBe(true));
  }
 });
 it.each(EXPLORATION_ROOMS)('room $index: gates require current goals and completion advances monotonically',room=>{
  let s=fixture(room.index);s.player={...room.marker};s.stock.fibra=900;s.enemies.forEach(e=>{e.hp=0;e.respawnAt=1e9;});
  expect(stepCombat(s,{interact:true},0).gateOpen).toBe(false);
  s.roomCollectedFibers=room.fibers;s.defeated=room.encounters;s.switchStep=room.switches.length;s.hasRoomKey=Boolean(room.key);s.bridgeCrossed=Boolean(room.bridge);s.consumablesUsed=room.useConsumable?1:0;
  s=stepCombat(s,{interact:true},0);expect(s.gateOpen).toBe(true);s.player={...room.exit};s.bag.fibra=5;s=stepCombat(s,{},0);
  expect(s.completed).toBe(true);expect(s.completedRooms).toContain(room.index);expect(s.claimedRooms).toContain(room.index);expect(stepCombat(s,{},50)).toBe(s);
  const parsed=read(s);expect(parsed.roomIndex).toBe(room.index);expect(parsed.completed).toBe(true);
  const next=advanceCombatRoom(parsed);if(room.index===9){expect(next).toBe(parsed);return;}
  expect(next.roomIndex).toBe(room.index+1);expect(next.stock).toEqual(parsed.stock);expect(next.hp).toBe(parsed.hp);expect(next.xp).toBe(parsed.xp);expect(next.deaths).toBe(parsed.deaths);expect(next.revision).toBeGreaterThan(parsed.revision);expect(next.exploredCells).not.toBe(parsed.exploredCells);
  expect(next.collectedNodes).toEqual([]);expect(next.roomCollectedFibers).toBe(0);expect(next.gateOpen).toBe(false);expect(read(next).roomIndex).toBe(next.roomIndex);
 });
 it('migrates the completed pilot without resetting XP or awarding/duplicating items',()=>{
  const raw={...combatSnapshot(createCombatState()),xp:890,hp:140,stock:{fibra:22,ambar:9,erva:1,fruta:2},completed:true};
  delete raw.campaignVersion;delete raw.roomIndex;delete raw.completedRooms;delete raw.claimedRooms;
  const r=readCombatState(raw);if(!r.supported)throw Error();expect(r.state.completedRooms).toEqual([0]);expect(r.state.claimedRooms).toEqual([0]);
  const next=advanceCombatRoom(r.state);expect(next.roomIndex).toBe(1);expect(next.xp).toBe(890);expect(next.hp).toBe(140);expect(next.stock).toEqual(raw.stock);
 });
 it('keeps unknown future campaign saves untouched and bounds invalid room data',()=>{
  expect(readCombatState({version:1,campaignVersion:99}).supported).toBe(false);
  const s=readCombatState({version:1,roomIndex:9,completedRooms:[0,999,'2',-1],claimedRooms:[]});if(!s.supported)throw Error();expect(s.state.roomIndex).toBe(1);
 });
 it('requires the plate order and preserves it after reload',()=>{
  let s=fixture(2);s.player={...campaignRoom(2).switches[1]};s=stepCombat(s,{interact:true},0);expect(s.switchStep).toBe(0);
  s.player={...campaignRoom(2).switches[0]};s=stepCombat(s,{interact:true},0);expect(s.switchStep).toBe(1);s=read(s);expect(s.switchStep).toBe(1);
  s.player={...campaignRoom(2).switches[1]};s=stepCombat(s,{interact:true},0);expect(s.switchStep).toBe(2);
 });
 it('collects a key once, persists it and resets it in the next room',()=>{
  let s=fixture(5);s.player={...campaignRoom(5).key!};s=stepCombat(s,{},0);expect(s.hasRoomKey).toBe(true);expect(read(s).hasRoomKey).toBe(true);
  s.completed=true;expect(advanceCombatRoom(s).hasRoomKey).toBe(false);
 });
 it('blocks pond water but walks across the real bridge with the same movement engine',()=>{
  const room=campaignRoom(4);expect(campaignWaterBlocks({x:8.5,y:5},.22,room)).toBe(true);
  expect(pilotWalkable({x:8.5,y:5.5},false,.22,4)).toBe(true);
  let s=fixture(4);s.player={x:6.5,y:5.5};s.enemies.forEach(e=>{e.hp=0;e.respawnAt=1e9;});
  s=walk(s,{x:10.5,y:5.5});expect(s.bridgeEntered).toBe(true);expect(s.bridgeCrossed).toBe(true);expect(read(s).bridgeCrossed).toBe(true);
 });
 it('counts a consumable only when it actually restores HP or energy',()=>{
  let s=fixture(6);expect(consumeCombatItem(s,'fruta')).toBe(s);s.energy=65;s.stock.fruta=1;s=consumeCombatItem(s,'fruta');expect(s.consumablesUsed).toBe(1);expect(s.stock.fruta).toBe(0);expect(read(s).consumablesUsed).toBe(1);
 });
 it('preserves permanent room achievements during replay and protects house progression',()=>{
  let s=fixture(4);s.completed=true;s.completedRooms.push(4);s.claimedRooms.push(4);s.revision=90;s.xp=300;s.stock.ambar=9;
  const repeat=replayCompletedCombat(s);expect(repeat.roomIndex).toBe(4);expect(repeat.claimedRooms).toEqual([0,1,2,3,4]);expect(repeat.completionRewardClaimed).toBe(true);expect(repeat.stock.ambar).toBe(9);
  const house=createInitialGameState(),saved=saveExplorationCombatProgress(house,combatSnapshot(repeat));expect(saved.xp).toBe(house.xp);expect(saved.coins).toBe(house.coins);
 });
});

it.each(EXPLORATION_ROOMS)('room $index: headless movement collects resources and solves the authored interactions',room=>{
 let s=fixture(room.index);s.enemies.forEach(e=>{e.hp=0;e.respawnAt=1e9;}); // Navigation fixture; separate live-duel test below.
 for(const node of room.nodes.filter(n=>n.item==='fibra'||n.item==='fruta')){
  s=walk(s,node);if(Math.hypot(s.player.x-node.x,s.player.y-node.y)>=.55){
   // Walk the final sub-cell distance through the same collision checks.
   for(let i=0;i<10&&Math.hypot(s.player.x-node.x,s.player.y-node.y)>.1;i++){const d=Math.hypot(s.player.x-node.x,s.player.y-node.y);s=stepCombat(s,{dx:(node.x-s.player.x)/d,dy:(node.y-s.player.y)/d},25);}
  }
  s=stepCombat(s,{},0);expect(s.collectedNodes).toContain(node.id);
 }
 expect(s.roomCollectedFibers).toBeGreaterThanOrEqual(room.fibers);
 if(room.key){s=walk(s,room.key);s=stepCombat(s,{},0);expect(s.hasRoomKey).toBe(true);}
 for(const plate of room.switches){s=walk(s,plate);s=stepCombat(s,{interact:true},0);}expect(s.switchStep).toBe(room.switches.length);
 if(room.bridge){s=walk(s,{x:6.5,y:5.5});s=walk(s,{x:10.5,y:5.5});expect(s.bridgeCrossed).toBe(true);}
 if(room.useConsumable){s=stepCombat(s,{power:true},0);s=consumeCombatItem(s,'fruta');expect(s.consumablesUsed).toBeGreaterThan(0);}
 s.defeated=room.encounters;s=walk(s,room.marker);s=stepCombat(s,{interact:true},0);expect(s.gateOpen).toBe(true);
 s=walk(s,room.exit);s=stepCombat(s,{},0);expect(s.completed).toBe(true);
});
it.each(EXPLORATION_ROOMS)('room $index: each enemy can be defeated with level-one melee in an isolated live duel',room=>{
 for(const def of room.enemies){
  let s=fixture(room.index);s.enemies.forEach(e=>{if(e.id!==def.id){e.hp=0;e.respawnAt=1e9;}});
  const approach=[{x:def.x-.65,y:def.y},{x:def.x+.65,y:def.y},{x:def.x,y:def.y+.65},{x:def.x,y:def.y-.65}].find(p=>pilotWalkable(p,false,.22,room.index));expect(approach).toBeDefined();s.player=approach!;
  let steps=0;while(s.enemies.find(e=>e.id===def.id)!.hp>0&&steps++<300){const e=s.enemies.find(e=>e.id===def.id)!,d=Math.hypot(e.x-s.player.x,e.y-s.player.y);s.facing={x:(e.x-s.player.x)/(d||1),y:(e.y-s.player.y)/(d||1)};s=stepCombat(s,{attack:true},50);}
  expect(s.enemies.find(e=>e.id===def.id)!.hp).toBe(0);expect(s.deaths).toBe(0);expect(s.xp).toBeGreaterThan(0);
 }
});
