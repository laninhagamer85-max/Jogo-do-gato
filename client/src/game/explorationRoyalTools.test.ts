import {it,expect} from 'vitest';
import {createCombatState,combatLevel} from './explorationCombat';
import {newCastleQuest} from './explorationCastleQuest';
import {resourceNodes,harvestResource,resourceState} from './explorationWorkshop';
const special=(index:number,tool:'axe'|'pickaxe')=>{const s=createCombatState(index);s.xp=0;s.castleQuest=newCastleQuest();s.castleQuest.claims[s.castleQuest.actor]={issued:true,equipmentCards:0,equipped:{[tool]:true}};return s;};
it('lets a level-one royal pickaxe collect every currently available mineral',()=>{
 const materials=new Set<string>();
 for(let room=0;room<32;room++)for(const node of resourceNodes(room).filter(n=>n.tool==='pickaxe')){
  const s=special(room,'pickaxe');s.player={x:node.x,y:node.y};const next=harvestResource(s,node,1000);
  expect(combatLevel(s.xp)).toBe(1);expect(s.workshop!.tools.pickaxe).toBe(1);
  expect(next.workshop!.materials[node.material],`${room}/${node.material}`).toBe(1);expect(resourceState(next.workshop,node.id,1000).remaining).toBe(4);materials.add(node.material);
 }
 expect(materials.has('stone')).toBe(true);expect(materials.has('copperOre')).toBe(true);expect(materials.has('ironOre')).toBe(true);
});
it('does not unlock high-tier mining with an ordinary, unequipped or unearned royal tool',()=>{
 const node=resourceNodes(20).find(n=>n.tool==='pickaxe'&&n.required>1)!;expect(node).toBeDefined();
 for(const variant of ['ordinary','unequipped','unearned'] as const){const s=special(20,variant==='ordinary'?'axe':'pickaxe');s.player={x:node.x,y:node.y};if(variant==='unequipped')s.castleQuest!.claims[s.castleQuest!.actor].equipped.pickaxe=false;if(variant==='unearned')s.castleQuest!.claims[s.castleQuest!.actor].issued=false;const next=harvestResource(s,node,1000);expect(next.workshop!.materials[node.material]).toBe(0);expect(next.message).toContain('Requer');}
});
it('allows the royal axe to harvest without upgrading and retains cooldown and depletion',()=>{
 const node=resourceNodes(0).find(n=>n.tool==='axe')!;let s=special(0,'axe');s.player={x:node.x,y:node.y};
 for(let i=0;i<5;i++){s.time=s.attackAt;s=harvestResource(s,node,1000);}
 expect(s.workshop!.materials.wood).toBe(5);expect(resourceState(s.workshop,node.id,1000).remaining).toBe(0);
 expect(harvestResource(s,node,1000)).toBe(s);s.time=s.attackAt;const depleted=harvestResource(s,node,1000);expect(depleted.workshop!.materials.wood).toBe(5);expect(depleted.message).toContain('esgotado');
});

it.each(['goldOre','diamond'] as const)('ignores tier requirements for a future canonical %s deposit',material=>{
 const node=resourceNodes(20).find(n=>n.tool==='pickaxe')!,original={material:node.material,required:node.required};
 try{node.material=material;node.required=100;const s=special(20,'pickaxe');s.player={x:node.x,y:node.y};expect(harvestResource(s,node,1000).workshop!.materials[material]).toBe(1);}
 finally{Object.assign(node,original);}
});
