import { describe, it, expect } from 'vitest';
import { forestView, forestActionLabel } from './forestView';
import { createForestGameState, FOREST_MAP, getForestRoom } from './forestPuzzle';

describe('forest camera and contextual hints', () => {
  it('keeps the pet visible and clamps the camera at every room edge after rotation', () => {
    for (const [width, height] of [[351, 400], [366, 520], [820, 170], [744, 690], [1000, 450], [1342, 520]]) {
      for (const x of [.5, 3.5, 7.5, 13.5]) for (const y of [.5, 4.5, 7.5]) {
        const v = forestView(width, height, { x, y });
        expect(x * v.tile + v.left).toBeGreaterThanOrEqual(0);
        expect(x * v.tile + v.left).toBeLessThanOrEqual(width);
        expect(y * v.tile + v.top).toBeGreaterThanOrEqual(0);
        expect(y * v.tile + v.top).toBeLessThanOrEqual(height);
        if (v.boardWidth > width) {
          expect(v.left).toBeLessThanOrEqual(0);
          expect(v.left + v.boardWidth).toBeGreaterThanOrEqual(width);
        }
      }
    }
  });
  it('enlarges mobile tiles and offers a complete room overview without mutating state', () => {
    const player = Object.freeze({ x: 4.5, y: 3.5 });
    const close = forestView(351, 400, player);
    const overview = forestView(351, 400, player, true);
    expect(close.tile).toBeGreaterThan(overview.tile);
    expect(overview.boardWidth).toBeLessThanOrEqual(351);
    expect(overview.boardHeight).toBeLessThanOrEqual(400);
    expect(overview.boardWidth / overview.tile).toBe(FOREST_MAP.columns);
    expect(player).toEqual({ x: 4.5, y: 3.5 });
  });
  it('uses the same front cell as interaction and describes the normal exit', () => {
    const state = createForestGameState(1, 1);
    const log = state.objects.find(o => o.kind === 'log')!;
    const before = structuredClone(state);
    expect(forestActionLabel({ ...state, player: { x: log.x - .5, y: log.y + .5 }, facing: 'right' })).toBe('Empurrar');
    const room = getForestRoom(1, 1);
    expect(forestActionLabel({ ...state, player: { x: room.exit.x + .5, y: room.exit.y + .5 } })).toBe('Entrar na saída');
    expect(state).toEqual(before);
  });
});
