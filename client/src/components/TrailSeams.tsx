import type {CSSProperties} from 'react';
import {trailChapterTop,type explorationTrailLayout} from '@/game/explorationTrail';
import {trailArtKind,trailArtSource,type TrailMode} from '@/game/trailArt';
/** Blend only the edge strips; plates, clearing anchors and their scale stay fixed. */
export default function TrailSeams({layout,mode,locked}:{layout:ReturnType<typeof explorationTrailLayout>;mode:TrailMode;locked:(chapter:number)=>boolean}){
 const vertical=layout.vertical,blend=Math.min(56,layout.tileSpan*.08);
 return <>{Array.from({length:layout.chapters},(_,chapter)=>{const kind=trailArtKind(mode,chapter);if(!kind)return null;const start=trailChapterTop(layout,chapter);
  return [0,...(chapter<layout.chapters-1?[1]:[])].map(join=>{const boundary=join?(vertical?start:start+layout.chapterSpan):start+layout.tileSpan;
   const style:CSSProperties={...(vertical?{left:0,top:boundary-blend,width:layout.width,height:blend*2,backgroundSize:`${layout.width}px ${layout.tileSpan}px`,backgroundPosition:'center top'}:{left:boundary-blend,top:0,width:blend*2,height:layout.height,backgroundSize:`${layout.tileSpan}px ${layout.height}px`,backgroundPosition:'right center'}),backgroundImage:`url(${trailArtSource(kind,vertical,join)})`,maskImage:`linear-gradient(to ${vertical?'bottom':'right'},transparent,#000 48%,#000 52%,transparent)`};
   return <div key={`${chapter}-${join}`} aria-hidden="true" className={`trail-seam ${locked(chapter)?'is-locked':''}`} style={style}/>;
  });})}</>;
}
