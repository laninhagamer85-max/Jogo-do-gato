import { describe, it, expect } from 'vitest';
import { createCombatState, replayCompletedCombat, stepCombat, consumeCombatItem, defeatCombat, combatSnapshot, readCombatState, PILOT_CAMP, PILOT_EXIT, PILOT_MARKER, PILOT_INSECT, pilotWalkable, insectRespawnMs } from './explorationCombat';
import { createInitialGameState, saveExplorationCombatProgress, migrateGameState } from './PetGame';
describe('Exploration combat pilot', () => {
  it('expires uncommon drops sooner while preserving the deadline across reload',()=>{
    const s=createCombatState();s.enemies.forEach(e=>{e.hp=0;e.generation=1;e.respawnAt=999999;});
    s.loot=[{id:'beetle:0',item:'fibra',quantity:3,x:4,y:6.5,expiresAt:180000},{id:'caterpillar:0',item:'ambar',quantity:2,x:10.5,y:3,expiresAt:90000}];
    s.time=90000;const a=stepCombat(s,{},0);expect(a.loot.map(l=>l.item)).toEqual(['fibra']);
    const r=readCombatState(combatSnapshot(a));if(!r.supported)throw Error('Unsupported fixture');
    expect(r.state.loot[0].expiresAt).toBe(180000);r.state.time=180000;expect(stepCombat(r.state,{},0).loot).toHaveLength(0);
  });
  it('sets respawn from species level and rarity and preserves pending timers on reload',()=>{
    const s=createCombatState();s.player={x:4,y:5.5};s.facing={x:0,y:1};s.enemies[0].hp=1;
    const a=stepCombat(s,{attack:true},50);expect(a.enemies[0].respawnAt-a.time).toBe(30000);
    const c=createCombatState();c.player={x:10.5,y:2};c.facing={x:0,y:1};c.enemies[1].hp=1;
    const b=stepCombat(c,{attack:true},50);expect(b.enemies[1].respawnAt-b.time).toBe(60000);
    const r=readCombatState(combatSnapshot(b));expect(r.supported && r.state.enemies[1].respawnAt).toBe(b.enemies[1].respawnAt);
    expect(insectRespawnMs({level:3,rarity:'rare'})).toBeGreaterThan(insectRespawnMs({level:3,rarity:'uncommon'}));
    expect(insectRespawnMs({level:4,rarity:'common'})).toBeGreaterThan(insectRespawnMs({level:1,rarity:'common'}));
  });
  it('uses the smaller insect footprint near a log without shrinking the player',()=>{
    expect(pilotWalkable({x:4.81,y:3.5},false,PILOT_INSECT.radius)).toBe(true);
    expect(pilotWalkable({x:4.81,y:3.5},false)).toBe(false);
  });
  it('requires smaller insects to approach before dealing contact damage',()=>{
    const s=createCombatState();s.player={x:4,y:5.6};s.enemies[0].attackAt=0;
    expect(stepCombat(s,{},0).hp).toBe(100);
    s.player={x:4,y:5.8};expect(stepCombat(s,{},0).hp).toBeLessThan(100);
  });
  it('keeps diagonal speed bounded and accepts short route steps', () => {
    const s=createCombatState(); const a=stepCombat(s,{dx:1,dy:1},50);
    expect(Math.hypot(a.player.x-s.player.x,a.player.y-s.player.y)).toBeCloseTo(.15);
    expect(stepCombat(s,{dx:.2},50).player.x-s.player.x).toBeCloseTo(.03);
  });
  it('clamps stalled frame time',()=>expect(stepCombat(createCombatState(),{dx:1},10000).player.x).toBeCloseTo(1.65));
  it('requires facing and respects attack cooldown',()=>{
    const s=createCombatState();s.player={x:4,y:5.5};s.facing={x:0,y:1};
    const a=stepCombat(s,{attack:true},50);expect(a.enemies[0].hp).toBe(25);
    expect(stepCombat(a,{attack:true},50).enemies[0].hp).toBe(25);
    s.facing={x:0,y:-1};expect(stepCombat(s,{attack:true},50).enemies[0].hp).toBe(40);
  });
  it('awards a kill once across reload and reports actual final damage',()=>{
    const s=createCombatState();s.player={x:4,y:5.5};s.facing={x:0,y:1};s.enemies[0].hp=3;
    const a=stepCombat(s,{attack:true},50);expect(a.xp).toBe(25);expect(a.feedback.some(f=>f.text==='−3 HP')).toBe(true);
    const read=readCombatState(combatSnapshot(a));expect(read.supported).toBe(true);
    if(read.supported){const b=stepCombat(read.state,{attack:true},50);expect(b.xp).toBe(25);expect(b.loot).toHaveLength(1);}
  });
  it('preserves permanent stock and loses only 10% of current common collection',()=>{
    const s=createCombatState();s.bag.fibra=19;s.bag.ambar=9;s.stock.fibra=99;s.equipmentOwned=true;s.xp=80;
    const a=defeatCombat(s);expect(a.bag.fibra).toBe(18);expect(a.bag.ambar).toBe(9);expect(a.stock.fibra).toBe(99);expect(a.xp).toBe(80);expect(a.equipmentOwned).toBe(true);expect(a.player).toEqual(PILOT_CAMP);
  });
  it('heals actual missing HP without consuming at full health',()=>{
    const s=createCombatState();expect(consumeCombatItem(s,'erva')).toBe(s);s.hp=95;
    const a=consumeCombatItem(s,'erva');expect(a.hp).toBe(100);expect(a.stock.erva).toBe(1);expect(a.feedback[0].text).toBe('+5 HP');
  });
  it('requires energy for power',()=>{const s=createCombatState();s.energy=0;expect(stepCombat(s,{power:true},50).strikeUntil).toBe(0);});
  it('collects each node once after reload',()=>{
    const s=createCombatState();s.player={x:2.5,y:4.5};const a=stepCombat(s,{},50);expect(a.bag.fibra).toBe(3);
    const r=readCombatState(combatSnapshot(a));if(r.supported)expect(stepCombat(r.state,{},50).bag.fibra).toBe(3);
  });
  it('banks collection only after objective and completing the exit',()=>{
    const s=createCombatState();s.player={...PILOT_MARKER};s.bag.fibra=6;s.defeated=1;
    const a=stepCombat(s,{interact:true},50);expect(a.gateOpen).toBe(true);a.player={...PILOT_EXIT};
    const b=stepCombat(a,{},50);expect(b.completed).toBe(true);expect(b.stock.fibra).toBe(6);expect(b.bag.fibra).toBe(0);expect(stepCombat(b,{},50)).toBe(b);
  });
  it('preserves forward save versions',()=>expect(readCombatState({version:'5'})).toEqual({supported:false,version:5}));
  it('adds combat to legacy saves and never changes house progression',()=>{
    const house=migrateGameState({level:8,xp:123});const before={level:house.level,xp:house.xp,coins:house.coins};
    const combat=createCombatState();combat.xp=90;combat.revision=10;
    const a=saveExplorationCombatProgress(house,combatSnapshot(combat));expect({level:a.level,xp:a.xp,coins:a.coins}).toEqual(before);
    combat.revision=2;expect(saveExplorationCombatProgress(a,combatSnapshot(combat))).toBe(a);
  });
  it('does not overwrite a newer combat schema',()=>{const s=createInitialGameState();s.explorationCombatProgress={version:5,secret:'retain'};expect(saveExplorationCombatProgress(s,combatSnapshot(createCombatState()))).toBe(s);});
  it('respawns on time with an uncollected drop and preserves that drop across reload',()=>{
    const s=createCombatState();s.time=50000;s.enemies[0].hp=0;s.enemies[0].respawnAt=1;
    s.loot=[{id:'beetle:0',x:4,y:6.5,item:'fibra',quantity:3}];
    const a=stepCombat(s,{},50);expect(a.enemies[0].hp).toBe(40);expect(a.enemies[0].generation).toBe(1);expect(a.loot).toEqual(s.loot);
    const r=readCombatState(combatSnapshot(a));if(!r.supported)throw Error('Unsupported fixture');
    expect(r.state.loot).toHaveLength(1);r.state.player={x:4,y:6.5};
    const b=stepCombat(r.state,{},0);expect(b.bag.fibra).toBe(3);expect(b.loot).toHaveLength(0);
    expect(stepCombat(b,{},0).bag.fibra).toBe(3);
  });
  it('still waits for the timer and does not respawn beside the player',()=>{
    const s=createCombatState();s.enemies[0].hp=0;s.enemies[0].respawnAt=45000;
    expect(stepCombat(s,{},50).enemies[0].hp).toBe(0);
    s.time=45000;s.player={x:4,y:6.5};expect(stepCombat(s,{},0).enemies[0].hp).toBe(0);
    s.player={...PILOT_CAMP};expect(stepCombat(s,{},0).enemies[0].hp).toBe(40);
  });
  it('combines repeated drops without losing quantities or duplicating collection after reload',()=>{
    const s=createCombatState();s.player={x:4,y:5.5};s.facing={x:0,y:1};s.enemies[0].hp=1;s.enemies[0].generation=8;
    s.loot=[{id:'beetle:0',x:2,y:2,item:'fibra',quantity:24}];
    const a=stepCombat(s,{attack:true},50);expect(a.loot).toHaveLength(1);expect(a.loot[0].quantity).toBe(27);
    const r=readCombatState(combatSnapshot(a));if(!r.supported)throw Error('Unsupported fixture');
    expect(r.state.loot[0].quantity).toBe(27);r.state.player={x:2,y:2};
    const b=stepCombat(r.state,{},0);expect(b.bag.fibra).toBe(27);expect(b.loot).toHaveLength(0);
  });
  it('returns to safety on incoming fatal damage',()=>{
    const s=createCombatState();s.player={x:4,y:6};s.hp=1;s.enemies[0].attackAt=0;
    const a=stepCombat(s,{},50);expect(a.deaths).toBe(1);expect(a.hp).toBe(100);expect(a.player).toEqual(PILOT_CAMP);
  });
  it('blocks attacks through terrain',()=>{
    const s=createCombatState();s.player={x:4.75,y:3.5};s.facing={x:1,y:0};s.enemies[0]={...s.enemies[0],x:6.05,y:3.5};
    expect(stepCombat(s,{power:true},50).enemies[0].hp).toBe(40);
  });

  it('reopens a completed room without resetting earned progression or refilling inventory',()=>{
    const s=createCombatState();s.completed=true;s.revision=900;s.time=50000;s.xp=120;s.stock={fibra:22,ambar:5,erva:0,fruta:0};s.equipmentOwned=true;s.equipmentOn=true;s.deaths=3;s.collectedNodes=['fern-a'];s.gateOpen=true;s.enemies[0].hp=0;
    const a=replayCompletedCombat(s);expect(a.completed).toBe(false);expect(a.gateOpen).toBe(false);expect(a.collectedNodes).toEqual([]);expect(a.enemies[0].hp).toBe(40);expect(a.enemies[0].attackAt).toBe(51500);expect(a.xp).toBe(120);expect(a.stock).toEqual(s.stock);expect(a.equipmentOn).toBe(true);expect(a.deaths).toBe(3);expect(a.revision).toBe(901);expect(s.completed).toBe(true);
  });
  it('migrates existing completed saves and avoids a second completion bonus',()=>{
    const legacy={...combatSnapshot(createCombatState()),completed:true,equipmentOwned:true};delete legacy.completionRewardClaimed;
    const parsed=readCombatState(legacy);if(!parsed.supported)throw Error('Unsupported fixture');
    expect(parsed.state.completionRewardClaimed).toBe(true);const a=replayCompletedCombat(parsed.state);a.gateOpen=true;a.player={...PILOT_EXIT};a.bag.fibra=2;
    const done=stepCombat(a,{},50);expect(done.stock.fibra).toBe(2);expect(done.message).toContain('broche já conquistado');expect(done.equipmentOwned).toBe(true);expect(stepCombat(done,{},50)).toBe(done);
  });
  it('persists replay across reload and accepts its monotonic revision',()=>{
    const s=createCombatState();s.completed=true;s.revision=800;const state=createInitialGameState();state.explorationCombatProgress=combatSnapshot(s);
    const a=replayCompletedCombat(s);const saved=saveExplorationCombatProgress(state,combatSnapshot(a));const parsed=readCombatState(saved.explorationCombatProgress);expect(parsed.supported && parsed.state.completed).toBe(false);expect(parsed.supported && parsed.state.completionRewardClaimed).toBe(true);
  });
  it('does not restart a room still in progress',()=>{const s=createCombatState();expect(replayCompletedCombat(s)).toBe(s);});

});
