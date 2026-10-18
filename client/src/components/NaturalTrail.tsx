import {useId} from 'react';
import {trailChapterTop,explorationTrailPath,type explorationTrailLayout} from '@/game/explorationTrail';
type Layout=ReturnType<typeof explorationTrailLayout>;
/** Raster materials, rough earth edges and grounded shore details. */
export default function NaturalTrail({layout,mode,locked}:{layout:Layout;mode:'adventure'|'exploration';locked:(chapter:number)=>boolean}){
 const uid=useId().replace(/:/g,''),width=layout.width<600?72:104;
 const material=(chapter:number)=>mode==='exploration'?(chapter===0?'forest':'river'):chapter===5?'forest':[4,6].includes(chapter)?'river':'stone';
 return <svg className="natural-trail" width={layout.width} height={layout.height} aria-hidden="true"><defs>
  <filter id={`${uid}-rough`} x="-5%" y="-2%" width="110%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".065" numOctaves="3" seed="8" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="13" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id={`${uid}-soft`}><feGaussianBlur stdDeviation="4"/></filter>
  {['stone','forest','river'].map(kind=><pattern key={kind} id={`${uid}-${kind}`} patternUnits="userSpaceOnUse" width="176" height="176"><image href={`/forest-adventure/path-${kind}-v1.webp`} width="176" height="176" preserveAspectRatio="xMidYMid slice"/></pattern>)}</defs>
  {Array.from({length:layout.chapters},(_,chapter)=>{const top=trailChapterTop(layout,chapter),height=layout.chapterSpan+(chapter===0?180:0),segment=explorationTrailPath(layout.points.slice(Math.max(0,chapter*10-1),Math.min(layout.points.length,chapter*10+11)),true);return <svg key={chapter} x="0" y={top} width={layout.width} height={height} viewBox={`0 ${top} ${layout.width} ${height}`} overflow="hidden" className={locked(chapter)?'natural-trail-locked':''}>
   <path d={segment} fill="none" stroke={mode==='exploration'&&chapter===0?'#624829':'#987440'} strokeWidth={width+15} opacity=".3" filter={`url(#${uid}-soft)`}/><path d={segment} fill="none" stroke={`url(#${uid}-${material(chapter)})`} strokeWidth={width} strokeLinecap="round" filter={`url(#${uid}-rough)`}/>
  </svg>;})}
  {layout.points.slice(0,-1).flatMap((a,i)=>{const b=layout.points[i+1],chapter=Math.floor(i/10);return [.24,.55,.8].map((t,j)=>{const blend=3*t*t-2*t*t*t,x=a.x+(b.x-a.x)*blend,y=a.y+(b.y-a.y)*t,side=(i+j)%2?1:-1;return <g key={`${i}-${j}`} opacity={locked(chapter)?.32:.85} transform={`translate(${x+side*width*.55} ${y})`}><ellipse rx={j%2?4:6} ry="3" fill={mode==='exploration'&&chapter===0?'#69804a':'#ad9f7c'} transform={`rotate(${i*47+j*29})`}/><path d="M-5 7 Q-7 -4 -10 -8 M-3 7 Q-1 -5 3 -10 M-4 6 Q-5 -2 -3 -5" fill="none" stroke={mode==='exploration'&&chapter===1?'#82905d':'#588044'} strokeWidth="2" strokeLinecap="round"/></g>;});})}
 </svg>;
}
