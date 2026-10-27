import {describe,it,expect} from 'vitest';
import {createCombatState,combatSnapshot,readCombatState,stepCombat,advanceCombatRoom,combatAttack} from './explorationCombat';
import {changeLegend,legendWeapon,legendUnlockRequirements,readLegendProgress} from './explorationLegends';
import {legendKit,signatureActive} from './explorationLegendKits';
import {legendPose} from './explorationLegendPose';
import {resourceNodes,harvestResource,workshopCommand} from './explorationWorkshop';
import {gearEquipped} from './explorationEquipmentInventory';
const ready=()=>{const s=createCombatState();s.completedRooms=Array.from({length:10},(_,i)=>i);s.xp=4840;s.rareStock.perola=2;s.rareStock.escama=2;s.rareStock.cristal=1;s.stock.fibra=180;s.stock.ambar=60;return s;};
function hero(id:'soren'|'ayla'){const gender=id==='ayla'?'menina':'menino';const s=ready();s.legends={unlocked:[id==='ayla'?'lyra':'kael'],active:null,weapons:[],weapon:null};return changeLegend(changeLegend(s,gender,{type:'unlock',id}),gender,{type:'select',id});}
describe('Soren and Ayla, distinct playable kits',()=>{
 it('requires level 12, chapter 1 completion, starter awakening and the distinct rare material recipe',()=>{
  for(const [gender,starter,id,rare] of [['menino','kael','soren','perola'],['menina','lyra','ayla','escama']] as const){
   const old=ready();old.legends={unlocked:[starter],active:null,weapons:[],weapon:null};
   expect(legendUnlockRequirements(old,id).ready).toBe(true);
   for(const denied of [{...old,xp:4000},{...old,completedRooms:[0]},{...old,legends:undefined},{...old,rareStock:{...old.rareStock,[rare]:1}}])expect(changeLegend(denied,gender,{type:'unlock',id})).toBe(denied);
   const next=changeLegend(old,gender,{type:'unlock',id});expect(next.legends?.unlocked).toEqual([starter,id]);expect(next.stock.fibra).toBe(100);expect(next.stock.ambar).toBe(20);expect(next.rareStock[rare]).toBe(0);expect(next.rareStock.cristal).toBe(0);expect(next.campaignVersion).toBe(17);expect(old.legends?.unlocked).toEqual([starter]);
   expect(changeLegend(old,gender==='menino'?'menina':'menino',{type:'unlock',id})).toBe(old);expect(changeLegend(next,gender,{type:'unlock',id})).toBe(next);
  }
 });
 it('preserves the original level 6 starter recipe and rejects unavailable identities',()=>{
  const s=createCombatState();s.completedRooms=[0];s.xp=1000;s.stock.fibra=60;s.stock.ambar=20;const n=changeLegend(s,'menina',{type:'unlock',id:'lyra'});expect(n.stock.fibra).toBe(0);expect(n.stock.ambar).toBe(0);expect(changeLegend(s,'menina',{type:'select',id:'ayla'})).toBe(s);expect(readLegendProgress({unlocked:['drake','ayla'],active:'drake'}).active).toBeNull();
 });
 it('persists the exclusive items and selection on snapshot and portal without granting ordinary crafted weapons',()=>{
  for(const id of ['soren','ayla'] as const){const s=hero(id),r=readCombatState(combatSnapshot(s));expect(r.supported).toBe(true);if(!r.supported)return;expect(r.state.legends).toEqual(s.legends);expect(r.state.campaignVersion).toBe(17);expect(r.state.legends!.weapons).toEqual([]);expect(signatureActive(r.state,'weapon')).toBe(true);s.completed=true;expect(advanceCombatRoom(s).legends).toEqual(s.legends);expect(advanceCombatRoom(s).campaignVersion).toBe(17);}
 });
 it('equips and removes exclusive weapons and tools atomically; ordinary equipment replaces the exclusive slot',()=>{
  let s=hero('ayla');expect(legendWeapon(s)?.name).toBe('Espada Rubra');expect(gearEquipped(s,'sword','wood')).toBe(false);
  const removed=changeLegend(s,'menina',{type:'signature',slot:'weapon',equipped:false});expect(legendWeapon(removed)).toBeNull();expect(signatureActive(s,'weapon')).toBe(true);
  s=changeLegend(removed,'menina',{type:'signature',slot:'weapon',equipped:true});expect(legendWeapon(s)?.bonus).toBe(8);
  s=workshopCommand(s,{type:'equipGear',kind:'axe',grade:'wood'},100);expect(signatureActive(s,'tool')).toBe(false);
  s=changeLegend(s,'menina',{type:'signature',slot:'tool',equipped:true});expect(signatureActive(s,'tool')).toBe(true);
  const cat=changeLegend(s,'menina',{type:'select',id:null});expect(signatureActive(cat,'tool')).toBe(false);expect(cat.legends?.weapon).toBeNull();const base=changeLegend(s,'menina',{type:'select',id:'lyra'});expect(base.legends?.weapon).toBeNull();
 });
 it('applies native bow and sword stats only while the owner and exclusive weapon are active',()=>{
  const soren=hero('soren'),ayla=hero('ayla');expect([legendWeapon(soren)?.range,legendWeapon(soren)?.bonus]).toEqual([6,5]);expect([legendWeapon(ayla)?.range,legendWeapon(ayla)?.bonus]).toEqual([1.7,8]);expect(combatAttack(ayla)-combatAttack({...ayla,legends:undefined})).toBe(8);
 });
 it('keeps native tools subject to resource levels, depleted nodes and actual resource consumption',()=>{
  for(const id of ['soren','ayla'] as const){const s=hero(id),kit=legendKit(s)!,node=resourceNodes(0).find(n=>n.tool===kit.tool&&n.required===1)!;s.player={x:node.x+.7,y:node.y};s.attackAt=0;
   const next=harvestResource(s,node,1000),plain=harvestResource({...s,legends:undefined},node,1000);expect(next.workshop!.materials[node.material]-s.workshop!.materials[node.material]).toBe(1);expect(next.attackAt).toBeLessThan(plain.attackAt);expect(next.workshop!.nodes[node.id].remaining).toBe(4);expect(s.workshop!.nodes[node.id]).toBeUndefined();
  }
 });
 it('gives Soren a collision-respecting speed bonus and short protection when using Power',()=>{
  const s=hero('soren');s.player={x:2,y:2};const p=stepCombat(s,{dy:1},40),base=stepCombat({...s,legends:undefined},{dy:1},40);expect(p.player.y-s.player.y).toBeCloseTo((base.player.y-s.player.y)*1.1,6);
  const cast=stepCombat(s,{power:true},16);expect(cast.invulnerableUntil-cast.time).toBe(750);expect(cast.energy).toBeLessThan(s.energy);expect(stepCombat(cast,{power:true},16).invulnerableUntil).toBe(cast.invulnerableUntil);
 });
 it('Ayla deals stronger Power damage and reduces common contact damage',()=>{
  const s=hero('ayla');s.player={x:2,y:2};s.facing={x:1,y:0};s.enemies[0]={...s.enemies[0],x:2.7,y:2,hp:1000,attackAt:0};
  const old={...s,legends:{...s.legends!,active:'lyra' as const,unlocked:['lyra' as const],weapon:null,signature:undefined}},without=stepCombat(old,{power:true},16),withHero=stepCombat({...s,legends:{...s.legends!,weapon:null,signature:{weapon:false,tool:true}}},{power:true},16);
  expect(withHero.enemies[0].hp).toBeLessThan(without.enemies[0].hp);
  const near=createCombatState();near.player={x:6,y:5};near.time=2000;near.enemies[0]={...near.enemies[0],x:6.65,y:5,attackAt:0};near.legends={unlocked:['ayla'],active:'ayla',weapons:[],weapon:null};const contact=stepCombat(near,{},16),common=stepCombat({...near,legends:undefined},{},16);expect(contact.hp-common.hp).toBe(3);expect(contact.hp).toBeLessThan(near.hp);
 });
 it('contains complete 32-pose art per new character, supporting every direction and action without body splitting',()=>{
  for(const id of ['soren','ayla'] as const)for(let row=0;row<8;row++)for(let f=0;f<8;f++){const p=legendPose(id,row,f);expect(p.rect.componentPixels).toBeGreaterThan(3000);expect(p.rect.height).toBeGreaterThan(100);expect(p.rect.path.endsWith('Z')).toBe(true);expect(p.mirror).toBe(false);}
 });
});
