/** Quiet terrain: one unique camera-anchored plane, no repeat or mirrored tiles. */
export type GroundTheme = { id:string; seed:number; base:string; light:string; shade:string };
export const FOREST_GROUND:GroundTheme={id:'forest-soft-v2',seed:5102026,base:'#81ac3c',light:'#a2bf5a',shade:'#709440'};
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
    g.globalAlpha=.56;g.drawImage(image,0,0,canvas.width,canvas.height);g.globalAlpha=1;
    for(const variation of groundVariations(theme.seed)){
      const x=variation.x*canvas.width,y=variation.y*canvas.height,r=variation.radius*canvas.width;
      const gradient=g.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,variation.light?theme.light:theme.shade);gradient.addColorStop(1,'transparent');
      g.globalAlpha=.15;g.fillStyle=gradient;g.fillRect(x-r,y-r,r*2,r*2);
    }g.globalAlpha=1;plane={key,canvas};groundPlanes.set(image,plane);
  }
  ctx.drawImage(plane.canvas,left+GROUND_WORLD.left*tile,top+GROUND_WORLD.top*tile,GROUND_WORLD.width*tile,GROUND_WORLD.height*tile);
}
export function drawWoodlandProp(ctx:CanvasRenderingContext2D,image:HTMLImageElement,index:number,x:number,y:number,tile:number){
  if(!image.complete||!image.naturalWidth)return;
  const cw=image.naturalWidth/3,ch=image.naturalHeight/2;
  ctx.drawImage(image,(index%3)*cw,Math.floor(index/3)*ch,cw,ch,x-tile*.64,y-tile*1.17,tile*1.28,tile*1.28);
}
