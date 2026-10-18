import {trailChapterTop,type explorationTrailLayout} from './explorationTrail';
import {trailArtKind,type TrailMode} from './trailArt';
export function trailJunctionSource(mode:TrailMode,chapter:number,join:number,vertical:boolean){
 const kind=trailArtKind(mode,chapter);if(!kind)return undefined;
 const family=mode==='exploration'&&chapter===0&&join===1?'forest-river':kind;
 return `/forest-adventure/junction-${family}-${vertical?'portrait':'landscape'}-v1.webp`;
}
/** Cross-axis fills the view; junction art has the reciprocal orientation and scales uniformly. */
export function trailJunctionFrame(layout:ReturnType<typeof explorationTrailLayout>,chapter:number,join:number){
 const start=trailChapterTop(layout,chapter),span=(layout.vertical?layout.width:layout.height)*2/3;
 const boundary=join?(layout.vertical?start:start+layout.chapterSpan):start+layout.tileSpan;
 return layout.vertical?{left:0,top:boundary-span/2,width:layout.width,height:span}:{left:boundary-span/2,top:0,width:span,height:layout.height};
}
