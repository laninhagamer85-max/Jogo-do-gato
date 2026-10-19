import {CHAPTER_AMBIENCE} from '@/game/explorationAudio';
import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {loadExplorationAudio,saveExplorationAudio,type ExplorationAudioMix} from '@/game/explorationAudio';
import type {CombatState} from '@/game/explorationCombat';
import {ExplorationTutorial,ExplorationBestiary,ExplorationRoomManual} from './ExplorationFieldGuide';
import './ExplorationCombatPilot.css';
/** Mounted only on the chapter screen: a room simulation is never running underneath. */
export default function ExplorationSettings({game,soundOn,onToggleSound,onClose}:{game:CombatState;soundOn:boolean;onToggleSound:()=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),[tab,setTab]=useState<'audio'|'guide'|'bestiary'|'rooms'>('audio'),[mix,setMix]=useState(loadExplorationAudio);
 useEffect(()=>{const el=ref.current;el?.showModal();return()=>{if(el?.open)el.close();};},[]);
 function update(key:keyof ExplorationAudioMix,value:number){const next={...mix,[key]:value};setMix(next);saveExplorationAudio(next);}
 return <dialog ref={ref} className="combat-dialog exploration-settings" aria-labelledby="exploration-settings-title" onCancel={e=>{e.preventDefault();onClose();}}><header className="combat-dialog-heading"><h2 id="exploration-settings-title">Configurações da Exploração</h2><button aria-label="Fechar configurações" onClick={onClose}><X size={20}/></button></header><nav className="exp-pause-tabs" aria-label="Preparar exploração">{([['audio','Áudio'],['guide','Como jogar'],['bestiary','Bestiário'],['rooms','Salas']] as const).map(([key,label])=><button key={key} aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</button>)}</nav>
 {tab==='audio'?<div className="exp-audio-settings"><p>Ajuste antes de entrar na sala. O ambiente muda automaticamente em cada capítulo.</p><ul>{CHAPTER_AMBIENCE.map((profile,i)=><li key={profile.name}><strong>Capítulo {i+1} · {profile.name}</strong>: {profile.description}</li>)}</ul><button onClick={onToggleSound}>{soundOn?'Silenciar todos os sons':'Ativar sons'}</button>{([['npcs','Sons dos NPCs'],['ambience','Ambiente'],['effects','Efeitos de ações']] as const).map(([key,label])=><label key={key}><span>{label} <output>{Math.round(mix[key]*100)}%</output></span><input type="range" min="0" max="100" aria-label={label} value={Math.round(mix[key]*100)} onChange={e=>update(key,Number(e.target.value)/100)}/></label>)}<p>Volumes salvos neste navegador e aplicados ao entrar na sala.</p></div>:tab==='guide'?<ExplorationTutorial/>:tab==='bestiary'?<ExplorationBestiary/>:<ExplorationRoomManual game={game}/>}
 <div className="combat-dialog-actions"><button onClick={onClose}>Voltar aos capítulos</button></div></dialog>;
}
