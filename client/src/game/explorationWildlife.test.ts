import {it,expect} from 'vitest';
import {campaignEnemies,campaignRoom,EXPLORATION_ROOMS,rareDropChance} from './explorationCampaign';
import {createCombatState,stepCombat,readCombatState,combatSnapshot,pilotWalkable,defeatCombat,advanceCombatRoom} from './explorationCombat';
const fixture=(index:number,seed=42)=>{const s=createCombatState(index,seed);s.completedRooms=Array.from({length:index},(_,i)=>i);s.claimedRooms=[...s.completedRooms];return s;};
it('keeps the approved pilot fauna intact and supplies three new species only in the woodland expansion',()=>{
 expect(campaignEnemies(0)).toEqual(campaignRoom(0).enemies);
 const names=new Set(EXPLORATION_ROOMS.flatMap(r=>campaignEnemies(r.index).filter(e=>e.art).map(e=>e.name)));
 expect([...names].sort()).toEqual(['Cogumelo Cobre','Escaravelho Dourado','Mestre do Âmbar','Cogumelo Saltador','Escaravelho Esmeralda','Guardião dos Troncos','Mestre dos Troncos','Caranguejo Azul','Rã Ametista','Mestre das Marés'].sort());
});
it('rolls limited different encounters in safe, reachable woodland slots across seeds',()=>{
 const arrangements=new Set<string>();
 for(let room=1;room<10;room++)for(let seed=1;seed<=30;seed++){
  const defs=campaignEnemies(room,seed),wild=defs.filter(e=>e.id.startsWith('wild-'));expect(wild.length).toBeLessThanOrEqual(8);expect(wild.length).toBeGreaterThan(0);
  arrangements.add(JSON.stringify(wild.map(e=>[e.id,e.x,e.y])));
  for(const e of wild){expect(pilotWalkable(e,false,e.radius,room)).toBe(true);expect(Math.hypot(e.x-1.5,e.y-1.5)).toBeGreaterThan(3.3);}
 }
 expect(arrangements.size).toBeGreaterThan(30);
});
it('retains encounter seed, enemies and loot through save/reload instead of rerolling',()=>{
 const s=fixture(8,12345);s.enemies[2].hp=13;
 const r=readCombatState(combatSnapshot(s));if(!r.supported)throw Error();
 expect(r.state.encounterSeed).toBe(s.encounterSeed);expect(r.state.enemies.map(e=>[e.id,e.x,e.y,e.hp])).toEqual(s.enemies.map(e=>[e.id,e.x,e.y,e.hp]));
 expect(campaignEnemies(8,r.state.encounterSeed)).toEqual(campaignEnemies(8,12345));
});
it('higher level guardian has higher rare-drop chance and different stats than early scarabs',()=>{
 const low=campaignEnemies(1,42).find(e=>e.art)!,high=campaignEnemies(9,42).find(e=>e.spriteRow===2)!;
 expect(high.level).toBeGreaterThan(low.level);expect(high.hp).toBeGreaterThan(low.hp);expect(high.leash).not.toBe(low.leash);expect(rareDropChance(high)).toBeGreaterThan(rareDropChance(low));expect(rareDropChance(high)).toBeLessThan(1);
});
it('rare drops are collectible once, survive reload and bank separately without overwriting common drops',()=>{
 let s=fixture(5,42);const defs=campaignEnemies(5,42),def=defs.find(e=>e.art)!;
 s.player={x:def.x-.6,y:def.y};s.facing={x:1,y:0};s.seed=1;s.invulnerableUntil=1e9;
 s.enemies.forEach(e=>{e.hp=e.id===def.id?1:0;e.respawnAt=1e9;});
 // Seed 1 first random value is .236, lower than the level3 rare chance .205 only for suitable higher seed; search deterministically.
 for(let seed=1;seed<10000;seed++)if(((Math.imul(seed,1664525)+1013904223)>>>0)/4294967296<rareDropChance(def)){s.seed=seed;break;}
 s=stepCombat(s,{attack:true},0);const rare=s.loot.find(l=>l.rare);expect(rare).toBeDefined();expect(s.loot.filter(l=>l.id.startsWith(def.id+':'))).toHaveLength(2);
 const saved=readCombatState(combatSnapshot(s));if(!saved.supported)throw Error();s=saved.state;expect(s.loot.find(l=>l.rare)).toBeDefined();
 s.player={x:rare!.x,y:rare!.y};s.time=600;s=stepCombat(s,{},0);expect(s.rareBag.seiva).toBe(1);expect(stepCombat(s,{},0).rareBag.seiva).toBe(1);
 const respawn=defeatCombat(s);expect(respawn.rareBag.seiva).toBe(1);
 s.gateOpen=true;s.player={...campaignRoom(5).exit};s=stepCombat(s,{},0);expect(s.rareStock.seiva).toBe(1);expect(s.rareBag.seiva).toBe(0);expect(advanceCombatRoom(s).rareStock.seiva).toBe(1);
});
it('each new creature has a defeatable live duel at level one without forced damage immunity',()=>{
 for(const def of campaignEnemies(9,42).filter(e=>e.art&&!e.boss)){
  let s=fixture(9,42);s.enemies.forEach(e=>{e.hp=e.id===def.id?e.hp:0;e.respawnAt=1e9;});s.player={x:def.x-.65,y:def.y};
  let n=0;while(s.enemies.find(e=>e.id===def.id)!.hp>0&&n++<400){const e=s.enemies.find(e=>e.id===def.id)!,d=Math.hypot(e.x-s.player.x,e.y-s.player.y);s.facing={x:(e.x-s.player.x)/(d||1),y:(e.y-s.player.y)/(d||1)};s=stepCombat(s,{attack:true},50);}
  expect(s.enemies.find(e=>e.id===def.id)!.hp).toBe(0);expect(s.deaths).toBe(0);
 }
});
