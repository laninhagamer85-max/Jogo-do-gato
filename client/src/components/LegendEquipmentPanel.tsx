import {createPortal} from 'react-dom';
import {TierItemArt} from './ExplorationWorkshop';
import {equipmentTier,tierWeaponStats} from '@/game/explorationEquipmentTiers';
import {ROYAL_NAMES,royalActive,type RoyalItem} from '@/game/explorationCastleQuest';
import {RoyalItemArt,royalItemDescription} from './ExplorationRoyalInventory';
import {RARE_ITEMS,type RareItem} from '@/game/explorationCampaign';
import PowerSymbol from './PowerSymbol';
import {useEffect,useRef,useState,type ReactNode,type PointerEvent} from 'react';
import {COMBAT_CARDS,COMBAT_POWERS,type CombatCard,type CombatPower,type CombatState} from '@/game/explorationCombat';
import {LEGEND_WEAPONS,readLegendProgress,type LegendId,type LegendWeapon,type LegendAction} from '@/game/explorationLegends';
import ExplorationItemIcon from './ExplorationItemIcon';
import {WeaponPortrait} from './ExplorationLegends';
import LegendCharacterPreview,{LEGEND_VIEWS} from './LegendCharacterPreview';
import {X} from 'lucide-react';
import './LegendEquipmentPanel.css';
type Item={kind:'weapon';id:LegendWeapon}|{kind:'card';id:CombatCard}|{kind:'power';id:CombatPower}|{kind:'royal';id:RoyalItem}|{kind:'charm';id:'broche'|'cristal'|'escama'};
type Target='hero'|'weapon'|'card0'|'card1'|'power'|'axe'|'pickaxe'|'charm';
const royalTarget:Record<RoyalItem,Target>={sword:'weapon',axe:'axe',pickaxe:'pickaxe',card:'card0',equipmentCard:'card1',power:'power'};
type Props={legendId:LegendId;game:CombatState;name:string;portrait:ReactNode;canEquip:boolean;onAction:(a:LegendAction)=>void;onCard?:(c:CombatCard,slot?:0|1)=>void;onPower?:(p:CombatPower)=>void;onRoyal?:(r:RoyalItem)=>void;onEquip?:()=>void;onRare?:(r:RareItem)=>void};
export default function LegendEquipmentPanel({game,name,portrait,legendId,canEquip,onAction,onCard,onPower,onRoyal,onEquip,onRare}:Props){
 const l=readLegendProgress(game.legends),claim=game.castleQuest?.claims[game.castleQuest.actor];
 const [chosen,setChosen]=useState<Item|null>(null),[notice,setNotice]=useState(''),[expanded,setExpanded]=useState(false),[ghost,setGhost]=useState<{item:Item;x:number;y:number}|null>(null),[target,setTarget]=useState<string|null>(null);
 const [direction,setDirection]=useState(0),[demo,setDemo]=useState(0);
 const rotate=(delta:number)=>setDirection(v=>(v+delta+80)%8);
 const dragPosition=useRef<{x:number;y:number}|null>(null);
 const drag=useRef<{item:Item;x:number;y:number;moving:boolean;pointer:number}|null>(null),suppressClick=useRef(false),root=useRef<HTMLDivElement>(null);
 const royalOwned=(id:RoyalItem)=>id==='equipmentCard'?Boolean(claim?.equipmentCards):Boolean(claim?.issued);
 const items:Item[]=[...(Object.keys(ROYAL_NAMES) as RoyalItem[]).filter(royalOwned).map(id=>({kind:'royal' as const,id})),...l.weapons.map(id=>({kind:'weapon' as const,id})),...game.cards.map(id=>({kind:'card' as const,id})),{kind:'power',id:'burst'},...game.cards.map(id=>({kind:'power' as const,id})),...(game.equipmentOwned?[{kind:'charm' as const,id:'broche' as const}]:[]),...(['cristal','escama'] as const).filter(id=>game.rareStock[id]+game.rareBag[id]>0).map(id=>({kind:'charm' as const,id}))];
 const title=(i:Item)=>i.kind==='royal'?ROYAL_NAMES[i.id]:i.kind==='charm'?i.id==='broche'?'Broche da Clareira':RARE_ITEMS[i.id]:i.kind==='weapon'?`${LEGEND_WEAPONS[i.id].name}${game.workshop?.equipmentTiers[i.id]?' · '+equipmentTier(game.workshop.equipmentTiers[i.id])?.name:''}`:i.kind==='card'?COMBAT_CARDS[i.id].name:COMBAT_POWERS[i.id].name;
 const art=(i:Item)=>i.kind==='royal'?<RoyalItemArt item={i.id} size={42}/>:i.kind==='charm'?<ExplorationItemIcon item={i.id} size={35}/>:i.kind==='weapon'?game.workshop?.equipmentTiers[i.id]?<TierItemArt kind={i.id} tier={game.workshop.equipmentTiers[i.id]!} size={44}/>:<WeaponPortrait weapon={i.id}/>:i.kind==='card'?<ExplorationItemIcon item={i.id} size={35}/>:<PowerSymbol power={i.id}/>;
 const equipped=(i:Item)=>i.kind==='royal'?royalActive(game,i.id):i.kind==='charm'?i.id==='broche'?game.equipmentOn:game.rareEquipped===i.id:i.kind==='weapon'?l.weapon===i.id&&!(i.id==='sword'&&royalActive(game,'sword')):i.kind==='card'?game.activeCard===i.id||game.secondaryCard===i.id:!royalActive(game,'power')&&(game.activePower??'burst')===i.id;
 const destination=(i:Item):Target=>i.kind==='royal'?royalTarget[i.id]:i.kind==='charm'?'charm':i.kind==='weapon'?'weapon':i.kind==='power'?'power':'card0';
 function apply(i:Item,t:Target){
  setChosen(i);
  if(game.completed){setNotice('Entre em uma sala ativa para trocar os equipamentos.');return;}
  if(i.kind==='weapon'&&!canEquip){setNotice('Ative um Lendário compatível na aba Lendários para usar esta arma.');return;}
  if(t!=='hero'&&(i.kind==='card'?!['card0','card1'].includes(t):t!==destination(i))){setNotice('Este espaço não aceita esse tipo de item. Arraste para o personagem ou para um espaço compatível.');return;}
  if(i.kind==='royal'){
   if(!royalOwned(i.id)){setNotice('Este Tesouro Real ainda não foi conquistado por este personagem.');return;}
   if(!royalActive(game,i.id))onRoyal?.(i.id);
  }else if(i.kind==='charm'){
   if(i.id==='broche'){if(!game.equipmentOwned){setNotice('Broche ainda não conquistado.');return;}if(!game.equipmentOn)onEquip?.();}
   else if(game.rareStock[i.id]+game.rareBag[i.id]<1)setNotice('Este item ainda não está disponível.');else if(game.rareEquipped!==i.id)onRare?.(i.id);
  }else if(i.kind==='weapon'){
   if(!l.weapons.includes(i.id)){setNotice('Fabrique esta arma na Oficina antes de equipar.');return;}
   if(l.weapon!==i.id||royalActive(game,'sword'))onAction({type:'equip',weapon:i.id});
  }else if(i.kind==='card'){
   if(!game.cards.includes(i.id)){setNotice('Derrote o mestre do capítulo para conquistar esta carta.');return;}
   const slot=t==='card1'?1:t==='card0'?0:game.activeCard===i.id?0:game.secondaryCard===i.id?1:!game.activeCard&&!royalActive(game,'card')?0:!game.secondaryCard&&!royalActive(game,'equipmentCard')?1:null;
   if(slot===null){setNotice('Os dois espaços estão ocupados. Solte a carta sobre o espaço que deseja substituir ou escolha Carta 1 ou Carta 2 nos detalhes.');return;}
   if((slot===0?game.activeCard:game.secondaryCard)!==i.id)onCard?.(i.id,slot);
  }else{
   if(i.id!=='burst'&&!game.cards.includes(i.id)){setNotice('Conquiste a carta correspondente para liberar este poder.');return;}
   if(!equipped(i))onPower?.(i.id);
  }
 }
 function remove(i:Item){
  if(game.completed){setNotice('Entre em uma sala ativa para trocar os equipamentos.');return;}
  if(i.kind==='royal'){if(royalActive(game,i.id))onRoyal?.(i.id);}
  else if(i.kind==='charm'){if(i.id==='broche'){if(game.equipmentOn)onEquip?.();}else if(game.rareEquipped===i.id)onRare?.(i.id);}
  else if(i.kind==='weapon'){if(!canEquip){setNotice('Ative este Lendário para alterar a arma.');return;}onAction({type:'equip',weapon:null});}
  else if(i.kind==='card')onCard?.(i.id,game.secondaryCard===i.id?1:0);
  else if(i.id!=='burst')onPower?.('burst');
 }
 function hit(x:number,y:number){const el=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-equip-target]');return el&&root.current?.contains(el)?el.dataset.equipTarget as Target:null;}
 function start(e:PointerEvent<HTMLButtonElement>,i:Item){if(e.button!==0)return;drag.current={item:i,x:e.clientX,y:e.clientY,moving:false,pointer:e.pointerId};suppressClick.current=false;e.currentTarget.setPointerCapture(e.pointerId);}
 useEffect(()=>{if(!ghost)return;let raf=0;const scroll=()=>{const p=dragPosition.current,panel=root.current?.closest<HTMLElement>('.combat-dialog');if(p&&panel){const r=panel.getBoundingClientRect(),dy=p.y<r.top+48?-12:p.y>r.bottom-48?12:0;if(dy){panel.scrollTop+=dy;setTarget(hit(p.x,p.y));}}raf=requestAnimationFrame(scroll);};raf=requestAnimationFrame(scroll);return()=>cancelAnimationFrame(raf);},[Boolean(ghost)]);
 function move(e:PointerEvent<HTMLButtonElement>){const d=drag.current;if(!d||d.pointer!==e.pointerId)return;if(!d.moving&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<8)return;d.moving=true;dragPosition.current={x:e.clientX,y:e.clientY};setGhost({item:d.item,x:e.clientX,y:e.clientY});setTarget(hit(e.clientX,e.clientY));}
 function end(e:PointerEvent<HTMLButtonElement>,cancel=false){const d=drag.current;if(!d)return;drag.current=null;dragPosition.current=null;setGhost(null);setTarget(null);suppressClick.current=d.moving;if(!cancel&&d.moving){const t=hit(e.clientX,e.clientY);if(t)apply(d.item,t);else setNotice('Solte sobre o personagem ou em um espaço de equipamento compatível.');}}
 function inventory(i:Item){return <button key={`${i.kind}:${i.id}`} className={`legend-bag-item ${equipped(i)?'is-equipped':''}`} aria-label={`${title(i)}${equipped(i)?', equipado':''}. Arraste ou toque para selecionar`} onDragStart={e=>e.preventDefault()} onLostPointerCapture={e=>end(e,true)} onPointerDown={e=>start(e,i)} onPointerMove={move} onPointerUp={e=>end(e)} onPointerCancel={e=>end(e,true)} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return;}setChosen(i);}}>{art(i)}<small>{title(i)}</small>{equipped(i)&&<span className="legend-equipped-dot" aria-label="Equipado"/>}</button>;}
 function slot(t:Target,label:string,i:Item|null){return <button data-equip-target={t} className={`legend-equipment-slot ${target===t?'is-drop-target':''}`} aria-label={`${label}: ${i?title(i):'vazio'}. Toque para ver detalhes ou solte um item`} onClick={()=>i?setChosen(i):chosen&&apply(chosen,t)}><small>{label}</small>{i?art(i):<span className="legend-empty-slot">+</span>}<span>{i?title(i):'Vazio'}</span></button>;}
 const description=(i:Item)=>i.kind==='royal'?royalItemDescription(i.id):i.kind==='charm'?i.id==='broche'?'+4 de ataque. Equipamento permanente.':i.id==='cristal'?'+6 de ataque. Pode equipar ou retirar.':'Reduz dano comum em 4. Pode equipar ou retirar.':i.kind==='weapon'?`${LEGEND_WEAPONS[i.id].description} ${game.workshop?.equipmentTiers[i.id]?'Bônus atual: +'+tierWeaponStats(LEGEND_WEAPONS[i.id],game.workshop.equipmentTiers[i.id]!).bonus+' de ataque.':''}`:i.kind==='card'?COMBAT_CARDS[i.id].description:COMBAT_POWERS[i.id].description;
 const royal=(id:RoyalItem):Item|null=>royalActive(game,id)?{kind:'royal',id}:null;
 const worn=items.filter(equipped),available=items.filter(i=>!equipped(i));
 return <div ref={root} className="legend-rpg-panel">
  <section className="legend-paperdoll" aria-label={`Equipamentos de ${name}`}>
   <div className="legend-slots-left">{slot('weapon','Arma',royal('sword')??(l.weapon?{kind:'weapon',id:l.weapon}:null))}{slot('card0','Carta rara 1',royal('card')??(game.activeCard?{kind:'card',id:game.activeCard}:null))}{slot('axe','Machado especial',royal('axe'))}</div>
   <div className={`legend-paperdoll-hero ${target==='hero'?'is-drop-target':''}`} data-equip-target="hero" role="group" aria-label={`Soltar equipamento em ${name}`}>
    {canEquip?<LegendCharacterPreview royalQuest={game.castleQuest} equipmentTiers={game.workshop?.equipmentTiers} id={legendId} weapon={l.weapon} direction={direction} demo={demo} onRotate={rotate}/>:portrait}<strong>{name}</strong><small>Solte um item no personagem</small><div className="legend-charm-slot">{slot('charm','Acessório',game.rareEquipped?{kind:'charm',id:game.rareEquipped as 'cristal'|'escama'}:game.equipmentOn?{kind:'charm',id:'broche'}:null)}</div>
   </div>
   <div className="legend-slots-right">{slot('power','Poder',royal('power')??{kind:'power',id:game.activePower??'burst'})}{slot('card1','Carta rara 2',royal('equipmentCard')??(game.secondaryCard?{kind:'card',id:game.secondaryCard}:null))}{slot('pickaxe','Picareta especial',royal('pickaxe'))}</div>
   {canEquip&&<div className="legend-preview-tools" aria-label="Controles da prévia"><button aria-label="Girar personagem para a esquerda" onClick={()=>rotate(-1)}>↶</button><small aria-live="polite">{LEGEND_VIEWS[direction]}</small><button aria-label="Girar personagem para a direita" onClick={()=>rotate(1)}>↷</button><button className="legend-demo-attack" onClick={()=>setDemo(v=>v+1)}>Demonstrar {l.weapon==='bow'?'disparo':'golpe'}</button></div>}
  </section>
  <section className="legend-items-bag" aria-label="Mochila de equipamentos"><h3>Itens equipados</h3><div className="legend-bag-grid">{worn.map(inventory)}</div><h3>Itens disponíveis</h3><p>Toque para ver Equipar ou Retirar. Arraste para o personagem ou para o espaço desejado.</p><div className="legend-bag-grid">{(expanded?available:available.slice(0,6)).map(inventory)}</div>{available.length>6&&<button className="legend-bag-expand" onClick={()=>setExpanded(v=>!v)}>{expanded?'Recolher itens':`Ver todos (${available.length})`}</button>}</section>
  {chosen&&<section className="legend-selected-item" aria-label="Detalhes do equipamento selecionado"><div>{art(chosen)}<strong>{title(chosen)}</strong></div><p>{description(chosen)}</p>{equipped(chosen)?<button disabled={chosen.kind==='power'&&chosen.id==='burst'} onClick={()=>remove(chosen)}>{chosen.kind==='power'?chosen.id==='burst'?'Poder básico ativo':'Retirar · usar poder básico':'Retirar'}</button>:<button onClick={()=>apply(chosen,'hero')}>Equipar</button>}{chosen.kind==='card'&&!equipped(chosen)&&<div className="legend-card-actions"><button onClick={()=>apply(chosen,'card0')}>Equipar na carta 1</button><button onClick={()=>apply(chosen,'card1')}>Equipar na carta 2</button></div>}</section>}
  {notice&&<div className="legend-notice-backdrop"><div className="legend-equip-notice" role="dialog" aria-modal="true" aria-label="Não foi possível equipar" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setNotice('');}if(e.key==='Tab'){e.preventDefault();e.currentTarget.querySelector('button')?.focus();}}}><h3>Não foi possível equipar</h3><p>{notice}</p><button autoFocus onClick={()=>setNotice('')}><X size={16}/>Entendi</button></div></div>}
  {ghost&&createPortal(<div className="legend-drag-ghost" style={{left:ghost.x,top:ghost.y}} aria-hidden="true">{art(ghost.item)}</div>,document.body)}
 </div>;
}
