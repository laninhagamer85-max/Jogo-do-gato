import LegendEquipmentPanel from './LegendEquipmentPanel';
import {GAME_ASSETS} from '@/game/assets';
import type {PetCharacterId} from '@/game/PetGame';
import {combatLevel,combatAttack,combatMaxHp,type CombatState,type CombatCard,type CombatPower} from '@/game/explorationCombat';
import {LEGENDS,eligibleLegend,readLegendProgress,type LegendGender,type LegendAction} from '@/game/explorationLegends';
import type {RoyalItem} from '@/game/explorationCastleQuest';
import type {RareItem} from '@/game/explorationCampaign';
type Props={game:CombatState;gender:LegendGender;onAction:(a:LegendAction)=>void;onRoyal?:(r:RoyalItem)=>void;onCard?:(c:CombatCard,slot?:0|1)=>void;onPower?:(p:CombatPower)=>void;onEquip:()=>void;onRare?:(r:RareItem)=>void;onLegends:()=>void};
export default function ExplorationEquipment({game,gender,onAction,onRoyal,onCard,onPower,onEquip,onRare,onLegends}:Props){
 const l=readLegendProgress(game.legends),id=l.active??eligibleLegend(gender),hero=LEGENDS.find(h=>h.id===id)!,active=Boolean(l.active&&l.unlocked.includes(id)&&hero.gender===gender),name=active?hero.name:'Seu pet';
 const actor=game.castleQuest?.actor??'',character=actor.startsWith('pet:')?actor.slice(4) as PetCharacterId:gender==='menina'?'menina-creme':'menino-preto';
 const image=GAME_ASSETS.characters[character]??GAME_ASSETS.kitten;
 return <section className="exp-legends legend-equipping" aria-label="Equipar personagem"><header className="legend-loadout-summary"><strong>{name} · Nv {combatLevel(game.xp)}</strong><small>Vida {Math.ceil(game.hp)}/{combatMaxHp(game.xp)} · Ataque {combatAttack(game)}</small><button onClick={onLegends}>{active?'Ver Lendários':'Escolher Lendário'}</button></header>
 <LegendEquipmentPanel key={actor||id} game={game} legendId={id} name={name} portrait={<img className="legend-pet-preview" src={image} alt="Seu pet"/>} canEquip={active} onAction={onAction} onRoyal={onRoyal} onCard={onCard} onPower={onPower} onEquip={onEquip} onRare={onRare}/></section>;
}
