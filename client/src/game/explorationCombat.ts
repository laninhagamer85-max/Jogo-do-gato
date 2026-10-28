import {onCastleLanding} from './explorationCastleApproach';
import {onCastleBridge,castleBridgeStart,castleBridgeEnd} from './explorationCastleBridge';
import {insideRegion} from './biomeComposition';
import {migrateChapter4Expansion} from './explorationChapter4Migration';
import {chapter4Review,CHAPTER4_END,plateauPoint} from './explorationNascentesLayout';
import {legendKit} from './explorationLegendKits';
import {ensureWilderness,worldEnemyDefinitions,syncWildernessEnemies,saveRoamingMaster,masterWanderGoal} from './explorationWilderness';
import {cityBanned,safeSettlement,expelFromCity} from './explorationCivic';
import {registerPatrolNavigation} from './explorationCampaign';
import {newVillage,readVillage,villageSnapshot,tickVillage,villageCitizens,citizenIndoors,nearestVillager,startVillageDuel,stepVillageDuel,villageDueling,type VillageProgress} from './explorationVillage';
import {villageHouseBlocks,villageSafeAt} from './explorationVillageLayout';
import {newCastleQuest,readCastleQuest,recoverCastlePlayer,castleQuestTick,openRoyalChest,nearestRoyalChest,castleDown,royalActive,royalDispersed,clearRoyalSlot,CASTLE_TEST_ACCESS,type CastleQuest} from './explorationCastleQuest';
import {defaultBase,baseLayout,baseBlocks,insideSafeBase} from './explorationBase';
import {newWorkshop,readWorkshop,harvestResource,nearestResource,resourceNodes,awardWorkshopMaterial,type Workshop} from './explorationWorkshop';
import {openWorldBlocked} from './explorationOpenWorld';
import {CASTLE_GATE,enterCastle,readCastle,stepCastle,castleRoom,type CastleProgress} from './explorationCastle';
import {plateauStairBase,plateauStairTop,castleStairBase,castleStairTop,nascentesBlocked,nascentesTraverse,returnPortal,connectedPortal,portalDestination,nascentesElevation,nascentesElevations,nascentesGeometry,nascentesHeight,NASCENTES_SCENE} from './explorationChapter4';
import {readLegendProgress,legendWeapon,type LegendProgress} from './explorationLegends';
import {hazardPhase} from './explorationHazards';
import {campaignRoom,campaignWaterBlocks,campaignEnemies,rareDropChance,rareDropKind,type RareItem,RARE_ITEMS,EXPLORATION_ROOMS} from './explorationCampaign';
import {EXPLORATION_WORLD,insideExploration} from './explorationWorld';
import {readMinimap,revealMinimap} from './explorationMinimap';
import { ROOM_WALLS, PILOT_SHELTER, hitsEdgeScenery } from "./explorationRoom";
/** Isolated first-room pilot. No house XP, coins or adventure rewards are touched. */
export type CombatPoint = { x: number; y: number };
export const PILOT_SIZE = EXPLORATION_WORLD;
export const PILOT_CAMP = { x: 1.5, y: 1.5 };
export const PILOT_MARKER = { x: 8.5, y: 4.5 };
export const PILOT_EXIT = { x: 12.4, y: 4.5 };
export type CombatItem = 'fibra' | 'ambar' | 'erva' | 'fruta';
export const COMBAT_ITEMS: Record<CombatItem, string> = { fibra: 'Fibra', ambar: 'Âmbar', erva: 'Erva de cura', fruta: 'Fruta de energia' };
export const PILOT_WALLS = ROOM_WALLS;
export const PILOT_NODES = EXPLORATION_ROOMS[0].nodes;
export const PILOT_ENEMIES = EXPLORATION_ROOMS[0].enemies;
/** Initial tuning shared by future combat species; environmental fauna never enters this system. */
export function insectRespawnMs(enemy:{level:number;rarity:'common'|'uncommon'|'rare'}){
  return (30000+(Math.max(1,enemy.level)-1)*5000)*({common:1,uncommon:1.5,rare:2}[enemy.rarity]);
}
/** Smaller insects share their footprint and contact distances with the renderer. */
export const PILOT_INSECT={width:.64,radius:.17,stopDistance:.55,attackDistance:.82};
export type CombatEnemy = CombatPoint & { id: string; hp: number; generation: number; attackAt: number; respawnAt: number;specialAt?:number;windupUntil?:number;slowUntil?:number };
export type CombatLoot = CombatPoint & { id: string; item: CombatItem; quantity: number; rare?:RareItem; bornAt?: number; landedAt?: number; expiresAt?:number };
/** Active play time, paused with the room: common piles last longer than uncommon amber. */
export const combatLootLifetime=(item:CombatItem)=>item==='ambar'?90000:180000;
export type CombatFeedback = CombatPoint & { id: number; text: string; kind: 'damage' | 'heal' | 'xp' | 'info'; until: number };
export type RoomMemory=Pick<CombatState,'collectedNodes'|'defeatedEnemyIds'|'roomCollectedFibers'|'switchStep'|'hasRoomKey'|'bridgeEntered'|'bridgeCrossed'|'consumablesUsed'|'gateOpen'|'enemies'|'loot'|'exploredCells'|'roomPerformance'|'encounterSeed'|'openWorldCells'|'worldLayoutVersion'>;
export type CombatState = {
 village?:VillageProgress;
 workshop?:Workshop;
 castle?:CastleProgress;
  roomVisits?:Record<string,RoomMemory>;portalTarget?:number;portalCooldownUntil?:number;openWorldCells?:string[];
  worldLayoutVersion?:1;levelUpUntil?:number;npcBalanceVersion?:1;quickItems?:CombatQuickItem[];chapter3BalanceVersion?:2;powerFx?:{power:CombatPower;x:number;y:number;startedAt:number;until:number};roomStars:Record<string,number>;roomPerformance:{damage:number;defeats:number}|null;nascentesSceneVersion?:4;castleQuest?:CastleQuest;campaignVersion:2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17;legends?:LegendProgress;roomAttempts:Record<string,string>;cards:CombatCard[];activeCard:CombatCard|null;secondaryCard?:CombatCard|null;activePower?:CombatPower;rareEquipped:RareItem|null;defeatedEnemyIds:string[];portalElapsed:number;encounterSeed:number;rareStock:Record<RareItem,number>;rareBag:Record<RareItem,number>;roomIndex:number;completedRooms:number[];claimedRooms:number[];roomCollectedFibers:number;switchStep:number;hasRoomKey:boolean;bridgeEntered:boolean;bridgeCrossed:boolean;consumablesUsed:number;
  exploredCells: number[]; minimapVersion: 3;
  version: 4; revision: number; time: number; xp: number; hp: number; energy: number;
  player: CombatPoint; facing: CombatPoint; walkPhase: number; walking: boolean;
  stock: Record<CombatItem, number>; bag: Record<CombatItem, number>;
  enemies: CombatEnemy[]; loot: CombatLoot[]; collectedNodes: string[];
  defeated: number; deaths: number; gateOpen: boolean; completed: boolean; completionRewardClaimed: boolean;
  equipmentOwned: boolean; equipmentOn: boolean; seed: number;
  attackAt: number; strikeUntil: number; invulnerableUntil: number;
  feedback: CombatFeedback[]; message: string;
};
export type CombatRead = { supported: true; state: CombatState } | { supported: false; version: number };
export type CombatInput = { dx?: number; dy?: number; attack?: boolean; power?: boolean; interact?: boolean };
const emptyItems = (): Record<CombatItem, number> => ({ fibra: 0, ambar: 0, erva: 0, fruta: 0 });
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const number = (v: unknown, fallback: number, min = 0, max = 1e9) => typeof v === 'number' && Number.isFinite(v) ? clamp(v, min, max) : fallback;
const distance = (a: CombatPoint, b: CombatPoint) => Math.hypot(a.x - b.x, a.y - b.y);
export const combatLevel = (xp: number) => Math.min(100, 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 40)));
export const combatMaxHp = (xp: number) => 100 + (combatLevel(xp) - 1) * 12;
export const combatAttack = (s: Pick<CombatState, 'xp' | 'equipmentOn'> & Partial<Pick<CombatState,'rareEquipped'|'legends'|'workshop'|'castleQuest'>>) => Math.round((16 + (combatLevel(s.xp) - 1) * 3 + (s.equipmentOn ? 4 : 0)+(s.rareEquipped==='cristal'?6:0)+(legendWeapon(s as CombatState)?.bonus??0))*(royalActive(s as CombatState,'sword')&&(!s.legends?.active||s.legends.weapon==='sword')?1.4:1)*(royalActive(s as CombatState,'card')?1.15:1));
type CombatShared=Pick<CombatState,'village'|'workshop'|'castleQuest'|'legends'>;
export function createCombatState(roomIndex=0,encounterSeed=290519+roomIndex*101):CombatState{return createCombatStateShared(roomIndex,encounterSeed);}
function createCombatStateShared(roomIndex:number,encounterSeed:number,shared?:CombatShared): CombatState {
  const room=campaignRoom(roomIndex);
  return {village:shared?.village??newVillage(),castleQuest:shared?.castleQuest??newCastleQuest(),workshop:shared?.workshop??newWorkshop(),worldLayoutVersion:1,nascentesSceneVersion:room.index>=30?4:undefined,npcBalanceVersion:1,quickItems:normalizeQuickItems(undefined),chapter3BalanceVersion:2,roomStars:{},roomPerformance:{damage:0,defeats:0},campaignVersion:17,roomAttempts:{},cards:[],activeCard:null,rareEquipped:null,defeatedEnemyIds:[],portalElapsed:0,encounterSeed:encounterSeed>>>0,rareStock:{seiva:0,cristal:0,perola:0,escama:0},rareBag:{seiva:0,cristal:0,perola:0,escama:0},roomIndex:room.index,completedRooms:[],claimedRooms:[],roomCollectedFibers:0,switchStep:0,hasRoomKey:false,bridgeEntered:false,bridgeCrossed:false,consumablesUsed:0, minimapVersion: 3, exploredCells: readMinimap([],room.camp), version: 4, revision: 0, time: 0, xp: 0, hp: 100, energy: 100,
    player: { ...room.camp }, facing: { x: 1, y: 0 }, walkPhase: 0, walking: false,
    stock: { ...emptyItems(), erva: 2, fruta: 1 }, bag: emptyItems(),
    enemies: campaignEnemies(room.index,encounterSeed).map(e => ({ id: e.id, x: e.x, y: e.y, hp: e.hp, generation: 0, attackAt: 1500, respawnAt: 0 })),
    loot: [], collectedNodes: [], defeated: 0, deaths: 0, gateOpen: chapter4Review(room.index), completed: false, completionRewardClaimed: false,
    equipmentOwned: false, equipmentOn: false, seed: 290519,
    attackAt: 0, strikeUntil: 0, invulnerableUntil: 0, feedback: [],
    message: room.hint };
}
export function pilotWalkable(p: CombatPoint, gateOpen: boolean, radius = .22,roomIndex=0,workshop?:Workshop,ignoreBase=false): boolean {
  const room=campaignRoom(roomIndex);
  if(villageHouseBlocks(p,radius,roomIndex))return false;
  if(room.index>=30)return !nascentesBlocked(p,radius,gateOpen,room.index,Boolean(workshop)||ignoreBase)&&!campaignWaterBlocks(p,radius,room)&&(ignoreBase||!baseBlocks(p,radius,roomIndex,workshop));
  if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||campaignWaterBlocks(p,radius,room)||openWorldBlocked(p,radius,roomIndex))return false;
  if(resourceNodes(roomIndex).some(n=>Math.hypot(n.x-p.x,n.y-p.y)<radius+.24))return false;
  const walls = gateOpen||!room.gateBlock ? room.walls : [...room.walls,room.gateBlock];
  if(!ignoreBase&&workshop&&baseBlocks(p,radius,roomIndex,workshop))return false;
  const f=PILOT_SHELTER.footprint;
  if(!ignoreBase&&!workshop&&p.x+radius>f.x && p.x-radius<f.x+f.width && p.y+radius>f.y && p.y-radius<f.y+f.height)return false;
  return !walls.some(w => p.x + radius > w.x && p.x - radius < w.x + 1 && p.y + radius > w.y && p.y - radius < w.y + 1);
}
/** Relocate positions covered by revised scenery, preserving earned state. */
export function nearestPilotPoint(p:CombatPoint,gateOpen:boolean,roomIndex=0,workshop?:Workshop):CombatPoint {
  const room=campaignRoom(roomIndex);
  if(pilotWalkable(p,gateOpen,.22,roomIndex,workshop))return {...p};
  if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!insideExploration(p))return {...room.camp};
  const candidates=Array.from({length:PILOT_SIZE.width*PILOT_SIZE.height},(_,i)=>({x:PILOT_SIZE.left+.5+i%PILOT_SIZE.width,y:PILOT_SIZE.top+.5+Math.floor(i/PILOT_SIZE.width)})).filter(q=>pilotWalkable(q,gateOpen,.22,roomIndex,workshop));
  candidates.sort((a,b)=>distance(a,p)-distance(b,p));return candidates[0]??{...room.camp};
}
export function moveCombatPoint(p: CombatPoint, dx: number, dy: number, gateOpen: boolean, radius=.22,roomIndex=0,workshop?:Workshop): CombatPoint {
  const x = pilotWalkable({ x: p.x + dx, y: p.y }, gateOpen, radius,roomIndex,workshop) && (roomIndex<30||nascentesTraverse(p,{x:p.x+dx,y:p.y},roomIndex)) ? p.x + dx : p.x;
  return { x, y: pilotWalkable({ x, y: p.y + dy }, gateOpen, radius,roomIndex,workshop) && (roomIndex<30||nascentesTraverse({x,y:p.y},{x,y:p.y+dy},roomIndex)) ? p.y + dy : p.y };
}
function object(v: unknown): Record<string, unknown> { return v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}; }
/** Forward-version saves are never replaced; known fields are bounded on read. */
export function readCombatState(value:unknown):CombatRead{return readCombatStateShared(value);}
function readCombatStateShared(value:unknown,shared?:CombatShared):CombatRead{
  const raw = migrateChapter4Expansion(object(value)); const version = number(Number(raw.version ?? 1), 1);
  if (version > 4 || Number(raw.campaignVersion??1)>17) return { supported: false, version };
  const completedRooms=Array.isArray(raw.completedRooms)?[...new Set(raw.completedRooms.filter((v):v is number=>Number.isInteger(v)&&v>=0&&v<EXPLORATION_ROOMS.length))]:raw.completed===true?[0]:[];
  let unlocked=0;while(completedRooms.includes(unlocked)&&unlocked<EXPLORATION_ROOMS.length-1)unlocked++;
  const index=typeof raw.roomIndex==='number'&&Number.isInteger(raw.roomIndex)&&chapter4Review(raw.roomIndex)?raw.roomIndex:Math.floor(number(raw.roomIndex,0,0,unlocked));
  const room=campaignRoom(index),s = createCombatStateShared(index,number(raw.encounterSeed,290519+index*101,0,0xffffffff),shared);
  let definitions=campaignEnemies(index,s.encounterSeed);
  for(const group of ['rareStock','rareBag'] as const)for(const item of Object.keys(RARE_ITEMS) as RareItem[])s[group][item]=Math.floor(number(object(raw[group])[item],0,0,9999));
  for(const [key,value] of Object.entries(object(raw.roomAttempts)))if(completedRooms.includes(Number(key))&&String(Number(key))===key&&typeof value==='string'&&value.length<100000)s.roomAttempts[key]=value;
  if(raw.legends){s.legends=shared?.legends??readLegendProgress(raw.legends);s.campaignVersion=Math.max(s.legends?.unlocked.some(id=>id==='soren'||id==='ayla')?16:4,s.campaignVersion) as CombatState['campaignVersion'];}
  s.village=shared?.village??readVillage(raw.village);s.workshop=shared?.workshop??readWorkshop(raw.workshop);s.completedRooms=completedRooms;s.claimedRooms=Array.isArray(raw.claimedRooms)?[...new Set(raw.claimedRooms.filter((v):v is number=>Number.isInteger(v)&&v>=0&&v<EXPLORATION_ROOMS.length))]:completedRooms.slice();
  definitions=worldEnemyDefinitions(s);
  s.castleQuest=shared?.castleQuest??readCastleQuest(raw.castleQuest);s.castle=readCastle(raw.castle,royalDispersed(s));if(s.castle&&index!==CHAPTER4_END)s.castle={...s.castle,active:false};
  s.portalCooldownUntil=number(raw.portalCooldownUntil,0,0,1e9);
  if(Number.isInteger(raw.portalTarget)&&connectedPortal(index,raw.portalTarget as number))s.portalTarget=raw.portalTarget as number;
  s.openWorldCells=Array.isArray(raw.openWorldCells)?[...new Set(raw.openWorldCells.filter((v):v is string=>typeof v==='string'&&/^-?\d{1,6},-?\d{1,6}$/.test(v)))].slice(-12000):[];
  s.campaignVersion=Math.max(s.campaignVersion,number(raw.campaignVersion,s.campaignVersion,2,17)) as CombatState['campaignVersion'];
  s.roomVisits={};
  for(const [key,memory] of Object.entries(object(raw.roomVisits))){
   const ri=Number(key);if(!Number.isInteger(ri)||ri<0||ri>=EXPLORATION_ROOMS.length||!memory||typeof memory!=='object')continue;
   const parsed=readCombatStateShared({...raw,...object(memory),roomIndex:ri,completed:false,roomVisits:undefined,worldLayoutVersion:object(memory).worldLayoutVersion,portalTarget:undefined},s);
   if(parsed.supported)s.roomVisits[key]=rememberCombatRoom(parsed.state);
  }
  if (!Object.keys(raw).length) return { supported: true, state: s };
  s.roomPerformance=raw.roomPerformance&&typeof raw.roomPerformance==='object'?{damage:number(object(raw.roomPerformance).damage,0),defeats:Math.floor(number(object(raw.roomPerformance).defeats,0))}:null;
  for(const [key,value] of Object.entries(object(raw.roomStars)))if(completedRooms.includes(Number(key))&&String(Number(key))===key&&typeof value==='number'&&Number.isInteger(value)&&value>=1&&value<=3)s.roomStars[key]=value;
  s.xp = Math.floor(number(raw.xp, 0, 0, 2e6)); s.hp = number(raw.hp, combatMaxHp(s.xp), 0, combatMaxHp(s.xp));
  s.time = number(raw.time, 0); s.revision = Math.floor(number(raw.revision, 0)); s.energy = number(raw.energy, 100, 0, 100);
  s.gateOpen = raw.gateOpen === true; s.completed = raw.completed === true;
  const earnedCompletion=!chapter4Review(index)&&s.completed&&(s.portalTarget===undefined||s.gateOpen&&raw.completionRewardClaimed===true);
  s.completionRewardClaimed = raw.completionRewardClaimed === true || s.claimedRooms.includes(index) || earnedCompletion;
  if(earnedCompletion&&!s.completedRooms.includes(index))s.completedRooms.push(index);
  if(s.completionRewardClaimed&&!s.claimedRooms.includes(index))s.claimedRooms.push(index);
  s.switchStep=Math.floor(number(raw.switchStep,0,0,room.switches.length));s.hasRoomKey=raw.hasRoomKey===true;
  s.bridgeEntered=raw.bridgeEntered===true;s.bridgeCrossed=raw.bridgeCrossed===true;s.consumablesUsed=Math.floor(number(raw.consumablesUsed,0,0,9999));
  s.equipmentOwned = raw.equipmentOwned === true; s.equipmentOn = s.equipmentOwned && raw.equipmentOn === true;
  for (const group of ['stock', 'bag'] as const) for (const item of Object.keys(COMBAT_ITEMS) as CombatItem[]) s[group][item] = Math.floor(number(object(raw[group])[item], s[group][item], 0, 9999));
  s.roomCollectedFibers=Math.floor(number(raw.roomCollectedFibers,index===0?s.stock.fibra+s.bag.fibra:0,0,9999));
  const point = object(raw.player); const p = { x: number(point.x, room.camp.x, -1e5, 1e5), y: number(point.y, room.camp.y, -1e5, 1e5) };
  s.player = nearestPilotPoint(room.index>=30&&raw.nascentesSceneVersion!==4?room.camp:p, s.gateOpen,s.roomIndex,s.workshop);
  s.exploredCells = readMinimap(room.index>=30&&raw.nascentesSceneVersion!==4?[]:raw.exploredCells,s.player,raw.minimapVersion===3?3:raw.minimapVersion===2?2:1);
  const f = object(raw.facing), fx = number(f.x, 1, -1, 1), fy = number(f.y, 0, -1, 1), length = Math.hypot(fx, fy);
  s.facing = length ? { x: fx / length, y: fy / length } : { x: 1, y: 0 };
  s.cards=Array.isArray(raw.cards)?[...new Set(raw.cards.filter((c):c is CombatCard=>c==='roots'||c==='tide'||c==='amber'))]:[];
  s.quickItems=normalizeQuickItems(raw.quickItems);
  s.activeCard=s.cards.includes(raw.activeCard as CombatCard)?raw.activeCard as CombatCard:null;
  s.secondaryCard=s.cards.includes(raw.secondaryCard as CombatCard)&&raw.secondaryCard!==s.activeCard?raw.secondaryCard as CombatCard:null;
  s.activePower=raw.activePower==='roots'||raw.activePower==='tide'||raw.activePower==='amber'?s.cards.includes(raw.activePower)?raw.activePower:'burst':'burst';
  s.rareEquipped=raw.rareEquipped==='cristal'||raw.rareEquipped==='escama'?raw.rareEquipped:null;
  if(s.rareEquipped&&s.rareStock[s.rareEquipped]+s.rareBag[s.rareEquipped]<1)s.rareEquipped=null;
  s.portalElapsed=number(raw.portalElapsed,0,0,2000);
  s.defeatedEnemyIds=Array.isArray(raw.defeatedEnemyIds)?[...new Set(raw.defeatedEnemyIds.filter((id):id is string=>typeof id==='string'&&definitions.some(e=>e.id===id)))]:[];
  s.collectedNodes = room.nodes.filter(n => Array.isArray(raw.collectedNodes) && raw.collectedNodes.includes(n.id)).map(n => n.id);
  s.defeated = Math.floor(number(raw.defeated, 0)); s.deaths = Math.floor(number(raw.deaths, 0)); s.seed = number(raw.seed, s.seed, 1, 0xffffffff) >>> 0;
  s.attackAt = number(raw.attackAt, s.time, 0, s.time + 2000); s.invulnerableUntil = number(raw.invulnerableUntil, s.time, 0, s.time + 3000);
  s.enemies = definitions.map(def => {
    const rawEnemy = object(Array.isArray(raw.enemies) ? raw.enemies.find(e => object(e).id === def.id) : null);
    const migrate=raw.worldLayoutVersion!==1&&def.id.startsWith('wild-');
    const ep = { x: migrate?def.x:number(rawEnemy.x, def.x, -1e5, 1e5), y: migrate?def.y:number(rawEnemy.y, def.y, -1e5, 1e5) };
    return { id: def.id, ...nearestPilotPoint(ep, s.gateOpen,s.roomIndex,s.workshop), hp: number(typeof rawEnemy.hp==='number'&&index>=20&&raw.chapter3BalanceVersion!==2?rawEnemy.hp*def.hp/(def.previousHp??((def.previousBalanceHp??def.hp)/10)):typeof rawEnemy.hp==='number'&&raw.npcBalanceVersion!==1?rawEnemy.hp*def.hp/(def.previousBalanceHp??def.hp):rawEnemy.hp, def.hp, 0, def.hp),
      generation: Math.floor(number(rawEnemy.generation, 0)), specialAt:number(rawEnemy.specialAt,s.time+3000,0,s.time+6000),windupUntil:number(rawEnemy.windupUntil,0,0,s.time+1000),slowUntil:number(rawEnemy.slowUntil,0,0,s.time+2000), attackAt: number(rawEnemy.attackAt, s.time + 1500, 0, s.time + 2000), respawnAt: number(rawEnemy.respawnAt, 0, 0, s.time + Math.max(45000,insectRespawnMs(def))) };
  });
  if(!Array.isArray(raw.defeatedEnemyIds))s.defeatedEnemyIds=s.enemies.filter(e=>e.hp===0||e.generation>0).map(e=>e.id);
  if(room.bossId&&!s.completed&&!s.defeatedEnemyIds.includes(room.bossId)&&!s.completedRooms.includes(index))s.gateOpen=false;
  if(s.completedRooms.includes(index)||CASTLE_TEST_ACCESS&&index>=30)s.gateOpen=true;
  // Earlier generations can still have a drop after their owner has respawned.
  const allowedLoot = new Set<string>();
  s.loot = Array.isArray(raw.loot) ? raw.loot.slice(0, 48).flatMap(v => {
    const l = object(v); const id = String(l.id); const item = String(l.item) as CombatItem;
    const p = { x: number(l.x, 999, -1e9), y: number(l.y, 999, -1e9) };
    const owner=s.enemies.find(e=>id.startsWith(`${e.id}:`));
    const parts=id.split(':'),generation=Number(parts[1]),rare=(typeof l.rare==='string'&&l.rare in RARE_ITEMS)?l.rare as RareItem:undefined;
    const ownerKey=owner?.id+(rare?':rare':'');
    const def=definitions.find(e=>e.id===owner?.id);
    if (!owner || !def || id!==`${owner.id}:${generation}${rare?':rare':''}` || !Number.isInteger(generation) || generation<0 || generation>owner.generation || (generation===owner.generation && owner.hp>0) || allowedLoot.has(ownerKey) || (!rare&&item!==def.item)||(rare&&(rareDropChance(def)===0||rare!==rareDropKind(def)||item!=='ambar')) || !Number.isFinite(p.x)||!Number.isFinite(p.y)||distance(p,def)>(def.leash??6)+40) return [];
    allowedLoot.add(ownerKey); return [{ id, item, rare, ...nearestPilotPoint(p,s.gateOpen,s.roomIndex,s.workshop), bornAt: number(l.bornAt, Math.max(0, s.time - 500), 0, s.time), landedAt: number(l.landedAt, s.time, 0, s.time + 500), expiresAt:number(l.expiresAt,s.time+combatLootLifetime(item),0,s.time+combatLootLifetime(item)), quantity: Math.floor(number(l.quantity, 1, 1, 9999)) }];
  }) : [];
  if (s.hp === 0 && !castleDown(s)) return { supported: true, state: defeatCombat(s) };
  if(s.castle?.active)s.message=`${castleRoom(s.castle.room).name}. Portas liberadas para explorar o castelo.`;
  return { supported: true, state: s };
}
export function combatSnapshot(s: CombatState): Record<string, unknown> {
  const { levelUpUntil:_levelUpUntil,powerFx:_powerFx,feedback: _feedback, message: _message, strikeUntil: _strike, walking: _walking, walkPhase: _phase, ...save } = s;
  return {...save,workshop:s.workshop?{...s.workshop,result:undefined}:undefined,village:s.village?villageSnapshot(s.village):undefined};
}
function clone(s: CombatState): CombatState { return { ...s, player: { ...s.player }, facing: { ...s.facing }, stock: { ...s.stock }, bag: { ...s.bag },rareStock:{...s.rareStock},rareBag:{...s.rareBag}, enemies: s.enemies.map(e => ({ ...e })), loot: s.loot.map(l => ({ ...l })), feedback: [...s.feedback], collectedNodes: [...s.collectedNodes],completedRooms:[...s.completedRooms],claimedRooms:[...s.claimedRooms],roomStars:{...s.roomStars},roomPerformance:s.roomPerformance?{...s.roomPerformance}:null,roomAttempts:{...s.roomAttempts},cards:[...s.cards],defeatedEnemyIds:[...s.defeatedEnemyIds] }; }
function feedback(s: CombatState, p: CombatPoint, text: string, kind: CombatFeedback['kind']) {
  s.feedback.push({ ...p, id: s.revision * 100 + s.feedback.length, text, kind, until: s.time + 1100 });
  s.feedback = s.feedback.slice(-16);
}
export function defeatCombat(current: CombatState): CombatState {
  const s = clone(current),room=campaignRoom(s.roomIndex); let lost = 0;
  for (const item of ['fibra', 'ambar'] as const) { const loss = Math.floor(s.bag[item] * .1); s.bag[item] -= loss; lost += loss; }
  s.hp = combatMaxHp(s.xp); s.player = {x:baseLayout(s).home.x,y:baseLayout(s).home.y+1}; s.walking = false; s.deaths++; if(s.roomPerformance)s.roomPerformance.defeats++; s.revision++;
  s.invulnerableUntil = s.time + 2500; s.strikeUntil = 0;
  s.message = `Retorno ao ponto seguro. ${lost} material(is) da tentativa perdido(s); itens permanentes preservados.`;
  feedback(s, s.player, 'Ponto seguro', 'info'); return s;
}
export function consumeCombatItem(current: CombatState, item: 'erva' | 'fruta'): CombatState {if(castleDown(current)||villageDueling(current))return current;
  if (current.completed) return current;
  const hp = item === 'erva', maximum = hp ? combatMaxHp(current.xp) : 100, before = hp ? current.hp : current.energy;
  if (before >= maximum || current.stock[item] + current.bag[item] < 1) return current;
  const s = clone(current); if (s.bag[item] > 0) s.bag[item]--; else s.stock[item]--;
  const amount = Math.min(hp ? 35+(s.workshop?.enhancements.potion??0)*5 : 30, maximum - before);
  if (hp) s.hp += amount; else s.energy += amount;
  s.consumablesUsed++;s.revision++; s.message = `${COMBAT_ITEMS[item]}: +${Math.round(amount)} ${hp ? 'HP' : 'energia'}.`;
  feedback(s, s.player, `+${Math.round(amount)} ${hp ? 'HP' : 'energia'}`, 'heal'); return s;
}
export function equipCombatCharm(current: CombatState): CombatState {if(villageDueling(current))return current;
  return current.equipmentOwned ? { ...current, equipmentOn: !current.equipmentOn, revision: current.revision + 1 } : current;
}
function random(s: CombatState) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 0x100000000; }
export function stepCombat(current:CombatState,input:CombatInput,elapsedMs:number):CombatState{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)return current;
 if(castleDown(current)){const revived=recoverCastlePlayer(current,Date.now(),combatMaxHp(current.xp));if(revived!==current)return revived;return {...current,time:current.time+Math.min(50,elapsedMs),walking:false,strikeUntil:0};}
 if(current.completed)return current;
 if(villageDueling(current))return stepVillageDuel(current,input,elapsedMs);
 const social=nearestVillager(current);
 const guard=(input.attack||input.power)&&current.time>=current.attackAt?villageCitizens(current).find(c=>{if(c.kind!=='guard'||citizenIndoors(c,c.home,c.room)||!clearPilotLine(current.player,c,current.gateOpen,current.roomIndex,current.workshop))return false;const dx=c.x-current.player.x,dy=c.y-current.player.y,d=Math.hypot(dx,dy);return d<(input.power?2.6:legendWeapon(current)?.range??1.45)&&(input.power||d===0||(dx*current.facing.x+dy*current.facing.y)/d>.25);}):undefined;if(guard)return expelFromCity(current,guard.settlement,p=>pilotWalkable(p,true,.3,current.roomIndex,current.workshop));
 if((input.attack||input.power)&&social?.warrior&&Math.hypot(social.x-current.player.x,social.y-current.player.y)<1.45&&current.time>=current.attackAt)return startVillageDuel(current,social.id);
 if(input.interact&&social)return {...current,message:social.greeting};
 const living=ensureWilderness(tickVillage(current,Math.min(50,elapsedMs)));if(!living.castle?.active)syncWildernessEnemies(living);
 if(input.interact&&!living.castle?.active){const node=nearestResource(living);if(node){const next=harvestResource(living,node);return stepCombatCore(next,{...input,interact:false},elapsedMs);}}
 return stepCombatCore(living,input,elapsedMs);
}
function stepCombatCore(current: CombatState, input: CombatInput, elapsedMs: number): CombatState {
  if(current.completed||!Number.isFinite(elapsedMs)||elapsedMs<0)return current;
  if(current.castle?.active&&castleDown(current)){const down=clone(current);down.time+=Math.min(50,elapsedMs);return castleQuestTick(down,current.castle.room,Date.now(),combatMaxHp(down.xp));}
  if(current.castle?.active){
   const s=clone(current),dt=Math.min(50,elapsedMs),old=current.castle,p=old.player,dx=clamp(input.dx||0,-1,1),dy=clamp(input.dy||0,-1,1),length=Math.hypot(dx,dy);
   s.time+=dt;s.revision++;s.campaignVersion=Math.max(s.campaignVersion,15) as CombatState['campaignVersion'];s.castle=stepCastle(old,dx,dy,dt,royalDispersed(s),s.legends?.active==='soren'?1.1:1);s.energy=Math.min(100,s.energy+dt*.004);s.feedback=s.feedback.filter(f=>f.until>s.time);
   const d=distance(p,s.castle.player);s.walking=s.castle.room===old.room&&d>.00001;s.walkPhase=s.walking?(s.walkPhase+d/.72)%1:0;if(length)s.facing={x:dx/length,y:dy/length};
   let royalDamage=0;
   if((input.attack||input.power)&&s.time>=s.attackAt&&(!input.power||s.energy>=25)){if(input.power){s.energy-=25;s.powerFx={power:s.activePower??'burst',...s.castle.player,startedAt:s.time,until:s.time+800};}s.attackAt=s.time+(input.power?1000:500);s.strikeUntil=s.time+320;if(input.power&&s.legends?.active==='soren')s.invulnerableUntil=Math.max(s.invulnerableUntil,s.time+750);royalDamage=Math.round(combatAttack(s)*(input.power?(royalActive(s,'power')?3.2:1.6)*(s.legends?.active==='ayla'?1.25:1):1));}
   if(s.castle.room!==old.room){s.message=`${castleRoom(s.castle.room).name} · Portas livres para explorar.`;s.powerFx=undefined;s.strikeUntil=0;}
   if(!s.castle.active){s.player={x:castleStairBase.x,y:castleStairBase.y+.7};s.portalCooldownUntil=s.time+2000;s.message='Você voltou à Encosta das Fontes. O castelo continua acessível.';s.powerFx=undefined;s.strikeUntil=0;}
   let next=castleQuestTick(s,old.room,Date.now(),combatMaxHp(s.xp),royalDamage,Boolean(input.power));if(input.attack&&!input.power&&royalDamage>0&&next.castle?.active&&next.castle.room===old.room&&!castleDown(next)){const chest=nearestRoyalChest(next);if(chest)next=openRoyalChest(next,chest.id);}return next;
  }
  const s = clone(current),room=campaignRoom(s.roomIndex),definitions=worldEnemyDefinitions(s), dt = Math.min(50, elapsedMs); s.time += dt; s.revision++;
  if(s.completedRooms.includes(s.roomIndex)||CASTLE_TEST_ACCESS&&s.roomIndex>=30)s.gateOpen=true;
  {const cells=new Set(s.openWorldCells??[]);for(let y=Math.floor(s.player.y)-2;y<=Math.floor(s.player.y)+2;y++)for(let x=Math.floor(s.player.x)-2;x<=Math.floor(s.player.x)+2;x++)if(Math.hypot(x+.5-s.player.x,y+.5-s.player.y)<2.5)cells.add(`${x},${y}`);s.openWorldCells=[...cells].slice(-12000);}
  s.loot=s.loot.filter(l=>s.time<(l.expiresAt??Infinity));
  s.feedback = s.feedback.filter(f => f.until > s.time); s.energy = Math.min(100, s.energy + dt * .004);
  const dx = clamp(input.dx || 0, -1, 1), dy = clamp(input.dy || 0, -1, 1), length = Math.hypot(dx, dy);
  const previous = s.player;
  if (length) { s.facing = { x: dx / length, y: dy / length }; s.player = moveCombatPoint(s.player, s.facing.x * Math.min(1, length) * dt * .003*(s.legends?.active==='soren'?1.1:1), s.facing.y * Math.min(1, length) * dt * .003*(s.legends?.active==='soren'?1.1:1), s.gateOpen,.22,s.roomIndex,s.workshop); }
  if(cityBanned(s,s.player))s.player=previous;
  s.exploredCells = revealMinimap(s.exploredCells,s.player);
  const travel = distance(previous, s.player); s.walking = travel > .00001; s.walkPhase = s.walking ? (s.walkPhase + travel / .72) % 1 : 0;
  if(s.roomIndex===CHAPTER4_END&&distance(s.player,CASTLE_GATE)<.8&&s.time>(s.portalCooldownUntil??0)){s.castle=enterCastle(s.castle);s.campaignVersion=Math.max(s.campaignVersion,15) as CombatState['campaignVersion'];s.message='Interior do Castelo · Caminhe até o brilho de uma porta para atravessar.';return s;}
  if ((input.attack || input.power) && s.time >= s.attackAt && (!input.power || s.energy >= 25)) {
    const power = Boolean(input.power); if (power) {s.energy -= 25;s.powerFx={power:s.activePower??'burst',x:s.player.x,y:s.player.y,startedAt:s.time,until:s.time+800};}
    if(power&&s.legends?.active==='soren')s.invulnerableUntil=Math.max(s.invulnerableUntil,s.time+750);
    if(power&&legendKit(s))feedback(s,s.player,legendKit(s)!.skill,'info');
    if(power&&(hasCombatCard(s,'tide')||s.activePower==='tide')){const heal=Math.min(15,combatMaxHp(s.xp)-s.hp);s.hp+=heal;if(heal)feedback(s,s.player,`+${heal} HP`,'heal');}
    s.attackAt = s.time + (power ? 1000 : 500); s.strikeUntil = s.time + 320;
    let arrowSpent=false;const targets=!power&&s.legends?.active&&s.legends.weapon==='bow'?[...s.enemies].sort((a,b)=>distance(s.player,a)-distance(s.player,b)):s.enemies;
    for (const enemy of targets) {
      if(arrowSpent)break;
      const def = definitions.find(e => e.id === enemy.id)!; const range = distance(s.player, enemy);
      const dot = range ? ((enemy.x - s.player.x) * s.facing.x + (enemy.y - s.player.y) * s.facing.y) / range : 1;
      if (enemy.hp <= 0 || range > (power ? (royalActive(s,'power')?2.6:s.activePower==='roots'?2.2:1.7) : legendWeapon(s)?.range??1.25) || (!power && dot < (s.legends?.active&&s.legends.weapon==='bow'?.94:.25)) || !clearPilotLine(s.player, enemy, s.gateOpen,s.roomIndex,s.workshop)) continue;
      if(!power&&s.legends?.active&&s.legends.weapon==='bow')arrowSpent=true;
      const damage = Math.min(enemy.hp, Math.max(1, Math.round(combatAttack(s) * (power ? (s.legends?.active==='ayla'?1.25:1)*(1+[...new Set([s.activePower??'burst',s.activeCard,s.secondaryCard])].reduce((sum,k)=>sum+(k?s.workshop?.enhancements[k]??0:0),0)*.05)*(royalActive(s,'power')?3.2:1.6)*((hasCombatCard(s,'amber')||s.activePower==='amber')?1.25:1) : 1) - def.defense)));
      enemy.hp -= damage; if(power&&(s.legends?.active==='soren'||hasCombatCard(s,'roots')||s.activePower==='roots'))enemy.slowUntil=s.time+2000; feedback(s, enemy, `−${damage} HP`, 'damage');
      if (enemy.hp === 0) {
        awardWorkshopMaterial(s,def);
        const oldMax = combatMaxHp(s.xp), oldLevel = combatLevel(s.xp); s.xp += def.xp; s.defeated++; if(!s.defeatedEnemyIds.includes(enemy.id))s.defeatedEnemyIds.push(enemy.id); if(def.boss){if(enemy.id.startsWith('roaming-master:')){s.rareBag[rareDropKind(def)]+=3;s.workshop={...s.workshop!,materials:{...s.workshop!.materials,copperBar:Math.min(9999,s.workshop!.materials.copperBar+(s.roomIndex<10?3:0)),ironBar:Math.min(9999,s.workshop!.materials.ironBar+(s.roomIndex>=10&&s.roomIndex<20?3:0)),goldOre:Math.min(9999,s.workshop!.materials.goldOre+(s.roomIndex>=20?2:0)),diamond:Math.min(9999,s.workshop!.materials.diamond+(s.roomIndex>=20?1:0))}};}const card:CombatCard=bossCardForRoom(s.roomIndex);if(!s.cards.includes(card)){s.cards.push(card);if(!s.activeCard)s.activeCard=card;else if(!s.secondaryCard)s.secondaryCard=card;feedback(s,s.player,`Carta rara: ${COMBAT_CARDS[card].name}`,'info');}s.rareBag[rareDropKind(def)]++;} enemy.respawnAt = s.time + insectRespawnMs(def);
        feedback(s, s.player, `+${def.xp} XP`, 'xp');
        const increase = combatMaxHp(s.xp) - oldMax; s.hp += increase;
        if (combatLevel(s.xp) > oldLevel) { s.levelUpUntil=s.time+2600;feedback(s, s.player, `Nível ${combatLevel(s.xp)}`, 'info'); if (increase) feedback(s, s.player, `+${increase} HP`, 'heal'); }
        // Keep one pending pile per insect so repeated respawns do not grow the scene indefinitely.
        const pending=s.loot.find(l=>l.id.startsWith(`${enemy.id}:`) && l.item===def.item&&!l.rare);
        if(pending){pending.quantity+=def.quantity;pending.expiresAt=s.time+combatLootLifetime(def.item);}
        else s.loot.push({ id: `${enemy.id}:${enemy.generation}`, x: enemy.x, y: enemy.y, item: def.item, quantity: def.quantity, bornAt: s.time, landedAt: s.time + 500,expiresAt:s.time+combatLootLifetime(def.item) });
        if(def.art&&random(s)<rareDropChance(def)){
          const rare=rareDropKind(def),pendingRare=s.loot.find(l=>l.id.startsWith(`${enemy.id}:`)&&l.rare===rare);
          if(pendingRare){pendingRare.quantity++;pendingRare.expiresAt=s.time+180000;}
          else s.loot.push({id:`${enemy.id}:${enemy.generation}:rare`,item:'ambar',rare,quantity:1,x:enemy.x+.15,y:enemy.y+.15,bornAt:s.time,landedAt:s.time+550,expiresAt:s.time+180000});
          feedback(s,enemy,'Item raro!','info');
        }
        if (random(s) < .12 && !s.equipmentOwned) { s.equipmentOwned = true; feedback(s, s.player, 'Broche encontrado', 'info'); }
        s.message = def.boss?`Carta rara desbloqueada: ${COMBAT_CARDS[bossCardForRoom(s.roomIndex)].description}`:`${def.name} superado. Aproxime-se para coletar ${COMBAT_ITEMS[def.item]}.`;
      }
    }
  }
  for (const enemy of s.enemies) {
    const def = definitions.find(e => e.id === enemy.id)!;
    if (enemy.hp === 0) {
      const occupied = distance(s.player, def) < 2;
      if (!def.boss && s.time >= enemy.respawnAt && !occupied) { Object.assign(enemy, { x: def.x, y: def.y, hp: def.hp, generation: enemy.generation + 1, attackAt: s.time + 1500, respawnAt: 0 }); }
      continue;
    }
    const priorEnemy={x:enemy.x,y:enemy.y};
    const range = distance(s.player, enemy), safe = insideSafeBase(s)||safeSettlement(s);
    if (!safe && range < (def.detection??4) && distance(s.player,def)<(def.leash??99) && range > (def.art? .62:PILOT_INSECT.stopDistance)) {
      Object.assign(enemy, moveCombatPoint(enemy, (s.player.x - enemy.x) / range * dt * (def.speed??.00085)*(s.time<(enemy.slowUntil??0)?.45:1), (s.player.y - enemy.y) / range * dt * (def.speed??.00085)*(s.time<(enemy.slowUntil??0)?.45:1), s.gateOpen, def.radius??PILOT_INSECT.radius,s.roomIndex,s.workshop));
    } else if (safe || range > (def.detection??4) || distance(s.player,def)>=(def.leash??99)) {
      const goal=enemy.id.startsWith('roaming-master:')?masterWanderGoal(s,def):def,home = distance(enemy, goal); if (home > .1) Object.assign(enemy, moveCombatPoint(enemy, (goal.x - enemy.x) / home * dt * (def.boss?.0012:.0006), (goal.y - enemy.y) / home * dt * (def.boss?.0012:.0006), s.gateOpen, def.radius??PILOT_INSECT.radius,s.roomIndex,s.workshop));
    }
    if(villageSafeAt(s.roomIndex,enemy))Object.assign(enemy,priorEnemy);
    if(def.boss&&!safe&&range<3.2&&s.time>=(enemy.specialAt??3000)&&!enemy.windupUntil){enemy.windupUntil=s.time+900;enemy.specialAt=s.time+5500;feedback(s,enemy,'Afaste-se: golpe do mestre!','info');}
    if(enemy.windupUntil&&s.time>=enemy.windupUntil){enemy.windupUntil=0;if(!safe&&range<2.1&&s.time>=s.invulnerableUntil&&clearPilotLine(s.player,enemy,s.gateOpen,s.roomIndex,s.workshop)){const damage=Math.min(s.hp,Math.round(def.attack*1.5));s.hp-=damage;if(s.roomPerformance)s.roomPerformance.damage+=damage;s.invulnerableUntil=s.time+550;feedback(s,s.player,`−${damage} HP`,'damage');if(!s.hp)return defeatCombat(s);}}
    if (!safe && !enemy.windupUntil && distance(s.player, enemy) <= (def.attackRange??PILOT_INSECT.attackDistance) && s.time >= enemy.attackAt && s.time >= s.invulnerableUntil && clearPilotLine(s.player, enemy, s.gateOpen,s.roomIndex,s.workshop)) {
      const damage = Math.min(s.hp, Math.max(1, def.attack - Math.floor(combatLevel(s.xp) / 2) - (s.equipmentOn ? 1 : 0)-(s.legends?.active==='ayla'?3:0)-(s.rareEquipped==='escama'?4:0)-(royalActive(s,'equipmentCard')?8:0)));
      s.hp -= damage; if(s.roomPerformance)s.roomPerformance.damage+=damage; s.invulnerableUntil = s.time + 550; enemy.attackAt = s.time + 1500;
      feedback(s, s.player, `−${damage} HP`, 'damage');
      if (s.hp === 0) return defeatCombat(s);
    }
  }
  saveRoamingMaster(s);
  for (const node of room.nodes) if (!s.collectedNodes.includes(node.id) && distance(s.player, node) < .55) {
    s.collectedNodes.push(node.id); s.bag[node.item] += node.quantity;if(node.item==='fibra')s.roomCollectedFibers+=node.quantity; s.message = `+${node.quantity} ${COMBAT_ITEMS[node.item]}.`;
    feedback(s, node, `+${node.quantity} ${COMBAT_ITEMS[node.item]}`, 'info');
  }
  s.loot = s.loot.filter(l => { if (s.time < (l.landedAt ?? 0) || distance(s.player, l) >= .65) return true; if(l.rare)s.rareBag[l.rare]+=l.quantity;else s.bag[l.item] += l.quantity;if(!l.rare&&l.item==='fibra')s.roomCollectedFibers+=l.quantity; feedback(s, l, `+${l.quantity} ${l.rare?'item raro':COMBAT_ITEMS[l.item]}`, 'info'); return false; });
  if(room.key&&!s.hasRoomKey&&distance(s.player,room.key)<.55){s.hasRoomKey=true;s.message='Chave da trilha encontrada!';feedback(s,room.key,'Chave encontrada','info');}
  if(room.bridge){const b=room.bridge;
    if(s.player.x>=b.x&&s.player.x<b.x+.9&&s.player.y>b.y&&s.player.y<b.y+b.height)s.bridgeEntered=true;
    if(s.bridgeEntered&&s.player.x>b.x+b.width-.9&&s.player.y>b.y&&s.player.y<b.y+b.height)s.bridgeCrossed=true;
  }
  for(const hazard of room.hazards??[]){if(hazardPhase(hazard,s.time)==='active'&&!insideSafeBase(s)&&distance(s.player,hazard)<hazard.radius+.2&&s.time>=s.invulnerableUntil){const damage=Math.min(s.hp,hazard.kind==='steam'?16:12);s.hp-=damage;if(s.roomPerformance)s.roomPerformance.damage+=damage;s.invulnerableUntil=s.time+1000;feedback(s,s.player,`−${damage} HP`,'damage');s.message=hazard.kind==='steam'?'Vapor ativo: afaste-se do círculo.':'Espinhos abertos: contorne ou aguarde.';if(!s.hp)return defeatCombat(s);}}
  if(input.interact){
    const plate=room.switches.findIndex(p=>distance(s.player,p)<1);
    if(plate>=0){
      if(plate===s.switchStep){s.switchStep++;s.message=`Placa ${plate+1} ativada. ${s.switchStep===room.switches.length?'Sequência completa!':'Siga a numeração.'}`;}
      else if(plate>=s.switchStep){s.switchStep=0;s.message='A sequência recomeçou: ative a placa 1 primeiro.';}
    }
    if(distance(s.player,room.marker)<1.2){
      const fibers=s.roomIndex===0?s.stock.fibra+s.bag.fibra:s.roomCollectedFibers;
      if(fibers>=room.fibers&&(s.roomIndex===0?s.defeated:s.defeatedEnemyIds.length)>=room.encounters&&(!room.bossId||s.defeatedEnemyIds.includes(room.bossId))&&s.switchStep>=room.switches.length&&(!room.key||s.hasRoomKey)&&(!room.bridge||s.bridgeCrossed)&&(!room.useConsumable||s.consumablesUsed>0)){
        s.gateOpen=true;s.message='Marco ativado. Siga até o portal luminoso.';
      }else s.message=`Ainda falta um objetivo. ${room.hint}`;
    }
  }
  if(room.index>=30&&s.switchStep>=room.switches.length&&s.roomCollectedFibers>=room.fibers&&!s.gateOpen){s.gateOpen=true;s.message='Passagem liberada! Suba pela escadaria de pedra até o portal no platô.';}
  if(room.index>0&&(s.completedRooms.includes(room.index-1)||chapter4Review(room.index))&&s.time>=(s.portalCooldownUntil??0)&&distance(s.player,returnPortal(room.index))<.7){s.completed=true;s.portalElapsed=0;s.portalTarget=portalDestination(room.index,'return');s.walking=false;s.message='Atravessando o portal de retorno…';return s;}
  if(chapter4Review(room.index)&&s.gateOpen&&s.time>=(s.portalCooldownUntil??0)&&distance(s.player,room.exit)<.7){
    const target=portalDestination(room.index,'exit');
    if(target===undefined){s.message='Portal do capítulo 5 em preparação. Explore as outras salas ou visite o Castelo Bônus pela escadaria leste.';return s;}
    s.completed=true;s.portalElapsed=0;s.portalTarget=target;s.walking=false;s.message='Visitando a sala '+(target+1)+' · revisão dos cenários.';return s;
  }
  if (s.gateOpen && s.time>=(s.portalCooldownUntil??0)&&distance(s.player, room.exit) < .7) {
    s.portalTarget=portalDestination(room.index,'exit');
    for (const item of Object.keys(COMBAT_ITEMS) as CombatItem[]) { s.stock[item] += s.bag[item]; s.bag[item] = 0; }
    for(const item of Object.keys(RARE_ITEMS) as RareItem[]){s.rareStock[item]+=s.rareBag[item];s.rareBag[item]=0;}
    s.completed = true;
    if(s.roomPerformance){const stars=1+(s.roomPerformance.defeats===0?1:0)+(s.roomPerformance.defeats===0&&s.roomPerformance.damage<=combatMaxHp(s.xp)*.25?1:0);s.roomStars[s.roomIndex]=Math.max(s.roomStars[s.roomIndex]??0,stars);}
    const firstCompletion = !s.completionRewardClaimed;
    if (firstCompletion) { s.equipmentOwned = true; s.completionRewardClaimed = true; }
    if(!s.completedRooms.includes(s.roomIndex))s.completedRooms.push(s.roomIndex);
    if(!s.claimedRooms.includes(s.roomIndex))s.claimedRooms.push(s.roomIndex);
    s.walking = false;
    s.message = s.roomIndex===0?(firstCompletion ? 'Sala piloto concluída! Coleta guardada e Broche da Clareira conquistado.' : 'Sala repetida! Nova coleta guardada; broche já conquistado.'):`${room.title} concluída! Coleta guardada${s.roomIndex===9?' e primeiro capítulo finalizado':''}.`;
  }
  return s;
}
export function clearPilotLine(from: CombatPoint, to: CombatPoint, gateOpen: boolean,roomIndex=0,workshop?:Workshop) {
  return clearPilotWalkLine(from,to,gateOpen,0,roomIndex,workshop);
}
/** Shared edge check prevents touch paths from cutting across a curved shore. */
export function clearPilotWalkLine(from:CombatPoint,to:CombatPoint,gateOpen:boolean,radius=.22,roomIndex=0,workshop?:Workshop){
  const steps = Math.max(1, Math.ceil(distance(from, to) / .1));
  for (let i = 0; i <= steps; i++){const p={x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps},prev={x:from.x+(to.x-from.x)*Math.max(0,i-1)/steps,y:from.y+(to.y-from.y)*Math.max(0,i-1)/steps};if(!pilotWalkable(p,gateOpen,radius,roomIndex,workshop)||(roomIndex>=30&&!nascentesTraverse(prev,p,roomIndex)))return false;}
  return true;
}
// Static grid edges are shared by villagers. Movable player buildings bypass this cache.
const routeEdges=new Map<string,boolean>();
const routeGeometry=new Map<number,unknown[]>();
function routeEdge(from:CombatPoint,to:CombatPoint,gateOpen:boolean,roomIndex:number,workshop?:Workshop){
 if(workshop)return clearPilotWalkLine(from,to,gateOpen,.22,roomIndex,workshop);
 const room=campaignRoom(roomIndex),geometry=[room.bridge,room.walls,room.gateBlock,room.composition],previous=routeGeometry.get(roomIndex);
 if(!previous||geometry.some((value,i)=>value!==previous[i])){routeEdges.clear();routeGeometry.set(roomIndex,geometry);}
 const a=`${from.x},${from.y}`,b=`${to.x},${to.y}`,key=`${roomIndex}:${Number(gateOpen)}:${a<b?a+':'+b:b+':'+a}`;
 const hit=routeEdges.get(key);if(hit!==undefined)return hit;
 const clear=clearPilotWalkLine(from,to,gateOpen,.22,roomIndex);
 if(routeEdges.size>=20000)routeEdges.clear();routeEdges.set(key,clear);return clear;
}
/** Breadth-first touch route around the same geometry used by movement. */
export function pilotRoute(from: CombatPoint, destination: CombatPoint, gateOpen: boolean,roomIndex=0,workshop?:Workshop): CombatPoint[] {
  if(![from.x,from.y,destination.x,destination.y].every(Number.isFinite))return [];
  if(roomIndex>=30||Math.hypot(destination.x-from.x,destination.y-from.y)>20)return nascentesRoute(from,destination,gateOpen,roomIndex,workshop); 
  if(Math.hypot(destination.x-from.x,destination.y-from.y)>80)return [];
  // Short taps within one navigation cell still check the full support radius.
  if(Math.floor(from.x)===Math.floor(destination.x)&&Math.floor(from.y)===Math.floor(destination.y)&&clearPilotWalkLine(from,destination,gateOpen,.22,roomIndex,workshop))return [{...destination}];

  const minX=Math.min(from.x,destination.x)-10,maxX=Math.max(from.x,destination.x)+10,minY=Math.min(from.y,destination.y)-10,maxY=Math.max(from.y,destination.y)+10;
  const start = { x: Math.floor(from.x), y: Math.floor(from.y) }, end = { x: Math.floor(destination.x), y: Math.floor(destination.y) };
  if (!pilotWalkable({ x: end.x + .5, y: end.y + .5 }, gateOpen,.22,roomIndex,workshop)) return [];
  const key = (p: CombatPoint) => `${p.x},${p.y}`, queue = [start], previous = new Map<string, CombatPoint | null>([[key(start), null]]);
  for (let index = 0; index < queue.length; index++) {
    const p = queue[index]; if (key(p) === key(end)) { const route: CombatPoint[] = []; let current: CombatPoint | null = p; while (current && key(current) !== key(start)) { route.unshift({ x: current.x + .5, y: current.y + .5 }); current = previous.get(key(current)) ?? null; } const last=route[route.length-1]??from;if(!clearPilotWalkLine(last,destination,gateOpen,.22,roomIndex,workshop))return [];if(distance(last,destination)>.001)route.push({...destination});return route; }
    for (const d of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
      const n = { x: p.x + d.x, y: p.y + d.y };
      if(n.x<minX||n.x>maxX||n.y<minY||n.y>maxY)continue;
      const edgeStart=index===0?from:{x:p.x+.5,y:p.y+.5};
      if (!previous.has(key(n)) && (index===0?clearPilotWalkLine(edgeStart,{x:n.x+.5,y:n.y+.5},gateOpen,.22,roomIndex,workshop):routeEdge(edgeStart,{x:n.x+.5,y:n.y+.5},gateOpen,roomIndex,workshop))) { previous.set(key(n), p); queue.push(n); }
    }
  }
  return [];
}

/** Replay is opt-in after completion; permanent combat progression is retained. */
export function replayCompletedCombat(current: CombatState): CombatState {
  if (!current.completed) return current;
  const next = createCombatState(current.roomIndex);
  next.revision = current.revision + 1;
  next.time = current.time;
  next.exploredCells = [...current.exploredCells];
  next.workshop=readWorkshop(current.workshop);
  next.xp = current.xp;
  next.hp = combatMaxHp(current.xp);
  next.energy = current.energy;
  next.village=current.village;next.castleQuest=current.castleQuest;next.legends=current.legends?readLegendProgress(current.legends):undefined;if(next.legends)next.campaignVersion=Math.max(next.legends?.unlocked.some(id=>id==='soren'||id==='ayla')?16:4,next.campaignVersion) as CombatState['campaignVersion'];next.roomStars={...current.roomStars};next.roomAttempts={...current.roomAttempts};next.cards=[...current.cards];next.activeCard=current.activeCard;next.secondaryCard=current.secondaryCard;next.activePower=current.activePower;next.quickItems=normalizeQuickItems(current.quickItems);next.rareEquipped=current.rareEquipped;next.stock = { ...current.stock };next.rareStock={...current.rareStock};next.rareBag={...current.rareBag};next.encounterSeed=current.encounterSeed;
  next.enemies=campaignEnemies(next.roomIndex,next.encounterSeed).map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp,generation:0,attackAt:current.time+1500,respawnAt:0}));
  next.bag = { ...current.bag };
  next.equipmentOwned = current.equipmentOwned;
  next.equipmentOn = current.equipmentOn;
  next.completionRewardClaimed = true;next.completedRooms=[...current.completedRooms];next.claimedRooms=[...current.claimedRooms];
  next.deaths = current.deaths;
  next.seed = current.seed;
  next.enemies = next.enemies.map(enemy => ({ ...enemy, attackAt: next.time + 1500 }));
  next.invulnerableUntil = next.time + 2500;
  next.attackAt = next.time;
  next.message = 'Nova tentativa: explore, colete e enfrente os adversários. Seu progresso foi mantido.';
  return next;
}

/** Forward-only portal transition; no inventory refill, reset of XP or replay bonus. */
export function advanceCombatRoom(current:CombatState):CombatState{
 if(!current.completed||current.roomIndex>=EXPLORATION_ROOMS.length-1)return current;
 return travelCombatPortal({...current,completedRooms:[...new Set([...current.completedRooms,current.roomIndex])],claimedRooms:[...new Set([...current.claimedRooms,current.roomIndex])],portalTarget:current.roomIndex+1});

}

export type CombatCard='roots'|'tide'|'amber';
export const bossCardForRoom=(index:number):CombatCard=>index>=20?'amber':index>=10?'tide':'roots';
export const COMBAT_CARDS:Record<CombatCard,{name:string;description:string}>={amber:{name:'Coração do Âmbar',description:'Carta rara do Mestre do Âmbar. Equipada, o poder causa 25% mais dano; continua custando 25 de energia.'},roots:{name:'Coração dos Troncos',description:'Carta rara do Mestre dos Troncos. Equipada, seu poder desacelera adversários por 2 segundos.'},tide:{name:'Coração das Marés',description:'Carta rara do Mestre das Marés. Equipada, cada uso do poder recupera até 15 HP.'}};
export type CombatPower='burst'|CombatCard;
export const COMBAT_POWERS:Record<CombatPower,{name:string;description:string}>={burst:{name:'Explosão de energia',description:'Golpe em área. Custa 25 de energia.'},roots:{name:'Raízes vivas',description:'Alcance de 2,2 passos e lentidão por 2 segundos. Liberado com a carta dos Troncos.'},tide:{name:'Pulso das marés',description:'Golpe em área e recupera até 15 HP. Liberado com a carta das Marés.'},amber:{name:'Chama do âmbar',description:'Golpe em área com 25% mais dano. Liberado com a carta do Âmbar.'}};
export const hasCombatCard=(s:CombatState,card:CombatCard)=>s.cards.includes(card)&&(s.activeCard===card||s.secondaryCard===card);
export function equipCombatPower(current:CombatState,power:CombatPower):CombatState{if(villageDueling(current))return current;if(power!=='burst'&&!current.cards.includes(power))return current;current=clearRoyalSlot(current,'power');return power==='burst'||current.cards.includes(power)?{...current,activePower:power,revision:current.revision+1}:current;}
export function equipCombatCard(current:CombatState,card:CombatCard,slot:0|1=0):CombatState{if(villageDueling(current))return current;
 if(!current.cards.includes(card))return current;current=clearRoyalSlot(current,slot===0?'card':'equipmentCard');
 const key=slot===0?'activeCard':'secondaryCard',other=slot===0?'secondaryCard':'activeCard';
 const remove=current[key]===card;
 return {...current,[key]:remove?null:card,[other]:!remove&&current[other]===card?null:current[other],revision:current.revision+1};
}
export function useRareCombatItem(current:CombatState,item:RareItem):CombatState{if(castleDown(current)||villageDueling(current))return current;
 if(current.completed||current.rareStock[item]+current.rareBag[item]<1)return current;
 const s=clone(current);
 if(item==='cristal'||item==='escama'){s.rareEquipped=s.rareEquipped===item?null:item;s.message=item==='cristal'?'Cristal do bosque: +6 de ataque.':'Escama das marés: reduz dano comum em 4.';}
 else{const amount=Math.min((item==='perola'?90:60)+(s.workshop?.enhancements.potion??0)*5,combatMaxHp(s.xp)-s.hp);if(amount<=0)return current;if(s.rareBag[item]>0)s.rareBag[item]--;else s.rareStock[item]--;s.hp+=amount;s.consumablesUsed++;feedback(s,s.player,`+${amount} HP`,'heal');s.message=`${RARE_ITEMS[item]}: +${amount} HP.`;}
 s.revision++;return s;
}
/** Paused/hidden time never advances teleport. Save both sides; resume completed legacy rooms automatically. */
export function tickCombatPortal(current:CombatState,elapsedMs:number):CombatState{
 if(!current.completed||(current.roomIndex>=EXPLORATION_ROOMS.length-1&&current.portalTarget===undefined)||!Number.isFinite(elapsedMs)||elapsedMs<0)return current;
 const next={...current,portalElapsed:current.portalElapsed+Math.min(50,elapsedMs),revision:current.revision+1};
 return next.portalElapsed>=850?(next.portalTarget!==undefined?travelCombatPortal(next):advanceCombatRoom(next)):next;
}

export type CombatQuickItem='erva'|'fruta'|'seiva'|'perola';
export const QUICK_ITEMS:CombatQuickItem[]=['erva','fruta','seiva','perola'];
export function normalizeQuickItems(value:unknown):CombatQuickItem[]{
 const valid=Array.isArray(value)?value.filter((v):v is CombatQuickItem=>QUICK_ITEMS.includes(v)):[];
 return [...new Set([...valid,...QUICK_ITEMS])].slice(0,3);
}
export function setCombatQuickItem(s:CombatState,slot:number,item:CombatQuickItem):CombatState{
 if(!Number.isInteger(slot)||slot<0||slot>2||!QUICK_ITEMS.includes(item))return s;
 const quickItems=normalizeQuickItems(s.quickItems),other=quickItems.indexOf(item);
 if(quickItems[slot]===item)return s;
 if(other>=0)quickItems[other]=quickItems[slot];
 quickItems[slot]=item;return {...s,quickItems,revision:s.revision+1};
}
export function quickItemCount(s:CombatState,item:CombatQuickItem){return item==='erva'||item==='fruta'?s.stock[item]+s.bag[item]:s.rareStock[item]+s.rareBag[item];}
export function canUseQuickItem(s:CombatState,item:CombatQuickItem){return !s.completed&&quickItemCount(s,item)>0&&(item==='fruta'?s.energy<100:s.hp<combatMaxHp(s.xp));}
export function useCombatQuickItem(s:CombatState,item:CombatQuickItem){return item==='erva'||item==='fruta'?consumeCombatItem(s,item):useRareCombatItem(s,item);}

/** Half-unit route graph follows the diagonal stair and the actual painted courtyard. */
function nascentesRoute(from:CombatPoint,to:CombatPoint,open:boolean,roomIndex=30,workshop?:Workshop,viaStairs=true):CombatPoint[]{
 if(Math.hypot(to.x-from.x,to.y-from.y)>200||(roomIndex>=30&&!open&&nascentesHeight(to,roomIndex)>.1&&!(roomIndex===CHAPTER4_END&&to.x>12)))return [];
 if(!pilotWalkable(to,open,.22,roomIndex,workshop))return [];
 if(roomIndex===CHAPTER4_END&&viaStairs){
  const floor=nascentesGeometry(39)[1].floor,castle=(p:CombatPoint)=>onCastleLanding(p)||Math.hypot(p.x-castleBridgeEnd.x,p.y-castleBridgeEnd.y)<.35,fromTerrace=insideRegion(from,floor),toTerrace=insideRegion(to,floor),fromBridge=onCastleBridge(from),toBridge=onCastleBridge(to);
  if(fromBridge&&toBridge&&clearPilotWalkLine(from,to,open,.22,roomIndex,workshop))return [to];
  if((fromTerrace&&(toBridge||castle(to)))||(toTerrace&&(fromBridge||castle(from)))||(fromBridge&&castle(to))||(toBridge&&castle(from))){
   const stops:CombatPoint[]=fromTerrace?[castleBridgeStart(),...(toBridge?[to]:[castleBridgeEnd,to])]:toTerrace?[...(fromBridge?[]:[castleBridgeEnd]),castleBridgeStart(),to]:[castleBridgeEnd,to];
   let current=from;const route:CombatPoint[]=[];
   for(const stop of stops){if(Math.hypot(stop.x-current.x,stop.y-current.y)<.025)continue;const leg=nascentesRoute(current,stop,open,roomIndex,workshop,false);if(!leg.length)return [];route.push(...leg);current=stop;}return route;
  }
 }
 if(viaStairs&&roomIndex===CHAPTER4_END){
  if(onCastleLanding(to)&&nascentesHeight(from,roomIndex)<.01){const approach=nascentesRoute(from,castleStairBase,open,roomIndex,workshop,false),upper=nascentesRoute(castleStairTop,to,open,roomIndex,workshop,false);if(approach.length&&upper.length&&clearPilotWalkLine(castleStairBase,castleStairTop,open,.22,roomIndex,workshop))return [...approach,{...castleStairTop},...upper];}
  if(onCastleLanding(from)&&nascentesHeight(to,roomIndex)<.01){const upper=nascentesRoute(from,castleStairTop,open,roomIndex,workshop,false),ground=nascentesRoute(castleStairBase,to,open,roomIndex,workshop,false);if(upper.length&&ground.length&&clearPilotWalkLine(castleStairTop,castleStairBase,open,.22,roomIndex,workshop))return [...upper,{...castleStairBase},...ground];}
 }
 if(viaStairs&&roomIndex>=30){
  const geometry=nascentesGeometry(roomIndex),source=geometry.find(g=>insideRegion(from,g.floor)),destination=geometry.find(g=>insideRegion(to,g.floor));
  if(source!==destination&&(source||destination)){
   const stops:CombatPoint[]=[];
   if(source)stops.push(plateauStairTop(source.e),plateauStairBase(source.e));
   if(destination)stops.push(plateauStairBase(destination.e),plateauStairTop(destination.e));
   stops.push(to);const route:CombatPoint[]=[];let current=from;
   for(const stop of stops){if(Math.hypot(stop.x-current.x,stop.y-current.y)<.02)continue;const leg=nascentesRoute(current,stop,open,roomIndex,workshop,false);if(!leg.length)return [];route.push(...leg);current=stop;}return route;
  }
 }
 if(clearPilotWalkLine(from,to,open,.22,roomIndex,workshop))return [to];
 // Long inter-village trips use bounded legs instead of exhausting one local grid.
 const span=Math.hypot(to.x-from.x,to.y-from.y);
 if(span>55){for(const offset of [0,6,-6,12,-12]){const mid={x:(from.x+to.x)/2-(to.y-from.y)/span*offset,y:(from.y+to.y)/2+(to.x-from.x)/span*offset};if(!pilotWalkable(mid,open,.22,roomIndex,workshop)||(roomIndex>=30&&nascentesHeight(mid,roomIndex)>.01))continue;const a=nascentesRoute(from,mid,open,roomIndex,workshop),b=a.length?nascentesRoute(mid,to,open,roomIndex,workshop):[];if(a.length&&b.length)return [...a,...b];}return [];}
 const elevations=roomIndex>=30?nascentesElevations(roomIndex):[{left:-8,top:-7,size:30}],bounds={left:Math.min(from.x,to.x,...elevations.map(e=>e.left))-4,right:Math.max(from.x,to.x,...elevations.map(e=>e.left+e.size))+4,top:Math.min(from.y,to.y,...elevations.map(e=>e.top))-4,bottom:Math.max(from.y,to.y,...elevations.map(e=>e.top+e.size))+4};
 const key=(p:CombatPoint)=>`${p.x},${p.y}`,start={x:Math.round(from.x*2),y:Math.round(from.y*2)},previous=new Map<string,CombatPoint|null>([[key(start),null]]),cost=new Map([[key(start),0]]);
 type Entry={p:CombatPoint;g:number;f:number};const heap:Entry[]=[];
 const push=(a:Entry)=>{heap.push(a);let i=heap.length-1;while(i){const parent=(i-1)>>1;if(heap[parent].f<=a.f)break;heap[i]=heap[parent];i=parent;}heap[i]=a;};
 const pop=()=>{const first=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].f<heap[child].f)child++;if(heap[child].f>=last.f)break;heap[i]=heap[child];i=child;}heap[i]=last;}return first;};
 push({p:start,g:0,f:Math.hypot(start.x-to.x*2,start.y-to.y*2)});let visited=0;
 while(heap.length&&visited++<12000){const entry=pop(),p=entry.p;if(entry.g!==cost.get(key(p)))continue;const actual=key(p)===key(start)?from:{x:p.x/2,y:p.y/2};
 if(Math.hypot(actual.x-to.x,actual.y-to.y)<.65&&clearPilotWalkLine(actual,to,open,.22,roomIndex,workshop)){const route:CombatPoint[]=[to];let current:CombatPoint|null=p;while(current&&key(current)!==key(start)){route.unshift({x:current.x/2,y:current.y/2});current=previous.get(key(current))??null;}return route;}
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const n={x:p.x+dx,y:p.y+dy},g=entry.g+Math.hypot(dx,dy);if(n.x<bounds.left*2||n.x>bounds.right*2||n.y<bounds.top*2||n.y>bounds.bottom*2||g>=(cost.get(key(n))??Infinity))continue;if(clearPilotWalkLine(actual,{x:n.x/2,y:n.y/2},open,.22,roomIndex,workshop)){cost.set(key(n),g);previous.set(key(n),p);push({p:n,g,f:g+Math.hypot(n.x-to.x*2,n.y-to.y*2)});}}
 }return [];
}

export function rememberCombatRoom(s:CombatState):RoomMemory{return{worldLayoutVersion:1,collectedNodes:[...s.collectedNodes],defeatedEnemyIds:[...s.defeatedEnemyIds],roomCollectedFibers:s.roomCollectedFibers,switchStep:s.switchStep,hasRoomKey:s.hasRoomKey,bridgeEntered:s.bridgeEntered,bridgeCrossed:s.bridgeCrossed,consumablesUsed:s.consumablesUsed,gateOpen:s.gateOpen,enemies:s.enemies.map(e=>({...e})),loot:s.loot.map(l=>({...l})),exploredCells:[...s.exploredCells],roomPerformance:s.roomPerformance?{...s.roomPerformance}:null,encounterSeed:s.encounterSeed,openWorldCells:[...s.openWorldCells??[]]};}
/** Room-local memories never contain inventory/XP/HP; cooldown and offset prevent ping-pong. */
export function travelCombatPortal(current:CombatState,visitedRoom?:number):CombatState{
 const menuVisit=visitedRoom!==undefined&&visitedRoom>=0&&visitedRoom<EXPLORATION_ROOMS.length&&(current.completedRooms.includes(visitedRoom)||chapter4Review(visitedRoom));
 const target=menuVisit?visitedRoom:current.portalTarget;if(target===undefined||(!menuVisit&&!connectedPortal(current.roomIndex,target)))return current;
 if(!menuVisit&&target>current.roomIndex&&!current.completedRooms.includes(current.roomIndex)&&!(CASTLE_TEST_ACCESS&&current.roomIndex>=30&&target>=30))return current;
 if(!menuVisit&&target<current.roomIndex&&!current.completedRooms.includes(target)&&!(CASTLE_TEST_ACCESS&&current.roomIndex>=30&&target>=30))return current;
 const visits:Record<string,RoomMemory>={...current.roomVisits,[current.roomIndex]:rememberCombatRoom(current)},memory=visits[target];
 const next:CombatState={...current,...createCombatState(target),roomVisits:visits,castle:current.castle?{...current.castle,active:false}:undefined};
 for(const key of ['village','castleQuest','workshop','time','xp','hp','energy','stock','bag','rareStock','rareBag','legends','cards','activeCard','secondaryCard','activePower','quickItems','rareEquipped','equipmentOwned','equipmentOn','completedRooms','claimedRooms','roomStars','roomAttempts','deaths','seed'] as const)Object.assign(next,{[key]:current[key]});
 if(memory)Object.assign(next,memory);
 else if(current.completedRooms.includes(target)){const r=campaignRoom(target);next.gateOpen=true;next.collectedNodes=r.nodes.map(n=>n.id);next.switchStep=r.switches.length;next.roomCollectedFibers=r.fibers;next.hasRoomKey=true;next.bridgeCrossed=true;next.bridgeEntered=true;next.consumablesUsed=1;next.defeatedEnemyIds=r.enemies.map(e=>e.id);next.enemies=next.enemies.map(e=>({...e,hp:0,respawnAt:current.time+insectRespawnMs(campaignEnemies(target,next.encounterSeed).find(d=>d.id===e.id)!)}));}
 if(current.completedRooms.includes(target)||(CASTLE_TEST_ACCESS&&target>=30))next.gateOpen=true;
 next.revision=current.revision+1;next.campaignVersion=Math.max(current.campaignVersion,15) as CombatState['campaignVersion'];next.completed=false;next.portalTarget=undefined;next.portalElapsed=0;next.portalCooldownUntil=current.time+500;next.completionRewardClaimed=current.claimedRooms.includes(target);next.walking=false;next.feedback=[];next.openWorldCells=memory?.openWorldCells??[];
 const arrival=target>current.roomIndex?returnPortal(target):campaignRoom(target).exit;
 next.player=nearestPilotPoint({x:arrival.x+(target>current.roomIndex?2:-1.7),y:arrival.y+(target>=30?.4:0)},next.gateOpen,target,next.workshop);next.invulnerableUntil=current.time+2500;next.message=`${campaignRoom(target).title}. Passagens já liberadas permanecem abertas.`;return next;
}

registerPatrolNavigation((index,p)=>pilotWalkable(p,false,.5,index)&&pilotRoute(campaignRoom(index).camp,p,false,index).length>0);
