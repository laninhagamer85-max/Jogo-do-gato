export type Cell = { x: number; y: number };

export type ForestPuzzleState = {
  player: Cell;
  log: Cell;
  gateOpen: boolean;
  keyCollected: boolean;
  complete: boolean;
};

export const FOREST_PUZZLE = {
  columns: 13,
  rows: 9,
  start: { x: 1, y: 1 },
  log: { x: 3, y: 2 },
  pressurePlate: { x: 3, y: 5 },
  gate: { x: 6, y: 2 },
  key: { x: 10, y: 1 },
  exit: { x: 10, y: 7 },
} as const;

export function createForestPuzzleState(): ForestPuzzleState {
  return {
    player: { ...FOREST_PUZZLE.start },
    log: { ...FOREST_PUZZLE.log },
    gateOpen: false,
    keyCollected: false,
    complete: false,
  };
}

function sameCell(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}

function isWall(cell: Cell) {
  if (cell.x <= 0 || cell.x >= FOREST_PUZZLE.columns - 1 || cell.y <= 0 || cell.y >= FOREST_PUZZLE.rows - 1) return true;
  // A narrow hedge divides the room; its only crossing is the wooden gate.
  return cell.x === FOREST_PUZZLE.gate.x && cell.y !== FOREST_PUZZLE.gate.y;
}

export function moveForestPuzzle(state: ForestPuzzleState, dx: number, dy: number): ForestPuzzleState {
  if (state.complete || Math.abs(dx) + Math.abs(dy) !== 1) return state;

  const target = { x: state.player.x + dx, y: state.player.y + dy };
  if (isWall(target)) return state;

  let log = state.log;
  let gateOpen = state.gateOpen;
  if (sameCell(target, state.log)) {
    const pushed = { x: state.log.x + dx, y: state.log.y + dy };
    if (isWall(pushed) || sameCell(pushed, state.log)) return state;
    log = pushed;
    if (sameCell(log, FOREST_PUZZLE.pressurePlate)) gateOpen = true;
  }

  if (sameCell(target, FOREST_PUZZLE.gate) && !gateOpen) return state;

  const keyCollected = state.keyCollected || sameCell(target, FOREST_PUZZLE.key);
  const complete = sameCell(target, FOREST_PUZZLE.exit) && gateOpen && keyCollected;
  return {
    player: target,
    log,
    gateOpen,
    keyCollected,
    complete,
  };
}

export function isForestPuzzleWall(cell: Cell, gateOpen: boolean) {
  return isWall(cell) || (sameCell(cell, FOREST_PUZZLE.gate) && !gateOpen);
}
