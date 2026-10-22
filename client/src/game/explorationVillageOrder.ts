import type {CombatState,CombatPoint} from './explorationCombat';
import type {Citizen,VillageProgress} from './explorationVillage';
import {activeVillageDefinitions,villagerDefinition,villageLayout,villageSettlements} from './explorationVillageLayout';
export type VillageIncident={room:number;settlement:number;offenders:string[];victim?:string;guard:string;phase:'responding'|'escort'|'detained';started:number;until:number};
export type VillageOrder={nextAt:number;incidents:Record<string,VillageIncident>};
const adult=(id:string)=>{const d=villagerDefinition(id);return d&&d.kind!=='child'&&d.kind!=='guard';};
export function readVillageOrder(raw:unknown,now=Date.now()):VillageOrder{const out:VillageOrder={nextAt:now+900000,incidents:{}};if(!raw||typeof raw!=='object')return out;const r=raw as VillageOrder;if(Number.isFinite(r.nextAt))out.nextAt=Math.min(now+900000,Math.max(0,r.nextAt));for(const i of Object.values(r.incidents??{})){if(!i||!Number.isInteger(i.room)||i.room<0||i.room>31||!Number.isInteger(i.settlement)||i.settlement<0||i.settlement>9||!Array.isArray(i.offenders)||(i.offenders.length<1||i.offenders.length>2)||new Set(i.offenders).size!==i.offenders.length||!i.offenders.every(id=>adult(id)&&villagerDefinition(id).room===i.room)||villagerDefinition(i.guard)?.kind!=='guard'||villagerDefinition(i.guard).room!==i.room||!['responding','escort','detained'].includes(i.phase)||!Number.isFinite(i.started)||!Number.isFinite(i.until))continue;if(i.phase==='detained'&&i.until<=now)continue;out.incidents[String(i.room)]={...i,offenders:[...i.offenders],until:Math.min(i.until,now+60000)};}return out;}
/** Only mutual troublemakers are detained; a victim, child or passer-by is never selected. */
export function reportVillageBrawl(s:CombatState,a:string,b:string,now=Date.now()){
 const v=s.village;if(!v||a===b||!adult(a)||!adult(b)||v.duel||s.castle?.active)return s;
 const defs=activeVillageDefinitions(v,s.roomIndex),da=defs.find(d=>d.id===a),db=defs.find(d=>d.id===b),ca=v.people[a],cb=v.people[b];
 if(!da||!db||!ca||!cb||ca.room!==s.roomIndex||cb.room!==s.roomIndex||da.settlement!==db.settlement||Math.hypot(ca.x-cb.x,ca.y-cb.y)>2.5||ca.task==='home'||cb.task==='home'||ca.task.startsWith('caravan-')||cb.task.startsWith('caravan-'))return s;
 const guard=defs.find(d=>d.kind==='guard'&&d.settlement===da.settlement&&v.people[d.id]?.room===s.roomIndex);if(!guard||v.order?.incidents[String(s.roomIndex)])return s;
 const incident:VillageIncident={room:s.roomIndex,settlement:da.settlement,offenders:[a,b],guard:guard.id,phase:'responding',started:v.clock,until:0};
 return {...s,revision:s.revision+1,village:{...v,order:{nextAt:now+900000,incidents:{...v.order?.incidents,[s.roomIndex]:incident}}}};
}
/** A one-sided assault punishes only its aggressor, never the victim. */
export function reportVillageAssault(s:CombatState,attacker:string,victim:string,now=Date.now()){
 const v=s.village;if(!v||attacker===victim||!adult(attacker)||v.duel||s.castle?.active)return s;
 const defs=activeVillageDefinitions(v,s.roomIndex),a=defs.find(d=>d.id===attacker),b=defs.find(d=>d.id===victim),ca=v.people[attacker],cb=v.people[victim];
 if(!a||!b||b.kind==='guard'||a.settlement!==b.settlement||!ca||!cb||ca.room!==s.roomIndex||cb.room!==s.roomIndex||ca.task==='home'||cb.task==='home'||ca.task.startsWith('caravan-')||Math.hypot(ca.x-cb.x,ca.y-cb.y)>2.5||v.order?.incidents[String(s.roomIndex)])return s;
 const g=defs.find(d=>d.kind==='guard'&&d.settlement===a.settlement&&v.people[d.id]?.room===s.roomIndex);if(!g)return s;
 const incident:VillageIncident={room:s.roomIndex,settlement:a.settlement,offenders:[attacker],victim,guard:g.id,phase:'responding',started:v.clock,until:0};
 return {...s,revision:s.revision+1,village:{...v,order:{nextAt:now+900000,incidents:{...v.order?.incidents,[s.roomIndex]:incident}}}};
}
export function detainedCitizen(v:VillageProgress|undefined,id:string,now=Date.now()){return Object.values(v?.order?.incidents??{}).some(i=>i.phase==='detained'&&i.until>now&&i.offenders.includes(id));}
export function tickVillageOrder(s:CombatState,dt:number,now:number,travel:(c:Citizen,id:string,p:CombatPoint,dt:number)=>boolean){
 const v=s.village!,old=v.order??{nextAt:now+900000,incidents:{}};v.order={nextAt:old.nextAt,incidents:{...old.incidents}};const held=new Set<string>();
 for(const [key,stored] of Object.entries(v.order.incidents)){const i={...stored};v.order.incidents[key]=i;
  if(i.phase==='detained'&&now>=i.until){for(const id of i.offenders){const c=v.people[id];if(c){v.people[id]={...c,chat:undefined,task:'inbound',timer:0,walking:false};}}delete v.order.incidents[key];continue;}
  if(i.room!==s.roomIndex)continue;
  const ids=[...i.offenders,i.guard],people=ids.map(id=>v.people[id]);if(people.some(c=>!c)){delete v.order.incidents[key];continue;}
  ids.forEach(id=>held.add(id));people.forEach(c=>{c.walking=false;c.chat=undefined;});const a=people[0],b=people.length===3?people[1]:v.people[i.victim??''],g=people[people.length-1];
  if(i.phase==='responding'){
   if(b){a.facing={x:b.x-a.x,y:b.y-a.y};if(i.offenders.length===2)b.facing={x:-a.facing.x,y:-a.facing.y};}a.chat={with:i.offenders[1]??i.victim??i.guard,until:v.clock+100,line:'Vamos resolver isso!'};g.chat={with:i.offenders[0],until:v.clock+100,line:i.offenders.length===2?'Parem! Os dois vão ao posto da guarda.':'Pare! Agressão não é permitida. Venha ao posto.'};
   if(Math.hypot(g.x-a.x,g.y-a.y)<2){i.phase='escort';i.started=v.clock;}else travel(g,i.guard,{x:a.x+.6,y:a.y+.6},dt);
  }else if(i.phase==='escort'){
   const h=villageLayout(i.room).homes[30+i.settlement],post={x:h.x,y:h.y+.8};
   ids.forEach((id,k)=>travel(people[k],id,{x:post.x+(k-1)*.45,y:post.y+.4},dt));
   g.chat={with:i.offenders[0],until:v.clock+100,line:'Acompanhem-me. Detenção de 60 segundos.'};
   if(people.every(c=>Math.hypot(c.x-post.x,c.y-post.y)<1.5)){i.phase='detained';i.until=now+60000;i.started=now;}
  }else{g.chat={with:i.offenders[0],until:v.clock+100,line:`Posto da guarda · Liberação em ${Math.ceil((i.until-now)/1000)}s`};}
  // Unreachable routes must not freeze routines forever or place people through walls.
  if(i.phase!=='detained'&&v.clock-i.started>45000){ids.forEach(id=>{held.delete(id);v.people[id].chat=undefined;v.people[id].task='inbound';});delete v.order.incidents[key];}
 }
 // Rare, local mutual disputes. Never interrupt news, children, training or caravans.
 if(now>=v.order.nextAt){v.order.nextAt=now+900000;if(!v.duel&&!v.conversation&&!Object.keys(v.order.incidents).length){const defs=activeVillageDefinitions(v,s.roomIndex);for(const town of villageSettlements(s.roomIndex)){const guard=defs.find(d=>d.kind==='guard'&&d.settlement===town.slot);if(!guard||Math.hypot(town.x-s.player.x,town.y-s.player.y)>18)continue;const candidates=defs.filter(d=>adult(d.id)&&d.settlement===town.slot).filter(d=>{const c=v.people[d.id];return c&&c.room===s.roomIndex&&['visit','share'].includes(c.task)&&!c.chat;});let pair:[string,string]|undefined;for(const a of candidates)for(const b of candidates)if(a.id<b.id&&Math.hypot(v.people[a.id].x-v.people[b.id].x,v.people[a.id].y-v.people[b.id].y)<2.5)pair=[a.id,b.id];if(pair){const result=((Math.floor(now/900000)+s.roomIndex)%3===0?reportVillageAssault(s,...pair,now):reportVillageBrawl(s,...pair,now));if(result!==s)v.order=result.village!.order!;break;}}}}
 return held;
}
