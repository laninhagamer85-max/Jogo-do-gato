export const VILLAGE_ROOM = 0;
export const VILLAGE_CENTER = {x:-9,y:-5};
export const VILLAGE_HOMES = [
 {id:'carvalho',name:'Casa do Carvalho',x:-13,y:-7,art:0},
 {id:'ervas',name:'Casa das Ervas',x:-6,y:-11,art:1},
 {id:'treino',name:'Casa dos Treinadores',x:-4,y:-2,art:2},
] as const;
export const VILLAGE_MARKET=[{id:'frutas',name:'Barraca da Colheita',x:-12,y:-1,art:0,height:2.4},{id:'materiais',name:'Barraca do Artesão',x:-10,y:-14,art:1,height:2.4},{id:'poco',name:'Praça do Poço',x:-9,y:-6,art:2,height:1.6},{id:'loja',name:'Empório dos Troncos',x:-18,y:-3,art:3,height:3.8}] as const;
export type MarketId=typeof VILLAGE_MARKET[number]['id'];
export const VILLAGE_WORK = [{x:-16,y:-10,kind:'wood'},{x:-2,y:-14,kind:'erva'}] as const;
export const VILLAGERS = [
 {id:'tomas',name:'Tomás',role:'Lenhador',home:0,art:0,level:8,warrior:false,work:0,greeting:'Cuido da madeira da comunidade. Sempre volto à Casa do Carvalho.'},
 {id:'lia',name:'Lia',role:'Herbalista',home:1,art:1,level:9,warrior:false,work:1,greeting:'Colho ervas no jardim comunitário e divido o que sobra com os vizinhos.'},
 {id:'bento',name:'Bento',role:'Treinador',home:2,art:2,level:18,warrior:true,work:-1,greeting:'Sou pacífico, mas aceito um treino. Mostre sua habilidade sem armas nem poderes.'},
 {id:'maia',name:'Maia',role:'Treinadora',home:2,art:3,level:22,warrior:true,work:-1,greeting:'Treino disciplina e esquiva. Se quiser um duelo, lutaremos apenas com as mãos.'},
] as const;
export type VillagerId=typeof VILLAGERS[number]['id'];
export const villageDoor=(home:number)=>({x:VILLAGE_HOMES[home].x,y:VILLAGE_HOMES[home].y+.8});
export function villageHouseBlocks(p:{x:number;y:number},radius:number,index:number){return index===VILLAGE_ROOM&&[...VILLAGE_HOMES,...VILLAGE_MARKET].some(h=>Math.abs(p.x-h.x)<1.45+radius&&p.y>h.y-2.05-radius&&p.y<h.y+.12+radius);}
export const VILLAGE_CLEARINGS=[...VILLAGE_HOMES,...VILLAGE_MARKET,...VILLAGE_WORK,VILLAGE_CENTER,{x:-10,y:-2},{x:-7,y:-6}];
