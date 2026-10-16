import {describe,it,expect} from 'vitest';
import {readMinimap,revealMinimap,minimapDiscovered,minimapNearby} from './explorationMinimap';
import {createCombatState,stepCombat,readCombatState,combatSnapshot,replayCompletedCombat} from './explorationCombat';
describe('exploration discovery and minimap',()=>{
 it('reveals locally without exposing remote areas and preserves earlier discoveries',()=>{
 const start=readMinimap(undefined,{x:1.5,y:1.5});expect(minimapDiscovered(start,{x:1.5,y:1.5})).toBe(true);expect(minimapDiscovered(start,{x:12,y:8})).toBe(false);
 const moved=revealMinimap(start,{x:12,y:8});expect(start.every(i=>moved.includes(i))).toBe(true);expect(minimapDiscovered(moved,{x:12,y:8})).toBe(true);
 expect(revealMinimap(moved,{x:12,y:8})).toBe(moved);
 });
 it('sanitizes malformed save data and migrates old saves without changing earned stats',()=>{
 expect(readMinimap([-1,140,2,2,1.5,'3',NaN],{x:12,y:8})).toContain(2);
 expect(readMinimap([-1,140,2,2,1.5,'3',NaN],{x:12,y:8}).every(n=>Number.isInteger(n)&&n>=0&&n<520)).toBe(true);
 const a=readCombatState({version:1,xp:100,stock:{fibra:12},player:{x:3.5,y:4.5}});if(!a.supported)throw Error();expect(a.state.xp).toBe(100);expect(a.state.stock.fibra).toBe(12);expect(a.state.exploredCells.length).toBeGreaterThan(0);
 });
 it('round trips discovered cells and does not mutate previous state on movement',()=>{
 const a=createCombatState(),before=[...a.exploredCells];a.player={x:7.5,y:7.5};const b=stepCombat(a,{dx:1},50);expect(a.exploredCells).toEqual(before);expect(b.exploredCells.length).toBeGreaterThan(before.length);
 const read=readCombatState(combatSnapshot(b));if(!read.supported)throw Error();expect(read.state.exploredCells).toEqual(b.exploredCells);
 b.completed=true;expect(replayCompletedCombat(b).exploredCells).toEqual(b.exploredCells);
 });
 it('shows living nearby enemies and excludes distant or defeated ones',()=>{
 expect(minimapNearby({x:1,y:1},{x:2,y:1,hp:10})).toBe(true);expect(minimapNearby({x:1,y:1},{x:2,y:1,hp:0})).toBe(false);expect(minimapNearby({x:1,y:1},{x:8,y:1,hp:10})).toBe(false);
 });
});

 it('migrates legacy discoveries by world position instead of reinterpreting cell indices',()=>{
 const read=readCombatState({version:1,player:{x:1.5,y:1.5},exploredCells:[8*14+12],stock:{ambar:7}});
 if(!read.supported)throw Error();
 expect(minimapDiscovered(read.state.exploredCells,{x:12.5,y:8.5})).toBe(true);
 expect(read.state.stock.ambar).toBe(7);
 const fresh=revealMinimap(read.state.exploredCells,{x:-2.5,y:4.5});
 expect(minimapDiscovered(fresh,{x:-2.5,y:4.5})).toBe(true);
 });
