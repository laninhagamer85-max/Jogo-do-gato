import {describe,it,expect} from 'vitest';
import {decodeSaved,withStarterLegend} from './lendariosSave';
import {combatSnapshot,createCombatState} from '../game/explorationCombat';
const profile={name:'Aventureiro',age:1,gender:'menino',characterId:'menino-preto'};
describe('Lendários save import',()=>{
 it('preserves a valid campaign snapshot',()=>{const state=createCombatState();state.xp=142;const saved=decodeSaved(JSON.stringify({version:1,profile,progress:combatSnapshot(state)}));expect(saved.progress.xp).toBe(142);expect(saved.profile.name).toBe('Aventureiro');});
 it('accepts the existing game export shape',()=>{expect(decodeSaved(JSON.stringify({profile,explorationCombatProgress:combatSnapshot(createCombatState())})).profile.gender).toBe('menino');});
 it('rejects missing progress',()=>{expect(()=>decodeSaved(JSON.stringify({version:1,profile}))).toThrow();});
 it('rejects incompatible character selections',()=>{expect(()=>decodeSaved(JSON.stringify({profile:{...profile,characterId:'menina-creme'},progress:combatSnapshot(createCombatState())}))).toThrow();});
 it('rejects future campaign schemas rather than resetting progress',()=>{const progress={...combatSnapshot(createCombatState()),version:999};expect(()=>decodeSaved(JSON.stringify({version:1,profile,progress}))).toThrow();});
});

describe('Starter heroes for Lendários only',()=>{
 it.each([['menino','menino-preto','kael'],['menina','menina-creme','lyra']] as const)('starts %s with the matching legend', (gender,characterId,id)=>{const saved=decodeSaved(JSON.stringify({version:1,profile:{...profile,gender,characterId},progress:combatSnapshot(createCombatState())}));const state=saved.progress.legends as {active:string;unlocked:string[]};expect(state.active).toBe(id);expect(state.unlocked).toEqual([id]);expect(saved.profile.name).toBe('Aventureiro');expect(withStarterLegend(saved)).toEqual(saved);});
 it('preserves advanced selection, materials and chapter progress',()=>{const state=createCombatState();state.legends={active:'soren',unlocked:['soren'],weapons:['bow'],weapon:'bow'};state.stock.fibra=123;state.xp=999;state.completedRooms=[0,1,2];const saved=decodeSaved(JSON.stringify({version:1,profile,progress:combatSnapshot(state)}));expect((saved.progress.legends as {active:string}).active).toBe('soren');expect((saved.progress.stock as {fibra:number}).fibra).toBe(123);expect(saved.progress.xp).toBe(999);expect(saved.progress.completedRooms).toEqual([0,1,2]);});
});
