import type {CombatState,CombatPoint} from './explorationCombat';
import {villageLayout,villageSettlements,villageSafeAt} from './explorationVillageLayout';
export type CityExile={room:number;settlement:number;until:number};
export function cityBanned(s:CombatState,p:CombatPoint,now=Date.now()){const ban=s.village?.exile;if(!ban||now>=ban.until||ban.room!==s.roomIndex)return false;const town=villageSettlements(ban.room)[ban.settlement];return Boolean(town&&Math.hypot(p.x-town.x,p.y-town.y)<11);}
export function safeSettlement(s:CombatState,p=s.player){return !s.castle?.active&&Boolean(villageSafeAt(s.roomIndex,p))&&!cityBanned(s,p);}
export function guardDirections(_room:number,_settlement:number){return 'Protejo o centro da cidade. Para comprar ou vender, siga ao sul do poço até a barraca. O empório fica a oeste; as oficinas e a casa de cura ficam ao norte. Não ataque a guarda: a expulsão dura de 5 a 10 minutos.';}
/** Immutable penalty. Navigation/collision keep an expelled player outside the protected center. */
export function expelFromCity(s:CombatState,settlement:number,walkable:(p:CombatPoint)=>boolean,now=Date.now()){
 const town=villageSettlements(s.roomIndex)[settlement];if(!town||!s.village)return s;
 const last=s.village.exile;if(last&&last.until>now)return {...s,message:`Aguarde ${Math.ceil((last.until-now)/60000)}min para voltar ao centro.`};
 const minutes=5+((s.seed+s.deaths+settlement)%6),points=Array.from({length:24},(_,i)=>({x:town.x+Math.cos(i*Math.PI/12)*12.8,y:town.y+Math.sin(i*Math.PI/12)*12.8}));
 const exit=points.find(p=>walkable(p)&&!villageSafeAt(s.roomIndex,p));if(!exit)return {...s,message:'A guarda advertiu: não ataque os moradores.'};
 return {...s,revision:s.revision+1,player:exit,walking:false,powerFx:undefined,strikeUntil:0,invulnerableUntil:s.time+2000,village:{...s.village,exile:{room:s.roomIndex,settlement,until:now+minutes*60000}},message:`A guarda expulsou você do centro por ${minutes} minutos. Você pode explorar os arredores.`};
}
