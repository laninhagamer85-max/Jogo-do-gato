export type StorageAdapter = Pick<Storage, "length" | "key" | "getItem" | "setItem" | "removeItem">;

/** Preserve a recovery copy only if none exists (used while migrating a damaged legacy save). */
export function archiveSaveOnce(storage: StorageAdapter, saveKey: string, archiveKey: string): boolean {
  const currentSave = storage.getItem(saveKey);
  if (!currentSave || storage.getItem(archiveKey) !== null) return false;
  storage.setItem(archiveKey, currentSave);
  return true;
}

/** Keep one rolling recovery copy when the player deliberately starts a fresh game. */
export function archiveLatestSave(storage: StorageAdapter, saveKey: string, archiveKey: string): boolean {
  const currentSave = storage.getItem(saveKey);
  if (!currentSave) return false;
  storage.setItem(archiveKey, currentSave);
  return true;
}

/** Remove this game's saves and preferences without touching other apps on the same origin. */
export function clearLocalGameData(storage: StorageAdapter): number {
  const gameKeys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && (key.startsWith("meu-pet-") || key === "pet_estado")) gameKeys.push(key);
  }
  gameKeys.forEach((key) => storage.removeItem(key));
  return gameKeys.length;
}
