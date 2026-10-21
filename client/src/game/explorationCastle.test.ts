import { describe, it, expect } from "vitest";
import {
  CASTLE_ROOMS,
  castleDoors,
  castleWalkable,
  enterCastle,
  readCastle,
  stepCastle,
} from "./explorationCastle";
import {
  createCombatState,
  combatSnapshot,
  readCombatState,
  stepCombat,
} from "./explorationCombat";
describe("castle branch", () => {
  it("has six connected rooms and every portal has a return path", () => {
    const visited = new Set(["vestibulo"]);
    for (let i = 0; i < 6; i++)
      for (const id of [...visited])
        for (const d of castleDoors(id as any)) {
          visited.add(d.target);
          expect(castleDoors(d.target).some(q => q.target === id)).toBe(true);
        }
    expect(visited.size).toBe(6);
  });
  it("all doors and their arrival landings are walkable; furniture and walls block", () => {
    for (const r of CASTLE_ROOMS) {
      expect(castleWalkable({ x: -1, y: 4 }, r.id)).toBe(false);
      for (const p of r.props) expect(castleWalkable(p, r.id)).toBe(false);
      for (const d of castleDoors(r.id)) {
        expect(castleWalkable(d, r.id)).toBe(true);
        const s = stepCastle(
          { ...enterCastle(), room: r.id, player: d, cooldown: 0 },
          0,
          0,
          0
        );
        expect(s.room).toBe(d.target);
        expect(castleWalkable(s.player, s.room)).toBe(true);
        expect(stepCastle(s, 0, 0, 50).room).toBe(s.room);
      }
    }
  });
  it("returns outside only through the vestibule and reentry avoids an immediate exit", () => {
    const s = stepCastle(
      { ...enterCastle(), player: { x: 5, y: 7.2 }, cooldown: 0 },
      0,
      0,
      0
    );
    expect(s.active).toBe(false);
    expect(enterCastle(s).player.y).toBe(6);
  });
  it("persists the branch without changing campaign numbering, inventory or equipment", () => {
    const s = createCombatState(31);
    s.completedRooms = Array.from({ length: 31 }, (_, i) => i);
    s.castle = {
      ...enterCastle(),
      room: "trono",
      visited: ["vestibulo", "trono"],
      player: { x: 5, y: 6 },
    };
    s.stock.fibra = 200;
    const r = readCombatState(combatSnapshot(s));
    expect(r.supported).toBe(true);
    if (r.supported) {
      expect(r.state.castle?.room).toBe("trono");
      expect(r.state.roomIndex).toBe(31);
      expect(r.state.stock.fibra).toBe(200);
    }
  });
  it("rejects unknown rooms and unsafe coordinates", () => {
    expect(readCastle({ room: "unknown" })).toBeUndefined();
    expect(
      readCastle({ room: "trono", player: { x: Infinity, y: NaN } })?.player
    ).toEqual({ x: 5, y: 6 });
  });
});
it("enters through the exterior gate and pauses the exterior simulation", () => {
  const s = createCombatState(31);
  s.player = { x: 14.5, y: -8.1 };
  s.time = 1;
  const entered = stepCombat(s, {}, 0);
  expect(entered.castle?.active).toBe(true);
  expect(stepCombat(entered, { dx: 1 }, 50)).toBe(entered);
});
