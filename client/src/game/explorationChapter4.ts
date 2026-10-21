import stairArt from '../../public/forest-adventure/biome-shelters/compact-stairs-manifest.json';
import {insideRegion,touchesRegion,organicOutline,type GroundPoint,type BiomeComposition} from './biomeComposition';
import type {CampaignRoom} from './explorationCampaign';
/** Overview bounds only: not a world wall or camera clamp. */
export const NASCENTES_SCENE={left:-18,top:-15,width:42,height:34,pixelWidth:0,pixelHeight:0,version:4 as const};
export const NASCENTES_ASSETS={trees:'/forest-adventure/chapter4/trees-nascentes-v1.webp',soil:'/forest-adventure/chapter4/soil-nascentes-v1.webp',grass:'/forest-adventure/ground-proposals-20261016/option-3.webp',stone:'/forest-adventure/chapter4/quest-items-v2.webp',cliff:'/forest-adventure/chapter4/plateau-courtyard-bare-v2.webp',grassPlateau:'/forest-adventure/chapter4/plateau-grass-bare-v2.webp',stairs:'/forest-adventure/biome-shelters/compact-stairs-v1.webp',shelter:'/forest-adventure/chapter4/shelter-nascentes-v1.webp',portal:'/forest-adventure/river-portal-v1.webp'};
export const nascentesElevation=(index=30)=>index===31?{left:-16,top:-14,size:21}:{left:0,top:-14,size:23};
export const elevationPoint=(u:number,v:number,index=30)=>{const e=nascentesElevation(index);return{x:e.left+u*e.size,y:e.top+v*e.size};};
export const nascentesPoint=(u:number,v:number)=>({x:NASCENTES_SCENE.left+u*NASCENTES_SCENE.width,y:NASCENTES_SCENE.top+v*NASCENTES_SCENE.height});
const floorUV=[[.075,.555],[.195,.475],[.335,.410],[.430,.330],[.535,.325],[.650,.375],[.785,.390],[.885,.460],[.945,.555],[.920,.605],[.825,.655],[.720,.725],[.620,.775],[.520,.805],[.415,.755],[.320,.710],[.250,.665],[.165,.650],[.090,.610]];
export const castleStairBase={x:14.5,y:-7.405},castleStairTop={x:15.15,y:-8.25};
export function stairPlacementPoint(x:number,y:number,a:GroundPoint,b:GroundPoint){const [lx,ly]=stairArt.anchors_pixel.lowerFoot,[ux,uy]=stairArt.anchors_pixel.upperFoot,sx=ux-lx,sy=uy-ly,wx=b.x-a.x,wy=b.y-a.y,den=sx*sx+sy*sy,c=(wx*sx+wy*sy)/den,d=(wy*sx-wx*sy)/den;return{x:a.x+c*(x-lx)-d*(y-ly),y:a.y+d*(x-lx)+c*(y-ly)};}
export function stairSourcePoint(x:number,y:number,index=30){return stairPlacementPoint(x,y,elevationPoint(.32,.845,index),elevationPoint(.34,.715,index));}
export const castleStairPoint=(x:number,y:number)=>stairPlacementPoint(x,y,castleStairBase,castleStairTop);
// The rendered sprite and collision use the same uniformly transformed walking polygon.
const castleStairFloor=stairArt.walkablePolygon_pixel.map(([x,y])=>castleStairPoint(x,y));
const castleLanding=(p:GroundPoint)=>p.x>14.65&&p.x<15.75&&p.y>-8.8&&p.y<-7.8;
const stairProgress=(p:GroundPoint,a:GroundPoint,b:GroundPoint)=>Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/((b.x-a.x)**2+(b.y-a.y)**2)));


const footprintUV=[[.035,.555],[.18,.455],[.36,.365],[.5,.29],[.7,.35],[.91,.43],[.975,.56],[.99,.68],[.79,.81],[.55,.94],[.34,.86],[.15,.78],[.025,.68]];
const poly=(uv:number[][],index=30)=>uv.map(([u,v])=>elevationPoint(u,v,index));
const geometry=[30,31].map(index=>({floor:poly(floorUV,index),stairs:stairArt.walkablePolygon_pixel.map(([x,y])=>stairSourcePoint(x,y,index)),footprint:poly(footprintUV,index)}));
const geo=(index:number)=>geometry[index===31?1:0];
export const NASCENTES_PLATEAU=geo(30).floor,NASCENTES_STAIRS=geo(30).stairs;
export const stairBase=(index=30)=>elevationPoint(.32,.845,index),stairTop=(index=30)=>elevationPoint(.34,.715,index);
export const NASCENTES_STAIR_BASE=stairBase(),NASCENTES_STAIR_TOP=stairTop();
export function nascentesHeight(p:GroundPoint,index=30){if(index===31){if(insideRegion(p,castleStairFloor))return stairProgress(p,castleStairBase,castleStairTop);if(castleLanding(p))return 1;}if(insideRegion(p,geo(index).stairs)){const a=stairBase(index),b=stairTop(index),dx=b.x-a.x,dy=b.y-a.y;return Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));}return insideRegion(p,geo(index).floor)?1:0;}
export const nascentesTraverse=(a:GroundPoint,b:GroundPoint,index=30)=>{const near=(p:GroundPoint)=>p.x>13.5&&p.x<16&&p.y>-9&&p.y<-6.8;const castle=index===31&&(near(a)||near(b))&&(insideRegion(a,castleStairFloor)||insideRegion(b,castleStairFloor)||castleLanding(a)||castleLanding(b));return Math.abs(nascentesHeight(a,index)-nascentesHeight(b,index))<=Math.hypot(a.x-b.x,a.y-b.y)*(castle?1:.65)+.025;};
export function nascentesBlocked(p:GroundPoint,radius:number,open:boolean,index=30){const {stairs,floor,footprint}=geo(index);if(index===31&&p.x>12.4-radius&&p.x<21.5+radius&&p.y>-12.5-radius&&p.y<-5.8+radius&&!([p,{x:p.x-radius,y:p.y},{x:p.x+radius,y:p.y},{x:p.x,y:p.y-radius},{x:p.x,y:p.y+radius}].every(q=>insideRegion(q,castleStairFloor)||castleLanding(q)||(q.x>13.5&&q.x<14.85&&q.y>castleStairBase.y))))return true;if(!open&&touchesRegion(p,radius,stairs))return true;if(nascentesTrees({left:p.x-4,top:p.y-4,width:8,height:8},index).some(t=>Math.hypot(t.x-p.x,t.y-p.y)<radius+t.radius))return true;
 const camp=index===31?{x:8,y:9}:{x:-12,y:8};if(Math.abs(p.x-(camp.x-.8))<.65+radius&&Math.abs(p.y-(camp.y-.5))<.22+radius)return true;
 if(nascentesShoreProps(index).some(q=>Math.hypot(p.x-q.x,p.y-q.y)<radius+.25))return true;
 const ground=(q:GroundPoint)=>!insideRegion(q,footprint)||insideRegion(q,floor)||insideRegion(q,stairs);if(![p,{x:p.x-radius,y:p.y},{x:p.x+radius,y:p.y},{x:p.x,y:p.y-radius},{x:p.x,y:p.y+radius}].every(ground))return true;return false;}
const outline=[[-4.8,-1.5],[-4,-3],[-2.3,-3.8],[-.2,-3.5],[1.5,-3.9],[3.4,-2.4],[4.5,-.3],[4.1,1.2],[2.8,2.3],[.8,3.2],[-.7,2.9],[-2.3,3.3],[-3.8,1.9],[-4.4,.4]];
const compositions=new Map<number,BiomeComposition>();
export function nascentesComposition(index=30):BiomeComposition{const cached=compositions.get(index);if(cached)return cached;const c=index===31?{x:12,y:7}:{x:-6,y:1},polygon=organicOutline(outline.map(([x,y])=>({x:c.x+x*(index===31?.75:1),y:c.y+y*(index===31?.9:1)})),4);const path=index===31?[[10,12],[6,9],[0,8],[-9,6],[-11,3],[-10.4,2.8],[-8.5,5],[0,6.8],[6,7.8],[11,11.3]]:[[-13,10],[-11,7],[-5,6.2],[0,7],[5.5,5.2],[6.1,5.5],[.3,8.4],[-4.8,7.5],[-10.3,8],[-12,10.4]];const value:BiomeComposition={id:`nascentes-modular-${index}-v3`,regions:[{id:'trail',material:'soil',seed:index+900,polygon:organicOutline(path.map(([x,y])=>({x,y})),4)},{id:'shore',material:'sand',seed:index,polygon:polygon.map(p=>({x:c.x+(p.x-c.x)*1.09,y:c.y+(p.y-c.y)*1.09}))},{id:'lake',material:'water',seed:index+6202,polygon}]};compositions.set(index,value);return value;}
export const NASCENTES_COMPOSITION=nascentesComposition(),NASCENTES_WATER=NASCENTES_COMPOSITION.regions.filter(r=>r.material==='water').map(r=>r.polygon),NASCENTES_GARDENS:never[]=[];
export const returnPortal=(index=30)=>index<30?{x:-5.2+(index%3)*.45,y:7+(index%4)*.7}:index===31?{x:8,y:11}:{x:-13,y:10};
export const NASCENTES_CONNECTIONS=[{id:'south',label:'Trilha do sul',point:{x:0,y:16}},{id:'east',label:'Caminho das encostas',point:{x:22,y:10}}];
export function nascentesRoom(index=30):CampaignRoom{const second=index===31,top=elevationPoint(.64,.51,index),exit=elevationPoint(.77,.55,index);return{index,biome:'nascentes',title:second?'Encosta das Fontes':'Jardim das Nascentes',hint:second?'Explore a encosta, reúna 12 fibras e ative as três pedras. O portal do sul permite voltar ao Jardim. Sala de validação sem NPCs.':'Reúna 12 fibras e ative as pedras 1, 2 e 3. Suba pela escadaria ao portal da Encosta. Os caminhos continuam pelo bioma.',camp:second?{x:8,y:9}:{x:-12,y:8},marker:top,exit,fibers:12,encounters:0,switches:second?[{x:5,y:5},{x:-2,y:8},{x:-10,y:6}]:[{x:-10,y:7},{x:-2,y:9},{x:8,y:9}],nodes:[...(second?[{x:6,y:5},{x:0,y:7},{x:-7,y:7}]:[{x:-12,y:5},{x:-3,y:7},{x:11,y:8}]).map((p,i)=>({id:index===30?`spring-f${i+1}`:`spring-${index}-f${i+1}`,...p,item:'fibra' as const,quantity:4})),{id:index===30?'spring-amber':`spring-${index}-amber`,...top,item:'ambar',quantity:3}],enemies:[],walls:[],scenery:[],composition:nascentesComposition(index)};}
export const CHAPTER4_ROOM=nascentesRoom(),CHAPTER4_SECOND_ROOM=nascentesRoom(31);

export type NascentesTree=GroundPoint&{variant:number;width:number;radius:number};
const groves:Record<number,number[][]>={30:[[-15,-3],[-12,-5],[-10,-6],[-3,-7],[-1,-6],[25,5],[25,7],[21,13],[20,15],[3,15],[-4,13],[-7,14],[-16,6],[-16,8]],31:[[-20,-6],[-18,-4],[-19,0],[-7,-10],[-3,-9],[6,-7],[7,-5],[19,5],[20,9],[17,13],[15,15],[-2,13],[-5,15],[-14,9]]};
export function nascentesTrees(bounds:{left:number;top:number;width:number;height:number},index=30):NascentesTree[]{
 const trees:NascentesTree[]=(groves[index]??groves[30]).map(([x,y],i)=>({x,y,variant:(i+index)%4,width:1.8+(i%4)*.28,radius:.28}));
 const upper=index===31?[[.15,.56],[.43,.38],[.55,.39],[.80,.47],[.48,.73]]:[[.17,.575],[.47,.35],[.81,.46],[.88,.57],[.49,.735],[.60,.72]];
 upper.forEach(([u,v],i)=>trees.push({...elevationPoint(u,v,index),variant:(index+i)%4,width:1.45+(i%3)*.18,radius:.32}));
 // Exterior groves continue beyond the authored sector; no perimeter fence, ring or camera wall.
 for(let cy=Math.floor(bounds.top/9)-1;cy<=Math.ceil((bounds.top+bounds.height)/9)+1;cy++)for(let cx=Math.floor(bounds.left/9)-1;cx<=Math.ceil((bounds.left+bounds.width)/9)+1;cx++){
  const n=(Math.imul(cx,374761393)^Math.imul(cy,668265263)^index*17191)>>>0;
  const x=cx*9+(n%71)/10,y=cy*9+((n>>>8)%71)/10;
  if(x>-23&&x<29&&y>-18&&y<20)continue;
  for(let i=0;i<2+n%2;i++){const angle=i*2.399+(n%11)*.3,spread=i?1.2+((n>>>16)%10)/10:0;trees.push({x:x+Math.cos(angle)*spread,y:y+Math.sin(angle)*spread,variant:(n+i)%4,width:1.7+((n>>>(4+i))%12)/10,radius:.28});}
 }
 return trees.filter(t=>t.x>=bounds.left-3&&t.x<=bounds.left+bounds.width+3&&t.y>=bounds.top-3&&t.y<=bounds.top+bounds.height+6);
}

/** Explicit graph: adding an area adds its authored content and links, not a fake room counter. */
export const EXPLORATION_CONNECTIONS=[...Array.from({length:31},(_,from)=>({from,to:from+1,kind:'exit' as const})),...Array.from({length:31},(_,i)=>({from:i+1,to:i,kind:'return' as const})),{from:31,to:30,kind:'exit' as const}];
export const connectedPortal=(from:number,to:number)=>EXPLORATION_CONNECTIONS.some(link=>link.from===from&&link.to===to);
export const portalDestination=(from:number,kind:'exit'|'return')=>EXPLORATION_CONNECTIONS.find(link=>link.from===from&&link.kind===kind)?.to;

export function nascentesShoreProps(index=30){return (index===31?[[8.2,6],[10,3.4],[15.1,8.9],[11,10.3]]:[[-10,2.8],[-8.5,-2.6],[-3.2,4.3],[-1,0]]).map(([x,y],i)=>({x,y,width:1.15+(i%3)*.18}));}
