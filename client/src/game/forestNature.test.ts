import {describe,it,expect} from 'vitest';
import {ambientInsectPose,ambientPerchPose,gardenBreeze,gardenPlacement,FOREST_NATURE} from './forestNature';
import {ROOM_GARDENS,ROOM_EDGE_GARDENS} from './explorationRoom';
import {createCombatState,pilotWalkable,pilotRoute,PILOT_CAMP,PILOT_NODES,PILOT_MARKER} from './explorationCombat';
describe('walkable forest ambience',()=>{
 it('keeps resting insects attached to logs and plants and freezes them with reduced motion',()=>{
  for(let i=0;i<FOREST_NATURE.perches.length;i++){
   expect(ambientPerchPose(0,i,true)).toEqual(ambientPerchPose(90000,i,true));
   for(let t=0;t<60000;t+=351){const p=ambientPerchPose(t,i,false),base=FOREST_NATURE.perches[i];
    expect(Math.abs(p.x-base.x)).toBeLessThanOrEqual(.035);expect(Math.abs(p.y-base.y)).toBeLessThanOrEqual(.012);
   }
  }
 });
 it('keeps spawn, the former shelter position and objectives reachable after moving the shelter left',()=>{
  expect(pilotWalkable(PILOT_CAMP,false)).toBe(true);
  expect(pilotWalkable({x:2.75,y:1.7},false)).toBe(true);
  for(const target of [...PILOT_NODES,PILOT_MARKER])expect(pilotRoute(createCombatState().player,target,false).length).toBeGreaterThan(0);
 });
 it('keeps plant crops inside their atlas, proportions intact and feet anchored at different zooms',()=>{
  for(const p of [...ROOM_GARDENS,...ROOM_EDGE_GARDENS])for(const tile of [30,100,240]){
   const a=gardenPlacement(p,tile,180,220);
   expect(a.sx).toBeGreaterThanOrEqual(0);expect(a.sy).toBeGreaterThanOrEqual(0);
   expect(a.sx+a.sw).toBeLessThanOrEqual(1536);expect(a.sy+a.sh).toBeLessThanOrEqual(1024);
   expect(a.width/a.height).toBeCloseTo(a.sw/a.sh);
   expect(a.y+a.height).toBeCloseTo(220);expect(a.x+a.width/2).toBeCloseTo(180);
   expect(p.blocking).toBe(false);
  }
 });
 it('freezes plant and insect movement when reduced motion is enabled',()=>{
  for(let i=0;i<FOREST_NATURE.insects.length;i++){
   expect(ambientInsectPose(0,i,true)).toEqual(ambientInsectPose(90000,i,true));
   expect(ambientInsectPose(0,i,false)).not.toEqual(ambientInsectPose(90000,i,false));
  }
  expect(gardenBreeze(6000,2,true)).toBe(0);expect(Math.abs(gardenBreeze(6000,2,false))).toBeLessThanOrEqual(.014);
 });
 it('bounds ambient flights to their local scenery rather than following or attacking the pet',()=>{
  for(let i=0;i<FOREST_NATURE.insects.length;i++)for(let t=0;t<60000;t+=211){
   const p=ambientInsectPose(t,i,false),base=FOREST_NATURE.insects[i];
   expect(Math.abs(p.x-base.x)).toBeLessThanOrEqual(.65);expect(Math.abs(p.y-base.y)).toBeLessThanOrEqual(.38);
  }
 });
});
