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
export const PILOT_NODES = [
  { id: 'fern-a', x: 2.5, y: 4.5, item: 'fibra' as const, quantity: 3 },
  { id: 'fern-b', x: 6.5, y: 7.5, item: 'fibra' as const, quantity: 3 },
  { id: 'healing-leaf', x: 3.5, y: 7.5, item: 'erva' as const, quantity: 1 },
];
export const PILOT_ENEMIES = [
  { id: 'beetle', name: 'Besouro', level: 1, rarity: 'common' as const, hp: 40, attack: 9, defense: 1, xp: 25, item: 'fibra' as CombatItem, quantity: 3, x: 4, y: 6.5 },
  { id: 'caterpillar', name: 'Lagarta', level: 3, rarity: 'uncommon' as const, hp: 80, attack: 16, defense: 3, xp: 55, item: 'ambar' as CombatItem, quantity: 2, x: 10.5, y: 3 },
];
/** Initial tuning shared by future combat species; environmental fauna never enters this system. */
export function insectRespawnMs(enemy:{level:number;rarity:'common'|'uncommon'|'rare'}){
  return (30000+(Math.max(1,enemy.level)-1)*5000)*({common:1,uncommon:1.5,rare:2}[enemy.rarity]);
}
/** Smaller insects share their footprint and contact distances with the renderer. */
export const PILOT_INSECT={width:.64,radius:.17,stopDistance:.55,attackDistance:.82};
export type CombatEnemy = CombatPoint & { id: string; hp: number; generation: number; attackAt: number; respawnAt: number };
export type CombatLoot = CombatPoint & { id: string; item: CombatItem; quantity: number; bornAt?: number; landedAt?: number; expiresAt?:number };
/** Active play time, paused with the room: common piles last longer than uncommon amber. */
export const combatLootLifetime=(item:CombatItem)=>item==='ambar'?90000:180000;
export type CombatFeedback = CombatPoint & { id: number; text: string; kind: 'damage' | 'heal' | 'xp' | 'info'; until: number };
export type CombatState = {
  exploredCells: number[]; minimapVersion: 2;
  version: 1; revision: number; time: number; xp: number; hp: number; energy: number;
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
export const combatAttack = (s: Pick<CombatState, 'xp' | 'equipmentOn'>) => 16 + (combatLevel(s.xp) - 1) * 3 + (s.equipmentOn ? 4 : 0);
export function createCombatState(): CombatState {
  return { minimapVersion: 2, exploredCells: readMinimap([],PILOT_CAMP), version: 1, revision: 0, time: 0, xp: 0, hp: 100, energy: 100,
    player: { ...PILOT_CAMP }, facing: { x: 1, y: 0 }, walkPhase: 0, walking: false,
    stock: { ...emptyItems(), erva: 2, fruta: 1 }, bag: emptyItems(),
    enemies: PILOT_ENEMIES.map(e => ({ id: e.id, x: e.x, y: e.y, hp: e.hp, generation: 0, attackAt: 1500, respawnAt: 0 })),
    loot: [], collectedNodes: [], defeated: 0, deaths: 0, gateOpen: false, completed: false, completionRewardClaimed: false,
    equipmentOwned: false, equipmentOn: false, seed: 290519,
    attackAt: 0, strikeUntil: 0, invulnerableUntil: 0, feedback: [],
    message: 'Colete 6 fibras, enfrente um besouro e ative o marco com F.' };
}
export function pilotWalkable(p: CombatPoint, gateOpen: boolean, radius = .22): boolean {
  if (!insideExploration(p,radius) || hitsEdgeScenery(p,radius)) return false;
  const walls = gateOpen ? PILOT_WALLS : [...PILOT_WALLS, { x: 9, y: 4 }];
  const f=PILOT_SHELTER.footprint;
  if(p.x+radius>f.x && p.x-radius<f.x+f.width && p.y+radius>f.y && p.y-radius<f.y+f.height)return false;
  return !walls.some(w => p.x + radius > w.x && p.x - radius < w.x + 1 && p.y + radius > w.y && p.y - radius < w.y + 1);
}
/** Relocate positions covered by revised scenery, preserving earned state. */
export function nearestPilotPoint(p:CombatPoint,gateOpen:boolean):CombatPoint {
  if(pilotWalkable(p,gateOpen))return {...p};
  if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!insideExploration(p))return {...PILOT_CAMP};
  const candidates=Array.from({length:PILOT_SIZE.width*PILOT_SIZE.height},(_,i)=>({x:PILOT_SIZE.left+.5+i%PILOT_SIZE.width,y:PILOT_SIZE.top+.5+Math.floor(i/PILOT_SIZE.width)})).filter(q=>pilotWalkable(q,gateOpen));
  candidates.sort((a,b)=>distance(a,p)-distance(b,p));return candidates[0]??{...PILOT_CAMP};
}
function move(p: CombatPoint, dx: number, dy: number, gateOpen: boolean, radius=.22): CombatPoint {
  const x = pilotWalkable({ x: p.x + dx, y: p.y }, gateOpen, radius) ? p.x + dx : p.x;
  return { x, y: pilotWalkable({ x, y: p.y + dy }, gateOpen, radius) ? p.y + dy : p.y };
}
function object(v: unknown): Record<string, unknown> { return v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}; }
/** Forward-version saves are never replaced; known fields are bounded on read. */
export function readCombatState(value: unknown): CombatRead {
  const raw = object(value); const version = number(Number(raw.version ?? 1), 1);
  if (version > 1) return { supported: false, version };
  const s = createCombatState(); if (!Object.keys(raw).length) return { supported: true, state: s };
  s.xp = Math.floor(number(raw.xp, 0, 0, 2e6)); s.hp = number(raw.hp, combatMaxHp(s.xp), 0, combatMaxHp(s.xp));
  s.time = number(raw.time, 0); s.revision = Math.floor(number(raw.revision, 0)); s.energy = number(raw.energy, 100, 0, 100);
  s.gateOpen = raw.gateOpen === true; s.completed = raw.completed === true;
  s.completionRewardClaimed = raw.completionRewardClaimed === true || s.completed;
  s.equipmentOwned = raw.equipmentOwned === true; s.equipmentOn = s.equipmentOwned && raw.equipmentOn === true;
  for (const group of ['stock', 'bag'] as const) for (const item of Object.keys(COMBAT_ITEMS) as CombatItem[]) s[group][item] = Math.floor(number(object(raw[group])[item], s[group][item], 0, 9999));
  const point = object(raw.player); const p = { x: number(point.x, PILOT_CAMP.x, PILOT_SIZE.left, PILOT_SIZE.left+PILOT_SIZE.width), y: number(point.y, PILOT_CAMP.y, PILOT_SIZE.top, PILOT_SIZE.top+PILOT_SIZE.height) };
  s.player = nearestPilotPoint(p, s.gateOpen);
  s.exploredCells = readMinimap(raw.exploredCells,s.player,raw.minimapVersion===2?2:1);
  const f = object(raw.facing), fx = number(f.x, 1, -1, 1), fy = number(f.y, 0, -1, 1), length = Math.hypot(fx, fy);
  s.facing = length ? { x: fx / length, y: fy / length } : { x: 1, y: 0 };
  s.collectedNodes = PILOT_NODES.filter(n => Array.isArray(raw.collectedNodes) && raw.collectedNodes.includes(n.id)).map(n => n.id);
  s.defeated = Math.floor(number(raw.defeated, 0)); s.deaths = Math.floor(number(raw.deaths, 0)); s.seed = number(raw.seed, s.seed, 1, 0xffffffff) >>> 0;
  s.attackAt = number(raw.attackAt, s.time, 0, s.time + 2000); s.invulnerableUntil = number(raw.invulnerableUntil, s.time, 0, s.time + 3000);
  s.enemies = PILOT_ENEMIES.map(def => {
    const rawEnemy = object(Array.isArray(raw.enemies) ? raw.enemies.find(e => object(e).id === def.id) : null);
    const ep = { x: number(rawEnemy.x, def.x, PILOT_SIZE.left, PILOT_SIZE.left+PILOT_SIZE.width), y: number(rawEnemy.y, def.y, PILOT_SIZE.top, PILOT_SIZE.top+PILOT_SIZE.height) };
    return { id: def.id, ...nearestPilotPoint(ep, s.gateOpen), hp: number(rawEnemy.hp, def.hp, 0, def.hp),
      generation: Math.floor(number(rawEnemy.generation, 0)), attackAt: number(rawEnemy.attackAt, s.time + 1500, 0, s.time + 2000), respawnAt: number(rawEnemy.respawnAt, 0, 0, s.time + Math.max(45000,insectRespawnMs(def))) };
  });
  // Earlier generations can still have a drop after their owner has respawned.
  const allowedLoot = new Set<string>();
  s.loot = Array.isArray(raw.loot) ? raw.loot.slice(0, 20).flatMap(v => {
    const l = object(v); const id = String(l.id); const item = String(l.item) as CombatItem;
    const p = { x: number(l.x, 999, -1e9), y: number(l.y, 999, -1e9) };
    const owner=s.enemies.find(e=>id.startsWith(`${e.id}:`));
    const generation=Number(id.slice(id.indexOf(':')+1));
    const def=PILOT_ENEMIES.find(e=>e.id===owner?.id);
    if (!owner || !def || id!==`${owner.id}:${generation}` || !Number.isInteger(generation) || generation<0 || generation>owner.generation || (generation===owner.generation && owner.hp>0) || allowedLoot.has(owner.id) || item!==def.item || !insideExploration(p)) return [];
    allowedLoot.add(owner.id); return [{ id, item, ...nearestPilotPoint(p,s.gateOpen), bornAt: number(l.bornAt, Math.max(0, s.time - 500), 0, s.time), landedAt: number(l.landedAt, s.time, 0, s.time + 500), expiresAt:number(l.expiresAt,s.time+combatLootLifetime(item),0,s.time+combatLootLifetime(item)), quantity: Math.floor(number(l.quantity, 1, 1, 9999)) }];
  }) : [];
  if (s.hp === 0) return { supported: true, state: defeatCombat(s) };
  return { supported: true, state: s };
}
export function combatSnapshot(s: CombatState): Record<string, unknown> {
  const { feedback: _feedback, message: _message, strikeUntil: _strike, walking: _walking, walkPhase: _phase, ...save } = s;
  return save;
}
function clone(s: CombatState): CombatState { return { ...s, player: { ...s.player }, facing: { ...s.facing }, stock: { ...s.stock }, bag: { ...s.bag }, enemies: s.enemies.map(e => ({ ...e })), loot: s.loot.map(l => ({ ...l })), feedback: [...s.feedback], collectedNodes: [...s.collectedNodes] }; }
function feedback(s: CombatState, p: CombatPoint, text: string, kind: CombatFeedback['kind']) {
  s.feedback.push({ ...p, id: s.revision * 100 + s.feedback.length, text, kind, until: s.time + 1100 });
  s.feedback = s.feedback.slice(-16);
}
export function defeatCombat(current: CombatState): CombatState {
  const s = clone(current); let lost = 0;
  for (const item of ['fibra', 'ambar'] as const) { const loss = Math.floor(s.bag[item] * .1); s.bag[item] -= loss; lost += loss; }
  s.hp = combatMaxHp(s.xp); s.player = { ...PILOT_CAMP }; s.walking = false; s.deaths++; s.revision++;
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
  s.revision++; s.message = `${COMBAT_ITEMS[item]}: +${Math.round(amount)} ${hp ? 'HP' : 'energia'}.`;
  feedback(s, s.player, `+${Math.round(amount)} ${hp ? 'HP' : 'energia'}`, 'heal'); return s;
}
export function equipCombatCharm(current: CombatState): CombatState {
  return current.equipmentOwned ? { ...current, equipmentOn: !current.equipmentOn, revision: current.revision + 1 } : current;
}
function random(s: CombatState) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 0x100000000; }
export function stepCombat(current: CombatState, input: CombatInput, elapsedMs: number): CombatState {
  if (current.completed || !Number.isFinite(elapsedMs) || elapsedMs < 0) return current;
  const s = clone(current), dt = Math.min(50, elapsedMs); s.time += dt; s.revision++;
  s.loot=s.loot.filter(l=>s.time<(l.expiresAt??Infinity));
  s.feedback = s.feedback.filter(f => f.until > s.time); s.energy = Math.min(100, s.energy + dt * .004);
  const dx = clamp(input.dx || 0, -1, 1), dy = clamp(input.dy || 0, -1, 1), length = Math.hypot(dx, dy);
  const previous = s.player;
  if (length) { s.facing = { x: dx / length, y: dy / length }; s.player = move(s.player, s.facing.x * Math.min(1, length) * dt * .003, s.facing.y * Math.min(1, length) * dt * .003, s.gateOpen); }
  s.exploredCells = revealMinimap(s.exploredCells,s.player);
  const travel = distance(previous, s.player); s.walking = travel > .00001; s.walkPhase = s.walking ? (s.walkPhase + travel / .72) % 1 : 0;
  if ((input.attack || input.power) && s.time >= s.attackAt && (!input.power || s.energy >= 25)) {
    const power = Boolean(input.power); if (power) s.energy -= 25;
    s.attackAt = s.time + (power ? 1000 : 500); s.strikeUntil = s.time + 320;
    for (const enemy of s.enemies) {
      const def = PILOT_ENEMIES.find(e => e.id === enemy.id)!; const range = distance(s.player, enemy);
      const dot = range ? ((enemy.x - s.player.x) * s.facing.x + (enemy.y - s.player.y) * s.facing.y) / range : 1;
      if (enemy.hp <= 0 || range > (power ? 1.7 : 1.25) || (!power && dot < .25) || !clearPilotLine(s.player, enemy, s.gateOpen)) continue;
      const damage = Math.min(enemy.hp, Math.max(1, Math.round(combatAttack(s) * (power ? 1.6 : 1) - def.defense)));
      enemy.hp -= damage; feedback(s, enemy, `−${damage} HP`, 'damage');
      if (enemy.hp === 0) {
        const oldMax = combatMaxHp(s.xp), oldLevel = combatLevel(s.xp); s.xp += def.xp; s.defeated++; enemy.respawnAt = s.time + insectRespawnMs(def);
        feedback(s, s.player, `+${def.xp} XP`, 'xp');
        const increase = combatMaxHp(s.xp) - oldMax; s.hp += increase;
        if (combatLevel(s.xp) > oldLevel) { feedback(s, s.player, `Nível ${combatLevel(s.xp)}`, 'info'); if (increase) feedback(s, s.player, `+${increase} HP`, 'heal'); }
        // Keep one pending pile per insect so repeated respawns do not grow the scene indefinitely.
        const pending=s.loot.find(l=>l.id.startsWith(`${enemy.id}:`) && l.item===def.item);
        if(pending){pending.quantity+=def.quantity;pending.expiresAt=s.time+combatLootLifetime(def.item);}
        else s.loot.push({ id: `${enemy.id}:${enemy.generation}`, x: enemy.x, y: enemy.y, item: def.item, quantity: def.quantity, bornAt: s.time, landedAt: s.time + 500,expiresAt:s.time+combatLootLifetime(def.item) });
        if (random(s) < .12 && !s.equipmentOwned) { s.equipmentOwned = true; feedback(s, s.player, 'Broche encontrado', 'info'); }
        s.message = `${def.name} superado. Aproxime-se para coletar ${COMBAT_ITEMS[def.item]}.`;
      }
    }
  }
  for (const enemy of s.enemies) {
    const def = PILOT_ENEMIES.find(e => e.id === enemy.id)!;
    if (enemy.hp === 0) {
      const occupied = distance(s.player, def) < 2;
      if (s.time >= enemy.respawnAt && !occupied) { Object.assign(enemy, { x: def.x, y: def.y, hp: def.hp, generation: enemy.generation + 1, attackAt: s.time + 1500, respawnAt: 0 }); }
      continue;
    }
    const range = distance(s.player, enemy), safe = distance(s.player, PILOT_CAMP) < 1.6;
    if (!safe && range < 4 && range > PILOT_INSECT.stopDistance) {
      Object.assign(enemy, move(enemy, (s.player.x - enemy.x) / range * dt * .00085, (s.player.y - enemy.y) / range * dt * .00085, s.gateOpen, PILOT_INSECT.radius));
    } else if (safe || range > 4) {
      const home = distance(enemy, def); if (home > .1) Object.assign(enemy, move(enemy, (def.x - enemy.x) / home * dt * .0006, (def.y - enemy.y) / home * dt * .0006, s.gateOpen, PILOT_INSECT.radius));
    }
    if (!safe && distance(s.player, enemy) <= PILOT_INSECT.attackDistance && s.time >= enemy.attackAt && s.time >= s.invulnerableUntil && clearPilotLine(s.player, enemy, s.gateOpen)) {
      const damage = Math.min(s.hp, Math.max(1, def.attack - Math.floor(combatLevel(s.xp) / 2) - (s.equipmentOn ? 1 : 0)));
      s.hp -= damage; s.invulnerableUntil = s.time + 550; enemy.attackAt = s.time + 1500;
      feedback(s, s.player, `−${damage} HP`, 'damage');
      if (s.hp === 0) return defeatCombat(s);
    }
  }
  for (const node of PILOT_NODES) if (!s.collectedNodes.includes(node.id) && distance(s.player, node) < .55) {
    s.collectedNodes.push(node.id); s.bag[node.item] += node.quantity; s.message = `+${node.quantity} ${COMBAT_ITEMS[node.item]}.`;
    feedback(s, node, `+${node.quantity} ${COMBAT_ITEMS[node.item]}`, 'info');
  }
  s.loot = s.loot.filter(l => { if (s.time < (l.landedAt ?? 0) || distance(s.player, l) >= .65) return true; s.bag[l.item] += l.quantity; feedback(s, l, `+${l.quantity} ${COMBAT_ITEMS[l.item]}`, 'info'); return false; });
  if (input.interact && distance(s.player, PILOT_MARKER) < 1.2) {
    if (s.stock.fibra + s.bag.fibra >= 6 && s.defeated >= 1) { s.gateOpen = true; s.message = 'Marco ativado. Siga até a saída dourada.'; }
    else s.message = 'O marco pede 6 fibras e um encontro vencido. Os materiais não serão consumidos.';
  }
  if (s.gateOpen && distance(s.player, PILOT_EXIT) < .7) {
    for (const item of Object.keys(COMBAT_ITEMS) as CombatItem[]) { s.stock[item] += s.bag[item]; s.bag[item] = 0; }
    s.completed = true;
    const firstCompletion = !s.completionRewardClaimed;
    if (firstCompletion) { s.equipmentOwned = true; s.completionRewardClaimed = true; }
    s.walking = false;
    s.message = firstCompletion ? 'Sala piloto concluída! Coleta guardada e Broche da Clareira conquistado.' : 'Sala repetida! Nova coleta guardada; broche já conquistado.';
  }
  return s;
}
export function clearPilotLine(from: CombatPoint, to: CombatPoint, gateOpen: boolean) {
  return clearPilotWalkLine(from,to,gateOpen,0);
}
/** Shared edge check prevents touch paths from cutting across a curved shore. */
export function clearPilotWalkLine(from:CombatPoint,to:CombatPoint,gateOpen:boolean,radius=.22){
  const steps = Math.max(1, Math.ceil(distance(from, to) / .1));
  for (let i = 0; i <= steps; i++) if (!pilotWalkable({ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps }, gateOpen, radius)) return false;
  return true;
}
/** Breadth-first touch route around the same geometry used by movement. */
export function pilotRoute(from: CombatPoint, destination: CombatPoint, gateOpen: boolean): CombatPoint[] {
  const start = { x: Math.floor(from.x), y: Math.floor(from.y) }, end = { x: Math.floor(destination.x), y: Math.floor(destination.y) };
  if (!pilotWalkable({ x: end.x + .5, y: end.y + .5 }, gateOpen)) return [];
  const key = (p: CombatPoint) => `${p.x},${p.y}`, queue = [start], previous = new Map<string, CombatPoint | null>([[key(start), null]]);
  for (let index = 0; index < queue.length; index++) {
    const p = queue[index]; if (key(p) === key(end)) { const route: CombatPoint[] = []; let current: CombatPoint | null = p; while (current && key(current) !== key(start)) { route.unshift({ x: current.x + .5, y: current.y + .5 }); current = previous.get(key(current)) ?? null; } return route; }
    for (const d of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
      const n = { x: p.x + d.x, y: p.y + d.y };
      const edgeStart=index===0?from:{x:p.x+.5,y:p.y+.5};
      if (!previous.has(key(n)) && clearPilotWalkLine(edgeStart,{x:n.x+.5,y:n.y+.5},gateOpen)) { previous.set(key(n), p); queue.push(n); }
    }
  }
  return [];
}

/** Replay is opt-in after completion; permanent combat progression is retained. */
export function replayCompletedCombat(current: CombatState): CombatState {
  if (!current.completed) return current;
  const next = createCombatState();
  next.revision = current.revision + 1;
  next.time = current.time;
  next.exploredCells = [...current.exploredCells];
  next.xp = current.xp;
  next.hp = combatMaxHp(current.xp);
  next.energy = current.energy;
  next.stock = { ...current.stock };
  next.bag = { ...current.bag };
  next.equipmentOwned = current.equipmentOwned;
  next.equipmentOn = current.equipmentOn;
  next.completionRewardClaimed = true;
  next.deaths = current.deaths;
  next.seed = current.seed;
  next.enemies = next.enemies.map(enemy => ({ ...enemy, attackAt: next.time + 1500 }));
  next.invulnerableUntil = next.time + 2500;
  next.attackAt = next.time;
  next.message = 'Nova tentativa: explore, colete e enfrente os adversários. Seu progresso foi mantido.';
  return next;
}
