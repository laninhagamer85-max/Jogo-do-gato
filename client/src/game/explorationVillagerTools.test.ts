import {it,expect} from 'vitest';
import {createCombatState} from './explorationCombat';
import {harvestToolStyle} from './explorationWorkshopView';
it('keeps villager axe and pickaxe common even with Crown and diamond tools equipped by the player',()=>{const s=createCombatState();s.castleQuest!.claims[s.castleQuest!.actor]={issued:true,equipmentCards:0,equipped:{axe:true,pickaxe:true}};s.workshop!.equipmentTiers.axe='diamond';s.workshop!.equipmentTiers.pickaxe='gold';const before=JSON.stringify(s);for(const tool of ['axe','pickaxe'] as const){expect(harvestToolStyle(s,tool,'villager')).toEqual({royal:false,tier:undefined});expect(harvestToolStyle(s,tool).royal).toBe(true);expect(harvestToolStyle(s,tool).tier).toBe(tool==='axe'?'diamond':'gold');}expect(JSON.stringify(s)).toBe(before);});
