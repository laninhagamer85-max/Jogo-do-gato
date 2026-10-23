import {combatMaxHp,type CombatState} from './explorationCombat';
import {nearestVillager,villageDueling} from './explorationVillage';
import {castleDown} from './explorationCastleQuest';
export type AlchemistAction='heal'|'seiva'|'perola';
export const ALCHEMIST_PRICES={heal:40,seiva:250,perola:350} as const;
export function alchemistCommand(s:CombatState,id:string,action:AlchemistAction,now=Date.now()):CombatState{
 if(id!=='celina-alquimista'||nearestVillager(s)?.id!==id||villageDueling(s)||castleDown(s)||s.hp<=0||!Number.isFinite(now)||now<0||!Object.hasOwn(ALCHEMIST_PRICES,action))return s;
 const v=s.village!,cost=ALCHEMIST_PRICES[action],maximum=combatMaxHp(s.xp);
 if(v.coins<cost)return {...s,message:'Moedas insuficientes.'};
 if(action==='heal'&&s.hp>=maximum)return {...s,message:'Sua vida já está completa.'};
 if(action!=='heal'&&(now<(v.gifts[id]??0)||s.rareStock[action]>=9999))return {...s,message:'Estoque raro indisponível. A reposição leva 30 minutos.'};
 return {...s,revision:s.revision+1,hp:action==='heal'?maximum:s.hp,rareStock:action==='heal'?s.rareStock:{...s.rareStock,[action]:s.rareStock[action]+1},village:{...v,coins:v.coins-cost,gifts:action==='heal'?v.gifts:{...v.gifts,[id]:now+1800000}},message:action==='heal'?'Celina restaurou sua vida.':'Poção rara guardada na mochila. Use o consumível na aba de itens.'};
}
