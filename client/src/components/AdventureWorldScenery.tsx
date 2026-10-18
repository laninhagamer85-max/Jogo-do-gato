import type {CSSProperties} from 'react';
import {GAME_ASSETS} from '@/game/assets';
import {getPlatformStage} from '@/game/platformerLevels';
import {explorationTrailPath,trailChapterTop,type explorationTrailLayout} from '@/game/explorationTrail';

type Props={layout:ReturnType<typeof explorationTrailLayout>;chapter:number;locked:boolean;active:boolean};
// Materials describe the actual Adventure locations, independently of Exploration's biomes.
export const ADVENTURE_MATERIALS=[
 {id:'home',surface:'#e5be87',edge:'#8b5739',detail:'#fff0d0'},
 {id:'garden',surface:'#b4d98c',edge:'#578350',detail:'#e9f6cf'},
 {id:'market',surface:'#d7ac82',edge:'#805035',detail:'#f4d9b9'},
 {id:'roof',surface:'#d9a28e',edge:'#86565c',detail:'#f9d2b6'},
 {id:'beach',surface:'#f2d9a2',edge:'#b08a59',detail:'#fff0c8'},
 {id:'woodland',surface:'#a5c68d',edge:'#486a4a',detail:'#dfefb8'},
 {id:'snow',surface:'#e0f7ff',edge:'#75a8c5',detail:'#ffffff'},
 {id:'library',surface:'#b98d64',edge:'#594236',detail:'#edcb95'},
 {id:'observatory',surface:'#a5b5db',edge:'#545c8c',detail:'#e1e7ff'},
 {id:'festival',surface:'#dfb2c5',edge:'#96618f',detail:'#ffe3ad'},
] as const;

/** A single original room illustration, themed floor and landings for its ten phases. */
export default function AdventureWorldScenery({layout,chapter,locked,active}:Props){
 const start=trailChapterTop(layout,chapter),vertical=layout.vertical;
 const width=vertical?layout.width:layout.chapterSpan,height=vertical?layout.chapterSpan:layout.height;
 const stage=getPlatformStage(chapter*10+1)!,theme=ADVENTURE_MATERIALS[chapter],palette=stage.palette;
 const points=layout.points.slice(chapter*10,chapter*10+10).map(p=>({x:p.x-(vertical?0:start),y:p.y-(vertical?start:0)}));
 // Extend to the exact region edges so neighbouring worlds share a continuous route.
 const cross=vertical?width:height;
 const route=explorationTrailPath([vertical?{x:cross*.5,y:height}:{x:0,y:cross*.5},...points,vertical?{x:cross*.5,y:0}:{x:width,y:cross*.5}],vertical);
 const style:CSSProperties={left:vertical?0:start,top:vertical?start:0,width,height,'--adv-sky':palette.skyTop,'--adv-ground':palette.skyBottom} as CSSProperties;
 return <div className={`adv-world-scenery ${vertical?'is-vertical':'is-horizontal'} ${locked?'is-locked':''} adv-world-${theme.id}`} style={style} aria-hidden="true" data-world={chapter+1}>
  <img className="adv-room-panorama" src={GAME_ASSETS.levels[chapter]} alt="" loading={active?'eager':'lazy'} decoding="async" draggable={false}/>
  <svg className="adv-world-floor" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
   <path d={route} fill="none" stroke={theme.edge} strokeWidth="68" strokeLinecap="round" transform="translate(0 7)" opacity=".8"/>
   <path d={route} fill="none" stroke={theme.surface} strokeWidth="66" strokeLinecap="round"/>
   <path d={route} fill="none" stroke={theme.detail} strokeWidth="2" strokeLinecap="round" opacity=".65"/>
   {points.map((p,i)=><g key={i} transform={`translate(${p.x} ${p.y+19})`}>
    <ellipse cy="6" rx="43" ry="19" fill={theme.edge}/>
    <ellipse rx="43" ry="18" fill={theme.surface} stroke={theme.detail} strokeWidth="2"/>
    {/* Quiet location-specific floor joints, never a shared forest texture. */}
    {[0,2,3,7].includes(chapter)?<path d="M -29 4 H 29 M -17 -9 V 10 M 13 -11 V 12" fill="none" stroke={theme.edge} strokeWidth="1" opacity=".28"/>:chapter===6?<path d="M -26 0 L -15 -7 M 20 5 L 29 -2" stroke={theme.detail} strokeWidth="3"/>:null}
   </g>)}
  </svg>
 </div>;
}
