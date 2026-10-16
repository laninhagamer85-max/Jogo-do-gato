/** World geometry is independent of the device; the camera crops this continuous clearing. */
export const EXPLORATION_WORLD={left:-6,top:-5,width:26,height:20};
export function insideExploration(p:{x:number;y:number},radius=0){
 return Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.hypot((p.x-7)/(13-radius),(p.y-5)/(10-radius))<=1;
}
