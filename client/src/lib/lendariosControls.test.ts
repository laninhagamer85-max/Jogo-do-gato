import {expect,it} from 'vitest';
import {campaignRoom} from '../game/explorationCampaign';
import {createCombatState,stepCombat} from '../game/explorationCombat';
import {resourceNodes,nearestResource} from '../game/explorationWorkshop';
import {legendPrimaryAction} from './lendariosControls';
it('shows the correct harvesting tool and prioritizes combat and conversations',()=>{const s=createCombatState();s.enemies=[];for(const tool of ['axe','pickaxe'] as const){const node=resourceNodes(0).find(n=>n.tool===tool)!;s.player={x:node.x,y:node.y};expect(nearestResource(s)?.tool).toBe(tool);expect(legendPrimaryAction(s)).toBe(tool);expect(legendPrimaryAction(s,true)).toBe('interact');s.enemies=[{id:'threat',x:s.player.x+1,y:s.player.y,hp:1,generation:0,attackAt:0,respawnAt:0}];expect(legendPrimaryAction(s)).toBe('attack');s.enemies=[];}});

it('routes the primary control to marker activation',()=>{const s=createCombatState();s.enemies=[];s.player={...campaignRoom(0).marker};s.bag.fibra=6;s.defeated=1;expect(legendPrimaryAction(s)).toBe('interact');expect(stepCombat(s,{interact:legendPrimaryAction(s)==='interact'},50).gateOpen).toBe(true);});
