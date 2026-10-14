import { describe, expect, it } from "vitest";
import { createForestPuzzleState, FOREST_PUZZLE, moveForestPuzzle } from "./forestPuzzle";

function walk(state: ReturnType<typeof createForestPuzzleState>, moves: readonly (readonly [number, number])[]) {
  return moves.reduce((current, [dx, dy]) => moveForestPuzzle(current, dx, dy), state);
}

describe("solo forest puzzle", () => {
  it("keeps the player inside the clearing walls", () => {
    const initial = createForestPuzzleState();
    expect(moveForestPuzzle(initial, -1, 0)).toBe(initial);
    expect(moveForestPuzzle(initial, 0, -1)).toBe(initial);
  });

  it("allows the player to push the log one tile at a time", () => {
    const initial = createForestPuzzleState();
    const atLog = walk(initial, [[1, 0], [1, 0]]);
    const pushed = moveForestPuzzle(atLog, 0, 1);
    expect(pushed.log).toEqual({ x: 3, y: 3 });
    expect(pushed.player).toEqual({ x: 3, y: 2 });
    expect(pushed.gateOpen).toBe(false);
  });

  it("opens and latches the gate when the log reaches the pressure plate", () => {
    let state = createForestPuzzleState();
    state = walk(state, [[1, 0], [1, 0], [0, 1], [0, 1], [0, 1]]);
    expect(state.log).toEqual(FOREST_PUZZLE.pressurePlate);
    expect(state.gateOpen).toBe(true);
    expect(moveForestPuzzle(state, 0, 1).gateOpen).toBe(true);
  });

  it("does not allow the locked gate to be crossed before solving the switch", () => {
    let state = createForestPuzzleState();
    state = { ...state, player: { x: 5, y: 2 } };
    expect(moveForestPuzzle(state, 1, 0)).toBe(state);
  });

  it("collects the key and only completes at the exit after the gate is open", () => {
    let state = createForestPuzzleState();
    state = { ...state, gateOpen: true, player: { x: 9, y: 1 } };
    state = moveForestPuzzle(state, 1, 0);
    expect(state.keyCollected).toBe(true);
    state = { ...state, player: { x: 10, y: 6 } };
    expect(moveForestPuzzle(state, 0, 1).complete).toBe(true);
  });

  it("does not complete at the exit if the key was not collected", () => {
    const state = { ...createForestPuzzleState(), gateOpen: true, player: { x: 10, y: 6 } };
    const next = moveForestPuzzle(state, 0, 1);
    expect(next.complete).toBe(false);
    expect(next.player).toEqual(FOREST_PUZZLE.exit);
  });
});
