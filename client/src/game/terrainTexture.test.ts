import {describe,it,expect,vi} from 'vitest';
import {GRASS_MATERIAL,terrainPatch,terrainPatches,terrainBufferPlan,drawTerrainTexture} from './terrainTexture';
describe('biome terrain texture scale and blending',()=>{
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
 it('plans native-density mobile buffers at all supported zooms with a memory ceiling',()=>{
  for(const zoom of [1,1.25,1.5,1.75,2]){const tile=844/9*zoom,p=terrainBufferPlan(390,844,0,0,tile,2.625);expect(p.pixelsPerUnit).toBeCloseTo(tile*2.625);expect(p.width*p.height*p.pixelsPerUnit**2).toBeLessThanOrEqual(8_000_001);}
 });
 it('reuses a stable buffer for small camera movements and refreshes on zoom or biome image change',()=>{
  let created=0;vi.stubGlobal('document',{createElement:()=>{created++;return {width:0,height:0,getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop:()=>{}})},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}})};}});
  const ctx={getTransform:()=>({a:2}),drawImage:()=>{}} as unknown as CanvasRenderingContext2D;
  const image={complete:true,naturalWidth:1254,naturalHeight:1254} as HTMLImageElement;
  try{
   expect(drawTerrainTexture(ctx,390,844,image,0,0,100)).toBe(true);expect(created).toBe(2);
   drawTerrainTexture(ctx,390,844,image,-10,-10,100);expect(created).toBe(2);
   drawTerrainTexture(ctx,390,844,image,-10,-10,200);expect(created).toBe(3);
   drawTerrainTexture(ctx,390,844,{...image} as HTMLImageElement,-10,-10,200);expect(created).toBe(5);
  }finally{vi.unstubAllGlobals();}
 });
});
