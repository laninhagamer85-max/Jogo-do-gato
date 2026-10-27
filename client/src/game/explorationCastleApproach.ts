import type {GroundPoint} from './biomeComposition';
/** One uniform placement for the castle artwork, doorway, landing and short stair. */
export const CASTLE_ART={left:9.48,top:-20.04,size:18};
export const castleArtPoint=(u:number,v:number)=>({x:CASTLE_ART.left+u*CASTLE_ART.size,y:CASTLE_ART.top+v*CASTLE_ART.size});
export const castleApproachBase=castleArtPoint(.22,.785),castleApproachTop=castleArtPoint(.265,.70),castleDoor=castleArtPoint(.315,.655);
export const onCastleLanding=(p:GroundPoint)=>p.x>13.71&&p.x<16.23&&p.y>-9.24&&p.y<-6.99;
export const nearCastleApproach=(p:GroundPoint)=>p.x>12.6&&p.x<17&&p.y>-10&&p.y<-5;
export const insideCastleFootprint=(p:GroundPoint,r:number)=>p.x>10.2-r&&p.x<26.58+r&&p.y>-15.9-r&&p.y<-2.58+r;
export const castleLowerAccess=(p:GroundPoint)=>p.x>12.7&&p.x<14.5&&p.y>castleApproachBase.y;
