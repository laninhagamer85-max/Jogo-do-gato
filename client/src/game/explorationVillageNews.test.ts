import {expect,it} from 'vitest';
import {createCombatState,combatSnapshot,readCombatState} from './explorationCombat';
import {acknowledgeVillageNews,addVillageNews,pendingVillageNews,specialVillageLine,readVillageNews} from './explorationVillageNews';
import {EXPLORATION_ROOM_COUNT} from './explorationNascentesLayout';
it('preserves unread and acknowledged news in every chapter4 room across full save/load',()=>{
 for(let room=30;room<EXPLORATION_ROOM_COUNT;room++){
  let s=createCombatState(room);const author=WORLD_VILLAGERS.find(d=>d.room===room&&d.kind==='worker')!;
  const id=`review:${room}:growth`;addVillageNews(s.village!,{id,author:author.id,room,settlement:author.settlement,text:'A vila cresceu.'});
  const r=readCombatState(combatSnapshot(s));if(!r.supported)throw Error('unsupported');s=r.state;
  expect(pendingVillageNews(s)?.id,`room ${room+1}`).toBe(id);
  s=acknowledgeVillageNews(s,id);const saved=readCombatState(combatSnapshot(s));if(!saved.supported)throw Error('unsupported');
  expect(saved.state.village!.news![id].read).toBe(true);expect(pendingVillageNews(saved.state)).toBeUndefined();
 }
});
it('continues rejecting nonexistent and invalid news room indexes',()=>{
 const author=WORLD_VILLAGERS.find(d=>d.room===39&&d.kind==='worker')!.id;
 for(const room of [-1,.5,EXPLORATION_ROOM_COUNT,NaN])expect(readVillageNews({bad:{id:'bad',author,room,settlement:0,text:'Inválido',read:false}})).toEqual({});
});
import {tickVillage} from './explorationVillage';
import {WORLD_VILLAGERS,villageSettlements} from './explorationVillageLayout';
it('keeps confirmed news read across reload and refuses the same author/event again',()=>{let s=createCombatState();addVillageNews(s.village!,{id:'test:tomas:1',author:'tomas',room:0,settlement:0,text:'Nossa colheita melhorou.'});expect(pendingVillageNews(s)?.id).toBe('test:tomas:1');s=acknowledgeVillageNews(s,'test:tomas:1');const r=readCombatState(combatSnapshot(s));if(!r.supported)throw Error();expect(pendingVillageNews(r.state)).toBeUndefined();delete r.state.village!.news!['test:tomas:1'];addVillageNews(r.state.village!,{id:'test:tomas:1',author:'tomas',room:0,settlement:0,text:'Nossa colheita melhorou.'});expect(pendingVillageNews(r.state)).toBeUndefined();addVillageNews(r.state.village!,{id:'test:lia:2',author:'lia',room:0,settlement:0,text:'Novas ervas chegaram.'});expect(pendingVillageNews(r.state)?.author).toBe('lia');});
it('uses occasional ambient conversation rather than constant bubbles',()=>{let s=createCombatState();const town=villageSettlements(0)[1];s.player={x:town.x,y:town.y+2};s.village!.growth=Object.fromEntries(villageSettlements(0).map(t=>[t.id,24]));let first=0,last=0;for(let i=0;i<3000;i++){s=tickVillage(s,50,1000+i*50);const chats=Object.values(s.village!.people).filter(c=>c.chat&&c.chat.until>s.village!.clock);if(chats.length){if(!first)first=s.village!.clock;last=s.village!.clock;}}expect(first===0||first>=120000).toBe(true);expect(last-first).toBeLessThan(12000);});
it('provides period greetings, agriculture, trade and legendary topics',()=>{expect(specialVillageLine('worker',0,'night')).toContain('Boa noite');expect(specialVillageLine('worker',1,'morning')).toContain('casas');expect(specialVillageLine('elder',1,'morning')).toContain('mestre');expect(WORLD_VILLAGERS.some(d=>d.role.includes('histórias'))).toBe(true);});
