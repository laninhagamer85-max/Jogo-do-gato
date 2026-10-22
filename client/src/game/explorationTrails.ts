import {villageSettlements,villageLayout,villageDoor} from './explorationVillageLayout';
import {explorationColorVariant} from './explorationColorCache';
import {campaignRoom,campaignEnemies} from './explorationCampaign';
import {returnPortal,castleStairBase} from './explorationChapter4';
import {pilotRoute,pilotWalkable,clearPilotWalkLine,type CombatPoint} from './explorationCombat';
import {resourceNodes} from './explorationWorkshop';
const cache=new Map<string,CombatPoint[][]>();
const distance=(a:CombatPoint,b:CombatPoint)=>Math.hypot(a.x-b.x,a.y-b.y);
const hash=(index:number,n:number)=>(Math.imul(index+13,73856093)^Math.imul(n+7,19349663))>>>0;
/** Connected, seeded branches link real destinations; camera and reload never reroll the paths. */
export function explorationTrails(index:number,seed=290519+index*101){const key=`${index}:${seed>>>0}`,hit=cache.get(key);if(hit)return hit;const r=campaignRoom(index),start=r.camp;
 const far=Array.from({length:5},(_,n)=>{const seed=hash(index,n),angle=n*Math.PI*2/5+(seed%50)/100,range=19+(seed>>>8)%10;return{x:start.x+Math.cos(angle)*range,y:start.y+Math.sin(angle)*range};});
 const goals=[...villageSettlements(index),...villageLayout(index).homes.slice(0,3).map((h,i)=>villageDoor(i,index)),r.exit,r.marker,returnPortal(index),...resourceNodes(index),...campaignEnemies(index,seed).filter(e=>!e.boss).slice(-4),...(index===31?[castleStairBase]:[]),...far],paths:CombatPoint[][]=[],anchors=[start];
 for(const goal of goals){const candidates=[goal,...[.8,1.4,2].flatMap(d=>[[d,0],[-d,0],[0,d],[0,-d]].map(([x,y])=>({x:goal.x+x,y:goal.y+y})))],end=candidates.find(q=>pilotWalkable(q,true,.3,index));if(!end)continue;const from=[...anchors].sort((a,b)=>distance(a,end)-distance(b,end))[0];if(distance(from,end)<1)continue;const route=pilotRoute(from,end,true,index);if(!route.length)continue;
 const points=[from,...route],simple=[from];let cursor=0;while(cursor<points.length-1){let next=cursor+1;for(let j=cursor+2;j<points.length&&distance(points[cursor],points[j])<7;j++){if(clearPilotWalkLine(points[cursor],points[j],true,.3,index))next=j;else break;}simple.push(points[next]);cursor=next;}
 const organic=[simple[0]];for(let i=1;i<simple.length;i++){const a=simple[i-1],b=simple[i],d=distance(a,b);if(d>3){const sway=((hash(index,paths.length*19+i)%100)/100-.5)*1.4,mid={x:(a.x+b.x)/2-(b.y-a.y)/d*sway,y:(a.y+b.y)/2+(b.x-a.x)/d*sway};if(clearPilotWalkLine(a,mid,true,.3,index)&&clearPilotWalkLine(mid,b,true,.3,index))organic.push(mid);}organic.push(b);}paths.push(organic);for(let i=0;i<points.length;i+=6)anchors.push(points[i]);anchors.push(end);}
 if(cache.size>=64)cache.delete(cache.keys().next().value!);cache.set(key,paths);return paths;}
/** Uneven banks follow the navigation route; no stroked capsules or circular end caps. */
export function trailBanks(points:CombatPoint[],index:number,branch:number,extra=0){
 const samples:CombatPoint[]=[];
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],steps=Math.max(1,Math.ceil(distance(a,b)/.38));for(let j=0;j<steps;j++)samples.push({x:a.x+(b.x-a.x)*j/steps,y:a.y+(b.y-a.y)*j/steps});}
 if(points.length)samples.push(points[points.length-1]);
 const left:CombatPoint[]=[],right:CombatPoint[]=[];
 samples.forEach((p,i)=>{const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],d=distance(a,b)||1,k=Math.floor(i/5),f=i/5-k,variation=((hash(index,branch*997+k)%100)*(1-f)+(hash(index,branch*997+k+1)%100)*f)/100,width=(.23+variation*.13+extra)*Math.min(1,(i+1)/3,(samples.length-i)/3),nx=-(b.y-a.y)/d,ny=(b.x-a.x)/d;left.push({x:p.x+nx*width,y:p.y+ny*width});right.push({x:p.x-nx*width*.83,y:p.y-ny*width*.83});});
 return [...left,...right.reverse()];
}
const bankCache=new Map<string,CombatPoint[][][]>();
let stone:HTMLImageElement|undefined;
/** A single material per settlement/biome avoids alternating sand and stone at every junction. */
export function drawExplorationTrails(ctx:CanvasRenderingContext2D,index:number,left:number,top:number,tile:number,soil?:HTMLImageElement,seed?:number){
 if(!soil?.complete||!soil.naturalWidth)return;
 if(!stone&&typeof Image!=='undefined'){stone=new Image();stone.src='/forest-adventure/path-stone-v1.webp';}
 const room=campaignRoom(index),source=room.biome==='nascentes'&&stone?.complete&&stone.naturalWidth?stone:soil,filter=room.biome==='autumn'?'sepia(.16) saturate(.85)':room.biome==='river'?'saturate(.55) brightness(1.04)':'none',art=filter==='none'?source:explorationColorVariant(source,filter)!;
 ctx.save();ctx.translate(left,top);ctx.scale(tile,tile);
 const pattern=ctx.createPattern(art,'repeat');if(!pattern){ctx.restore();return;}pattern.setTransform(new DOMMatrix().scale(2.8/art.naturalWidth));ctx.fillStyle=pattern;
 const fill=(polygon:CombatPoint[])=>{if(polygon.length<3)return;const last=polygon[polygon.length-1],first=polygon[0];ctx.beginPath();ctx.moveTo((last.x+first.x)/2,(last.y+first.y)/2);for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];ctx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}ctx.closePath();ctx.fill();};
 // Settlement courtyard is continuous under all houses and connects to its road branches.
 if(index===0){ctx.globalAlpha=.6;fill([{x:-16,y:-10},{x:-14,y:-12},{x:-8,y:-13},{x:-4,y:-11},{x:-3,y:-6},{x:-4,y:-2},{x:-8,y:-1},{x:-12,y:-3},{x:-15,y:-6}]);ctx.globalAlpha=1;}
 const key=`${index}:${seed??290519+index*101}`,layers=[[.18,.07],[.1,.14],[.04,.2],[0,.5]];let banks=bankCache.get(key);if(!banks){banks=explorationTrails(index,seed).map((points,n)=>layers.map(([extra])=>trailBanks(points,index,n,extra)));if(bankCache.size>=64)bankCache.delete(bankCache.keys().next().value!);bankCache.set(key,banks);}banks.forEach(branch=>branch.forEach((polygon,i)=>{ctx.globalAlpha=layers[i][1];fill(polygon);}));
 ctx.restore();
}
