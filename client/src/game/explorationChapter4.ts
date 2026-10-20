import {insideRegion,touchesRegion,type GroundPoint,type BiomeComposition} from './biomeComposition';
import type {CampaignRoom} from './explorationCampaign';
/** Authored composition, not a generated scatter: every point is registered to the approved art. */
export const NASCENTES_SCENE={left:-8,top:-7,width:30,height:30*941/1672,pixelWidth:1672,pixelHeight:941,version:2 as const};
export const NASCENTES_ASSETS={scene:'/forest-adventure/chapter4/approved-room31-empty-v1.webp',grass:'/forest-adventure/chapter4/approved-room31-empty-v1.webp',stone:'/forest-adventure/chapter4/quest-items-v2.webp',cliff:'/forest-adventure/chapter4/approved-room31-empty-v1.webp',stairs:'/forest-adventure/chapter4/stairs-nascentes-v3.webp',shelter:'/forest-adventure/chapter4/shelter-nascentes-v1.webp',portal:'/forest-adventure/chapter4/approved-room31-reference-v1.webp'};
export const nascentesPoint=(u:number,v:number)=>({x:NASCENTES_SCENE.left+u*NASCENTES_SCENE.width,y:NASCENTES_SCENE.top+v*NASCENTES_SCENE.height});
const polygon=(p:readonly number[][])=>p.map(([u,v])=>nascentesPoint(u,v));
export const NASCENTES_STAIRS=polygon([[.548,.557],[.623,.594],[.685,.394],[.622,.352]]);
export const NASCENTES_STAIR_BASE=nascentesPoint(.585,.574),NASCENTES_STAIR_TOP=nascentesPoint(.649,.375);
export const NASCENTES_PLATEAU=polygon([[.616,.188],[.694,.150],[.772,.148],[.837,.177],[.870,.248],[.906,.267],[.915,.295],[.870,.323],[.822,.330],[.781,.383],[.748,.410],[.691,.406],[.670,.393],[.622,.351],[.601,.304],[.565,.266],[.571,.224]]);
export const NASCENTES_LOWER=polygon([[.170,.775],[.200,.702],[.300,.690],[.400,.660],[.478,.628],[.528,.584],[.548,.557],[.623,.594],[.634,.690],[.683,.720],[.740,.765],[.817,.790],[.867,.831],[.910,.920],[.863,.974],[.780,.936],[.684,.902],[.629,.885],[.553,.880],[.520,.985],[.469,.985],[.420,.885],[.362,.861],[.281,.863],[.220,.885],[.174,.863],[.159,.828]]);
export const NASCENTES_WATER=[polygon([[.066,.342],[.108,.319],[.151,.303],[.214,.306],[.283,.296],[.339,.312],[.387,.349],[.436,.391],[.463,.439],[.482,.512],[.474,.556],[.431,.590],[.379,.628],[.325,.643],[.286,.623],[.230,.603],[.191,.571],[.170,.515],[.120,.464],[.085,.403]]),polygon([[.304,.116],[.337,.103],[.376,.104],[.410,.114],[.431,.130],[.438,.154],[.430,.181],[.410,.200],[.391,.221],[.365,.228],[.339,.216],[.326,.198],[.314,.175],[.295,.169],[.285,.151],[.292,.130]])];
export const NASCENTES_COMPOSITION:BiomeComposition={id:'nascentes-approved-v2',regions:NASCENTES_WATER.map((p,i)=>({id:'nascentes-water-'+i,material:'water',seed:6202+i,polygon:p}))};
const walkRegions=[NASCENTES_LOWER,NASCENTES_STAIRS,NASCENTES_PLATEAU];
function onGround(p:GroundPoint){return walkRegions.some(poly=>insideRegion(p,poly));}
export function nascentesHeight(p:GroundPoint){
 if(insideRegion(p,NASCENTES_PLATEAU))return 1;
 if(!insideRegion(p,NASCENTES_STAIRS))return 0;
 const a=NASCENTES_STAIR_BASE,b=NASCENTES_STAIR_TOP,dx=b.x-a.x,dy=b.y-a.y,t=((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy);
 return Math.max(0,Math.min(1,(t-.06)/.84));
}
export function nascentesTraverse(a:GroundPoint,b:GroundPoint){return Math.abs(nascentesHeight(a)-nascentesHeight(b))<=Math.hypot(a.x-b.x,a.y-b.y)*.55+.025;}
export function nascentesBlocked(p:GroundPoint,radius:number,open:boolean){
 if(!open&&touchesRegion(p,radius,NASCENTES_STAIRS))return true;
 return ![p,{x:p.x-radius,y:p.y},{x:p.x+radius,y:p.y},{x:p.x,y:p.y-radius},{x:p.x,y:p.y+radius}].every(onGround);
}
/** Public path stubs are reserved for future chunks, not falsely counted as new rooms. */
export const NASCENTES_CONNECTIONS=[{id:'south',label:'Trilha do sul',point:nascentesPoint(.5,.96)},{id:'east',label:'Caminho das encostas',point:nascentesPoint(.89,.92)}];
export const CHAPTER4_ROOM:CampaignRoom={index:30,biome:'nascentes',title:'Jardim das Nascentes',hint:'Colete 12 fibras e ative as pedras 1, 2 e 3 para liberar a escadaria. Suba ao pátio de pedra e entre no portal. Sala piloto sem NPCs.',camp:nascentesPoint(.210,.828),marker:nascentesPoint(.815,.285),exit:nascentesPoint(.900,.290),fibers:12,encounters:0,switches:[[.320,.800],[.470,.820],[.590,.660]].map(([u,v])=>nascentesPoint(u,v)),nodes:[{id:'spring-f1',...nascentesPoint(.260,.760),item:'fibra',quantity:4},{id:'spring-f2',...nascentesPoint(.460,.680),item:'fibra',quantity:4},{id:'spring-f3',...nascentesPoint(.650,.760),item:'fibra',quantity:4},{id:'spring-fruit',...nascentesPoint(.730,.245),item:'fruta',quantity:2},{id:'spring-amber',...nascentesPoint(.815,.285),item:'ambar',quantity:3}],enemies:[],walls:[],scenery:[],composition:NASCENTES_COMPOSITION};
export const NASCENTES_GARDENS:never[]=[];
