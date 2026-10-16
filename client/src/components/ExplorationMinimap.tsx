import { useEffect, useRef } from 'react';
import { PILOT_CAMP,PILOT_EXIT,PILOT_MARKER,PILOT_NODES,type CombatState } from '@/game/explorationCombat';
import { PILOT_SHELTER,ROOM_SCENERY,ROOM_EDGE_SOLIDS,ROOM_GARDENS,ROOM_EDGE_GARDENS,SCATTERED_GARDENS,OUTER_GARDENS } from '@/game/explorationRoom';
import { minimapDiscovered,minimapNearby } from '@/game/explorationMinimap';
import { lensProjection,discoveredWorldPoint } from '@/game/explorationLens';
import { drawExplorationGround,drawWoodlandProp } from '@/game/explorationScenery';
import { drawGardenPatch,FOREST_NATURE } from '@/game/forestNature';

type LensArt={ground:HTMLImageElement;props:HTMLImageElement;garden:HTMLImageElement;shelter:HTMLImageElement;portal:HTMLImageElement};
/** The full lens shows actual terrain, clipped discovery and north-up world markers. */
export default function ExplorationMinimap({state}:{state:CombatState}){
 const canvas=useRef<HTMLCanvasElement>(null),art=useRef<LensArt|null>(null),latest=useRef(state);
 latest.current=state;
 const draw=()=>{
  const el=canvas.current,ctx=el?.getContext('2d'),images=art.current;
  if(!el||!ctx||!images)return;
  const size=el.width,s=latest.current,v=lensProjection(size,s.player),t=v.scale;
  const point=(p:{x:number;y:number})=>({x:v.left+p.x*t,y:v.top+p.y*t});
  const ready=(im:HTMLImageElement)=>im.complete&&im.naturalWidth>0;
  ctx.clearRect(0,0,size,size);ctx.save();ctx.beginPath();ctx.arc(size/2,size/2,size/2,0,Math.PI*2);ctx.clip();
  // Dark textured terrain occupies undiscovered parts too, without a rectangular map inset.
  if(ready(images.ground))drawExplorationGround(ctx,size,size,images.ground,v.left,v.top,t);
  else {ctx.fillStyle='#345331';ctx.fillRect(0,0,size,size);}
  ctx.fillStyle='rgba(8,24,19,.91)';ctx.fillRect(0,0,size,size);
  ctx.save();ctx.beginPath();
  for(const i of s.exploredCells){const p=point(discoveredWorldPoint(i));ctx.moveTo(p.x+t*.74,p.y);ctx.arc(p.x,p.y,t*.74,0,Math.PI*2);}
  ctx.clip();
  if(ready(images.ground))drawExplorationGround(ctx,size,size,images.ground,v.left,v.top,t);
  const visible=(p:{x:number;y:number})=>{const q=point(p);return q.x>-t*2&&q.y>-t*2&&q.x<size+t*2&&q.y<size+t*2;};
  if(ready(images.garden))for(const garden of [...ROOM_GARDENS,...ROOM_EDGE_GARDENS,...SCATTERED_GARDENS,...OUTER_GARDENS]){
   if(visible(garden)){const q=point(garden);drawGardenPatch(ctx,images.garden,garden,q.x,q.y,t,0,true);}
  }
  if(ready(images.props))for(const prop of [...ROOM_SCENERY,...ROOM_EDGE_SOLIDS].sort((a,b)=>a.y-b.y)){
   if(visible(prop)){const q=point(prop);drawWoodlandProp(ctx,images.props,prop.index,q.x,q.y,t,prop,true);}
  }
  const sprite=(im:HTMLImageElement,p:{x:number;y:number},width:number)=>{
   if(!ready(im)||!visible(p))return;const q=point(p),w=t*width,h=w*im.naturalHeight/im.naturalWidth;ctx.drawImage(im,q.x-w/2,q.y-h,w,h);
  };
  sprite(images.shelter,PILOT_SHELTER,1.55);sprite(images.portal,PILOT_EXIT,1.95);
  const dot=(p:{x:number;y:number},color:string,r=3.5)=>{
   const q=point(p);ctx.shadowColor='#182619';ctx.shadowBlur=3;ctx.fillStyle=color;ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  };
  const discovered=(p:{x:number;y:number})=>minimapDiscovered(s.exploredCells,p);
  if(discovered(PILOT_CAMP))dot(PILOT_CAMP,'#a3e8dd',4.5);
  if(discovered(PILOT_MARKER))dot(PILOT_MARKER,s.gateOpen?'#c0e99e':'#ffeab0',4.5);
  if(discovered(PILOT_EXIT))dot(PILOT_EXIT,s.gateOpen?'#fff3b4':'#a5b790',4.5);
  for(const n of PILOT_NODES)if(!s.collectedNodes.includes(n.id)&&discovered(n))dot(n,'#e3f1a9');
  for(const e of s.enemies)if(minimapNearby(s.player,e)&&discovered(e))dot(e,'#ffc175',4.5);
  ctx.restore();
  // Red player beacon stays above the fog and is the only pulsing-free primary marker.
  const pet=point(s.player),halo=ctx.createRadialGradient(pet.x,pet.y,1,pet.x,pet.y,11);
  halo.addColorStop(0,'rgba(255,222,196,.85)');halo.addColorStop(1,'rgba(255,222,196,0)');ctx.fillStyle=halo;ctx.fillRect(pet.x-11,pet.y-11,22,22);
  ctx.fillStyle='#ff5057';ctx.beginPath();ctx.arc(pet.x,pet.y,5.5,0,Math.PI*2);ctx.fill();
  const glass=ctx.createRadialGradient(size*.32,size*.23,0,size*.5,size*.5,size*.7);glass.addColorStop(0,'rgba(245,255,231,.14)');glass.addColorStop(.6,'rgba(255,255,255,0)');glass.addColorStop(1,'rgba(10,27,15,.22)');ctx.fillStyle=glass;ctx.fillRect(0,0,size,size);
  ctx.restore();
 };
 useEffect(()=>{
  let active=true;
  const make=(src:string)=>{const image=new Image();image.onload=()=>{if(active)draw();};image.src=src;return image;};
  art.current={ground:make('/forest-adventure/ground-proposals-20261016/option-3.webp'),props:make('/forest-adventure/woodland-props-v2.png'),garden:make(FOREST_NATURE.garden.asset),shelter:make(PILOT_SHELTER.asset),portal:make('/forest-adventure/woodland-portal-v2.webp')};
  draw();return ()=>{active=false;};
 },[]);
 useEffect(draw,[state]);
 const enemies=state.enemies.filter(e=>minimapNearby(state.player,e)&&minimapDiscovered(state.exploredCells,e));
 return <aside className="combat-minimap combat-minimap--lens" aria-label="Minimapa da clareira">
  <canvas ref={canvas} width={256} height={256} role="img" aria-label={`Lupa do mapa, norte para cima. Ponto vermelho: seu pet. ${enemies.length} inimigos próximos. Áreas escuras ainda não exploradas.`}/>
  <img className="combat-minimap-frame" src="/forest-adventure/map-lens-circle-v1.webp" alt="" aria-hidden="true"/>
  <span className="combat-minimap-north" aria-hidden="true">N</span>
 </aside>;
}
