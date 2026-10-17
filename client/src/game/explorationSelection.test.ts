import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect,vi} from 'vitest';
import ExplorationCampaignMap from '../components/ExplorationCampaignMap';
import {explorationRoomStatus,startExplorationReplay,saveExplorationReplay} from './explorationSelection';
import {createCombatState,combatSnapshot,readCombatState,stepCombat,advanceCombatRoom} from './explorationCombat';
import {campaignRoom} from './explorationCampaign';
vi.stubGlobal('React',React);
const fixture=()=>{const s=createCombatState(7,42);s.completedRooms=[0,1,2,3,4,5,6];s.claimedRooms=[...s.completedRooms];s.xp=1600;s.hp=151;s.player={x:3.5,y:6.5};s.roomCollectedFibers=5;s.switchStep=1;s.stock.erva=3;s.bag.ambar=2;s.time=9000;return s;};
const read=(s:ReturnType<typeof createCombatState>)=>{const r=readCombatState(combatSnapshot(s));if(!r.supported)throw Error();return r.state;};
it('shows previous rooms, the current room and all remaining locked rooms',()=>{
 const s=fixture();expect(explorationRoomStatus(s,3)).toBe('completed');expect(explorationRoomStatus(s,7)).toBe('current');expect(explorationRoomStatus(s,8)).toBe('locked');expect(explorationRoomStatus(s,10)).toBe('locked');
 const html=renderToStaticMarkup(React.createElement(ExplorationCampaignMap,{state:s,onContinue:()=>{},onReplay:()=>{}}));expect(html).toContain('7/20 salas concluídas');expect(html).toContain('Capítulo 1 · Sala 8/20');expect(html).toContain('trail-river-v1.webp');expect(html).toContain('forest-mobs-v1.webp');expect(html).toContain('river-mobs-v1.webp');expect(html).toContain('trail-scenery is-locked');expect(html).toContain('Voltar ao meu progresso');expect(html).toContain('Jogar novamente');expect(html.match(/disabled=""/g)).toHaveLength(12);
});
it('completed legacy rooms expose their next room before its automatic portal resumes',()=>{
 const s=createCombatState();s.completed=true;s.completedRooms=[0];expect(explorationRoomStatus(s,0)).toBe('completed');expect(explorationRoomStatus(s,1)).toBe('current');
});
it('all twenty finished rooms can be replayed and no false next room is offered',()=>{
 const s=createCombatState(19);s.completed=true;s.completedRooms=Array.from({length:20},(_,i)=>i);const html=renderToStaticMarkup(React.createElement(ExplorationCampaignMap,{state:s,onContinue:()=>{},onReplay:()=>{}}));expect(html).toContain('Expedição concluída');expect(html).not.toContain('Continuar de onde parou');expect(html).not.toContain('disabled=""');
});
it('rejects locked and invalid replay targets',()=>{const s=fixture();for(const index of [-1,7,8,10,20,100])expect(startExplorationReplay(s,index)).toBeNull();});
it('starting a replay preserves the original checkpoint, XP and earned inventory without completion rewards',()=>{
 const s=fixture(),before=JSON.stringify(s),replay=startExplorationReplay(s,3)!;expect(JSON.stringify(s)).toBe(before);expect(replay.roomIndex).toBe(3);expect(replay.player).toEqual(campaignRoom(3).camp);expect(replay.xp).toBe(s.xp);expect(replay.stock).toEqual(s.stock);expect(replay.bag.ambar).toBe(0);expect(replay.completionRewardClaimed).toBe(true);expect(replay.completed).toBe(false);
});
it('saves a partial replay and resumes its exact room-local state after leaving and reloading',()=>{
 const base=fixture();let attempt=startExplorationReplay(base,3)!;attempt.player={x:2.5,y:6.5};attempt.bag.fibra=4;attempt.roomCollectedFibers=4;attempt.revision+=10;
 const saved=read(saveExplorationReplay(base,combatSnapshot(attempt)));expect(saved.roomIndex).toBe(7);expect(saved.player).toEqual(base.player);expect(saved.hp).toBe(base.hp);expect(saved.bag).toEqual(base.bag);expect(saved.roomCollectedFibers).toBe(5);expect(saved.stock).toEqual(base.stock);
 const resumed=startExplorationReplay(saved,3)!;expect(resumed.player).toEqual(attempt.player);expect(resumed.bag.fibra).toBe(4);expect(resumed.roomCollectedFibers).toBe(4);expect(resumed.completed).toBe(false);
});
it('banks replay loot once, keeps the main room untouched, and starts a fresh repeat after completion',()=>{
 const base=fixture();let attempt=startExplorationReplay(base,3)!;attempt.gateOpen=true;attempt.player={...campaignRoom(3).exit};attempt.bag.fibra=5;attempt=stepCombat(attempt,{},0);expect(attempt.completed).toBe(true);
 const saved=saveExplorationReplay(base,combatSnapshot(attempt));expect(saved.stock.fibra).toBe(base.stock.fibra+5);expect(saved.roomIndex).toBe(7);expect(saved.completedRooms).toEqual(base.completedRooms);expect(saved.claimedRooms).toEqual(base.claimedRooms);expect(saveExplorationReplay(saved,combatSnapshot(attempt))).toBe(saved);
 const fresh=startExplorationReplay(read(saved),3)!;expect(fresh.bag.fibra).toBe(0);expect(fresh.stock.fibra).toBe(5);expect(fresh.completed).toBe(false);expect(fresh.player).toEqual(campaignRoom(3).camp);
});
it('consumables spent in a replay remain spent globally, while main-room bag stays protected',()=>{
 const base=fixture(),attempt=startExplorationReplay(base,2)!;attempt.stock.erva--;attempt.xp+=100;attempt.revision++;
 const saved=saveExplorationReplay(base,combatSnapshot(attempt));expect(saved.stock.erva).toBe(2);expect(saved.xp).toBe(1700);expect(saved.bag).toEqual(base.bag);expect(saved.hp).toBe(151);
});
it('campaign portal advancement preserves saved replay attempts',()=>{
 const base=saveExplorationReplay(fixture(),combatSnapshot(startExplorationReplay(fixture(),2)!));base.completed=true;const next=advanceCombatRoom(base);expect(next.roomIndex).toBe(8);expect(next.roomAttempts).toEqual(base.roomAttempts);expect(read(next).roomAttempts).toEqual(base.roomAttempts);
});
it('invalid, stale and locked replay snapshots cannot overwrite campaign progress',()=>{
 const base=fixture();expect(saveExplorationReplay(base,{version:99})).toBe(base);expect(saveExplorationReplay(base,combatSnapshot(createCombatState(10)))).toBe(base);
 const a=startExplorationReplay(base,2)!,old=combatSnapshot(a);a.revision+=10;const saved=saveExplorationReplay(base,combatSnapshot(a));expect(saveExplorationReplay(saved,old)).toBe(saved);
 base.roomAttempts={'2':'bad JSON','7':'{}','55':'{}'};const sanitized=read(base);expect(sanitized.roomAttempts['7']).toBeUndefined();expect(sanitized.roomAttempts['55']).toBeUndefined();expect(startExplorationReplay(sanitized,2)!.roomIndex).toBe(2);
});
it('migrates previous campaign saves without resetting progress and rejects future schema versions',()=>{
 const raw={...combatSnapshot(fixture()),version:3};delete raw.roomAttempts;const r=readCombatState(raw);if(!r.supported)throw Error();expect(r.state.roomIndex).toBe(7);expect(r.state.xp).toBe(1600);expect(r.state.roomAttempts).toEqual({});expect(r.state.version).toBe(4);expect(readCombatState({version:5}).supported).toBe(false);
});
