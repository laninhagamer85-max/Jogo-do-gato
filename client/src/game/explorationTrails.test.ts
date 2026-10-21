import {it,expect} from 'vitest';
import {explorationTrails} from './explorationTrails';
import {pilotWalkable,clearPilotWalkLine} from './explorationCombat';
for(const index of Array.from({length:32},(_,i)=>i))it(`room${index+1} has branching trails on actual walkable ground`,()=>{const trails=explorationTrails(index);expect(trails.length).toBeGreaterThanOrEqual(8);expect(trails.some(p=>Math.hypot(p[p.length-1].x-1.5,p[p.length-1].y-1.5)>18)).toBe(true);for(const path of trails){for(const p of path)expect(pilotWalkable(p,true,.22,index)).toBe(true);for(let i=1;i<path.length;i++)expect(clearPilotWalkLine(path[i-1],path[i],true,.22,index)).toBe(true);}expect(explorationTrails(index)).toBe(trails);});
