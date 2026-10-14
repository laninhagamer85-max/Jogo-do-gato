import { FOREST_MAP, getForestRoom, type ForestGameState } from './forestPuzzle';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Camera is presentation only; puzzle coordinates never depend on viewport size. */
export function forestView(width: number, height: number, player: { x: number; y: number }, overview = false, focus = player) {
  const fit = Math.min(width / FOREST_MAP.columns, height / FOREST_MAP.rows);
  const tile = overview ? fit : Math.max(48, width / 8, height / 7);
  const boardWidth = tile * FOREST_MAP.columns;
  const boardHeight = tile * FOREST_MAP.rows;
  const left = boardWidth <= width ? (width - boardWidth) / 2 : -clamp(focus.x * tile - width / 2, 0, boardWidth - width);
  const top = boardHeight <= height ? (height - boardHeight) / 2 : -clamp(focus.y * tile - height / 2, 0, boardHeight - height);
  return { tile, boardWidth, boardHeight, left, top };
}

/** Mirrors the interaction range of the simulation; labels never execute actions. */
export function forestActionLabel(state: ForestGameState) {
  if (state.carriedObjectId) return 'Patinhas ocupadas';
  const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[state.facing];
  const x = Math.floor(state.player.x) + delta[0];
  const y = Math.floor(state.player.y) + delta[1];
  const room = getForestRoom(state.chapter, state.room);
  if (Math.hypot(state.player.x - room.exit.x - .5, state.player.y - room.exit.y - .5) < .46 || (x === room.exit.x && y === room.exit.y)) return 'Entrar na saída';
  const object = state.objects.find(o => o.x === x && o.y === y);
  if (object?.kind === 'log') return 'Empurrar';
  if (object?.kind === 'bell') return 'Tocar sino';
  if (object) return 'Pegar';
  if (room.gates.some(g => g.x === x && g.y === y && !state.openGates.includes(g.id))) return 'Abrir portão';
  return 'Interagir';
}
