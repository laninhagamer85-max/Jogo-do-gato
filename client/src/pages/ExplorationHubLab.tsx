import {useState} from 'react';
import ForestPuzzleAdventure from '@/components/ForestPuzzleAdventure';
import {createCombatState,combatSnapshot} from '@/game/explorationCombat';
/** Isolated presentation QA; no account, browser storage or production save writes. */
export default function ExplorationHubLab(){const [sound,setSound]=useState(false);const [progress,setProgress]=useState(()=>{const s=createCombatState(14);s.completedRooms=Array.from({length:14},(_,i)=>i);return combatSnapshot(s);});return <ForestPuzzleAdventure profile={{name:'Preto',age:1,gender:'menino',characterId:'menino-preto'}} savedProgress={{}} combatProgress={progress} onSaveCombatProgress={setProgress} soundOn={sound} onToggleSound={()=>setSound(v=>!v)} onCompleteChapter={()=>{}} onBack={()=>{}} onGoToHouse={()=>{}}/>;}
