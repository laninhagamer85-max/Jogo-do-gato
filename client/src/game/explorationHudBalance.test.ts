import {describe,it,expect} from 'vitest';
import {campaignEnemies,campaignRoom,npcHpMultiplier} from './explorationCampaign';
import {createCombatState,readCombatState,combatSnapshot,normalizeQuickItems,setCombatQuickItem,useCombatQuickItem,advanceCombatRoom} from './explorationCombat';
describe('Exploration resilience and quick consumables',()=>{
 for(const index of [0,9,10,19,20,29])it(`increases every enemy including masters in room ${index+1} and migrates once`,()=>{
  const definitions=campaignEnemies(index),s=createCombatState(index);s.completedRooms=Array.from({length:index},(_,i)=>i);
  expect(definitions.length).toBeGreaterThan(0);
  for(const def of definitions)expect(def.hp).toBe(Math.ceil(def.previousBalanceHp!*npcHpMultiplier(index)));
  s.enemies.forEach((e,i)=>{e.hp=i===0?definitions[i].previousBalanceHp!*.4:0;});
  const old={...combatSnapshot(s),npcBalanceVersion:undefined};
  const read=readCombatState(old);if(!read.supported)throw Error('unsupported');
  expect(read.state.enemies[0].hp).toBeCloseTo(definitions[0].hp*.4);
  expect(read.state.enemies[1].hp).toBe(0);
  const again=readCombatState(combatSnapshot(read.state));if(!again.supported)throw Error('unsupported');
  expect(again.state.enemies).toEqual(read.state.enemies);
 });
 it('also migrates saves from before the Chapter 3 tenfold increase',()=>{
  const s=createCombatState(20);s.completedRooms=Array.from({length:20},(_,i)=>i);
  const defs=campaignEnemies(20);s.enemies.forEach((e,i)=>{e.hp=(defs[i].previousHp??defs[i].previousBalanceHp!/10)*.5;});
  const r=readCombatState({...combatSnapshot(s),npcBalanceVersion:undefined,chapter3BalanceVersion:undefined});if(!r.supported)throw Error('unsupported');
  r.state.enemies.forEach((e,i)=>expect(e.hp).toBeCloseTo(defs[i].hp*.5));
 });
 it('normalizes legacy, duplicate and invalid shortcuts and swaps existing choices',()=>{
  expect(normalizeQuickItems(undefined)).toEqual(['erva','fruta','seiva']);
  expect(normalizeQuickItems(['perola','perola','cristal'])).toEqual(['perola','erva','fruta']);
  const s=setCombatQuickItem(createCombatState(),0,'fruta');expect(s.quickItems).toEqual(['fruta','erva','seiva']);
  const r=readCombatState(combatSnapshot(s));expect(r.supported&&r.state.quickItems).toEqual(s.quickItems);
 });
 it('consumes the selected rare cure and avoids wasting it at full HP',()=>{
  const s=createCombatState();s.hp=10;s.rareBag.perola=2;
  const healed=useCombatQuickItem(s,'perola');expect(healed.hp).toBe(100);expect(healed.rareBag.perola).toBe(1);
  expect(useCombatQuickItem(healed,'perola')).toBe(healed);
 });
});
