/** Quiet terrain: one unique camera-anchored plane, no repeat or mirrored tiles. */
export type GroundTheme = { id:string; seed:number; base:string; light:string; shade:string };
export const FOREST_GROUND:GroundTheme={id:'forest-crisp-v4',seed:5102026,base:'#87aa46',light:'#a3bd65',shade:'#688c38'};
export const GROUND_WORLD={left:-10,top:-14,width:34,height:38,pixelsPerTile:36};
export function groundVariations(seed:number){
  let value=seed>>>0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  return Array.from({length:18},()=>({x:random(),y:random(),radius:.07+random()*.12,light:random()>.5}));
}
const groundPlanes=new WeakMap<HTMLImageElement,{key:string;canvas:HTMLCanvasElement}>();
export function drawExplorationGround(ctx:CanvasRenderingContext2D,width:number,height:number,image:HTMLImageElement,left:number,top:number,tile:number,theme:GroundTheme=FOREST_GROUND){
  ctx.fillStyle=theme.base;ctx.fillRect(0,0,width,height);
  if(!image.complete||!image.naturalWidth)return;
  const key=JSON.stringify(theme);let plane=groundPlanes.get(image);
  if(!plane||plane.key!==key){
    const canvas=document.createElement('canvas');canvas.width=GROUND_WORLD.width*GROUND_WORLD.pixelsPerTile;canvas.height=GROUND_WORLD.height*GROUND_WORLD.pixelsPerTile;
    const g=canvas.getContext('2d');if(!g)return;
    g.fillStyle=theme.base;g.fillRect(0,0,canvas.width,canvas.height);
    // Paint the image once over the entire padded world, never in a tile grid.
    g.globalAlpha=.22;g.drawImage(image,0,0,canvas.width,canvas.height);g.globalAlpha=1;
    for(const variation of groundVariations(theme.seed)){
      const x=variation.x*canvas.width,y=variation.y*canvas.height,r=variation.radius*canvas.width;
      const gradient=g.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,variation.light?theme.light:theme.shade);gradient.addColorStop(1,'transparent');
      g.globalAlpha=.05;g.fillStyle=gradient;g.fillRect(x-r,y-r,r*2,r*2);
    }g.globalAlpha=1;plane={key,canvas};groundPlanes.set(image,plane);
  }
  ctx.drawImage(plane.canvas,left+GROUND_WORLD.left*tile,top+GROUND_WORLD.top*tile,GROUND_WORLD.width*tile,GROUND_WORLD.height*tile);
  drawGrassDetail(ctx,width,height,left,top,tile,theme.seed);

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
function drawGrassDetail(ctx:CanvasRenderingContext2D,width:number,height:number,left:number,top:number,tile:number,seed:number){
  // Cull to visible cells and batch all leaves by tone: crisp native canvas paths, four fills/frame.
  const x0=Math.floor(-left/tile)-1,x1=Math.ceil((width-left)/tile)+1;
  const y0=Math.floor(-top/tile)-1,y1=Math.ceil((height-top)/tile)+1;
  const tufts=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tufts.push(...grassTufts(x,y,seed));
  const colors=['#77983c','#96b551','#abc267','#6b8d35'];
  ctx.save();ctx.globalAlpha=.54;
  for(let tone=0;tone<4;tone++){
    ctx.fillStyle=colors[tone];ctx.beginPath();
    for(const q of tufts){if(q.tone!==tone)continue;const x=left+q.x*tile,y=top+q.y*tile,h=q.height*tile;
      for(let blade=-1;blade<=1;blade++){
        const lean=q.lean*tile+blade*h*.48,base=x+blade*h*.11;
        ctx.moveTo(base,y);ctx.quadraticCurveTo(base+lean*.25-h*.11,y-h*.48,base+lean,y-h*(blade===0?1:.72));
        ctx.quadraticCurveTo(base+lean*.2+h*.09,y-h*.3,base+h*.08,y);ctx.closePath();
      }
    }ctx.fill();
  }ctx.restore();
}
