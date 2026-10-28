import {expect,it} from 'vitest';
import {combatSnapshot,createCombatState,readCombatState} from './explorationCombat';
import {acknowledgeVillageNews,addVillageNews,pendingVillageNews} from './explorationVillageNews';
import {WORLD_VILLAGERS} from './explorationVillageLayout';
import {collectorDestination,finishCollector,isVillageCollector} from './explorationCollectors';
import {tickVillage} from './explorationVillage';
import {caravanArrival} from './explorationCaravans';

it('migrates old room32 news identities and acknowledgements through two full reloads without repeating rewards',()=>{
 let state=createCombatState(39);
 const author=WORLD_VILLAGERS.find(d=>d.room===39&&d.kind==='worker'&&!d.warrior)!;
 const unread=`growth:r39:s${author.settlement}:2`,read=`growth:r39:s${author.settlement}:1`;
 for(const id of [read,unread])addVillageNews(state.village!,{id,author:author.id,room:39,settlement:author.settlement,text:'A vila cresceu.'});
 state=acknowledgeVillageNews(state,read);state.xp=1234;state.stock.fibra=19;state.bag.fibra=7;
 const raw=JSON.parse(JSON.stringify({...combatSnapshot(state),campaignVersion:16,roomIndex:31}).replace(/r39:/g,'r31:'));
 for(const news of Object.values(raw.village.news) as {room:number}[])news.room=31;
 const before=JSON.stringify(raw),loaded=readCombatState(raw);
 expect(JSON.stringify(raw)).toBe(before);expect(loaded.supported).toBe(true);if(!loaded.supported)throw Error('legacy save rejected');
 expect(loaded.state.roomIndex).toBe(39);expect(pendingVillageNews(loaded.state,author.id)?.id).toBe(unread);
 expect(loaded.state.village!.newsRead).toContain(read);
 expect(loaded.state.village!.news![read].read).toBe(true);
 const confirmed=acknowledgeVillageNews(loaded.state,unread),again=readCombatState(combatSnapshot(confirmed));
 expect(again.supported).toBe(true);if(!again.supported)throw Error('current save rejected');
 expect(pendingVillageNews(again.state,author.id)).toBeUndefined();
 expect(again.state.xp).toBe(1234);expect(again.state.stock.fibra).toBe(19);expect(again.state.bag.fibra).toBe(7);
 expect(again.state.completedRooms).toEqual(state.completedRooms);expect(again.state.claimedRooms).toEqual(state.claimedRooms);
});

it('keeps a room40 collector cargo across full reload and credits it once without changing player inventory',()=>{
 let state=tickVillage(createCombatState(39),0,1000);
 const author=WORLD_VILLAGERS.find(d=>d.room===39&&isVillageCollector(d))!,destination=collectorDestination(39,0)!;
 const citizen=state.village!.people[author.id];
 Object.assign(citizen,caravanArrival(destination,39),{room:destination,task:'caravan-back',destination,cargoMaterial:'stone'});
 const bank=JSON.stringify(state.workshop!.materials),stock=citizen.stock;
 const loaded=readCombatState(combatSnapshot(state));expect(loaded.supported).toBe(true);if(!loaded.supported)throw Error('save rejected');
 state=loaded.state;const saved=state.village!.people[author.id];
 expect(saved.room).toBe(38);expect(saved.destination).toBe(38);expect(saved.cargoMaterial).toBe('stone');
 finishCollector(state,author.id,saved);expect(saved.stock).toBe(Math.min(8,stock+1));
 const credited=JSON.stringify(state.village!.growth);finishCollector(state,author.id,saved);
 expect(JSON.stringify(state.village!.growth)).toBe(credited);expect(saved.stock).toBe(Math.min(8,stock+1));
 expect(JSON.stringify(state.workshop!.materials)).toBe(bank);expect(state.completedRooms).toEqual([]);
});
