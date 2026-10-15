import {describe,it,expect,vi} from 'vitest';
import {PILOT_BIOME,biomeBlocks,insideRegion,pondComposition,touchesRegion} from './biomeComposition';
import {PILOT_CAMP,PILOT_NODES,PILOT_ENEMIES,PILOT_MARKER,PILOT_EXIT,pilotRoute,clearPilotWalkLine,pilotWalkable,createCombatState,readCombatState,stepCombat} from './explorationCombat';
import {drawBiomeStatic,drawBiomeWater} from './biomeCompositionView';
import {drawExplorationGround} from './explorationScenery';
import {combatView} from './explorationCombatView';

describe('layered clearing composition and shared shoreline',()=>{
  const water=PILOT_BIOME.regions.find(r=>r.material==='water')!;
  it('places a reusable pond in world space without mutating its source module',()=>{
    const a=pondComposition('a',{x:0,y:0}),b=pondComposition('b',{x:4,y:3},2);
    a.regions.forEach((r,i)=>r.polygon.forEach((p,j)=>{expect(b.regions[i].polygon[j].x).toBeCloseTo(4+p.x*2);expect(b.regions[i].polygon[j].y).toBeCloseTo(3+p.y*2);}));
    a.props!.forEach((p,i)=>{expect(b.props![i].x).toBeCloseTo(4+p.x*2);expect(b.props![i].y).toBeCloseTo(3+p.y*2);expect(b.props![i].width).toBeCloseTo(p.width*2);});
    expect(a).toEqual(pondComposition('a',{x:0,y:0}));
  });
  it('blocks the visible water and its contact edge while keeping dry sand walkable',()=>{
    expect(biomeBlocks({x:8.6,y:7.65},0)).toBe(true);
    for(const p of water.polygon){expect(touchesRegion(p,0,water.polygon)).toBe(true);expect(pilotWalkable(p,true,0)).toBe(false);}
    const sand=PILOT_BIOME.regions.find(r=>r.material==='sand')!;
    expect(sand.polygon.some(p=>!biomeBlocks(p,.22)&&pilotWalkable(p,true))).toBe(true);
    expect(insideRegion(PILOT_CAMP,water.polygon)).toBe(false);
  });
  it('keeps all objectives and encounters reachable without cutting shore corners',()=>{
    for(const target of [...PILOT_NODES,...PILOT_ENEMIES,PILOT_MARKER,PILOT_EXIT]){
      expect(pilotWalkable(target,true)).toBe(true);
      const route=pilotRoute(PILOT_CAMP,target,true);expect(route.length).toBeGreaterThan(0);
      route.forEach((p,i)=>expect(clearPilotWalkLine(i?route[i-1]:PILOT_CAMP,p,true)).toBe(true));
    }
    const route=pilotRoute({x:6.5,y:7.5},{x:11.5,y:7.5},true);
    expect(route.length).toBeGreaterThan(5);route.forEach((p,i)=>expect(clearPilotWalkLine(i?route[i-1]:{x:6.5,y:7.5},p,true)).toBe(true));
    expect(pilotRoute(PILOT_CAMP,{x:8.6,y:7.65},true)).toEqual([]);
  });
  it('prevents continuous movement from entering water without taking damage',()=>{
    let s=createCombatState();s.player={x:6.5,y:7.5};s.enemies=[];s.gateOpen=true;
    for(let i=0;i<80;i++){s=stepCombat(s,{dx:1},50);expect(biomeBlocks(s.player,.22)).toBe(false);}
    expect(s.player.x).toBeLessThan(8);expect(s.hp).toBe(100);expect(s.deaths).toBe(0);
  });
  it('relocates old saves and drops covered by the new lake without losing progress',()=>{
    const s=createCombatState();s.player={x:8.6,y:7.65};s.hp=73;s.xp=120;s.bag.fibra=9;s.stock.ambar=4;s.equipmentOwned=true;
    s.enemies[0]={...s.enemies[0],hp:0,x:8.6,y:7.65};s.loot=[{id:'beetle:0',x:8.6,y:7.65,item:'fibra',quantity:3}];
    const parsed=readCombatState(s);expect(parsed.supported).toBe(true);if(!parsed.supported)return;
    const a=parsed.state;expect(pilotWalkable(a.player,false)).toBe(true);expect(pilotWalkable(a.loot[0],false)).toBe(true);
    expect(a.hp).toBe(73);expect(a.xp).toBe(120);expect(a.bag).toEqual(s.bag);expect(a.stock).toEqual(s.stock);expect(a.equipmentOwned).toBe(true);expect(a.deaths).toBe(0);expect(a.loot[0].quantity).toBe(3);
  });
});

function recordingContext(){
  const commands:unknown[][]=[];
  const ctx=new Proxy({createLinearGradient:()=>({addColorStop:()=>{}}),getTransform:()=>({a:2})}, {
    get:(target,key)=>key in target?target[key as keyof typeof target]:(...args:unknown[])=>commands.push([key,...args]),
    set:()=>true,
  }) as unknown as CanvasRenderingContext2D;
  return {ctx,commands};
}
describe('composition draw commands and cache (not browser rendering)',()=>{
  it('draws the authored collision polygon as the water contour',()=>{
    const {ctx,commands}=recordingContext(),water=PILOT_BIOME.regions.find(r=>r.material==='water')!;
    drawBiomeStatic(ctx,{left:0,top:0,width:14,height:10},{id:'water-only',regions:[water]});
    const start=commands.findIndex(c=>c[0]==='moveTo');
    const contour=commands.slice(start,start+water.polygon.length);
    expect(contour.map(c=>({x:c[1],y:c[2]}))).toEqual(water.polygon);
  });
  it('animates only water highlights and holds them still with reduced motion',()=>{
    const draw=(time:number,reduced:boolean)=>{const {ctx,commands}=recordingContext();drawBiomeWater(ctx,PILOT_BIOME,0,0,100,time,reduced);return commands;};
    expect(draw(0,false)).not.toEqual(draw(2000,false));expect(draw(0,true)).toEqual(draw(2000,true));
    expect(draw(1000,false)).toEqual(draw(1000,false));
  });
  it('stores all static materials together and does not recreate them on every frame',()=>{
    let created=0;
    vi.stubGlobal('document',{createElement:()=>{created++;const {ctx}=recordingContext();return {width:0,height:0,getContext:()=>ctx};}});
    try{
      const {ctx}=recordingContext();
      const image={complete:true,naturalWidth:1254,naturalHeight:1254} as HTMLImageElement;
      for(let frame=0;frame<10;frame++)drawExplorationGround(ctx,390,844,image,-frame,-frame,100,undefined,true);
      expect(created).toBe(2); // one feathered source and one combined visible surface
      drawExplorationGround(ctx,390,844,image,-9,-9,100,undefined,false);expect(created).toBe(3);
    }finally{vi.unstubAllGlobals();}
  });
  it('covers all five formats and four map corners with one bounded combined buffer',()=>{
    vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>recordingContext().ctx})});
    try{
      const image={complete:true,naturalWidth:1254,naturalHeight:1254} as HTMLImageElement;
      for(const [w,h] of [[375,667],[375,812],[390,844],[844,390],[1366,768]])for(const zoom of [1,2])for(const overview of [false,true])for(const p of [{x:1.22,y:1.22},{x:12.78,y:1.22},{x:1.22,y:8.78},{x:12.78,y:8.78}]){
        const {ctx,commands}=recordingContext(),v=combatView(w,h,p,zoom,overview);
        drawExplorationGround(ctx,w,h,image,v.left,v.top,v.tile,undefined,true);
        const draws=commands.filter(c=>c[0]==='drawImage');expect(draws).toHaveLength(1);
        const [buffer,x,y,width,height]=draws[0].slice(1) as [HTMLCanvasElement,number,number,number,number];
        expect(x).toBeLessThanOrEqual(.00001);expect(y).toBeLessThanOrEqual(.00001);expect(x+width).toBeGreaterThanOrEqual(w-.00001);expect(y+height).toBeGreaterThanOrEqual(h-.00001);
        expect(buffer.width*buffer.height).toBeLessThanOrEqual(8_010_000);
      }
    }finally{vi.unstubAllGlobals();}
  });
});
