import { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import ExplorationItemIcon from './ExplorationItemIcon';
import { combatAttack, combatMaxHp, COMBAT_ITEMS, type CombatItem, type CombatState } from '@/game/explorationCombat';
type Selection = CombatItem | 'broche';
type Filter = 'all' | 'materials' | 'supplies' | 'equipment';
export default function CombatInventory({game,onUse,onEquip}:{game:CombatState;onUse:(item:'erva'|'fruta')=>void;onEquip:()=>void}){
  const [selected,setSelected]=useState<Selection>('erva');
  const [filter,setFilter]=useState<Filter>('all');
  const items:Selection[]=filter==='equipment'?['broche']:filter==='materials'?['fibra','ambar']:filter==='supplies'?['erva','fruta']:['fibra','ambar','erva','fruta','broche'];
  const title=selected==='broche'?'Broche da Clareira':COMBAT_ITEMS[selected];
  const quantity=selected==='broche'?Number(game.equipmentOwned):game.stock[selected]+game.bag[selected];
  const consumable=selected==='erva'||selected==='fruta';
  const canUse=consumable&&quantity>0&&!game.completed&&(selected==='erva'?game.hp<combatMaxHp(game.xp):game.energy<100);
  function selectFilter(value:Filter){setFilter(value);setSelected(value==='equipment'?'broche':value==='materials'?'fibra':'erva');}
  return <div className="combat-backpack">
    <nav className="combat-inventory-tabs" aria-label="Categorias da mochila">{([['all','Tudo'],['materials','Materiais'],['supplies','Cuidados'],['equipment','Equipar']] as const).map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>selectFilter(value)}>{label}</button>)}</nav>
    <div className="combat-slot-grid" aria-label="Itens da mochila">{items.map(item=>{
      const count=item==='broche'?Number(game.equipmentOwned):game.stock[item]+game.bag[item];
      return <button className={`combat-inventory-slot ${selected===item?'is-selected':''} ${count===0?'is-empty-item':''}`} key={item} aria-pressed={selected===item} aria-label={`${item==='broche'?'Broche da Clareira':COMBAT_ITEMS[item]}, ${count}${item==='broche'&&game.equipmentOn?', equipado':''}`} onClick={()=>setSelected(item)}><ExplorationItemIcon item={item} size={44}/><small>{count}</small>{item==='broche'&&(game.equipmentOn?<ShieldCheck className="combat-equipped-mark" size={15}/>:!game.equipmentOwned?<LockKeyhole className="combat-equipped-mark" size={13}/>:null)}</button>;
    })}{Array.from({length:Math.max(0,12-items.length)},(_,i)=><div key={`empty-${i}`} className="combat-inventory-slot combat-vacant-slot" aria-hidden="true"/>)}</div>
    <section className="combat-item-detail" aria-label="Detalhes do item selecionado"><div><ExplorationItemIcon item={selected} size={37}/><span><strong>{title}</strong><small>{quantity} disponível(is){selected==='broche'&&game.equipmentOn?' · equipado':''}</small></span></div>
      <p>{selected==='broche'?'Equipamento permanente: +4 de ataque. Encontrado na exploração ou ao concluir a sala.':selected==='erva'?'Recupera até 35 HP. Só consome se houver vida para recuperar.':selected==='fruta'?'Recupera até 30 de energia. Só consome se houver energia para recuperar.':'Material de exploração. Coletado durante o percurso e guardado ao concluir a sala.'}</p>
      {selected!=='broche'&&<small>{game.stock[selected]} guardado(s) · {game.bag[selected]} na sala</small>}
      {consumable?<button className="combat-item-primary" disabled={!canUse} onClick={()=>onUse(selected as 'erva'|'fruta')}>Usar {selected==='erva'?'erva':'fruta'}</button>:selected==='broche'?<button className="combat-item-primary" disabled={!game.equipmentOwned} onClick={onEquip}>{game.equipmentOwned?game.equipmentOn?'Retirar broche':'Equipar broche':'Ainda não conquistado'}</button>:null}
    </section>
    <footer><span>Ataque <strong>{combatAttack(game)}</strong></span><small>Exploração pausada · cenário preservado</small></footer>
  </div>;
}
