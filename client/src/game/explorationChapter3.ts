import type {CampaignRoom,CampaignEnemy} from './explorationCampaign';
import {pondComposition,crossingComposition} from './biomeComposition';
/** New biome variations reuse the original licensed project atlas with a warm palette. */
export function autumnEnemy(id:string,x:number,y:number,level:number,row=0,boss=false):CampaignEnemy{
 const hp=112+(level-11)*12+(row===1?20:0);
 return {id,x,y,level,name:boss?'Mestre do Âmbar':row===2?'Javali das Avelãs':row===1?'Mariposa Cobre':'Tatu do Âmbar',rarity:boss?'rare':row===1?'uncommon':'common',hp:(boss?hp*5:hp)*10,attack:boss?38:19+(level-11)*2,defense:boss?9:row===1?5:4,xp:boss?650:70+level*12,item:row===1?'erva':'ambar',quantity:boss?8:row===1?2:3,art:'autumn-mobs',spriteRow:boss?3:row,width:boss?1.9:row===1?.88:.82,radius:boss?.34:.21,speed:boss?.00072:row===1?.00085:.0011,detection:boss?4.8:4.2,leash:boss?6:5.2,attackRange:boss?1.25:.88,boss};
}
const specs=[
 ['Folhas douradas','Contorne os espinhos quando estiverem recolhidos.',{x:16.5,y:5.5},{x:13.5,y:4.5},[[5,3,2,1,2],[10,8,1,1,0]]],
 ['Pedras de âmbar','Procure a chave no desvio oeste.',{x:16.5,y:8.5},{x:14.5,y:7.5},[[4,3,1,1,0],[9,5,2,1,2]]],
 ['Runas do outono','Ative as três placas em ordem; evite os jatos de vapor.',{x:-2.5,y:8.5},{x:.5,y:8.5},[[5,4,2,1,2],[11,7,1,1,0]]],
 ['Lago das folhas','Contorne o lago; o âmbar do sul é opcional.',{x:16.5,y:3.5},{x:13.5,y:3.5},[[4,5,1,1,0],[12,8,2,1,2]]],
 ['Ponte das raízes','Resolva as duas runas e atravesse a ponte de oeste a leste.',{x:16.5,y:5.5},{x:13.5,y:5.5},[[3,3,1,1,0],[13,8,1,1,0]]],
 ['Jardim da recuperação','Use uma fruta após o poder ou uma erva após receber dano.',{x:9.5,y:12.5},{x:8.5,y:10.5},[[5,3,2,1,2],[11,6,1,1,0]]],
 ['Vapor entre pedras','Os círculos âmbar avisam onde o vapor vai surgir.',{x:-2.5,y:6.5},{x:.5,y:5.5},[[4,4,1,1,0],[8,7,2,1,2],[12,3,1,1,0]]],
 ['As quatro sementes','Ative quatro runas em ordem e encontre a chave do norte.',{x:16.5,y:2.5},{x:14.5,y:3.5},[[4,5,1,1,0],[9,4,2,1,2]]],
 ['Guardiões do âmbar','Combine chave, runas e recuperação antes de ativar o marco.',{x:9.5,y:12.5},{x:7.5,y:10.5},[[5,3,2,1,2],[12,5,1,1,0]]],
 ['Santuário do Âmbar','Vença o mestre, ative as três runas e libere o portal.',{x:16.5,y:6.5},{x:14.5,y:4.5},[[4,3,2,1,2],[9,8,1,1,0],[11,3,1,1,0]]]
] as const;
export const AUTUMN_ROOMS:CampaignRoom[]=specs.map(([title,hint,exit,marker,obstacles],i)=>{
 const level=11+Math.floor(i/2),bridge=i===4?{x:5.8,y:4.95,width:5.4,height:1.1}:undefined;
 const switches=i===2||i===9?[{x:3.5,y:5.5},{x:10.5,y:9.5},{x:12.5,y:2.5}]:i===4?[{x:2.5,y:5.5},{x:4.5,y:8.5}]:i===7?[{x:3.5,y:7.5},{x:7.5,y:1.5},{x:13.5,y:5.5},{x:7.5,y:10.5}]:i===8?[{x:3.5,y:5.5},{x:12.5,y:2.5}]:[];
 const fibers=15+Math.floor(i/3)*3,encounters=5+Math.floor(i/3);
 const enemies=[autumnEnemy('amber-scarab',4.5,6.5,level),autumnEnemy('copper-fungus',12.5,6.5,level,1),autumnEnemy('amber-scarab-2',-1.5,5.5,level,2),autumnEnemy('copper-fungus-2',14.5,9.5,level+1,1),...(i>=5?[autumnEnemy('amber-scarab-3',7.5,10.5,level+1)]:[])];
 if(i===9)enemies.push(autumnEnemy('amber-master',15.5,5.5,15,2,true));
 const nodes=[{id:'amber-f1',x:2.5,y:5.5,item:'fibra' as const,quantity:9},{id:'amber-f2',x:bridge?3.5:7.5,y:10.5,item:'fibra' as const,quantity:9},{id:'amber-f3',x:bridge?1.5:13.5,y:bridge?9.5:1.5,item:'fibra' as const,quantity:9},{id:'amber-heal',x:4.5,y:8.5,item:'erva' as const,quantity:3},{id:'amber-fruit',x:bridge?3.5:11.5,y:bridge?6.5:10.5,item:'fruta' as const,quantity:3},{id:'amber-optional',x:16.5,y:10.5,item:'ambar' as const,quantity:4}];
 return {index:20+i,biome:'autumn',title,hint:`${hint} Reúna ${fibers} fibras e vença ${encounters} adversários; depois ative o marco.`,camp:{x:1.5,y:1.5},marker,exit,walls:obstacles.flatMap(([x,y,w,h])=>Array.from({length:w*h},(_,n)=>({x:x+n%w,y:y+Math.floor(n/w)}))),scenery:obstacles.map(([x,y,w,h,index])=>({x:x+w/2,y:y+h-.08,index,width:w+.3,height:h+.1})),nodes,enemies,fibers,encounters,switches,key:[1,7,8].includes(i)?{x:-2.5,y:2.5}:undefined,useConsumable:i===5||i===8,bossId:i===9?'amber-master':undefined,bridge,composition:bridge?crossingComposition('autumn-root-bridge'):i===3||i===8?pondComposition(`autumn-pond-${i}`,{x:8.5,y:6},1.2):undefined,hazards:[{id:'thorns',kind:'bramble',x:bridge?3.5:7.5,y:bridge?7.5:4.5,radius:.65,period:4800,activeMs:1400,offset:i*230},...(i>=2?[{id:'steam',kind:'steam' as const,x:bridge?12.5:10.5,y:8.5,radius:.8,period:5600,activeMs:1600,offset:1700}]:[])]};
});
