import {describe,it,expect} from 'vitest';
import {createCombatState,combatSnapshot,readCombatState} from './explorationCombat';
import {resumeLegendSelection,type LegendId,type LegendGender} from './explorationLegends';
describe('resume the selected exploration hero',()=>{
 for(const [id,gender] of [['kael','menino'],['soren','menino'],['lyra','menina'],['ayla','menina']] as [LegendId,LegendGender][]){
  it(`keeps ${id} and equipment across repeated save/load cycles`,()=>{
   let s=createCombatState();s.legends={unlocked:[id],active:id,weapons:['bow','sword'],weapon:id==='ayla'?'sword':'bow',signature:{weapon:id==='soren'||id==='ayla',tool:true}};
   s.stock.fibra=37;s.completedRooms=[0,1];
   for(let i=0;i<3;i++){
    const r=readCombatState(combatSnapshot(s));if(!r.supported)throw Error('unsupported');
    const before=JSON.stringify(r.state),next=resumeLegendSelection(r.state,gender);
    expect(next).toBe(r.state);expect(JSON.stringify(next)).toBe(before);
    expect(next.legends?.active).toBe(id);expect(next.legends?.weapon).toBe(s.legends!.weapon);
    expect(next.legends?.signature).toEqual(s.legends!.signature);
    expect(next.stock.fibra).toBe(37);expect(next.completedRooms).toEqual([0,1]);s=next;
   }
  });
 }
 it('keeps the explicit pet selection and never selects a hero automatically',()=>{
  const s=createCombatState();s.legends={unlocked:['kael','soren'],active:null,weapons:[],weapon:null};
  expect(resumeLegendSelection(s,'menino')).toBe(s);
  expect(resumeLegendSelection(s,'menino').legends!.active).toBeNull();
 });
 it('rejects an incompatible hero without deleting ownership or resources',()=>{
  const s=createCombatState();s.legends={unlocked:['soren'],active:'soren',weapons:['bow'],weapon:'bow'};
  const before=JSON.stringify(s),next=resumeLegendSelection(s,'menina');
  expect(next.legends!.active).toBeNull();expect(next.legends!.unlocked).toEqual(['soren']);
  expect(next.legends!.weapons).toEqual(['bow']);expect(next.stock).toBe(s.stock);expect(JSON.stringify(s)).toBe(before);
 });
 it('does not activate an unowned or unreleased hero from malformed data',()=>{
  const s=createCombatState();s.legends={unlocked:['kael'],active:'soren',weapons:[],weapon:null};
  expect(resumeLegendSelection(s,'menino').legends!.active).toBeNull();
 });
});
