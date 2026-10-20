import {NASCENTES_PLATEAU,NASCENTES_FACES,NASCENTES_RAMP} from './explorationChapter4';
import {organicOutline,type GroundPoint} from './biomeComposition';
function trace(ctx:CanvasRenderingContext2D,poly:readonly GroundPoint[]){ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
/** Repeat small original material plates in WORLD units; never stretch a scene image. */
function material(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,poly:readonly GroundPoint[],span:number,bounds:{left:number;top:number;right:number;bottom:number},fallback:string){
 ctx.save();trace(ctx,poly);ctx.fillStyle=fallback;ctx.fill();ctx.clip();
 if(image?.complete&&image.naturalWidth){const spanY=span*image.naturalHeight/image.naturalWidth;for(let y=Math.floor(bounds.top/spanY);y<=Math.ceil(bounds.bottom/spanY);y++)for(let x=Math.floor(bounds.left/span);x<=Math.ceil(bounds.right/span);x++)ctx.drawImage(image,x*span,y*spanY,span+.003,spanY+.003);}
 ctx.restore();
}
export function drawNascentesTerrain(ctx:CanvasRenderingContext2D,width:number,height:number,left:number,top:number,tile:number,grass:HTMLImageElement|undefined,stone:HTMLImageElement|undefined,open:boolean,bridge?:HTMLImageElement,cliff?:HTMLImageElement){
 const bounds={left:-left/tile,top:-top/tile,right:(width-left)/tile,bottom:(height-top)/tile};
 ctx.save();ctx.translate(left,top);ctx.scale(tile,tile);
 material(ctx,grass,[{x:bounds.left,y:bounds.top},{x:bounds.right,y:bounds.top},{x:bounds.right,y:bounds.bottom},{x:bounds.left,y:bounds.bottom}],4.6,bounds,'#72a94a');
 // Quiet broken-stone trail connects spawn, collection loop and the ramp.
 for(const [i,center] of [[1.5,2.5],[1.9,3.4],[2.3,4.4],[3.2,5.3],[4.3,5.4],[5.3,5.5]].entries()){
  const [x,y]=center,poly=Array.from({length:7},(_,j)=>{const angle=j/7*Math.PI*2,r=.36+(j+i)%3*.055;return {x:x+Math.cos(angle)*r,y:y+Math.sin(angle)*r*.75};});
  trace(ctx,poly);ctx.strokeStyle='#426c3970';ctx.lineWidth=.09;ctx.stroke();material(ctx,stone,poly,4.6,bounds,'#c5c3a0');
 }
 for(const face of NASCENTES_FACES){material(ctx,cliff??stone,face,3.6,bounds,'#8a9581');trace(ctx,face);ctx.fillStyle='rgba(25,48,35,.35)';ctx.fill();ctx.strokeStyle='#4f6949';ctx.lineWidth=.08;ctx.stroke();}
 material(ctx,stone,NASCENTES_PLATEAU,4.6,bounds,'#cbcbb0');
 trace(ctx,NASCENTES_PLATEAU);ctx.strokeStyle='#6d974c';ctx.lineWidth=.14;ctx.lineJoin='round';ctx.stroke();
 // Small grass islands soften the terrace while leaving room for navigation.
 for(const [x,y,r] of [[11.4,1.3,1.0],[16.6,3.2,1.3],[12,8.5,.7]]){ctx.save();trace(ctx,organicOutline(Array.from({length:7},(_,i)=>({x:x+Math.cos(i/7*Math.PI*2)*r*(.8+(i%3)*.12),y:y+Math.sin(i/7*Math.PI*2)*r*.65})),4));ctx.clip();material(ctx,grass,NASCENTES_PLATEAU,4.6,bounds,'#79a54c');ctx.restore();}
 const r=NASCENTES_RAMP,deck=[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}];
 material(ctx,stone,deck,4.6,bounds,'#bdc3a3');
 if(bridge?.complete&&bridge.naturalWidth){ctx.save();ctx.globalAlpha=open?.95:.18;const h=r.width*bridge.naturalHeight/bridge.naturalWidth;ctx.drawImage(bridge,r.x,r.y+r.height/2-h/2,r.width,h);ctx.restore();}
 ctx.strokeStyle='#647c51';ctx.lineWidth=.06;for(let i=1;i<8;i++){const x=r.x+i*.5;ctx.beginPath();ctx.moveTo(x,r.y+.08);ctx.lineTo(x,r.y+r.height-.08);ctx.stroke();}
 ctx.restore();
}

export function nascentesOverview(width:number,height:number){const tile=Math.max(1,Math.min((width-24)/30,(height-24)/24));return {tile,left:(width-30*tile)/2+8*tile,top:(height-24*tile)/2+7*tile};}
