import { describe, expect, it } from "vitest";
import { getPlatformMusicPattern } from "@/game/platformerAudio";

describe("platform audio themes", () => {
  it("keeps a distinct, slow original motif for the forest campaign", () => {
    const adventure = getPlatformMusicPattern("adventure");
    const forest = getPlatformMusicPattern("forest");
    expect(forest.melody).toHaveLength(16);
    expect(forest.bass.length).toBeGreaterThan(0);
    expect(forest.stepMs).toBeGreaterThan(adventure.stepMs);
    expect(forest.melody).not.toEqual(adventure.melody);
    expect(forest.melody.every((frequency) => Number.isFinite(frequency) && frequency > 0)).toBe(true);
  });
});
