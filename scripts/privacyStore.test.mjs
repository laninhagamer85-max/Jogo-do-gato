import test from "node:test";
import assert from "node:assert/strict";
import { archiveLatestSave, archiveSaveOnce, clearLocalGameData } from "../src/game/privacyStore.ts";

class MemoryStorage {
  values = new Map();
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

test("legacy recovery archive is created once and never overwritten", () => {
  const storage = new MemoryStorage();
  storage.setItem("meu-pet-virtual-save-v2", "legacy profile");
  assert.equal(archiveSaveOnce(storage, "meu-pet-virtual-save-v2", "meu-pet-virtual-save-v2-archive"), true);
  storage.setItem("meu-pet-virtual-save-v2", "changed after migration");
  assert.equal(archiveSaveOnce(storage, "meu-pet-virtual-save-v2", "meu-pet-virtual-save-v2-archive"), false);
  assert.equal(storage.getItem("meu-pet-virtual-save-v2-archive"), "legacy profile");
  assert.equal(storage.length, 2);
});

test("new game keeps only one rolling archive of the immediately previous save", () => {
  const storage = new MemoryStorage();
  assert.equal(archiveLatestSave(storage, "meu-pet-virtual-save-v2", "meu-pet-virtual-save-v2-archive"), false);
  storage.setItem("meu-pet-virtual-save-v2", "first profile");
  assert.equal(archiveLatestSave(storage, "meu-pet-virtual-save-v2", "meu-pet-virtual-save-v2-archive"), true);
  storage.setItem("meu-pet-virtual-save-v2", "second profile");
  assert.equal(archiveLatestSave(storage, "meu-pet-virtual-save-v2", "meu-pet-virtual-save-v2-archive"), true);
  assert.equal(storage.getItem("meu-pet-virtual-save-v2-archive"), "second profile");
  assert.equal(storage.length, 2);
});

test("clearLocalGameData removes game state and preferences but leaves unrelated origin data untouched", () => {
  const storage = new MemoryStorage();
  storage.setItem("meu-pet-virtual-save-v2", "profile");
  storage.setItem("meu-pet-virtual-save-v2-archive-123", "old profile");
  storage.setItem("meu-pet-panels-v2", "preferences");
  storage.setItem("meu-pet-platform-audio-v1", "audio settings");
  storage.setItem("pet_estado", "legacy game data");
  storage.setItem("theme", "light");
  storage.setItem("other-app-user", "untouched");

  assert.equal(clearLocalGameData(storage), 5);
  assert.equal(storage.length, 2);
  assert.equal(storage.getItem("theme"), "light");
  assert.equal(storage.getItem("other-app-user"), "untouched");
});
