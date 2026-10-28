import type {GroundPoint} from './biomeComposition';
/** Grow uniformly around the approved bridge landing, rather than moving its endpoint. */
const bridgeLanding={x:13.44,y:-5.91};
const size=30;
export const CASTLE_ART={left:bridgeLanding.x-.22*size,top:bridgeLanding.y-.785*size,size};
export const castleArtPoint=(u:number,v:number)=>({x:CASTLE_ART.left+u*size,y:CASTLE_ART.top+v*size});
const castleUV=(p:GroundPoint)=>({u:(p.x-CASTLE_ART.left)/size,v:(p.y-CASTLE_ART.top)/size});
export const castleApproachBase=bridgeLanding,castleApproachTop=castleArtPoint(.265,.70),castleDoor=castleArtPoint(.315,.655);
export const onCastleLanding=(p:GroundPoint)=>{const {u,v}=castleUV(p);return u>.235&&u<.375&&v>.60&&v<.725;};
export const nearCastleApproach=(p:GroundPoint)=>{const {u,v}=castleUV(p);return u>.173&&u<.418&&v>.557&&v<.836;};
export const insideCastleFootprint=(p:GroundPoint,r:number)=>{const {u,v}=castleUV(p),pad=r/size;return u>.04-pad&&u<.95+pad&&v>.23-pad&&v<.97+pad;};
export const castleLowerAccess=(p:GroundPoint)=>{const {u,v}=castleUV(p);return u>.179&&u<.279&&v>.785;};
