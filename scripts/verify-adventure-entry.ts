import assert from "node:assert/strict";
import { getAdventureEntry } from "../client/src/game/adventureEntry";
import type { PlatformProgress } from "../client/src/game/PetGame";

// Verify campaign boundaries without a browser, accounts or persistent saves.
for (let unlockedStage = 1; unlockedStage <= 101; unlockedStage++) {
  const progress: PlatformProgress = {
    unlockedStage,
    completedStages: Array.from({ length: unlockedStage - 1 }, (_, i) => i + 1),
    starsByStage: {},
  };
  const before = JSON.stringify(progress);
  Object.freeze(progress.completedStages);
  Object.freeze(progress.starsByStage);
  Object.freeze(progress);
  const entry = getAdventureEntry(progress);
  assert(entry.stageId >= 1 && entry.stageId <= 100);
  assert(entry.stageId <= progress.unlockedStage, "CTA must not start a locked stage");
  if (unlockedStage <= 100) assert(!progress.completedStages.includes(entry.stageId), "Continue must select the next uncleared stage");
  assert.equal(JSON.stringify(progress), before, "Entry selection must not modify a save");
}
const progress = (unlockedStage: number): PlatformProgress => ({ unlockedStage, completedStages: [], starsByStage: {} });
assert.equal(getAdventureEntry(progress(1)).label, "Jogar");
assert.equal(getAdventureEntry(progress(2)).label, "Continuar aventura");
assert.equal(getAdventureEntry(progress(11)).world, 2);
assert.equal(getAdventureEntry(progress(100)).campaignComplete, false);
assert.deepEqual(getAdventureEntry(progress(101)), { stageId: 100, world: 10, campaignComplete: true, label: "Jogar novamente" });
console.log("PASS: 101 progress states, locked-stage boundary, world transition, labels, replay and save immutability. Not a browser or playthrough test.");
