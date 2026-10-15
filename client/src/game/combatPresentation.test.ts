import { describe,it,expect } from 'vitest';
import { combatStick,combatAttackPose,combatLootLift,combatPickupCue } from './combatPresentation';
import { combatView } from './explorationCombatView';
import { createCombatState,stepCombat,combatSnapshot,readCombatState } from './explorationCombat';
describe('Immersive combat input and presentation',()=>{
  it('ignores neutral touches and clamps diagonal touch velocity',()=>{
    expect(combatStick(1,2,50)).toEqual({x:0,y:0});const v=combatStick(100,100,50);expect(Math.hypot(v.x,v.y)).toBeCloseTo(1);expect(v.x).toBeCloseTo(v.y);
  });
  it('returns neutral for invalid touch data and keeps short input proportional',()=>{expect(combatStick(NaN,1,40)).toEqual({x:0,y:0});expect(combatStick(20,0,40).x).toBe(.5);});
  it('ends the attack pose at rest and suppresses body motion for reduced-motion users',()=>{expect(combatAttackPose(320,320,false).active).toBe(false);expect(combatAttackPose(100,320,true).lean).toBe(0);expect(combatAttackPose(100,320,false).active).toBe(true);});
  it.each([[375,667],[375,812],[390,844],[844,390],[1366,768]])('keeps the pet clear of HUD and controls at %i × %i, even by the map edges',(w,h)=>{
    for(const player of [{x:1.5,y:1.5},{x:7,y:5},{x:12.4,y:8.5}]){const v=combatView(w,h,player);expect(v.left+player.x*v.tile).toBeCloseTo(w/2);expect(v.top+player.y*v.tile).toBeCloseTo(h*.46);}
  });
  it('drops before collecting even when the pet is beside the defeated adversary',()=>{
    const s=createCombatState();s.player={x:4,y:6};s.facing={x:0,y:1};s.enemies[0].hp=1;const hit=stepCombat(s,{attack:true},50);expect(hit.loot).toHaveLength(1);expect(hit.bag.fibra).toBe(0);
    const saved=readCombatState(combatSnapshot(hit));if(!saved.supported)throw Error('fixture');let a=saved.state;
    for(let i=0;i<9;i++)a=stepCombat(a,{},50);expect(a.loot).toHaveLength(1);a=stepCombat(a,{},50);expect(a.loot).toHaveLength(0);expect(a.bag.fibra).toBe(3);a=stepCombat(a,{},50);expect(a.bag.fibra).toBe(3);
  });
  it('lands the item and respects reduced motion',()=>{expect(combatLootLift(250,0,500,false)).toBeGreaterThan(0);expect(combatLootLift(500,0,500,false)).toBe(0);expect(combatLootLift(250,0,500,true)).toBe(0);});
});

describe('pickup visibility and motion accessibility',()=>{
 it('keeps the item grounded until its drop lands',()=>{expect(combatPickupCue(250,500,false).hover).toBe(0);expect(combatPickupCue(500,500,false).hover).toBe(0);});
 it('keeps a persistent visible cue while completely suppressing movement in reduced motion',()=>{expect(combatPickupCue(1000,500,true)).toEqual(combatPickupCue(9000,500,true));expect(combatPickupCue(1000,500,true).hover).toBe(0);expect(combatPickupCue(1000,500,true).glow).toBeGreaterThan(.75);});
 it('uses only small, slowly varying hover and glow after landing',()=>{for(let time=500;time<12000;time+=50){const a=combatPickupCue(time,500,false),b=combatPickupCue(time+50,500,false);expect(a.hover).toBeGreaterThanOrEqual(0);expect(a.hover).toBeLessThanOrEqual(.09);expect(Math.abs(a.glow-b.glow)).toBeLessThan(.01);}});
});
