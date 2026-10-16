import {EXPLORATION_WORLD} from '@/game/explorationWorld';
import { PILOT_CAMP,PILOT_EXIT,PILOT_MARKER,PILOT_NODES,PILOT_WALLS,type CombatState } from '@/game/explorationCombat';
import { PILOT_SHELTER } from '@/game/explorationRoom';
import { minimapDiscovered,minimapNearby,MINIMAP_WIDTH } from '@/game/explorationMinimap';
/** Entire room fits inside the circle; no clipped corners, map rotation or input capture. */
export default function ExplorationMinimap({state}:{state:CombatState}){
 const discovered=(p:{x:number;y:number})=>minimapDiscovered(state.exploredCells,p);
 const enemies=state.enemies.filter(e=>minimapNearby(state.player,e)&&discovered(e));
 const dot=(p:{x:number;y:number},fill:string,r=2)=> <circle cx={p.x} cy={p.y} r={r/2.8} fill={fill} stroke="#102c21" strokeWidth=".16"/>;
 return <aside className="combat-minimap" aria-label="Minimapa da clareira">
  <svg viewBox="0 0 100 100" role="img" aria-label={`Minimapa. Ponto vermelho: seu pet. ${enemies.length} inimigos próximos. Áreas escuras ainda não exploradas.`}>
   <circle cx="50" cy="50" r="48" fill="#102b23" stroke="#c1cda0" strokeWidth="1.5"/>
   <text x="50" y="14" textAnchor="middle" fill="#e5eacb" fontSize="8">N</text>
   <g transform="translate(13.6 22) scale(2.8)">
    <rect width="26" height="20" fill="#294738"/>
    {state.exploredCells.map(i=><rect key={i} x={i%MINIMAP_WIDTH} y={Math.floor(i/MINIMAP_WIDTH)} width="1.02" height="1.02" fill="#6f9651"/>)}
    <g transform={`translate(${-EXPLORATION_WORLD.left} ${-EXPLORATION_WORLD.top})`}>
    {PILOT_WALLS.filter(w=>discovered({x:w.x+.5,y:w.y+.5})).map(w=><rect key={`${w.x}:${w.y}`} x={w.x} y={w.y} width="1" height="1" fill="#3a5141"/>)}
    {discovered(PILOT_SHELTER)&&<rect {...PILOT_SHELTER.footprint} fill="#a5b4a1"/>}
    {discovered(PILOT_CAMP)&&dot(PILOT_CAMP,'#8de2e9',2.8)}
    {PILOT_NODES.filter(n=>!state.collectedNodes.includes(n.id)&&discovered(n)).map(n=><g key={n.id}>{dot(n,'#d6eca2')}</g>)}
    {discovered(PILOT_MARKER)&&<path transform={`translate(${PILOT_MARKER.x} ${PILOT_MARKER.y})`} d="M0 -.55 .45 0 0 .55 -.45 0Z" fill={state.gateOpen?'#a5e5bc':'#ffe29a'} stroke="#243326" strokeWidth=".12"/>}
    {discovered(PILOT_EXIT)&&<rect x={PILOT_EXIT.x-.35} y={PILOT_EXIT.y-.4} width=".7" height=".8" fill={state.gateOpen?'#fff4b1':'#969f8b'} stroke="#243326" strokeWidth=".12"/>}
    {enemies.map(e=><path key={e.id} transform={`translate(${e.x} ${e.y})`} d="M0 -.5 .45 .35 -.45 .35Z" fill="#ffc16b" stroke="#362718" strokeWidth=".12"/>)}
    {dot(state.player,'#ff5057',3.4)}
    </g>
   </g>
  </svg>
 </aside>;
}
