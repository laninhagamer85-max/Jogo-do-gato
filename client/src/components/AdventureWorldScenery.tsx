import {useId,type CSSProperties} from 'react';
import {GAME_ASSETS} from '@/game/assets';
import {PLATFORM_PALETTES} from '@/game/platformerLevels';
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
 const theme=ADVENTURE_MATERIALS[chapter];
 const points=layout.points.slice(chapter*10,chapter*10+10).map(p=>({x:p.x-(vertical?0:start),y:p.y-(vertical?start:0)}));
 // Extend to the exact region edges so neighbouring worlds share a continuous route.
 const cross=vertical?width:height;
 const route=explorationTrailPath([vertical?{x:cross*.5,y:height}:{x:0,y:cross*.5},...points,vertical?{x:cross*.5,y:0}:{x:width,y:cross*.5}],vertical);
 const style:CSSProperties={left:vertical?0:start,top:vertical?start:0,width,height} as CSSProperties;
 return <div className={`adv-world-scenery ${vertical?'is-vertical':'is-horizontal'} ${locked?'is-locked':''} adv-world-${theme.id}`} style={style} aria-hidden="true" data-world={chapter+1}>
  <img className="adv-room-panorama" src={GAME_ASSETS.levels[chapter]} alt="" loading={active?'eager':'lazy'} decoding="async" draggable={false}/>
  <svg className="adv-world-floor" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
   <path className="adv-route-shadow" d={route} fill="none" stroke={theme.edge} strokeWidth="12" strokeLinecap="round" opacity=".18"/>
   <path className="adv-route-line" d={route} fill="none" stroke={theme.detail} strokeWidth="7" strokeLinecap="round" opacity=".9"/>
  </svg>
 </div>;
}

/** One continuous gradient for the whole campaign: no masked chapter rectangles. */
export function AdventureWorldBackdrop({layout,locked}:{layout:Props['layout'];locked:(chapter:number)=>boolean}){
 const id=useId().replace(/:/g,'');
 const order=Array.from({length:layout.chapters},(_,i)=>layout.vertical?layout.chapters-1-i:i);
 return <svg className="adv-campaign-sky" width={layout.width} height={layout.height} aria-hidden="true">
  <defs><linearGradient id={id} x1="0" y1="0" x2={layout.vertical?'0':'1'} y2={layout.vertical?'1':'0'}>
   {order.map((chapter,i)=>{const hex=PLATFORM_PALETTES[chapter].skyBottom;
    const rgb=[1,3,5].map(start=>parseInt(hex.slice(start,start+2),16));
    const gray=Math.round(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722);
    return <stop key={chapter} offset={`${(i+.5)/layout.chapters*100}%`} stopColor={locked(chapter)?`rgb(${gray} ${gray} ${gray})`:hex}/>;
   })}
  </linearGradient></defs>
  <rect width="100%" height="100%" fill={`url(#${id})`}/>
 </svg>;
}
