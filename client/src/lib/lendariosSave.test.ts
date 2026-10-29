import {describe,it,expect} from 'vitest';
import {decodeSaved} from './lendariosSave';
import {combatSnapshot,createCombatState} from '../game/explorationCombat';
const profile={name:'Aventureiro',age:1,gender:'menino',characterId:'menino-preto'};
describe('Lendários save import',()=>{
 it('preserves a valid campaign snapshot',()=>{const state=createCombatState();state.xp=142;const saved=decodeSaved(JSON.stringify({version:1,profile,progress:combatSnapshot(state)}));expect(saved.progress.xp).toBe(142);expect(saved.profile.name).toBe('Aventureiro');});
 it('accepts the existing game export shape',()=>{expect(decodeSaved(JSON.stringify({profile,explorationCombatProgress:combatSnapshot(createCombatState())})).profile.gender).toBe('menino');});
 it('rejects missing progress',()=>{expect(()=>decodeSaved(JSON.stringify({version:1,profile}))).toThrow();});
 it('rejects incompatible character selections',()=>{expect(()=>decodeSaved(JSON.stringify({profile:{...profile,characterId:'menina-creme'},progress:combatSnapshot(createCombatState())}))).toThrow();});
 it('rejects future campaign schemas rather than resetting progress',()=>{const progress={...combatSnapshot(createCombatState()),version:999};expect(()=>decodeSaved(JSON.stringify({version:1,profile,progress}))).toThrow();});
});
