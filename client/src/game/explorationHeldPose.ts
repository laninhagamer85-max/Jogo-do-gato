import type {EquipmentKind} from './explorationEquipmentTiers';
type Point={x:number;y:number};
export type HeldVariant='base'|'tier'|'royal'|'signature';
/** Authored bitmap anchors: the hand holds the handle and the blade/head points outward. */
export function heldAnchors(kind:EquipmentKind,variant:HeldVariant):{grip:Point;aim:Point}{
 // These bow paintings curve to the left of their string. Their shooting
 // direction is the curved front, opposite to the original upright wood bow.
 if(variant==='signature')return kind==='bow'?{grip:{x:.4,y:.51},aim:{x:0,y:.51}}:{grip:{x:.5,y:.84},aim:{x:.5,y:.03}};
 if(variant==='royal')return kind==='sword'?{grip:{x:.76,y:.18},aim:{x:.06,y:.94}}:{grip:{x:.23,y:.79},aim:{x:kind==='axe'?.72:.60,y:.24}};
 if(variant==='tier')return kind==='bow'?{grip:{x:.49,y:.58},aim:{x:.14,y:.90}}:{grip:{x:.79,y:.80},aim:{x:.2,y:.16}};
 if(kind==='sword'||kind==='dagger')return {grip:{x:.5,y:kind==='sword'?.8:.78},aim:{x:.5,y:.03}};
 if(kind==='bow')return {grip:{x:.71,y:.51},aim:{x:1,y:.51}};
 return {grip:{x:.82,y:.84},aim:{x:.32,y:.22}};
}
export function heldPose(kind:EquipmentKind,variant:HeldVariant,width:number,height:number,facing:Point,swing=0){const {grip,aim}=heldAnchors(kind,variant),sourceAngle=Math.atan2((aim.y-grip.y)*height,(aim.x-grip.x)*width);return {rotation:Math.atan2(facing.y,facing.x)-sourceAngle+swing,x:-grip.x*width,y:-grip.y*height};}
export function meleeSwing(time:number,strikeUntil:number){const phase=Math.max(0,Math.min(1,1-(strikeUntil-time)/320));return strikeUntil>time?-.7+1.4*(phase*phase*(3-2*phase)):.22;}

/** Fit painted gear to a character-relative box without stretching its silhouette. */
export function heldItemSize(kind:EquipmentKind,sourceWidth:number,sourceHeight:number,tile:number){const longest=tile*({sword:.62,dagger:.36,bow:.66,axe:.64,pickaxe:.64})[kind],scale=longest/Math.max(1,sourceWidth,sourceHeight);return {width:sourceWidth*scale,height:sourceHeight*scale};}
