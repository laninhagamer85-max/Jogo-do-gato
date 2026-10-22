import {nascentesBlocked} from './explorationChapter4';
import {openWorldBlocked} from './explorationOpenWorld';
import {campaignRoom,campaignWaterBlocks} from './explorationCampaign';
import type {CombatState,CombatPoint} from './explorationCombat';
export const BASE_BUILDINGS=['home','chest','workshop','potions'] as const;
export type BaseBuilding=typeof BASE_BUILDINGS[number];
export type BaseLayout={home:CombatPoint;chest:CombatPoint;workshop:CombatPoint;potions:CombatPoint};
export const BASE_NAMES={home:'Casa segura',chest:'Baú de armazenamento',workshop:'Oficina e fornalha',potions:'Casa de poções'} as const;
export const BASE_BUILDING_SIZE={home:3.6,chest:2.8,workshop:3.5,potions:3.3} as const;
export const BASE_ATLAS='/forest-adventure/biome-shelters/base-buildings-v1.webp';
const defaults=new Map<number,BaseLayout>();
export function defaultBase(index:number):BaseLayout{const hit=defaults.get(index);if(hit)return hit;const r=campaignRoom(index),c=r.camp,h=index>=30?{x:c.x-.8,y:c.y-.5}:{x:c.x-1.05,y:c.y+.4},result={home:h} as BaseLayout,occupied=[h],objectives=[r.marker,r.exit,...r.nodes,...r.switches,...(r.key?[r.key]:[]),...(r.hazards??[])];
 const ground=(p:CombatPoint)=>!campaignWaterBlocks(p,.85,r)&&!r.walls.some(w=>p.x+.85>w.x&&p.x-.85<w.x+1&&p.y+.85>w.y&&p.y-.85<w.y+1)&&(index<30?!openWorldBlocked(p,.85,index):!nascentesBlocked(p,.85,true,index,true))&&!objectives.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<1.6)&&![[-3.5,2],[-3.5,6],[19,3],[20,8]].some(([x,y])=>index<30&&Math.hypot(x-p.x,y-p.y)<1.1);
 for(const [i,k] of (['chest','workshop','potions'] as const).entries()){const preferred=[[-3,.1],[3.2,-.6],[.3,3.2]][i],candidates=[preferred,...Array.from({length:24},(_,n)=>[Math.cos(n*Math.PI/12)*3.5,Math.sin(n*Math.PI/12)*3.5])].map(([x,y])=>({x:h.x+x,y:h.y+y}));const p=candidates.find(p=>ground(p)&&ground({x:p.x,y:p.y+.7})&&occupied.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>2.9))??candidates[0];result[k]=p;occupied.push(p);}defaults.set(index,result);return result;}
export function readBaseLayouts(value:unknown):Record<string,BaseLayout>{const out:Record<string,BaseLayout>={};if(!value||typeof value!=='object')return out;for(const [key,v] of Object.entries(value).slice(0,32)){if(!/^(?:[0-9]|[12][0-9]|3[01])$/.test(key)||!v||typeof v!=='object')continue;const b=v as BaseLayout;if(!BASE_BUILDINGS.every(k=>b[k]&&Number.isFinite(b[k].x)&&Number.isFinite(b[k].y)&&Math.abs(b[k].x)<1000&&Math.abs(b[k].y)<1000))continue;if(BASE_BUILDINGS.some(k=>Math.hypot(b[k].x-b.home.x,b[k].y-b.home.y)>6))continue;out[key]=Object.fromEntries(BASE_BUILDINGS.map(k=>[k,{x:b[k].x,y:b[k].y}])) as BaseLayout;}return out;}
export function baseLayout(s:Pick<CombatState,'workshop'|'roomIndex'>){return s.workshop?.layouts?.[s.roomIndex]??defaultBase(s.roomIndex);}
export function baseBuilt(s:Pick<CombatState,'workshop'>,k:BaseBuilding){return k==='home'||Boolean(s.workshop?.facilities[k==='workshop'?'bench':k==='potions'?'healing':'chest']);}
export function safeBaseRadius(s:Pick<CombatState,'workshop'>){return 5.2+Math.max(0,...Object.values(s.workshop?.facilities??{}))*.2;}
export function insideSafeBase(s:CombatState,p=s.player){return !s.castle?.active&&Math.hypot(p.x-baseLayout(s).home.x,p.y-baseLayout(s).home.y)<safeBaseRadius(s);}
export function baseBlocks(p:CombatPoint,radius:number,index:number,w:CombatState['workshop']){const fake={roomIndex:index,workshop:w},b=baseLayout(fake);return BASE_BUILDINGS.some(k=>{if(k!=='home'&&!baseVisible(fake,k))return false;const q=b[k],rx=k==='home'?.8:k==='chest'?.9:1,ry=k==='home'?.22:.4;return Math.abs(p.x-q.x)<rx+radius&&Math.abs(p.y-(q.y-.18))<ry+radius;});}
export function buildingAt(s:CombatState,p:CombatPoint){return [...BASE_BUILDINGS].reverse().find(k=>{const q=baseLayout(s)[k];return baseVisible(s,k)&&Math.abs(q.x-p.x)<BASE_BUILDING_SIZE[k]*.42&&p.y>q.y-BASE_BUILDING_SIZE[k]&&p.y<q.y+.2;});}
/** A proposed placement is checked entirely before committing. House moves the whole base. */
export function placeBaseBuilding(s:CombatState,k:BaseBuilding,target:CombatPoint,ground:(p:CombatPoint,r:number)=>boolean):CombatState{
 if(s.castle?.active||!s.workshop||!BASE_BUILDINGS.includes(k)||!Number.isFinite(target.x)||!Number.isFinite(target.y)||Math.abs(target.x)>999||Math.abs(target.y)>999)return s;
 const before=baseLayout(s),next={...before,[k]:{x:Math.round(target.x*4)/4,y:Math.round(target.y*4)/4}};
 if(k==='home'){const dx=next.home.x-before.home.x,dy=next.home.y-before.home.y;for(const other of BASE_BUILDINGS)if(other!=='home')next[other]={x:before[other].x+dx,y:before[other].y+dy};}
 const room=campaignRoom(s.roomIndex),objectives=[room.marker,room.exit,...room.switches,...room.nodes,...(room.hazards??[]),...(room.key?[room.key]:[])];
 const invalid=BASE_BUILDINGS.some(type=>{const q=next[type];return Math.hypot(q.x-next.home.x,q.y-next.home.y)>safeBaseRadius(s)-.65||!ground(q,.8)||!ground({x:q.x,y:q.y+.9},.3)||objectives.some(o=>Math.hypot(o.x-q.x,o.y-q.y)<1.6)||Math.hypot(s.player.x-q.x,s.player.y-q.y)<.65;})||BASE_BUILDINGS.some((a,i)=>BASE_BUILDINGS.slice(i+1).some(b=>Math.hypot(next[a].x-next[b].x,next[a].y-next[b].y)<(BASE_BUILDING_SIZE[a]+BASE_BUILDING_SIZE[b])*.4));
 if(invalid)return {...s,revision:s.revision+1,message:'Escolha solo livre, dentro da proteção da casa, sem bloquear passagens ou outras construções.'};
 return {...s,revision:s.revision+1,workshop:{...s.workshop,layouts:{...s.workshop.layouts,[s.roomIndex]:next}},message:`${BASE_NAMES[k]} posicionada. Organização salva nesta sala.`};
}
export function baseView(w:number,h:number,s:Pick<CombatState,'workshop'|'roomIndex'>){const c=baseLayout(s).home,tile=Math.min(w/11,h/10);return{tile,left:w/2-c.x*tile,top:h*.49-c.y*tile};}

/** Pending construction shares the final world footprint, without granting its service early. */
export function pendingBaseBuilding(s:Pick<CombatState,'workshop'>):Exclude<BaseBuilding,'home'>|undefined{const id=s.workshop?.job?.recipe?.replace(/^upgrade-/,'');return id==='chest'?'chest':id==='bench'||id==='refinery'?'workshop':id==='healing'?'potions':undefined;}
export function baseVisible(s:Pick<CombatState,'workshop'>,k:BaseBuilding){return baseBuilt(s,k)||pendingBaseBuilding(s)===k;}
export function constructionProgress(s:Pick<CombatState,'workshop'>,now=Date.now()){const kind=pendingBaseBuilding(s),j=s.workshop?.job;if(!kind||!j)return;const progress=Math.max(0,Math.min(1,(now-j.startedAt)/(j.finishAt-j.startedAt)));return {kind,progress,seconds:Math.max(0,Math.ceil((j.finishAt-now)/1000)),ready:now>=j.finishAt};}
