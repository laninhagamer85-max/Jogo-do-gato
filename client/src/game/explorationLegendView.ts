import {harvestingActive} from './explorationWorkshop';
import {drawHarvestTool} from './explorationWorkshopView';
import {tierSprite} from './explorationEquipmentTiers';
import weapons from './explorationWeaponArt.json';
import {legendPose,legendHand} from './explorationLegendPose';
import {legendAnimation,type LegendId} from './explorationLegends';
import type {CombatState} from './explorationCombat';
const images=new Map<string,HTMLImageElement>();
const cutouts=new Map<string,HTMLCanvasElement>();let pixels=0;
const CACHE_PIXELS=6_000_000;
function imageFor(key:string,src:string){let image=images.get(key);if(!image&&typeof Image!=='undefined'){image=new Image();image.src=src;images.set(key,image);}return image;}
export function preloadLegend(id:LegendId){imageFor(id,`/forest-adventure/legends/${id}-v1.png`);imageFor('weapons','/forest-adventure/legends/weapons-v1.png');}
/** Prepare an isolated alpha silhouette once. Original bitmaps remain unchanged. */
function cutout(key:string,image:HTMLImageElement|undefined,r:{x:number;y:number;width:number;height:number;path:string}){
 const hit=cutouts.get(key);if(hit)return hit;
 if(!image?.complete||!image.naturalWidth||typeof document==='undefined')return null;
 const area=r.width*r.height;while(pixels+area>CACHE_PIXELS&&cutouts.size){const first=cutouts.keys().next().value!;const c=cutouts.get(first)!;pixels-=c.width*c.height;cutouts.delete(first);}
 const canvas=document.createElement('canvas');canvas.width=r.width;canvas.height=r.height;const ctx=canvas.getContext('2d');if(!ctx)return null;
 const silhouette=new Path2D(r.path);ctx.fillStyle='#fff';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.fill(silhouette);ctx.stroke(silhouette);ctx.globalCompositeOperation='source-in';ctx.drawImage(image,-r.x,-r.y);ctx.globalCompositeOperation='source-over';cutouts.set(key,canvas);pixels+=area;return canvas;
}
/** Complete poses with shared foot contact; item grip follows the authored gauntlet. */
export function drawExplorationLegend(ctx:CanvasRenderingContext2D,state:CombatState,x:number,y:number,tile:number,reduced:boolean){
 const id=state.legends?.active;if(!id)return false;preloadLegend(id);
 const anim=legendAnimation(state.facing.x,state.facing.y,state.walking,state.walkPhase,state.time,state.strikeUntil,reduced);
 const pose=legendPose(id,anim.row,anim.frame),rect=pose.rect,sprite=cutout(pose.key,images.get(id),rect);if(!sprite)return false;
 const dh=tile*1.12,dw=dh*rect.width/rect.height,hand=legendHand(id,pose.sourceRow,pose.sourceFrame);
 const hx=x+(pose.mirror?-1:1)*(hand.x-.5)*dw,hy=y-dh+hand.y*dh;
 const harvesting=harvestingActive(state),weapon=harvesting?null:state.legends?.weapon,phase=anim.attacking?Math.max(0,Math.min(1,1-(state.strikeUntil-state.time)/320)):0;
 const a=Math.atan2(state.facing.y,state.facing.x),sway=state.walking&&!reduced?Math.sin(state.walkPhase*Math.PI*2)*.065:0;
 function drawItem(){if(!weapon)return;const meta=weapons[weapon],tier=state.workshop?.equipmentTiers[weapon],tierArt=tier?tierSprite(weapon,tier):null,tierImage=tierArt?imageFor('equipment-tiers',tierArt.src):null,item=cutout(`weapon:${weapon}`,images.get('weapons'),meta);if(!item)return;
  ctx.save();ctx.translate(hx,hy);
  const swing=anim.attacking?-.85+1.5*(.5-.5*Math.cos(phase*Math.PI)):.65+sway;
  ctx.rotate(a+(weapon==='bow'?sway:Math.PI/2+swing));
  const height=tile*(weapon==='sword'?.88:weapon==='dagger'?.5:.92),width=height*meta.width/meta.height;
  if(tierArt&&tierImage?.complete&&tierImage.naturalWidth){const cw=tierImage.naturalWidth/5,ch=tierImage.naturalHeight/3,sz=height*1.25;ctx.drawImage(tierImage,tierArt.column*cw,tierArt.row*ch,cw,ch,-sz*.85,-sz*.85,sz,sz);}else ctx.drawImage(item,-meta.grip[0]*width,-meta.grip[1]*height,width,height);ctx.restore();
  if(weapon==='bow'){
   const arrowMeta=weapons.arrow,arrow=cutout('weapon:arrow',images.get('weapons'),arrowMeta);if(!arrow)return;
   const flight=anim.attacking?Math.max(0,(phase-.36)/.64):0;
   ctx.save();ctx.translate(hx+Math.cos(a)*tile*flight*4.2,hy+Math.sin(a)*tile*flight*4.2);ctx.rotate(a);
   const length=tile*.62,thickness=length*arrowMeta.height/arrowMeta.width;ctx.drawImage(arrow,-length*(flight>0?.25:.5),-thickness/2,length,thickness);ctx.restore();
  }
 }
 // Rear-facing equipment sits behind the body instead of cutting through the torso.
 const behind=state.facing.y<-.3;if(behind)drawItem();
 ctx.save();ctx.translate(x,y);if(pose.mirror)ctx.scale(-1,1);ctx.drawImage(sprite,-dw/2,-dh,dw,dh);ctx.restore();if(!behind)drawItem();if(harvesting)drawHarvestTool(ctx,state,x,y,tile,{x:hx,y:hy});return true;
}
