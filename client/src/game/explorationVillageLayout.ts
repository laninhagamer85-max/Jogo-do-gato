export const VILLAGE_ROOM = 0;
export const VILLAGE_CENTER = {x:-9,y:-5};
export const VILLAGE_HOMES = [
 {id:'carvalho',name:'Casa do Carvalho',x:-13,y:-7,art:0},
 {id:'ervas',name:'Casa das Ervas',x:-6,y:-11,art:1},
 {id:'treino',name:'Casa dos Treinadores',x:-4,y:-2,art:2},
] as const;
export const VILLAGE_MARKET=[{id:'frutas',name:'Barraca da Colheita',x:-12,y:-1,art:0,height:2.4},{id:'materiais',name:'Barraca do Artesão',x:-10,y:-14,art:1,height:2.4},{id:'poco',name:'Praça do Poço',x:-9,y:-6,art:2,height:1.6},{id:'loja',name:'Empório dos Troncos',x:-18,y:-3,art:3,height:3.8}] as const;
export type MarketId=string;
export const VILLAGE_WORK = [{x:-16,y:-10,kind:'wood'},{x:-2,y:-14,kind:'erva'}] as const;
export const VILLAGERS = [
 {id:'tomas',name:'Tomás',role:'Lenhador',home:0,art:0,level:8,warrior:false,work:0,greeting:'Cuido da madeira da comunidade. Sempre volto à Casa do Carvalho.'},
 {id:'lia',name:'Lia',role:'Herbalista',home:1,art:1,level:9,warrior:false,work:1,greeting:'Colho ervas no jardim comunitário e divido o que sobra com os vizinhos.'},
 {id:'bento',name:'Bento',role:'Treinador',home:2,art:2,level:18,warrior:true,work:-1,greeting:'Sou pacífico, mas aceito um treino. Mostre sua habilidade sem armas nem poderes.'},
 {id:'maia',name:'Maia',role:'Treinadora',home:2,art:3,level:22,warrior:true,work:-1,greeting:'Treino disciplina e esquiva. Se quiser um duelo, lutaremos apenas com as mãos.'},
] as const;
export type VillagerId=string;
export const villageDoor=(home:number,room=0)=>{const h=villageLayout(room).homes[home];return {x:h.x,y:h.y+.8};};
const buildingCells=new Map<number,Map<string,Array<{x:number;y:number}>>>();
export function villageHouseBlocks(p:{x:number;y:number},radius:number,index:number){let cells=buildingCells.get(index);if(!cells){cells=new Map();for(const h of [...villageLayout(index).homes,...villageLayout(index).markets]){const key=`${Math.floor(h.x/8)}:${Math.floor(h.y/8)}`;cells.set(key,[...cells.get(key)??[],h]);}buildingCells.set(index,cells);}const cx=Math.floor(p.x/8),cy=Math.floor(p.y/8);for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++)if(cells.get(`${x}:${y}`)?.some(h=>Math.abs(p.x-h.x)<1.45+radius&&p.y>h.y-2.05-radius&&p.y<h.y+.12+radius))return true;return false;}

export const VILLAGE_CLEARINGS=[...VILLAGE_HOMES,...VILLAGE_MARKET,...VILLAGE_WORK,VILLAGE_CENTER,{x:-10,y:-2},{x:-7,y:-6}];

/** Ten separated neighborhoods per outdoor room, deterministic and independent of camera/save. */
export const SETTLEMENT_NAMES=['Vila dos Troncos','Aldeia das Marés','Povoado das Folhas','Vila das Fontes'];
export const SETTLEMENT_OFFSETS=[[-9,-5],[-40,-30],[38,-30],[68,-5],[-40,28],[35,34],[65,40],[-70,25],[-70,-30],[0,65]];
export function villageSettlements(room:number){return SETTLEMENT_OFFSETS.map(([x,y],i)=>({x:(room>0&&i===0?-28:room>=30&&i===4?-50:x)+(room%3-1)*(i?2:0),y:(room>0&&i===0?8:room>=30&&i===4?40:y)+(room%4-1)*(i?2:0),id:`r${room}:s${i}`,name:`${SETTLEMENT_NAMES[Math.min(3,Math.floor(room/10))]} · ${i===0?'Centro':i%3===0?'Praça':`Núcleo ${i+1}`}`,room,slot:i}));}
const rooms=new Map<number,{homes:Array<{id:string;name:string;x:number;y:number;art:number;room:number;settlement:number}>;markets:Array<{id:string;name:string;x:number;y:number;art:number;height:number;room:number;settlement:number}>;work:Array<{x:number;y:number;kind:'wood'|'erva'}>}>();
export function villageLayout(room:number):{homes:Array<{id:string;name:string;x:number;y:number;art:number;room:number;settlement:number}>;markets:Array<{id:string;name:string;x:number;y:number;art:number;height:number;room:number;settlement:number}>;work:Array<{x:number;y:number;kind:'wood'|'erva'}>}{let hit=rooms.get(room);if(hit)return hit;const homes:ReturnType<typeof villageLayout>['homes']=[],markets:ReturnType<typeof villageLayout>['markets']=[],work:ReturnType<typeof villageLayout>['work']=[];
 for(const c of villageSettlements(room)){const dx=c.x-VILLAGE_CENTER.x,dy=c.y-VILLAGE_CENTER.y;for(const h of VILLAGE_HOMES)homes.push({...h,id:room===0&&c.slot===0?h.id:`${c.id}:${h.id}`,name:`${h.name} · ${c.slot+1}`,x:h.x+dx,y:h.y+dy,room,settlement:c.slot});for(const m of VILLAGE_MARKET)markets.push({...m,id:room===0&&c.slot===0?m.id:`${c.id}:${m.id}`,x:m.x+dx,y:m.y+dy,room,settlement:c.slot});for(const w of VILLAGE_WORK)work.push({...w,x:w.x+dx,y:w.y+dy});}
 hit={homes,markets,work};rooms.set(room,hit);return hit;
}
const clearingsCache=new Map<number,Array<{x:number;y:number}>>();
export const villageClearings=(room:number)=>{let points=clearingsCache.get(room);if(!points){points=[...villageLayout(room).homes,...villageLayout(room).markets,...villageLayout(room).work,...villageSettlements(room)];clearingsCache.set(room,points);}return points;};
const givenNames=['Tomás','Lia','Bento','Maia','Caio','Nina','Rui','Iara','Davi','Rosa','João','Luna','Hugo','Eva','Léo','Sara','Noé','Clara','Raul','Bia','Luan','Cora','Theo','Flora','Otto','Lara','Nilo','Mila','Artur','Alice','Ícaro','Aurora','Breno','Elisa','Enzo','Íris','Gael','Olívia','Ian','Cecília'];
export const WORLD_VILLAGERS=Array.from({length:32},(_,room)=>Array.from({length:100},(_,n)=>{const birthStage=n<40?0:n<60?1:2,slot=n<40?Math.floor(n/4):n<60?Math.floor((n-40)/2):Math.floor((n-60)/4),local=n%4,legacy=room===0&&n<4?VILLAGERS[local]:undefined,warrior=legacy?.warrior??(slot%3===0&&local===2),work=local%2,kind=legacy||warrior?'worker':birthStage===1?'merchant':birthStage===2?(local>=2?'noble':local%2?'elder':'child'):local>=2?(local%2?'elder':'child'):'worker',role=kind==='child'?'Criança':kind==='elder'?((slot+room+Math.floor(n/10))%2?'Anciã':'Ancião'):kind==='merchant'?'Comerciante':kind==='noble'?'Nobre':warrior?(local%2?'Treinadora':'Treinador'):work?'Herbalista':'Lenhador';return {id:legacy?.id??`r${room}:v${n}`,name:legacy?.name??givenNames[(n+room*7)%givenNames.length],role:legacy?.role??role,home:slot*3+(local<2?local:2),room,birthStage,kind,variant:(slot+room+Math.floor(n/10))%2,settlement:slot,art:legacy?.art??(warrior?2:0)+local%2,level:legacy?.level??Math.min(100,6+room*2+n%13),warrior,work:warrior?-1:kind==='worker'?slot*2+work:kind==='child'?-2:kind==='elder'?-3:kind==='merchant'?-4:-5,greeting:legacy?.greeting??`Moro no núcleo ${slot+1} de ${SETTLEMENT_NAMES[Math.min(3,Math.floor(room/10))]}. ${warrior?'Aceito treino apenas com as mãos.':kind==='child'?'Brinco na praça e volto para casa antes de anoitecer.':kind==='elder'?'Conheço a história deste povoado e descanso em casa à noite.':kind==='merchant'?'Visito as lojas e acompanho as trocas da comunidade.':kind==='noble'?'Passeio pelas ruas e acompanho o crescimento da cidade.':'Cuido dos recursos da comunidade e visito meus vizinhos.'}`};})).flat();
const peopleById=new Map<string,typeof WORLD_VILLAGERS[number]>(WORLD_VILLAGERS.map(v=>[v.id,v]));
export const villagerDefinition=(id:string)=>peopleById.get(id)!;
export const settlementStage=(v:{growth?:Record<string,number>}|undefined,room:number,slot:number)=>{const work=v?.growth?.[`r${room}:s${slot}`]??0;return work>=24?2:work>=8?1:0;};

const defsByRoom=Array.from({length:32},(_,room)=>WORLD_VILLAGERS.filter(d=>d.room===room));
export const roomVillagers=(room:number)=>defsByRoom[room]??[];

/** Shared civic stations never replace the player's own facilities or grant upgrades. */
export function nearCityService(s:{roomIndex:number;player:{x:number;y:number};village?:{growth?:Record<string,number>};castle?:{active?:boolean}}){if(s.castle?.active)return;return villageLayout(s.roomIndex).homes.filter(h=>h.art<2&&settlementStage(s.village,h.room,h.settlement)===2).find(h=>Math.hypot(s.player.x-h.x,s.player.y-h.y-.8)<2);}
