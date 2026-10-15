import { describe,it,expect } from 'vitest';
import { createForestGameState,forestPositionBlocked,stepForestGame } from './forestPuzzle';
import { forestTapPath,forestRouteInput } from './forestTapNavigation';
describe('tap navigation through real puzzle collision rules',()=>{
  it('walks around the log using ordinary inputs and reaches the target without changing the puzzle',()=>{
    let state=createForestGameState(1,1);
    const before=structuredClone(state);
    const route=forestTapPath(state,{x:6.7,y:1.6})!;
    expect(route.length).toBeGreaterThan(0);
    for(const p of route)expect(forestPositionBlocked(state,p.x,p.y)).toBe(false);
    for(let i=0;i<1200 && route.length;i++) state=stepForestGame(state,forestRouteInput(state.player,route,1/60),1/60).state;
    expect(route).toHaveLength(0);
    expect(Math.hypot(state.player.x-6.5,state.player.y-1.5)).toBeLessThan(.08);
    expect(state.bumps).toBe(0);
    expect(state.objects).toEqual(before.objects);
    expect(state.openGates).toEqual(before.openGates);
    expect(state.actions).toBe(before.actions);
  });
  it('rejects walls, logs, closed gates, unreachable rooms and invalid coordinates',()=>{
    const state=createForestGameState(1,1);
    for(const target of [{x:0,y:0},{x:4,y:3},{x:7,y:3},{x:10,y:1},{x:-1,y:3},{x:NaN,y:2}])expect(forestTapPath(state,target)).toBeNull();
    state.openGates=['clearing-gate-1'];
    expect(forestTapPath(state,{x:10,y:1})).not.toBeNull();
  });
  it('cannot cross water before the real bridge is installed',()=>{
    const state=createForestGameState(2,1);
    expect(forestTapPath(state,{x:9,y:3})).toBeNull();
    state.placedBridges=['willow-bridge'];
    expect(forestTapPath(state,{x:9,y:3})).not.toBeNull();
  });
  it('stops supplying movement once the destination is reached',()=>{
    const route=[{x:2.5,y:2.5}];
    expect(forestRouteInput({x:2.5,y:2.5},route,1/60)).toEqual({});
    expect(route).toHaveLength(0);
  });
});
