/** Quiet terrain: one unique camera-anchored plane, no repeat or mirrored tiles. */
export type GroundTheme = { id:string; seed:number; base:string; light:string; shade:string };
export const FOREST_GROUND:GroundTheme={id:'unframed-clearing-v6',seed:5102026,base:'#638b36',light:'#a3bd65',shade:'#4d742d'};
export const GROUND_WORLD={left:-8,top:-11,width:30,height:32,pixelsPerTile:36};
export function groundVariations(seed:number){
  let value=seed>>>0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  return Array.from({length:18},()=>({x:random(),y:random(),radius:.07+random()*.12,light:random()>.5}));
}
/** A single opaque floor covers the complete camera domain: no masked rectangle or tiled backdrop. */
export function drawExplorationGround(ctx:CanvasRenderingContext2D,width:number,height:number,image:HTMLImageElement,left:number,top:number,tile:number,theme:GroundTheme=FOREST_GROUND){
  if(!image.complete||!image.naturalWidth){ctx.fillStyle=theme.base;ctx.fillRect(0,0,width,height);return;}
  const fit=chapterGroundCrop(image.naturalWidth,image.naturalHeight,GROUND_WORLD.width/GROUND_WORLD.height);
  ctx.drawImage(image,fit.x,fit.y,fit.width,fit.height,left+GROUND_WORLD.left*tile,top+GROUND_WORLD.top*tile,GROUND_WORLD.width*tile,GROUND_WORLD.height*tile);
  // Fine low-contrast strokes stay sharp at native canvas density, including zoomed duels.
  const tufts=[];
  for(let y=Math.floor(-top/tile)-1;y<=Math.ceil((height-top)/tile)+1;y++)for(let x=Math.floor(-left/tile)-1;x<=Math.ceil((width-left)/tile)+1;x++)tufts.push(...grassTufts(x,y,theme.seed));
  ctx.save();ctx.globalAlpha=.18;ctx.lineWidth=Math.max(.6,tile*.008);ctx.lineCap='round';
  for(let tone=0;tone<4;tone++){
    ctx.strokeStyle=['#87a83b','#c0d867','#6e9836','#a6c54c'][tone];ctx.beginPath();
    for(const q of tufts)if(q.tone===tone){const x=left+q.x*tile,y=top+q.y*tile;ctx.moveTo(x,y);ctx.quadraticCurveTo(x+q.lean*tile*.2,y-tile*.015,x+q.lean*tile*.4,y-tile*.035);}
    ctx.stroke();
  }ctx.restore();
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
