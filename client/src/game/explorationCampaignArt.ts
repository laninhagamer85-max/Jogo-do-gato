import {drawWoodlandProp} from './explorationScenery';
import {drawGardenPatch} from './forestNature';
import type {CampaignRoom} from './explorationCampaign';
export function drawCampaignBridge(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,room:CampaignRoom,left:number,top:number,tile:number){
 const b=room.bridge;if(!b||!image?.complete||!image.naturalWidth)return;
 const w=b.width*tile,h=w*image.naturalHeight/image.naturalWidth;
 ctx.drawImage(image,left+b.x*tile,top+(b.y+b.height/2)*tile-h/2,w,h);
}
export function drawCampaignKey(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,p:{x:number;y:number},left:number,top:number,tile:number,time:number,reduced:boolean){
 if(!image?.complete||!image.naturalWidth)return;const w=tile*.65,h=w*image.naturalHeight/image.naturalWidth;
 ctx.drawImage(image,left+p.x*tile-w/2,top+p.y*tile-h-(reduced?0:Math.sin(time/400)*tile*.035),w,h);
}

/** New river atlas uses complete cells with uniform scale and a shared ground anchor. */
export function drawRiverProp(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,index:number,x:number,y:number,tile:number,size={width:1.2,height:1.2}){
 if(!image?.complete||!image.naturalWidth)return;
 const cw=image.naturalWidth/3,ch=image.naturalHeight/2,scale=Math.min(tile*size.width/cw,tile*size.height/ch),w=cw*scale,h=ch*scale;
 ctx.drawImage(image,index%3*cw,Math.floor(index/3)*ch,cw,ch,x-w/2,y-h*.88,w,h);
}

/** Sparse grounded shore details share the collision shoreline; never a flat sand oval. */
export function drawCampaignShore(ctx:CanvasRenderingContext2D,room:CampaignRoom,left:number,top:number,tile:number,props?:HTMLImageElement,garden?:HTMLImageElement,riverProps?:HTMLImageElement){
 for(const region of room.composition?.regions??[]){if(region.material!=='water')continue;
  for(let i=0;i<region.polygon.length;i+=8){const p=region.polygon[i];if(room.bridge&&p.y>room.bridge.y-.5&&p.y<room.bridge.y+room.bridge.height+.5)continue;
   const x=left+p.x*tile,y=top+p.y*tile;
   if(i%24===0&&garden){const patch={...p,index:i%6,width:.42,height:.34,blocking:false as const};if(room.biome==='river')drawRiverProp(ctx,riverProps,3,x,y,tile,{width:.45,height:.45});else drawGardenPatch(ctx,garden,patch,x,y,tile,0,true);}
   else if(room.biome==='river')drawRiverProp(ctx,riverProps,1,x,y,tile,{width:.25+(i%3)*.04,height:.18});
   else if(props)drawWoodlandProp(ctx,props,0,x,y,tile,{width:.25+(i%3)*.04,height:.18},true);
  }
 }
}
