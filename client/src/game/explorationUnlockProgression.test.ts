import {it,expect} from 'vitest';
import {changeLegend,LEGEND_UNLOCK_RECIPE,legendUnlockRequirements} from './explorationLegends';
import {createCombatState,stepCombat,combatSnapshot,readCombatState} from './explorationCombat';
import {campaignEnemies} from './explorationCampaign';
const ready=()=>{const s=createCombatState();s.xp=1000;s.completedRooms=[0];s.stock.fibra=60;s.stock.ambar=20;s.rareStock.cristal=0;s.rareStock.seiva=0;return s;};
it('requires strictly above level five and every ingredient, atomically',()=>{
 for(const key of Object.keys(LEGEND_UNLOCK_RECIPE).filter(k=>LEGEND_UNLOCK_RECIPE[k as keyof typeof LEGEND_UNLOCK_RECIPE]>0) as (keyof typeof LEGEND_UNLOCK_RECIPE)[]){const s=ready();if(key==='fibra'||key==='ambar')s.stock[key]--;else s.rareStock[key]--;const before=combatSnapshot(s);expect(legendUnlockRequirements(s).ready).toBe(false);expect(changeLegend(s,'menino',{type:'unlock',id:'kael'})).toBe(s);expect(combatSnapshot(s)).toEqual(before);}
 const s=ready();s.xp=999;expect(legendUnlockRequirements(s).level).toBe(5);expect(changeLegend(s,'menino',{type:'unlock',id:'kael'})).toBe(s);s.xp=1000;expect(legendUnlockRequirements(s).ready).toBe(true);
});
it('combines carried and banked ingredients without negative stocks and charges only once',()=>{
 const s=ready();s.rareEquipped='cristal';s.stock.fibra=30;s.bag.fibra=30;s.rareStock.cristal=2;s.rareBag.cristal=4;
 const next=changeLegend(s,'menino',{type:'unlock',id:'kael'});expect(next.legends?.unlocked).toEqual(['kael']);expect(next.rareEquipped).toBe('cristal');expect([next.stock.fibra,next.bag.fibra,next.stock.ambar,next.rareStock.cristal,next.rareBag.cristal,next.rareStock.seiva]).toEqual([0,0,0,2,4,0]);expect(s.stock.fibra).toBe(30);expect(changeLegend(next,'menino',{type:'unlock',id:'kael'})).toBe(next);
 const r=readCombatState(combatSnapshot(next));expect(r.supported&&r.state.legends?.unlocked).toEqual(['kael']);
});
it('preserves previously owned heroes without a retroactive recipe charge',()=>{const s=createCombatState();s.legends={unlocked:['lyra'],active:null,weapons:[],weapon:null};expect(changeLegend(s,'menina',{type:'select',id:'lyra'}).legends?.active).toBe('lyra');});
it('shows a bounded level-up aura only after earned XP crosses a level boundary and never saves it',()=>{
 const s=createCombatState();s.xp=39;s.player={x:4,y:5.5};s.facing={x:0,y:1};s.enemies[0].hp=1;
 const next=stepCombat(s,{attack:true},0);expect(next.levelUpUntil).toBe(next.time+2600);expect(combatSnapshot(next)).not.toHaveProperty('levelUpUntil');
 const ordinary=createCombatState();ordinary.player={x:4,y:5.5};ordinary.facing={x:0,y:1};ordinary.enemies[0].hp=1;expect(stepCombat(ordinary,{attack:true},0).levelUpUntil).toBeUndefined();
});
it('distributes stable painted variations across biomes and preserves ids, HP, rewards and masters',()=>{
 for(const index of [5,15,25]){const variants=new Set<string>();for(let seed=1;seed<=10;seed++){const defs=campaignEnemies(index,seed);expect(campaignEnemies(index,seed)).toEqual(defs);defs.forEach(d=>{if(d.variantName){variants.add(d.variantName);expect(d.tint).toContain('hue-rotate');expect(d.hp).toBeGreaterThan(d.previousBalanceHp!);}if(d.boss)expect(d.variantName).toBeUndefined();});}expect(variants.size).toBe(2);}
});
