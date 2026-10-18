import {explorationTrailPath,type explorationTrailLayout} from '@/game/explorationTrail';
type Layout=ReturnType<typeof explorationTrailLayout>;
/** Quiet stepping marks leave the biome and stage buttons in the foreground. */
export default function NaturalTrail({layout,mode,locked}:{layout:Layout;mode:'adventure'|'exploration';locked:(chapter:number)=>boolean}){
 return <svg className="natural-trail" width={layout.width} height={layout.height} aria-hidden="true">
  {Array.from({length:layout.chapters},(_,chapter)=>{const segment=explorationTrailPath(layout.points.slice(chapter*10,Math.min(layout.points.length,chapter*10+11)),layout.vertical);return <path key={chapter} d={segment} fill="none" stroke={mode==='adventure'?'#f4dfac':'#efdfa9'} strokeWidth="8" strokeDasharray="3 16" strokeLinecap="round" opacity={locked(chapter)?.2:.65}/>;})}
 </svg>;
}
