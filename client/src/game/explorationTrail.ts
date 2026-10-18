import {trailArtAnchors,type TrailMode} from './trailArt';
export type TrailPoint={x:number;y:number};
/** Portrait climbs; wide viewports progress right. Room IDs remain unchanged. */
export function explorationTrailLayout(width:number,viewportHeight:number,roomCount:number,vertical=width<viewportHeight*1.2,mode:TrailMode='exploration'){
 const cross=vertical?Math.max(300,width):Math.max(200,viewportHeight),tileSpan=cross*1.5,chapterSpan=tileSpan*2,chapters=Math.ceil(roomCount/10),length=chapters*chapterSpan;
 const points=Array.from({length:roomCount},(_,index)=>{
  const chapter=Math.floor(index/10),segment=Math.floor(index%10/5),a=trailArtAnchors(mode,chapter,segment,vertical)[index%5];
  const start=vertical?(chapters-1-chapter)*chapterSpan+(1-segment)*tileSpan:chapter*chapterSpan+segment*tileSpan;
  return vertical?{x:cross*a[0],y:start+tileSpan*a[1]}:{x:start+tileSpan*a[0],y:cross*a[1]};
 });
 return {vertical,tileSpan,chapterSpan,chapters,width:vertical?cross:length,height:vertical?length:cross,points};
}
export function trailChapterTop(layout:{chapters:number;chapterSpan:number;vertical?:boolean},chapter:number){return(layout.vertical===false?chapter:layout.chapters-1-chapter)*layout.chapterSpan;}
export function explorationTrailPath(points:readonly TrailPoint[],vertical:boolean){
 if(!points.length)return '';
 return `M ${points[0].x} ${points[0].y}`+points.slice(1).map((p,i)=>{const a=points[i];return vertical?` C ${a.x} ${(a.y+p.y)/2}, ${p.x} ${(a.y+p.y)/2}, ${p.x} ${p.y}`:` C ${(a.x+p.x)/2} ${a.y}, ${(a.x+p.x)/2} ${p.y}, ${p.x} ${p.y}`;}).join('');
}
export function trailScrollTarget(point:TrailPoint,layout:{width:number;height:number},viewport:{width:number;height:number}){return {left:Math.max(0,Math.min(layout.width-viewport.width,point.x-viewport.width*.5)),top:Math.max(0,Math.min(layout.height-viewport.height,point.y-viewport.height*.44))};}
