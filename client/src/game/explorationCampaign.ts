import {villageSettlements,villageClearings} from './explorationVillageLayout';
import {encounterPocket,openWorldBlocked,registerWorldClearings} from './explorationOpenWorld';
import {CHAPTER4_ROOM,CHAPTER4_SECOND_ROOM,NASCENTES_GARDENS,returnPortal} from './explorationChapter4';
import {AUTUMN_ROOMS,autumnEnemy} from './explorationChapter3';
import {ROOM_WALLS,ROOM_SCENERY,PILOT_SHELTER,ROOM_GARDENS,SCATTERED_GARDENS,hitsEdgeScenery} from './explorationRoom';
import {pondComposition,crossingComposition,insideRegion,touchesRegion,type BiomeComposition} from './biomeComposition';
import {insideExploration} from './explorationWorld';
import type {CombatItem,CombatPoint} from './explorationCombat';
export type CampaignEnemy=CombatPoint&{id:string;name:string;level:number;rarity:'common'|'uncommon'|'rare';hp:number;previousHp?:number;previousBalanceHp?:number;variantName?:string;attack:number;defense:number;xp:number;item:CombatItem;quantity:number;boss?:boolean;art?:'forest-mobs'|'river-mobs'|'autumn-mobs';spriteRow?:number;speed?:number;detection?:number;leash?:number;width?:number;radius?:number;attackRange?:number;tint?:string};
export type CampaignNode=CombatPoint&{id:string;item:CombatItem;quantity:number};
export type CampaignProp=CombatPoint&{index:number;width:number;height:number};
export type CampaignHazard=CombatPoint&{id:string;kind:'bramble'|'steam';radius:number;period:number;activeMs:number;offset:number};
export type CampaignRoom={biome:'forest'|'river'|'autumn'|'nascentes';hazards?:CampaignHazard[];bossId?:string;index:number;title:string;hint:string;camp:CombatPoint;marker:CombatPoint;exit:CombatPoint;walls:CombatPoint[];scenery:CampaignProp[];nodes:CampaignNode[];enemies:CampaignEnemy[];fibers:number;encounters:number;switches:CombatPoint[];key?:CombatPoint;useConsumable?:boolean;bridge?:{x:number;y:number;width:number;height:number};composition?:BiomeComposition;gateBlock?:CombatPoint};
const camp={x:1.5,y:1.5};
const node=(id:string,x:number,y:number,item:CombatItem='fibra',quantity=3):CampaignNode=>({id,x,y,item,quantity});
const enemy=(id:string,x:number,y:number,level:number,kind:'beetle'|'caterpillar'='beetle'):CampaignEnemy=>({id,x,y,level,name:kind==='beetle'?'Besouro':'Lagarta',rarity:kind==='beetle'?'common':'uncommon',hp:(kind==='beetle'?40:58)+(level-1)*9,attack:(kind==='beetle'?9:12)+(level-1)*2,defense:kind==='beetle'?1:3,xp:20+level*8,item:kind==='beetle'?'fibra':'ambar',quantity:kind==='beetle'?3:2});
const props=(entries:number[][])=>({walls:entries.flatMap(([x,y,w,h])=>Array.from({length:w*h},(_,i)=>({x:x+i%w,y:y+Math.floor(i/w)}))),scenery:entries.map(([x,y,w,h,index])=>({x:x+w/2,y:y+h-.08,index,width:index===2?w+.1:w+.3,height:index===2?h*.8:h+.1}))});
const first:CampaignRoom={biome:'forest',index:0,title:'Coleta inicial',hint:'Colete 6 fibras, enfrente um besouro e ative o marco.',camp,marker:{x:8.5,y:4.5},exit:{x:12.4,y:4.5},walls:ROOM_WALLS,scenery:ROOM_SCENERY,nodes:[node('fern-a',2.5,4.5),node('fern-b',6.5,7.5),node('healing-leaf',3.5,7.5,'erva',1)],enemies:[{id:'beetle',name:'Besouro',level:1,rarity:'common',hp:40,attack:9,defense:1,xp:25,item:'fibra',quantity:3,x:4,y:6.5},{id:'caterpillar',name:'Lagarta',level:3,rarity:'uncommon',hp:80,attack:16,defense:3,xp:55,item:'ambar',quantity:2,x:10.5,y:3}],fibers:6,encounters:1,switches:[],gateBlock:{x:9,y:4}};
const room=(index:number,title:string,hint:string,exit:CombatPoint,marker:CombatPoint,obstacles:number[][],nodes:CampaignNode[],enemies:CampaignEnemy[],extra:Partial<CampaignRoom>={}):CampaignRoom=>({biome:'forest',index,title,hint,camp,exit,marker,...props(obstacles),nodes,enemies,fibers:6,encounters:1,switches:[],...extra});
const forestRooms:CampaignRoom[]=[first,
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
// Authoring stays separate from reusable chapter progression rules.
const riverEnemy=(id:string,x:number,y:number,level:number,row=0,boss=false):CampaignEnemy=>({id,x,y,level,boss,name:boss?'Mestre das Marés':row===1?'Rã Ametista':'Caranguejo Azul',rarity:boss?'rare':row===1?'uncommon':'common',hp:boss?420:75+level*11,attack:boss?34:12+level*2,defense:boss?8:row===1?3:5,xp:boss?420:45+level*12,item:row===1?'erva':'ambar',quantity:boss?6:2,art:'river-mobs',spriteRow:boss?2:row,speed:boss?.0007:row===1?.00125:.00095,detection:boss?5:4.5,leash:boss?6:5,width:boss?1.85:row===1?.78:.9,radius:boss?.34:.2,attackRange:boss?1.25:.9});
const riverSpecs=[
 ['Margem azul', {x:16.5,y:5.5},{x:13.5,y:5.5},[[5,3,2,1,2],[10,8,1,1,0]],{x:8.5,y:5.5},1.1],
 ['Pedras do riacho',{x:-2.5,y:8.5},{x:.5,y:8.5},[[4,4,1,1,0],[8,8,1,1,0],[12,3,1,1,0]],{x:8,y:4},1.2],
 ['Runas da corrente',{x:16.5,y:3.5},{x:13.5,y:3.5},[[5,5,2,1,2],[10,7,1,1,0]],{x:8,y:8},1.3],
 ['Ilha da chave',{x:9.5,y:12.5},{x:8.5,y:10.5},[[4,3,2,1,2],[11,4,1,1,0]],{x:9,y:6},1.35],
 ['Ponte das marés',{x:16.5,y:5.5},{x:13.5,y:5.5},[[4,2,2,1,2],[12,8,1,1,0]],{x:8.5,y:5.5},1.3],
 ['Jardim dos cristais',{x:-2.5,y:6.5},{x:.5,y:6.5},[[4,5,1,1,0],[10,3,1,1,0],[13,8,1,1,0]],{x:8,y:8},1.15],
 ['Trilha da recuperação',{x:16.5,y:8.5},{x:14.5,y:7.5},[[5,4,2,1,2],[10,6,1,1,0]],{x:8,y:2},1.35],
 ['As quatro runas',{x:16.5,y:2.5},{x:14.5,y:3.5},[[4,5,1,1,0],[8,6,1,1,0]],{x:11,y:8},1.4],
 ['Guardiões da margem',{x:9.5,y:12.5},{x:8.5,y:10.5},[[5,3,2,1,2],[12,5,1,1,0]],{x:8,y:6},1.45],
 ['Santuário das marés',{x:16.5,y:6.5},{x:14.5,y:4.5},[[4,3,2,1,2],[8,8,1,1,0],[11,3,1,1,0]],{x:8,y:5.5},1.1]
] as const;
const riverRooms:CampaignRoom[]=riverSpecs.map(([title,exit,marker,obstacles,pond,scale],i)=>{
 const index=10+i,level=5+Math.floor(i/2),switches=i===2?[{x:3.5,y:5.5},{x:11.5,y:2.5}]:i===7?[{x:3.5,y:7.5},{x:7.5,y:1.5},{x:13.5,y:5.5},{x:7.5,y:10.5}]:i===9?[{x:3.5,y:5.5},{x:10.5,y:9.5},{x:12.5,y:2.5}]:[];
 const enemies=[riverEnemy('river-crab',6.5,9.5,level),riverEnemy('river-frog',12.5,6.5,level,1),...(i>=3?[riverEnemy('river-crab-2',-1.5,5.5,level+1)]:[]),...(i>=6?[riverEnemy('river-frog-2',14.5,9.5,level+1,1)]:[])];
 if(i===9)enemies.push(riverEnemy('river-master',15.5,5.5,10,2,true));
 return room(index,title,`${i===9?'Vença o Mestre das Marés. ':''}Reúna ${9+Math.floor(i/3)*3} fibras, vença ${3+Math.floor(i/3)} adversários${switches.length?', ative as runas em ordem':''}${i===3||i===8?', encontre a chave':''}${i===4?', atravesse a ponte':''}${i===6?', use um item de recuperação':''} e libere o portal.`,exit,marker,obstacles.map(x=>[...x]),[node('river-f1',2.5,5.5,'fibra',6),node('river-f2',7.5,10.5,'fibra',6),node('river-f3',13.5,1.5,'fibra',6),node('river-heal',4.5,8.5,'erva',2),node('river-fruit',11.5,10.5,'fruta',2)],enemies,{biome:'river',fibers:9+Math.floor(i/3)*3,encounters:3+Math.floor(i/3),switches,key:i===3||i===8?{x:-2.5,y:8.5}:undefined,useConsumable:i===6,bossId:i===9?'river-master':undefined,composition:pondComposition(`river-${i}`,pond,scale),bridge:i===0||i===4?{x:6,y:4.95,width:4.8,height:1.1}:undefined});
});
// Increasing required encounters and optional populations; the original pilot remains unchanged.
for(const r of forestRooms){if(r.index>0){r.encounters=Math.min(4,1+Math.ceil(r.index/3));r.enemies=r.enemies.map(e=>({...e,detection:3.5,leash:5.5,speed:.00085}));}}
forestRooms[9].bossId='forest-master';forestRooms[9].title='Mestre dos Troncos';forestRooms[9].hint='Reúna 9 fibras, vença quatro adversários e o Mestre dos Troncos, encontre a chave e ative as três placas.';
forestRooms[9].enemies.push({id:'forest-master',x:15.5,y:6.5,name:'Mestre dos Troncos',level:6,rarity:'rare',hp:280,attack:26,defense:6,xp:280,item:'ambar',quantity:5,art:'forest-mobs',spriteRow:2,width:1.7,radius:.32,speed:.00065,detection:4.5,leash:5.5,attackRange:1.2,boss:true});
// Bridge rooms have a true west/east divide: collection, challenge and camp on the west;
// milestone and portal on the east. No route around the ends of the river.
for(const r of [...forestRooms,...riverRooms].filter(r=>r.bridge)){
 r.bridge={x:5.8,y:4.95,width:5.4,height:1.1};
 r.marker={x:12.5,y:5.5};
 r.composition=crossingComposition(`bridge-divide-${r.index}`);
 r.walls=r.walls.filter(w=>w.x<5||w.x>11);r.scenery=r.scenery.filter(p=>p.x<5||p.x>11);
 r.nodes=[node('bridge-f1',2.5,5.5,'fibra',6),node('bridge-f2',3.5,8.5,'fibra',6),node('bridge-f3',1.5,10.5,'fibra',6),node('bridge-heal',4.5,7.5,'erva',2),node('bridge-fruit',3.5,6.5,'fruta',2)];
 r.enemies=r.enemies.map((e,i)=>({...e,x:i%2===0?3.5:12.5,y:5.5+Math.floor(i/2)*2}));
}
// Keep every authored river objective on a free, reachable cell; edge props are shared.
for(const r of [...riverRooms,...AUTUMN_ROOMS]){
 const valid=(p:CombatPoint,radius=.35)=>insideExploration(p,radius)&&!hitsEdgeScenery(p,radius)&&!campaignWaterBlocks(p,radius,r)&&!r.walls.some(w=>p.x+radius>w.x&&p.x-radius<w.x+1&&p.y+radius>w.y&&p.y-radius<w.y+1)&&!(p.x+radius>-.1&&p.x-radius<.9&&p.y+radius>1.45&&p.y-radius<1.9);
 const fit=<T extends CombatPoint>(p:T):T=>{if(valid(p))return p;const candidates=Array.from({length:720},(_,i)=>({x:-7.5+i%30,y:-6.5+Math.floor(i/30)})).filter(q=>valid(q));candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));return {...p,...candidates[0]};};
 r.marker=fit(r.marker);r.exit=fit(r.exit);r.nodes=r.nodes.map(fit);r.switches=r.switches.map(fit);if(r.key)r.key=fit(r.key);r.enemies=r.enemies.map(fit);
}
export const EXPLORATION_ROOMS:readonly CampaignRoom[]=[...forestRooms,...riverRooms,...AUTUMN_ROOMS,CHAPTER4_ROOM,CHAPTER4_SECOND_ROOM];
for(const r of EXPLORATION_ROOMS)registerWorldClearings(r.index,[...villageClearings(r.index),r.camp,r.marker,r.exit,...r.nodes,...r.switches,...r.enemies,...(r.key?[r.key]:[]),{x:-2.5,y:4.5},{x:17.5,y:4.5},{x:7.5,y:-2.5},{x:7.5,y:12.5}]);
export const campaignRoom=(index=0)=>EXPLORATION_ROOMS[Math.max(0,Math.min(EXPLORATION_ROOMS.length-1,Math.floor(index)||0))];
export const chapterName=(index:number)=>index>=30?'Jardim das Nascentes':index>=20?'Bosque do Âmbar':index>=10?'Riacho dos Cristais':'Clareira dos Troncos';
export const roomInChapter=(index:number)=>index%10+1;
export const chapterNumber=(index:number)=>Math.floor(index/10)+1;

export function campaignWaterBlocks(p:CombatPoint,radius:number,room:CampaignRoom){
 const b=room.bridge;
 if(b&&p.x>=b.x+radius&&p.x<=b.x+b.width-radius&&p.y>=b.y+radius&&p.y<=b.y+b.height-radius)return false;
 return room.composition?.regions.some(r=>r.material==='water'&&touchesRegion(p,radius,r.polygon))??false;
}
/** New room plant groups stay out of solid footprints and special interactions. */
function buildCampaignGardens(room:CampaignRoom){
 if(room.biome==='nascentes')return NASCENTES_GARDENS;
 if(!room.index)return [...ROOM_GARDENS,...SCATTERED_GARDENS];
 const shift=(room.index*1.137)%3.8;
 return [...ROOM_GARDENS,...SCATTERED_GARDENS].map((g,i)=>({...g,x:g.x+Math.sin(i*2.1+room.index)*shift,y:g.y+Math.cos(i*1.7+room.index)*shift*.6})).filter(g=>!campaignWaterBlocks(g,.4,room)&&!room.walls.some(w=>Math.abs(g.x-w.x-.5)<.9&&Math.abs(g.y-w.y-.5)<.9)&&[room.camp,room.marker,room.exit,...room.switches,...room.nodes,...(room.key?[room.key]:[])].every(q=>Math.hypot(g.x-q.x,g.y-q.y)>.9));
}

export type RareItem='seiva'|'cristal'|'perola'|'escama';
export const RARE_ITEMS:Record<RareItem,string>={seiva:'Seiva luminosa',cristal:'Cristal do bosque',perola:'Pérola de cura',escama:'Escama das marés'};
/** Optional woodland encounters: stable for the saved encounter seed, not rerolled by reload. */
function buildCampaignEnemies(index:number,seed=290519+index*101):CampaignEnemy[]{
 const room=campaignRoom(index);if(!index||room.biome==='nascentes')return room.enemies;
 let n=seed>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 const level=index>=20?11+Math.floor((index-20)/2):index>=10?5+Math.floor((index-10)/2):Math.min(5,2+Math.floor(index/3));
 const spots=[...Array.from({length:48},(_,i)=>({x:-3.5+(i%8)*3,y:-2.5+Math.floor(i/8)*3})),{x:4.5,y:9.5},{x:11.5,y:10.5},{x:15.5,y:4.5},{x:7.5,y:1.5},{x:-2.5,y:6.5},{x:3.5,y:-1.5},{x:9.5,y:11.5},{x:17.5,y:6.5},{x:1.5,y:6.5}]
 .filter(p=>insideExploration(p,.35)&&!hitsEdgeScenery(p,.35)&&!campaignWaterBlocks(p,.35,room)&&!room.walls.some(w=>p.x+.4>w.x&&p.x-.4<w.x+1&&p.y+.4>w.y&&p.y-.4<w.y+1)&&[room.camp,room.marker,room.exit,...room.switches,...room.nodes,...room.enemies,...(room.key?[room.key]:[])].every(q=>Math.hypot(p.x-q.x,p.y-q.y)>(q===room.camp?3.3:1.2)));
 const result=[...room.enemies],count=Math.max(1,(index>=20?12+Math.floor((index-20)/2):index>=10?8+Math.floor((index-10)/2):2+Math.floor(index*.6))-room.enemies.length);
 for(let i=0;i<count&&spots.length;i++){
  const p=spots.splice(Math.floor(random()*spots.length),1)[0];for(let j=spots.length-1;j>=0;j--)if(Math.hypot(spots[j].x-p.x,spots[j].y-p.y)<1.6)spots.splice(j,1);const kind=index===9&&i===0?2:Math.floor(random()*(level>=3?2:1));
  if(room.biome==='autumn'){const roll=random(),oldRow=Math.floor(roll*2);result.push({...autumnEnemy(`wild-autumn-${i}`,p.x,p.y,level,Math.floor(roll*3)),previousHp:112+(level-11)*12+(oldRow===1?20:0)});continue;}
  if(room.biome==='river'){result.push(riverEnemy(`wild-river-${i}`,p.x,p.y,level,Math.floor(random()*2)));continue;}
  const guardian=kind===2,fungus=kind===1,lvl=guardian?5:level;
  result.push({...p,id:`wild-${kind}-${i}`,name:guardian?'Guardião dos Troncos':fungus?'Cogumelo Saltador':'Escaravelho Esmeralda',level:lvl,rarity:guardian?'rare':fungus?'uncommon':'common',hp:guardian?112:fungus?65+lvl*5:42+lvl*6,attack:guardian?19:fungus?9+lvl*2:8+lvl*2,defense:guardian?4:fungus?2:1,xp:guardian?100:35+lvl*10,item:guardian?'ambar':fungus?'erva':'fibra',quantity:guardian?3:fungus?1:3,art:'forest-mobs',spriteRow:kind,speed:guardian?.00055:fungus?.0006:.00105,detection:guardian?3:fungus?2.5:4,leash:guardian?3.5:6,width:guardian?1.05:.78,radius:guardian?.27:.19,attackRange:guardian?.96:.82});
 }
 return result;
}
export function rareDropChance(enemy:CampaignEnemy){return enemy.art?Math.min(.55,.04+enemy.level*.055+(enemy.rarity==='rare'?.15:0)):0;}
export function rareDropKind(enemy:CampaignEnemy):RareItem{return enemy.art==='river-mobs'?(enemy.spriteRow===1?'perola':'escama'):(enemy.boss||enemy.spriteRow===2)?'cristal':'seiva';}

// Authored room geometry and seeded definitions are immutable during a run.
const gardenCache=new WeakMap<CampaignRoom,ReturnType<typeof buildCampaignGardens>>();
export function campaignGardens(room:CampaignRoom){let value=gardenCache.get(room);if(!value){value=buildCampaignGardens(room);gardenCache.set(room,value);}return value;}
const enemyCache=new Map<string,CampaignEnemy[]>();
export const CAMPAIGN_ENEMY_CACHE_LIMIT=64;
export function campaignEnemies(index:number,seed=290519+index*101):CampaignEnemy[]{const room=campaignRoom(index),key=`${room.index}:${seed>>>0}`;let value=enemyCache.get(key);if(value){enemyCache.delete(key);enemyCache.set(key,value);return value;}value=buildCampaignEnemies(room.index,seed).map((enemy,slot)=>{const firstWild=room.enemies.length,nearVillage=enemy.id.startsWith('wild-')&&slot===firstWild?settlementPatrol(room.index):undefined,pocket=enemy.id.startsWith('wild-')?(nearVillage??encounterPocket(room.index,seed,slot)):enemy;const position=!campaignWaterBlocks(pocket,.4,room)&&!openWorldBlocked(pocket,.4,room.index)?pocket:enemy;return {...campaignEnemyVariant(enemy,room.index,seed),x:position.x,y:position.y,previousBalanceHp:enemy.hp,hp:Math.ceil(enemy.hp*npcHpMultiplier(room.index))};});if(enemyCache.size>=CAMPAIGN_ENEMY_CACHE_LIMIT)enemyCache.delete(enemyCache.keys().next().value!);enemyCache.set(key,value);return value;}

/** Additional resilience; Chapter 3 already includes its earlier tenfold increase. */
export function npcHpMultiplier(index:number){return index>=20?1.25:index>=10?1.75:1.5;}

/** Visual variants reuse complete painted frames and never reroll encounter positions or loot. */
export function campaignEnemyVariant(enemy:CampaignEnemy,index:number,seed:number):CampaignEnemy{
 if(!enemy.art||enemy.boss||index===0)return enemy;
 let hash=(seed^Math.imul(index+1,2654435761))>>>0;
 for(const ch of enemy.id)hash=(Math.imul(hash,31)+ch.charCodeAt(0))>>>0;
 const variant=hash%3;if(!variant)return enemy;
 const agile=variant===1,biome=campaignRoom(index).biome;
 const name=biome==='forest'?(agile?'Musgo':'Casca'):biome==='river'?(agile?'Turquesa':'Ardósia'):(agile?'Dourado':'Castanho');
 const hue=biome==='forest'?(agile?12:-12):biome==='river'?(agile?-18:18):(agile?8:-10);
 return {...enemy,variantName:name,width:(enemy.width??.78)*(agile?.9:1.08),speed:(enemy.speed??.0008)*(agile?1.12:.94),tint:`hue-rotate(${hue}deg) saturate(${agile?1.1:.85})`};
}

const patrolCache=new Map<number,{x:number;y:number}|null>();
function settlementPatrol(index:number){if(patrolCache.has(index))return patrolCache.get(index);const c=villageSettlements(index)[0],r=campaignRoom(index);for(let i=0;i<8;i++){const a=i*Math.PI/4,p={x:Math.round((c.x+Math.cos(a)*14)*2)/2,y:Math.round((c.y+Math.sin(a)*14)*2)/2};if(!patrolNavigation?.(index,p))continue;patrolCache.set(index,p);return p;}patrolCache.set(index,null);return null;}

let patrolNavigation:((index:number,p:{x:number;y:number})=>boolean)|undefined;
export function registerPatrolNavigation(validate:(index:number,p:{x:number;y:number})=>boolean){patrolNavigation=validate;patrolCache.clear();enemyCache.clear();}
