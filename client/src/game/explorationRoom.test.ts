import {describe,it,expect} from 'vitest';
import {PILOT_OBSTACLES,ROOM_WALLS,ROOM_SCENERY,ROOM_UNDERGROWTH} from './explorationRoom';
import {PILOT_CAMP,PILOT_NODES,PILOT_ENEMIES,PILOT_MARKER,PILOT_EXIT,pilotWalkable,pilotRoute,clearPilotWalkLine,readCombatState,createCombatState} from './explorationCombat';
describe('painted pilot room geometry',()=>{
 it('derives collisions and single prop anchors from the same footprints',()=>{
  expect(ROOM_SCENERY).toHaveLength(5);expect(ROOM_WALLS).toHaveLength(6);
  PILOT_OBSTACLES.forEach((o,i)=>{expect(ROOM_SCENERY[i].x).toBe(o.x+o.width/2);for(let x=o.x;x<o.x+o.width;x++)for(let y=o.y;y<o.y+o.height;y++)expect(pilotWalkable({x:x+.5,y:y+.5},true)).toBe(false);});
 });
 it('keeps all collection points, encounters, marker and exit reachable',()=>{
  for(const p of [...PILOT_NODES,...PILOT_ENEMIES,PILOT_MARKER,PILOT_EXIT]){
   expect(pilotWalkable(p,true)).toBe(true);const route=pilotRoute(PILOT_CAMP,p,true);expect(route.length).toBeGreaterThan(0);route.forEach(q=>expect(pilotWalkable(q,true)).toBe(true));
  }
 });
 it('routes touch movement around the fallen log',()=>{
  const route=pilotRoute({x:4.5,y:3.5},{x:8.5,y:3.5},false);expect(route.length).toBeGreaterThan(4);route.forEach(p=>expect(pilotWalkable(p,false)).toBe(true));
 });
 it('relocates old player and pending drops without deleting earned progress',()=>{
  const save=createCombatState();save.player={x:6.5,y:3.5};save.xp=80;save.hp=73;save.bag.fibra=7;save.stock.ambar=4;save.enemies[0].hp=0;save.loot=[{id:'beetle:0',x:6.5,y:3.5,item:'fibra',quantity:3}];
  const read=readCombatState(save);expect(read.supported).toBe(true);if(!read.supported)return;
  expect(pilotWalkable(read.state.player,false)).toBe(true);expect(read.state.hp).toBe(73);expect(read.state.xp).toBe(80);expect(read.state.bag.fibra).toBe(7);expect(read.state.stock.ambar).toBe(4);expect(read.state.loot).toHaveLength(1);expect(read.state.loot[0].quantity).toBe(3);expect(pilotWalkable(read.state.loot[0],false)).toBe(true);
 });
 it('still rejects out of bounds loot',()=>{
  const save=createCombatState();save.enemies[0].hp=0;save.loot=[{id:'beetle:0',x:99,y:99,item:'fibra',quantity:3}];const read=readCombatState(save);if(read.supported)expect(read.state.loot).toEqual([]);
 });
 it('keeps low vegetation distributed, walkable and clear of objectives',()=>{
  expect(ROOM_UNDERGROWTH).toHaveLength(22);
  for(const p of ROOM_UNDERGROWTH){
   expect(p.blocking).toBe(false);expect(pilotWalkable(p,true)).toBe(true);expect(p.width).toBeLessThanOrEqual(.66);expect(p.height).toBeLessThanOrEqual(.46);
   for(const target of [PILOT_CAMP,...PILOT_NODES,PILOT_MARKER,PILOT_EXIT])expect(Math.hypot(p.x-target.x,p.y-target.y)).toBeGreaterThan(1.2);
  }
  for(const [left,right,top,bottom] of [[1,7,1,5],[7,13,1,5],[1,7,5,9],[7,13,5,9]])expect(ROOM_UNDERGROWTH.filter(p=>p.x>=left&&p.x<right&&p.y>=top&&p.y<bottom).length).toBeGreaterThanOrEqual(3);
 });
 it('keeps continuous touch routes to objectives around all five solid objects',()=>{
  for(const target of [...PILOT_NODES,...PILOT_ENEMIES,PILOT_MARKER,PILOT_EXIT]){
   const route=pilotRoute(PILOT_CAMP,target,true);expect(route.length).toBeGreaterThan(0);
   route.forEach((p,i)=>expect(clearPilotWalkLine(i?route[i-1]:PILOT_CAMP,p,true)).toBe(true));
  }
 });
 it('relocates saves from every new solid footprint while preserving progress and loot',()=>{
  for(const o of PILOT_OBSTACLES.slice(2))for(const gateOpen of [true,false]){
   const s=createCombatState();s.gateOpen=gateOpen;s.player={x:o.x+.5,y:o.y+.5};s.xp=95;s.hp=64;s.energy=43;s.bag.fibra=8;s.stock.ambar=3;s.equipmentOwned=true;
   s.enemies[0].hp=0;s.loot=[{id:'beetle:0',...s.player,item:'fibra',quantity:3}];
   const parsed=readCombatState(s);expect(parsed.supported).toBe(true);if(!parsed.supported)continue;
   const a=parsed.state;expect(pilotWalkable(a.player,gateOpen)).toBe(true);expect(pilotWalkable(a.loot[0],gateOpen)).toBe(true);
   expect(a.xp).toBe(95);expect(a.hp).toBe(64);expect(a.energy).toBe(43);expect(a.bag).toEqual(s.bag);expect(a.stock).toEqual(s.stock);expect(a.equipmentOwned).toBe(true);expect(a.deaths).toBe(0);expect(a.loot[0].quantity).toBe(3);
  }
 });
});

it('opens the space released by smaller scenery without invisible old walls',()=>{
 expect(pilotWalkable({x:7.5,y:3.5},true)).toBe(true);
 expect(pilotWalkable({x:11.5,y:6.5},true)).toBe(true);
 expect(pilotWalkable({x:6.5,y:3.5},true)).toBe(false);
 expect(pilotWalkable({x:10.5,y:6.5},true)).toBe(false);
});
