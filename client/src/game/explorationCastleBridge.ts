import {castleApproachBase} from './explorationCastleApproach';
import {nascentesElevations,plateauPoint} from './explorationNascentesLayout';
import {insideRegion,type GroundPoint} from './biomeComposition';
export const CASTLE_BRIDGE_ASSET='/forest-adventure/chapter4/castle-bridge-medieval-v2.webp';
/** Hand-traced deck anchors; one similarity transform preserves width, paving and direction. */
export const BRIDGE_SOURCE={from:{x:150,y:930},to:{x:1090,y:285},halfWidth:45};
export const castleBridgeStart=()=>plateauPoint(.87,.56,nascentesElevations(39)[1]);
export const castleBridgeEnd=castleApproachBase;
export function castleBridgePoint(x:number,y:number):GroundPoint{const a=castleBridgeStart(),b=castleBridgeEnd,s=BRIDGE_SOURCE,dx=s.to.x-s.from.x,dy=s.to.y-s.from.y,den=dx*dx+dy*dy,c=((b.x-a.x)*dx+(b.y-a.y)*dy)/den,d=((b.y-a.y)*dx-(b.x-a.x)*dy)/den;return{x:a.x+c*(x-s.from.x)-d*(y-s.from.y),y:a.y+d*(x-s.from.x)+c*(y-s.from.y)};}
const sourceDeck=(()=>{const {from:a,to:b,halfWidth:w}=BRIDGE_SOURCE,d=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/d,uy=(b.y-a.y)/d;return [[-20,-w],[-20,w],[d+30,w],[d+30,-w]].map(([along,across])=>({x:a.x+ux*along-uy*across,y:a.y+uy*along+ux*across}));})();
export const CASTLE_BRIDGE_FLOOR=sourceDeck.map(p=>castleBridgePoint(p.x,p.y));
export const onCastleBridge=(p:GroundPoint)=>insideRegion(p,CASTLE_BRIDGE_FLOOR);

export function castleBridgeHeight(p:GroundPoint){const a=castleBridgeStart(),b=castleBridgeEnd,t=Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/((b.x-a.x)**2+(b.y-a.y)**2)));return 1-t;}
