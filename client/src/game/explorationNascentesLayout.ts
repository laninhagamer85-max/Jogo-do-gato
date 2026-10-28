/** Authored Chapter 4 scenery; independent of simulation and village initialization. */
export const CHAPTER4_START=30,CHAPTER4_END=39,EXPLORATION_ROOM_COUNT=40;
export const CHAPTER4_REVIEW_ACCESS=true;
export const chapter4Review=(index:number)=>CHAPTER4_REVIEW_ACCESS&&index>=CHAPTER4_START&&index<=CHAPTER4_END;
export type NascentesPoint={x:number;y:number};
export type NascentesElevation={left:number;top:number;size:number;style:'stone'|'grass'|'medieval';stairModel?:'broad'|'slim'|'isometric';villageSlot?:number};
type NascentesLayout={title:string;description:string;camp:NascentesPoint;lake:NascentesPoint;lakeScale:number;elevations:NascentesElevation[];exitGround?:NascentesPoint;groundVillage:NascentesPoint};
export const NASCENTES_LAYOUTS:readonly NascentesLayout[]=[
 {title:'Jardim das Nascentes',description:'O jardim original, com lago, escadaria e mirante. Uma vila ocupa o terraço a noroeste.',camp:{x:-12,y:8},lake:{x:-6,y:1},lakeScale:1,elevations:[{left:0,top:-14,size:23,style:'stone'},{left:-63,top:-44,size:42,style:'grass',villageSlot:1}],groundVillage:{x:-28,y:8}},
 {title:'Vila da Clareira',description:'Casas e comércio junto à trilha, lago ao leste e um mirante de pedra. O portal segue pelo chão.',camp:{x:-18,y:9},lake:{x:9,y:6},lakeScale:.8,elevations:[{left:6,top:-24,size:26,style:'stone'}],exitGround:{x:18,y:14},groundVillage:{x:-19,y:-5}},
 {title:'Mirante dos Artesãos',description:'A vila inteira ocupa o platô central. Suba a escadaria para visitar as casas; o portal fica na clareira ao sul.',camp:{x:-18,y:9},lake:{x:23,y:9},lakeScale:.85,elevations:[{left:-18,top:-38,size:42,style:'grass',villageSlot:0},{left:33,top:-24,size:21,style:'stone'}],groundVillage:{x:-28,y:8}},
 {title:'Lago das Hortas',description:'Um lago amplo separa as hortas da clareira. Há um povoado ao nível do chão e outro no terraço oeste.',camp:{x:-18,y:10},lake:{x:-2,y:1},lakeScale:1.35,elevations:[{left:11,top:-24,size:25,style:'grass'},{left:-57,top:-39,size:42,style:'stone',villageSlot:1}],exitGround:{x:20,y:12},groundVillage:{x:-24,y:-6}},
 {title:'Vila das Duas Alturas',description:'Dois povoados elevados, com escadas próprias e uma trilha baixa entre os terraços.',camp:{x:-22,y:11},lake:{x:-2,y:10},lakeScale:.7,elevations:[{left:-20,top:-41,size:42,style:'stone',villageSlot:0},{left:29,top:-26,size:42,style:'grass',villageSlot:2}],exitGround:{x:19,y:13},groundVillage:{x:-28,y:8}},
 {title:'Bosque das Pedreiras',description:'Bosques espaçados, rochas de coleta e mirantes separados. O portal ocupa uma clareira livre ao sul do platô de pedra.',camp:{x:-18,y:10},lake:{x:15,y:9},lakeScale:.7,elevations:[{left:1,top:-25,size:27,style:'stone'},{left:-58,top:-24,size:24,style:'grass'}],groundVillage:{x:-21,y:-7}},
 {title:'Terraços da Colheita',description:'Duas vilas sobre terraços gramados, áreas de trabalho e uma passagem baixa junto ao lago.',camp:{x:-20,y:10},lake:{x:8,y:10},lakeScale:.8,elevations:[{left:-21,top:-41,size:42,style:'grass',villageSlot:0},{left:29,top:-28,size:42,style:'grass',villageSlot:2}],exitGround:{x:21,y:13},groundVillage:{x:-28,y:8}},
 {title:'Refúgio das Águas',description:'A vila baixa acompanha a margem, enquanto um refúgio elevado aparece no oeste. O portal fica na clareira.',camp:{x:-18,y:11},lake:{x:-1,y:1},lakeScale:.95,elevations:[{left:12,top:-24,size:24,style:'stone'},{left:-59,top:-40,size:42,style:'grass',villageSlot:1}],exitGround:{x:20,y:8},groundVillage:{x:-25,y:-5}},
 {title:'Praça dos Guardiões',description:'Uma praça elevada com moradores e comércio, um segundo terraço e trilhas que se encontram antes da encosta.',camp:{x:-21,y:11},lake:{x:-27,y:-6},lakeScale:.65,elevations:[{left:-20,top:-42,size:42,style:'stone',villageSlot:0},{left:30,top:-25,size:42,style:'grass',villageSlot:2}],groundVillage:{x:-28,y:8}},
 {title:'Encosta das Fontes',description:'A encosta final das Nascentes. O portal principal reserva a passagem ao capítulo 5; a ponte medieval elevada liga o terraço ao Castelo Bônus, também acessível pela escadaria leste.',camp:{x:8,y:9},lake:{x:12,y:7},lakeScale:.75,elevations:[{left:-66,top:-19,size:21,style:'grass'},{left:-44.54,top:-14.718510638,size:42,style:'stone',villageSlot:1}],groundVillage:{x:-28,y:8}},
];
// Portal clearings are authored separately from building footprints and roof silhouettes.
const portalClearings=[[27,16],[18,17],[23,19],[22,18],[20,20],[28,18],[24,19],[25,17],[24,19],[5,18]];
NASCENTES_LAYOUTS.forEach((layout,i)=>{layout.exitGround={x:portalClearings[i][0],y:portalClearings[i][1]};layout.elevations.forEach((e,j)=>{if((i===3&&j===1)||(i===4&&j===0)||(i===8&&j===0)||(i===9&&j===1))e.style='medieval';e.stairModel=i===9&&j===1?'isometric':(i+j)%2?'slim':'broad';});});
export const nascentesLayout=(index=30)=>NASCENTES_LAYOUTS[Math.max(0,Math.min(9,index-30))];
export const nascentesElevations=(index=30)=>nascentesLayout(index).elevations;
export const plateauPoint=(u:number,v:number,e:NascentesElevation)=>({x:e.left+u*e.size,y:e.top+v*e.size});
export function nascentesVillagePosition(room:number,slot:number){
 const layout=nascentesLayout(room),e=layout.elevations.find(e=>e.villageSlot===slot);
 if(e)return {...plateauPoint(.5,.56,e),elevated:true};
 if(slot===0)return {...(room===39?{x:-22,y:36}:layout.elevations.some(e=>e.villageSlot===1)?{x:-36,y:18}:layout.groundVillage),elevated:false};
 // Keep remaining established neighborhoods clear of authored water and cliffs.
 const remote=[[-44,-30],[60,-37],[84,13],[-48,35],[35,38],[76,47],[-74,25],[-74,-30],[0,66]][slot-1];
 return {x:remote[0]+(room%3-1)*2,y:remote[1]+(room%4-1)*2,elevated:false};
}
