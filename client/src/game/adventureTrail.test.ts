import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect,vi} from 'vitest';
import AdventureTrailMap from '../components/AdventureTrailMap';
import ExplorationCampaignMap from '../components/ExplorationCampaignMap';
import {createInitialGameState} from './PetGame';
import {createCombatState} from './explorationCombat';
import {getPlatformStage} from './platformerLevels';
vi.stubGlobal('React',React);
it('shows 100 continuous stages with the real reward for each and ten existing companions',()=>{const s=createInitialGameState(),before=JSON.stringify(s),html=renderToStaticMarkup(React.createElement(AdventureTrailMap,{state:s,onPlay:()=>{}}));expect(html.match(/class="trail-room-node /g)).toHaveLength(100);for(let id=1;id<=100;id++){expect(html).toContain(`Fase ${id},`);expect(html).toContain(getPlatformStage(id)!.reward.name);}expect(html.match(/class="adv-world-friend"/g)).toHaveLength(10);expect(html).toContain('Fase 11,');expect(html).toContain('adv-illustrated-art');expect(html).not.toContain('path-stone-v1.webp');expect(html).not.toContain('feTurbulence');expect(html).toContain('adv-illustrated-viewport');expect(html).not.toContain('class="trail-route"');expect(html).toContain('is-vertical');expect(html).toContain('Fase 100,');expect(html).toContain('Bloqueada. Ver prêmio');expect(JSON.stringify(s)).toBe(before);});
it('preserves saved stage and stars at the world boundary',()=>{const s=createInitialGameState();s.platformProgress.unlockedStage=11;s.platformProgress.completedStages=Array.from({length:10},(_,i)=>i+1);s.platformProgress.starsByStage={'10':3};const html=renderToStaticMarkup(React.createElement(AdventureTrailMap,{state:s,onPlay:()=>{}}));expect(html).toContain('Mundo 2 · Fase 11/100');expect(html).toContain('10/100 concluídas');expect(html).toContain('aria-pressed="true"');expect(html).toContain('Voltar ao meu progresso na Aventura');expect(html).toContain('is-earned');});
it('offers replay after the hundredth stage without stage 101',()=>{const s=createInitialGameState();s.platformProgress.unlockedStage=100;s.platformProgress.completedStages=Array.from({length:100},(_,i)=>i+1);const html=renderToStaticMarkup(React.createElement(AdventureTrailMap,{state:s,onPlay:()=>{}}));expect(html).toContain('Aventura concluída');expect(html).toContain('Jogar novamente');expect(html).not.toContain('Fase 101');});
it('keeps Exploration numbering continuous across chapter 2',()=>{const s=createCombatState(10);s.completedRooms=Array.from({length:10},(_,i)=>i);const html=renderToStaticMarkup(React.createElement(ExplorationCampaignMap,{state:s,onContinue:()=>{},onReplay:()=>{}}));expect(html).toContain('Capítulo 2 · Sala 11/32');expect(html).toContain('Capítulo 2, sala 11,');expect(html).toContain('Capítulo 2, sala 20,');expect(html).not.toContain('Capítulo 2, sala 1,');});

it('composes Adventure from its own ten worlds and actual phase rewards',async()=>{const {GAME_ASSETS}=await import('./assets');const s=createInitialGameState();s.platformProgress.unlockedStage=52;const html=renderToStaticMarkup(React.createElement(AdventureTrailMap,{state:s,onPlay:()=>{}}));expect(html).toContain('Mundo 6 · Fase 52/100');expect(html).toContain('adventure-worlds-portrait-v2.webp');expect(html).not.toContain('/forest-adventure/');expect(html).not.toContain('trail-painted-junction');expect(html).toContain('Mesinha de Toco');});

// Both orientations use the same real room, material and phase coordinates.
it('composes every Adventure world in portrait and landscape without Exploration art or repeated room plates',async()=>{
 const {default:Scenery,ADVENTURE_MATERIALS}=await import('../components/AdventureWorldScenery');
 const {explorationTrailLayout}=await import('./explorationTrail');const {GAME_ASSETS}=await import('./assets');
 expect(new Set(ADVENTURE_MATERIALS.map(t=>t.id)).size).toBe(10);
 for(const vertical of [true,false]){
  const layout=explorationTrailLayout(vertical?390:844,vertical?570:224,100,vertical,'adventure');const before=JSON.stringify(layout);
  for(let chapter=0;chapter<10;chapter++){
   const html=renderToStaticMarkup(React.createElement(Scenery,{layout,chapter,locked:chapter>0,active:true}));
   expect(html).toContain(`adv-world-${ADVENTURE_MATERIALS[chapter].id}`);
   expect(html.match(/<img /g)).toHaveLength(1);expect(html).toContain(GAME_ASSETS.levels[chapter]);
   expect(html).toContain(vertical?'is-vertical':'is-horizontal');expect(html).not.toContain('<ellipse');expect(html).toContain('adv-route-line');
   expect(html).not.toContain('/forest-adventure/');expect(html).not.toContain('legacy-scene');
  }
  expect(JSON.stringify(layout)).toBe(before);
 }
});

it('uses one shared backdrop with ordered world colors in both orientations',async()=>{
 const {AdventureWorldBackdrop}=await import('../components/AdventureWorldScenery');
 const {explorationTrailLayout}=await import('./explorationTrail');const {PLATFORM_PALETTES}=await import('./platformerLevels');
 for(const vertical of [true,false]){
  const l=explorationTrailLayout(vertical?390:844,vertical?570:224,100,vertical,'adventure');
  const html=renderToStaticMarkup(React.createElement(AdventureWorldBackdrop,{layout:l,locked:()=>false}));
  const colors=Array.from(html.matchAll(/stop-color="([^"]+)"/g),m=>m[1]);
  expect(colors).toEqual((vertical?[...PLATFORM_PALETTES].reverse():PLATFORM_PALETTES).map(p=>p.skyBottom));
  expect(html.match(/<rect /g)).toHaveLength(1);expect(html).not.toContain('mask');
 }
});
