import {it,expect} from 'vitest';
import {harvestPose} from './explorationHarvestPose';
it('winds up, contacts, then returns continuously around a fixed grip',()=>{expect(harvestPose(0).swing).toBeCloseTo(.2);expect(harvestPose(620*.32).swing).toBeCloseTo(-.85);expect(harvestPose(620*.56).impact).toBe(true);expect(harvestPose(620).swing).toBeCloseTo(.2);for(let t=1;t<=620;t++)expect(Math.abs(harvestPose(t).swing-harvestPose(t-1).swing)).toBeLessThan(.02);expect(harvestPose(-100).phase).toBe(0);expect(harvestPose(1000).phase).toBe(1);});
