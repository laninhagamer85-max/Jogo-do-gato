import {combatLevel,type CombatState} from './explorationCombat';
export type LegendId='lyra'|'kael';
export type LegendGender='menina'|'menino';
export type LegendWeapon='dagger'|'sword'|'bow';
export type LegendProgress={unlocked:LegendId[];active:LegendId|null;weapons:LegendWeapon[];weapon:LegendWeapon|null};
export const LEGENDS=[
 {id:'lyra',name:'Lyra',title:'Guardiã da Clareira',gender:'menina',slot:0,ready:true},
 {id:'soren',name:'Soren',title:'Viajante das Brumas',gender:'menino',slot:1,ready:false},
 {id:'ayla',name:'Ayla',title:'Sentinela Rubra',gender:'menina',slot:2,ready:false},
 {id:'drake',name:'Drake',title:'Guardião das Escamas',gender:'menino',slot:3,ready:false},
 {id:'orion',name:'Orion',title:'Caçador do Crepúsculo',gender:'menino',slot:4,ready:false},
 {id:'ember',name:'Ember',title:'Chama do Bosque',gender:'menina',slot:5,ready:false},
 {id:'rowan',name:'Rowan',title:'Explorador das Raízes',gender:'menino',slot:6,ready:false},
 {id:'kael',name:'Kael',title:'Aventureiro dos Ventos',gender:'menino',slot:7,ready:true},
] as const;
export const LEGEND_WEAPONS={
 dagger:{name:'Adaga de trilha',bonus:3,range:1.25,fibra:12,ambar:6,rare:null,description:'+3 de ataque; golpe curto e frontal.'},
 sword:{name:'Espada de cristal',bonus:6,range:1.6,fibra:24,ambar:12,rare:'cristal',description:'+6 de ataque; alcance de 1,6 passos.'},
 bow:{name:'Arco do bosque',bonus:2,range:5,fibra:18,ambar:8,rare:'seiva',description:'+2 de ataque; dispara uma flecha à frente até 5 passos. Obstáculos bloqueiam.'},
} as const;
export function readLegendProgress(value:unknown):LegendProgress{
 const r=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const unlocked=[...new Set(Array.isArray(r.unlocked)?r.unlocked.filter((v):v is LegendId=>v==='lyra'||v==='kael'):[])];
 const weapons=[...new Set(Array.isArray(r.weapons)?r.weapons.filter((v):v is LegendWeapon=>v==='dagger'||v==='sword'||v==='bow'):[])];
 return {unlocked,active:unlocked.includes(r.active as LegendId)?r.active as LegendId:null,weapons,weapon:weapons.includes(r.weapon as LegendWeapon)?r.weapon as LegendWeapon:null};
}
export const LEGEND_UNLOCK_LEVEL=6;
export const LEGEND_UNLOCK_RECIPE={fibra:180,ambar:60,cristal:6,seiva:8} as const;
export function legendUnlockRequirements(game:CombatState){
 const materials=(Object.keys(LEGEND_UNLOCK_RECIPE) as (keyof typeof LEGEND_UNLOCK_RECIPE)[]).map(item=>({item,required:LEGEND_UNLOCK_RECIPE[item],owned:item==='fibra'||item==='ambar'?game.stock[item]+game.bag[item]:game.rareStock[item]+game.rareBag[item]}));
 const level=combatLevel(game.xp),firstRoom=game.completedRooms.includes(0);
 return {level,firstRoom,materials,ready:!game.completed&&firstRoom&&level>=LEGEND_UNLOCK_LEVEL&&materials.every(m=>m.owned>=m.required)};
}
export function eligibleLegend(gender:LegendGender){return gender==='menina'?'lyra':'kael';}
export function legendWeapon(game:Pick<CombatState,'legends'>){const l=game.legends;return l?.active&&l.weapon&&l.weapons.includes(l.weapon)?LEGEND_WEAPONS[l.weapon]:null;}
export function legendName(game:Pick<CombatState,'legends'>){return LEGENDS.find(l=>l.id===game.legends?.active)?.name;}
export type LegendAction={type:'unlock';id:LegendId}|{type:'select';id:LegendId|null}|{type:'craft';weapon:LegendWeapon}|{type:'equip';weapon:LegendWeapon|null};
/** Inventory commands are immutable and atomic; no resource or ownership changes on a failed command. */
export function changeLegend(game:CombatState,gender:LegendGender,action:LegendAction):CombatState{
 if(game.completed)return game;
 const l=readLegendProgress(game.legends),eligible=eligibleLegend(gender);
 if(action.type==='unlock'){
  if(action.id!==eligible||!legendUnlockRequirements(game).ready||l.unlocked.includes(action.id))return game;
  const next={...game,stock:{...game.stock},bag:{...game.bag},rareStock:{...game.rareStock},rareBag:{...game.rareBag}};
  for(const key of ['fibra','ambar'] as const){const take=Math.min(next.bag[key],LEGEND_UNLOCK_RECIPE[key]);next.bag[key]-=take;next.stock[key]-=LEGEND_UNLOCK_RECIPE[key]-take;}
  for(const key of ['cristal','seiva'] as const){const take=Math.min(next.rareBag[key],LEGEND_UNLOCK_RECIPE[key]);next.rareBag[key]-=take;next.rareStock[key]-=LEGEND_UNLOCK_RECIPE[key]-take;}
  if(next.rareEquipped&&next.rareStock[next.rareEquipped]+next.rareBag[next.rareEquipped]===0)next.rareEquipped=null;
  l.unlocked.push(action.id);
  return {...next,legends:l,campaignVersion:Math.max(4,game.campaignVersion) as CombatState['campaignVersion'],revision:game.revision+1,message:'Lendário despertado! Materiais consumidos. Selecione Jogar para explorar.'};
 }else if(action.type==='select'){
  if(action.id!==null&&(action.id!==eligible||!l.unlocked.includes(action.id)))return game;
  if(l.active===action.id)return game;l.active=action.id;
 }else if(action.type==='equip'){
  if(!l.active||l.active!==eligible||action.weapon!==null&&!l.weapons.includes(action.weapon))return game;
  l.weapon=action.weapon;
 }else{
  if(!l.active||l.active!==eligible||l.weapons.includes(action.weapon))return game;
  const recipe=LEGEND_WEAPONS[action.weapon];if(!recipe)return game;
  if(game.stock.fibra+game.bag.fibra<recipe.fibra||game.stock.ambar+game.bag.ambar<recipe.ambar||recipe.rare&&game.rareStock[recipe.rare]+game.rareBag[recipe.rare]<1)return game;
  const next={...game,stock:{...game.stock},bag:{...game.bag},rareStock:{...game.rareStock},rareBag:{...game.rareBag}};
  for(const key of ['fibra','ambar'] as const){const take=Math.min(next.bag[key],recipe[key]);next.bag[key]-=take;next.stock[key]-=recipe[key]-take;}
  if(recipe.rare){if(next.rareBag[recipe.rare]>0)next.rareBag[recipe.rare]--;else next.rareStock[recipe.rare]--;}
  l.weapons.push(action.weapon);l.weapon=action.weapon;
  return {...next,legends:l,campaignVersion:Math.max(4,game.campaignVersion) as CombatState['campaignVersion'],revision:game.revision+1,message:`${recipe.name}: fabricação concluída e arma equipada.`};
 }
 return {...game,legends:l,campaignVersion:Math.max(4,game.campaignVersion) as CombatState['campaignVersion'],revision:game.revision+1,message:l.active?`${legendName({legends:l})} está ${l.active==='lyra'?'pronta':'pronto'} para explorar.`:'Seu gato voltou à exploração.'};
}
/** Rows S,SW,W,NW,N,NE,E,SE. A stopped body stays on an idle frame. */
export function legendAnimation(dx:number,dy:number,walking:boolean,walkPhase:number,time:number,strikeUntil:number,reduced=false){
 const angle=Math.atan2(dy,dx),sector=((Math.round(angle/(Math.PI/4))%8)+8)%8;
 const row=[6,7,0,1,2,3,4,5][sector],attacking=strikeUntil>time&&strikeUntil-time<=320;
 const frame=attacking?4+Math.min(3,Math.floor((1-(strikeUntil-time)/320)*4)):walking&&!reduced?Math.min(3,Math.floor(walkPhase*4)):0;
 return {row,frame,attacking};
}
