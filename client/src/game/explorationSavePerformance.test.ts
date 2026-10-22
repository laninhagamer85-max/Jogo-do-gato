import {it,expect,vi} from 'vitest';
import * as villages from './explorationVillage';
import {createCombatState,combatSnapshot,readCombatState,rememberCombatRoom} from './explorationCombat';
it('validates shared village data once while retaining separate memories of 32 rooms',()=>{
 const s=createCombatState(31);s.completedRooms=Array.from({length:32},(_,i)=>i);s.claimedRooms=[...s.completedRooms];
 s.stock.fibra=123;s.xp=10000;s.workshop!.materials.wood=57;
 s.roomVisits=Object.fromEntries(Array.from({length:32},(_,i)=>{const room=createCombatState(i);room.roomCollectedFibers=i+1;return [i,rememberCombatRoom(room)];}));
 const raw=combatSnapshot(s),before=JSON.stringify(raw),spy=vi.spyOn(villages,'readVillage');
 try{const parsed=readCombatState(raw);expect(parsed.supported).toBe(true);if(!parsed.supported)throw Error('Unsupported');
 expect(spy).toHaveBeenCalledTimes(1);expect(Object.keys(parsed.state.roomVisits!)).toHaveLength(32);
 for(let i=0;i<32;i++)expect(parsed.state.roomVisits![i].roomCollectedFibers).toBe(i+1);
 expect(parsed.state.stock.fibra).toBe(123);expect(parsed.state.workshop!.materials.wood).toBe(57);expect(JSON.stringify(raw)).toBe(before);
 }finally{spy.mockRestore();}
});
