import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect,vi} from 'vitest';
vi.stubGlobal('React',React);
import {createCombatState,combatSnapshot} from './explorationCombat';
import {EXPLORATION_ROOMS} from './explorationCampaign';
import {drawCombatPilot} from './explorationCombatView';
import ExplorationCombatPilot from '../components/ExplorationCombatPilot';
import CombatInventory from '../components/CombatInventory';
it.each(EXPLORATION_ROOMS)('room $index: UI, minimap and live-NPC renderer use the active room',room=>{
 const s=createCombatState(room.index,42);s.completedRooms=Array.from({length:room.index},(_,i)=>i);
 const markup=renderToStaticMarkup(React.createElement(ExplorationCombatPilot,{soundOn:false,onToggleSound:()=>{},profile:null,progress:combatSnapshot(s),onSave:()=>{},onBack:()=>{}}));
 expect(markup).toContain(`SALA ${room.index+1}/10`);expect(markup).toContain(room.title.toUpperCase());
 const labels:string[]=[],ctx=new Proxy({measureText:()=>({width:40}),fillText:(text:string)=>labels.push(text),createRadialGradient:()=>({addColorStop:()=>{}}),createLinearGradient:()=>({addColorStop:()=>{}})},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}}) as unknown as CanvasRenderingContext2D;
 const unloaded={complete:false,naturalWidth:0} as HTMLImageElement;
 drawCombatPilot(ctx,390,844,s,unloaded,unloaded,unloaded,1,false,true);
 for(const enemy of s.enemies)expect(labels.some(text=>text.includes(enemy.id.startsWith('wild-')?'Nv':enemy.id.startsWith('beetle')?'Besouro':'Lagarta'))).toBe(true);
});
it('shows rare collection slots and quantities from the same raster atlas in the backpack',()=>{
 const s=createCombatState();s.rareStock.seiva=3;s.rareBag.cristal=1;
 const markup=renderToStaticMarkup(React.createElement(CombatInventory,{game:s,onUse:()=>{},onEquip:()=>{}}));
 expect(markup).toContain('Seiva luminosa, 3');expect(markup).toContain('Cristal do bosque, 1');expect(markup).toContain('/forest-adventure/forest-rare-items-v1.webp');
});
