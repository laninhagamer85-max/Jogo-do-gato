import newArt from './explorationNewLegendArt.json';
import frames from './explorationLegendFrames.json';
import type {LegendId} from './explorationLegends';
/** Atlas poses are isolated components, never rectangular grid cells. */
export function legendPose(id:LegendId,row:number,frame:number){
 if(id==='soren'||id==='ayla'){const sourceRow=[0,1,1,1,2,3,3,3][row],sourceFrame=Math.max(0,Math.min(7,frame)),rect=newArt[id].rows[sourceRow][sourceFrame];return {rect,mirror:false,sourceRow,sourceFrame,key:`${id}:${sourceRow}:${sourceFrame}`};}
 const mirror=row===7||(id==='kael'&&row===6),sourceRow=row===7?1:mirror?2:row;
 let sourceFrame=Math.max(0,Math.min(7,frame));
 let rect=frames[id][sourceRow][sourceFrame];
 // Recovery may reuse idle when the generated source itself touches an outer edge.
 if(sourceFrame===7&&(rect.x+rect.width>=1254||rect.y+rect.height>=1254)){sourceFrame=0;rect=frames[id][sourceRow][sourceFrame];}
 return {rect,mirror,sourceRow,sourceFrame,key:`${id}:${sourceRow}:${sourceFrame}`};
}
/** Authored gauntlet landmarks inside each complete pose; mirrored with the body. */
export function legendHand(id:LegendId,row:number,frame:number){
 if(id==='soren'||id==='ayla'){const attack=frame>=4&&frame<=6;return row===0?{x:attack?.72:.77,y:attack?.57:.61}:row===1?{x:attack?.18:.28,y:attack?.58:.66}:row===2?{x:attack?.7:.77,y:attack?.58:.65}:{x:attack?.82:.72,y:attack?.58:.66};}
 const attack=frame>=4,f=Math.max(0,frame-4);
 const walk=[[.25,.59],[.22,.59],[.23,.60],[.77,.58],[.80,.60],[.82,.58],[.80,.59],[.78,.59]];
 const strike=[
 [[.23,.55],[.90,.43],[.75,.49],[.25,.59]],
 [[.16,.55],[.08,.44],[.08,.48],[.22,.59]],
 [[.13,.53],[.04,.43],[.06,.45],[.23,.60]],
 [[.85,.50],[.94,.43],[.93,.45],[.77,.58]],
 [[.85,.51],[.94,.43],[.92,.48],[.80,.60]],
 [[.87,.51],[.94,.45],[.95,.48],[.82,.58]],
 [[.83,.53],[.94,.44],[.94,.48],[.80,.59]],
 [[.85,.54],[.92,.44],[.92,.48],[.78,.59]],
 ];
 const point=(attack?strike[row][f]:walk[row]).slice();
 if(id==='lyra'&&row===0&&attack)point[0]=[.22,.20,.76,.25][f];
 return {x:point[0],y:point[1]};
}
