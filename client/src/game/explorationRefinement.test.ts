import {describe,it,expect} from 'vitest';
import {EDGE_PROP_FOOTPRINTS,ROOM_EDGE_SOLIDS,SCATTERED_GARDENS,hitsEdgeScenery} from './explorationRoom';
import {createCombatState,readCombatState,pilotWalkable,pilotRoute,clearPilotWalkLine,stepCombat,PILOT_CAMP,PILOT_NODES,PILOT_MARKER,PILOT_EXIT} from './explorationCombat';
import {insideExploration} from './explorationWorld';
import {lensProjection,discoveredWorldPoint} from './explorationLens';
import {readMinimap,minimapDiscovered} from './explorationMinimap';
import {drawPortalEnergy,drawPortalArch,portalPhase} from './explorationPortal';

describe('reported rock overlap regression',()=>{
 it('blocks every rendered perimeter rock or log at its foot contact',()=>{
  expect(EDGE_PROP_FOOTPRINTS.length).toBe(ROOM_EDGE_SOLIDS.length);
  for(const f of EDGE_PROP_FOOTPRINTS){expect(hitsEdgeScenery(f,.22)).toBe(true);expect(pilotWalkable(f,true)).toBe(false);}
 });
 it('prevents held movement entering the rock beside the shelter',()=>{
  const rock=EDGE_PROP_FOOTPRINTS[0],s=createCombatState();s.player={x:rock.x+rock.rx+.5,y:rock.y};
  let current=s;for(let i=0;i<90;i++)current=stepCombat(current,{dx:-1},16);
  expect(hitsEdgeScenery(current.player,.22)).toBe(false);
  expect(current.player.x).toBeGreaterThan(rock.x+rock.rx);
 });
 it('relocates an old save inside the new rock hitbox without losing earned progress',()=>{
  const s=createCombatState();s.player={x:EDGE_PROP_FOOTPRINTS[0].x,y:EDGE_PROP_FOOTPRINTS[0].y};s.xp=120;s.hp=88;s.bag.fibra=16;s.stock.ambar=9;s.equipmentOwned=true;
  const read=readCombatState(s);if(!read.supported)throw Error();
  expect(pilotWalkable(read.state.player,false)).toBe(true);expect(read.state.xp).toBe(120);expect(read.state.hp).toBe(88);expect(read.state.stock).toEqual(s.stock);expect(read.state.bag).toEqual(s.bag);expect(read.state.equipmentOwned).toBe(true);
 });
 it('preserves continuous routes to objectives and the expanded four directions',()=>{
  for(const target of [...PILOT_NODES,PILOT_MARKER,PILOT_EXIT,{x:-2.5,y:4.5},{x:17.5,y:4.5},{x:7.5,y:-2.5},{x:7.5,y:12.5}]){
   const route=pilotRoute(PILOT_CAMP,target,true);expect(route.length).toBeGreaterThan(0);
   route.forEach((q,i)=>expect(clearPilotWalkLine(i?route[i-1]:PILOT_CAMP,q,true)).toBe(true));
  }
 });
});
describe('natural distribution and full circular lens',()=>{
 it('adds small world-anchored vegetation inside the clearing with breathing room around targets',()=>{
  expect(SCATTERED_GARDENS.length).toBeGreaterThan(20);
  for(const g of SCATTERED_GARDENS){expect(g.blocking).toBe(false);expect(insideExploration(g)).toBe(true);expect(g.width).toBeLessThan(.73);
   for(const p of [PILOT_CAMP,PILOT_EXIT,PILOT_MARKER,...PILOT_NODES])expect(Math.hypot(g.x-p.x,g.y-p.y)).toBeGreaterThan(.5);
  }
 });
 it('centers the red player beacon and fills a north-up lens at all viewport sizes',()=>{
  for(const size of [76,90,180,256])for(const p of [{x:1.5,y:1.5},{x:-3,y:5},{x:17,y:7}]){
   const v=lensProjection(size,p);expect(v.left+p.x*v.scale).toBeCloseTo(size/2);expect(v.top+p.y*v.scale).toBeCloseTo(size/2);
   expect(v.top+(p.y-6)*v.scale).toBeCloseTo(0);expect(v.left+(p.x+6)*v.scale).toBeCloseTo(size);
  }
 });
 it('uses the same discovery positions as the saved world map, including negative coordinates',()=>{
  for(const p of [{x:-3.5,y:4.5},{x:17.5,y:7.5}]){
   const cells=readMinimap([],p);expect(minimapDiscovered(cells,p)).toBe(true);
   for(const i of cells){const q=discoveredWorldPoint(i);expect(minimapDiscovered(cells,q)).toBe(true);}
  }
 });
});
describe('painted portal presentation',()=>{
 const context=()=>{
  const images:unknown[][]=[],lights:unknown[][]=[],fills:unknown[][]=[];
  const ctx=new Proxy({drawImage:(...a:unknown[])=>images.push(a),fillRect:(...a:unknown[])=>fills.push(a),createRadialGradient:(...a:unknown[])=>{lights.push(a);return {addColorStop:()=>{}};}},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}}) as unknown as CanvasRenderingContext2D;
  return {ctx,images,lights,fills};
 };
 it('shows a wider active glow and twelve readable lights while inactive state stays quiet',()=>{
  const a=context();drawPortalEnergy(a.ctx,100,120,80,1500,false,false);expect(a.lights).toHaveLength(0);
  drawPortalEnergy(a.ctx,100,120,80,1500,true,false);expect(a.lights).toHaveLength(14);expect(a.lights[0][5]).toBe(80*1.3);
 });
 it('freezes ambient movement when reduced motion is requested',()=>{
  expect(portalPhase(0,true)).toBe(portalPhase(99999,true));
  const a=context(),b=context();drawPortalEnergy(a.ctx,100,100,80,0,true,true);drawPortalEnergy(b.ctx,100,100,80,99999,true,true);
  expect(a.lights).toEqual(b.lights);expect(a.fills).toEqual(b.fills);
 });
 it('keeps uniform image proportions and waits for loaded artwork',()=>{
  const c=context();drawPortalArch(c.ctx,undefined,100,100,80);expect(c.images).toHaveLength(0);
  const image={complete:true,naturalWidth:1024,naturalHeight:1024} as HTMLImageElement;drawPortalArch(c.ctx,image,100,100,80);
  const [,x,y,w,h]=c.images[0] as number[];expect(w).toBe(156);expect(h).toBe(w);expect(x+w/2).toBe(100);expect(y+h).toBeCloseTo(110.4);
 });
});
