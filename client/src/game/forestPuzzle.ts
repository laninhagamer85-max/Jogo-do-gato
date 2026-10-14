export type Cell = { x: number; y: number };
export type ForestDirection = "up" | "down" | "left" | "right";
export type ForestObjectKind = "log" | "plank" | "stone" | "bell";

export type ForestObjectSpec = Cell & { id: string; kind: ForestObjectKind; movable: boolean };
export type ForestGateSpec = Cell & { id: string; keyId?: string; plateId?: string };
export type ForestPlateSpec = Cell & { id: string; gateId: string; accepts: ForestObjectKind[]; latch: boolean };
export type ForestKeySpec = Cell & { id: string };
export type ForestGuardSpec = { id: string; route: Cell[]; lureCell?: Cell; stepMs: number };
export type ForestRoomSpec = {
  chapter: number;
  room: 1 | 2;
  name: string;
  title: string;
  objective: string;
  spawn: Cell;
  exit: Cell;
  walls: Cell[];
  water: Cell[];
  bridgeSockets: Array<Cell & { id: string }>;
  objects: ForestObjectSpec[];
  gates: ForestGateSpec[];
  plates: ForestPlateSpec[];
  keys: ForestKeySpec[];
  guards: ForestGuardSpec[];
  exitRequires: { keys?: string[]; gates?: string[]; bridges?: string[]; luredGuards?: string[] };
};

export type ForestGuardState = {
  id: string;
  x: number;
  y: number;
  routeIndex: number;
  from: Cell;
  to: Cell;
  progress: number;
  lured: boolean;
  settled: boolean;
};

export type ForestGameState = {
  chapter: number;
  room: 1 | 2;
  player: { x: number; y: number };
  facing: ForestDirection;
  objects: ForestObjectSpec[];
  carriedObjectId: string | null;
  collectedKeys: string[];
  openGates: string[];
  placedBridges: string[];
  luredGuards: string[];
  guards: ForestGuardState[];
  simMs: number;
  walkPhase: number;
  walking: boolean;
  actions: number;
  steps: number;
  invulnerableUntil: number;
  bumps: number;
  message: string;
  chapterComplete: boolean;
};

export type ForestInput = {
  left?: boolean;
  right?: boolean;
  up?: boolean;
  down?: boolean;
  actionPressed?: boolean;
  usePressed?: boolean;
};
export type ForestEvent = "key-collected" | "gate-opened" | "bridge-placed" | "bump" | "room-cleared" | "chapter-cleared";
export type ForestStep = { state: ForestGameState; events: ForestEvent[] };

export const FOREST_MAP = { columns: 14, rows: 8 } as const;
const cell = (x: number, y: number): Cell => ({ x, y });
const edgeWalls = (): Cell[] => [
  ...Array.from({ length: FOREST_MAP.columns }, (_, x) => [cell(x, 0), cell(x, FOREST_MAP.rows - 1)]).flat(),
  ...Array.from({ length: FOREST_MAP.rows - 2 }, (_, index) => [cell(0, index + 1), cell(FOREST_MAP.columns - 1, index + 1)]).flat(),
];
const divider = (x: number, openingY: number): Cell[] => Array.from({ length: FOREST_MAP.rows - 2 }, (_, index) => index + 1)
  .filter((y) => y !== openingY).map((y) => cell(x, y));

export const FOREST_CHAPTERS = [
  { id: 1, name: "Clareira dos Troncos", subtitle: "A trilha começa com calma", image: "/forest-adventure/backgrounds/clearing.webp", color: "#4e9a3d" },
  { id: 2, name: "Riacho das Luzinhas", subtitle: "Uma ponte de cada vez", image: "/forest-adventure/backgrounds/creek.webp", color: "#328e9a" },
  { id: 3, name: "Bosque das Lanternas", subtitle: "O caminho brilha à noite", image: "/forest-adventure/backgrounds/firefly.webp", color: "#4c559a" },
] as const;

export const FOREST_ROOMS: ForestRoomSpec[] = [
  {
    chapter: 1, room: 1, name: "Clareira dos Troncos", title: "A placa silenciosa", objective: "Empurre o tronco até a placa, pegue a chave e encontre a saída.",
    spawn: cell(1, 5), exit: cell(12, 5), walls: [...edgeWalls(), ...divider(7, 3)], water: [], bridgeSockets: [],
    objects: [{ id: "log-1", kind: "log", x: 4, y: 3, movable: true }],
    gates: [{ id: "clearing-gate-1", x: 7, y: 3, plateId: "plate-1" }],
    plates: [{ id: "plate-1", x: 6, y: 3, gateId: "clearing-gate-1", accepts: ["log"], latch: true }],
    keys: [{ id: "clearing-key-1", x: 10, y: 1 }], guards: [],
    exitRequires: { keys: ["clearing-key-1"], gates: ["clearing-gate-1"] },
  },
  {
    chapter: 1, room: 2, name: "Clareira dos Troncos", title: "O atalho da raposa", objective: "Abra o segundo portão e leve a chave até o arco de folhas.",
    spawn: cell(1, 1), exit: cell(12, 5), walls: [...edgeWalls(), ...divider(7, 4), cell(3, 2), cell(3, 3), cell(9, 4)], water: [], bridgeSockets: [],
    objects: [{ id: "log-2", kind: "log", x: 3, y: 5, movable: true }],
    gates: [{ id: "clearing-gate-2", x: 7, y: 4, plateId: "plate-2" }],
    plates: [{ id: "plate-2", x: 5, y: 5, gateId: "clearing-gate-2", accepts: ["log"], latch: true }],
    keys: [{ id: "clearing-key-2", x: 10, y: 2 }], guards: [],
    exitRequires: { keys: ["clearing-key-2"], gates: ["clearing-gate-2"] },
  },
  {
    chapter: 2, room: 1, name: "Riacho das Luzinhas", title: "A ponte de folhas", objective: "Carregue a prancha, coloque-a sobre a água, pegue a chave e saia.",
    spawn: cell(1, 3), exit: cell(12, 5), walls: edgeWalls(), water: Array.from({ length: 6 }, (_, i) => cell(6, i + 1)),
    bridgeSockets: [{ id: "willow-bridge", x: 6, y: 3 }], objects: [{ id: "willow-plank", kind: "plank", x: 4, y: 3, movable: true }],
    gates: [], plates: [], keys: [{ id: "willow-key", x: 10, y: 1 }], guards: [],
    exitRequires: { keys: ["willow-key"], bridges: ["willow-bridge"] },
  },
  {
    chapter: 2, room: 2, name: "Riacho das Luzinhas", title: "Duas margens", objective: "Monte as duas passagens, desvie da sentinela e alcance o arco.",
    spawn: cell(1, 3), exit: cell(12, 5), walls: edgeWalls(),
    water: [...Array.from({ length: 6 }, (_, i) => cell(4, i + 1)), ...Array.from({ length: 6 }, (_, i) => cell(9, i + 1))],
    bridgeSockets: [{ id: "north-bank", x: 4, y: 3 }, { id: "south-bank", x: 9, y: 4 }],
    objects: [
      { id: "plank-north", kind: "plank", x: 3, y: 3, movable: true },
      { id: "plank-south", kind: "plank", x: 6, y: 4, movable: true },
      { id: "river-stone", kind: "stone", x: 7, y: 1, movable: true },
    ],
    gates: [], plates: [], keys: [{ id: "river-key", x: 11, y: 1 }],
    guards: [{ id: "creek-sentinel", route: [cell(7, 2), cell(8, 2), cell(8, 5), cell(7, 5)], stepMs: 1900 }],
    exitRequires: { keys: ["river-key"], bridges: ["north-bank", "south-bank"] },
  },
  {
    chapter: 3, room: 1, name: "Bosque das Lanternas", title: "A porta de cobre", objective: "Encontre a chave do portão, depois a chave do arco, e atravesse com cuidado.",
    spawn: cell(1, 5), exit: cell(12, 5), walls: [...edgeWalls(), ...divider(7, 2), cell(4, 4), cell(4, 5), cell(10, 4)], water: [], bridgeSockets: [],
    objects: [], gates: [{ id: "copper-door", x: 7, y: 2, keyId: "copper-key" }], plates: [],
    keys: [{ id: "copper-key", x: 3, y: 1 }, { id: "lantern-key", x: 10, y: 2 }],
    guards: [{ id: "moon-moth", route: [cell(4, 2), cell(5, 2), cell(5, 3), cell(4, 3)], stepMs: 2100 }],
    exitRequires: { keys: ["lantern-key"], gates: ["copper-door"] },
  },
  {
    chapter: 3, room: 2, name: "Bosque das Lanternas", title: "O guardião sonolento", objective: "Ative a placa, toque o sino para distrair o guardião e alcance a última saída.",
    spawn: cell(1, 5), exit: cell(12, 5), walls: [...edgeWalls(), ...divider(7, 4)], water: [], bridgeSockets: [],
    objects: [
      { id: "moon-log", kind: "log", x: 3, y: 4, movable: true },
      { id: "moon-bell", kind: "bell", x: 4, y: 1, movable: false },
    ],
    gates: [{ id: "moon-gate", x: 7, y: 4, plateId: "moon-plate" }],
    plates: [{ id: "moon-plate", x: 5, y: 4, gateId: "moon-gate", accepts: ["log"], latch: true }],
    keys: [{ id: "moon-exit-key", x: 9, y: 1 }],
    guards: [{ id: "moon-watch", route: [cell(9, 3), cell(10, 3), cell(11, 3), cell(11, 4), cell(10, 4), cell(9, 4)], lureCell: cell(11, 1), stepMs: 2100 }],
    exitRequires: { keys: ["moon-exit-key"], gates: ["moon-gate"], luredGuards: ["moon-watch"] },
  },
];

export function getForestRoom(chapter: number, room: number): ForestRoomSpec {
  return FOREST_ROOMS.find((entry) => entry.chapter === chapter && entry.room === room) ?? FOREST_ROOMS[0];
}

function center(cellValue: Cell) { return { x: cellValue.x + 0.5, y: cellValue.y + 0.5 }; }
function cellKey(value: Cell) { return `${value.x},${value.y}`; }
function sameCell(a: Cell, b: Cell) { return a.x === b.x && a.y === b.y; }
const DIRECTIONS: Record<ForestDirection, Cell> = { up: cell(0, -1), down: cell(0, 1), left: cell(-1, 0), right: cell(1, 0) };

export function createForestGameState(chapter = 1, room: 1 | 2 = 1, actions = 0, steps = 0): ForestGameState {
  const spec = getForestRoom(chapter, room);
  const spawn = center(spec.spawn);
  return {
    chapter: spec.chapter, room: spec.room, player: spawn, facing: "right", objects: spec.objects.map((item) => ({ ...item })),
    carriedObjectId: null, collectedKeys: [], openGates: [], placedBridges: [], luredGuards: [],
    guards: spec.guards.map((guard) => {
      const start = guard.route[0]; const next = guard.route[1] ?? start;
      return { id: guard.id, ...center(start), routeIndex: 0, from: start, to: next, progress: 0, lured: false, settled: false };
    }),
    simMs: 0, walkPhase: 0, walking: false, actions, steps, invulnerableUntil: 0, bumps: 0, message: "Explore com calma. O objetivo desta sala aparece acima do mapa.", chapterComplete: false,
  };
}

function isWater(value: Cell, spec: ForestRoomSpec, state: ForestGameState) {
  const key = cellKey(value);
  return spec.water.some((item) => cellKey(item) === key) && !spec.bridgeSockets.some((socket) => socket.x === value.x && socket.y === value.y && state.placedBridges.includes(socket.id));
}
function isGateClosed(value: Cell, spec: ForestRoomSpec, state: ForestGameState) {
  const gate = spec.gates.find((entry) => sameCell(entry, value));
  return Boolean(gate && !state.openGates.includes(gate.id));
}
function objectBlocks(value: Cell, state: ForestGameState) {
  return state.objects.some((item) => item.id !== state.carriedObjectId && item.x === value.x && item.y === value.y && item.kind !== "bell");
}
function isBlocked(value: Cell, spec: ForestRoomSpec, state: ForestGameState) {
  return value.x < 0 || value.y < 0 || value.x >= FOREST_MAP.columns || value.y >= FOREST_MAP.rows
    || spec.walls.some((wall) => sameCell(wall, value)) || isWater(value, spec, state) || isGateClosed(value, spec, state) || objectBlocks(value, state);
}
function overlapsBlock(x: number, y: number, spec: ForestRoomSpec, state: ForestGameState) {
  const radius = 0.22;
  const points = [cell(Math.floor(x - radius), Math.floor(y - radius)), cell(Math.floor(x + radius), Math.floor(y - radius)), cell(Math.floor(x - radius), Math.floor(y + radius)), cell(Math.floor(x + radius), Math.floor(y + radius))];
  return points.some((point) => isBlocked(point, spec, state));
}
function addUnique(list: string[], value: string) { return list.includes(value) ? list : [...list, value]; }

function syncPressurePlates(state: ForestGameState, spec: ForestRoomSpec) {
  let openGates = state.openGates;
  let message = state.message;
  const events: ForestEvent[] = [];
  for (const plate of spec.plates) {
    const pressed = state.objects.some((item) => item.id !== state.carriedObjectId && item.x === plate.x && item.y === plate.y && plate.accepts.includes(item.kind));
    if (pressed && !openGates.includes(plate.gateId)) {
      openGates = addUnique(openGates, plate.gateId);
      message = "Clac! A placa abriu um caminho. Você pode continuar explorando.";
      events.push("gate-opened");
    }
  }
  return { state: openGates === state.openGates ? state : { ...state, openGates, message }, events };
}

function advanceGuards(state: ForestGameState, spec: ForestRoomSpec, dt: number) {
  const guards = state.guards.map((guardState) => {
    const guardSpec = spec.guards.find((item) => item.id === guardState.id);
    if (!guardSpec || guardState.settled) return guardState;
    const stepMs = Math.max(1, guardSpec.stepMs);
    let progress = guardState.progress + dt * 1000 / stepMs;
    let from = guardState.from; let to = guardState.to; let routeIndex = guardState.routeIndex;
    let settled: boolean = guardState.settled;
    if (progress >= 1) {
      progress -= 1;
      from = to;
      if (guardState.lured && guardSpec.lureCell) { to = guardSpec.lureCell; settled = true; }
      else {
        routeIndex = (routeIndex + 1) % guardSpec.route.length;
        to = guardSpec.route[(routeIndex + 1) % guardSpec.route.length] ?? guardSpec.route[0];
      }
    }
    const p = settled ? 1 : Math.min(1, progress);
    return { ...guardState, routeIndex, from, to, progress: settled ? 0 : progress, settled, x: from.x + (to.x - from.x) * p + 0.5, y: from.y + (to.y - from.y) * p + 0.5 };
  });
  return { ...state, guards };
}

function tryExit(state: ForestGameState, spec: ForestRoomSpec): ForestStep {
  const events: ForestEvent[] = [];
  const missingKey = (spec.exitRequires.keys ?? []).find((id) => !state.collectedKeys.includes(id));
  const missingGate = (spec.exitRequires.gates ?? []).find((id) => !state.openGates.includes(id));
  const missingBridge = (spec.exitRequires.bridges ?? []).find((id) => !state.placedBridges.includes(id));
  const missingLure = (spec.exitRequires.luredGuards ?? []).find((id) => !state.luredGuards.includes(id));
  if (missingKey || missingGate || missingBridge || missingLure) {
    const message = missingKey ? "Ainda falta encontrar a chave dourada." : missingGate ? "Este caminho precisa ser aberto com a placa ou a chave." : missingBridge ? "A travessia precisa de uma prancha sobre a água." : "O guardião ainda está no caminho. Procure o sino tranquilo.";
    return { state: { ...state, message }, events };
  }
  if (state.room === 1) {
    events.push("room-cleared");
    return { state: createForestGameState(state.chapter, 2, state.actions, state.steps), events };
  }
  events.push("chapter-cleared");
  return { state: { ...state, chapterComplete: true, message: "Capítulo concluído! Seu caminho ficou guardado no progresso da conta." }, events };
}

function interact(state: ForestGameState, spec: ForestRoomSpec): ForestStep {
  const delta = DIRECTIONS[state.facing];
  const here = cell(Math.floor(state.player.x), Math.floor(state.player.y));
  const target = cell(here.x + delta.x, here.y + delta.y);
  const events: ForestEvent[] = [];
  const exitDistance = Math.hypot(state.player.x - (spec.exit.x + 0.5), state.player.y - (spec.exit.y + 0.5));
  if (sameCell(target, spec.exit) || exitDistance < 0.46) return tryExit({ ...state, actions: state.actions + 1 }, spec);

  const gate = spec.gates.find((entry) => sameCell(entry, target));
  const objectOnTarget = state.objects.some((item) => item.x === target.x && item.y === target.y);
  if (gate && !objectOnTarget) {
    if (state.openGates.includes(gate.id)) return { state: { ...state, message: "O portão já está aberto. Siga pelo caminho." }, events };
    if (gate.keyId && state.collectedKeys.includes(gate.keyId)) {
      const next = { ...state, openGates: addUnique(state.openGates, gate.id), collectedKeys: state.collectedKeys.filter((id) => id !== gate.keyId), actions: state.actions + 1, message: "A chave abriu o portão. Vamos em frente!" };
      return { state: next, events: ["gate-opened"] };
    }
    return { state: { ...state, message: gate.plateId ? "Esta passagem abre quando um objeto pesado fica sobre a placa." : "Procure a chave que combina com este portão." }, events };
  }

  const object = state.objects.find((item) => item.x === target.x && item.y === target.y);
  if (object?.kind === "bell") {
    const guard = spec.guards.find((item) => item.lureCell);
    if (!guard) return { state: { ...state, actions: state.actions + 1, message: "O sininho faz um som suave." }, events };
    const guards = state.guards.map((item) => item.id === guard.id ? { ...item, lured: true, settled: false } : item);
    return { state: { ...state, guards, luredGuards: addUnique(state.luredGuards, guard.id), actions: state.actions + 1, message: "O guardião foi ouvir o sininho. O caminho está livre sem pressa." }, events };
  }
  if (object) {
    if (object.kind === "log") {
      const destination = cell(object.x + delta.x, object.y + delta.y);
      if (state.objects.some((item) => item.id !== object.id && item.id !== state.carriedObjectId && item.x === destination.x && item.y === destination.y) || isBlocked(destination, spec, state)) {
        return { state: { ...state, actions: state.actions + 1, message: "O tronco não cabe ali. Tente empurrar por outro lado." }, events };
      }
      const objects = state.objects.map((item) => item.id === object.id ? { ...item, ...destination } : item);
      const oldObjectCell = center(target);
      const synced = syncPressurePlates({ ...state, objects, player: oldObjectCell, actions: state.actions + 1, steps: state.steps + 1, message: "O tronco se moveu." }, spec);
      return { state: synced.state, events: [...events, ...synced.events] };
    }
    if (!object.movable) return { state: { ...state, actions: state.actions + 1, message: "Esse objeto não precisa ser movido." }, events };
    if (state.carriedObjectId) return { state: { ...state, message: "Use o objeto que está carregando antes de pegar outro." }, events };
    return { state: { ...state, carriedObjectId: object.id, actions: state.actions + 1, message: object.kind === "plank" ? "Prancha carregada. Leve-a até a água e escolha Usar." : "Pedra carregada. Escolha onde deixá-la." }, events };
  }
  return { state: { ...state, actions: state.actions + 1, message: "Nada por aqui ainda. Caminhe e observe os caminhos, chaves e placas." }, events };
}

function useObject(state: ForestGameState, spec: ForestRoomSpec): ForestStep {
  if (!state.carriedObjectId) return { state: { ...state, actions: state.actions + 1, message: "Você está com as patinhas livres. Ação serve para interagir com objetos." }, events: [] };
  const object = state.objects.find((item) => item.id === state.carriedObjectId);
  if (!object) return { state: { ...state, carriedObjectId: null }, events: [] };
  const delta = DIRECTIONS[state.facing];
  const here = cell(Math.floor(state.player.x), Math.floor(state.player.y));
  const target = cell(here.x + delta.x, here.y + delta.y);
  const socket = object.kind === "plank" ? spec.bridgeSockets.find((item) => sameCell(item, target) && !state.placedBridges.includes(item.id)) : undefined;
  if (socket && isWater(target, spec, state)) {
    const placedBridges = addUnique(state.placedBridges, socket.id);
    const objects = state.objects.filter((item) => item.id !== object.id);
    return { state: { ...state, objects, carriedObjectId: null, placedBridges, actions: state.actions + 1, message: "A prancha está firme. A travessia está pronta." }, events: ["bridge-placed"] };
  }
  if (isBlocked(target, spec, state)) return { state: { ...state, actions: state.actions + 1, message: "Não há espaço seguro para colocar o objeto nessa direção." }, events: [] };
  const objects = state.objects.map((item) => item.id === object.id ? { ...item, ...target } : item);
  const synced = syncPressurePlates({ ...state, objects, carriedObjectId: null, actions: state.actions + 1, message: "Objeto colocado." }, spec);
  return { state: synced.state, events: synced.events };
}

export function stepForestGame(previous: ForestGameState, input: ForestInput, deltaSeconds: number): ForestStep {
  if (previous.chapterComplete) return { state: previous, events: [] };
  const spec = getForestRoom(previous.chapter, previous.room);
  const dt = Math.max(0, Math.min(0.05, Number.isFinite(deltaSeconds) ? deltaSeconds : 0));
  let state: ForestGameState = { ...previous, simMs: previous.simMs + dt * 1000 };
  const events: ForestEvent[] = [];
  if (input.actionPressed) {
    const result = interact(state, spec); state = result.state; events.push(...result.events);
  }
  if (input.usePressed && !state.chapterComplete) {
    const result = useObject(state, spec); state = result.state; events.push(...result.events);
  }
  if (state.chapterComplete) return { state, events };

  let dx = Number(Boolean(input.right)) - Number(Boolean(input.left));
  let dy = Number(Boolean(input.down)) - Number(Boolean(input.up));
  if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
  let facing = state.facing;
  if (Math.abs(dx) > Math.abs(dy) && dx !== 0) facing = dx > 0 ? "right" : "left";
  else if (dy !== 0) facing = dy > 0 ? "down" : "up";
  let player = state.player;
  let moved = false;
  const speed = 3.15;
  const wantedX = player.x + dx * speed * dt;
  const wantedY = player.y + dy * speed * dt;
  if (dx && !overlapsBlock(wantedX, player.y, spec, state)) { player = { ...player, x: wantedX }; moved = true; }
  if (dy && !overlapsBlock(player.x, wantedY, spec, state)) { player = { ...player, y: wantedY }; moved = true; }
  const wasCell = cell(Math.floor(previous.player.x), Math.floor(previous.player.y));
  const nowCell = cell(Math.floor(player.x), Math.floor(player.y));
  const stepCrossed = !sameCell(wasCell, nowCell);
  if (stepCrossed) state = { ...state, steps: state.steps + 1 };
  const distance = Math.hypot(player.x - previous.player.x, player.y - previous.player.y);
  const walkPhase = state.walkPhase + distance / 1.4;
  state = { ...state, player, facing, walkPhase, walking: moved && distance > 0.00001, message: moved ? state.message : state.message };

  const keysToCollect = spec.keys.filter((key) => !state.collectedKeys.includes(key.id) && Math.hypot(player.x - (key.x + 0.5), player.y - (key.y + 0.5)) < 0.38);
  if (keysToCollect.length) {
    state = { ...state, collectedKeys: [...state.collectedKeys, ...keysToCollect.map((key) => key.id)], message: "Chave encontrada! Ela vai ajudar no caminho." };
    events.push("key-collected");
  }

  state = advanceGuards(state, spec, dt);
  const touchingGuard = state.guards.some((guard) => Math.hypot(guard.x - state.player.x, guard.y - state.player.y) < 0.44);
  if (touchingGuard && state.simMs >= state.invulnerableUntil) {
    const spawn = center(spec.spawn);
    state = { ...state, player: spawn, invulnerableUntil: state.simMs + 1400, bumps: state.bumps + 1, message: "Um guardião esbarrou de leve. Você voltou ao começo da sala; nada foi perdido." };
    events.push("bump");
  }
  return { state, events };
}

export function canForestExit(state: ForestGameState): boolean {
  const spec = getForestRoom(state.chapter, state.room);
  return (spec.exitRequires.keys ?? []).every((id) => state.collectedKeys.includes(id))
    && (spec.exitRequires.gates ?? []).every((id) => state.openGates.includes(id))
    && (spec.exitRequires.bridges ?? []).every((id) => state.placedBridges.includes(id))
    && (spec.exitRequires.luredGuards ?? []).every((id) => state.luredGuards.includes(id));
}
