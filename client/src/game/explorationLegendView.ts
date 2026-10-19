import frames from './explorationLegendFrames.json';
import {legendAnimation,type LegendId} from './explorationLegends';
import type {CombatState} from './explorationCombat';
const images=new Map<LegendId,HTMLImageElement>();
function imageFor(id:LegendId){let image=images.get(id);if(!image&&typeof Image!=='undefined'){image=new Image();image.src=`/forest-adventure/legends/${id}-v1.png`;images.set(id,image);}return image;}
export function preloadLegend(id:LegendId){imageFor(id);}
/** Draw only the selected row/cell, with stable foot contact and no atlas-wide filters. */
export function drawExplorationLegend(ctx:CanvasRenderingContext2D,state:CombatState,x:number,y:number,tile:number,reduced:boolean){
 const id=state.legends?.active;if(!id)return false;const image=imageFor(id);if(!image?.complete||!image.naturalWidth)return false;
 const anim=legendAnimation(state.facing.x,state.facing.y,state.walking,state.walkPhase,state.time,state.strikeUntil,reduced);
 const mirror=id==='kael'&&(anim.row===6||anim.row===7);
 const row=mirror?(anim.row===6?2:1):anim.row;const rect=frames[id][row][anim.frame],dh=tile*1.12,dw=dh*rect.width/rect.height;
 // Walk/attack coordinates are authored in an eight-direction, eight-frame atlas.
 ctx.save();ctx.translate(x,y);if(mirror)ctx.scale(-1,1);ctx.drawImage(image,rect.x,rect.y,rect.width,rect.height,-dw/2,-dh, dw,dh);ctx.restore();
 const weapon=state.legends?.weapon;if(!weapon)return true;
 const a=Math.atan2(state.facing.y,state.facing.x),phase=anim.attacking?Math.max(0,Math.min(1,1-(state.strikeUntil-state.time)/320)):0;
 ctx.save();ctx.translate(x+state.facing.x*tile*.2,y-tile*.39+state.facing.y*tile*.12);ctx.rotate(a);
 if(weapon==='bow'){
  ctx.strokeStyle='#986534';ctx.lineWidth=tile*.045;ctx.beginPath();ctx.arc(0,0,tile*.29,-Math.PI/2,Math.PI/2);ctx.stroke();ctx.strokeStyle='#e7d8ae';ctx.lineWidth=tile*.012;ctx.beginPath();ctx.moveTo(0,-tile*.29);ctx.lineTo(anim.attacking?-tile*.12:0,0);ctx.lineTo(0,tile*.29);ctx.stroke();
  if(anim.attacking){const length=tile*(.3+phase*4.2);ctx.strokeStyle='#ebd59b';ctx.lineWidth=tile*.018;ctx.beginPath();ctx.moveTo(length-tile*.3,0);ctx.lineTo(length,0);ctx.stroke();ctx.fillStyle='#c8e5e7';ctx.beginPath();ctx.moveTo(length+tile*.09,0);ctx.lineTo(length-tile*.05,-tile*.05);ctx.lineTo(length-tile*.05,tile*.05);ctx.closePath();ctx.fill();}
 }else{
  ctx.rotate(anim.attacking?-.9+phase*1.8:.8);const length=tile*(weapon==='sword'?.64:.37);
  ctx.fillStyle='#7c4d2d';ctx.fillRect(-tile*.11,-tile*.035,tile*.17,tile*.07);ctx.fillStyle='#d3b165';ctx.fillRect(0,-tile*.11,tile*.04,tile*.22);
  ctx.fillStyle='#cfeced';ctx.strokeStyle='#567d83';ctx.lineWidth=tile*.012;ctx.beginPath();ctx.moveTo(tile*.04,-tile*.035);ctx.lineTo(length-tile*.1,-tile*.055);ctx.lineTo(length,0);ctx.lineTo(length-tile*.1,tile*.055);ctx.lineTo(tile*.04,tile*.035);ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.restore();return true;
}
