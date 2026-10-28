import {castleGroundBase,castleGroundTop,castleDoor,onCastleLanding,nearCastleApproach,insideCastleFootprint,castleSceneryClearance,CASTLE_GROUND_STAIRS,castleStairHeight} from './explorationCastleApproach';
import {CASTLE_BRIDGE_FLOOR,onCastleBridge,castleBridgeHeight,castleBridgeStart,castleBridgeEnd,bridgeGroundBlocked} from './explorationCastleBridge';
import {villageClearings} from './explorationVillageLayout';
import {nascentesLayout,nascentesElevations,plateauPoint,CHAPTER4_END,EXPLORATION_ROOM_COUNT,type NascentesElevation} from './explorationNascentesLayout';
export {nascentesElevations} from './explorationNascentesLayout';
import isometricStairArt from '../../public/forest-adventure/chapter4/stairs-isometric-v1-manifest.json';
import stairArt from '../../public/forest-adventure/biome-shelters/compact-stairs-manifest.json';
import {insideRegion,touchesRegion,organicOutline,type GroundPoint,type BiomeComposition} from './biomeComposition';
import type {CampaignRoom} from './explorationCampaign';
/** Overview bounds only: not a world wall or camera clamp. */
export const NASCENTES_SCENE={left:-18,top:-15,width:42,height:34,pixelWidth:0,pixelHeight:0,version:4 as const};
export const NASCENTES_ASSETS={trees:'/forest-adventure/chapter4/trees-nascentes-v1.webp',soil:'/forest-adventure/chapter4/soil-nascentes-v1.webp',grass:'/forest-adventure/ground-proposals-20261016/option-3.webp',stone:'/forest-adventure/chapter4/quest-items-v2.webp',cliff:'/forest-adventure/chapter4/plateau-courtyard-v3.webp',grassPlateau:'/forest-adventure/chapter4/plateau-grass-v3.webp',stairs:'/forest-adventure/biome-shelters/compact-stairs-v1.webp',shelter:'/forest-adventure/chapter4/shelter-nascentes-v1.webp',portal:'/forest-adventure/river-portal-v1.webp'};
export const nascentesElevation=(index=30)=>nascentesElevations(index)[0];
export const elevationPoint=(u:number,v:number,index=30)=>{const e=nascentesElevation(index);return{x:e.left+u*e.size,y:e.top+v*e.size};};
export const nascentesPoint=(u:number,v:number)=>({x:NASCENTES_SCENE.left+u*NASCENTES_SCENE.width,y:NASCENTES_SCENE.top+v*NASCENTES_SCENE.height});
const floorUV=[[.075,.555],[.195,.475],[.335,.410],[.430,.330],[.535,.325],[.650,.375],[.785,.390],[.885,.460],[.945,.555],[.920,.605],[.825,.655],[.720,.725],[.620,.775],[.520,.805],[.415,.755],[.390,.74316],[.385,.78566],[.285,.73321],[.290,.69071],[.250,.665],[.165,.650],[.090,.610]];
export const castleStairBase=castleGroundBase,castleStairTop=castleGroundTop,castleGatePoint=castleDoor;
export const broadStairArt={anchors_pixel:{lowerFoot:[627,1000],upperFoot:[627,300]},walkablePolygon_pixel:[[390,200],[864,200],[912,1090],[340,1090]]};
export const plateauStairArt=(e:NascentesElevation)=>e.stairModel==='isometric'?isometricStairArt:e.stairModel==='broad'?broadStairArt:stairArt;
export function stairPlacementPoint(x:number,y:number,a:GroundPoint,b:GroundPoint,art=stairArt as {anchors_pixel:{lowerFoot:number[];upperFoot:number[]}}){const [lx,ly]=art.anchors_pixel.lowerFoot,[ux,uy]=art.anchors_pixel.upperFoot,sx=ux-lx,sy=uy-ly,wx=b.x-a.x,wy=b.y-a.y,den=sx*sx+sy*sy,c=(wx*sx+wy*sy)/den,d=(wy*sx-wx*sy)/den;return{x:a.x+c*(x-lx)-d*(y-ly),y:a.y+d*(x-lx)+c*(y-ly)};}
/** A supported upper landing lets a smaller staircase meet the same ground/cliff seam. */
export const plateauStairLanding=(e:NascentesElevation)=>e.stairModel==='isometric'?isometricStairArt.upperLanding_pixel.map(([x,y])=>plateauStairPoint(x,y,e)):[[.390,.74316],[.385,.78566],[.285,.73321],[.290,.69071]].map(([u,v])=>plateauPoint(u,v,e));
export const plateauStairTop=(e:NascentesElevation)=>plateauPoint(.335,.7475,e);
export const plateauStairBase=(e:NascentesElevation)=>plateauPoint(e.stairModel==='isometric'?.235:.32,e.stairModel==='isometric'?.85:.845,e);
export function plateauStairPoint(x:number,y:number,e:NascentesElevation){return stairPlacementPoint(x,y,plateauStairBase(e),plateauStairTop(e),plateauStairArt(e));}
export function stairSourcePoint(x:number,y:number,index=30){return plateauStairPoint(x,y,nascentesElevation(index));}
export const castleStairPoint=(x:number,y:number)=>stairPlacementPoint(x,y,castleStairBase,castleStairTop);
// The rendered sprite and collision use the same uniformly transformed walking polygon.
const castleStairFloor=CASTLE_GROUND_STAIRS;
const castleLanding=onCastleLanding;
const stairProgress=(p:GroundPoint,a:GroundPoint,b:GroundPoint)=>Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/((b.x-a.x)**2+(b.y-a.y)**2)));


const footprintUV=[[.035,.555],[.18,.455],[.36,.365],[.5,.29],[.7,.35],[.91,.43],[.975,.56],[.99,.68],[.79,.81],[.55,.94],[.34,.86],[.15,.78],[.025,.68]];
const geometry=Array.from({length:10},(_,i)=>nascentesElevations(30+i).map(e=>({e,floor:floorUV.map(([u,v])=>plateauPoint(u,v,e)),stairs:plateauStairArt(e).walkablePolygon_pixel.map(([x,y])=>plateauStairPoint(x,y,e)),footprint:footprintUV.map(([u,v])=>plateauPoint(u,v,e))})));
export const nascentesGeometry=(index=30)=>geometry[Math.max(0,Math.min(9,index-30))];
const geo=(index:number)=>nascentesGeometry(index)[0];
export const NASCENTES_PLATEAU=geo(30).floor,NASCENTES_STAIRS=geo(30).stairs;
export const stairBase=(index=30)=>plateauStairBase(nascentesElevation(index)),stairTop=(index=30)=>plateauStairTop(nascentesElevation(index));
export const NASCENTES_STAIR_BASE=stairBase(),NASCENTES_STAIR_TOP=stairTop();
export function nascentesHeight(p:GroundPoint,index=30){if(index===CHAPTER4_END){if(insideRegion(p,castleStairFloor))return castleStairHeight(p);if(onCastleBridge(p))return castleBridgeHeight(p);if(castleLanding(p))return 1;}for(const g of nascentesGeometry(index)){if(insideRegion(p,g.stairs))return stairProgress(p,plateauStairBase(g.e),plateauStairTop(g.e));if(insideRegion(p,g.floor))return 1;}return 0;}
export const nascentesTraverse=(a:GroundPoint,b:GroundPoint,index=30)=>{const near=nearCastleApproach;const castle=index===CHAPTER4_END&&(near(a)||near(b))&&(insideRegion(a,castleStairFloor)||insideRegion(b,castleStairFloor)||castleLanding(a)||castleLanding(b));return Math.abs(nascentesHeight(a,index)-nascentesHeight(b,index))<=Math.hypot(a.x-b.x,a.y-b.y)*(castle?1:.65)+.025;};
export function nascentesBlocked(p:GroundPoint,radius:number,open:boolean,index=30,ignoreShelter=false){if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return true;const all=nascentesGeometry(index),under=index===CHAPTER4_END&&p.bridgeLevel===0&&onCastleBridge(p);if(index===CHAPTER4_END&&!(p.bridgeLevel===1&&onCastleBridge(p))&&bridgeGroundBlocked(p,radius))return true;if(index===CHAPTER4_END&&!under&&touchesRegion(p,radius,CASTLE_BRIDGE_FLOOR)&&[p,{x:p.x-radius,y:p.y},{x:p.x+radius,y:p.y},{x:p.x,y:p.y-radius},{x:p.x,y:p.y+radius}].every(q=>onCastleBridge(q)||insideRegion(q,all[1].floor)||insideRegion(q,castleStairFloor)||castleLanding(q)))return false;if(index===CHAPTER4_END&&!under&&onCastleBridge(p))return true;if(index===CHAPTER4_END&&insideCastleFootprint(p,radius)&&!([p,{x:p.x-radius,y:p.y},{x:p.x+radius,y:p.y},{x:p.x,y:p.y-radius},{x:p.x,y:p.y+radius}].every(q=>!insideCastleFootprint(q,0)||!under&&(insideRegion(q,castleStairFloor)||castleLanding(q)))))return true;if(!open&&all.some(g=>touchesRegion(p,radius,g.stairs)))return true;if(nascentesCollisionTrees(p,index).some(t=>Math.hypot(t.x-p.x,t.y-p.y)<radius+t.radius))return true;
 const camp=nascentesLayout(index).camp;if(!ignoreShelter&&Math.abs(p.x-(camp.x-.8))<.65+radius&&Math.abs(p.y-(camp.y-.5))<.22+radius)return true;
 if(nascentesShoreProps(index).some(q=>Math.hypot(p.x-q.x,p.y-q.y)<radius+.25))return true;
 const ground=(q:GroundPoint)=>all.every(({footprint,floor,stairs})=>!insideRegion(q,footprint)||!under&&(insideRegion(q,floor)||insideRegion(q,stairs)));if(![p,{x:p.x-radius,y:p.y},{x:p.x+radius,y:p.y},{x:p.x,y:p.y-radius},{x:p.x,y:p.y+radius}].every(ground))return true;return false;}
const outline=[[-4.8,-1.5],[-4,-3],[-2.3,-3.8],[-.2,-3.5],[1.5,-3.9],[3.4,-2.4],[4.5,-.3],[4.1,1.2],[2.8,2.3],[.8,3.2],[-.7,2.9],[-2.3,3.3],[-3.8,1.9],[-4.4,.4]];
const compositions=new Map<number,BiomeComposition>();
export function nascentesComposition(index=30):BiomeComposition{const cached=compositions.get(index);if(cached)return cached;const layout=nascentesLayout(index),c=layout.lake,scale=layout.lakeScale,polygon=organicOutline(outline.map(([x,y])=>({x:c.x+x*scale,y:c.y+y*scale*(index===CHAPTER4_END?1.2:1)})),4);const value:BiomeComposition={id:'nascentes-modular-'+index+'-v6',regions:[{id:'shore',material:'sand',seed:index,polygon:polygon.map(p=>({x:c.x+(p.x-c.x)*1.09,y:c.y+(p.y-c.y)*1.09}))},{id:'lake',material:'water',seed:index+6202,polygon}]};compositions.set(index,value);return value;}
export const NASCENTES_COMPOSITION=nascentesComposition(),NASCENTES_WATER=NASCENTES_COMPOSITION.regions.filter(r=>r.material==='water').map(r=>r.polygon),NASCENTES_GARDENS:never[]=[];
export const returnPortal=(index=30)=>index<30?{x:-5.2+(index%3)*.45,y:7+(index%4)*.7}:index===CHAPTER4_END?{x:27,y:19}:{x:-10+(index%3-1)*2,y:23+(index%2)*2};
export const NASCENTES_CONNECTIONS=[{id:'south',label:'Trilha do sul',point:{x:0,y:16}},{id:'east',label:'Caminho das encostas',point:{x:22,y:10}}];
export function nascentesRoom(index=30):CampaignRoom{const layout=nascentesLayout(index),last=index===CHAPTER4_END,top=nascentesElevation(index).villageSlot===undefined?elevationPoint(.64,.51,index):elevationPoint(.56,.55,index),exit=layout.exitGround??elevationPoint(nascentesElevation(index).villageSlot===undefined?.77:.73,nascentesElevation(index).villageSlot===undefined?.55:.68,index),camp=layout.camp;const switches=last?[{x:2,y:15},{x:-6,y:20},{x:-12,y:26}]:index===30?[{x:-10,y:7},{x:-2,y:9},{x:8,y:9}]:[{x:camp.x+2,y:camp.y-2},{x:camp.x+5,y:camp.y+2},{x:camp.x+8,y:camp.y+1}];const fiberPoints=last?[{x:0,y:16},{x:-5,y:24},{x:2,y:27}]:index===30?[{x:-12,y:5},{x:-3,y:7},{x:11,y:8}]:[{x:camp.x,y:camp.y-3},{x:camp.x+4,y:camp.y+1},{x:camp.x+8,y:camp.y+3}];return{index,biome:'nascentes',title:layout.title,hint:layout.description+' Visitação livre pelos portais. Os desafios de animais, insetos e Mestre serão definidos após a revisão.',camp,marker:top,exit,fibers:12,encounters:0,switches,nodes:[...fiberPoints.map((p,i)=>({id:index===30?'spring-f'+(i+1):'spring-'+index+'-f'+(i+1),...p,item:'fibra' as const,quantity:4})),{id:index===30?'spring-amber':'spring-'+index+'-amber',...top,item:'ambar',quantity:3}],enemies:[],walls:[],scenery:[],composition:nascentesComposition(index)};}
export const CHAPTER4_ROOMS=Array.from({length:10},(_,i)=>nascentesRoom(30+i));
export const CHAPTER4_ROOM=CHAPTER4_ROOMS[0],CHAPTER4_SECOND_ROOM=CHAPTER4_ROOMS[1];

export type NascentesTree=GroundPoint&{variant:number;width:number;radius:number};
const groves:Record<number,number[][]>={30:[[-15,-3],[-12,-5],[-10,-6],[-3,-7],[-1,-6],[25,5],[25,7],[21,13],[20,15],[3,15],[-4,13],[-7,14],[-16,6],[-16,8]],39:[[-20,-6],[-18,-4],[-19,0],[-7,-10],[-3,-9],[6,-7],[7,-5],[19,5],[20,9],[17,13],[15,15],[-2,13],[-5,15],[-14,9]]};
export function nascentesTrees(bounds:{left:number;top:number;width:number;height:number},index=30):NascentesTree[]{
 const trees:NascentesTree[]=(groves[index]??groves[30]).map(([x,y],i)=>({x,y,variant:(i+index)%4,width:1.8+(i%4)*.28,radius:.28}));
 if(index!==30&&index!==CHAPTER4_END){trees.length=0;for(let i=0;i<14;i++){const a=i*2.399+index*.3,r=14+i%4*3;trees.push({x:Math.cos(a)*r,y:Math.sin(a)*r+3,variant:(i+index)%4,width:1.8+(i%4)*.28,radius:.28});}}
 for(const e of nascentesElevations(index)){const upper=e.villageSlot===undefined?[[.17,.575],[.47,.35],[.81,.46],[.88,.57],[.49,.735],[.60,.72]]:[[.17,.56],[.83,.55],[.43,.34]];upper.forEach(([u,v],i)=>trees.push({...plateauPoint(u,v,e),variant:(index+i)%4,width:1.45+(i%3)*.18,radius:.32}));}
 // Exterior groves continue beyond the authored sector; no perimeter fence, ring or camera wall.
 for(let cy=Math.floor(bounds.top/9)-1;cy<=Math.ceil((bounds.top+bounds.height)/9)+1;cy++)for(let cx=Math.floor(bounds.left/9)-1;cx<=Math.ceil((bounds.left+bounds.width)/9)+1;cx++){
  const n=(Math.imul(cx,374761393)^Math.imul(cy,668265263)^index*17191)>>>0;
  const x=cx*9+(n%71)/10,y=cy*9+((n>>>8)%71)/10;
  if(x>-23&&x<29&&y>-18&&y<20)continue;
  for(let i=0;i<2+n%2;i++){const angle=i*2.399+(n%11)*.3,spread=i?1.2+((n>>>16)%10)/10:0;trees.push({x:x+Math.cos(angle)*spread,y:y+Math.sin(angle)*spread,variant:(n+i)%4,width:1.7+((n>>>(4+i))%12)/10,radius:.28});}
 }
 const layout=nascentesLayout(index),goals=[...nascentesRoom(index).nodes,...nascentesRoom(index).switches,...(index===39?[castleBridgeStart(),castleBridgeEnd]:[]),layout.camp,returnPortal(index),layout.exitGround??elevationPoint(.77,.55,index),...nascentesElevations(index).flatMap(e=>[plateauStairBase(e),plateauStairTop(e)])];return trees.filter(t=>index!==39||!castleSceneryClearance(t,t.width*.6)&&!touchesRegion(t,2,CASTLE_BRIDGE_FLOOR)&&!bridgeGroundBlocked(t,1.2)).filter(t=>!goals.some(c=>Math.hypot(c.x-t.x,c.y-t.y)<4)&&!nascentesComposition(index).regions.some(r=>r.material==='water'&&touchesRegion(t,.5,r.polygon))).filter(t=>!villageClearings(index).some(c=>Math.hypot(c.x-t.x,c.y-t.y)<3.4)).filter(t=>t.x>=bounds.left-3&&t.x<=bounds.left+bounds.width+3&&t.y>=bounds.top-3&&t.y<=bounds.top+bounds.height+6);
}

/** Explicit graph: adding an area adds its authored content and links, not a fake room counter. */
export const EXPLORATION_CONNECTIONS=[...Array.from({length:EXPLORATION_ROOM_COUNT-1},(_,from)=>({from,to:from+1,kind:'exit' as const})),...Array.from({length:EXPLORATION_ROOM_COUNT-1},(_,i)=>({from:i+1,to:i,kind:'return' as const}))];
export const connectedPortal=(from:number,to:number)=>EXPLORATION_CONNECTIONS.some(link=>link.from===from&&link.to===to);
export const portalDestination=(from:number,kind:'exit'|'return')=>EXPLORATION_CONNECTIONS.find(link=>link.from===from&&link.kind===kind)?.to;

export function nascentesShoreProps(index=30){if(index===30)return [[-10,2.8],[-8.5,-2.6],[-3.2,4.3],[-1,0]].map(([x,y],i)=>({x,y,width:1.15+(i%3)*.18}));if(index===CHAPTER4_END)return [[8.2,6],[10,3.4],[15.1,8.9],[11,10.3]].map(([x,y],i)=>({x,y,width:1.15+(i%3)*.18}));const c=nascentesLayout(index).lake,s=nascentesLayout(index).lakeScale;return [[-4.4,1.8],[-2.5,-3.6],[3.8,1.5],[1,-3.8]].map(([x,y],i)=>({x:c.x+x*s,y:c.y+y*s,width:1.1+(i%3)*.18}));}

const collisionTrees=new Map<string,NascentesTree[]>();
function nascentesCollisionTrees(p:GroundPoint,index:number){const cx=Math.floor(p.x/8),cy=Math.floor(p.y/8),key=`${index}:${cx}:${cy}`;let trees=collisionTrees.get(key);if(!trees){trees=nascentesTrees({left:cx*8-2,top:cy*8-2,width:12,height:12},index);if(collisionTrees.size>=512)collisionTrees.delete(collisionTrees.keys().next().value!);collisionTrees.set(key,trees);}return trees;}
