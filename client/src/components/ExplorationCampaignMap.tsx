import TrailChallengeIcon from "./TrailChallengeIcon";
import {explorationTrailInfo,trailCaptionOffsets} from "@/game/trailStageInfo";
import TrailSeams from "./TrailSeams";
import TrailScenery from "./TrailScenery";
import NaturalTrail from "./NaturalTrail";
import {explorationMobFrame} from '@/game/explorationMobArt';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {Check,LockKeyhole,Play,RotateCcw,LocateFixed,Crown,ArrowUp,ArrowRight,Star,Info,X} from 'lucide-react';
import {EXPLORATION_ROOMS,chapterName,roomInChapter,chapterNumber} from '@/game/explorationCampaign';
import {explorationRoomStatus} from '@/game/explorationSelection';
import {explorationTrailLayout,trailScrollTarget} from '@/game/explorationTrail';
import {COMBAT_CARDS,bossCardForRoom,type CombatState} from '@/game/explorationCombat';
import './ExplorationCampaignMap.css';
type Props={state:CombatState;onContinue:()=>void;onReplay:(index:number)=>void;petImage?:string;petName?:string};
export default function ExplorationCampaignMap({state,onContinue,onReplay,petImage,petName='Seu pet'}:Props){
 const currentIndex=state.completed?Math.min(EXPLORATION_ROOMS.length-1,state.roomIndex+1):state.roomIndex;
 const [selected,setSelected]=useState(currentIndex),[viewedChapter,setViewedChapter]=useState(Math.floor(currentIndex/10));
 const [size,setSize]=useState({width:390,height:600,vertical:true}),viewport=useRef<HTMLDivElement>(null),drag=useRef<{id:number;x:number;y:number;left:number;top:number}|null>(null);
 const [inspecting,setInspecting]=useState(false);
 const layout=useMemo(()=>explorationTrailLayout(size.width,size.height,EXPLORATION_ROOMS.length,size.vertical),[size.width,size.height,size.vertical]);
 const captions=useMemo(()=>trailCaptionOffsets(layout),[layout]);
 const selectedRoom=EXPLORATION_ROOMS[selected],selectedInfo=explorationTrailInfo(selectedRoom),selectedStatus=explorationRoomStatus(state,selected),finished=state.completedRooms.length===EXPLORATION_ROOMS.length;
 function center(index:number,smooth=false){const el=viewport.current;if(!el)return;const target=trailScrollTarget(layout.points[index],layout,size);el.scrollTo({...target,behavior:smooth&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'auto'});}
 useEffect(()=>{const el=viewport.current;if(!el)return;const resize=()=>{setSize({width:Math.max(300,el.clientWidth),height:Math.max(160,el.clientHeight),vertical:window.innerHeight>=window.innerWidth});};const observer=new ResizeObserver(resize);observer.observe(el);window.addEventListener('resize',resize);resize();return()=>{observer.disconnect();window.removeEventListener('resize',resize);};},[]);
 useEffect(()=>{center(currentIndex);},[layout,currentIndex]);
 useEffect(()=>{const el=viewport.current;if(!el||layout.vertical)return;const wheel=(event:WheelEvent)=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY))return;const before=el.scrollLeft;el.scrollLeft+=event.deltaY;if(el.scrollLeft!==before)event.preventDefault();};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[layout.vertical]);
 function select(index:number){setSelected(index);setInspecting(true);}
 function enter(){if(selectedStatus==='completed')onReplay(selected);else if(selectedStatus==='current')onContinue();}
 let partial=false;try{partial=Boolean(state.roomAttempts[selected]&&!JSON.parse(state.roomAttempts[selected]).completed);}catch{/* Invalid attempt is safely restarted by the engine. */}
 const chapterLocked=Array.from({length:10},(_,i)=>viewedChapter*10+i).filter(i=>i<EXPLORATION_ROOMS.length).every(i=>explorationRoomStatus(state,i)==='locked');
 return <section className="exploration-campaign-map trail-map" aria-label="Progresso da campanha de Exploração">
  <header className="trail-map-heading"><div><h2>Sua exploração</h2><span>{finished?'Expedição concluída':`Capítulo ${chapterNumber(currentIndex)} · Sala ${currentIndex+1}/${EXPLORATION_ROOMS.length}`}</span></div><span>{state.completedRooms.length}/{EXPLORATION_ROOMS.length} salas concluídas</span></header>
  <div className="trail-map-frame">
   <div className="trail-view-label" aria-live="polite"><strong>Capítulo {viewedChapter+1} · {chapterName(viewedChapter*10)}</strong><small>{chapterLocked?'Conclua o capítulo anterior para liberar':`${state.completedRooms.filter(i=>Math.floor(i/10)===viewedChapter).length}/10 concluídas`}</small></div>
   <div ref={viewport} className={`trail-viewport ${layout.vertical?'is-vertical':'is-horizontal'}`} tabIndex={0} role="region" aria-label="Mapa contínuo dos capítulos. Deslize para explorar os biomas." onScroll={event=>{const el=event.currentTarget,offset=layout.vertical?el.scrollTop+el.clientHeight*.4:el.scrollLeft+el.clientWidth*.4;setViewedChapter(Math.max(0,Math.min(layout.chapters-1,layout.vertical?layout.chapters-1-Math.floor(offset/layout.chapterSpan):Math.floor(offset/layout.chapterSpan))));}}
    onPointerDown={event=>{if(event.pointerType!=='mouse'||event.button!==0||(event.target as HTMLElement).closest('button'))return;const el=event.currentTarget;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,left:el.scrollLeft,top:el.scrollTop};el.setPointerCapture(event.pointerId);}}
    onPointerMove={event=>{const d=drag.current;if(!d||d.id!==event.pointerId)return;const el=event.currentTarget;el.scrollLeft=d.left-(event.clientX-d.x);el.scrollTop=d.top-(event.clientY-d.y);}}
    onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
    <div className="trail-world" style={{width:layout.width,height:layout.height}}>
     {Array.from({length:layout.chapters},(_,chapter)=><TrailScenery mode="exploration" key={chapter} layout={layout} chapter={chapter} locked={EXPLORATION_ROOMS.slice(chapter*10,chapter*10+10).every(r=>explorationRoomStatus(state,r.index)==='locked')} active={Math.abs(chapter-viewedChapter)<=1} src={`/forest-adventure/trail-${chapter===0?'forest':'river'}-v1.webp`}/>)}
     <TrailSeams layout={layout} mode="exploration" locked={chapter=>EXPLORATION_ROOMS.slice(chapter*10,chapter*10+10).every(r=>explorationRoomStatus(state,r.index)==='locked')}/>
     <NaturalTrail layout={layout} mode="exploration" locked={chapter=>EXPLORATION_ROOMS.slice(chapter*10,chapter*10+10).every(r=>explorationRoomStatus(state,r.index)==='locked')}/>

     {Array.from({length:layout.chapters},(_,chapter)=>[1,6].map((stage,j)=>{const room=chapter*10+stage,p=layout.points[room],side=j%2===0?-1:1,locked=explorationRoomStatus(state,chapter*10)==='locked';const style:CSSProperties=layout.vertical?{left:Math.max(40,Math.min(layout.width-40,p.x+side*100)),top:p.y+48}:{left:p.x+57,top:Math.max(38,Math.min(layout.height-38,p.y+side*90))};return <span key={`${chapter}-${stage}`} aria-hidden="true" className={`trail-scenery ${locked?'is-locked':''}`} style={style}>{(()=>{const art=chapter===1?'river-mobs':'forest-mobs',rect=explorationMobFrame(art,j%3,0,1448,1086);return <svg className="trail-npc" width={rect.width} height={rect.height} style={{height:'auto',filter:chapter===2?'sepia(.65) saturate(1.4) hue-rotate(338deg)':undefined}} viewBox={`${rect.x} ${rect.y} ${rect.width} ${rect.height}`} preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href={`/forest-adventure/${art}-v1.webp`} width="1448" height="1086"/></svg>;})()}</span>;}))}

     {EXPLORATION_ROOMS.map(room=>{const status=explorationRoomStatus(state,room.index),p=layout.points[room.index],active=room.index===currentIndex&&!finished,info=explorationTrailInfo(room);return <div key={room.index} className={`trail-room-anchor is-${status}`} style={{left:p.x,top:p.y}}>
      <button type="button" aria-pressed={selected===room.index} className={`trail-room-node ${selected===room.index?'is-selected':''} ${room.bossId?'is-master':''}`} title={`${room.title}${status==='locked'?' · Conclua a sala anterior':''}`} onClick={()=>select(room.index)} aria-label={`Capítulo ${chapterNumber(room.index)}, sala ${room.index+1}, ${room.title}. ${status==='completed'?'Concluída. Jogar novamente':status==='current'?'Atual. Continuar':'Bloqueada. Ver desafio e recompensa'}`}><span><em className="trail-node-kind">SALA</em>{room.index+1}</span><i className="trail-challenge-badge"><TrailChallengeIcon kind={info.kind}/></i><span className="trail-stars" aria-hidden="true">{[1,2,3].map(n=><Star key={n} size={13} className={n<=(state.roomStars?.[room.index]??0)?'is-earned':''}/>)}</span>{room.bossId&&<Crown className="trail-master-crown" size={21}/>}<small>{status==='completed'?<Check size={15}/>:status==='locked'?<LockKeyhole size={13}/>:<Play size={13}/>}</small></button>
      <span className="trail-room-caption" style={captions[room.index]} aria-hidden="true">{info.label}{info.reward&&<small>Carta rara</small>}</span>
      {status==='completed'&&<span className="trail-sr-only">{state.roomStars?.[room.index]?`${state.roomStars[room.index]} de 3 estrelas`:'Sem avaliação. Jogue novamente para ganhar estrelas.'}</span>}
      {active&&<span className="trail-current-halo" aria-hidden="true"/>}
      {active&&petImage&&<img className="trail-current-pet" src={petImage} alt={`${petName}, sua etapa atual`} draggable={false}/>}
      {room.bossId&&<span className="trail-master-caption">Carta rara</span>}
     </div>;})}

    </div>
   </div>
   <button type="button" className="trail-return" onClick={()=>{setSelected(currentIndex);setInspecting(false);center(currentIndex,true);}} aria-label="Voltar ao meu progresso"><LocateFixed size={23}/><span>Meu progresso</span></button>
   <button type="button" className="trail-info-toggle" hidden={inspecting} aria-label="Ver detalhes da sala selecionada" aria-expanded={inspecting} onClick={()=>setInspecting(true)}><Info size={21}/></button>
   <footer className="trail-selection" hidden={!inspecting} aria-live="polite"><button type="button" className="trail-selection-close" aria-label="Fechar detalhes da sala" onClick={()=>setInspecting(false)}><X size={17}/></button><div><small>CAPÍTULO {chapterNumber(selected)}</small><strong>Sala {selected+1} · {selectedRoom.title}</strong><span className="trail-objective">{selectedRoom.hint}</span>{selectedInfo.reward&&<span className="trail-card-power">{COMBAT_CARDS[bossCardForRoom(selected)].description}</span>}<span>{selectedInfo.reward?`Carta rara: ${selectedInfo.reward}`:`Adversários principais: até Nv. ${selectedInfo.enemyLevel}`} · {selectedStatus==='completed'?partial?'Repetição salva · retome de onde parou':state.roomStars?.[selected]?`Melhor resultado: ${state.roomStars[selected]}/3 estrelas`:'Sem avaliação · jogue novamente para ganhar estrelas':selectedStatus==='locked'?'Conclua as salas anteriores para liberar':'Sua próxima etapa'}</span></div><button type="button" className="forest-primary" disabled={selectedStatus==='locked'} onClick={enter}>{selectedStatus==='locked'?<LockKeyhole size={17}/>:selectedStatus==='completed'?<RotateCcw size={17}/>:<Play size={17}/>} {selectedStatus==='locked'?'Bloqueada':selectedStatus==='completed'?partial?'Retomar repetição':'Jogar novamente':'Continuar'}</button></footer>
  </div>
  <details className="trail-map-guide"><summary>Como funciona a exploração</summary><p className="trail-stars-help">Estrelas: concluir · sem derrotas · sem derrotas e dano de até 25% da vida máxima. Vale seu melhor resultado.</p><p className="trail-map-help">{layout.vertical?<ArrowUp size={14}/>:<ArrowRight size={14}/>}{layout.vertical?'Avance para cima':'Avance para a direita'} pela trilha para conhecer os próximos biomas. As áreas bloqueadas ganham cor ao avançar.</p><p>Toque em qualquer sala para consultar seu desafio. As bloqueadas mostram a prévia e só permitem jogar após liberar. Explore biomas, supere desafios e encontre itens raros. Cada portal abre o próximo trecho da sua jornada.</p></details>
 </section>;
}
