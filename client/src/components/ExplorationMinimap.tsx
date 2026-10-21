import {explorationGroves} from '@/game/explorationOpenWorld';
import {drawCastleLens,onCastleArtChange} from '@/game/explorationCastleView';
import {NASCENTES_ASSETS,returnPortal} from '@/game/explorationChapter4';
import {drawNascentesTerrain} from '@/game/explorationChapter4View';
import {explorationColorVariant,AUTUMN_GROUND_FILTER,AUTUMN_PROP_FILTER} from '@/game/explorationColorCache';
import {drawBiomeWater} from '@/game/biomeCompositionView';
import {campaignRoom,campaignGardens,campaignWaterBlocks} from '@/game/explorationCampaign';
import {drawCampaignBridge,drawCampaignKey,drawRiverProp,drawCampaignShore} from '@/game/explorationCampaignArt';
import { useEffect, useRef, type ReactNode } from 'react';
import {type CombatState} from '@/game/explorationCombat';
import { PILOT_SHELTER,ROOM_SCENERY,ROOM_EDGE_SOLIDS,ROOM_GARDENS,ROOM_EDGE_GARDENS,SCATTERED_GARDENS,OUTER_GARDENS } from '@/game/explorationRoom';
import { minimapDiscovered,minimapNearby } from '@/game/explorationMinimap';
import { lensProjection,discoveredWorldPoint } from '@/game/explorationLens';
import { drawExplorationGround,drawWoodlandProp,FOREST_GROUND } from '@/game/explorationScenery';
import { drawGardenPatch,FOREST_NATURE } from '@/game/forestNature';

type LensArt={soil:HTMLImageElement;stone:HTMLImageElement;cliff:HTMLImageElement;ground:HTMLImageElement;props:HTMLImageElement;garden:HTMLImageElement;shelter:HTMLImageElement;portal:HTMLImageElement;bridge:HTMLImageElement;key:HTMLImageElement;riverProps:HTMLImageElement;riverPortal:HTMLImageElement;water:HTMLImageElement};
/** The full lens shows actual terrain, clipped discovery and north-up world markers. */
export default function ExplorationMinimap({state,children}:{state:CombatState;children?:ReactNode}){
 const canvas=useRef<HTMLCanvasElement>(null),art=useRef<LensArt|null>(null),latest=useRef(state);
 latest.current=state;
 const draw=()=>{
  const el=canvas.current,ctx=el?.getContext('2d'),images=art.current;
  if(!el||!ctx||!images)return;
  if(latest.current.castle?.active){drawCastleLens(ctx,el.width,latest.current);return;}
  const source=images;
  const size=el.width,s=latest.current,v=lensProjection(size,s.player),t=v.scale,room=campaignRoom(s.roomIndex),river=room.biome==='river';
  const ground=room.biome==='autumn'?explorationColorVariant(images.ground,AUTUMN_GROUND_FILTER)!:images.ground,props=room.biome==='autumn'?explorationColorVariant(images.props,AUTUMN_PROP_FILTER)!:images.props,gardenArt=room.biome==='autumn'?explorationColorVariant(images.garden,AUTUMN_PROP_FILTER)!:images.garden;
  const point=(p:{x:number;y:number})=>({x:v.left+p.x*t,y:v.top+p.y*t});
  const ready=(im:HTMLImageElement)=>im.complete&&im.naturalWidth>0;
  ctx.clearRect(0,0,size,size);ctx.save();ctx.beginPath();ctx.arc(size/2,size/2,size/2,0,Math.PI*2);ctx.clip();
  // Dark textured terrain occupies undiscovered parts too, without a rectangular map inset.
  ctx.save();
  if(ready(ground)){if(room.index>=30)drawNascentesTerrain(ctx,size,size,v.left,v.top,t,ground,images.stone,s.gateOpen,images.bridge,images.cliff,props,0,true,images.portal,images.water,images.shelter,room.index,true,images.soil);else drawExplorationGround(ctx,size,size,ground,v.left,v.top,t,FOREST_GROUND,room.composition??false);}
  else {ctx.fillStyle='#345331';ctx.fillRect(0,0,size,size);}
  ctx.restore();
  ctx.fillStyle='rgba(8,24,19,.91)';ctx.fillRect(0,0,size,size);
  ctx.save();ctx.beginPath();
  for(const cell of (s.openWorldCells?.length??0)>0?(s.openWorldCells??[]).map(k=>{const [x,y]=k.split(',').map(Number);return{x:x+.5,y:y+.5}}):s.exploredCells.map(discoveredWorldPoint)){const p=point(cell);ctx.moveTo(p.x+t*.74,p.y);ctx.arc(p.x,p.y,t*.74,0,Math.PI*2);}
  ctx.clip();ctx.save();
  if(ready(ground)){if(room.index>=30)drawNascentesTerrain(ctx,size,size,v.left,v.top,t,ground,images.stone,s.gateOpen,images.bridge,images.cliff,props,0,true,images.portal,images.water,images.shelter,room.index,true,images.soil);else drawExplorationGround(ctx,size,size,ground,v.left,v.top,t,FOREST_GROUND,room.composition??false);}
  if(room.index<30&&room.composition)drawBiomeWater(ctx,room.composition,v.left,v.top,t,0,true,images.water);
  if(room.index<30)drawCampaignShore(ctx,room,v.left,v.top,t,props,gardenArt,images.riverProps);
  const visible=(p:{x:number;y:number})=>{const q=point(p);return q.x>-t*2&&q.y>-t*2&&q.x<size+t*2&&q.y<size+t*2;};
  if(room.index<30&&ready(gardenArt))for(const garden of [...campaignGardens(room),...ROOM_EDGE_GARDENS,...OUTER_GARDENS].filter(p=>!campaignWaterBlocks(p,.15,room))){
   if(visible(garden)){const q=point(garden);river?drawRiverProp(ctx,images.riverProps,3+garden.index%2,q.x,q.y,t,{width:garden.width,height:garden.height}):drawGardenPatch(ctx,gardenArt,garden,q.x,q.y,t,0,true);}
  }
  if(room.index<30&&ready(props))for(const prop of [...room.scenery,...ROOM_EDGE_SOLIDS,...explorationGroves({left:-v.left/t,top:-v.top/t,width:size/t,height:size/t},room.index)].sort((a,b)=>a.y-b.y)){
   if(visible(prop)){const q=point(prop);river?drawRiverProp(ctx,images.riverProps,prop.index,q.x,q.y,t,prop):drawWoodlandProp(ctx,props,prop.index,q.x,q.y,t,prop,true);}
  }
  const sprite=(im:HTMLImageElement,p:{x:number;y:number},width:number)=>{
   if(!ready(im)||!visible(p))return;const q=point(p),w=t*width,h=w*im.naturalHeight/im.naturalWidth;ctx.drawImage(im,q.x-w/2,q.y-h,w,h);
  };
  if(room.index<30){sprite(images.shelter,PILOT_SHELTER,1.55);sprite(river?images.riverPortal:images.portal,room.exit,1.95);}drawCampaignBridge(ctx,images.bridge,room,v.left,v.top,t);
  if(room.key&&!s.hasRoomKey)drawCampaignKey(ctx,images.key,room.key,v.left,v.top,t,0,true);
  ctx.restore();
  const dot=(p:{x:number;y:number},color:string,r=3.5)=>{
   const q=point(p);ctx.shadowColor='#182619';ctx.shadowBlur=3;ctx.fillStyle=color;ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  };
  const discovered=(p:{x:number;y:number})=>(s.openWorldCells?.length??0)>0?(s.openWorldCells??[]).includes(`${Math.floor(p.x)},${Math.floor(p.y)}`):minimapDiscovered(s.exploredCells,p);
  for(const [i,plate] of room.switches.entries())if(discovered(plate))dot(plate,i<s.switchStep?'#c4ef9c':'#f2d09a');
  if(discovered(room.camp))dot(room.camp,'#a3e8dd',4.5);
  if(discovered(room.marker))dot(room.marker,s.gateOpen?'#c0e99e':'#ffeab0',4.5);
  if(room.index>0&&s.completedRooms.includes(room.index-1)&&discovered(returnPortal(room.index)))dot(returnPortal(room.index),'#a6e7ec',4.5);
  if(discovered(room.exit))dot(room.exit,s.gateOpen?'#fff3b4':'#a5b790',4.5);
  for(const n of room.nodes)if(!s.collectedNodes.includes(n.id)&&discovered(n))dot(n,'#e3f1a9');
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
  const spring=latest.current.roomIndex>=30;
  art.current={soil:make(spring?NASCENTES_ASSETS.soil:'/forest-adventure/ground-proposals-20261016/option-3.webp'),stone:make(spring?NASCENTES_ASSETS.stone:'/forest-adventure/ground-proposals-20261016/option-3.webp'),cliff:make(spring?(latest.current.roomIndex===31?NASCENTES_ASSETS.grassPlateau:NASCENTES_ASSETS.cliff):'/forest-adventure/ground-proposals-20261016/option-3.webp'),ground:make(spring?NASCENTES_ASSETS.grass:'/forest-adventure/ground-proposals-20261016/option-3.webp'),props:make('/forest-adventure/woodland-props-v2.png'),garden:make(FOREST_NATURE.garden.asset),shelter:make(spring?NASCENTES_ASSETS.shelter:PILOT_SHELTER.asset),portal:make(spring?NASCENTES_ASSETS.portal:'/forest-adventure/woodland-portal-v2.webp'),bridge:make(spring?NASCENTES_ASSETS.trees:'/forest-adventure/chapter1-bridge-v1.webp'),key:make('/forest-adventure/chapter1-key-v1.webp'),riverProps:make('/forest-adventure/river-props-v1.webp'),riverPortal:make('/forest-adventure/river-portal-v1.webp'),water:make('/forest-adventure/painted-water-v1.webp')};
  draw();return ()=>{active=false;};
 },[state.roomIndex]);
 useEffect(draw,[state]);
 useEffect(()=>onCastleArtChange(draw),[]);
 const enemies=state.enemies.filter(e=>minimapNearby(state.player,e)&&minimapDiscovered(state.exploredCells,e));
 return <aside className="combat-minimap combat-minimap--lens" aria-label={state.castle?.active?"Minimapa do castelo":"Minimapa da clareira"}>
  <canvas ref={canvas} width={384} height={384} role="img" aria-label={state.castle?.active?"Lupa da sala do castelo. Ponto vermelho: posição do personagem.":`Lupa do mapa, norte para cima. Ponto vermelho: seu pet. ${enemies.length} inimigos próximos. Áreas escuras ainda não exploradas.`}/>
  <img className="combat-minimap-frame" src="/forest-adventure/map-lens-circle-v1.webp" alt="" aria-hidden="true"/>
  <span className="combat-minimap-north" aria-hidden="true">N</span>
  {children}
 </aside>;
}
