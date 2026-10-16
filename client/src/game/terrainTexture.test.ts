import {describe,it,expect,vi} from 'vitest';
import {GRASS_MATERIAL,terrainPatch,terrainPatches,terrainChunkLayout,terrainCacheStats,TERRAIN_CACHE_PIXELS,drawTerrainTexture} from './terrainTexture';
describe('biome terrain texture scale and blending',()=>{
 it('samples all four atlas cells with stable world variants and crops rather than repeating the entire atlas',()=>{
  const material={...GRASS_MATERIAL,atlasColumns:2,atlasRows:2};
  const patches=terrainPatches({left:-3,top:-3,width:12,height:12},material);
  expect(new Set(patches.map(p=>p.variant)).size).toBe(4);
  expect(terrainPatch(2,4,material)).toEqual(terrainPatch(2,4,material));
  const crops:unknown[][]=[];
  const image={complete:true,naturalWidth:1254,naturalHeight:1254} as HTMLImageElement;
  vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop:()=>{}}),drawImage:(...args:unknown[])=>{if(args[0]===image)crops.push(args);}},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}})})});
  try{drawTerrainTexture({getTransform:()=>({a:1}),drawImage:()=>{}} as unknown as CanvasRenderingContext2D,390,844,image,0,0,100,material);
   expect(crops.map(c=>c.slice(1,5))).toEqual([[0,0,627,627],[627,0,627,627],[0,627,627,627],[627,627,627,627]]);
  }finally{vi.unstubAllGlobals();}
 });
 it('covers every location with an opaque patch core, including negative world coordinates',()=>{
  const m=GRASS_MATERIAL;
  for(let y=-3.6;y<4;y+=.17)for(let x=-3.6;x<4;x+=.17){
   const p=terrainPatch(Math.floor(x/m.step),Math.floor(y/m.step));const half=p.span*(.5-m.feather);
   expect(Math.abs(x-p.x)).toBeLessThan(half);expect(Math.abs(y-p.y)).toBeLessThan(half);
  }
 });
 it('keeps density independent of map size and mixes orientations without a simple alternating pattern',()=>{
  const p=terrainPatches({left:-5,top:-5,width:10,height:10});
  expect(Math.max(...p.map(v=>v.span))).toBeLessThanOrEqual(2.12);expect(new Set(p.map(v=>`${v.turn}:${v.mirror}`)).size).toBe(8);
  expect(terrainPatch(3,5)).toEqual(terrainPatch(3,5));expect(terrainPatch(3,5)).not.toEqual(terrainPatch(4,5));
 });
 it('keeps native density on phones while bounding individual chunk size',()=>{
  for(const zoom of [1,1.25,1.5,1.75,2]){const tile=844/9*zoom,p=terrainChunkLayout(390,844,tile,2.625);expect(p.density).toBeCloseTo(tile*2.625);expect(p.span*p.density).toBeCloseTo(p.size);expect(p.size).toBe(384);}
 });
 it('reuses a stable buffer for small camera movements and refreshes on zoom or biome image change',()=>{
  let created=0;vi.stubGlobal('document',{createElement:()=>{created++;return {width:0,height:0,getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop:()=>{}})},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}})};}});
  const ctx={getTransform:()=>({a:2}),drawImage:()=>{}} as unknown as CanvasRenderingContext2D;
  const image={complete:true,naturalWidth:1254,naturalHeight:1254} as HTMLImageElement;
  try{
   expect(drawTerrainTexture(ctx,390,844,image,-10,-10,100)).toBe(true);const first=created;
   drawTerrainTexture(ctx,390,844,image,-20,-20,100);expect(created).toBe(first);
   drawTerrainTexture(ctx,390,844,image,-20,-20,200);expect(created).toBeGreaterThan(first);const zoomed=created;
   drawTerrainTexture(ctx,390,844,{...image} as HTMLImageElement,-20,-20,200);expect(created).toBeGreaterThan(zoomed);
   expect(terrainCacheStats(ctx).pixels).toBeLessThanOrEqual(TERRAIN_CACHE_PIXELS);
  }finally{vi.unstubAllGlobals();}
 });
 it('reuses world chunks on return, adds only a new edge during scrolling and bounds long journeys',()=>{
  vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop:()=>{}})},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}})})});
  const ctx={getTransform:()=>({a:2}),drawImage:()=>{}} as unknown as CanvasRenderingContext2D;
  const image={complete:true,naturalWidth:1254,naturalHeight:1254} as HTMLImageElement;
  try{
   drawTerrainTexture(ctx,390,844,image,-10,-10,100);const cold=terrainCacheStats(ctx).built;
   drawTerrainTexture(ctx,390,844,image,-210,-10,100);const moved=terrainCacheStats(ctx).built;
   expect(moved-cold).toBeLessThan(cold);
   drawTerrainTexture(ctx,390,844,image,-10,-10,100);expect(terrainCacheStats(ctx).built).toBe(moved);
   for(let x=0;x<5000;x+=150){drawTerrainTexture(ctx,390,844,image,-x,-10,100);expect(terrainCacheStats(ctx).pixels).toBeLessThanOrEqual(TERRAIN_CACHE_PIXELS);}
  }finally{vi.unstubAllGlobals();}
 });
});
