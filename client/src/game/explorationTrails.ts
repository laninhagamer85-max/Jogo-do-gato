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
 const goals=[...villageSettlements(index),...villageLayout(index).homes.slice(0,3).map((h,i)=>villageDoor(i,index)),r.exit,r.marker,returnPortal(index),...resourceNodes(index).filter(n=>!n.id.startsWith('m')),...campaignEnemies(index,seed).filter(e=>!e.boss).slice(-4),...(index===31?[castleStairBase]:[]),...far],paths:CombatPoint[][]=[],anchors=[start];
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

const courtyardLobes=[[0,0,5.8,4.5],[-4,-2,2.8,2.5],[3,-6,2.8,2.8],[5,3,3,2.8],[-3,4,3,2.7],[-1,-9,2.5,2.5],[-9,2,3,2.8]];
/** A soft, seeded wear mask joins house entrances and the well without a polygon boundary. */
export function villageGroundOpacity(x:number,y:number,room:number,slot:number){const n=hash(room,slot)%100,noise=Math.sin(x*2.7+y*1.8+n)*.16+Math.sin(x*5.1-y*3.3+n)*.08;let wear=-9;for(const [cx,cy,rx,ry] of courtyardLobes)wear=Math.max(wear,1-Math.hypot((x-cx)/rx,(y-cy)/ry));return Math.max(0,Math.min(.94,(wear+noise)*2.8))*Math.max(0,Math.min(1,(11-Math.abs(x))/1.2,(11-Math.abs(y))/1.2));}
const courtyards=new Map<string,HTMLCanvasElement>();
function courtyardArt(material:HTMLImageElement,room:number,slot:number,stage:number){if(typeof document==='undefined')return;const key=`${material.src}:${room}:${slot}:${stage}`,hit=courtyards.get(key);if(hit)return hit;const size=512,c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');if(!g)return;const pattern=g.createPattern(material,'repeat');if(!pattern)return;pattern.setTransform(new DOMMatrix().scale(size/22*2.8/material.naturalWidth));g.fillStyle=pattern;g.fillRect(0,0,size,size);const mask=document.createElement('canvas');const maskSize=128;mask.width=mask.height=maskSize;const m=mask.getContext('2d');if(!m)return;const pixels=m.createImageData(maskSize,maskSize);for(let y=0;y<maskSize;y++)for(let x=0;x<maskSize;x++){const i=(y*maskSize+x)*4;pixels.data[i+3]=Math.round(villageGroundOpacity(x/maskSize*22-11,y/maskSize*22-11,room,slot)*255);}m.putImageData(pixels,0,0);g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0,size,size);g.globalCompositeOperation='source-over';if(courtyards.size>=16)courtyards.delete(courtyards.keys().next().value!);courtyards.set(key,c);return c;}

const bankCache=new Map<string,CombatPoint[][][]>();
let stone:HTMLImageElement|undefined;
const compiledBanks=new WeakMap<CombatPoint[],{path?:Path2D;left:number;right:number;top:number;bottom:number}>();
/** A single material per settlement/biome avoids alternating sand and stone at every junction. */
export function drawExplorationTrails(ctx:CanvasRenderingContext2D,index:number,left:number,top:number,tile:number,soil?:HTMLImageElement,seed?:number,stages:readonly number[]=[]){
 if(!soil?.complete||!soil.naturalWidth)return;
 if(!stone&&typeof Image!=='undefined'){stone=new Image();stone.src='/forest-adventure/path-stone-v1.webp';}
 const room=campaignRoom(index),source=room.biome==='nascentes'&&stone?.complete&&stone.naturalWidth?stone:soil,filter=room.biome==='autumn'?'sepia(.16) saturate(.85)':room.biome==='river'?'saturate(.55) brightness(1.04)':'none',art=filter==='none'?source:explorationColorVariant(source,filter)!;
 ctx.save();ctx.translate(left,top);ctx.scale(tile,tile);
 const pattern=ctx.createPattern(art,'repeat');if(!pattern){ctx.restore();return;}pattern.setTransform(new DOMMatrix().scale(2.8/art.naturalWidth));ctx.fillStyle=pattern;
 const fill=(polygon:CombatPoint[])=>{if(polygon.length<3)return;let compiled=compiledBanks.get(polygon);if(!compiled){const path=typeof Path2D!=='undefined'?new Path2D():undefined;compiled={path,left:Math.min(...polygon.map(p=>p.x)),right:Math.max(...polygon.map(p=>p.x)),top:Math.min(...polygon.map(p=>p.y)),bottom:Math.max(...polygon.map(p=>p.y))};if(path){const first=polygon[0],last=polygon[polygon.length-1];path.moveTo((last.x+first.x)/2,(last.y+first.y)/2);for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];path.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}path.closePath();}compiledBanks.set(polygon,compiled);}const scale=ctx.getTransform?.().a??tile,vw=(ctx.canvas?.width??Infinity)/scale,vh=(ctx.canvas?.height??Infinity)/scale,x=-left/tile,y=-top/tile;if(compiled.right<x||compiled.left>x+vw||compiled.bottom<y||compiled.top>y+vh)return;if(compiled.path){ctx.fill(compiled.path);return;}const last=polygon[polygon.length-1],first=polygon[0];ctx.beginPath();ctx.moveTo((last.x+first.x)/2,(last.y+first.y)/2);for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];ctx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}ctx.closePath();ctx.fill();};
 // Textured wear continues into the existing road network, under every village building.
 const transform=ctx.getTransform?.(),vw=(ctx.canvas?.width??Infinity)/(transform?.a??tile),vh=(ctx.canvas?.height??Infinity)/(transform?.a??tile),viewX=-left/tile,viewY=-top/tile;
 for(const c of villageSettlements(index)){if(c.x+11<viewX||c.x-11>viewX+vw||c.y+11<viewY||c.y-11>viewY+vh)continue;const stage=stages[c.slot]??0,material=art,patch=courtyardArt(material,index,c.slot,stage);if(patch)ctx.drawImage(patch,c.x-11,c.y-11,22,22);}
 const key=`${index}:${seed??290519+index*101}`,layers=[[.18,.07],[.1,.14],[.04,.2],[0,.5]];let banks=bankCache.get(key);if(!banks){banks=explorationTrails(index,seed).map((points,n)=>layers.map(([extra])=>trailBanks(points,index,n,extra)));if(bankCache.size>=64)bankCache.delete(bankCache.keys().next().value!);bankCache.set(key,banks);}banks.forEach(branch=>branch.forEach((polygon,i)=>{ctx.globalAlpha=layers[i][1];fill(polygon);}));
 ctx.restore();
}
