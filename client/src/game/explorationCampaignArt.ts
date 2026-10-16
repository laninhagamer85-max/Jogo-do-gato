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
