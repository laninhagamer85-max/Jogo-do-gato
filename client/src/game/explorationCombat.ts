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
export type CombatState = {
  levelUpUntil?:number;npcBalanceVersion?:1;quickItems?:CombatQuickItem[];chapter3BalanceVersion?:2;powerFx?:{power:CombatPower;x:number;y:number;startedAt:number;until:number};roomStars:Record<string,number>;roomPerformance:{damage:number;defeats:number}|null;campaignVersion:2|3|4;legends?:LegendProgress;roomAttempts:Record<string,string>;cards:CombatCard[];activeCard:CombatCard|null;secondaryCard?:CombatCard|null;activePower?:CombatPower;rareEquipped:RareItem|null;defeatedEnemyIds:string[];portalElapsed:number;encounterSeed:number;rareStock:Record<RareItem,number>;rareBag:Record<RareItem,number>;roomIndex:number;completedRooms:number[];claimedRooms:number[];roomCollectedFibers:number;switchStep:number;hasRoomKey:boolean;bridgeEntered:boolean;bridgeCrossed:boolean;consumablesUsed:number;
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
export const combatLevel = (xp: number) => Math.min(20, 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 40)));
export const combatMaxHp = (xp: number) => 100 + (combatLevel(xp) - 1) * 12;
export const combatAttack = (s: Pick<CombatState, 'xp' | 'equipmentOn'> & Partial<Pick<CombatState,'rareEquipped'|'legends'>>) => 16 + (combatLevel(s.xp) - 1) * 3 + (s.equipmentOn ? 4 : 0)+(s.rareEquipped==='cristal'?6:0)+(legendWeapon(s as CombatState)?.bonus??0);
export function createCombatState(roomIndex=0,encounterSeed=290519+roomIndex*101): CombatState {
  const room=campaignRoom(roomIndex);
  return {npcBalanceVersion:1,quickItems:normalizeQuickItems(undefined),chapter3BalanceVersion:2,roomStars:{},roomPerformance:{damage:0,defeats:0},campaignVersion:room.index>=20?3:2,roomAttempts:{},cards:[],activeCard:null,rareEquipped:null,defeatedEnemyIds:[],portalElapsed:0,encounterSeed:encounterSeed>>>0,rareStock:{seiva:0,cristal:0,perola:0,escama:0},rareBag:{seiva:0,cristal:0,perola:0,escama:0},roomIndex:room.index,completedRooms:[],claimedRooms:[],roomCollectedFibers:0,switchStep:0,hasRoomKey:false,bridgeEntered:false,bridgeCrossed:false,consumablesUsed:0, minimapVersion: 3, exploredCells: readMinimap([],room.camp), version: 4, revision: 0, time: 0, xp: 0, hp: 100, energy: 100,
    player: { ...room.camp }, facing: { x: 1, y: 0 }, walkPhase: 0, walking: false,
    stock: { ...emptyItems(), erva: 2, fruta: 1 }, bag: emptyItems(),
    enemies: campaignEnemies(room.index,encounterSeed).map(e => ({ id: e.id, x: e.x, y: e.y, hp: e.hp, generation: 0, attackAt: 1500, respawnAt: 0 })),
    loot: [], collectedNodes: [], defeated: 0, deaths: 0, gateOpen: false, completed: false, completionRewardClaimed: false,
    equipmentOwned: false, equipmentOn: false, seed: 290519,
    attackAt: 0, strikeUntil: 0, invulnerableUntil: 0, feedback: [],
    message: room.hint };
}
export function pilotWalkable(p: CombatPoint, gateOpen: boolean, radius = .22,roomIndex=0): boolean {
  const room=campaignRoom(roomIndex);
  if (campaignWaterBlocks(p,radius,room)||!insideExploration(p,radius) || hitsEdgeScenery(p,radius)) return false;
  const walls = gateOpen||!room.gateBlock ? room.walls : [...room.walls,room.gateBlock];
  const f=PILOT_SHELTER.footprint;
  if(p.x+radius>f.x && p.x-radius<f.x+f.width && p.y+radius>f.y && p.y-radius<f.y+f.height)return false;
  return !walls.some(w => p.x + radius > w.x && p.x - radius < w.x + 1 && p.y + radius > w.y && p.y - radius < w.y + 1);
}
/** Relocate positions covered by revised scenery, preserving earned state. */
export function nearestPilotPoint(p:CombatPoint,gateOpen:boolean,roomIndex=0):CombatPoint {
  const room=campaignRoom(roomIndex);
  if(pilotWalkable(p,gateOpen,.22,roomIndex))return {...p};
  if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!insideExploration(p))return {...room.camp};
  const candidates=Array.from({length:PILOT_SIZE.width*PILOT_SIZE.height},(_,i)=>({x:PILOT_SIZE.left+.5+i%PILOT_SIZE.width,y:PILOT_SIZE.top+.5+Math.floor(i/PILOT_SIZE.width)})).filter(q=>pilotWalkable(q,gateOpen,.22,roomIndex));
  candidates.sort((a,b)=>distance(a,p)-distance(b,p));return candidates[0]??{...room.camp};
}
function move(p: CombatPoint, dx: number, dy: number, gateOpen: boolean, radius=.22,roomIndex=0): CombatPoint {
  const x = pilotWalkable({ x: p.x + dx, y: p.y }, gateOpen, radius,roomIndex) ? p.x + dx : p.x;
  return { x, y: pilotWalkable({ x, y: p.y + dy }, gateOpen, radius,roomIndex) ? p.y + dy : p.y };
}
function object(v: unknown): Record<string, unknown> { return v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}; }
/** Forward-version saves are never replaced; known fields are bounded on read. */
export function readCombatState(value: unknown): CombatRead {
  const raw = object(value); const version = number(Number(raw.version ?? 1), 1);
  if (version > 4 || Number(raw.campaignVersion??1)>4) return { supported: false, version };
  const completedRooms=Array.isArray(raw.completedRooms)?[...new Set(raw.completedRooms.filter((v):v is number=>Number.isInteger(v)&&v>=0&&v<EXPLORATION_ROOMS.length))]:raw.completed===true?[0]:[];
  let unlocked=0;while(completedRooms.includes(unlocked)&&unlocked<EXPLORATION_ROOMS.length-1)unlocked++;
  const index=Math.floor(number(raw.roomIndex,0,0,unlocked));
  const room=campaignRoom(index),s = createCombatState(index,number(raw.encounterSeed,290519+index*101,0,0xffffffff));
  const definitions=campaignEnemies(index,s.encounterSeed);
  for(const group of ['rareStock','rareBag'] as const)for(const item of Object.keys(RARE_ITEMS) as RareItem[])s[group][item]=Math.floor(number(object(raw[group])[item],0,0,9999));
  for(const [key,value] of Object.entries(object(raw.roomAttempts)))if(completedRooms.includes(Number(key))&&String(Number(key))===key&&typeof value==='string'&&value.length<100000)s.roomAttempts[key]=value;
  if(raw.legends){s.legends=readLegendProgress(raw.legends);s.campaignVersion=4;}
  s.completedRooms=completedRooms;s.claimedRooms=Array.isArray(raw.claimedRooms)?[...new Set(raw.claimedRooms.filter((v):v is number=>Number.isInteger(v)&&v>=0&&v<EXPLORATION_ROOMS.length))]:completedRooms.slice();
  if (!Object.keys(raw).length) return { supported: true, state: s };
  s.roomPerformance=raw.roomPerformance&&typeof raw.roomPerformance==='object'?{damage:number(object(raw.roomPerformance).damage,0),defeats:Math.floor(number(object(raw.roomPerformance).defeats,0))}:null;
  for(const [key,value] of Object.entries(object(raw.roomStars)))if(completedRooms.includes(Number(key))&&String(Number(key))===key&&typeof value==='number'&&Number.isInteger(value)&&value>=1&&value<=3)s.roomStars[key]=value;
  s.xp = Math.floor(number(raw.xp, 0, 0, 2e6)); s.hp = number(raw.hp, combatMaxHp(s.xp), 0, combatMaxHp(s.xp));
  s.time = number(raw.time, 0); s.revision = Math.floor(number(raw.revision, 0)); s.energy = number(raw.energy, 100, 0, 100);
  s.gateOpen = raw.gateOpen === true; s.completed = raw.completed === true;
  s.completionRewardClaimed = raw.completionRewardClaimed === true || s.claimedRooms.includes(index) || s.completed;
  if(s.completed&&!s.completedRooms.includes(index))s.completedRooms.push(index);
  if(s.completionRewardClaimed&&!s.claimedRooms.includes(index))s.claimedRooms.push(index);
  s.switchStep=Math.floor(number(raw.switchStep,0,0,room.switches.length));s.hasRoomKey=raw.hasRoomKey===true;
  s.bridgeEntered=raw.bridgeEntered===true;s.bridgeCrossed=raw.bridgeCrossed===true;s.consumablesUsed=Math.floor(number(raw.consumablesUsed,0,0,9999));
  s.equipmentOwned = raw.equipmentOwned === true; s.equipmentOn = s.equipmentOwned && raw.equipmentOn === true;
  for (const group of ['stock', 'bag'] as const) for (const item of Object.keys(COMBAT_ITEMS) as CombatItem[]) s[group][item] = Math.floor(number(object(raw[group])[item], s[group][item], 0, 9999));
  s.roomCollectedFibers=Math.floor(number(raw.roomCollectedFibers,index===0?s.stock.fibra+s.bag.fibra:0,0,9999));
  const point = object(raw.player); const p = { x: number(point.x, room.camp.x, PILOT_SIZE.left, PILOT_SIZE.left+PILOT_SIZE.width), y: number(point.y, room.camp.y, PILOT_SIZE.top, PILOT_SIZE.top+PILOT_SIZE.height) };
  s.player = nearestPilotPoint(p, s.gateOpen,s.roomIndex);
  s.exploredCells = readMinimap(raw.exploredCells,s.player,raw.minimapVersion===3?3:raw.minimapVersion===2?2:1);
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
    const ep = { x: number(rawEnemy.x, def.x, PILOT_SIZE.left, PILOT_SIZE.left+PILOT_SIZE.width), y: number(rawEnemy.y, def.y, PILOT_SIZE.top, PILOT_SIZE.top+PILOT_SIZE.height) };
    return { id: def.id, ...nearestPilotPoint(ep, s.gateOpen,s.roomIndex), hp: number(typeof rawEnemy.hp==='number'&&index>=20&&raw.chapter3BalanceVersion!==2?rawEnemy.hp*def.hp/(def.previousHp??((def.previousBalanceHp??def.hp)/10)):typeof rawEnemy.hp==='number'&&raw.npcBalanceVersion!==1?rawEnemy.hp*def.hp/(def.previousBalanceHp??def.hp):rawEnemy.hp, def.hp, 0, def.hp),
      generation: Math.floor(number(rawEnemy.generation, 0)), specialAt:number(rawEnemy.specialAt,s.time+3000,0,s.time+6000),windupUntil:number(rawEnemy.windupUntil,0,0,s.time+1000),slowUntil:number(rawEnemy.slowUntil,0,0,s.time+2000), attackAt: number(rawEnemy.attackAt, s.time + 1500, 0, s.time + 2000), respawnAt: number(rawEnemy.respawnAt, 0, 0, s.time + Math.max(45000,insectRespawnMs(def))) };
  });
  if(!Array.isArray(raw.defeatedEnemyIds))s.defeatedEnemyIds=s.enemies.filter(e=>e.hp===0||e.generation>0).map(e=>e.id);
  if(room.bossId&&!s.completed&&!s.defeatedEnemyIds.includes(room.bossId))s.gateOpen=false;
  // Earlier generations can still have a drop after their owner has respawned.
  const allowedLoot = new Set<string>();
  s.loot = Array.isArray(raw.loot) ? raw.loot.slice(0, 48).flatMap(v => {
    const l = object(v); const id = String(l.id); const item = String(l.item) as CombatItem;
    const p = { x: number(l.x, 999, -1e9), y: number(l.y, 999, -1e9) };
    const owner=s.enemies.find(e=>id.startsWith(`${e.id}:`));
    const parts=id.split(':'),generation=Number(parts[1]),rare=(typeof l.rare==='string'&&l.rare in RARE_ITEMS)?l.rare as RareItem:undefined;
    const ownerKey=owner?.id+(rare?':rare':'');
    const def=definitions.find(e=>e.id===owner?.id);
    if (!owner || !def || id!==`${owner.id}:${generation}${rare?':rare':''}` || !Number.isInteger(generation) || generation<0 || generation>owner.generation || (generation===owner.generation && owner.hp>0) || allowedLoot.has(ownerKey) || (!rare&&item!==def.item)||(rare&&(rareDropChance(def)===0||rare!==rareDropKind(def)||item!=='ambar')) || !insideExploration(p)) return [];
    allowedLoot.add(ownerKey); return [{ id, item, rare, ...nearestPilotPoint(p,s.gateOpen,s.roomIndex), bornAt: number(l.bornAt, Math.max(0, s.time - 500), 0, s.time), landedAt: number(l.landedAt, s.time, 0, s.time + 500), expiresAt:number(l.expiresAt,s.time+combatLootLifetime(item),0,s.time+combatLootLifetime(item)), quantity: Math.floor(number(l.quantity, 1, 1, 9999)) }];
  }) : [];
  if (s.hp === 0) return { supported: true, state: defeatCombat(s) };
  return { supported: true, state: s };
}
export function combatSnapshot(s: CombatState): Record<string, unknown> {
  const { levelUpUntil:_levelUpUntil,powerFx:_powerFx,feedback: _feedback, message: _message, strikeUntil: _strike, walking: _walking, walkPhase: _phase, ...save } = s;
  return save;
}
function clone(s: CombatState): CombatState { return { ...s, player: { ...s.player }, facing: { ...s.facing }, stock: { ...s.stock }, bag: { ...s.bag },rareStock:{...s.rareStock},rareBag:{...s.rareBag}, enemies: s.enemies.map(e => ({ ...e })), loot: s.loot.map(l => ({ ...l })), feedback: [...s.feedback], collectedNodes: [...s.collectedNodes],completedRooms:[...s.completedRooms],claimedRooms:[...s.claimedRooms],roomStars:{...s.roomStars},roomPerformance:s.roomPerformance?{...s.roomPerformance}:null,roomAttempts:{...s.roomAttempts},cards:[...s.cards],defeatedEnemyIds:[...s.defeatedEnemyIds] }; }
function feedback(s: CombatState, p: CombatPoint, text: string, kind: CombatFeedback['kind']) {
  s.feedback.push({ ...p, id: s.revision * 100 + s.feedback.length, text, kind, until: s.time + 1100 });
  s.feedback = s.feedback.slice(-16);
}
export function defeatCombat(current: CombatState): CombatState {
  const s = clone(current),room=campaignRoom(s.roomIndex); let lost = 0;
  for (const item of ['fibra', 'ambar'] as const) { const loss = Math.floor(s.bag[item] * .1); s.bag[item] -= loss; lost += loss; }
  s.hp = combatMaxHp(s.xp); s.player = { ...room.camp }; s.walking = false; s.deaths++; if(s.roomPerformance)s.roomPerformance.defeats++; s.revision++;
  s.invulnerableUntil = s.time + 2500; s.strikeUntil = 0;
  s.message = `Retorno ao ponto seguro. ${lost} material(is) da tentativa perdido(s); itens permanentes preservados.`;
  feedback(s, s.player, 'Ponto seguro', 'info'); return s;
}
export function consumeCombatItem(current: CombatState, item: 'erva' | 'fruta'): CombatState {
  if (current.completed) return current;
  const hp = item === 'erva', maximum = hp ? combatMaxHp(current.xp) : 100, before = hp ? current.hp : current.energy;
  if (before >= maximum || current.stock[item] + current.bag[item] < 1) return current;
  const s = clone(current); if (s.bag[item] > 0) s.bag[item]--; else s.stock[item]--;
  const amount = Math.min(hp ? 35 : 30, maximum - before);
  if (hp) s.hp += amount; else s.energy += amount;
  s.consumablesUsed++;s.revision++; s.message = `${COMBAT_ITEMS[item]}: +${Math.round(amount)} ${hp ? 'HP' : 'energia'}.`;
  feedback(s, s.player, `+${Math.round(amount)} ${hp ? 'HP' : 'energia'}`, 'heal'); return s;
}
export function equipCombatCharm(current: CombatState): CombatState {
  return current.equipmentOwned ? { ...current, equipmentOn: !current.equipmentOn, revision: current.revision + 1 } : current;
}
function random(s: CombatState) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 0x100000000; }
export function stepCombat(current: CombatState, input: CombatInput, elapsedMs: number): CombatState {
  if (current.completed || !Number.isFinite(elapsedMs) || elapsedMs < 0) return current;
  const s = clone(current),room=campaignRoom(s.roomIndex),definitions=campaignEnemies(s.roomIndex,s.encounterSeed), dt = Math.min(50, elapsedMs); s.time += dt; s.revision++;
  s.loot=s.loot.filter(l=>s.time<(l.expiresAt??Infinity));
  s.feedback = s.feedback.filter(f => f.until > s.time); s.energy = Math.min(100, s.energy + dt * .004);
  const dx = clamp(input.dx || 0, -1, 1), dy = clamp(input.dy || 0, -1, 1), length = Math.hypot(dx, dy);
  const previous = s.player;
  if (length) { s.facing = { x: dx / length, y: dy / length }; s.player = move(s.player, s.facing.x * Math.min(1, length) * dt * .003, s.facing.y * Math.min(1, length) * dt * .003, s.gateOpen,.22,s.roomIndex); }
  s.exploredCells = revealMinimap(s.exploredCells,s.player);
  const travel = distance(previous, s.player); s.walking = travel > .00001; s.walkPhase = s.walking ? (s.walkPhase + travel / .72) % 1 : 0;
  if ((input.attack || input.power) && s.time >= s.attackAt && (!input.power || s.energy >= 25)) {
    const power = Boolean(input.power); if (power) {s.energy -= 25;s.powerFx={power:s.activePower??'burst',x:s.player.x,y:s.player.y,startedAt:s.time,until:s.time+800};}
    if(power&&(hasCombatCard(s,'tide')||s.activePower==='tide')){const heal=Math.min(15,combatMaxHp(s.xp)-s.hp);s.hp+=heal;if(heal)feedback(s,s.player,`+${heal} HP`,'heal');}
    s.attackAt = s.time + (power ? 1000 : 500); s.strikeUntil = s.time + 320;
    let arrowSpent=false;const targets=!power&&s.legends?.active&&s.legends.weapon==='bow'?[...s.enemies].sort((a,b)=>distance(s.player,a)-distance(s.player,b)):s.enemies;
    for (const enemy of targets) {
      if(arrowSpent)break;
      const def = definitions.find(e => e.id === enemy.id)!; const range = distance(s.player, enemy);
      const dot = range ? ((enemy.x - s.player.x) * s.facing.x + (enemy.y - s.player.y) * s.facing.y) / range : 1;
      if (enemy.hp <= 0 || range > (power ? (s.activePower==='roots'?2.2:1.7) : legendWeapon(s)?.range??1.25) || (!power && dot < (s.legends?.active&&s.legends.weapon==='bow'?.94:.25)) || !clearPilotLine(s.player, enemy, s.gateOpen,s.roomIndex)) continue;
      if(!power&&s.legends?.active&&s.legends.weapon==='bow')arrowSpent=true;
      const damage = Math.min(enemy.hp, Math.max(1, Math.round(combatAttack(s) * (power ? 1.6*((hasCombatCard(s,'amber')||s.activePower==='amber')?1.25:1) : 1) - def.defense)));
      enemy.hp -= damage; if(power&&(hasCombatCard(s,'roots')||s.activePower==='roots'))enemy.slowUntil=s.time+2000; feedback(s, enemy, `−${damage} HP`, 'damage');
      if (enemy.hp === 0) {
        const oldMax = combatMaxHp(s.xp), oldLevel = combatLevel(s.xp); s.xp += def.xp; s.defeated++; if(!s.defeatedEnemyIds.includes(enemy.id))s.defeatedEnemyIds.push(enemy.id); if(def.boss){const card:CombatCard=bossCardForRoom(s.roomIndex);if(!s.cards.includes(card)){s.cards.push(card);if(!s.activeCard)s.activeCard=card;else if(!s.secondaryCard)s.secondaryCard=card;feedback(s,s.player,`Carta rara: ${COMBAT_CARDS[card].name}`,'info');}s.rareBag[rareDropKind(def)]++;} enemy.respawnAt = s.time + insectRespawnMs(def);
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
    const range = distance(s.player, enemy), safe = distance(s.player, room.camp) < 1.6;
    if (!safe && range < (def.detection??4) && distance(s.player,def)<(def.leash??99) && range > (def.art? .62:PILOT_INSECT.stopDistance)) {
      Object.assign(enemy, move(enemy, (s.player.x - enemy.x) / range * dt * (def.speed??.00085)*(s.time<(enemy.slowUntil??0)?.45:1), (s.player.y - enemy.y) / range * dt * (def.speed??.00085)*(s.time<(enemy.slowUntil??0)?.45:1), s.gateOpen, def.radius??PILOT_INSECT.radius,s.roomIndex));
    } else if (safe || range > (def.detection??4) || distance(s.player,def)>=(def.leash??99)) {
      const home = distance(enemy, def); if (home > .1) Object.assign(enemy, move(enemy, (def.x - enemy.x) / home * dt * .0006, (def.y - enemy.y) / home * dt * .0006, s.gateOpen, def.radius??PILOT_INSECT.radius,s.roomIndex));
    }
    if(def.boss&&!safe&&range<3.2&&s.time>=(enemy.specialAt??3000)&&!enemy.windupUntil){enemy.windupUntil=s.time+900;enemy.specialAt=s.time+5500;feedback(s,enemy,'Afaste-se: golpe do mestre!','info');}
    if(enemy.windupUntil&&s.time>=enemy.windupUntil){enemy.windupUntil=0;if(!safe&&range<2.1&&s.time>=s.invulnerableUntil&&clearPilotLine(s.player,enemy,s.gateOpen,s.roomIndex)){const damage=Math.min(s.hp,Math.round(def.attack*1.5));s.hp-=damage;if(s.roomPerformance)s.roomPerformance.damage+=damage;s.invulnerableUntil=s.time+550;feedback(s,s.player,`−${damage} HP`,'damage');if(!s.hp)return defeatCombat(s);}}
    if (!safe && !enemy.windupUntil && distance(s.player, enemy) <= (def.attackRange??PILOT_INSECT.attackDistance) && s.time >= enemy.attackAt && s.time >= s.invulnerableUntil && clearPilotLine(s.player, enemy, s.gateOpen,s.roomIndex)) {
      const damage = Math.min(s.hp, Math.max(1, def.attack - Math.floor(combatLevel(s.xp) / 2) - (s.equipmentOn ? 1 : 0)-(s.rareEquipped==='escama'?4:0)));
      s.hp -= damage; if(s.roomPerformance)s.roomPerformance.damage+=damage; s.invulnerableUntil = s.time + 550; enemy.attackAt = s.time + 1500;
      feedback(s, s.player, `−${damage} HP`, 'damage');
      if (s.hp === 0) return defeatCombat(s);
    }
  }
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
  for(const hazard of room.hazards??[]){if(hazardPhase(hazard,s.time)==='active'&&distance(s.player,room.camp)>1.6&&distance(s.player,hazard)<hazard.radius+.2&&s.time>=s.invulnerableUntil){const damage=Math.min(s.hp,hazard.kind==='steam'?16:12);s.hp-=damage;if(s.roomPerformance)s.roomPerformance.damage+=damage;s.invulnerableUntil=s.time+1000;feedback(s,s.player,`−${damage} HP`,'damage');s.message=hazard.kind==='steam'?'Vapor ativo: afaste-se do círculo.':'Espinhos abertos: contorne ou aguarde.';if(!s.hp)return defeatCombat(s);}}
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
  if (s.gateOpen && distance(s.player, room.exit) < .7) {
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
export function clearPilotLine(from: CombatPoint, to: CombatPoint, gateOpen: boolean,roomIndex=0) {
  return clearPilotWalkLine(from,to,gateOpen,0,roomIndex);
}
/** Shared edge check prevents touch paths from cutting across a curved shore. */
export function clearPilotWalkLine(from:CombatPoint,to:CombatPoint,gateOpen:boolean,radius=.22,roomIndex=0){
  const steps = Math.max(1, Math.ceil(distance(from, to) / .1));
  for (let i = 0; i <= steps; i++) if (!pilotWalkable({ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps }, gateOpen, radius,roomIndex)) return false;
  return true;
}
/** Breadth-first touch route around the same geometry used by movement. */
export function pilotRoute(from: CombatPoint, destination: CombatPoint, gateOpen: boolean,roomIndex=0): CombatPoint[] {
  const start = { x: Math.floor(from.x), y: Math.floor(from.y) }, end = { x: Math.floor(destination.x), y: Math.floor(destination.y) };
  if (!pilotWalkable({ x: end.x + .5, y: end.y + .5 }, gateOpen,.22,roomIndex)) return [];
  const key = (p: CombatPoint) => `${p.x},${p.y}`, queue = [start], previous = new Map<string, CombatPoint | null>([[key(start), null]]);
  for (let index = 0; index < queue.length; index++) {
    const p = queue[index]; if (key(p) === key(end)) { const route: CombatPoint[] = []; let current: CombatPoint | null = p; while (current && key(current) !== key(start)) { route.unshift({ x: current.x + .5, y: current.y + .5 }); current = previous.get(key(current)) ?? null; } return route; }
    for (const d of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
      const n = { x: p.x + d.x, y: p.y + d.y };
      const edgeStart=index===0?from:{x:p.x+.5,y:p.y+.5};
      if (!previous.has(key(n)) && clearPilotWalkLine(edgeStart,{x:n.x+.5,y:n.y+.5},gateOpen,.22,roomIndex)) { previous.set(key(n), p); queue.push(n); }
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
  next.xp = current.xp;
  next.hp = combatMaxHp(current.xp);
  next.energy = current.energy;
  next.legends=current.legends?readLegendProgress(current.legends):undefined;if(next.legends)next.campaignVersion=4;next.roomStars={...current.roomStars};next.roomAttempts={...current.roomAttempts};next.cards=[...current.cards];next.activeCard=current.activeCard;next.secondaryCard=current.secondaryCard;next.activePower=current.activePower;next.quickItems=normalizeQuickItems(current.quickItems);next.rareEquipped=current.rareEquipped;next.stock = { ...current.stock };next.rareStock={...current.rareStock};next.rareBag={...current.rareBag};next.encounterSeed=current.encounterSeed;
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
 const next=createCombatState(current.roomIndex+1,(Math.imul(current.seed,1664525)+1013904223)>>>0);
 next.revision=current.revision+1;next.time=current.time;next.xp=current.xp;next.hp=Math.min(current.hp,combatMaxHp(current.xp));next.energy=current.energy;
 next.legends=current.legends?readLegendProgress(current.legends):undefined;if(next.legends)next.campaignVersion=4;next.roomStars={...current.roomStars};next.roomAttempts={...current.roomAttempts};next.cards=[...current.cards];next.activeCard=current.activeCard;next.secondaryCard=current.secondaryCard;next.activePower=current.activePower;next.quickItems=normalizeQuickItems(current.quickItems);next.rareEquipped=current.rareEquipped;next.stock={...current.stock};next.bag={...current.bag};next.rareStock={...current.rareStock};next.rareBag={...current.rareBag};next.equipmentOwned=current.equipmentOwned;next.equipmentOn=current.equipmentOn;
 next.completedRooms=[...new Set([...current.completedRooms,current.roomIndex])];next.claimedRooms=[...new Set([...current.claimedRooms,current.roomIndex])];next.completionRewardClaimed=next.claimedRooms.includes(next.roomIndex);
 next.deaths=current.deaths;next.seed=current.seed;next.invulnerableUntil=next.time+2500;next.attackAt=next.time;
 next.enemies=next.enemies.map(e=>({...e,attackAt:next.time+1500}));return next;
}

export type CombatCard='roots'|'tide'|'amber';
export const bossCardForRoom=(index:number):CombatCard=>index>=20?'amber':index>=10?'tide':'roots';
export const COMBAT_CARDS:Record<CombatCard,{name:string;description:string}>={amber:{name:'Coração do Âmbar',description:'Carta rara do Mestre do Âmbar. Equipada, o poder causa 25% mais dano; continua custando 25 de energia.'},roots:{name:'Coração dos Troncos',description:'Carta rara do Mestre dos Troncos. Equipada, seu poder desacelera adversários por 2 segundos.'},tide:{name:'Coração das Marés',description:'Carta rara do Mestre das Marés. Equipada, cada uso do poder recupera até 15 HP.'}};
export type CombatPower='burst'|CombatCard;
export const COMBAT_POWERS:Record<CombatPower,{name:string;description:string}>={burst:{name:'Explosão de energia',description:'Golpe em área. Custa 25 de energia.'},roots:{name:'Raízes vivas',description:'Alcance de 2,2 passos e lentidão por 2 segundos. Liberado com a carta dos Troncos.'},tide:{name:'Pulso das marés',description:'Golpe em área e recupera até 15 HP. Liberado com a carta das Marés.'},amber:{name:'Chama do âmbar',description:'Golpe em área com 25% mais dano. Liberado com a carta do Âmbar.'}};
export const hasCombatCard=(s:CombatState,card:CombatCard)=>s.cards.includes(card)&&(s.activeCard===card||s.secondaryCard===card);
export function equipCombatPower(current:CombatState,power:CombatPower):CombatState{return power==='burst'||current.cards.includes(power)?{...current,activePower:power,revision:current.revision+1}:current;}
export function equipCombatCard(current:CombatState,card:CombatCard,slot:0|1=0):CombatState{
 if(!current.cards.includes(card))return current;
 const key=slot===0?'activeCard':'secondaryCard',other=slot===0?'secondaryCard':'activeCard';
 const remove=current[key]===card;
 return {...current,[key]:remove?null:card,[other]:!remove&&current[other]===card?null:current[other],revision:current.revision+1};
}
export function useRareCombatItem(current:CombatState,item:RareItem):CombatState{
 if(current.completed||current.rareStock[item]+current.rareBag[item]<1)return current;
 const s=clone(current);
 if(item==='cristal'||item==='escama'){s.rareEquipped=s.rareEquipped===item?null:item;s.message=item==='cristal'?'Cristal do bosque: +6 de ataque.':'Escama das marés: reduz dano comum em 4.';}
 else{const amount=Math.min(item==='perola'?90:60,combatMaxHp(s.xp)-s.hp);if(amount<=0)return current;if(s.rareBag[item]>0)s.rareBag[item]--;else s.rareStock[item]--;s.hp+=amount;s.consumablesUsed++;feedback(s,s.player,`+${amount} HP`,'heal');s.message=`${RARE_ITEMS[item]}: +${amount} HP.`;}
 s.revision++;return s;
}
/** Paused/hidden time never advances teleport. Save both sides; resume completed legacy rooms automatically. */
export function tickCombatPortal(current:CombatState,elapsedMs:number):CombatState{
 if(!current.completed||current.roomIndex>=EXPLORATION_ROOMS.length-1||!Number.isFinite(elapsedMs)||elapsedMs<0)return current;
 const next={...current,portalElapsed:current.portalElapsed+Math.min(50,elapsedMs),revision:current.revision+1};
 return next.portalElapsed>=850?advanceCombatRoom(next):next;
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
