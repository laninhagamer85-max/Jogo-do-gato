import type {CSSProperties} from 'react';
import {trailChapterTop,type explorationTrailLayout} from '@/game/explorationTrail';
import {trailArtKind,trailArtSource,type TrailMode} from '@/game/trailArt';
type Props={layout:ReturnType<typeof explorationTrailLayout>;chapter:number;src:string;locked:boolean;active:boolean;mode:TrailMode};
/** Two planned plates per chapter; uniform scaling, no cover crop or repeated vignette. */
export default function TrailScenery({layout,chapter,src,locked,active,mode}:Props){
 const start=trailChapterTop(layout,chapter),vertical=layout.vertical,kind=trailArtKind(mode,chapter);
 const style:CSSProperties=vertical?{left:0,top:start,width:layout.width,height:layout.chapterSpan}:{left:start,top:0,width:layout.chapterSpan,height:layout.height};
 return <div className={`trail-biome illustrated-biome ${locked?'is-locked':''} ${vertical?'is-vertical':'is-horizontal'} biome-${chapter%10}`} style={style} aria-hidden="true">
  {!kind&&[0,1,2].map(i=><div className="trail-art-plate legacy-scene" key={`legacy-${i}`} style={vertical?{top:`${i*33.333}%`,left:0,width:'100%',height:'33.334%'}:{left:`${i*33.333}%`,top:0,height:'100%',width:'33.334%'}}><img src={src} alt="" loading={active?'eager':'lazy'} decoding="async" draggable={false}/></div>)}
  {kind&&[0,1].map(segment=>{const position=vertical?1-segment:segment;return <div className={`trail-art-plate ${kind?'has-planned-path':'legacy-scene'}`} key={segment} style={vertical?{top:position*layout.tileSpan,left:0,width:layout.width,height:layout.tileSpan}:{left:position*layout.tileSpan,top:0,height:layout.height,width:layout.tileSpan}}><img src={kind?trailArtSource(kind,vertical,segment):src} alt="" loading={active?'eager':'lazy'} decoding="async" draggable={false}/></div>;})}
  <div className="trail-biome-fog"/>
 </div>;
}
