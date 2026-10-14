import { describe, expect, it } from "vitest";
import { createForestGameState, FOREST_CHAPTERS, FOREST_MAP, FOREST_ROOMS, getForestRoom, stepForestGame } from "./forestPuzzle";

function tap(state: ReturnType<typeof createForestGameState>, direction: "up" | "down" | "left" | "right", count = 1) {
  let next = state;
  const input = { up: direction === "up", down: direction === "down", left: direction === "left", right: direction === "right" };
  for (let i = 0; i < count; i++) next = stepForestGame(next, { ...input, actionPressed: true }, 0).state;
  return next;
}
function moveTo(state: ReturnType<typeof createForestGameState>, x: number, y: number) {
  return { ...state, player: { x: x + 0.5, y: y + 0.5 } };
}

describe("Bosque dos Caminhos campaign map", () => {
  it("contains three chapters with two distinct, bounded rooms each", () => {
    expect(FOREST_CHAPTERS).toHaveLength(3);
    expect(FOREST_ROOMS).toHaveLength(6);
    for (const room of FOREST_ROOMS) {
      expect(room.walls).toEqual(expect.arrayContaining([
        { x: 0, y: 0 }, { x: FOREST_MAP.columns - 1, y: FOREST_MAP.rows - 1 },
      ]));
      expect(room.spawn.x).toBeGreaterThan(0);
      expect(room.exit.x).toBeLessThan(FOREST_MAP.columns - 1);
    }
  });

  it("moves smoothly but keeps the actor outside walls and unbridged water", () => {
    const room = getForestRoom(2, 1);
    let state = { ...createForestGameState(2, 1), player: { x: 1.5, y: 1.5 } };
    for (let i = 0; i < 10; i++) state = stepForestGame(state, { right: true }, 0.05).state;
    expect(state.player.x).toBeGreaterThan(2.9);
    state = { ...state, player: { x: 5.5, y: 3.5 } };
    for (let i = 0; i < 10; i++) state = stepForestGame(state, { right: true }, 0.05).state;
    expect(room.water.some((water) => water.x === 6)).toBe(true);
    expect(state.player.x).toBeLessThan(6);
    state = { ...state, placedBridges: ["willow-bridge"] };
    for (let i = 0; i < 20; i++) state = stepForestGame(state, { right: true }, 0.05).state;
    expect(state.player.x).toBeGreaterThan(6.1);
  });

  it("advances the pet's visual gait only while moving and lets it settle when input stops", () => {
    const initial = createForestGameState(1, 1);
    const walking = stepForestGame(initial, { right: true }, 0.05).state;
    expect(walking.walkPhase).toBeGreaterThan(initial.walkPhase);
    const settled = stepForestGame(walking, {}, 0.05).state;
    expect(settled.walkPhase).toBe(walking.walkPhase);
    expect(walking.walking).toBe(true);
    expect(settled.walking).toBe(false);
    expect(settled.walkPhase).toBeGreaterThanOrEqual(0);
  });

  it("lets the player push the log onto a plate and latches the gate", () => {
    let state = createForestGameState(1, 1);
    state = moveTo(state, 3, 3);
    state = tap(state, "right");
    expect(state.objects.find((item) => item.id === "log-1")).toMatchObject({ x: 5, y: 3 });
    state = tap(state, "right");
    expect(state.objects.find((item) => item.id === "log-1")).toMatchObject({ x: 6, y: 3 });
    expect(state.openGates).toContain("clearing-gate-1");
  });

  it("solves the first room through ordinary movement after pushing the log through the latched gate", () => {
    const hold = (current: ReturnType<typeof createForestGameState>, direction: "up" | "down" | "left" | "right", frames: number) => {
      let next = current;
      for (let frame = 0; frame < frames; frame++) {
        next = stepForestGame(next, { up: direction === "up", down: direction === "down", left: direction === "left", right: direction === "right" }, 0.05).state;
      }
      return next;
    };
    const act = (current: ReturnType<typeof createForestGameState>) => stepForestGame(current, { actionPressed: true }, 0).state;

    let state = createForestGameState(1, 1);
    state = hold(state, "right", 13);
    state = hold(state, "up", 13);
    state = hold(state, "right", 2);
    for (let i = 0; i < 5; i++) state = act(state);
    expect(state.objects.find((item) => item.id === "log-1")).toMatchObject({ x: 9, y: 3 });
    expect(state.openGates).toContain("clearing-gate-1");

    state = hold(state, "up", 13);
    state = hold(state, "right", 13);
    expect(state.collectedKeys).toContain("clearing-key-1");
    state = hold(state, "down", 26);
    state = hold(state, "right", 13);
    const result = stepForestGame(state, { actionPressed: true }, 0);
    expect(result.events).toContain("room-cleared");
    expect(result.state.room).toBe(2);
  });

  it("collects a key on contact and opens a matching gate by contextual action", () => {
    let state = createForestGameState(3, 1);
    state = moveTo(state, 3, 1);
    state = stepForestGame(state, {}, 0).state;
    expect(state.collectedKeys).toContain("copper-key");
    state = moveTo(state, 6, 2);
    state = stepForestGame({ ...state, facing: "right" }, { actionPressed: true }, 0).state;
    expect(state.openGates).toContain("copper-door");
    expect(state.collectedKeys).not.toContain("copper-key");
  });

  it("places a carried plank on a bridge socket and permits crossing", () => {
    let state = createForestGameState(2, 1);
    state = moveTo(state, 3, 3);
    state = stepForestGame({ ...state, facing: "right" }, { actionPressed: true }, 0).state;
    expect(state.carriedObjectId).toBe("willow-plank");
    state = moveTo(state, 5, 3);
    state = stepForestGame({ ...state, facing: "right" }, { usePressed: true }, 0).state;
    expect(state.placedBridges).toContain("willow-bridge");
    for (let i = 0; i < 30; i++) state = stepForestGame(state, { right: true }, 0.05).state;
    expect(state.player.x).toBeGreaterThan(6.1);
  });

  it("lures the final gentle sentinel without combat or a timer", () => {
    let state = createForestGameState(3, 2);
    state = moveTo(state, 3, 1);
    state = stepForestGame({ ...state, facing: "right" }, { actionPressed: true }, 0).state;
    expect(state.luredGuards).toContain("moon-watch");
    expect(state.guards.find((guard) => guard.id === "moon-watch")?.lured).toBe(true);
    expect(state.bumps).toBe(0);
  });

  it("returns a bumped pet to the safe start without losing the puzzle state", () => {
    let state = createForestGameState(2, 2);
    const guard = state.guards[0];
    state = { ...state, player: { x: guard.x, y: guard.y }, simMs: 1800, invulnerableUntil: 0 };
    const result = stepForestGame(state, {}, 0.01);
    expect(result.events).toContain("bump");
    expect(result.state.player).toEqual({ x: 1.5, y: 3.5 });
    expect(result.state.bumps).toBe(1);
    expect(result.state.collectedKeys).toEqual(state.collectedKeys);
  });

  it("clears the room and chapter only after the required objects are solved", () => {
    let state = createForestGameState(1, 1);
    state = { ...state, player: { x: 12.5, y: 5.5 }, collectedKeys: ["clearing-key-1"], openGates: ["clearing-gate-1"] };
    state = stepForestGame({ ...state, facing: "right" }, { actionPressed: true }, 0).state;
    expect(state.room).toBe(2);
    expect(state.chapterComplete).toBe(false);
    state = { ...state, player: { x: 12.5, y: 5.5 }, collectedKeys: ["clearing-key-2"], openGates: ["clearing-gate-2"] };
    const result = stepForestGame({ ...state, facing: "right" }, { actionPressed: true }, 0);
    expect(result.events).toContain("chapter-cleared");
    expect(result.state.chapterComplete).toBe(true);
  });

  it("does not complete a room when any required key or bridge is missing", () => {
    const state = { ...createForestGameState(2, 1), player: { x: 12.5, y: 5.5 } };
    const result = stepForestGame({ ...state, facing: "right" }, { actionPressed: true }, 0);
    expect(result.events).not.toContain("room-cleared");
    expect(result.state.room).toBe(1);
    expect(result.state.message).toMatch(/chave|prancha/i);
  });
});
