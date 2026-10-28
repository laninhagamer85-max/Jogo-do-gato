import {resourceNodes} from './explorationWorkshop';
import {expect,it} from 'vitest';
import {nascentesElevations,nascentesLayout} from './explorationNascentesLayout';
import {nascentesGeometry,nascentesHeight,nascentesRoom,returnPortal,plateauStairBase,plateauStairTop} from './explorationChapter4';
import {insideRegion,touchesRegion} from './biomeComposition';
import {villageLayout,villageDoor,villageSettlements,activeVillageDefinitions} from './explorationVillageLayout';
import {createCombatState,pilotWalkable,combatSnapshot,readCombatState,moveCombatPoint} from './explorationCombat';
import {tickVillage} from './explorationVillage';
import {explorationAmbience,CASTLE_AMBIENCE,CHAPTER_AMBIENCE} from './explorationAudio';
for(let room=30;room<40;room++)it(`room${room+1}: portals have clear sightlines and buildings have full support`,()=>{
 const layout=villageLayout(room),buildings=[...layout.homes,...layout.markets];
 for(const portal of [nascentesRoom(room).exit,returnPortal(room)]){
  expect(pilotWalkable(portal,true,.22,room)).toBe(true);
  for(const h of buildings){const overlaps=Math.abs(h.x-portal.x)<3.8&&h.y>portal.y-3&&h.y<portal.y+5.5;expect(overlaps,`portal ${JSON.stringify(portal)} hidden by ${h.id}`).toBe(false);}
 }
 for(const town of villageSettlements(room))for(const h of buildings.filter(h=>h.settlement===town.slot))for(const dx of [-1.7,0,1.7])for(const dy of [-2.05,0,.12]){
  const p={x:h.x+dx,y:h.y+dy};
  if(town.elevated)expect(nascentesHeight(p,room),h.id).toBe(1);
  else expect(nascentesGeometry(room).some(g=>touchesRegion(p,.1,g.footprint)),`ground building touches cliff: ${h.id}`).toBe(false);
 }
});
it('sizes compact staircases to each platform and offers two models',()=>{
 const models=new Set();for(let room=30;room<40;room++)for(const e of nascentesElevations(room)){const a=plateauStairBase(e),b=plateauStairTop(e);expect(Math.hypot(a.x-b.x,a.y-b.y)).toBeCloseTo(e.size*(e.stairModel==='isometric'?Math.hypot(.10,.1025):Math.hypot(.015,.0975)),5);models.add(e.stairModel);}expect(models.size).toBe(3);
});
for(const room of [32,34,36,38])it(`room${room+1}: residents finish visits and work instead of rejecting long clear segments`,()=>{
 let s=createCombatState(room,42);s.village!.growth=Object.fromEntries(villageSettlements(room).map(t=>[t.id,24]));const town=villageSettlements(room)[0];s.player={x:town.x,y:town.y+2};s=tickVillage(s,0,1000);const defs=activeVillageDefinitions(s.village,room).filter(d=>d.settlement===0);expect(defs.length).toBeGreaterThan(0);const before=new Map(defs.map(d=>[d.id,{...s.village!.people[d.id]}]));
 for(let t=0;t<90000;t+=50)s=tickVillage(s,50,1000+t);
 for(const d of defs){const c=s.village!.people[d.id];expect(pilotWalkable(c,true,.2,room),d.id).toBe(true);expect(c.cycle>before.get(d.id)!.cycle||c.stock>before.get(d.id)!.stock,d.id).toBe(true);}
});
it('relocates old Chapter4 residents once without losing stock or earned progress',()=>{
 let s=createCombatState(34);s=tickVillage(s,0,1000);const d=activeVillageDefinitions(s.village,34)[0];s.village!.people[d.id].stock=7;s.village!.coins=99;const raw=combatSnapshot(s);raw.village!.layoutVersion=2 as never;raw.village!.people[d.id].x=1000;const r=readCombatState(raw);if(!r.supported)throw Error();expect(r.state.village!.coins).toBe(99);expect(r.state.village!.people[d.id].stock).toBe(7);expect(pilotWalkable(r.state.village!.people[d.id],true,.2,34)).toBe(true);expect(r.state.village!.layoutVersion).toBe(3);
});
it('selects a separate calm medieval suspense ambience inside the castle only',()=>{expect(explorationAmbience(4,true)).toBe(CASTLE_AMBIENCE);expect(explorationAmbience(4,false)).toBe(CHAPTER_AMBIENCE[3]);expect(CASTLE_AMBIENCE.notes.every(n=>n<250)).toBe(true);});

it('walks up and down every compact stair and across the supported upper landing',()=>{
 for(let room=30;room<40;room++)for(const e of nascentesElevations(room)){
  const base=plateauStairBase(e),top=plateauStairTop(e),floor={x:e.left+.34*e.size,y:e.top+.715*e.size};let p={...base};
  for(const goal of [top,floor,top,base]){let budget=200;while(Math.hypot(p.x-goal.x,p.y-goal.y)>.01&&budget-->0){const d=Math.hypot(p.x-goal.x,p.y-goal.y),step=Math.min(.06,d),next=moveCombatPoint(p,(goal.x-p.x)/d*step,(goal.y-p.y)/d*step,true,.22,room);expect(Math.hypot(next.x-p.x,next.y-p.y),`room ${room+1} staircase seam`).toBeGreaterThan(.00001);p=next;}expect(budget,`room ${room+1}`).toBeGreaterThan(0);}
 }
});

it('reserves staircase walking surfaces from mineral deposits',()=>{for(let room=30;room<40;room++)for(const n of resourceNodes(room))expect(nascentesGeometry(room).some(g=>touchesRegion(n,1.2,g.stairs)),`room ${room+1}: ${n.id}`).toBe(false);});
