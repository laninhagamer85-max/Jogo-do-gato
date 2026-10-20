import {NASCENTES_PLATEAU,NASCENTES_FACES,NASCENTES_RAMP,NASCENTES_COMPOSITION} from './explorationChapter4';
import {regionBounds,type GroundPoint} from './biomeComposition';
import {drawWoodlandProp} from './explorationScenery';
import {drawGardenPatch} from './forestNature';
function trace(ctx:CanvasRenderingContext2D,poly:readonly GroundPoint[]){ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
type Bounds={left:number;top:number;right:number;bottom:number};
/** Small world-anchored materials, culled to surface and viewport. */
function material(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,poly:readonly GroundPoint[],span:number,bounds:Bounds,fallback:string){
 const b=regionBounds(poly),clip={left:Math.max(bounds.left,b.left),top:Math.max(bounds.top,b.top),right:Math.min(bounds.right,b.right),bottom:Math.min(bounds.bottom,b.bottom)};
 if(clip.left>clip.right||clip.top>clip.bottom)return;
 ctx.save();trace(ctx,poly);ctx.fillStyle=fallback;ctx.fill();ctx.clip();
 if(image?.complete&&image.naturalWidth){const spanY=span*image.naturalHeight/image.naturalWidth;for(let y=Math.floor(clip.top/spanY);y<Math.ceil(clip.bottom/spanY);y++)for(let x=Math.floor(clip.left/span);x<Math.ceil(clip.right/span);x++)ctx.drawImage(image,x*span,y*spanY,span+.003,spanY+.003);}
 ctx.restore();
}
const waterRegions=NASCENTES_COMPOSITION.regions.filter(r=>r.material==='water');
/** Raster ledges retain their aspect and authored light direction. */
function ledge(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,x:number,y:number,width:number){
 if(!image?.complete||!image.naturalWidth)return;
 const h=width*662/2138;ctx.drawImage(image,15,20,2138,662,x-width/2,y-h*.32,width,h);
}
export function drawNascentesTerrain(ctx:CanvasRenderingContext2D,width:number,height:number,left:number,top:number,tile:number,grass:HTMLImageElement|undefined,stone:HTMLImageElement|undefined,open:boolean,stairs?:HTMLImageElement,bank?:HTMLImageElement,props?:HTMLImageElement){
 const bounds={left:-left/tile,top:-top/tile,right:(width-left)/tile,bottom:(height-top)/tile};
 ctx.save();ctx.translate(left,top);ctx.scale(tile,tile);
 material(ctx,grass,[{x:bounds.left,y:bounds.top},{x:bounds.right,y:bounds.top},{x:bounds.right,y:bounds.bottom},{x:bounds.left,y:bounds.bottom}],4.6,bounds,'#72a94a');
 // The playable land mass reads separately from textured forest overscan.
 ctx.save();ctx.beginPath();ctx.rect(bounds.left,bounds.top,bounds.right-bounds.left,bounds.bottom-bounds.top);ctx.ellipse(7,5,15,12,0,0,Math.PI*2);ctx.fillStyle='rgba(12,35,28,.68)';ctx.fill('evenodd');ctx.restore();
 // Painted outcrops mark the front edge without adding collision walls.
 for(let i=0;i<15;i++){const a=.12+i*Math.PI/16,x=7+14.5*Math.cos(a),y=5+11.65*Math.sin(a);if(x+2>bounds.left&&x-2<bounds.right&&y+2>bounds.top&&y-2<bounds.bottom)ledge(ctx,bank,x,y,2.6+(i%3)*.18);}
 for(const face of NASCENTES_FACES){material(ctx,stone,face,4.6,bounds,'#8a9581');trace(ctx,face);ctx.fillStyle='rgba(25,48,35,.22)';ctx.fill();}
 // Grass continues across upper ground instead of a rectangular paved slab.
 material(ctx,grass,NASCENTES_PLATEAU,4.6,bounds,'#79a54c');
 for(let i=0;i<NASCENTES_PLATEAU.length;i++){
  const a=NASCENTES_PLATEAU[i],b=NASCENTES_PLATEAU[(i+1)%NASCENTES_PLATEAU.length];if(b.x>=a.x)continue;
  const vertical=Math.abs(b.y-a.y)>Math.abs(b.x-a.x)*1.2,distance=Math.hypot(b.x-a.x,b.y-a.y),count=Math.ceil(distance/(vertical?.75:1.5));
  for(let j=0;j<count;j++){const f=(j+.5)/count,x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f;
   if(vertical&&props)drawWoodlandProp(ctx,props,0,x,y+.5,1,{width:1.65+(j%2)*.12,height:1.28},true);
   else ledge(ctx,bank,x,y,2.8+(j%2)*.15);
  }
 }
 for(const [i,[x,y]] of [[1.5,2.5],[1.9,3.4],[2.3,4.4],[3.2,5.3],[4.3,5.4],[5.3,5.5],[10.8,5.6],[11.6,6.1],[12.2,7.0],[13.1,7.8],[14.2,8.5],[15.2,9.0]].entries()){
  const poly=Array.from({length:7},(_,j)=>{const angle=j/7*Math.PI*2,r=.3+(j+i)%3*.05;return {x:x+Math.cos(angle)*r,y:y+Math.sin(angle)*r*.75};});material(ctx,stone,poly,4.6,bounds,'#c5c3a0');
 }
 // Keep grassy banks exposed between painted stones, avoiding a paved pool rim.
 const r=NASCENTES_RAMP;
 if(stairs?.complete&&stairs.naturalWidth){const w=r.width+.6,h=w*833/1750;ctx.save();ctx.globalAlpha=open?1:.65;ctx.drawImage(stairs,13,24,1750,833,r.x-.3,r.y+r.height/2-h/2,w,h);ctx.restore();}
 ctx.restore();
}
/** Water animation, collision and shoreline art follow the same contour. */
export function drawNascentesShore(ctx:CanvasRenderingContext2D,left:number,top:number,tile:number,bank?:HTMLImageElement,props?:HTMLImageElement,garden?:HTMLImageElement){
 ctx.save();ctx.translate(left,top);ctx.scale(tile,tile);
 for(const [pond,region] of waterRegions.entries()){
  const poly=region.polygon;
  for(let i=0;i<poly.length;i+=8){const p=poly[i];
   if(i%24===0)ledge(ctx,bank,p.x,p.y+.04,1.0+(pond%2)*.16);
   else if(props)drawWoodlandProp(ctx,props,0,p.x,p.y,1,{width:.42+(i%3)*.03,height:.31},true);
   if(garden&&i%24===8){const b=regionBounds(poly),cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2,x=cx+(p.x-cx)*1.22,y=cy+(p.y-cy)*1.28;drawGardenPatch(ctx,garden,{x,y,index:pond%2?3:1,width:.54,height:.38,blocking:false},x,y,1,0,true);}
  }
 }
 ctx.restore();
}
/** Fit land mass and rock edge, retaining the same north-up world on phones. */
export function nascentesOverview(width:number,height:number){const tile=Math.max(1,Math.min((width-24)/31,(height-24)/26));return {tile,left:width/2-7*tile,top:height/2-5.5*tile};}
