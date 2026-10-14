export const FOREST_CAMPAIGN_SAVE_VERSION = 1 as const;
export const FOREST_CHAPTER_COUNT = 3;

export type ForestCampaignProgress = {
  version: typeof FOREST_CAMPAIGN_SAVE_VERSION;
  unlockedChapter: number;
  completedChapters: number[];
  bestActionsByChapter: Record<string, number>;
};

export type ForestProgressRead =
  | { supported: true; migrated: boolean; progress: ForestCampaignProgress }
  | { supported: false; version: number };

export function createInitialForestProgress(): ForestCampaignProgress {
  return { version: FOREST_CAMPAIGN_SAVE_VERSION, unlockedChapter: 1, completedChapters: [], bestActionsByChapter: {} };
}

/**
 * Parse an additive campaign field. Invalid old data gets a safe fresh campaign;
 * a newer version is returned untouched so this client cannot overwrite it.
 */
export function normalizeForestProgress(value: unknown): ForestProgressRead {
  if (value === undefined || value === null) return { supported: true, migrated: false, progress: createInitialForestProgress() };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { supported: true, migrated: true, progress: createInitialForestProgress() };
  }

  const raw = value as Record<string, unknown>;
  const version = Number(raw.version ?? 0);
  if (Number.isFinite(version) && version > FOREST_CAMPAIGN_SAVE_VERSION) {
    return { supported: false, version: Math.floor(version) };
  }

  const completedSource = Array.isArray(raw.completedChapters)
    ? raw.completedChapters
    : Array.isArray(raw.completedLevels)
      ? raw.completedLevels
      : [];
  const completedChapters = Array.from(new Set(completedSource
    .map(Number)
    .filter((chapter) => Number.isInteger(chapter) && chapter >= 1 && chapter <= FOREST_CHAPTER_COUNT)))
    .sort((a, b) => a - b);

  let contiguous = 0;
  const completedSet = new Set(completedChapters);
  while (completedSet.has(contiguous + 1)) contiguous += 1;
  const requested = Number(raw.unlockedChapter ?? raw.unlockedLevel ?? contiguous + 1);
  const safeRequested = Number.isFinite(requested) ? Math.round(requested) : contiguous + 1;
  const unlockedChapter = Math.max(1, Math.min(FOREST_CHAPTER_COUNT, contiguous + 1, safeRequested));

  const rawBest = raw.bestActionsByChapter && typeof raw.bestActionsByChapter === "object" && !Array.isArray(raw.bestActionsByChapter)
    ? raw.bestActionsByChapter as Record<string, unknown>
    : {};
  const bestActionsByChapter: Record<string, number> = {};
  for (const chapter of completedChapters) {
    const actions = Number(rawBest[String(chapter)]);
    if (Number.isInteger(actions) && actions >= 1 && actions <= 9999) bestActionsByChapter[String(chapter)] = actions;
  }

  const progress: ForestCampaignProgress = { version: FOREST_CAMPAIGN_SAVE_VERSION, unlockedChapter, completedChapters, bestActionsByChapter };
  const migrated = version !== FOREST_CAMPAIGN_SAVE_VERSION
    || raw.unlockedChapter !== unlockedChapter
    || JSON.stringify(raw.completedChapters) !== JSON.stringify(completedChapters)
    || JSON.stringify(raw.bestActionsByChapter ?? {}) !== JSON.stringify(bestActionsByChapter);
  return { supported: true, migrated, progress };
}

/** Complete only the currently unlocked chapter or a replay of an already cleared chapter. */
export function completeForestChapter(
  current: ForestCampaignProgress,
  chapter: number,
  actions: number,
): ForestCampaignProgress {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > FOREST_CHAPTER_COUNT) return current;
  if (chapter > current.unlockedChapter) return current;
  if (!Number.isInteger(actions) || actions < 0 || actions > 9999) return current;

  const completedChapters = Array.from(new Set([...current.completedChapters, chapter])).sort((a, b) => a - b);
  const bestActionsByChapter = { ...current.bestActionsByChapter };
  const previous = bestActionsByChapter[String(chapter)];
  if (actions > 0) bestActionsByChapter[String(chapter)] = previous === undefined ? actions : Math.min(previous, actions);
  let contiguous = 0;
  const completedSet = new Set(completedChapters);
  while (completedSet.has(contiguous + 1)) contiguous += 1;
  return {
    version: FOREST_CAMPAIGN_SAVE_VERSION,
    unlockedChapter: Math.min(FOREST_CHAPTER_COUNT, contiguous + 1),
    completedChapters,
    bestActionsByChapter,
  };
}
