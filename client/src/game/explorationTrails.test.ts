import {it,expect} from 'vitest';
import {explorationTrails} from './explorationTrails';
import {pilotWalkable,clearPilotWalkLine} from './explorationCombat';
for(const index of Array.from({length:40},(_,i)=>i))it(`room${index+1} has branching trails on actual walkable ground`,()=>{const trails=explorationTrails(index);expect(trails.length).toBeGreaterThanOrEqual(8);expect(trails.some(p=>Math.hypot(p[p.length-1].x-1.5,p[p.length-1].y-1.5)>18)).toBe(true);for(const path of trails){for(const p of path)expect(pilotWalkable(p,true,.22,index)).toBe(true);for(let i=1;i<path.length;i++)expect(clearPilotWalkLine(path[i-1],path[i],true,.22,index)).toBe(true);}expect(explorationTrails(index)).toBe(trails);});

it("village surfaces blend from worn ground to grass with varied soft edges",async()=>{const {villageGroundOpacity}=await import("./explorationTrails");expect(villageGroundOpacity(0,0,0,0)).toBeGreaterThan(.7);expect(villageGroundOpacity(11,11,0,0)).toBe(0);const edge=Array.from({length:100},(_,i)=>villageGroundOpacity(-7+i*.13,4.7,0,0));expect(edge.some(a=>a>0&&a<.9)).toBe(true);expect(edge).not.toEqual(Array.from({length:100},(_,i)=>villageGroundOpacity(-7+i*.13,4.7,10,2)));});
