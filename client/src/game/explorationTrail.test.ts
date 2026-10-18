import {expect,it} from 'vitest';
import {explorationTrailLayout,explorationTrailPath,trailScrollTarget} from './explorationTrail';
for(const [width,height] of [[320,570],[390,600],[768,900],[844,220],[1280,540]])it(`keeps twenty usable stages inside ${width}x${height} and joins chapters`,()=>{
 const l=explorationTrailLayout(width,height,20);expect(l.points).toHaveLength(20);expect(l.vertical).toBe(true);
 for(const p of l.points){expect(p.x).toBeGreaterThan(33);expect(p.y).toBeGreaterThan(33);expect(p.x).toBeLessThan(l.width-33);expect(p.y).toBeLessThan(l.height-33);const t=trailScrollTarget(p,l,{width,height});expect(t.left).toBeGreaterThanOrEqual(0);expect(t.top).toBeGreaterThanOrEqual(0);}
 for(let i=1;i<20;i++){expect(Math.hypot(l.points[i].x-l.points[i-1].x,l.points[i].y-l.points[i-1].y)).toBeGreaterThan(70);expect(l.points[i].y).toBeLessThan(l.points[i-1].y);}
 const path=explorationTrailPath(l.points,l.vertical);expect(path.match(/M /g)).toHaveLength(1);expect(path.match(/ C /g)).toHaveLength(19);
 const expanded=explorationTrailLayout(width,height,30);for(let i=0;i<20;i++){expect(expanded.height-expanded.points[i].y).toBe(l.height-l.points[i].y);expect(expanded.points[i].x).toBe(l.points[i].x);}
});
it('clamps recentring to world edges',()=>{expect(trailScrollTarget({x:0,y:0},{width:400,height:2500},{width:400,height:600})).toEqual({left:0,top:0});expect(trailScrollTarget({x:400,y:2500},{width:400,height:2500},{width:400,height:600})).toEqual({left:0,top:1900});});
