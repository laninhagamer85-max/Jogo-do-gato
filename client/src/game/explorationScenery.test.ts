import {describe,it,expect,vi} from 'vitest';
import { groundVariations,GROUND_WORLD,FOREST_GRASS_MATERIAL } from './explorationScenery';
import {terrainPatch} from './terrainTexture';
import {combatView,combatCanvasScale,drawCombatPilot} from './explorationCombatView';
import {createCombatState,PILOT_INSECT} from './explorationCombat';
describe('non repeating woodland ground',()=>{
  it('covers the floor with opaque cores at the enlarged chapter-one brush scale',()=>{
    const m=FOREST_GRASS_MATERIAL;
    for(let y=-4;y<4;y+=.13)for(let x=-4;x<4;x+=.13){
      const p=terrainPatch(Math.floor(x/m.step),Math.floor(y/m.step),m),half=p.span*(.5-m.feather);
      expect(Math.abs(x-p.x)).toBeLessThan(half);expect(Math.abs(y-p.y)).toBeLessThan(half);
    }
  });
  it('renders both smaller insect sprites with uniform scale and grounded feet',()=>{
    const calls:unknown[][]=[];
    const ctx=new Proxy({drawImage:(...args:unknown[])=>calls.push(args),measureText:()=>({width:20}),createRadialGradient:()=>({addColorStop:()=>{}})},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}}) as unknown as CanvasRenderingContext2D;
    const unloaded={complete:false,naturalWidth:0} as HTMLImageElement;
    const insects={complete:true,naturalWidth:1024,naturalHeight:512} as HTMLImageElement;
    const state=createCombatState(),v=combatView(390,844,state.player);
    drawCombatPilot(ctx,390,844,state,unloaded,unloaded,unloaded,1,false,true,insects);
    const sprites=calls.filter(c=>c[0]===insects);expect(sprites).toHaveLength(2);
    for(const c of sprites){
      const [,sx,sy,sw,sh,dx,dy,dw,dh]=c as number[];
      expect(dw).toBeCloseTo(v.tile*PILOT_INSECT.width);
      expect(dw/sw).toBeCloseTo(dh/sh);
      expect(dy+dh).toBeCloseTo(v.tile*.07);
    }
  });
  it('preserves the same regional appearance after reload',()=>{expect(groundVariations(123)).toEqual(groundVariations(123));});
  it('allows distinct regional layouts without changing the combat map',()=>{expect(groundVariations(123)).not.toEqual(groundVariations(456));expect(new Set(groundVariations(123).map(v=>`${v.x}:${v.y}`)).size).toBe(18);});
  it.each([[375,667],[375,812],[390,844],[844,390],[1366,768]])('tracks the player beyond the old plane at %i × %i and includes them in the overview',(w,h)=>{
    for(const overview of [false,true])for(const p of [{x:1.5,y:1.5},{x:-60,y:80},{x:100,y:-90}]){const v=combatView(w,h,p,1,overview),x=v.left+p.x*v.tile,y=v.top+p.y*v.tile;expect(x).toBeGreaterThan(0);expect(x).toBeLessThan(w);expect(y).toBeGreaterThan(0);expect(y).toBeLessThan(h);if(!overview){expect(x).toBeCloseTo(w/2);expect(y).toBeCloseTo(h*.46);}}
  });
});

import {woodlandPropPlacement,grassTufts,drawWoodlandProp} from './explorationScenery';
describe('sharp scenery without stretching',()=>{
 it.each([[375,667],[375,812],[390,844],[844,390],[1366,768]])('preserves every prop ratio and ground anchor at %i × %i',(w,h)=>{
  const v=combatView(w,h,{x:6.5,y:4.5});
  for(let index=0;index<6;index++)for(const zoom of [.8,1,1.5]){
   const p=woodlandPropPlacement(index,200,250,v.tile*zoom,{width:3.25,height:1.55});
   expect(p.width/p.height).toBeCloseTo(p.sw/p.sh,10);expect(p.y+p.height).toBeCloseTo(250,10);expect(p.x+p.width/2).toBeCloseTo(200,10);
   expect(p.width).toBeLessThanOrEqual(v.tile*zoom*3.25+.00001);expect(p.height).toBeLessThanOrEqual(v.tile*zoom*1.55+.00001);
  }
 });
 it('draws the actual log crop with uniform source/destination scale',()=>{
  const calls:number[][]=[];const ctx={drawImage:(_image:unknown,...args:number[])=>calls.push(args)} as unknown as CanvasRenderingContext2D;
  drawWoodlandProp(ctx,{complete:true,naturalWidth:1536,naturalHeight:1024} as HTMLImageElement,2,200,250,100,{width:3.25,height:1.55});
  const [sx,sy,sw,sh,dx,dy,dw,dh]=calls[0];expect(sx).toBe(1024);expect(sy).toBe(212);expect(dw/sw).toBeCloseTo(dh/sh,10);expect(dy+dh).toBe(250);
 });
 it('keeps irregular grass anchored to the same world position after reload',()=>{
  expect(grassTufts(5,3,5102026)).toEqual(grassTufts(5,3,5102026));
  const a=grassTufts(5,3,5102026).map(p=>({x:p.x-5,y:p.y-3}));
  const b=grassTufts(6,3,5102026).map(p=>({x:p.x-6,y:p.y-3}));expect(a).not.toEqual(b);
  for(const q of grassTufts(-2,-3,5102026)){expect(q.x).toBeGreaterThanOrEqual(-2);expect(q.x).toBeLessThan(-1);expect(q.height).toBeLessThanOrEqual(.1);}
 });
});

it('matches mobile pixel density and bounds large canvas memory',()=>{expect(combatCanvasScale(390,844,2.625)).toBe(2.625);expect(combatCanvasScale(844,390,2.625)).toBe(2.625);const s=combatCanvasScale(3840,2160,3);expect(3840*2160*s*s).toBeLessThanOrEqual(6000000.01);});

import {chapterGroundCrop} from './explorationScenery';
it('uses one centered chapter crop without stretching or reading outside the source',()=>{
 for(const [w,h] of [[1440,810],[810,1440],[1254,1254]]){
  const p=chapterGroundCrop(w,h);expect(p.width/p.height).toBeCloseTo(1.4,10);expect(p.x).toBeGreaterThanOrEqual(0);expect(p.y).toBeGreaterThanOrEqual(0);expect(p.x+p.width).toBeLessThanOrEqual(w);expect(p.y+p.height).toBeLessThanOrEqual(h);
 }
});

import {drawExplorationGround} from './explorationScenery';
import {terrainCacheStats,TERRAIN_CACHE_PIXELS} from './terrainTexture';
it('paints a fully covered cached terrain at every corner, zoom and overview',()=>{
 vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop:()=>{}})},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}})})});
 try{
 const background={complete:true,naturalWidth:1254,naturalHeight:1254} as HTMLImageElement;
 for(const [w,h] of [[375,667],[375,812],[390,844],[844,390],[1366,768]])for(const player of [{x:1.22,y:1.22},{x:12.78,y:1.22},{x:1.22,y:8.78},{x:12.78,y:8.78}])for(const zoom of [1,1.25,1.5,1.75,2])for(const overview of [false,true]){
  const calls:unknown[][]=[];let fills=0;
  const ctx=new Proxy({getTransform:()=>({a:2}),drawImage:(...args:unknown[])=>calls.push(args),fillRect:()=>fills++},{get:(target,key)=>key in target?target[key as keyof typeof target]:()=>{}}) as unknown as CanvasRenderingContext2D;
  const v=combatView(w,h,player,zoom,overview);drawExplorationGround(ctx,w,h,background,v.left,v.top,v.tile);
  expect(calls.length).toBeGreaterThan(0);expect(fills).toBe(2);
  const rectangles=calls.map(c=>c.slice(-4) as number[]);
  for(let y=.01;y<h;y+=h/10)for(let x=.01;x<w;x+=w/10)expect(rectangles.some(([dx,dy,dw,dh])=>x>=dx-.00001&&y>=dy-.00001&&x<=dx+dw+.00001&&y<=dy+dh+.00001)).toBe(true);
  expect(terrainCacheStats(ctx).pixels).toBeLessThanOrEqual(TERRAIN_CACHE_PIXELS);
 }
 }finally{vi.unstubAllGlobals();}
});


describe('world camera zoom independent of lens',()=>{
  it('enlarges the pet and scenery consistently and preserves touch-to-world coordinates',()=>{
    const player={x:6.5,y:4.5};
    for(const [w,h] of [[375,667],[390,844],[844,390],[1366,768]]){
      const base=combatView(w,h,player,1);
      for(const zoom of [1,1.25,1.5,1.75,2]){
        const v=combatView(w,h,player,zoom);
        expect(v.tile/base.tile).toBeCloseTo(zoom);
        const target={x:player.x+.3,y:player.y+.2};
        const screen={x:v.left+target.x*v.tile,y:v.top+target.y*v.tile};
        expect((screen.x-v.left)/v.tile).toBeCloseTo(target.x);
        expect((screen.y-v.top)/v.tile).toBeCloseTo(target.y);
        expect(v.left+GROUND_WORLD.left*v.tile).toBeLessThanOrEqual(1e-7);
        expect(v.top+GROUND_WORLD.top*v.tile).toBeLessThanOrEqual(1e-7);
        expect(v.left+(GROUND_WORLD.left+GROUND_WORLD.width)*v.tile).toBeGreaterThanOrEqual(w-1e-7);
        expect(v.top+(GROUND_WORLD.top+GROUND_WORLD.height)*v.tile).toBeGreaterThanOrEqual(h-1e-7);
      }
      expect(combatView(w,h,player,2,true)).toEqual(combatView(w,h,player,1,true));
    }
  });
});
