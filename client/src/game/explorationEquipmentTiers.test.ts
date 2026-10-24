import {describe,it,expect} from 'vitest';
import {EQUIPMENT_KINDS,EQUIPMENT_TIERS,equipmentTierRequirement,tierSprite,tierWeaponStats,tierHarvestDelay} from './explorationEquipmentTiers';
describe('material equipment progression',()=>{
 it('requires base ownership, sufficient level and sequential nonrepeatable grades',()=>{
  expect(equipmentTierRequirement('sword','metal',null,100,false)).not.toBe('');
  expect(equipmentTierRequirement('sword','metal',null,5,true)).not.toBe('');
  expect(equipmentTierRequirement('sword','metal',null,6,true)).toBe('');
  expect(equipmentTierRequirement('sword','diamond','metal',100,true)).not.toBe('');
  expect(equipmentTierRequirement('bow','gold','gold',100,true)).not.toBe('');
  expect(equipmentTierRequirement('axe','diamond','gold',30,true)).toBe('');
  expect(equipmentTierRequirement('axe','metal',null,NaN,true)).not.toBe('');
 });
 it('gives all 30 variants a distinct atlas cell and progressively stronger modest effects',()=>{
  const cells=new Set();for(const kind of EQUIPMENT_KINDS)for(const tier of EQUIPMENT_TIERS){const s=tierSprite(kind,tier.id);cells.add(`${s.src}:${s.column}:${s.row}`);expect(s.column).toBeGreaterThanOrEqual(0);expect(s.row).toBeGreaterThanOrEqual(0);}
  expect(cells.size).toBe(30);let damage=6,delay=650;for(const t of EQUIPMENT_TIERS){const stats=tierWeaponStats({bonus:6,range:1.6},t.id);expect(stats.bonus).toBeGreaterThan(damage);expect(stats.range).toBe(1.6);expect(tierHarvestDelay(t.id)).toBeLessThan(delay);damage=stats.bonus;delay=tierHarvestDelay(t.id);}
 });
});
