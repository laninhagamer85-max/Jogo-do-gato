import {describe,it,expect} from 'vitest';
import {createCombatState,pilotRoute,stepCombat,clearPilotWalkLine,pilotWalkable} from './explorationCombat';
import {campaignRoom} from './explorationCampaign';
import {PILOT_SHELTER} from './explorationRoom';

describe('precise outdoor tap navigation',()=>{
 for(const index of [0,10,20])it(`moves within one cell and stops near the actual tap in chapter ${index/10+1}`,()=>{
  let state=createCombatState(index,42);
  const start={...state.player},target={x:start.x+.2,y:start.y+.2};
  const route=pilotRoute(start,target,false,index);
  expect(route).toEqual([target]);
  for(const waypoint of route)for(let n=0;n<100&&Math.hypot(waypoint.x-state.player.x,waypoint.y-state.player.y)>.06;n++){
   const d=Math.hypot(waypoint.x-state.player.x,waypoint.y-state.player.y),scale=Math.min(1,d/.15);
   state=stepCombat(state,{dx:(waypoint.x-state.player.x)/d*scale,dy:(waypoint.y-state.player.y)/d*scale},50);
  }
  expect(Math.hypot(state.player.x-target.x,state.player.y-target.y)).toBeLessThan(.06);
  expect(state.player).not.toEqual(start);
  expect(state.stock.fibra).toBe(0);
 });
 it('keeps every waypoint segment clear and preserves unsnapped endpoints around obstacles',()=>{
  let detours=0;
  for(const index of [0,10,20]){
   const from=createCombatState(index).player;
   for(const target of [...campaignRoom(index).nodes.map(n=>({x:n.x+.13,y:n.y+.13})),{x:4.23,y:4.17}]){
    const route=pilotRoute(from,target,true,index);
    if(!route.length)continue;
    expect(route.at(-1)).toEqual(target);
    let prev=from;
    for(const point of route){expect(clearPilotWalkLine(prev,point,true,.22,index)).toBe(true);prev=point;}
    if(route.length>1)detours++;
   }
  }
  expect(detours).toBeGreaterThan(0);
 });
 it('rejects blocked destinations and invalid or excessive coordinates',()=>{
  const from=createCombatState(0).player;
  const f=PILOT_SHELTER.footprint,blocked={x:f.x+f.width/2,y:f.y+f.height/2};
  expect(pilotWalkable(blocked,false,.22,0)).toBe(false);
  expect(pilotRoute(from,blocked,false,0)).toEqual([]);
  for(const target of [{x:NaN,y:1},{x:Infinity,y:1},{x:1000,y:1}])expect(pilotRoute(from,target,false,0)).toEqual([]);
  expect(pilotRoute({x:NaN,y:1},from,false,0)).toEqual([]);
 });
});
