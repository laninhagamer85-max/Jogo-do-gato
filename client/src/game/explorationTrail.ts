export type TrailPoint={x:number;y:number};
/** Responsive world coordinates: a continuous path, independent from saved room progress. */
export function explorationTrailLayout(width:number,height:number,roomCount:number){
 const vertical=height>=width,chapterSpan=vertical?1200:1500,cross=Math.max(vertical?300:220,vertical?width:height),chapters=Math.ceil(roomCount/10);
 const points=Array.from({length:roomCount},(_,index)=>{
  const chapter=Math.floor(index/10),stage=index%10;
  return vertical?{x:cross*(.5+Math.sin(index*1.4)*.23),y:chapter*chapterSpan+140+stage*104}:{x:chapter*chapterSpan+160+stage*132,y:cross*(.5+Math.sin(index*1.3)*.22)};
 });
 return {vertical,chapterSpan,chapters,width:vertical?cross:chapters*chapterSpan+140,height:vertical?chapters*chapterSpan+140:cross,points};
}
export function explorationTrailPath(points:readonly TrailPoint[],vertical:boolean){
 if(!points.length)return '';
 return `M ${points[0].x} ${points[0].y}`+points.slice(1).map((p,i)=>{const a=points[i];return vertical?` C ${a.x} ${(a.y+p.y)/2}, ${p.x} ${(a.y+p.y)/2}, ${p.x} ${p.y}`:` C ${(a.x+p.x)/2} ${a.y}, ${(a.x+p.x)/2} ${p.y}, ${p.x} ${p.y}`;}).join('');
}
export function trailScrollTarget(point:TrailPoint,layout:{width:number;height:number},viewport:{width:number;height:number}){
 return {left:Math.max(0,Math.min(layout.width-viewport.width,point.x-viewport.width*.5)),top:Math.max(0,Math.min(layout.height-viewport.height,point.y-viewport.height*.44))};
}
