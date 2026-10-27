import type {CombatState} from './explorationCombat';
import {campaignRoom} from './explorationCampaign';
/** Exactly one actionable objective, ordered like the room's real unlock checks. */
export function explorationNextStep(s:CombatState){const r=campaignRoom(s.roomIndex),steps:Array<{text:string;done:boolean;progress?:string}>=[];
 if(s.roomIndex>=30)return {text:s.roomIndex===39?'Visite o Castelo Bônus ou retorne pela passagem da sala 39.':'Explore a vila e use os portais para visitar as outras salas.',progress:'Visitação livre · cenários em revisão',step:1,total:1};
 if(s.gateOpen)return {text:s.roomIndex>=30?'Suba a escadaria e entre no portal.':'Entre no portal luminoso para a próxima sala.',progress:'Passagem liberada',step:1,total:1};
 const fibers=s.roomIndex===0?s.stock.fibra+s.bag.fibra:s.roomCollectedFibers,encounters=s.roomIndex===0?s.defeated:s.defeatedEnemyIds.length;
 if(r.fibers)steps.push({text:'Recolha fibras nos pontos de coleta do cenário.',done:fibers>=r.fibers,progress:`${Math.min(fibers,r.fibers)}/${r.fibers} fibras`});
 if(s.roomIndex<30&&r.encounters)steps.push({text:'Vença os NPCs hostis fora das vilas.',done:encounters>=r.encounters,progress:`${Math.min(encounters,r.encounters)}/${r.encounters} encontros`});
 if(r.switches.length)steps.push({text:`Vá à placa ${Math.min(r.switches.length,s.switchStep+1)} e use o botão de interação.`,done:s.switchStep>=r.switches.length,progress:`${s.switchStep}/${r.switches.length} placas`});
 if(s.roomIndex<30){if(r.key)steps.push({text:'Encontre e recolha a chave da sala.',done:s.hasRoomKey});if(r.bridge)steps.push({text:'Atravesse a ponte até o outro lado.',done:s.bridgeCrossed});if(r.useConsumable)steps.push({text:'Use uma fruta ou erva nos atalhos de itens.',done:s.consumablesUsed>0});if(r.bossId)steps.push({text:'Derrote o mestre deste capítulo.',done:s.defeatedEnemyIds.includes(r.bossId)});steps.push({text:'Aproxime-se do marco e use o botão de interação.',done:false});}
 const i=steps.findIndex(x=>!x.done),next=steps[i]??{text:'Siga até a passagem para liberar o portal.',progress:'Desafios concluídos'};return {text:next.text,progress:next.progress,step:i<0?steps.length:i+1,total:Math.max(1,steps.length)};
}
