import {nascentesVillagePosition,EXPLORATION_ROOM_COUNT} from './explorationNascentesLayout';
export const VILLAGE_ROOM = 0;
export const VILLAGE_CENTER = {x:-9,y:-5};
export const VILLAGE_HOMES = [
 {id:'carvalho',name:'Casa do Carvalho',x:-13,y:-7,art:0},
 {id:'ervas',name:'Casa das Ervas',x:-6,y:-11,art:1},
 {id:'treino',name:'Casa dos Treinadores',x:-4,y:-2,art:2},
] as const;
export const VILLAGE_MARKET=[{id:'frutas',name:'Barraca da Colheita',x:-12,y:-1,art:0,height:2.4},{id:'materiais',name:'Barraca do Artesão',x:-10,y:-14,art:1,height:2.4},{id:'poco',name:'Poço da Vila',x:-9,y:-6,art:2,height:1.6},{id:'loja',name:'Empório dos Troncos',x:-18,y:-3,art:3,height:3.8}] as const;
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
export const SETTLEMENT_NAMES=['Vila dos Troncos','Vila das Marés','Vila das Folhas','Vila das Fontes'];
export const SETTLEMENT_OFFSETS=[[-9,-5],[-40,-30],[38,-30],[68,-5],[-40,28],[35,34],[65,40],[-70,25],[-70,-30],[0,65]];
export function villageSettlements(room:number){return SETTLEMENT_OFFSETS.map(([x,y],i)=>({...((room>=30)?nascentesVillagePosition(room,i):{x:(room>0&&i===0?-28:x)+(room%3-1)*(i?2:0),y:(room>0&&i===0?8:y)+(room%4-1)*(i?2:0),elevated:false}),id:'r'+room+':s'+i,name:SETTLEMENT_NAMES[Math.min(3,Math.floor(room/10))]+' · '+(i===0?'Centro':i%3===0?'Praça':'Núcleo '+(i+1)),room,slot:i}));}
const rooms=new Map<number,{homes:Array<{id:string;name:string;x:number;y:number;art:number;room:number;settlement:number}>;markets:Array<{id:string;name:string;x:number;y:number;art:number;height:number;room:number;settlement:number}>;work:Array<{x:number;y:number;kind:'wood'|'erva'}>}>();
export function villageLayout(room:number):{homes:Array<{id:string;name:string;x:number;y:number;art:number;room:number;settlement:number}>;markets:Array<{id:string;name:string;x:number;y:number;art:number;height:number;room:number;settlement:number}>;work:Array<{x:number;y:number;kind:'wood'|'erva'}>}{let hit=rooms.get(room);if(hit)return hit;const homes:ReturnType<typeof villageLayout>['homes']=[],markets:ReturnType<typeof villageLayout>['markets']=[],work:ReturnType<typeof villageLayout>['work']=[];
 for(const c of villageSettlements(room)){const dx=c.x-VILLAGE_CENTER.x,dy=c.y-VILLAGE_CENTER.y;for(const h of VILLAGE_HOMES)homes.push({...h,id:room===0&&c.slot===0?h.id:`${c.id}:${h.id}`,name:`${h.name} · ${c.slot+1}`,x:c.elevated?c.x+[-7,0,7][h.art]:h.x+dx,y:c.elevated?c.y+[-1,-4,-1][h.art]:h.y+dy,room,settlement:c.slot});for(const m of VILLAGE_MARKET)markets.push({...m,id:room===0&&c.slot===0?m.id:`${c.id}:${m.id}`,x:room>=30&&m.art===2?c.x:c.elevated?c.x+[-7,7,-12,12][m.art]:m.x+dx,y:room>=30&&m.art===2?c.y:c.elevated?c.y+[4,4,1.5,2][m.art]:m.y+dy,room,settlement:c.slot});for(const [i,w] of VILLAGE_WORK.entries())work.push({...w,x:c.elevated?c.x+(i?9:-9):w.x+dx,y:c.elevated?c.y+5.5:w.y+dy});}
 for(const c of villageSettlements(room))homes.push({id:`${c.id}:comunidade`,name:'Casa da Comunidade',x:c.x+(c.elevated?0:7),y:c.y+(c.elevated?7.5:-3),art:c.slot%3,room,settlement:c.slot});
 hit={homes,markets,work};rooms.set(room,hit);return hit;
}
const clearingsCache=new Map<number,Array<{x:number;y:number}>>();
export const villageClearings=(room:number)=>{let points=clearingsCache.get(room);if(!points){points=[...villageLayout(room).homes,...villageLayout(room).markets,...villageLayout(room).work,...villageSettlements(room)];clearingsCache.set(room,points);}return points;};
const givenNames=['Tomás','Lia','Bento','Maia','Caio','Nina','Rui','Iara','Davi','Rosa','João','Luna','Hugo','Eva','Léo','Sara','Noé','Clara','Raul','Bia','Luan','Cora','Theo','Flora','Otto','Lara','Nilo','Mila','Artur','Alice','Ícaro','Aurora','Breno','Elisa','Enzo','Íris','Gael','Olívia','Ian','Cecília'];
const maleNames=['Tomás','Caio','Rui','Davi','João','Hugo','Léo','Noé','Raul','Luan','Theo','Otto','Nilo','Artur','Ícaro','Breno','Enzo','Gael','Ian','Bento'];
const femaleNames=['Lia','Nina','Iara','Rosa','Luna','Eva','Sara','Clara','Bia','Cora','Flora','Lara','Mila','Alice','Aurora','Elisa','Íris','Olívia','Cecília','Maia'];
const familyNames=['Lima','Rocha','Campos','Matos','Vale','Fontes','Barros','Silva','Costa','Alves','Melo','Duarte','Reis','Ramos','Santos','Dias','Sales','Leal','Nunes','Braga','Prado','Pires','Cruz','Farias','Lopes','Neves','Freitas','Sousa','Andrade','Bastos','Moura','Castro','Azevedo','Amaral','Borges','Batista','Mendes','Ribeiro','Ferreira','Oliveira','Pereira','Carvalho','Almeida','Teixeira','Monteiro','Vieira','Cardoso','Correia','Barbosa','Moreira','Machado','Pinheiro','Araújo','Dantas','Paiva','Tavares','Siqueira','Figueira','Falcão','Macedo','Brito','Queiroz','Coelho','Moraes','Rezende','Cavalcante','Lacerda','Torres','Aguiar','Miranda','Viana','Cabral','Molina','Couto','Guedes','Sampaio','Serrano','Lemos','Camargo','Assis','Porto','Peixoto','Garcia','Frota','Aires','Chaves','Furtado','Fonseca','Pacheco','Lira','Franco','Mota','Bezerra','Diniz','Rangel','Bandeira','Cunha','Pontes','Valente','Bicalho','Mendonça','Magalhães','Teles','Vargas','Guimarães','Alencar','Medeiros','Assunção','Valença','Alcântara','Beviláqua','Capanema','Damasceno','Espinosa','Fagundes','Gouveia','Haddad','Jordão','Karam','Lourenço','Malta','Noronha','Penteado','Quintana','Romão','Sarmento','Travassos','Uchôa','Vasconcelos','Xavier','Zanetti','Abreu','Beltrão','Capistrano','Drummond','Espanhol','Firmino','Galvão','Honório','Junqueira','Lacerda Filho','Montenegro','Novais','Padilha','Queirós','Ramalho','Souto','Tibúrcio'];
const citizenNameCount={male:0,female:0};
function citizenName(gender:'male'|'female',_n:number,_room:number){const i=citizenNameCount[gender]++,names=gender==='female'?femaleNames:maleNames;return `${names[i%names.length]} ${familyNames[Math.floor(i/names.length)%familyNames.length]}`;}
export interface VillagePerson {id:string;name:string;role:string;home:number;room:number;birthStage:number;kind:string;gender:string;clothing:number;variant:number;settlement:number;art:number;level:number;warrior:boolean;work:number;greeting:string}
export const WORLD_VILLAGERS:VillagePerson[]=[...Array.from({length:31},(_,i)=>i),39,...Array.from({length:8},(_,i)=>31+i)].map(room=>Array.from({length:100},(_,n)=>{const birthStage=n<40?0:n<60?1:2,slot=n<40?Math.floor(n/4):n<60?Math.floor((n-40)/2):Math.floor((n-60)/4),local=n%4,guard=birthStage===2&&local===3,legacy=room===0&&n<4?VILLAGERS[local]:undefined,warrior=legacy?.warrior??(slot%3===0&&local===2),work=local%2,kind=guard?'guard':legacy||warrior?'worker':birthStage===1?(local%2?'child':'merchant'):birthStage===2?(local>=2?'noble':local%2?'elder':'child'):local>=2?(local%2?(slot%3===0?'child':'elder'):'child'):'worker',variant=(slot+room+Math.floor(n/10))%2,gender=(kind==='worker'?(legacy?.art??(warrior?2:0)+local%2)%2:variant)?'female':'male',role=guard?'Guarda Real':kind==='child'?'Criança':kind==='elder'?(slot%3===1?(gender==='female'?'Contadora de histórias':'Contador de histórias'):(gender==='female'?'Anciã':'Ancião')):kind==='merchant'?'Comerciante':kind==='noble'?'Nobre':warrior?(gender==='female'?'Treinadora':'Treinador'):work?'Herbalista':gender==='female'?'Lenhadora':'Lenhador';return {id:legacy?.id??`r${room}:v${n}`,name:legacy?.name??citizenName(gender,n,room),role:legacy?.role??role,home:slot*3+(local<2?local:2),room,birthStage,kind,gender,clothing:0,variant,settlement:slot,art:legacy?.art??(guard?2+Number(gender==='female'):(warrior?2:0)+local%2),level:legacy?.level??Math.min(100,6+room*2+n%13),warrior,work:guard?-6:warrior?-1:kind==='worker'?slot*2+work:kind==='child'?-2:kind==='elder'?-3:kind==='merchant'?-4:-5,greeting:legacy?.greeting??`Moro no núcleo ${slot+1} de ${SETTLEMENT_NAMES[Math.min(3,Math.floor(room/10))]}. ${guard?'Protejo o centro da cidade. Posso indicar as lojas. Agredir a guarda causa expulsão temporária.':warrior?'Aceito treino apenas com as mãos.':kind==='child'?'Brinco na praça e volto para casa antes de anoitecer.':kind==='elder'?'Conheço a história deste povoado e descanso em casa à noite.':kind==='merchant'?'Visito as lojas e acompanho as trocas da comunidade.':kind==='noble'?'Passeio pelas ruas e acompanho o crescimento da cidade.':'Cuido dos recursos da comunidade e visito meus vizinhos.'}`};})).flat();
export const PROFESSION_VILLAGERS=[
{id:'gaspar-construtor',name:'Gaspar',role:'Construtor',art:4,gender:'male',settlement:0,home:0,work:0,warrior:false,greeting:'Construo e cuido das estruturas da vila. Praça, oficina e casa de cura fazem nossa comunidade crescer.'},
{id:'helena-guerreira',name:'Helena',role:'Guerreira',art:5,gender:'female',settlement:1,home:5,work:-1,warrior:true,greeting:'Protejo os moradores. Aceito um treino combinado, apenas com as mãos.'},
{id:'dalva-agricultora',name:'Dalva',role:'Agricultora',art:6,gender:'female',settlement:2,home:7,work:5,warrior:false,greeting:'Trabalho na horta pela manhã e compartilho a colheita. Volto para casa antes da noite.'},
{id:'vicente-coletor',name:'Vicente',role:'Coletor',art:7,gender:'male',settlement:3,home:9,work:6,warrior:false,greeting:'Coleto madeira e minérios com ferramentas comuns. Posso viajar à tarde e volto antes de escurecer.'},
{id:'celina-alquimista',name:'Celina',role:'Médica-alquimista',art:8,gender:'female',settlement:0,home:1,work:1,warrior:false,greeting:'Preparo curas e poções raras de seiva ou pérola. Reponho meu estoque em 30 minutos.'},
] as const;
for(const d of PROFESSION_VILLAGERS)WORLD_VILLAGERS.push({...WORLD_VILLAGERS[0],...d,room:0,birthStage:0,kind:'worker',level:d.warrior?26:12});
const peopleById=new Map<string,typeof WORLD_VILLAGERS[number]>(WORLD_VILLAGERS.map(v=>[v.id,v]));
export const villagerDefinition=(id:string)=>peopleById.get(id)!;
export function villageDevelopment(v:{growth?:Record<string,number>}|undefined,room:number,slot:number){const work=v?.growth?.[`r${room}:s${slot}`]??0;return {square:work>=8,workshop:work>=16,healing:work>=24,city:work>=24};}
export const settlementStage=(v:{growth?:Record<string,number>}|undefined,room:number,slot:number)=>{const d=villageDevelopment(v,room,slot);return d.city?2:d.square?1:0;};
export const settlementKind=(v:{growth?:Record<string,number>}|undefined,room:number,slot:number)=>villageDevelopment(v,room,slot).city?'Cidade':'Vila';

const defsByRoom=Array.from({length:EXPLORATION_ROOM_COUNT},(_,room)=>WORLD_VILLAGERS.filter(d=>d.room===room));
export const roomVillagers=(room:number)=>defsByRoom[room]??[];

/** Shared civic stations never replace the player's own facilities or grant upgrades. */
export function nearCityService(s:{roomIndex:number;player:{x:number;y:number};village?:{growth?:Record<string,number>};castle?:{active?:boolean}}){if(s.castle?.active)return;return villageLayout(s.roomIndex).homes.filter(h=>!h.id.endsWith(':comunidade')&&h.art<2&&settlementStage(s.village,h.room,h.settlement)===2).find(h=>Math.hypot(s.player.x-h.x,s.player.y-h.y-.8)<2);}

export const villageSafeAt=(room:number,p:{x:number;y:number})=>villageSettlements(room).find(c=>Math.hypot(p.x-c.x,p.y-c.y)<11);

/** Original painted identities: no palette swaps, one occurrence per outdoor room. */
export function villagerAppearance(d:typeof WORLD_VILLAGERS[number]){return d.art>=4?`profession:${d.art-4}`:d.kind==='worker'||d.kind==='guard'?`people:${d.art}`:d.kind==='child'?`family:${d.variant}`:d.kind==='elder'?`family:${2+d.variant}`:d.kind==='merchant'?`citizen:${2+d.variant}`:`citizen:${d.variant}`;}
const rosterCache=new Map<string,typeof WORLD_VILLAGERS>();
export function activeVillageDefinitions(v:{growth?:Record<string,number>}|undefined,room:number){
 const key=room+':'+villageSettlements(room).map(t=>settlementStage(v,room,t.slot)).join('');const cached=rosterCache.get(key);if(cached)return cached;
 const selected=new Map<string,typeof WORLD_VILLAGERS[number]>();
 for(const d of roomVillagers(room)){if(d.birthStage>settlementStage(v,room,d.settlement))continue;const look=villagerAppearance(d),prev=selected.get(look);if(!prev||d.kind==='guard'&&prev.kind!=='guard')selected.set(look,d);}
 const result=[...selected.values()];if(rosterCache.size>128)rosterCache.clear();rosterCache.set(key,result);return result;
}
