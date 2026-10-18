import {useState} from 'react';
import ExplorationCombatPilot from '@/components/ExplorationCombatPilot';
import ExplorationCampaignMap from '@/components/ExplorationCampaignMap';
import {createCombatState,combatSnapshot,readCombatState,combatMaxHp} from '@/game/explorationCombat';
import {EXPLORATION_ROOMS} from '@/game/explorationCampaign';
/** Explicit isolated playtest: no account, localStorage save or campaign writes. */
function fixture(index:number){const s=createCombatState(index,42);s.completedRooms=Array.from({length:index},(_,i)=>i);s.claimedRooms=[...s.completedRooms];s.xp=12000;s.hp=combatMaxHp(s.xp);s.stock.erva=8;s.stock.fruta=8;s.cards=['roots','tide'];s.activeCard='tide';s.equipmentOwned=true;s.equipmentOn=true;return s;}
export default function ExplorationLab(){
 const [index,setIndex]=useState(20),[game,setGame]=useState(()=>fixture(20)),[playing,setPlaying]=useState(false),[sound,setSound]=useState(false);
 return <div className="exp-lab"><header style={{background:'#183d30',color:'#fff4cf',padding:'8px 12px',font:'13px system-ui',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}><strong>Teste isolado · Capítulo 3</strong><span>Sem salvar na sua conta</span><label>Sala <select aria-label="Sala de teste isolado" style={{background:'#fff4cf',color:'#233c30',minHeight:44}} value={index} onChange={e=>{const next=Number(e.target.value);setIndex(next);setGame(fixture(next));setPlaying(false);}}>{EXPLORATION_ROOMS.slice(20).map(r=><option key={r.index} value={r.index}>{r.index+1} · {r.title}</option>)}</select></label><a href="/" style={{color:'#fff4cf'}}>Jogo principal</a></header>
 <div style={{height:'calc(100dvh - 70px)',minHeight:260,overflow:'auto'}}>{playing?<ExplorationCombatPilot key={index} profile={null} progress={combatSnapshot(game)} soundOn={sound} onToggleSound={()=>setSound(v=>!v)} onSave={raw=>{const r=readCombatState(raw);if(r.supported)setGame(r.state);}} onBack={()=>setPlaying(false)}/>:<div style={{background:'#193b2f',color:'#f4eac9',minHeight:'100%',padding:12}}><ExplorationCampaignMap state={game} petName="Pet de teste" onContinue={()=>setPlaying(true)} onReplay={()=>{}}/></div>}</div></div>;
}
