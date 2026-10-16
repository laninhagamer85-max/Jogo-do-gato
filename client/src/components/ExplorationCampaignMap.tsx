import {Check,LockKeyhole,Play,RotateCcw,Flag,ChevronRight} from 'lucide-react';
import {EXPLORATION_ROOMS,chapterName,roomInChapter,chapterNumber} from '@/game/explorationCampaign';
import {explorationRoomStatus} from '@/game/explorationSelection';
import type {CombatState} from '@/game/explorationCombat';
import './ExplorationCampaignMap.css';
export default function ExplorationCampaignMap({state,onContinue,onReplay}:{state:CombatState;onContinue:()=>void;onReplay:(index:number)=>void}){
 const nextIndex=state.completed?Math.min(EXPLORATION_ROOMS.length-1,state.roomIndex+1):state.roomIndex;
 const finished=state.completedRooms.length===EXPLORATION_ROOMS.length;
 return <section className="exploration-campaign-map" aria-label="Progresso da campanha de Exploração">
  <div className="exploration-campaign-resume"><div><span className="exploration-campaign-eyebrow">SUA EXPEDIÇÃO</span><h2>{finished?'Expedição concluída':`Capítulo ${chapterNumber(nextIndex)} · ${chapterName(nextIndex)}`}</h2><p>{finished?'Todos os capítulos disponíveis foram concluídos. Escolha uma sala para jogar novamente.':`Continuar na sala ${roomInChapter(nextIndex)}/10 · ${EXPLORATION_ROOMS[nextIndex].title}`}</p><span className="exploration-campaign-total">{state.completedRooms.length}/20 salas concluídas</span></div>{!finished&&<button className="forest-primary" onClick={onContinue}><Play size={18}/>Continuar de onde parou</button>}</div>
  {[0,1].map(chapter=>{const rooms=EXPLORATION_ROOMS.slice(chapter*10,chapter*10+10),done=rooms.filter(r=>state.completedRooms.includes(r.index)).length,locked=rooms.every(r=>explorationRoomStatus(state,r.index)==='locked');return <section className={`exploration-biome ${locked?'is-locked':''}`} key={chapter} aria-label={`Capítulo ${chapter+1}: ${chapterName(chapter*10)}`}>
   <header><img src={chapter===0?'/forest-adventure/backgrounds/clearing.webp':'/forest-adventure/backgrounds/creek.webp'} alt="" loading="lazy"/><div><small>CAPÍTULO {chapter+1}</small><h3>{chapterName(chapter*10)}</h3><p>{done}/10 concluídas · {locked?'Conclua o capítulo anterior':done===10?'Capítulo concluído':chapter===Math.floor(nextIndex/10)?'Em andamento':'Disponível'}</p></div>{locked?<LockKeyhole aria-label="Capítulo bloqueado"/>:done===10?<Check aria-label="Capítulo concluído"/>:<Flag aria-hidden="true"/>}</header>
   <div className="exploration-room-grid">{rooms.map(room=>{const status=explorationRoomStatus(state,room.index),completed=status==='completed',current=status==='current',replaySaved=Boolean(state.roomAttempts[room.index]);return <button type="button" key={room.index} disabled={status==='locked'} className={`exploration-room-card is-${status}`} onClick={()=>completed?onReplay(room.index):onContinue()} aria-label={`Capítulo ${chapter+1}, sala ${roomInChapter(room.index)}, ${room.title}. ${completed?'Concluída. Jogar novamente':current?'Atual. Continuar':'Bloqueada. Conclua a sala anterior'}`}>
    <span className="exploration-room-number">{roomInChapter(room.index)}{completed?<Check size={15}/>:current?<ChevronRight size={15}/>:<LockKeyhole size={14}/>}</span><strong>{room.title}</strong><small>{completed?<><RotateCcw size={13}/>{replaySaved?'Repetir / continuar':'Jogar novamente'}</>:current?<><Play size={13}/>Continuar</>:<>Conclua a anterior</>}</small>{room.bossId&&<span className="exploration-master-label">Mestre · carta rara</span>}
   </button>;})}</div>
  </section>;})}
  <p className="exploration-campaign-note">Repetir uma sala mantém seu avanço e a posição da campanha. Novas salas são liberadas em sequência pelos portais.</p>
 </section>;
}
