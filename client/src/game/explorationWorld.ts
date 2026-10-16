/** World geometry is independent of the device; the camera crops this continuous clearing. */
export const EXPLORATION_WORLD={left:-8,top:-7,width:30,height:24};
export function insideExploration(p:{x:number;y:number},radius=0){
 return Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.hypot((p.x-7)/(15-radius),(p.y-5)/(12-radius))<=1;
}
