import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect,vi} from 'vitest';
vi.stubGlobal('React',React);
import {createCombatState,combatSnapshot} from './explorationCombat';
import {EXPLORATION_ROOMS} from './explorationCampaign';
import {combatView,drawCombatPilot} from './explorationCombatView';
import ExplorationCombatPilot from '../components/ExplorationCombatPilot';
import CombatInventory from '../components/CombatInventory';
it.each(EXPLORATION_ROOMS)('room $index: UI, minimap and live-NPC renderer use the active room',room=>{
 const s=createCombatState(room.index,42);s.completedRooms=Array.from({length:room.index},(_,i)=>i);
 const markup=renderToStaticMarkup(React.createElement(ExplorationCombatPilot,{soundOn:false,onToggleSound:()=>{},profile:null,progress:combatSnapshot(s),onSave:()=>{},onBack:()=>{}}));
 expect(markup).toContain(`SALA ${room.index+1}/${EXPLORATION_ROOMS.length}`);expect(markup).toContain(room.title.toUpperCase());
 const labels:string[]=[],ctx=new Proxy({measureText:()=>({width:40}),fillText:(text:string)=>labels.push(text),createRadialGradient:()=>({addColorStop:()=>{}}),createLinearGradient:()=>({addColorStop:()=>{}})},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}}) as unknown as CanvasRenderingContext2D;
 const unloaded={complete:false,naturalWidth:0} as HTMLImageElement;
 drawCombatPilot(ctx,390,844,s,unloaded,unloaded,unloaded,1,false,true);
 const v=combatView(390,844,s.player);const visible=s.enemies.filter(e=>{const x=v.left+e.x*v.tile,y=v.top+e.y*v.tile;return x>=-v.tile*3&&x<=390+v.tile*3&&y>=-v.tile*3&&y<=844+v.tile*3;});expect(labels.filter(t=>t.includes(' · Nv '))).toHaveLength(visible.length);
});
it('shows rare collection slots and quantities from the same raster atlas in the backpack',()=>{
 const s=createCombatState();s.rareStock.seiva=3;s.rareBag.cristal=1;
 const markup=renderToStaticMarkup(React.createElement(CombatInventory,{game:s,onUse:()=>{},onEquip:()=>{}}));
 expect(markup).toContain('Seiva luminosa, 3');expect(markup).toContain('Cristal do bosque, 1');expect(markup).toContain('/forest-adventure/forest-rare-items-v1.webp');
});

it('completed rooms show automatic portal feedback without replay or advancement choices',()=>{
 const s=createCombatState(9,42);s.completedRooms=Array.from({length:10},(_,i)=>i);s.completed=true;s.cards=['roots'];s.activeCard='roots';
 const markup=renderToStaticMarkup(React.createElement(ExplorationCombatPilot,{soundOn:false,onToggleSound:()=>{},profile:null,progress:combatSnapshot(s),onSave:()=>{},onBack:()=>{}}));expect(markup).toContain('Atravessando o portal');expect(markup).toContain('Riacho dos Cristais');expect(markup).not.toContain('Repetir esta sala');expect(markup).not.toContain('Avançar para sala');
});
it('river artwork and painted water are actually sent to the world renderer',()=>{
 const s=createCombatState(19,42),draws:unknown[][]=[];
 const ctx=new Proxy({measureText:()=>({width:40}),createRadialGradient:()=>({addColorStop:()=>{}}),createLinearGradient:()=>({addColorStop:()=>{}}),drawImage:(...args:unknown[])=>draws.push(args)},{get:(o,k)=>k in o?o[k as keyof typeof o]:()=>{}}) as unknown as CanvasRenderingContext2D;
 const empty={complete:false,naturalWidth:0} as HTMLImageElement;
 const image=(id:string,w=1448,h=1086)=>({id,complete:true,naturalWidth:w,naturalHeight:h}) as unknown as HTMLImageElement;
 const mobs=image('river-mobs'),props=image('river-props',1536,1024),portal=image('river-portal',1374,1145),water=image('water',1536,1024);
 drawCombatPilot(ctx,390,844,s,empty,empty,empty,1,false,true,empty,empty,{},empty,empty,empty,empty,empty,empty,empty,mobs,props,portal,water);
 for(const asset of [mobs,props,portal,water])expect(draws.some(d=>d[0]===asset)).toBe(true);
});
