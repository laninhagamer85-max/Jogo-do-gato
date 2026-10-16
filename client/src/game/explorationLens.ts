import {EXPLORATION_WORLD} from './explorationWorld';
import {MINIMAP_WIDTH} from './explorationMinimap';
/** North-up local lens fills the circle; device orientation never rotates the world. */
export const LENS_WORLD_RADIUS=6;
export function lensProjection(size:number,player:{x:number;y:number}){
 const scale=size/(LENS_WORLD_RADIUS*2);
 return {scale,left:size/2-player.x*scale,top:size/2-player.y*scale};
}
export function discoveredWorldPoint(index:number){
 return {x:EXPLORATION_WORLD.left+index%MINIMAP_WIDTH+.5,y:EXPLORATION_WORLD.top+Math.floor(index/MINIMAP_WIDTH)+.5};
}
