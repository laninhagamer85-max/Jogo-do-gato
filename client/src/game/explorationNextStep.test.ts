import {it,expect} from 'vitest';
import {createCombatState} from './explorationCombat';
import {campaignRoom} from './explorationCampaign';
import {explorationNextStep} from './explorationNextStep';
it('shows collection then combat then the real remaining room unlock action',()=>{const s=createCombatState(),r=campaignRoom(0);expect(explorationNextStep(s).text).toContain('fibras');s.stock.fibra=r.fibers;expect(explorationNextStep(s).text).toContain('NPCs');s.defeated=r.encounters;const next=explorationNextStep(s);expect(next.text).toContain('marco');expect(next.step).toBe(next.total);s.gateOpen=true;expect(explorationNextStep(s).text).toContain('portal');});
it('does not send test rooms after encounters or a marker they do not require',()=>{const s=createCombatState(30),r=campaignRoom(30);s.gateOpen=false;s.roomCollectedFibers=r.fibers;s.switchStep=r.switches.length;expect(explorationNextStep(s).text).not.toMatch(/NPCs|marco/);s.gateOpen=true;expect(explorationNextStep(s).text).toContain('escadaria');});
