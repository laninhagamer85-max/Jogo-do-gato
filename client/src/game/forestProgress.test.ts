import { describe, expect, it } from "vitest";
import { completeForestChapter, createInitialForestProgress, normalizeForestProgress } from "./forestProgress";

describe("forest campaign progression", () => {
  it("starts with only chapter 1 unlocked", () => {
    expect(createInitialForestProgress()).toEqual({ version: 1, unlockedChapter: 1, completedChapters: [], bestActionsByChapter: {} });
  });

  it("migrates a legacy/empty campaign field without affecting the rest of a save", () => {
    expect(normalizeForestProgress(undefined)).toMatchObject({ supported: true, progress: { version: 1, unlockedChapter: 1 } });
    expect(normalizeForestProgress({ version: 0 })).toMatchObject({ supported: true, migrated: true, progress: { version: 1, unlockedChapter: 1 } });
  });

  it("unlocks chapter 2 only after organic completion of chapter 1", () => {
    const start = createInitialForestProgress();
    expect(completeForestChapter(start, 2, 42)).toBe(start);
    const cleared = completeForestChapter(start, 1, 42);
    expect(cleared.completedChapters).toEqual([1]);
    expect(cleared.unlockedChapter).toBe(2);
    expect(cleared.bestActionsByChapter["1"]).toBe(42);
  });

  it("does not permit corrupted progress to skip a chapter", () => {
    const read = normalizeForestProgress({ version: 1, unlockedChapter: 3, completedChapters: [2, 3], bestActionsByChapter: { "3": 3 } });
    expect(read).toMatchObject({ supported: true, progress: { unlockedChapter: 1, completedChapters: [2, 3], bestActionsByChapter: { } } });
  });

  it("keeps the best action count on replay and marks every chapter once", () => {
    let progress = createInitialForestProgress();
    progress = completeForestChapter(progress, 1, 70);
    progress = completeForestChapter(progress, 1, 35);
    progress = completeForestChapter(progress, 2, 55);
    progress = completeForestChapter(progress, 3, 80);
    expect(progress.completedChapters).toEqual([1, 2, 3]);
    expect(progress.unlockedChapter).toBe(3);
    expect(progress.bestActionsByChapter).toEqual({ "1": 35, "2": 55, "3": 80 });
  });

  it("preserves progress from a newer app version without making it writable", () => {
    expect(normalizeForestProgress({ version: 2, unlockedChapter: 3, opaque: "keep" })).toEqual({ supported: false, version: 2 });
  });
});
