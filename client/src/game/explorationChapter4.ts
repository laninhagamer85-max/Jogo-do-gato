import {insideRegion,touchesRegion,pondComposition,type GroundPoint,type BiomeComposition} from './biomeComposition';
import type {CampaignRoom} from './explorationCampaign';
export const NASCENTES_ASSETS={grass:'/forest-adventure/chapter4/grass-nascentes-v1.webp',stone:'/forest-adventure/chapter4/stone-nascentes-v1.webp',cliff:'/forest-adventure/chapter4/bank-nascentes-v2.webp',stairs:'/forest-adventure/chapter4/stairs-nascentes-v3.webp',shelter:'/forest-adventure/chapter4/shelter-nascentes-v1.webp'};
export const NASCENTES_PLATEAU:readonly GroundPoint[]=[{x:10,y:0},{x:16,y:-.3},{x:18.7,y:2},{x:18.2,y:8.7},{x:15.5,y:10.7},{x:10,y:10},{x:9.8,y:6.6},{x:9.8,y:4.4}];
export const NASCENTES_RAMP={x:6,y:4.4,width:4,height:2.2};
const inRamp=(p:GroundPoint,pad=0)=>p.x>=6-pad&&p.x<=10+pad&&p.y>=4.4-pad&&p.y<=6.6+pad;
export function nascentesHeight(p:GroundPoint){return inRamp(p)?Math.max(0,Math.min(1,(p.x-6)/4)):insideRegion(p,NASCENTES_PLATEAU)?1:0;}
export function nascentesTraverse(a:GroundPoint,b:GroundPoint){return Math.abs(nascentesHeight(a)-nascentesHeight(b))<=Math.hypot(a.x-b.x,a.y-b.y)*.3+.015;}
/** Visible front rock faces are solid; only the authored ramp connects height levels. */
export const NASCENTES_FACES=NASCENTES_PLATEAU.flatMap((p,i)=>{const q=NASCENTES_PLATEAU[(i+1)%NASCENTES_PLATEAU.length];return q.x<p.x?[ [p,q,{x:q.x,y:q.y+.78},{x:p.x,y:p.y+.78}] ]:[];});
export function nascentesBlocked(p:GroundPoint,radius:number,open:boolean){
 if(!open&&inRamp(p,radius))return true;
 if(inRamp(p,-radius*.4))return false;
 return NASCENTES_FACES.some(poly=>touchesRegion(p,radius,poly))&&!insideRegion(p,NASCENTES_PLATEAU);
}
const ponds=[pondComposition('nascentes-low',{x:-.5,y:7.5},1.3),pondComposition('nascentes-high',{x:14,y:5},1.0),pondComposition('nascentes-source',{x:7,y:-3},1.05)];
export const NASCENTES_COMPOSITION:BiomeComposition={id:'nascentes-pilot-v1',regions:ponds.flatMap(p=>p.regions),props:ponds.flatMap(p=>p.props??[])};
const obstacles=[[-3,1,3,2.3,3.1],[4,-2,3,2.5,3.2],[3,6,0,1.3,1.0],[5,8,3,2.2,3],[13,2,3,2.1,3.0],[16,7,0,1.4,1.0],[17,1,3,2.4,3.2],[-3,11,3,2.5,3.1]];
export const CHAPTER4_ROOM:CampaignRoom={index:30,biome:'nascentes',title:'Jardim das Nascentes',hint:'Colete 12 fibras e ative os marcos 1, 2 e 3 nesta ordem para liberar a escadaria de pedra. Suba ao platô e alcance o portal. Sala piloto sem NPCs.',camp:{x:1.5,y:1.5},marker:{x:16.5,y:8.5},exit:{x:16.5,y:9.5},fibers:12,encounters:0,switches:[{x:-1.5,y:3.5},{x:3.5,y:10.5},{x:5.5,y:2.5}],nodes:[{id:'spring-f1',x:-2.5,y:2.5,item:'fibra',quantity:4},{id:'spring-f2',x:3.5,y:8.5,item:'fibra',quantity:4},{id:'spring-f3',x:4.5,y:2.5,item:'fibra',quantity:4},{id:'spring-fruit',x:11.5,y:8.5,item:'fruta',quantity:2},{id:'spring-amber',x:15.5,y:8.5,item:'ambar',quantity:3}],enemies:[],walls:obstacles.map(([x,y])=>({x,y})),scenery:obstacles.map(([x,y,index,width,height])=>({x:x+.5,y:y+.92,index,width,height})),composition:NASCENTES_COMPOSITION};
export const NASCENTES_GARDENS=[[-2,0,1],[-1,4.8,0],[-3,6,3],[1,5.8,1],[2,10.8,2],[4,7.5,3],[5,9.5,0],[6,-.8,1],[8,-1,3],[11,1,2],[12,6.8,0],[15.8,2.5,1],[16.3,6,3],[17,10.5,2],[10.8,9,1],[-4,9.5,3],[5,12,0]].map(([x,y,index],i)=>({x,y,index,width:.8+(i%3)*.2,height:.55+(i%3)*.1,blocking:false as const}));
