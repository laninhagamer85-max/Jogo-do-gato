import type {CSSProperties} from 'react';
import {trailChapterTop,type explorationTrailLayout} from '@/game/explorationTrail';
type Props={layout:ReturnType<typeof explorationTrailLayout>;chapter:number;src:string;locked:boolean;active:boolean};
/** Repeated vignette positions compose a long region without enlarging its art. */
export default function TrailScenery({layout,chapter,src,locked,active}:Props){
 const start=trailChapterTop(layout,chapter),vertical=layout.vertical;
 const style:CSSProperties=vertical?{left:0,top:start,width:layout.width,height:layout.chapterSpan+(chapter===0?180:0)}:{left:start,top:0,width:layout.chapterSpan+(chapter===layout.chapters-1?180:0),height:layout.height};
 return <div className={`trail-biome composed-biome ${locked?'is-locked':''} ${vertical?'is-vertical':'is-horizontal'} biome-${chapter%10}`} style={style} aria-hidden="true">
  {[0,1,2].map(i=><div className="trail-scene-plate" key={i} style={vertical?{top:`${i*33.333}%`,left:0,width:'100%',height:'33.334%'}:{left:`${i*33.333}%`,top:0,height:'100%',width:'33.334%'}}><img src={src} alt="" loading={active?'eager':'lazy'} draggable={false}/></div>)}
  <div className="trail-biome-fog"/>
 </div>;
}
