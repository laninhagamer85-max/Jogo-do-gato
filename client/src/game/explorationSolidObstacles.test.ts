import {expect,it} from 'vitest';
import {castleBridgePoint,bridgeGroundBlocked,CASTLE_BRIDGE_PILLARS} from './explorationCastleBridge';
import {moveCombatPoint,pilotWalkable,pilotRoute,nearestPilotPoint,createCombatState,combatSnapshot,readCombatState,type CombatPoint} from './explorationCombat';
import {nascentesHeight} from './explorationChapter4';
import {resourceNodes,harvestResource} from './explorationWorkshop';
function push(p:CombatPoint,to:CombatPoint,index=39){for(let i=0;i<200;i++){const d=Math.hypot(to.x-p.x,to.y-p.y);if(d<.01)break;const next=moveCombatPoint(p,(to.x-p.x)/d*.04,(to.y-p.y)/d*.04,true,.22,index);if(Math.hypot(next.x-p.x,next.y-p.y)<.00001)break;p=next;}return p;}
it('stops the body before the front and side of every column, including feet beyond the old diamond',()=>{
 for(const [x,y] of [[425,1110],[775,860],[1120,625]]){const p=castleBridgePoint(x,y);expect(bridgeGroundBlocked(p,.22)).toBe(true);expect(pilotWalkable(p,true,.22,39)).toBe(false);}
 for(const poly of CASTLE_BRIDGE_PILLARS){const c={x:poly.reduce((n,p)=>n+p.x,0)/4,y:Math.max(...poly.map(p=>p.y))};const start=nearestPilotPoint({x:c.x,y:c.y+1.6},true,39),p=push(start,c);expect(bridgeGroundBlocked(p,.22)).toBe(false);expect(p.y).toBeGreaterThan(c.y+.5);}
});
it('all chapter4 mineral deposits are solid, with reachable adjacent collection range',()=>{
 for(let index=30;index<40;index++)for(const n of resourceNodes(index).filter(n=>n.kind!=='tree')){
  const center={x:n.x,y:n.y-.25};expect(pilotWalkable(center,true,.22,index),n.id).toBe(false);
  let contacts=0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const start={x:center.x+dx*1.2,y:center.y+dy*1.2};if(!pilotWalkable(start,true,.22,index))continue;const p=push(start,center,index);expect(Math.hypot(p.x-center.x,p.y-center.y),n.id).toBeGreaterThanOrEqual(.65-1e-6);if(Math.hypot(p.x-n.x,p.y-n.y)<1.45)contacts++;}expect(contacts,n.id).toBeGreaterThan(0);
 }
});
it('routes around a mineral and can still harvest it from the collision boundary',()=>{
 const index=39,n=resourceNodes(index).find(n=>n.kind==='stone')!,c={x:n.x,y:n.y-.25};
 const start=nearestPilotPoint({x:c.x-1.2,y:c.y},true,index),to=nearestPilotPoint({x:c.x+1.2,y:c.y},true,index),route=pilotRoute(start,to,true,index);expect(route.length).toBeGreaterThan(1);
 let p:CombatPoint=start;for(const goal of route){p=push(p,goal,index);expect(Math.hypot(p.x-goal.x,p.y-goal.y)).toBeLessThan(.05);}const s=createCombatState(index);s.player=push(start,c,index);s.workshop.tools.pickaxe=1;const next=harvestResource(s,n,1);expect(next.workshop.materials.stone).toBe(s.workshop.materials.stone+1);
});
it('moves an old save out of a newly solid deposit locally without losing legend or materials',()=>{
 const index=39,n=resourceNodes(index).filter(n=>n.kind!=='tree').sort((a,b)=>Math.hypot(b.x,b.y)-Math.hypot(a.x,a.y))[0],s=createCombatState(index);s.player={x:n.x,y:n.y-.25};s.xp=4000;s.workshop.materials.stone=23;s.legends={unlocked:['soren'],active:'soren',weapons:[],weapon:'bow'};const r=readCombatState(combatSnapshot(s));if(!r.supported)throw Error();expect(pilotWalkable(r.state.player,true,.22,index,r.state.workshop)).toBe(true);expect(Math.hypot(r.state.player.x-s.player.x,r.state.player.y-s.player.y)).toBeLessThan(2);expect(r.state.xp).toBe(4000);expect(r.state.workshop.materials.stone).toBe(23);expect(r.state.legends?.active).toBe('soren');expect(nascentesHeight(r.state.player,index)).toBe(0);
});
