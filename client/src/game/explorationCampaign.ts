import {ROOM_WALLS,ROOM_SCENERY,PILOT_SHELTER,ROOM_GARDENS,SCATTERED_GARDENS,hitsEdgeScenery} from './explorationRoom';
import {pondComposition,insideRegion,touchesRegion,type BiomeComposition} from './biomeComposition';
import {insideExploration} from './explorationWorld';
import type {CombatItem,CombatPoint} from './explorationCombat';
export type CampaignEnemy=CombatPoint&{id:string;name:string;level:number;rarity:'common'|'uncommon'|'rare';hp:number;attack:number;defense:number;xp:number;item:CombatItem;quantity:number;art?:'forest-mobs';spriteRow?:number;speed?:number;detection?:number;leash?:number;width?:number;radius?:number;attackRange?:number};
export type CampaignNode=CombatPoint&{id:string;item:CombatItem;quantity:number};
export type CampaignProp=CombatPoint&{index:number;width:number;height:number};
export type CampaignRoom={biome:'forest';index:number;title:string;hint:string;camp:CombatPoint;marker:CombatPoint;exit:CombatPoint;walls:CombatPoint[];scenery:CampaignProp[];nodes:CampaignNode[];enemies:CampaignEnemy[];fibers:number;encounters:number;switches:CombatPoint[];key?:CombatPoint;useConsumable?:boolean;bridge?:{x:number;y:number;width:number;height:number};composition?:BiomeComposition;gateBlock?:CombatPoint};
const camp={x:1.5,y:1.5};
const node=(id:string,x:number,y:number,item:CombatItem='fibra',quantity=3):CampaignNode=>({id,x,y,item,quantity});
const enemy=(id:string,x:number,y:number,level:number,kind:'beetle'|'caterpillar'='beetle'):CampaignEnemy=>({id,x,y,level,name:kind==='beetle'?'Besouro':'Lagarta',rarity:kind==='beetle'?'common':'uncommon',hp:(kind==='beetle'?40:58)+(level-1)*9,attack:(kind==='beetle'?9:12)+(level-1)*2,defense:kind==='beetle'?1:3,xp:20+level*8,item:kind==='beetle'?'fibra':'ambar',quantity:kind==='beetle'?3:2});
const props=(entries:number[][])=>({walls:entries.flatMap(([x,y,w,h])=>Array.from({length:w*h},(_,i)=>({x:x+i%w,y:y+Math.floor(i/w)}))),scenery:entries.map(([x,y,w,h,index])=>({x:x+w/2,y:y+h-.08,index,width:index===2?w+.1:w+.3,height:index===2?h*.8:h+.1}))});
const first:CampaignRoom={biome:'forest',index:0,title:'Coleta inicial',hint:'Colete 6 fibras, enfrente um besouro e ative o marco.',camp,marker:{x:8.5,y:4.5},exit:{x:12.4,y:4.5},walls:ROOM_WALLS,scenery:ROOM_SCENERY,nodes:[node('fern-a',2.5,4.5),node('fern-b',6.5,7.5),node('healing-leaf',3.5,7.5,'erva',1)],enemies:[{id:'beetle',name:'Besouro',level:1,rarity:'common',hp:40,attack:9,defense:1,xp:25,item:'fibra',quantity:3,x:4,y:6.5},{id:'caterpillar',name:'Lagarta',level:3,rarity:'uncommon',hp:80,attack:16,defense:3,xp:55,item:'ambar',quantity:2,x:10.5,y:3}],fibers:6,encounters:1,switches:[],gateBlock:{x:9,y:4}};
const room=(index:number,title:string,hint:string,exit:CombatPoint,marker:CombatPoint,obstacles:number[][],nodes:CampaignNode[],enemies:CampaignEnemy[],extra:Partial<CampaignRoom>={}):CampaignRoom=>({biome:'forest',index,title,hint,camp,exit,marker,...props(obstacles),nodes,enemies,fibers:6,encounters:1,switches:[],...extra});
export const EXPLORATION_ROOMS:readonly CampaignRoom[]=[first,
 room(1,'Primeira patada','Vença dois encontros. A patada acerta à frente; o poder alcança ao redor.',{x:15.5,y:6.5},{x:11.5,y:5.5},[[4,3,2,1,2],[8,7,1,1,0],[12,2,1,1,4]],[node('f1',3.5,5.5),node('f2',13.5,8.5),node('heal',6.5,8.5,'erva',1)],[enemy('beetle-a',6,5.5,1),enemy('beetle-b',12,7,1)],{encounters:2}),
 room(2,'Tronco e placa','Ative as placas 1 e 2 nesta ordem usando Marco; depois alcance a saída.',{x:15.5,y:3.5},{x:12.5,y:4.5},[[4,3,2,1,2],[4,6,2,1,2],[9,4,1,1,4]],[node('f1',2.5,7.5),node('f2',10.5,7.5)],[enemy('beetle-a',8,6,1)],{switches:[{x:3.5,y:5.5},{x:8.5,y:2.5}]}),
 room(3,'Atalho das pedras','Contorne os grupos de pedras. A saída fica a oeste e há âmbar no desvio.',{x:-2.5,y:6.5},{x:-.5,y:5.5},[[3,4,1,1,0],[5,4,1,1,0],[7,4,1,1,0],[9,4,2,1,2]],[node('f1',-2.5,2.5),node('f2',5.5,7.5),node('rare',11.5,6.5,'ambar',1)],[enemy('beetle-a',2,5.5,2),enemy('caterpillar-a',8,7.5,2,'caterpillar')]),
 room(4,'Ponte curta','Atravesse a ponte do lado esquerdo ao direito. A água bloqueia a passagem.',{x:16.5,y:5.5},{x:12.5,y:5.5},[[4,3,2,1,2],[11,2,1,1,0]],[node('f1',3.5,4.5),node('f2',11.5,7.5)],[enemy('beetle-a',5,6.5,2),enemy('caterpillar-a',13,3,2,'caterpillar')],{composition:pondComposition('chapter1-short-bridge',{x:8.5,y:5.5},1.3),bridge:{x:6,y:4.95,width:4.8,height:1.1}}),
 room(5,'Chave da trilha','Procure a chave dourada na trilha oeste e depois ative o marco do leste.',{x:16.5,y:8.5},{x:14.5,y:7.5},[[4,2,2,1,2],[4,7,2,1,2],[10,5,1,1,0]],[node('f1',2.5,5.5),node('f2',9.5,8.5)],[enemy('beetle-a',7,5,2),enemy('caterpillar-a',13,6,2,'caterpillar')],{key:{x:-2.5,y:4.5}}),
 room(6,'Preparar consumível','Use o poder e uma fruta para recuperar energia, ou uma erva depois de receber dano.',{x:9.5,y:12.5},{x:7.5,y:10.5},[[5,3,2,1,2],[9,6,1,1,0],[2,8,1,1,4]],[node('f1',3.5,5.5),node('f2',7.5,8.5),node('fruit',4.5,6.5,'fruta',1),node('heal',5.5,8.5,'erva',1)],[enemy('caterpillar-a',6.5,6,3,'caterpillar'),enemy('beetle-a',10.5,9,3)],{useConsumable:true}),
 room(7,'Lagarta e desvio','Contorne o lago para chegar ao oeste; aproxime-se da lagarta com cuidado.',{x:-2.5,y:8.5},{x:.5,y:8.5},[[3,3,2,1,2],[10,6,2,1,2]],[node('f1',2.5,6.5),node('f2',10.5,8.5),node('fruit',6.5,8,'fruta',1)],[enemy('caterpillar-a',4.5,7,3,'caterpillar'),enemy('beetle-a',10.5,4,3)],{composition:pondComposition('chapter1-lagoon',{x:7.5,y:5},1.25)}),
 room(8,'Coleta opcional rara','A trilha principal segue ao nordeste; a reserva de âmbar fica no desvio sudeste.',{x:16.5,y:2.5},{x:14.5,y:3.5},[[4,5,1,1,0],[8,4,1,1,0],[11,7,1,1,0]],[node('f1',3.5,7.5),node('f2',10.5,2.5),node('heal',6.5,7.5,'erva',1),node('rare',16.5,8.5,'ambar',2)],[enemy('beetle-a',6.5,5.5,3),enemy('caterpillar-a',12.5,6.5,3,'caterpillar'),enemy('caterpillar-b',15,7.5,3,'caterpillar')],{encounters:2}),
 room(9,'Marco e saída','Reúna 9 fibras, vença dois encontros, encontre a chave e ative as três placas em ordem.',{x:16.5,y:6.5},{x:14.5,y:4.5},[[4,3,2,1,2],[8,6,1,1,0],[11,4,2,1,2],[5,8,1,1,4]],[node('f1',3.5,7.5),node('f2',8.5,2.5),node('f3',12.5,8.5),node('heal',10.5,9.5,'erva',1)],[enemy('beetle-a',6.5,6.5,4),enemy('caterpillar-a',11.5,6.5,4,'caterpillar'),enemy('beetle-b',13.5,3.5,4)],{fibers:9,encounters:2,key:{x:6.5,y:11.5},switches:[{x:4.5,y:5.5},{x:9.5,y:8.5},{x:11.5,y:2.5}]})
];
export const campaignRoom=(index=0)=>EXPLORATION_ROOMS[Math.max(0,Math.min(9,Math.floor(index)||0))];
export function campaignWaterBlocks(p:CombatPoint,radius:number,room:CampaignRoom){
 const b=room.bridge;
 if(b&&p.x>=b.x+radius&&p.x<=b.x+b.width-radius&&p.y>=b.y+radius&&p.y<=b.y+b.height-radius)return false;
 return room.composition?.regions.some(r=>r.material==='water'&&touchesRegion(p,radius,r.polygon))??false;
}
/** New room plant groups stay out of solid footprints and special interactions. */
export function campaignGardens(room:CampaignRoom){
 if(!room.index)return [...ROOM_GARDENS,...SCATTERED_GARDENS];
 const shift=(room.index*1.137)%3.8;
 return [...ROOM_GARDENS,...SCATTERED_GARDENS].map((g,i)=>({...g,x:g.x+Math.sin(i*2.1+room.index)*shift,y:g.y+Math.cos(i*1.7+room.index)*shift*.6})).filter(g=>!campaignWaterBlocks(g,.4,room)&&!room.walls.some(w=>Math.abs(g.x-w.x-.5)<.9&&Math.abs(g.y-w.y-.5)<.9)&&[room.camp,room.marker,room.exit,...room.switches,...room.nodes,...(room.key?[room.key]:[])].every(q=>Math.hypot(g.x-q.x,g.y-q.y)>.9));
}

export type RareItem='seiva'|'cristal';
export const RARE_ITEMS:Record<RareItem,string>={seiva:'Seiva luminosa',cristal:'Cristal do bosque'};
/** Optional woodland encounters: stable for the saved encounter seed, not rerolled by reload. */
export function campaignEnemies(index:number,seed=290519+index*101):CampaignEnemy[]{
 const room=campaignRoom(index);if(!index)return room.enemies;
 let n=seed>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 const level=Math.min(5,2+Math.floor(index/3));
 const spots=[{x:4.5,y:9.5},{x:11.5,y:10.5},{x:15.5,y:4.5},{x:7.5,y:1.5},{x:-2.5,y:6.5},{x:3.5,y:-1.5},{x:9.5,y:11.5},{x:17.5,y:6.5},{x:1.5,y:6.5}]
 .filter(p=>insideExploration(p,.35)&&!hitsEdgeScenery(p,.35)&&!campaignWaterBlocks(p,.35,room)&&!room.walls.some(w=>p.x+.4>w.x&&p.x-.4<w.x+1&&p.y+.4>w.y&&p.y-.4<w.y+1)&&[room.camp,room.marker,room.exit,...room.switches,...room.nodes,...room.enemies,...(room.key?[room.key]:[])].every(q=>Math.hypot(p.x-q.x,p.y-q.y)>(q===room.camp?3.3:1.2)));
 const result=[...room.enemies],count=index>=5?2:1;
 for(let i=0;i<count&&spots.length;i++){
  const p=spots.splice(Math.floor(random()*spots.length),1)[0],kind=index===9&&i===0?2:Math.floor(random()*(level>=3?2:1));
  const guardian=kind===2,fungus=kind===1,lvl=guardian?5:level;
  result.push({...p,id:`wild-${kind}-${i}`,name:guardian?'Guardião dos Troncos':fungus?'Cogumelo Saltador':'Escaravelho Esmeralda',level:lvl,rarity:guardian?'rare':fungus?'uncommon':'common',hp:guardian?112:fungus?65+lvl*5:42+lvl*6,attack:guardian?19:fungus?9+lvl*2:8+lvl*2,defense:guardian?4:fungus?2:1,xp:guardian?100:35+lvl*10,item:guardian?'ambar':fungus?'erva':'fibra',quantity:guardian?3:fungus?1:3,art:'forest-mobs',spriteRow:kind,speed:guardian?.00055:fungus?.0006:.00105,detection:guardian?3:fungus?2.5:4,leash:guardian?3.5:6,width:guardian?1.05:.78,radius:guardian?.27:.19,attackRange:guardian?.96:.82});
 }
 return result;
}
export function rareDropChance(enemy:CampaignEnemy){return enemy.art?Math.min(.55,.04+enemy.level*.055+(enemy.rarity==='rare'?.15:0)):0;}
export function rareDropKind(enemy:CampaignEnemy):RareItem{return enemy.spriteRow===2?'cristal':'seiva';}
