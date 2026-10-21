import React from 'react';
import {RARE_ITEM_ART} from '@/game/rareItemArt';
import type {RareItem} from '@/game/explorationCampaign';
import type {CombatItem} from '@/game/explorationCombat';
import {PAINTED_ITEMS,paintedItemPosition,type PaintedItem} from '@/game/explorationPaintedItems';
/** Volumetric painted raster art, also used by the matching world pickups. */
export default function ExplorationItemIcon({item,size=40}:{item:CombatItem|RareItem|'roots'|'tide'|'amber'|'broche';size?:number}){
 const rare=item==='seiva'||item==='cristal',p=rare?{x:item==='seiva'?0:1,y:0}:paintedItemPosition(item as PaintedItem);
 return <span className="exploration-painted-item" aria-hidden="true" style={{display:'inline-block',flexShrink:0,width:size,height:size,backgroundImage:`url('${rare?RARE_ITEM_ART.asset:PAINTED_ITEMS}')`,backgroundSize:rare?'200% 100%':'400% 300%',backgroundPosition:rare?`${p.x*100}% 0%`:`${p.x/3*100}% ${p.y/2*100}%`,backgroundRepeat:'no-repeat'}}/>;
}
