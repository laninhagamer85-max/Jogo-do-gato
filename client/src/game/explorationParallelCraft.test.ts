import {describe,it,expect} from 'vitest';
import {createCombatState,combatSnapshot,readCombatState,travelCombatPortal} from './explorationCombat';
import {newWorkshop,workshopCommand,craftJobs,workshopRecipes,orderedRecipes} from './explorationWorkshop';
import {campaignRoom} from './explorationCampaign';
import {constructionProgress} from './explorationBase';
function ready(){const s=createCombatState();s.xp=40000;s.player={...campaignRoom(0).camp};s.workshop=newWorkshop();s.workshop.facilities={bench:1,refinery:1,healing:1,chest:1};for(const k of Object.keys(s.workshop.materials))(s.workshop.materials as Record<string,number>)[k]=100;s.stock.erva=0;s.stock.fruta=0;s.stock.fibra=100;s.stock.ambar=100;return s;}
describe('parallel production transactions',()=>{
 it('keeps a completed batch when its output stack fills during production, and claims once after a deposit',()=>{
  let s=ready();s.workshop!.materials.charcoal=9997;
  s=workshopCommand(s,{type:'start',recipe:'charcoal'},1000);
  s.workshop!.materials.charcoal=9998;
  expect(workshopCommand(s,{type:'claim',jobId:1},31000)).toBe(s);
  const reload=readCombatState(combatSnapshot(s));if(!reload.supported)throw Error('unsupported');s=reload.state;
  expect(craftJobs(s.workshop)).toHaveLength(1);
  s=workshopCommand(s,{type:'deposit',item:'charcoal',quantity:1},31000);
  s=workshopCommand(s,{type:'claim',jobId:1},31000);
  expect(s.workshop!.materials.charcoal).toBe(9999);
  expect(s.workshop!.storage.charcoal).toBe(1);
  expect(craftJobs(s.workshop)).toHaveLength(0);
  expect(workshopCommand(s,{type:'claim',jobId:1},31001)).toBe(s);
 });
 it('skips a blocked output during automatic collection without blocking another completed batch',()=>{
  let s=ready();s.workshop!.materials.charcoal=9997;
  s=workshopCommand(s,{type:'start',recipe:'charcoal'},1000);
  s=workshopCommand(s,{type:'start',recipe:'healingLeaves'},1000);
  s.workshop!.materials.charcoal=9999;
  s=workshopCommand(s,{type:'claim'},31000);
  expect(s.workshop!.materials.charcoal).toBe(9999);
  expect(s.stock.erva).toBe(2);
  expect(craftJobs(s.workshop).map(j=>j.id)).toEqual([1]);
 });
 it('counts both collected and stored healing items before delivering the complete batch',()=>{
  let s=ready();s.stock.erva=9997;
  s=workshopCommand(s,{type:'start',recipe:'healingLeaves'},1000);s.bag.erva=1;
  expect(workshopCommand(s,{type:'claim',jobId:1},31000)).toBe(s);
 });
 it('reserves exactly once, caps three per building and allows another building concurrently',()=>{let s=ready();for(let i=0;i<3;i++)s=workshopCommand(s,{type:'start',recipe:'charcoal'},1000);expect(craftJobs(s.workshop)).toHaveLength(3);expect(s.workshop!.materials.wood).toBe(94);expect(workshopCommand(s,{type:'start',recipe:'charcoal'},1000)).toBe(s);s=workshopCommand(s,{type:'start',recipe:'healingLeaves'},1000);s=workshopCommand(s,{type:'start',recipe:'energyFruit'},1000);expect(craftJobs(s.workshop)).toHaveLength(5);expect(constructionProgress(s,1100,'workshop')?.count).toBe(3);expect(constructionProgress(s,1100,'potions')?.count).toBe(2);const reload=readCombatState(combatSnapshot(s));if(!reload.supported)throw Error('unsupported');s=reload.state;expect(craftJobs(s.workshop)).toHaveLength(5);s.completedRooms=[0];s.portalTarget=1;s=travelCombatPortal(s);expect(craftJobs(s.workshop)).toHaveLength(5);s.player={...campaignRoom(1).camp};expect(workshopCommand(s,{type:'claim',jobId:4},30999)).toBe(s);s=workshopCommand(s,{type:'claim',jobId:4},31000);expect(s.stock.erva).toBe(2);expect(craftJobs(s.workshop).map(j=>j.id)).not.toContain(4);expect(workshopCommand(s,{type:'claim',jobId:4},31000)).toBe(s);for(const j of craftJobs(s.workshop))s=workshopCommand(s,{type:'claim',jobId:j.id},31000);expect(craftJobs(s.workshop)).toHaveLength(0);expect(s.workshop!.materials.charcoal).toBe(106);expect(s.workshop!.materials.wood).toBe(94);expect(s.stock.fruta).toBe(1);});
 it('prevents duplicate weapons/upgrades and keeps other work when an upgrade fails',()=>{let s=ready();s=workshopCommand(s,{type:'start',recipe:'upgrade-axe'},0);expect(workshopCommand(s,{type:'start',recipe:'upgrade-axe'},0)).toBe(s);s=workshopCommand(s,{type:'start',recipe:'charcoal'},0);s.workshop!.job!.success=false;s=workshopCommand(s,{type:'claim',jobId:1},30000);expect(s.workshop!.tools.axe).toBe(1);expect(craftJobs(s.workshop).map(j=>j.recipe)).toEqual(['charcoal']);s=workshopCommand(s,{type:'claim',jobId:2},30000);expect(s.workshop!.materials.charcoal).toBe(102);});
 it('claims a ready secondary job even while the primary timer is still running',()=>{let s=ready();s=workshopCommand(s,{type:'start',recipe:'charcoal'},1000);s=workshopCommand(s,{type:'start',recipe:'healingLeaves'},0);s=workshopCommand(s,{type:'claim'},30000);expect(craftJobs(s.workshop).map(j=>j.id)).toEqual([1]);expect(s.stock.erva).toBe(2);});
 it('orders recipe categories by required level and preserves legacy single work in saves',()=>{const s=ready(),all=workshopRecipes(s.workshop!);for(const group of ['all','tools','weapons','refine','care','build'] as const){const rows=orderedRecipes(all,group);expect(rows.map(r=>r.level)).toEqual(rows.map(r=>r.level).sort((a,b)=>a-b));}const old=workshopCommand(s,{type:'start',recipe:'charcoal'},1000);const raw=combatSnapshot(old);const r=readCombatState(raw);if(!r.supported)throw Error('unsupported');expect(craftJobs(r.state.workshop)).toHaveLength(1);expect(craftJobs(r.state.workshop)[0].finishAt).toBe(31000);});
});
