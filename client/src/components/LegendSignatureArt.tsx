import {useId} from 'react';
import {signatureArt,type KitLegend,type SignatureSlot} from '@/game/explorationLegendKits';
export default function LegendSignatureArt({id,slot,size=44}:{id:KitLegend;slot:SignatureSlot;size?:number}){
 const r=signatureArt(id,slot),clip=useId();
 return <svg width={size} height={size} viewBox={`0 0 ${r.width} ${r.height}`} aria-hidden="true"><defs><clipPath id={clip}><path d={r.path}/></clipPath></defs><image href={r.src} x={-r.x} y={-r.y} width={r.imageWidth} height={r.imageHeight} clipPath={`url(#${clip})`}/></svg>;
}
