import type {CombatState,CombatPoint} from './explorationCombat';
import type {Citizen} from './explorationVillage';
import {connectedPortal} from './explorationChapter4';
import {resourceNodes,resourceState,RESOURCE_RENEW_MS,type Material} from './explorationWorkshop';
import {villagerDefinition,villageSettlements} from './explorationVillageLayout';
export const isVillageCollector=(d:ReturnType<typeof villagerDefinition>)=>d.kind==='worker'&&!d.warrior&&d.work>=0;
/** NPC travel is independent of player campaign unlocks; only existing adjacent portals. */
export function collectorDestination(home:number,cycle:number){const options=[home-1,home+1].filter(r=>r>=0&&r<32&&connectedPortal(home,r));return options[cycle%Math.max(1,options.length)];}
export function finishCollector(s:CombatState,id:string,c:Citizen){const d=villagerDefinition(id);if(c.cargoMaterial){const town=villageSettlements(d.room)[d.settlement];s.village!.growth={...s.village!.growth,[town.id]:Math.min(24,(s.village!.growth?.[town.id]??0)+1)};c.stock=Math.min(8,c.stock+1);}c.cargoMaterial=undefined;c.cargo=undefined;c.destination=undefined;c.mineral=undefined;c.collecting=false;c.task='inbound';c.timer=0;}
export function collectVisit(s:CombatState,id:string,c:Citizen,dt:number,now:number,travel:(c:Citizen,id:string,target:CombatPoint,dt:number)=>boolean){
 const active=c.room===s.roomIndex;if(active)c.timer=Math.max(0,c.timer-dt);
 const nodes=resourceNodes(c.room);
 let node=c.mineral?nodes.find(n=>n.id===c.mineral&&n.required<=1&&resourceState(s.workshop,n.id,now).remaining>0):undefined;
 if(!node&&!c.collecting){node=nodes.filter(n=>n.required<=1&&resourceState(s.workshop,n.id,now).remaining>0).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y))[0];c.mineral=node?.id;}
 const back=()=>{c.collecting=false;c.mineral=undefined;c.task='caravan-back';c.timer=45000;};
 if(!node){back();return;}
 if(active&&!c.collecting){if(c.timer===0){back();return;}if(!travel(c,id,{x:node.x+.8,y:node.y+.1},dt))return;c.collecting=true;c.timer=3000;c.facing={x:-1,y:0};return;}
 if(c.timer>0)return;
 const state=resourceState(s.workshop,node.id,now);if(state.remaining>0){s.workshop={...s.workshop!,nodes:{...s.workshop!.nodes,[node.id]:{remaining:state.remaining-1,respawnAt:state.remaining===1?now+RESOURCE_RENEW_MS:0}}};c.cargoMaterial=node.material;}
 back();
}
export const collectorTool=(room:number,id:string|undefined)=>id?resourceNodes(room).find(n=>n.id===id)?.tool:undefined;
export const readCollectorMaterial=(value:unknown):Material|undefined=>['wood','stone','copperOre','ironOre','resin','blueBerry','goldOre','diamond'].includes(String(value))?value as Material:undefined;
