export type TrailPoint={x:number;y:number};
/** Portrait climbs; wide viewports progress right. Room IDs remain unchanged. */
export function explorationTrailLayout(width:number,viewportHeight:number,roomCount:number,vertical=width<viewportHeight*1.2){
 const chapterSpan=1440,cross=vertical?Math.max(300,width):Math.max(220,viewportHeight),chapters=Math.ceil(roomCount/10),length=chapters*chapterSpan+180;
 const height=vertical?length:cross;
 const points=Array.from({length:roomCount},(_,index)=>({x:vertical?cross*(.5+Math.sin(index%10*1.4)*.23):110+Math.floor(index/10)*chapterSpan+index%10*128,y:vertical?height-210-Math.floor(index/10)*chapterSpan-index%10*128:cross*(.45+Math.sin(index%10*1.4)*.19)}));
 return {vertical,chapterSpan,chapters,width:vertical?cross:length,height,points};
}
export function trailChapterTop(layout:{chapters:number;chapterSpan:number;vertical?:boolean},chapter:number){return(layout.vertical===false?chapter:layout.chapters-1-chapter)*layout.chapterSpan;}
export function explorationTrailPath(points:readonly TrailPoint[],vertical:boolean){
 if(!points.length)return '';
 return `M ${points[0].x} ${points[0].y}`+points.slice(1).map((p,i)=>{const a=points[i];return vertical?` C ${a.x} ${(a.y+p.y)/2}, ${p.x} ${(a.y+p.y)/2}, ${p.x} ${p.y}`:` C ${(a.x+p.x)/2} ${a.y}, ${(a.x+p.x)/2} ${p.y}, ${p.x} ${p.y}`;}).join('');
}
export function trailScrollTarget(point:TrailPoint,layout:{width:number;height:number},viewport:{width:number;height:number}){return {left:Math.max(0,Math.min(layout.width-viewport.width,point.x-viewport.width*.5)),top:Math.max(0,Math.min(layout.height-viewport.height,point.y-viewport.height*.44))};}
