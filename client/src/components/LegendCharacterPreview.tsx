import {newWorkshop,type Workshop} from '@/game/explorationWorkshop';
import {useEffect,useRef} from 'react';
import {drawExplorationLegend,preloadLegend} from '@/game/explorationLegendView';
import {createCombatState} from '@/game/explorationCombat';
import type {LegendId,LegendWeapon} from '@/game/explorationLegends';
const directions=[[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1]];
export const LEGEND_VIEWS=['Frente','Frente e esquerda','Lado esquerdo','Costas e esquerda','Costas','Costas e direita','Lado direito','Frente e direita'];
/** Isolated visual state: preview never spends energy, damages NPCs or writes progress. */
export default function LegendCharacterPreview({id,weapon,direction,demo,onRotate,equipmentTiers}:{equipmentTiers?:Workshop['equipmentTiers'];id:LegendId;weapon:LegendWeapon|null;direction:number;demo:number;onRotate:(delta:number)=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),pointer=useRef<{x:number;step:number;moved:boolean}|null>(null),skipClick=useRef(false);
 useEffect(()=>{preloadLegend(id);const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx)return;const s=createCombatState();s.workshop=newWorkshop();s.workshop.equipmentTiers={...equipmentTiers};s.legends={active:id,unlocked:[id],weapons:weapon?[weapon]:[],weapon};const [x,y]=directions[direction];s.facing={x,y};let raf=0,last=-1000;const start=performance.now(),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function draw(now:number){if(!ctx||!c)return;const elapsed=now-start;if(now-last<1000/24){raf=requestAnimationFrame(draw);return;}last=now;ctx.clearRect(0,0,480,520);s.time=elapsed;s.strikeUntil=demo&&elapsed<1400&&elapsed%600<320?elapsed+(320-elapsed%600):0;const ready=drawExplorationLegend(ctx,s,240,450,310,reduced);if(!ready||demo&&elapsed<1500&&!reduced)raf=requestAnimationFrame(draw);}
 raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
 },[id,weapon,direction,demo,equipmentTiers]);
 return <canvas ref={canvas} width="480" height="520" className="legend-character-preview" aria-label={`${id==='lyra'?'Lyra':'Kael'} · ${LEGEND_VIEWS[direction]} · toque ou arraste para girar`} onPointerDown={e=>{pointer.current={x:e.clientX,step:0,moved:false};skipClick.current=false;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const p=pointer.current;if(!p)return;const step=Math.trunc((e.clientX-p.x)/25);if(step!==p.step){onRotate(step-p.step);p.step=step;p.moved=true;}}} onPointerUp={()=>{skipClick.current=!!pointer.current?.moved;pointer.current=null;}} onPointerCancel={()=>{pointer.current=null;skipClick.current=true;}} onClick={e=>{e.stopPropagation();if(!skipClick.current)onRotate(1);skipClick.current=false;}}/>;
}
