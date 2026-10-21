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

export type ExplorationPanel='pause'|'inventory'|'exit'|'home'|'chest'|'workshop'|'potions'|'build'|null;
/** Slot actions are shared by pointer and keyboard; switching a panel clears map inspection. */
export function lensDockAction(panel:ExplorationPanel,overview:boolean,action:'pause'|'inventory'|'map'):{panel:ExplorationPanel;overview:boolean}{
 if(action==='pause')return {panel:panel||overview?null:'pause',overview:false};
 if(action==='inventory')return {panel:panel==='inventory'?null:'inventory',overview:false};
 return {panel:null,overview:!overview};
}
/** Keep a >=44px tap target and leave readable room for the left HUD on phones. */
export function lensDockLayout(width:number,height:number,expanded:boolean){
 const landscape=height<=500&&width>height;
 const diameter=landscape?(expanded?158:124):Math.max(expanded?160:136,Math.min(expanded?214:168,width*(expanded?.5:.39)));
 const top=landscape?32:46,right=24,button=44;
 return {diameter,top,right,button,bottom:top+diameter+button/2,hudWidth:Math.max(100,width-diameter-right-24),landscape};
}
export const LENS_DOCK_SLOTS={zoomIn:[.14645,.14645],zoomOut:[0,.5],sound:[.85355,.85355],pause:[.5,0],inventory:[.85355,.14645],equip:[1,.5],size:[.14645,.85355],map:[.5,1]} as const;

/** One camera slot: magnify the world, then restore its normal framing. */
export function toggleWorldCameraZoom(zoom:number){return zoom>.8?.65:1.15;}
