export type TrailPoint={x:number;y:number};
/** Progress always climbs, in portrait and landscape. Saves keep room IDs. */
export function explorationTrailLayout(width:number,_height:number,roomCount:number){
 const vertical=true,chapterSpan=1440,cross=Math.max(300,width),chapters=Math.ceil(roomCount/10),height=chapters*chapterSpan+180;
 const points=Array.from({length:roomCount},(_,index)=>({x:cross*(.5+Math.sin(index%10*1.4)*.23),y:height-210-Math.floor(index/10)*chapterSpan-index%10*128}));
 return {vertical,chapterSpan,chapters,width:cross,height,points};
}
export function trailChapterTop(layout:{chapters:number;chapterSpan:number},chapter:number){return(layout.chapters-1-chapter)*layout.chapterSpan;}
export function explorationTrailPath(points:readonly TrailPoint[],vertical:boolean){
 if(!points.length)return '';
 return `M ${points[0].x} ${points[0].y}`+points.slice(1).map((p,i)=>{const a=points[i];return vertical?` C ${a.x} ${(a.y+p.y)/2}, ${p.x} ${(a.y+p.y)/2}, ${p.x} ${p.y}`:` C ${(a.x+p.x)/2} ${a.y}, ${(a.x+p.x)/2} ${p.y}, ${p.x} ${p.y}`;}).join('');
}
export function trailScrollTarget(point:TrailPoint,layout:{width:number;height:number},viewport:{width:number;height:number}){return {left:Math.max(0,Math.min(layout.width-viewport.width,point.x-viewport.width*.5)),top:Math.max(0,Math.min(layout.height-viewport.height,point.y-viewport.height*.44))};}
