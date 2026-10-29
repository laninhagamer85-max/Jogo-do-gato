import {describe,it,expect} from 'vitest';
import data from './lendariosCodex.json';
import {LEGENDS} from '../game/explorationLegends';
import {WORLD_VILLAGERS} from '../game/explorationVillageLayout';
import {EXPLORATION_ROOMS} from '../game/explorationCampaign';
describe('Published game reference data',()=>{
 it('separates existing and planned heroes using the actual roster',()=>{expect(data.heroes.map(h=>[h.id,h.ready])).toEqual(LEGENDS.map(h=>[h.id,h.ready]));});
 it('includes all authored human identities without duplicating records',()=>{expect(data.humans.length).toBe(WORLD_VILLAGERS.length);expect(new Set(data.humans.map(h=>h.id)).size).toBe(data.humans.length);expect(data.humans.find(h=>h.id==='celina-alquimista')?.role).toBe('Médica-alquimista');});
 it('keeps all 30 guide objectives equal to the game',()=>{for(const c of data.chapters)for(const r of c.rooms)expect(r.hint).toBe(EXPLORATION_ROOMS[r.number-1].hint);});
 it('includes the three actual masters and complete portrait bounds',()=>{expect(data.creatures.filter(c=>c.boss).map(c=>c.name)).toEqual(['Mestre dos Troncos','Mestre das Marés','Mestre do Âmbar']);for(const c of data.creatures){const[x,y,w,h]=c.portrait.rect;expect(x).toBeGreaterThanOrEqual(0);expect(y).toBeGreaterThanOrEqual(0);expect(x+w).toBeLessThanOrEqual(c.portrait.width+.01);expect(y+h).toBeLessThanOrEqual(c.portrait.height+.01);}});
});
