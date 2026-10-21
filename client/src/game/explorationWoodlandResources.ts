import {explorationGroves} from './explorationOpenWorld';
import {nascentesTrees,nascentesHeight} from './explorationChapter4';
import {campaignRoom,campaignWaterBlocks} from './explorationCampaign';
import type {ResourceNode} from './explorationWorkshop';
type Tree={x:number;y:number;width:number;variant?:number};
/** Stable per-tree identity: camera, zoom and query bounds never change depletion. */
export function woodlandResource(index:number,tree:Tree):ResourceNode|undefined{
 const x=Math.round(tree.x*1000),y=Math.round(tree.y*1000);let hash=(Math.imul(x,73856093)^Math.imul(y,19349663)^Math.imul(index+1,83492791))>>>0;
 hash=Math.imul(hash^(hash>>>16),0x45d9f3b);hash^=hash>>>16;
 if((hash>>>0)%100>=75||Math.abs(x)>99999999||Math.abs(y)>99999999||campaignWaterBlocks(tree,.15,campaignRoom(index)))return;
 return {id:`g${index}:${x}:${y}`,x:tree.x,y:tree.y,kind:'tree',material:'wood',tool:'axe',required:1};
}
const cache=new Map<string,ResourceNode[]>();
/** Only neighboring terrain cells are queried during gameplay, never the whole world. */
export function woodlandResourcesNear(index:number,p:{x:number;y:number}){
 const cx=Math.floor(p.x/4),cy=Math.floor(p.y/4),key=`${index}:${cx}:${cy}`,hit=cache.get(key);if(hit)return hit;
 const bounds={left:cx*4-3,top:cy*4-3,width:10,height:10},trees=index>=30?nascentesTrees(bounds,index):explorationGroves(bounds,index),nodes=trees.filter(q=>q.x>=bounds.left&&q.x<=bounds.left+bounds.width&&q.y>=bounds.top&&q.y<=bounds.top+bounds.height).map(q=>woodlandResource(index,q)).filter((n):n is ResourceNode=>Boolean(n));
 if(cache.size>=256)cache.delete(cache.keys().next().value!);cache.set(key,nodes);return nodes;
}
export function resourceOnPlayerFloor(index:number,p:{x:number;y:number},n:{x:number;y:number}){return index<30||Math.abs(nascentesHeight(p,index)-nascentesHeight(n,index))<.25;}
export function validResourceSaveId(id:string){return /^r(?:[0-9]|[12][0-9]|3[01]):[0-3]$/.test(id)||/^g(?:[0-9]|[12][0-9]|3[01]):-?\d{1,8}:-?\d{1,8}$/.test(id);}
