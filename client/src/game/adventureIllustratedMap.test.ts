import {expect,it} from 'vitest';
import {adventureIllustratedLayout,adventureWorldAt,ADVENTURE_MAP_POINTS,ADVENTURE_PAW_TRANSFORMS} from './adventureIllustratedMap';
import {trailScrollTarget} from './explorationTrail';
it('keeps 100 ordered coordinates inside the native art and 44px targets separate',()=>{
 const l=adventureIllustratedLayout();expect(l.points).toHaveLength(100);
 for(let i=0;i<100;i++){const p=l.points[i];expect(p.x).toBeGreaterThan(22);expect(p.x).toBeLessThan(l.width-22);expect(p.y).toBeGreaterThan(22);expect(p.y).toBeLessThan(l.height-22);for(let j=i+1;j<100;j++)expect(Math.hypot(p.x-l.points[j].x,p.y-l.points[j].y)).toBeGreaterThan(52);expect(adventureWorldAt(p.x,p.y)).toBe(Math.floor(i/10));}
 expect(new Set(ADVENTURE_MAP_POINTS.map(p=>`${p.x},${p.y}`)).size).toBe(100);expect(ADVENTURE_PAW_TRANSFORMS.length).toBeGreaterThan(50);
});
it('centres the saved stage in both phone orientations without losing map edges',()=>{
 const l=adventureIllustratedLayout();for(const size of [{width:351,height:570},{width:810,height:224}])for(const p of l.points){const s=trailScrollTarget(p,l,size);expect(s.left).toBeGreaterThanOrEqual(0);expect(s.top).toBeGreaterThanOrEqual(0);expect(s.left+size.width).toBeLessThanOrEqual(l.width+.01);expect(s.top+size.height).toBeLessThanOrEqual(l.height+.01);expect(p.x-s.left).toBeGreaterThan(22);expect(p.x-s.left).toBeLessThan(size.width-22);expect(p.y-s.top).toBeGreaterThan(22);expect(p.y-s.top).toBeLessThan(size.height-22);}
});
