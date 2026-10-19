import type {CombatPower} from '@/game/explorationCombat';
export default function PowerSymbol({power}:{power:CombatPower}){const column={burst:0,roots:1,tide:2,amber:3}[power];return <span className="exp-power-symbol" aria-hidden="true" style={{backgroundImage:'url(/forest-adventure/powers-painted-v1.png)',backgroundSize:'400% 200%',backgroundPosition:`${column*100/3}% 0%`}}/>;}
