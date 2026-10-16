import {describe,it,expect} from 'vitest';
import {composeForestClusters,FOREST_EDGE_CLUSTERS} from './biomeScenery';
import {ROOM_EDGES} from './explorationRoom';
import {PILOT_CAMP,PILOT_EXIT,PILOT_MARKER,PILOT_NODES} from './explorationCombat';
import {woodlandPropPlacement} from './explorationScenery';

describe('chapter one woodland composition',()=>{
  it('keeps rock and deadwood bases outside the walkable room',()=>{
    for(const p of ROOM_EDGES.filter(p=>p.index===0||p.index===2))
      expect(p.x<1||p.x>13||p.y<1||p.y>9).toBe(true);
  });
  it('keeps the safe point, objectives and pickups clear of perimeter artwork',()=>{
    for(const target of [PILOT_CAMP,PILOT_EXIT,PILOT_MARKER,...PILOT_NODES])for(const p of ROOM_EDGES){
      const b=woodlandPropPlacement(p.index,p.x,p.y,1,p);
      expect(target.x>=b.x-.12&&target.x<=b.x+b.width+.12&&target.y>=b.y-.12&&target.y<=b.y+b.height+.12).toBe(false);
    }
  });
  it('reuses stable world groups and gives new rooms independent group choices',()=>{
    expect(composeForestClusters(FOREST_EDGE_CLUSTERS)).toEqual(ROOM_EDGES);
    const other=composeForestClusters([{x:5,y:6,scale:1,kind:'ferns'}]);
    expect(other).not.toEqual(ROOM_EDGES);
    expect(other.every(p=>p.index===1)).toBe(true);
  });
});
