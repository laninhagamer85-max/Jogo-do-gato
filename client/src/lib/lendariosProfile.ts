import {combatLevel,combatMaxHp,combatAttack,type CombatState} from '../game/explorationCombat';
export function playerName(value:string|null|undefined){return (value??'').replace(/[\u0000-\u001f\u007f]/g,'').trim().replace(/\s+/g,' ').slice(0,28);}
export function requirePlayerName(value:string){const name=playerName(value);if(name.length<2)throw Error('Informe um nome com 2 a 28 caracteres.');return name;}
export function playerEvolution(game:CombatState){const level=combatLevel(game.xp),floor=(level-1)**2*40,ceiling=level**2*40;return {level,xp:game.xp,next:level===100?null:ceiling,earned:Math.max(0,game.xp-floor),needed:ceiling-floor,maxHp:combatMaxHp(game.xp),attack:combatAttack(game),completed:game.completedRooms.length,stars:Object.values(game.roomStars).reduce((sum,n)=>sum+n,0)};}
