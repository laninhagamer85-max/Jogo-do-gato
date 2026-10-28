import {insideRegion,touchesRegion,type GroundPoint} from './biomeComposition';
/** One uniform placement for artwork, paved promenade, masonry and access anchors. */
const bridgeLanding={x:13.44,y:-5.91},size=30;
export const CASTLE_ART={left:bridgeLanding.x-.17*size,top:bridgeLanding.y-.76*size,size};
export const CASTLE_ASSET='/forest-adventure/chapter4/castle-gate-v4.webp';
export const castleArtPoint=(u:number,v:number)=>({x:CASTLE_ART.left+u*size,y:CASTLE_ART.top+v*size});
const polygon=(uv:readonly (readonly number[])[])=>uv.map(([u,v])=>castleArtPoint(u,v));
/** Ground-contact footprint, excluding transparent PNG margins and the projected towers. */
export const CASTLE_FOOTPRINT=polygon([[.05,.55],[.15,.50],[.60,.37],[.86,.49],[.96,.55],[.99,.64],[.97,.70],[.86,.77],[.76,.84],[.56,.95],[.45,.94],[.29,.85],[.08,.76],[.025,.65]]);
/** Outside promenade only: inner courtyard and masonry stay blocked. */
export const CASTLE_PROMENADE=polygon([[.11,.515],[.06,.555],[.06,.593],[.11,.622],[.18,.66],[.11,.745],[.205,.790],[.27,.752],[.32,.770],[.40,.808],[.49,.827],[.55,.811],[.68,.750],[.83,.674],[.916,.624],[.938,.60],[.914,.547],[.863,.51],[.845,.538],[.865,.575],[.855,.605],[.825,.623],[.79,.639],[.70,.675],[.62,.715],[.54,.755],[.49,.765],[.46,.75],[.435,.713],[.375,.69],[.32,.638],[.265,.644],[.235,.625],[.22,.607],[.19,.602],[.15,.58],[.145,.547],[.15,.53]]);
export const castleApproachBase=bridgeLanding,castleApproachTop=castleArtPoint(.265,.70),castleDoor=castleArtPoint(.315,.655);
// East staircase is a distinct ground access; the bridge now stays at promenade height.
export const castleGroundBase=castleArtPoint(.955,.695),castleGroundTop=castleArtPoint(.89,.628);
export const CASTLE_GROUND_STAIRS=polygon([[.86,.626],[.895,.600],[.990,.696],[.951,.725]]);
export const onCastleLanding=(p:GroundPoint)=>insideRegion(p,CASTLE_PROMENADE);
export const onCastleGroundStairs=(p:GroundPoint)=>insideRegion(p,CASTLE_GROUND_STAIRS);
export const castleStairHeight=(p:GroundPoint)=>{const a=castleGroundBase,b=castleGroundTop,t=((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/((b.x-a.x)**2+(b.y-a.y)**2);return Math.max(0,Math.min(1,t));};
export const nearCastleApproach=(p:GroundPoint)=>touchesRegion(p,1,CASTLE_GROUND_STAIRS);
export const insideCastleFootprint=(p:GroundPoint,r=0)=>touchesRegion(p,r,CASTLE_FOOTPRINT);
/** Reserve the castle's painted silhouette from procedurally placed trees/props. */
export const castleSceneryClearance=(p:GroundPoint,r=0)=>p.x>CASTLE_ART.left-r&&p.x<CASTLE_ART.left+size+r&&p.y>CASTLE_ART.top-r&&p.y<CASTLE_ART.top+size+r;
/** Ground actors behind the projected towers are occluded by the artwork, not blocked by it. */
export const castleOccludesGround=(p:GroundPoint)=>castleSceneryClearance(p)&&p.y<castleArtPoint(0,.55).y&&!onCastleLanding(p)&&!onCastleGroundStairs(p);
