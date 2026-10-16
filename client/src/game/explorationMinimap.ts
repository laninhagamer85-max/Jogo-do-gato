import {EXPLORATION_WORLD} from './explorationWorld';
/** Fixed north-up grid, independent of camera position, zoom and screen orientation. */
export const MINIMAP_WIDTH=EXPLORATION_WORLD.width, MINIMAP_HEIGHT=EXPLORATION_WORLD.height, MINIMAP_REVEAL_RADIUS=2.4;
type Point={x:number;y:number};
export function revealMinimap(previous:readonly number[],player:Point){
 const visible=new Set(previous);
 for(let y=0;y<MINIMAP_HEIGHT;y++)for(let x=0;x<MINIMAP_WIDTH;x++)
  if(Math.hypot(x+EXPLORATION_WORLD.left+.5-player.x,y+EXPLORATION_WORLD.top+.5-player.y)<=MINIMAP_REVEAL_RADIUS)visible.add(y*MINIMAP_WIDTH+x);
 return visible.size===previous.length?previous as number[]:[...visible].sort((a,b)=>a-b);
}
export function readMinimap(value:unknown,player:Point,version=3){
 const oldSize=version===1?140:version===2?520:MINIMAP_WIDTH*MINIMAP_HEIGHT;
 const cells=Array.isArray(value)?[...new Set(value.filter((n):n is number=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<oldSize))]:[];
 const migrated=version===1?cells.filter(i=>i<140).map(i=>(Math.floor(i/14)-EXPLORATION_WORLD.top)*MINIMAP_WIDTH+i%14-EXPLORATION_WORLD.left):version===2?cells.map(i=>(Math.floor(i/26)-5-EXPLORATION_WORLD.top)*MINIMAP_WIDTH+i%26-6-EXPLORATION_WORLD.left):cells;
 return revealMinimap(migrated,player);
}
export function minimapDiscovered(cells:readonly number[],p:Point){
 return cells.includes((Math.floor(p.y)-EXPLORATION_WORLD.top)*MINIMAP_WIDTH+Math.floor(p.x)-EXPLORATION_WORLD.left);
}
export function minimapNearby(player:Point,enemy:Point&{hp:number}){
 return enemy.hp>0&&Math.hypot(player.x-enemy.x,player.y-enemy.y)<=3;
}
