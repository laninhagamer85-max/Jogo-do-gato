import {chapterLitAtlas} from './explorationScenery';
import {drawPetSymbol} from './drawPetSymbol';
/** Data-driven ambience. Other biomes need their own art/palette/species, not a copied forest. */
export const FOREST_NATURE={
  id:'woodland-nature-v1',
  ground:{asset:'/forest-adventure/grass-variants-v6.webp',columns:2,rows:2},
  garden:{asset:'/forest-adventure/walkable-garden-v1.webp',columns:3,rows:2,blocking:false},
  rays:[{x:1.4,y:-1.7,dx:3.7,dy:6.5,width:1.1},{x:8.8,y:-1.2,dx:2.7,dy:5.2,width:.65}],
  insects:[{x:3.2,y:2.6,symbol:'🦋',phase:.8},{x:7.2,y:7.8,symbol:'🐝',phase:3.2},{x:11.2,y:5.8,symbol:'🦋',phase:5.4}],
  perches:[{x:5.8,y:3.55,kind:'beetle',phase:1.4},{x:3.5,y:3.62,kind:'beetle',phase:3.6},{x:11.2,y:7.2,kind:'bee',phase:5.2}],
} as const;
export type GardenPatch={x:number;y:number;index:number;width:number;height:number;blocking:false};
/** Bases measured from the generated alpha atlas. No collision is inferred from artwork. */
const BOUNDS=[[28,100,512,464],[34,112,504,486],[10,136,495,487],[24,94,512,432],[9,89,512,429],[10,79,490,429]];
export function gardenPlacement(p:GardenPatch,tile:number,x:number,y:number){
  const [l,t,r,b]=BOUNDS[p.index%6],scale=Math.min(p.width*tile/(r-l),p.height*tile/(b-t));
  return {sx:p.index%3*512+l,sy:Math.floor(p.index/3)*512+t,sw:r-l,sh:b-t,width:(r-l)*scale,height:(b-t)*scale,x:x-(r-l)*scale/2,y:y-(b-t)*scale};
}
export function gardenBreeze(time:number,index:number,reducedMotion:boolean){return reducedMotion?0:Math.sin(time/2600+index*1.71)*.014;}
export function drawGardenPatch(ctx:CanvasRenderingContext2D,image:HTMLImageElement,p:GardenPatch,x:number,y:number,tile:number,time:number,reducedMotion:boolean){
  if(!image.complete||!image.naturalWidth)return;
  const b=gardenPlacement(p,tile,x,y),sx=image.naturalWidth/1536,sy=image.naturalHeight/1024;
  ctx.save();ctx.translate(x,y);ctx.rotate(gardenBreeze(time,p.index+p.x*.43,reducedMotion));
  ctx.drawImage(chapterLitAtlas(image),b.sx*sx,b.sy*sy,b.sw*sx,b.sh*sy,-b.width/2,-b.height,b.width,b.height);ctx.restore();
}
export function ambientInsectPose(time:number,index:number,reducedMotion:boolean){
  const insect=FOREST_NATURE.insects[index],t=reducedMotion?0:time/1000;
  return {x:insect.x+Math.cos(t*.22+insect.phase)*.65,y:insect.y+Math.sin(t*.31+insect.phase)*.38,wing:reducedMotion?1:.82+.18*Math.cos(t*4+insect.phase)};
}
export function ambientPerchPose(time:number,index:number,reducedMotion:boolean){
  const p=FOREST_NATURE.perches[index],t=reducedMotion?0:time/1000;
  return {x:p.x+Math.sin(t*.38+p.phase)*.035,y:p.y+Math.cos(t*.29+p.phase)*.012};
}
/** Draw after solid props so tiny ambient insects can rest ON logs/stumps, without combat entities. */
export function drawForestPerches(ctx:CanvasRenderingContext2D,left:number,top:number,tile:number,time:number,reducedMotion:boolean,width:number,height:number,beetleAtlas?:HTMLImageElement){
  if(typeof Image==='undefined')return;
  FOREST_NATURE.perches.forEach((insect,i)=>{
    const p=ambientPerchPose(time,i,reducedMotion),x=left+p.x*tile,y=top+p.y*tile;
    if(x< -tile||y< -tile||x>width+tile||y>height+tile)return;
    ctx.save();ctx.globalAlpha=.9;
    if(insect.kind==='beetle'&&beetleAtlas?.complete&&beetleAtlas.naturalWidth){
      const cw=beetleAtlas.naturalWidth/4,ch=beetleAtlas.naturalHeight/2,w=tile*.16,h=w*ch*.6640625/cw;
      ctx.drawImage(beetleAtlas,0,ch*.2734375,cw,ch*.6640625,x-w/2,y-h,w,h);
    }else if(insect.kind==='bee')drawPetSymbol(ctx,'🐝',x,y,tile*.13);
    ctx.restore();
  });
}
export function drawForestSun(ctx:CanvasRenderingContext2D,left:number,top:number,tile:number){
  for(const ray of FOREST_NATURE.rays){
    const x=left+ray.x*tile,y=top+ray.y*tile,ex=x+ray.dx*tile,ey=y+ray.dy*tile;
    const g=ctx.createLinearGradient(x,y,ex,ey);if(!g)continue;
    g.addColorStop(0,'rgba(255,244,199,0)');g.addColorStop(.25,'rgba(255,244,199,.065)');g.addColorStop(.7,'rgba(255,244,199,.035)');g.addColorStop(1,'rgba(255,244,199,0)');
    const w=ray.width*tile;ctx.save();ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-w*.1,y);ctx.lineTo(x+w*.1,y);ctx.lineTo(ex+w,ey);ctx.lineTo(ex-w,ey);ctx.closePath();ctx.fill();ctx.restore();
  }
}
/** Visual fauna has no entity IDs, hitboxes, damage, loot or input handlers. */
export function drawForestFauna(ctx:CanvasRenderingContext2D,left:number,top:number,tile:number,time:number,reducedMotion:boolean,width:number,height:number){
  if(typeof Image==='undefined')return;
  FOREST_NATURE.insects.forEach((insect,i)=>{const p=ambientInsectPose(time,i,reducedMotion),x=left+p.x*tile,y=top+p.y*tile;
    if(x< -tile||y< -tile||x>width+tile||y>height+tile)return;
    ctx.save();ctx.translate(x,y);ctx.scale(p.wing,1);ctx.globalAlpha=.82;drawPetSymbol(ctx,insect.symbol,0,0,tile*.23);ctx.restore();
  });
}
