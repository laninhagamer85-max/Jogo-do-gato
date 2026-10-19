import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect,vi,afterEach} from 'vitest';
import {legendPose} from './explorationLegendPose';
import {drawExplorationLegend} from './explorationLegendView';
import {createCombatState} from './explorationCombat';
import ExplorationLegends from '../components/ExplorationLegends';
afterEach(()=>vi.unstubAllGlobals());
it('uses one complete isolated component per pose in every direction, including mirrored southeast',()=>{
 for(const id of ['lyra','kael'] as const)for(let direction=0;direction<8;direction++)for(let frame=0;frame<8;frame++){
  const p=legendPose(id,direction,frame);expect(p.rect.componentPixels).toBeGreaterThan(5000);expect(p.rect.height).toBeGreaterThan(140);expect(p.rect.path.startsWith('M')).toBe(true);expect(p.rect.path.endsWith('Z')).toBe(true);
  const points=p.rect.path.match(/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/g)!.map(s=>s.split(',').map(Number));
  for(const [x,y] of points){expect(x).toBeGreaterThanOrEqual(0);expect(y).toBeGreaterThanOrEqual(0);expect(x).toBeLessThanOrEqual(p.rect.width);expect(y).toBeLessThanOrEqual(p.rect.height);}
 }
 expect(legendPose('lyra',7,5).mirror).toBe(true);expect(legendPose('kael',6,5).sourceRow).toBe(2);
});
it('prepares body and illustrated weapon once and reuses native images, without geometric weapon overlays',()=>{
 let prepared=0,paths=0;const draws:unknown[][]=[];
 class FakeImage{complete=true;naturalWidth=1254;src='';}
 class FakePath{constructor(_p:string){paths++;}}
 vi.stubGlobal('Image',FakeImage);vi.stubGlobal('Path2D',FakePath);vi.stubGlobal('document',{createElement:()=>{prepared++;return {width:0,height:0,getContext:()=>({fill:vi.fn(),stroke:vi.fn(),drawImage:vi.fn()})};}});
 const ctx={save:vi.fn(),restore:vi.fn(),translate:vi.fn(),rotate:vi.fn(),scale:vi.fn(),drawImage:(...args:unknown[])=>draws.push(args)} as unknown as CanvasRenderingContext2D;
 const s=createCombatState();s.legends={unlocked:['kael'],active:'kael',weapons:['sword'],weapon:'sword'};s.facing={x:-1,y:0};s.time=160;s.strikeUntil=320;
 expect(drawExplorationLegend(ctx,s,100,150,80,false)).toBe(true);expect(prepared).toBe(2);expect(paths).toBe(2);expect(draws).toHaveLength(2);
 expect(drawExplorationLegend(ctx,s,100,150,80,false)).toBe(true);expect(prepared).toBe(2);expect(paths).toBe(2);expect(draws).toHaveLength(4);
});
it('shows future names and information while concealing their portrait art',()=>{
 vi.stubGlobal('React',React);const html=renderToStaticMarkup(React.createElement(ExplorationLegends,{game:createCombatState(),gender:'menino',onAction:()=>{}}));
 for(const name of ['Soren','Ayla','Drake','Orion','Ember','Rowan'])expect(html).toContain(name);
 expect(html.match(/class="exp-legend-hidden-portrait"/g)).toHaveLength(6);expect(html).toContain('Carrossel de Lendários');expect(html).toContain('weapons-v1.png');
});
