import {EXPLORATION_ROOMS,campaignEnemies,rareDropChance,rareDropKind,type CampaignEnemy} from './explorationCampaign';
/** All guide facts are drawn from the same authored definitions and seeded generator as combat. */
const lore:Record<string,string>={Besouro:'Pequeno habitante das trilhas que protege as fibras da clareira.',Lagarta:'Procura âmbar perto das pedras e dos troncos.', 'Escaravelho Esmeralda':'Patrulha as bordas do bosque e avança quando o pet se aproxima.','Cogumelo Saltador':'Prefere trechos úmidos e protege ervas de cura.','Guardião dos Troncos':'Defensor raro das árvores antigas.','Mestre dos Troncos':'Guardião final da Clareira dos Troncos.','Caranguejo Azul':'Protege as margens e os cristais do riacho.','Rã Ametista':'Habitante ágil das margens com reservas de ervas.','Mestre das Marés':'Guardião final do Riacho dos Cristais.','Tatu do Âmbar':'Protege o caminho com sua carapaça de âmbar.','Mariposa Cobre':'Vigia as raízes com suas asas cor de cobre.','Javali das Avelãs':'Defende as sementes sob sua armadura de musgo.','Mestre do Âmbar':'Guardião ancestral do santuário dourado.'};
export function explorationBestiary(){
 const entries=new Map<string,{name:string;lore:string;rooms:number[];variants:CampaignEnemy[]}>();
 for(const room of EXPLORATION_ROOMS)for(const seed of [1,42,999])for(const enemy of campaignEnemies(room.index,seed)){
  let e=entries.get(enemy.name);if(!e){e={name:enemy.name,lore:lore[enemy.name]??'Habitante deste bioma.',rooms:[],variants:[]};entries.set(enemy.name,e);}
  if(!e.rooms.includes(room.index))e.rooms.push(room.index);
  if(!e.variants.some(v=>v.level===enemy.level&&v.hp===enemy.hp))e.variants.push(enemy);
 }
 return [...entries.values()].map(e=>({...e,minLevel:Math.min(...e.variants.map(v=>v.level)),maxLevel:Math.max(...e.variants.map(v=>v.level)),minHp:Math.min(...e.variants.map(v=>v.hp)),maxHp:Math.max(...e.variants.map(v=>v.hp)),drops:[...new Set(e.variants.map(v=>v.item))],rareDrops:[...new Set(e.variants.filter(v=>rareDropChance(v)>0).map(rareDropKind))],minChance:Math.min(...e.variants.map(rareDropChance)),maxChance:Math.max(...e.variants.map(rareDropChance))}));
}
