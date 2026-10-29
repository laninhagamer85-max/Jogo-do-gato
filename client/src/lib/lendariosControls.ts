import type {CombatState} from '../game/explorationCombat';
import {nearestResource} from '../game/explorationWorkshop';
import {campaignRoom} from '../game/explorationCampaign';
import {nearCityService} from '../game/explorationVillageLayout';
import {nearMarket} from '../game/explorationMarket';
import {nearestVillager} from '../game/explorationVillage';
export function legendPrimaryAction(game:CombatState,interactionBusy=false):'attack'|'axe'|'pickaxe'|'interact'{
 if(game.castle?.active||game.village?.duel||game.enemies.some(e=>e.hp>0&&Math.hypot(e.x-game.player.x,e.y-game.player.y)<2.6))return 'attack';
 if(interactionBusy||nearCityService(game)||nearMarket(game)||nearestVillager(game))return 'interact';
 const resource=nearestResource(game);if(resource)return resource.tool;
 const room=campaignRoom(game.roomIndex),near=(p:{x:number;y:number},radius:number)=>Math.hypot(game.player.x-p.x,game.player.y-p.y)<radius;
 if(near(room.marker,1.2)||room.switches.some(p=>near(p,1)))return 'interact';
 return 'attack';
}
