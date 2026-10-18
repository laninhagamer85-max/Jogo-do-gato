import type {CSSProperties} from 'react';
import type {explorationTrailLayout} from '@/game/explorationTrail';
import type {TrailMode} from '@/game/trailArt';
import {trailJunctionFrame,trailJunctionSource} from '@/game/trailJunction';
/** Original bridge/shore compositions connect regions; underlying plates and node anchors stay fixed. */
export default function TrailSeams({layout,mode,locked}:{layout:ReturnType<typeof explorationTrailLayout>;mode:TrailMode;locked:(chapter:number)=>boolean}){
 return <>{Array.from({length:layout.chapters},(_,chapter)=>[0,...(chapter<layout.chapters-1?[1]:[])].map(join=>{
  const src=trailJunctionSource(mode,chapter,join,layout.vertical);if(!src)return null;
  const frame=trailJunctionFrame(layout,chapter,join),radius=Math.min(38,Math.max(28,(layout.vertical?layout.width:layout.height)*.075));
  const nearby=layout.points.filter(p=>p.x>=frame.left&&p.x<=frame.left+frame.width&&p.y>=frame.top&&p.y<=frame.top+frame.height);
  const masks=nearby.map(p=>`radial-gradient(circle at ${p.x-frame.left}px ${p.y-frame.top}px,transparent ${radius}px,#000 ${radius+16}px)`);
  masks.push(`linear-gradient(to ${layout.vertical?'bottom':'right'},transparent,#000 18%,#000 82%,transparent)`);
  const style:CSSProperties={...frame,backgroundImage:`url(${src})`,backgroundSize:'100% 100%',backgroundPosition:'center',maskImage:masks.join(','),maskComposite:'intersect'};
  return <div key={`${chapter}-${join}`} aria-hidden="true" className={`trail-seam trail-painted-junction ${locked(chapter)||(join===1&&locked(chapter+1))?'is-locked':''}`} style={style}/>;
 }))}</>;
}
