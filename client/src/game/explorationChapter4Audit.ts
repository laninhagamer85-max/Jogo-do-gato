import {createCombatState,moveCombatPoint,pilotRoute,pilotWalkable,type CombatPoint} from './explorationCombat';
import {villageLayout,villageSettlements,villageDoor} from './explorationVillageLayout';
import {nascentesHeight} from './explorationChapter4';
import {chapter4Review} from './explorationNascentesLayout';

export type VillageAudit={slot:number;name:string;elevated:boolean;steps:number;ok:boolean;errors:string[]};
/** Isolated deterministic traversal using the exact movement/collision function used by gameplay. */
export function auditChapter4Villages(index:number):VillageAudit[]{
 if(!chapter4Review(index))return [];
 const state=createCombatState(index),towns=villageSettlements(index),pending=[...towns],results:VillageAudit[]=[];
 let player={...state.player};
 while(pending.length){
  pending.sort((a,b)=>Math.hypot(player.x-a.x,player.y-a.y)-Math.hypot(player.x-b.x,player.y-b.y));
  const town=pending.shift()!,errors:string[]=[],doors=villageLayout(index).homes.filter(h=>h.settlement===town.slot).map(h=>({x:h.x,y:h.y+.8}));
  let steps=0;
  if(town.elevated)for(const building of [...villageLayout(index).homes,...villageLayout(index).markets].filter(h=>h.settlement===town.slot))for(const dx of [-1.45,1.45])for(const dy of [-2.05,.12])if(nascentesHeight({x:building.x+dx,y:building.y+dy},index)<.9)errors.push('Construção fora do piso elevado: '+building.id);

  for(const goal of [villageDoor(town.slot*3,index),{x:town.x,y:town.y+2},...doors]){
   const route=pilotRoute(player,goal,true,index,state.workshop);
   if(!route.length&&Math.hypot(player.x-goal.x,player.y-goal.y)>.05){errors.push('Sem caminho para '+JSON.stringify(goal));continue;}
   for(const point of route){
    let remaining=200;
    while(Math.hypot(player.x-point.x,player.y-point.y)>.025&&remaining-->0){
     const distance=Math.hypot(point.x-player.x,point.y-player.y),step=Math.min(.15,distance);
     const next=moveCombatPoint(player,(point.x-player.x)/distance*step,(point.y-player.y)/distance*step,true,.22,index,state.workshop);
     if(Math.hypot(next.x-player.x,next.y-player.y)<.00001){errors.push('Movimento bloqueado em '+JSON.stringify(player));break;}
     player=next;steps++;
    }
    if(remaining<=0)errors.push('Percurso não terminou.');
   }
   if(!pilotWalkable(goal,true,.22,index,state.workshop))errors.push('Destino bloqueado.');
   if(town.elevated&&nascentesHeight(goal,index)<.9)errors.push('Destino fora do piso elevado.');
  }
  results.push({slot:town.slot,name:town.name,elevated:town.elevated,steps,ok:errors.length===0,errors});
 }
 return results.sort((a,b)=>a.slot-b.slot);
}
