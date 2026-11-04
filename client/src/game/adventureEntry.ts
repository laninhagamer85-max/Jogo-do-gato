import type { PlatformProgress } from "./PetGame";

/** Read-only summary of the next playable stage; never awards or unlocks progress. */
export function getAdventureEntry(progress: PlatformProgress) {
  const stageId = Math.max(1, Math.min(100, Math.floor(progress.unlockedStage)));
  const campaignComplete = progress.unlockedStage > 100;
  return {
    stageId,
    world: Math.ceil(stageId / 10),
    campaignComplete,
    label: campaignComplete ? "Jogar novamente" : stageId > 1 ? "Continuar aventura" : "Jogar",
  };
}
