import {castleApproachBase} from './explorationCastleApproach';
import {nascentesElevations,plateauPoint} from './explorationNascentesLayout';
import {insideRegion,touchesRegion,type GroundPoint} from './biomeComposition';
export const CASTLE_BRIDGE_ASSET='/forest-adventure/chapter4/castle-bridge-medieval-v2.webp';
/** Hand-traced deck anchors; one similarity transform preserves width, paving and direction. */
export const BRIDGE_SOURCE={from:{x:150,y:930},to:{x:1090,y:285},halfWidth:45};
export const castleBridgeStart=()=>plateauPoint(.87,.56,nascentesElevations(39)[1]);
export const castleBridgeEnd=castleApproachBase;
export function castleBridgePoint(x:number,y:number):GroundPoint{const a=castleBridgeStart(),b=castleBridgeEnd,s=BRIDGE_SOURCE,dx=s.to.x-s.from.x,dy=s.to.y-s.from.y,den=dx*dx+dy*dy,c=((b.x-a.x)*dx+(b.y-a.y)*dy)/den,d=((b.y-a.y)*dx-(b.x-a.x)*dy)/den;return{x:a.x+c*(x-s.from.x)-d*(y-s.from.y),y:a.y+d*(x-s.from.x)+c*(y-s.from.y)};}
const sourceDeck=(()=>{const {from:a,to:b,halfWidth:w}=BRIDGE_SOURCE,d=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/d,uy=(b.y-a.y)/d;return [[-20,-w],[-20,w],[d+30,w],[d+30,-w]].map(([along,across])=>({x:a.x+ux*along-uy*across,y:a.y+uy*along+ux*across}));})();
export const CASTLE_BRIDGE_FLOOR=sourceDeck.map(p=>castleBridgePoint(p.x,p.y));
export const onCastleBridge=(p:GroundPoint)=>insideRegion(p,CASTLE_BRIDGE_FLOOR);

/** Bridge and entrance apron share one raised level; no artificial dip into the cliff. */
export function castleBridgeHeight(p:GroundPoint){return p.bridgeLevel===0?0:1;}

/** Ground contact diamonds traced on the three painted masonry footings. */
export const BRIDGE_PILLAR_SOURCE=[
 {foot:[[252,1041],[350,991],[451,1043],[350,1121]],clip:[230,875,240,260]},
 {foot:[[607,790],[701,741],[796,800],[702,865]],clip:[580,620,235,260]},
 {foot:[[941,548],[1047,499],[1130,560],[1044,631]],clip:[925,402,220,245]},
];
export const CASTLE_BRIDGE_PILLARS=BRIDGE_PILLAR_SOURCE.map(s=>s.foot.map(([x,y])=>castleBridgePoint(x,y)));
export const castleBridgePillarBase=(i:number)=>{const points=CASTLE_BRIDGE_PILLARS[i];return{x:points.reduce((n,p)=>n+p.x,0)/4,y:Math.max(...points.map(p=>p.y))};};
/** Ground actors have height above their foot anchor. Sweep their body toward the
 * footing as well: feet outside the diamond must not bury the torso in its front face. */
export function bridgeGroundBlocked(p:GroundPoint,radius:number){
 return CASTLE_BRIDGE_PILLARS.some(poly=>[0,.2,.4,.6,.8].some(up=>touchesRegion({x:p.x,y:p.y-up},radius+.18,poly)));
}
/** The deck/beam occludes ground actors, while each column is sorted at its own footing. */
export const BRIDGE_DECK_SOURCE=[[10,850],[1036,145],[1082,160],[1235,260],[1228,354],[235,1050],[176,1052],[12,940]];
export function bridgeStepPoint(from:GroundPoint,to:GroundPoint,height:number):GroundPoint{
 const next={x:to.x,y:to.y};if(!onCastleBridge(next))return next;
 const entrance=Math.min(Math.hypot(from.x-castleBridgeStart().x,from.y-castleBridgeStart().y),Math.hypot(from.x-castleBridgeEnd.x,from.y-castleBridgeEnd.y))<1.8;
 return {...next,bridgeLevel:onCastleBridge(from)?from.bridgeLevel??1:height>.9&&entrance?1:0};
}
