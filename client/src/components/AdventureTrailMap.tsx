import TrailSeams from "./TrailSeams";
import TrailScenery from "./TrailScenery";
import NaturalTrail from "./NaturalTrail";
import {useEffect,useMemo,useRef,useState,type RefObject} from 'react';
import {Check,LockKeyhole,LocateFixed,Play,RotateCcw,Star,Gift,Info,X} from 'lucide-react';
import {GAME_ASSETS} from '@/game/assets';
import {getPlatformStage,getPlatformWorld} from '@/game/platformerLevels';
import {explorationTrailLayout,trailScrollTarget} from '@/game/explorationTrail';
import type {GameState} from '@/game/PetGame';
import './ExplorationCampaignMap.css';
import './AdventureTrailMap.css';
type Props={state:GameState;onPlay:(stage:number)=>void;headingRef?:RefObject<HTMLHeadingElement|null>};
export default function AdventureTrailMap({state,onPlay,headingRef}:Props){
 const progress=state.platformProgress,current=Math.min(100,Math.max(1,progress.unlockedStage)),completed=progress.completedStages;
 const [selected,setSelected]=useState(current),[viewed,setViewed]=useState(Math.floor((current-1)/10)),[size,setSize]=useState({width:390,height:600,vertical:true});
 const [inspecting,setInspecting]=useState(false);
 const viewport=useRef<HTMLDivElement>(null),drag=useRef<{id:number;x:number;y:number;left:number;top:number}|null>(null);
 const layout=useMemo(()=>explorationTrailLayout(size.width,size.height,100,size.vertical,'adventure'),[size.width,size.height,size.vertical]);
 const stage=getPlatformStage(selected)!,locked=selected>progress.unlockedStage,done=completed.includes(selected),allDone=completed.length===100;
 const world=getPlatformWorld(viewed+1)!,mascot=getPlatformStage((viewed+1)*10)!.mascot;
 const isWorldLocked=(index:number)=>(index*10+1)>progress.unlockedStage;
 function center(smooth=false){const el=viewport.current;if(!el)return;el.scrollTo({...trailScrollTarget(layout.points[current-1],layout,size),behavior:smooth&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'auto'});}
 useEffect(()=>{const el=viewport.current;if(!el)return;const resize=()=>{const b=el.getBoundingClientRect();setSize({width:Math.max(300,b.width),height:Math.max(160,b.height),vertical:window.innerHeight>=window.innerWidth});};const o=new ResizeObserver(resize);o.observe(el);window.addEventListener('resize',resize);resize();return()=>{o.disconnect();window.removeEventListener('resize',resize);};},[]);
 useEffect(()=>{center();},[layout,current]);
 useEffect(()=>{const el=viewport.current;if(!el||layout.vertical)return;const wheel=(e:WheelEvent)=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;const before=el.scrollLeft;el.scrollLeft+=e.deltaY;if(before!==el.scrollLeft)e.preventDefault();};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[layout.vertical]);
 return <section className="adventure-trail trail-map" aria-label="Mapa contínuo da Aventura">
  <header className="trail-map-heading"><div><h2 ref={headingRef} tabIndex={-1}>Sua aventura</h2><span>{allDone?'Aventura concluída':`Mundo ${Math.ceil(current/10)} · Fase ${current}/100`}</span></div><span>{completed.length}/100 concluídas</span></header>
  <div className="trail-map-frame">
   <div className="trail-view-label" aria-live="polite"><strong>Mundo {viewed+1} · {world.location}</strong><small>{isWorldLocked(viewed)?'Próximo mundo · conclua o anterior':`${completed.filter(id=>Math.ceil(id/10)===viewed+1).length}/10 fases concluídas`} · {mascot.name} na fase {(viewed+1)*10}</small></div>
   <div ref={viewport} className={`trail-viewport ${layout.vertical?'is-vertical':'is-horizontal'}`} role="region" tabIndex={0} aria-label="Trilha dos 10 mundos e 100 fases. Deslize para ver fases e prêmios." onScroll={e=>{const el=e.currentTarget;setViewed(Math.max(0,Math.min(9,(layout.vertical?layout.chapters-1-Math.floor((el.scrollTop+el.clientHeight*.4)/layout.chapterSpan):Math.floor((el.scrollLeft+el.clientWidth*.4)/layout.chapterSpan)))));}}
    onPointerDown={e=>{if(e.pointerType!=='mouse'||e.button!==0||(e.target as HTMLElement).closest('button'))return;const el=e.currentTarget;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,left:el.scrollLeft,top:el.scrollTop};el.setPointerCapture(e.pointerId);}}
    onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;e.currentTarget.scrollLeft=d.left-e.clientX+d.x;e.currentTarget.scrollTop=d.top-e.clientY+d.y;}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
    <div className="trail-world" style={{width:layout.width,height:layout.height}}>
     {Array.from({length:10},(_,index)=><TrailScenery mode="adventure" key={index} layout={layout} chapter={index} locked={isWorldLocked(index)} active={Math.abs(index-viewed)<=1} src={index===0?'/forest-adventure/home-trail-scene-v1.webp':GAME_ASSETS.levels[index]}/>)}
     <TrailSeams layout={layout} mode="adventure" locked={isWorldLocked}/>
     <NaturalTrail layout={layout} mode="adventure" locked={isWorldLocked}/>
     {layout.points.map((p,index)=>{const id=index+1,data=getPlatformStage(id)!,complete=completed.includes(id),isLocked=id>progress.unlockedStage,rating=progress.starsByStage[String(id)]??0;return <div key={id} className={`trail-room-anchor ${id===current&&!allDone?'is-current':''} ${isLocked?'adv-stage-locked':''} ${selected===id?'is-selected':''}`} style={{left:p.x,top:p.y}}>
       <button type="button" className={`trail-room-node ${selected===id?'is-selected':''}`} aria-pressed={selected===id} aria-label={`Fase ${id}, ${data.subtitle}. ${isLocked?'Bloqueada. Ver prêmio':complete?'Concluída':'Disponível'}. Prêmio: ${data.reward.name}${id%10===0?` e ${data.mascot.name}`:''}`} onClick={()=>{setSelected(id);setInspecting(true);}} title={data.reward.name}><span>{id}</span><span className="trail-stars" aria-hidden="true">{[1,2,3].map(n=><Star key={n} size={13} className={n<=rating?'is-earned':''}/>)}</span><small>{isLocked?<LockKeyhole size={13}/>:complete?<Check size={15}/>:<Play size={13}/>}</small></button>
       {id===current&&!allDone&&<><span className="trail-current-halo" aria-hidden="true"/><img className="trail-current-pet" src={GAME_ASSETS.characters[state.profile?.characterId??'menino-prata']} alt={`${state.profile?.name??'Seu pet'}, fase atual`} draggable={false}/></>}
       <div className="adv-stage-prize" style={layout.vertical?{left:p.x>layout.width*.55?-115:33,top:-20}:{left:-42,top:42}} aria-hidden="true" title={data.reward.name}><img src={GAME_ASSETS.decorations[data.reward.id]} alt="" loading="lazy" draggable={false}/><span>{data.reward.name}</span></div>
       {id%10===0&&<div className="adv-world-friend" style={layout.vertical&&p.x<110?{left:40}:undefined} aria-hidden="true"><img src={GAME_ASSETS.companions[data.mascot.id]} alt="" loading="lazy" draggable={false}/><span>{data.mascot.name}<small>{complete?'Conquistado':`Ao vencer a fase ${id}`}</small></span></div>}
      </div>;})}
    </div>
   </div>
   <button type="button" className="trail-return" aria-label="Voltar ao meu progresso na Aventura" onClick={()=>{setSelected(current);setInspecting(false);center(true);}}><LocateFixed size={22}/><span>Meu progresso</span></button>
   <button type="button" className="trail-info-toggle" hidden={inspecting} aria-label="Ver detalhes da fase selecionada" aria-expanded={inspecting} onClick={()=>setInspecting(true)}><Info size={21}/></button>
   <footer className="trail-selection" hidden={!inspecting} aria-live="polite"><button type="button" className="trail-selection-close" aria-label="Fechar detalhes da fase" onClick={()=>setInspecting(false)}><X size={17}/></button><img className="adv-selected-reward" src={GAME_ASSETS.decorations[stage.reward.id]} alt=""/><div><small>MUNDO {stage.world} · FASE {selected}</small><strong>{stage.reward.name}</strong><span>{done?'Decoração conquistada':`Desbloqueia ao vencer a fase ${selected}`}{selected%10===0?` + ${stage.mascot.name}`:''}</span><small>{locked?'Conclua a fase anterior para jogar':done?'Jogue novamente e melhore suas estrelas':stage.subtitle}</small></div><button type="button" disabled={locked} className="forest-primary" onClick={()=>{if(!locked)onPlay(selected);}}>{locked?<LockKeyhole size={17}/>:done?<RotateCcw size={17}/>:<Play size={17}/>} {locked?'Bloqueada':done?'Jogar novamente':'Jogar'}</button></footer>
  </div>
  <details className="trail-map-guide"><summary>Como funciona a aventura</summary><p className="trail-map-help"><Gift size={14}/> {layout.vertical?'Suba pela trilha.':'Avance para a direita.'} Toque em uma fase para ver seu prêmio. Decorações e novos amigos ficam disponíveis ao vencer.</p></details>
 </section>;
}
