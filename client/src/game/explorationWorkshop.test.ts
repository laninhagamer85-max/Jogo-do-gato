import {describe,it,expect} from 'vitest';
import {createCombatState,readCombatState,combatSnapshot,travelCombatPortal} from './explorationCombat';
import {newWorkshop,workshopCommand,harvestResource,resourceNodes,resourceState,RESOURCE_RENEW_MS,CRAFT_DURATION_MS} from './explorationWorkshop';
import {campaignRoom} from './explorationCampaign';
function ready(){const s=createCombatState();s.xp=40000;s.player={...campaignRoom(0).camp};s.stock.fibra=100;s.stock.ambar=100;s.workshop=newWorkshop();Object.keys(s.workshop.materials).forEach(k=>(s.workshop!.materials as Record<string,number>)[k]=100);return s;}
describe('persistent workshop economy',()=>{
 it('reserves one recipe once, waits 30s across reload and allows exactly one claim',()=>{
  const s=ready(),a=workshopCommand(s,{type:'start',recipe:'axe'},1000);expect(a.stock.fibra).toBe(94);expect(s.stock.fibra).toBe(100);expect(workshopCommand(a,{type:'start',recipe:'axe'},1100)).toBe(a);expect(workshopCommand(a,{type:'claim'},30999)).toBe(a);
  const reload=readCombatState(combatSnapshot(a));expect(reload.supported).toBe(true);if(!reload.supported)return;
  const b=workshopCommand(reload.state,{type:'claim'},1000+CRAFT_DURATION_MS);expect(b.workshop?.tools.axe).toBe(1);expect(workshopCommand(b,{type:'claim'},999999)).toBe(b);expect(workshopCommand(b,{type:'start',recipe:'axe'},999999)).toBe(b);
 });
 it('gates resources by tool, caps them at five and renews exactly after 12h',()=>{
  let s=ready();const n=resourceNodes(0).find(n=>n.kind==='tree')!;expect(n).toBeDefined();s.player={x:n.x+.8,y:n.y};expect(harvestResource(s,n,1000).workshop?.materials.wood).toBe(100);s.workshop!.tools.axe=1;
  for(let i=0;i<5;i++){s.time=i*1000;s=harvestResource(s,n,1000+i*1000);}expect(s.workshop?.materials.wood).toBe(105);expect(resourceState(s.workshop,n.id,5000).remaining).toBe(0);s.time=10000;expect(harvestResource(s,n,6000).workshop?.materials.wood).toBe(105);expect(resourceState(s.workshop,n.id,5000+RESOURCE_RENEW_MS-1).remaining).toBe(0);expect(resourceState(s.workshop,n.id,5000+RESOURCE_RENEW_MS).remaining).toBe(5);
  expect(harvestResource(s,{...n,x:100},NaN)).toBe(s);
 });
 it('preserves storage and prevents duplicate facilities or negative transfers',()=>{
  let s=ready();s.workshop!.facilities.chest=1;expect(workshopCommand(s,{type:'start',recipe:'chest'},1000)).toBe(s);s=workshopCommand(s,{type:'deposit',item:'wood',quantity:5});expect([s.workshop?.materials.wood,s.workshop?.storage.wood]).toEqual([95,5]);s=workshopCommand(s,{type:'withdraw',item:'wood',quantity:5});expect([s.workshop?.materials.wood,s.workshop?.storage.wood]).toEqual([100,0]);expect(workshopCommand(s,{type:'withdraw',item:'wood',quantity:1})).toBe(s);expect(workshopCommand(s,{type:'deposit',item:'wood',quantity:-1})).toBe(s);expect(workshopCommand(s,{type:'deposit',item:'wood',quantity:61})).toBe(s);
 });
 it('requires sequential equipment tiers and preserves a failed upgrade',()=>{
  let s=ready();s.workshop!.tools.axe=1;s.workshop!.facilities.bench=1;expect(workshopCommand(s,{type:'start',recipe:'tier-axe-diamond'},0)).toBe(s);s=workshopCommand(s,{type:'start',recipe:'tier-axe-metal'},0);expect(s.workshop?.materials.ironBar).toBe(96);s.workshop!.job!.success=false;s=workshopCommand(s,{type:'claim'},30000);expect(s.workshop?.equipmentTiers.axe).toBeUndefined();expect(s.workshop?.tools.axe).toBe(1);expect(s.workshop?.materials.ironBar).toBe(96);
 });
 it('keeps global resources through an unlocked room portal',()=>{const s=ready();s.completedRooms=[0];s.portalTarget=1;const next=travelCombatPortal(s);expect(next.roomIndex).toBe(1);expect(next.workshop).toEqual(s.workshop);});
});
