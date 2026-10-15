import {describe,it,expect} from 'vitest';
import {PILOT_OBSTACLES,ROOM_WALLS,ROOM_SCENERY} from './explorationRoom';
import {PILOT_CAMP,PILOT_NODES,PILOT_ENEMIES,PILOT_MARKER,PILOT_EXIT,pilotWalkable,pilotRoute,readCombatState,createCombatState} from './explorationCombat';
describe('painted pilot room geometry',()=>{
 it('derives collisions and single prop anchors from the same footprints',()=>{
  expect(ROOM_SCENERY).toHaveLength(2);expect(ROOM_WALLS).toHaveLength(3);
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
});

it('opens the space released by smaller scenery without invisible old walls',()=>{
 expect(pilotWalkable({x:7.5,y:3.5},true)).toBe(true);
 expect(pilotWalkable({x:11.5,y:6.5},true)).toBe(true);
 expect(pilotWalkable({x:6.5,y:3.5},true)).toBe(false);
 expect(pilotWalkable({x:10.5,y:6.5},true)).toBe(false);
});
