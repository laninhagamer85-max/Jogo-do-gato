import {drawTerrainTexture,GRASS_MATERIAL} from "./terrainTexture";
import {PILOT_BIOME} from './biomeComposition';
import {drawBiomeStatic} from './biomeCompositionView';
/** Quiet terrain: small world-anchored texture patches with blended borders. */
export type GroundTheme = { id:string; seed:number; base:string; light:string; shade:string };
export const FOREST_GROUND:GroundTheme={id:'grass-block-v7',seed:5102026,base:'#638b36',light:'#a3bd65',shade:'#4d742d'};
export const GROUND_WORLD={left:-8,top:-11,width:30,height:32,pixelsPerTile:36};
const PILOT_STATIC_GROUND={id:PILOT_BIOME.id,draw:(ctx:CanvasRenderingContext2D,bounds:import('./terrainTexture').TerrainBounds)=>drawBiomeStatic(ctx,bounds,PILOT_BIOME)};
export function groundVariations(seed:number){
  let value=seed>>>0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  return Array.from({length:18},()=>({x:random(),y:random(),radius:.07+random()*.12,light:random()>.5}));
}
/** Material parameters can be reused with the grass, soil, sand and snow assets of future biomes. */
export function drawExplorationGround(ctx:CanvasRenderingContext2D,width:number,height:number,image:HTMLImageElement,left:number,top:number,tile:number,theme:GroundTheme=FOREST_GROUND,pilotComposition=false){
  if(!drawTerrainTexture(ctx,width,height,image,left,top,tile,{...GRASS_MATERIAL,id:theme.id,seed:theme.seed},pilotComposition?PILOT_STATIC_GROUND:undefined)){
    ctx.fillStyle=theme.base;ctx.fillRect(0,0,width,height);
  }
}
/** Centered source crop preserves the original artwork proportions. */
export function chapterGroundCrop(width:number,height:number,aspect=14/10){
  if(width/height>aspect){const w=height*aspect;return {x:(width-w)/2,y:0,width:w,height};}
  const h=width/aspect;return {x:0,y:(height-h)/2,width,height:h};
}
/** Atlas content bounds measured on the original transparent artwork, not its empty square cells. */
const PROP_BOUNDS = [[20,150,512,477],[0,130,512,481],[0,212,496,458],[30,39,509,425],[13,99,512,405],[0,12,411,430]];
export function woodlandPropPlacement(index:number,x:number,y:number,tile:number,size={width:1.28,height:1.28}) {
  const [l,t,r,b]=PROP_BOUNDS[index]??PROP_BOUNDS[0];
  const scale=Math.min(tile*size.width/(r-l),tile*size.height/(b-t));
  const width=(r-l)*scale,height=(b-t)*scale;
  return {sx:(index%3)*512+l,sy:Math.floor(index/3)*512+t,sw:r-l,sh:b-t,x:x-width/2,y:y-height,width,height};
}
export function drawWoodlandProp(ctx:CanvasRenderingContext2D,image:HTMLImageElement,index:number,x:number,y:number,tile:number,size?:{width:number;height:number}){
  if(!image.complete||!image.naturalWidth)return;
  const p=woodlandPropPlacement(index,x,y,tile,size),sx=image.naturalWidth/1536,sy=image.naturalHeight/1024;
  ctx.drawImage(image,p.sx*sx,p.sy*sy,p.sw*sx,p.sh*sy,p.x,p.y,p.width,p.height);
}
/** Hash each world cell, never the viewport: details remain fixed during movement and rotation. */
export function grassTufts(cellX:number,cellY:number,seed:number){
  let state=(Math.imul(cellX,73856093)^Math.imul(cellY,19349663)^seed)>>>0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  return Array.from({length:5},()=>({x:cellX+random(),y:cellY+random(),height:.045+random()*.055,lean:(random()-.5)*.1,tone:Math.floor(random()*4)}));
}
