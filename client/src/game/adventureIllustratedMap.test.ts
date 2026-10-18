import {expect,it} from 'vitest';
import {adventureIllustratedLayout,adventureWorldAt} from './adventureIllustratedMap';
import {trailScrollTarget} from './explorationTrail';
it('frames each portrait world across the viewport without horizontal overflow or fixed zoom',()=>{
 for(const width of [300,341,390,600]){const l=adventureIllustratedLayout(width,540,true);expect(l.width).toBe(width);expect(l.tiles).toHaveLength(10);expect(l.points).toHaveLength(100);expect(l.tiles.every(t=>t.width===width)).toBe(true);expect(l.tiles[1].y).toBeLessThan(l.tiles[0].y);for(const p of l.points){expect(p.x).toBeGreaterThan(22);expect(p.x).toBeLessThan(width-22);}}
});
it('uses upright panoramic worlds that advance right and fit the available height',()=>{
 for(const height of [200,224,390]){const l=adventureIllustratedLayout(844,height,false);expect(l.height).toBe(height);expect(l.tiles[1].x).toBeGreaterThan(l.tiles[0].x);for(let i=1;i<100;i++)expect(l.points[i].x).toBeGreaterThan(l.points[i-1].x);expect(l.tiles[0].width/l.tiles[0].height).toBeCloseTo(40/9);}
});
it('keeps every stage selectable separately in either orientation and retains its world',()=>{
 for(const [width,height,vertical] of [[341,540,true],[844,224,false],[300,460,true],[700,200,false]] as const){const l=adventureIllustratedLayout(width,height,vertical);expect(l.points).toHaveLength(100);expect(l.paws.length).toBeGreaterThan(40);for(let i=0;i<100;i++){const p=l.points[i];expect(adventureWorldAt(p.x,p.y,l)).toBe(Math.floor(i/10));for(let j=i+1;j<100;j++)expect(Math.hypot(p.x-l.points[j].x,p.y-l.points[j].y)).toBeGreaterThan(44);const s=trailScrollTarget(p,l,{width,height});expect(p.x-s.left).toBeGreaterThan(21);expect(p.x-s.left).toBeLessThan(width-21);expect(p.y-s.top).toBeGreaterThan(21);expect(p.y-s.top).toBeLessThan(height-21);}}
});
