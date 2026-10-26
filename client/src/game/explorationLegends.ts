import {clearRoyalSlot,castleDown} from './explorationCastleQuest';
import {LEGEND_KITS,legendKit,signatureActive,type SignatureSlot} from './explorationLegendKits';
import {tierWeaponStats} from './explorationEquipmentTiers';
import {combatLevel,type CombatState} from './explorationCombat';
export type LegendId='lyra'|'kael'|'soren'|'ayla';
export type LegendGender='menina'|'menino';
export type LegendWeapon='dagger'|'sword'|'bow';
export type LegendProgress={signature?:{weapon:boolean;tool:boolean};unlocked:LegendId[];active:LegendId|null;weapons:LegendWeapon[];weapon:LegendWeapon|null};
export const LEGENDS=[
 {id:'lyra',name:'Lyra',title:'Guardiã da Clareira',gender:'menina',slot:0,ready:true},
 {id:'soren',name:'Soren',title:'Viajante das Brumas',gender:'menino',slot:1,ready:true},
 {id:'ayla',name:'Ayla',title:'Sentinela Rubra',gender:'menina',slot:2,ready:true},
 {id:'drake',name:'Drake',title:'Guardião das Escamas',gender:'menino',slot:3,ready:false},
 {id:'orion',name:'Orion',title:'Caçador do Crepúsculo',gender:'menino',slot:4,ready:false},
 {id:'ember',name:'Ember',title:'Chama do Bosque',gender:'menina',slot:5,ready:false},
 {id:'rowan',name:'Rowan',title:'Explorador das Raízes',gender:'menino',slot:6,ready:false},
 {id:'kael',name:'Kael',title:'Aventureiro dos Ventos',gender:'menino',slot:7,ready:true},
] as const;
export const LEGEND_WEAPONS={
 dagger:{name:'Adaga de trilha',bonus:3,range:1.25,fibra:12,ambar:6,rare:null,description:'+3 de ataque; golpe curto e frontal.'},
 sword:{name:'Espada de trilha',bonus:6,range:1.6,fibra:24,ambar:12,rare:'cristal',description:'+6 de ataque; alcance de 1,6 passos.'},
 bow:{name:'Arco do bosque',bonus:2,range:5,fibra:18,ambar:8,rare:'seiva',description:'+2 de ataque; dispara uma flecha à frente até 5 passos. Obstáculos bloqueiam.'},
} as const;
export function readLegendProgress(value:unknown):LegendProgress{
 const r=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const unlocked=[...new Set(Array.isArray(r.unlocked)?r.unlocked.filter((v):v is LegendId=>v==='lyra'||v==='kael'||v==='soren'||v==='ayla'):[])];
 const weapons=[...new Set(Array.isArray(r.weapons)?r.weapons.filter((v):v is LegendWeapon=>v==='dagger'||v==='sword'||v==='bow'):[])];
 const active=unlocked.includes(r.active as LegendId)?r.active as LegendId:null;
 const signature=r.signature&&typeof r.signature==='object'?{weapon:(r.signature as Record<string,unknown>).weapon===true,tool:(r.signature as Record<string,unknown>).tool===true}:undefined;
 const kit=active==='soren'||active==='ayla'?LEGEND_KITS[active]:null;
 const weapon=weapons.includes(r.weapon as LegendWeapon)||kit&&signature?.weapon&&r.weapon===kit.weapon?r.weapon as LegendWeapon:null;
 return {unlocked,active,weapons,weapon,...(signature?{signature}:{})};
}
export const LEGEND_UNLOCK_LEVEL=6;
export const LEGEND_UNLOCK_RECIPE={fibra:60,ambar:20,cristal:0,seiva:0,perola:0,escama:0} as const;
export function legendUnlockRule(id:LegendId){
 if(id==='soren'||id==='ayla')return {level:12,room:9,starter:id==='soren'?'kael' as const:'lyra' as const,recipe:{...LEGEND_UNLOCK_RECIPE,fibra:80,ambar:40,cristal:1,perola:id==='soren'?2:0,escama:id==='ayla'?2:0}};
 return {level:LEGEND_UNLOCK_LEVEL,room:0,starter:null,recipe:LEGEND_UNLOCK_RECIPE};
}
export function legendUnlockRequirements(game:CombatState,id:LegendId='lyra'){
 const rule=legendUnlockRule(id),recipe=rule.recipe;
 const materials=(Object.keys(recipe) as (keyof typeof recipe)[]).filter(item=>recipe[item]>0).map(item=>({item,required:recipe[item],owned:item==='fibra'||item==='ambar'?game.stock[item]+game.bag[item]:game.rareStock[item]+game.rareBag[item]}));
 const level=combatLevel(game.xp),firstRoom=game.completedRooms.includes(0),chapterComplete=game.completedRooms.includes(rule.room),starterReady=!rule.starter||Boolean(game.legends?.unlocked.includes(rule.starter));
 return {level,firstRoom,chapterComplete,starterReady,rule,materials,ready:!game.completed&&chapterComplete&&starterReady&&level>=rule.level&&materials.every(m=>m.owned>=m.required)};
}
export function compatibleLegend(id:LegendId,gender:LegendGender){return LEGENDS.some(h=>h.id===id&&h.ready&&h.gender===gender);}
/** Resume any owned, compatible hero; the starter is not the only valid selection. */
export function resumeLegendSelection(game:CombatState,gender:LegendGender):CombatState{
 const legends=readLegendProgress(game.legends);
 return game.legends?.active&&(!legends.active||!compatibleLegend(legends.active,gender))
  ?{...game,legends:{...legends,active:null}}
  :game;
}
export function eligibleLegend(gender:LegendGender){return gender==='menina'?'lyra':'kael';}
export function legendWeapon(game:Pick<CombatState,'legends'|'workshop'>&Partial<Pick<CombatState,'castleQuest'>>){const l=game.legends;if(!l?.active||!l.weapon||!l.weapons.includes(l.weapon)&&!signatureActive(game,'weapon'))return null;const base=LEGEND_WEAPONS[l.weapon],kit=legendKit(game);if(kit&&signatureActive(game,'weapon'))return {...base,name:kit.weaponName,bonus:kit.bonus,range:kit.range,description:kit.weaponDescription};return {...base,...tierWeaponStats(base,game.workshop?.equipmentTiers[l.weapon]??null)};}
export function legendName(game:Pick<CombatState,'legends'>){return LEGENDS.find(l=>l.id===game.legends?.active)?.name;}
export type LegendAction={type:'signature';slot:SignatureSlot;equipped:boolean}|{type:'unlock';id:LegendId}|{type:'select';id:LegendId|null}|{type:'craft';weapon:LegendWeapon}|{type:'equip';weapon:LegendWeapon|null};
/** Inventory commands are immutable and atomic; no resource or ownership changes on a failed command. */
export function changeLegend(game:CombatState,gender:LegendGender,action:LegendAction):CombatState{if(game.village?.duel||castleDown(game))return game;
 if(game.completed)return game;
 const l=readLegendProgress(game.legends);
 if(action.type==='unlock'){
  if(!compatibleLegend(action.id,gender)||!legendUnlockRequirements(game,action.id).ready||l.unlocked.includes(action.id))return game;
  const recipe=legendUnlockRule(action.id).recipe;
  const next={...game,stock:{...game.stock},bag:{...game.bag},rareStock:{...game.rareStock},rareBag:{...game.rareBag}};
  for(const key of ['fibra','ambar'] as const){const take=Math.min(next.bag[key],recipe[key]);next.bag[key]-=take;next.stock[key]-=recipe[key]-take;}
  for(const key of ['cristal','seiva','perola','escama'] as const){const take=Math.min(next.rareBag[key],recipe[key]);next.rareBag[key]-=take;next.rareStock[key]-=recipe[key]-take;}
  if(next.rareEquipped&&next.rareStock[next.rareEquipped]+next.rareBag[next.rareEquipped]===0)next.rareEquipped=null;
  l.unlocked.push(action.id);
  return {...next,legends:l,campaignVersion:Math.max(l.unlocked.some(id=>id==='soren'||id==='ayla')?16:4,game.campaignVersion) as CombatState['campaignVersion'],revision:game.revision+1,message:'Lendário despertado! Materiais consumidos uma única vez. Seus equipamentos exclusivos estão disponíveis ao selecionar o personagem.'};
 }else if(action.type==='select'){
  if(action.id!==null&&(!compatibleLegend(action.id,gender)||!l.unlocked.includes(action.id)))return game;
  if(l.active===action.id)return game;l.active=action.id;
  const kit=legendKit({legends:l});if(kit){l.signature={weapon:true,tool:true};l.weapon=kit.weapon;}else if(l.signature){l.signature={weapon:false,tool:false};if(l.weapon&&!l.weapons.includes(l.weapon))l.weapon=null;}
 }else if(action.type==='signature'){
  if(!l.active||!compatibleLegend(l.active,gender)||!legendKit({legends:l}))return game;
  const kit=legendKit({legends:l})!;l.signature={weapon:l.signature?.weapon??false,tool:l.signature?.tool??false,[action.slot]:action.equipped};
  let next:CombatState={...game,legends:l,revision:game.revision+1};
  if(action.slot==='weapon')l.weapon=action.equipped?kit.weapon:null;
  else if(game.workshop)next.workshop={...game.workshop,disabledTools:{...game.workshop.disabledTools,[kit.tool]:!action.equipped}};
  if(action.equipped)next=clearRoyalSlot(next,action.slot==='weapon'?'sword':kit.tool);
  return {...next,message:action.equipped?'Equipamento exclusivo equipado.':'Equipamento exclusivo retirado.'};
 }else if(action.type==='equip'){
  if(!l.active||!compatibleLegend(l.active,gender)||action.weapon!==null&&!l.weapons.includes(action.weapon))return game;
  l.weapon=action.weapon;if(l.signature)l.signature={...l.signature,weapon:false};
 }else{
  if(!l.active||!compatibleLegend(l.active,gender)||l.weapons.includes(action.weapon))return game;
  const recipe=LEGEND_WEAPONS[action.weapon];if(!recipe)return game;
  if(game.stock.fibra+game.bag.fibra<recipe.fibra||game.stock.ambar+game.bag.ambar<recipe.ambar||recipe.rare&&game.rareStock[recipe.rare]+game.rareBag[recipe.rare]<1)return game;
  const next={...game,stock:{...game.stock},bag:{...game.bag},rareStock:{...game.rareStock},rareBag:{...game.rareBag}};
  for(const key of ['fibra','ambar'] as const){const take=Math.min(next.bag[key],recipe[key]);next.bag[key]-=take;next.stock[key]-=recipe[key]-take;}
  if(recipe.rare){if(next.rareBag[recipe.rare]>0)next.rareBag[recipe.rare]--;else next.rareStock[recipe.rare]--;}
  l.weapons.push(action.weapon);l.weapon=action.weapon;if(l.signature)l.signature={...l.signature,weapon:false};
  return {...next,legends:l,campaignVersion:Math.max(l.unlocked.some(id=>id==='soren'||id==='ayla')?16:4,game.campaignVersion) as CombatState['campaignVersion'],revision:game.revision+1,message:`${recipe.name}: fabricação concluída e arma equipada.`};
 }
 return {...game,legends:l,campaignVersion:Math.max(l.unlocked.some(id=>id==='soren'||id==='ayla')?16:4,game.campaignVersion) as CombatState['campaignVersion'],revision:game.revision+1,message:l.active?`${legendName({legends:l})} está ${LEGENDS.find(h=>h.id===l.active)?.gender==='menina'?'pronta':'pronto'} para explorar.`:'Seu gato voltou à exploração.'};
}
/** Rows S,SW,W,NW,N,NE,E,SE. A stopped body stays on an idle frame. */
export function legendAnimation(dx:number,dy:number,walking:boolean,walkPhase:number,time:number,strikeUntil:number,reduced=false){
 const angle=Math.atan2(dy,dx),sector=((Math.round(angle/(Math.PI/4))%8)+8)%8;
 const row=[6,7,0,1,2,3,4,5][sector],attacking=strikeUntil>time&&strikeUntil-time<=320;
 const frame=attacking?4+Math.min(3,Math.floor((1-(strikeUntil-time)/320)*4)):walking&&!reduced?Math.min(3,Math.floor(walkPhase*4)):0;
 return {row,frame,attacking};
}
