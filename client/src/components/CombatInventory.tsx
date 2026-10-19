import {normalizeQuickItems,QUICK_ITEMS,type CombatQuickItem} from '@/game/explorationCombat';
import ExplorationLegends from './ExplorationLegends';
import type {LegendAction,LegendGender} from '@/game/explorationLegends';
import {RARE_ITEMS,type RareItem} from '@/game/explorationCampaign';
import { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import ExplorationItemIcon from './ExplorationItemIcon';
import { combatAttack, combatMaxHp, COMBAT_ITEMS, type CombatItem, COMBAT_CARDS,type CombatPower,type CombatCard,type CombatState } from '@/game/explorationCombat';
type Selection = CombatItem | RareItem | CombatCard | 'broche';
type Filter = 'quick' | 'legends' | 'all' | 'materials' | 'supplies' | 'equipment';
export default function CombatInventory({game,onQuick,onUse,onEquip,onRare,onCard,onPower,initialTab='all',gender='menino',onLegend}:{initialTab?:'all'|'legends';onQuick?:(slot:number,item:CombatQuickItem)=>void;gender?:LegendGender;onLegend?:(action:LegendAction)=>void;game:CombatState;onUse:(item:'erva'|'fruta')=>void;onEquip:()=>void;onRare?:(item:RareItem)=>void;onCard?:(card:CombatCard,slot?:0|1)=>void;onPower?:(power:CombatPower)=>void}){
  const [selected,setSelected]=useState<Selection>('erva');
  const [filter,setFilter]=useState<Filter>(initialTab);
  const items:Selection[]=filter==='equipment'?['broche','cristal','escama','roots','tide','amber']:filter==='materials'?['fibra','ambar']:filter==='supplies'?['erva','fruta','seiva','perola']:['fibra','ambar','seiva','cristal','perola','escama','erva','fruta','broche','roots','tide','amber'];
  const rare=(item:Selection):item is RareItem=>item==='seiva'||item==='cristal'||item==='perola'||item==='escama';
  const card=(item:Selection):item is CombatCard=>item==='roots'||item==='tide'||item==='amber';
  const countItem=(item:Selection)=>item==='broche'?Number(game.equipmentOwned):card(item)?Number(game.cards.includes(item)):rare(item)?game.rareStock[item]+game.rareBag[item]:game.stock[item]+game.bag[item];
  const title=selected==='broche'?'Broche da Clareira':card(selected)?COMBAT_CARDS[selected].name:rare(selected)?RARE_ITEMS[selected]:COMBAT_ITEMS[selected];
  const quantity=countItem(selected);
  const consumable=selected==='erva'||selected==='fruta';
  const canUse=consumable&&quantity>0&&!game.completed&&(selected==='erva'?game.hp<combatMaxHp(game.xp):game.energy<100);
  function selectFilter(value:Filter){setFilter(value);setSelected(value==='equipment'?'broche':value==='materials'?'fibra':'erva');}
  return <div className="combat-backpack">
    <nav className="combat-inventory-tabs" aria-label="Categorias da mochila">{([['all','Tudo'],['materials','Materiais'],['supplies','Cuidados'],['quick','Atalhos'],['equipment','Equipar'],['legends','Lendários']] as const).map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>selectFilter(value)}>{label}</button>)}</nav>
    {filter==='quick'?<section className="combat-quick-settings"><h3>Seus três atalhos rápidos</h3><p>Escolha os consumíveis que deseja usar durante a partida. Itens sem estoque ficam indisponíveis até serem coletados.</p>{normalizeQuickItems(game.quickItems).map((item,slot)=><label key={slot}><ExplorationItemIcon item={item} size={34}/><span>Atalho {slot+1}</span><select aria-label={`Item do atalho ${slot+1}`} value={item} onChange={e=>onQuick?.(slot,e.target.value as CombatQuickItem)}>{QUICK_ITEMS.map(option=><option key={option} value={option}>{option==='erva'||option==='fruta'?COMBAT_ITEMS[option]:RARE_ITEMS[option]} ({countItem(option)})</option>)}</select></label>)}</section>:filter==='legends'?<ExplorationLegends onCard={onCard} onPower={onPower} game={game} gender={gender} onAction={a=>onLegend?.(a)}/>:<>
    <div className="combat-slot-grid" aria-label="Itens da mochila">{items.map(item=>{
      const count=countItem(item);
      return <button className={`combat-inventory-slot ${selected===item?'is-selected':''} ${count===0?'is-empty-item':''}`} key={item} aria-pressed={selected===item} aria-label={`${item==='broche'?'Broche da Clareira':card(item)?COMBAT_CARDS[item].name:rare(item)?RARE_ITEMS[item]:COMBAT_ITEMS[item]}, ${count}${item==='broche'&&game.equipmentOn?', equipado':''}`} onClick={()=>setSelected(item)}><ExplorationItemIcon item={item} size={44}/><small>{count}</small>{item==='broche'&&(game.equipmentOn?<ShieldCheck className="combat-equipped-mark" size={15}/>:!game.equipmentOwned?<LockKeyhole className="combat-equipped-mark" size={13}/>:null)}</button>;
    })}{Array.from({length:Math.max(0,12-items.length)},(_,i)=><div key={`empty-${i}`} className="combat-inventory-slot combat-vacant-slot" aria-hidden="true"/>)}</div>
    <section className="combat-item-detail" aria-label="Detalhes do item selecionado"><div><ExplorationItemIcon item={selected} size={37}/><span><strong>{title}</strong><small>{quantity} disponível(is){selected==='broche'&&game.equipmentOn?' · equipado':''}</small></span></div>
      <p>{selected==='broche'?'Equipamento permanente: +4 de ataque. Encontrado na exploração ou ao concluir a sala.':selected==='erva'?'Recupera até 35 HP. Só consome se houver vida para recuperar.':selected==='fruta'?'Recupera até 30 de energia. Só consome se houver energia para recuperar.':card(selected)?COMBAT_CARDS[selected].description:rare(selected)?selected==='seiva'?'Cura até 60 HP. Consome uma seiva.':selected==='perola'?'Cura até 90 HP. Consome uma pérola.':selected==='cristal'?'Equipamento raro: +6 de ataque. Pode equipar ou retirar.':'Equipamento raro: reduz dano de ataques comuns em 4. Pode equipar ou retirar.':'Material de exploração. Coletado durante o percurso e guardado ao concluir a sala.'}</p>
      {selected!=='broche'&&!card(selected)&&<small>{rare(selected)?game.rareStock[selected]:game.stock[selected]} guardado(s) · {rare(selected)?game.rareBag[selected]:game.bag[selected]} na sala</small>}
      {card(selected)?<button className="combat-item-primary" disabled={!quantity} onClick={()=>onCard?.(selected,game.secondaryCard===selected?1:0)}>{(game.activeCard===selected||game.secondaryCard===selected)?'Retirar carta':'Equipar carta'}</button>:rare(selected)?<button className="combat-item-primary" disabled={!quantity||((selected==='seiva'||selected==='perola')&&game.hp>=combatMaxHp(game.xp))} onClick={()=>onRare?.(selected)}>{selected==='seiva'||selected==='perola'?'Usar para curar':game.rareEquipped===selected?'Retirar equipamento':'Equipar'}</button>:consumable?<button className="combat-item-primary" disabled={!canUse} onClick={()=>onUse(selected as 'erva'|'fruta')}>Usar {selected==='erva'?'erva':'fruta'}</button>:selected==='broche'?<button className="combat-item-primary" disabled={!game.equipmentOwned} onClick={onEquip}>{game.equipmentOwned?game.equipmentOn?'Retirar broche':'Equipar broche':'Ainda não conquistado'}</button>:null}
    </section>
    </>}<footer><span>Ataque <strong>{combatAttack(game)}</strong></span><small>Exploração pausada · cenário preservado</small></footer>
  </div>;
}
