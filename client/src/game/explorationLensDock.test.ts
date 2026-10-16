import {describe,it,expect} from 'vitest';
import {lensDockAction,lensDockLayout,LENS_DOCK_SLOTS,toggleWorldCameraZoom,type ExplorationPanel} from './explorationLens';
describe('approved minimap shortcut slots',()=>{
 it('opens and closes inventory in the same slot while clearing map inspection',()=>{
  const a=lensDockAction(null,true,'inventory');expect(a).toEqual({panel:'inventory',overview:false});
  expect(lensDockAction(a.panel,a.overview,'inventory')).toEqual({panel:null,overview:false});
  expect(lensDockAction('pause',false,'inventory')).toEqual(a);
 });
 it('uses the pause slot to resume from any paused state',()=>{
  expect(lensDockAction(null,false,'pause')).toEqual({panel:'pause',overview:false});
  for(const panel of ['inventory','exit','pause',null] as ExplorationPanel[])expect(lensDockAction(panel,true,'pause')).toEqual({panel:null,overview:false});
 });
 it('switches whole-map view off from the same button and removes open panels',()=>{
  expect(lensDockAction('inventory',false,'map')).toEqual({panel:null,overview:true});
  expect(lensDockAction(null,true,'map')).toEqual({panel:null,overview:false});
 });
 it.each([[375,667],[375,812],[390,844],[844,390],[1366,768]])('fits six separate >=44px targets in both lens sizes at %s×%s',(w,h)=>{
  const normal=lensDockLayout(w,h,false),expanded=lensDockLayout(w,h,true);expect(expanded.diameter).toBeGreaterThan(normal.diameter);
  for(const layout of [normal,expanded]){
   const left=w-layout.diameter-layout.right,r=layout.button/2;
   const points=Object.values(LENS_DOCK_SLOTS).map(([x,y])=>({x:left+x*layout.diameter,y:layout.top+y*layout.diameter}));
   for(const [i,p] of points.entries()){
    expect(p.x-r).toBeGreaterThanOrEqual(0);expect(p.x+r).toBeLessThanOrEqual(w);expect(p.y-r).toBeGreaterThanOrEqual(0);expect(p.y+r).toBeLessThanOrEqual(h);
    for(const q of points.slice(i+1))expect(Math.hypot(p.x-q.x,p.y-q.y)).toBeGreaterThanOrEqual(layout.button);
   }
   expect(layout.hudWidth).toBeGreaterThanOrEqual(120);
   if(!layout.landscape)expect(layout.bottom+10).toBeLessThan(h*.46);
  }
 });
});

it('alternates world camera magnification and returns to normal from intermediate zoom',()=>{
 expect(toggleWorldCameraZoom(1)).toBe(2);expect(toggleWorldCameraZoom(2)).toBe(1);expect(toggleWorldCameraZoom(1.25)).toBe(1);
 let zoom=1;for(let i=0;i<20;i++)zoom=toggleWorldCameraZoom(zoom);expect(zoom).toBe(1);
});
