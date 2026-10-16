import { describe, expect, it } from "vitest";
import { completePlatformStage, createInitialGameState, setPetProfile } from "./PetGame";
import { getAdventureEntry } from "./adventureEntry";

// Pure state-function tests. Only browser evidence can prove a real portal arrival.
function fixture() {
  return setPetProfile(createInitialGameState(), { name: "QA", age: 2, gender: "menino", characterId: "menino-prata" });
}

describe("stage 1 reward and organic progress contracts", () => {
  it("first completion awards coins, the tower and collected care items once", () => {
    const before = fixture(); const untouched = structuredClone(before);
    const result = completePlatformStage(before, 1, 2, 12, 2);
    expect(result.ok).toBe(true); expect(result.firstClear).toBe(true);
    expect(result.coins).toBe(185);
    expect(result.decorationId).toBe("tower");
    expect(result.state.coins).toBe(before.coins + result.coins);
    expect(result.state.decorInventory.tower).toBe(1);
    expect(result.state.inventory.sardinha).toBe(before.inventory.sardinha + 2);
    expect(result.state.platformProgress).toEqual({ unlockedStage: 2, completedStages: [1], starsByStage: { "1": 2 } });
    expect(result.mascotUnlocked).toBe(null);
    expect(getAdventureEntry(result.state.platformProgress).stageId).toBe(2);
    expect(before).toEqual(untouched);
  });

  it("replay can improve stars but cannot duplicate wallet, decor or care rewards", () => {
    const first = completePlatformStage(fixture(), 1, 1, 5, 1);
    const replay = completePlatformStage(first.state, 1, 3, 28, 3);
    expect(replay.ok).toBe(true); expect(replay.firstClear).toBe(false);
    expect(replay.coins).toBe(0); expect(replay.bonusItem).toBe(null);
    expect(replay.state.coins).toBe(first.state.coins);
    expect(replay.state.inventory).toEqual(first.state.inventory);
    expect(replay.state.decorInventory).toEqual(first.state.decorInventory);
    expect(replay.state.platformProgress.unlockedStage).toBe(2);
    expect(replay.state.platformProgress.completedStages).toEqual([1]);
    expect(replay.state.platformProgress.starsByStage["1"]).toBe(3);
  });

  it("cannot earn or unlock phase 2 while phase 1 remains incomplete", () => {
    const before = fixture(); const blocked = completePlatformStage(before, 2, 3, 28, 3);
    expect(blocked.ok).toBe(false); expect(blocked.state).toBe(before);
    expect(before.platformProgress.unlockedStage).toBe(1);
    expect(before.decorInventory.tower).toBe(0);
  });
});
