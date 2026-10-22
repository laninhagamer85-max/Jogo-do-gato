import type {CombatState} from './explorationCombat';
import {newVillage,villageDueling} from './explorationVillage';
import {villageLayout,type MarketId} from './explorationVillageLayout';
export const MARKET_GOODS={wood:{name:'Madeira',buy:4,sell:1},stone:{name:'Pedra',buy:4,sell:1},erva:{name:'Erva de cura',buy:6,sell:2},fruta:{name:'Fruta',buy:8,sell:3}} as const;
export type MarketGood=keyof typeof MARKET_GOODS;
export const MARKET_TRADES=[{give:'wood',quantity:5,receive:'fruta',output:2},{give:'stone',quantity:3,receive:'erva',output:1}] as const;
export const marketCount=(s:CombatState,key:MarketGood)=>key==='wood'||key==='stone'?s.workshop?.materials[key]??0:s.stock[key];
export function nearMarket(s:CombatState){if(s.castle?.active||villageDueling(s))return;return villageLayout(s.roomIndex).markets.filter(m=>m.art!==2).find(m=>Math.hypot(m.x-s.player.x,m.y+.9-s.player.y)<2);}
export function marketGoods(id:MarketId):MarketGood[]{id=id.split(':').pop()!;return id==='frutas'?['fruta','erva']:id==='materiais'?['wood','stone']:['fruta','erva','wood','stone'];}
export function marketAvailable(s:CombatState,key:MarketGood,now=Date.now()){const r=s.village?.shops?.[key];return !r||now>=r.renewAt?8:8-r.sold;}
export type MarketAction={type:'buy'|'sell';item:MarketGood}|{type:'trade';recipe:0|1};
/** Atomic one-unit purchases/sales, bounded common resources, no equipped or unique item keys accepted. */
export function marketCommand(s:CombatState,id:MarketId,action:MarketAction,now=Date.now()):CombatState{
 if(!Number.isFinite(now)||now<0||nearMarket(s)?.id!==id)return s;
 const v=s.village??newVillage(),goods=marketGoods(id);let debit:MarketGood|undefined,credit:MarketGood|undefined,take=0,give=0,coins=v.coins;
 if(action.type==='trade'){const r=MARKET_TRADES[action.recipe];if(!r||!goods.includes(r.receive))return s;debit=r.give;take=r.quantity;credit=r.receive;give=r.output;}
 else {if(!Object.hasOwn(MARKET_GOODS,action.item)||!goods.includes(action.item))return s;const p=MARKET_GOODS[action.item];if(action.type==='buy'){credit=action.item;give=1;coins-=p.buy;}else if(action.type==='sell'){debit=action.item;take=1;coins+=p.sell;}else return s;}
 const error=coins<0?'Moedas insuficientes. Venda recursos comuns ou faça uma troca.':coins>999999?'Limite de moedas atingido.':debit&&marketCount(s,debit)<take?'Você ainda não tem os materiais necessários.':credit&&marketCount(s,credit)+give>9999?'Seu inventário está cheio.':credit&&marketAvailable(s,credit,now)<give?'Estoque esgotado. A reposição ocorre em 30 minutos.':null;
 if(error)return {...s,message:error};
 const n={...s,revision:s.revision+1,stock:{...s.stock},workshop:{...s.workshop!,materials:{...s.workshop!.materials}},village:{...v,coins,shops:{...v.shops}}};
 const add=(key:MarketGood,delta:number)=>{if(key==='wood'||key==='stone')n.workshop.materials[key]+=delta;else n.stock[key]+=delta;};if(debit)add(debit,-take);if(credit){add(credit,give);const old=v.shops[credit],expired=!old||now>=old.renewAt;n.village.shops[credit]={sold:(expired?0:old.sold)+give,renewAt:expired?now+1800000:old.renewAt};}
 n.message=action.type==='trade'?'Troca concluída.':action.type==='buy'?'Compra concluída. Item guardado na mochila.':'Venda concluída. Moedas recebidas.';return n;
}
