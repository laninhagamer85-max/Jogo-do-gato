import {NASCENTES_SCENE,NASCENTES_WATER,nascentesPoint} from './explorationChapter4';
import type {GroundPoint} from './biomeComposition';
function trace(ctx:CanvasRenderingContext2D,poly:readonly GroundPoint[]){ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
export function nascentesView(width:number,height:number,player:GroundPoint,zoom=1,overview=false){
 const s=NASCENTES_SCENE;if(overview){const tile=Math.min(width/s.width,height/s.height);return {tile,left:width/2-(s.left+s.width/2)*tile,top:height*(height>width?.61:.5)-(s.top+s.height/2)*tile};}
 const tile=Math.max(46,width/15,height/12,width/s.width,height/s.height)*zoom;
 return {tile,left:Math.max(width-(s.left+s.width)*tile,Math.min(-s.left*tile,width/2-player.x*tile)),top:Math.max(height-(s.top+s.height)*tile,Math.min(-s.top*tile,height*.46-player.y*tile))};
}
export const nascentesOverview=(width:number,height:number)=>nascentesView(width,height,{x:0,y:0},1,true);
/** Authored scene chunks share a single uniform world projection; only visible patches are emitted. */
export function drawNascentesTerrain(ctx:CanvasRenderingContext2D,width:number,height:number,left:number,top:number,tile:number,scene:HTMLImageElement|undefined,_items?:HTMLImageElement,open=false,_stairs?:HTMLImageElement,_bank?:HTMLImageElement,_props?:HTMLImageElement,time=0,reduced=true,portal?:HTMLImageElement){
 if(!scene?.complete||!scene.naturalWidth)return;
 const s=NASCENTES_SCENE,dx=left+s.left*tile,dy=top+s.top*tile,dw=s.width*tile,dh=s.height*tile;
 // Full-map letterboxing uses the same wooded artwork, never a dark circular field.
 if(dx>0||dy>0||dx+dw<width||dy+dh<height){const scale=Math.max(width/scene.naturalWidth,height/scene.naturalHeight);ctx.save();ctx.filter='blur(18px)';ctx.drawImage(scene,(width-scene.naturalWidth*scale)/2,(height-scene.naturalHeight*scale)/2,scene.naturalWidth*scale,scene.naturalHeight*scale);ctx.restore();}
 const cols=6,rows=4;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const px=dx+x*dw/cols,py=dy+y*dh/rows,w=dw/cols,h=dh/rows;if(px+w<0||py+h<0||px>width||py>height)continue;
  const sx=x*scene.naturalWidth/cols,sy=y*scene.naturalHeight/rows;ctx.drawImage(scene,sx,sy,scene.naturalWidth/cols,scene.naturalHeight/rows,px,py,w+.01,h+.01);
 }
 ctx.save();ctx.translate(left,top);ctx.scale(tile,tile);
 if(!reduced){
  for(const water of NASCENTES_WATER){const center=water.reduce((a,p)=>({x:a.x+p.x/water.length,y:a.y+p.y/water.length}),{x:0,y:0});ctx.save();trace(ctx,water.map(p=>({x:center.x+(p.x-center.x)*.96,y:center.y+(p.y-center.y)*.96})));ctx.clip();ctx.globalAlpha=.26;const drift=Math.sin(time/1300)*.016;ctx.drawImage(scene,s.left+drift,s.top,s.width,s.height);ctx.restore();}
  const fall=[[.347,.215],[.365,.215],[.365,.290],[.347,.290]].map(([u,v])=>nascentesPoint(u,v));ctx.save();trace(ctx,fall);ctx.clip();ctx.globalAlpha=.22;ctx.drawImage(scene,s.left,s.top+(time%500)/500*.035,s.width,s.height);ctx.restore();
 }
 // The empty stone arch belongs to the static composition; its vortex is a separate painted layer.
 if(portal?.complete&&portal.naturalWidth){const center=nascentesPoint(.928,.16);ctx.save();ctx.beginPath();ctx.ellipse(center.x,center.y,s.width*.022,s.height*.063,-.08,0,Math.PI*2);ctx.clip();ctx.globalAlpha=open?(reduced?1:.92+Math.sin(time/500)*.08):.10;ctx.drawImage(portal,s.left,s.top,s.width,s.height);ctx.restore();}
 ctx.restore();
}
/** Physical, painted pickups; the slab is an interactive object rather than a UI icon. */
export function drawNascentesItem(ctx:CanvasRenderingContext2D,atlas:HTMLImageElement|undefined,index:number,x:number,y:number,tile:number,width=.48){
 if(!atlas?.complete||!atlas.naturalWidth)return;
 const crops=[[74,166,440,547],[111,182,438,531],[98,190,430,515],[66,192,434,536]],b=crops[index],cw=atlas.naturalWidth/4,sw=b[2]-b[0],sh=b[3]-b[1],w=tile*width,h=w*sh/sw;ctx.drawImage(atlas,index*cw+b[0],b[1],sw,sh,x-w/2,y-h*.75,w,h);
}
