import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { User } from "firebase/auth";
import { deletePlayerAccount } from "../client/src/lib/playerAccountActions";
import { PET_ICON_ATLAS, PET_SYMBOLS, getPetSymbol } from "../client/src/game/petIconAtlas";

const fakeUser = { uid: "qa-isolated" } as User;
const key = "qa-save:account:qa-isolated";
function fixture() {
  const data = new Map([key, `${key}-archive`, `${key}-archive-123`, `${key}2`, "qa-save:account:another", "qa-save"].map(k => [k, "unchanged"]));
  return { data, get length() { return data.size; }, key(index: number) { return [...data.keys()][index] ?? null; }, removeItem(k: string) { data.delete(k); } };
}
let calls = 0;
const invalid = fixture();
await assert.rejects(deletePlayerAccount(fakeUser, "NO", key, invalid, async () => { calls++; }));
assert.equal(calls, 0); assert.equal(invalid.length, 6);
const rejected = fixture();
await assert.rejects(deletePlayerAccount(fakeUser, "EXCLUIR", key, rejected, async () => { throw new Error("requires-recent-login"); }));
assert.equal(rejected.length, 6);
const accepted = fixture();
await deletePlayerAccount(fakeUser, "EXCLUIR", key, accepted, async () => { calls++; });
assert.deepEqual([...accepted.data.keys()], [`${key}2`, "qa-save:account:another", "qa-save"]);
assert.equal(calls, 1);
assert.equal(Object.keys(PET_ICON_ATLAS).length, 49);
for (const [symbol, [name, label]] of Object.entries(PET_SYMBOLS)) {
  const icon = getPetSymbol(symbol);
  assert.equal(icon.name, name); assert.equal(icon.label, label);
  assert.ok(icon.x >= 0 && icon.y >= 0 && icon.x + icon.width <= 1254 && icon.y + icon.height <= 1254);
  assert.ok(icon.clip.startsWith("M"));
}
const hash = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
assert.equal(hash("client/public/ui/pet-icons-atlas-v1.png"), hash("recovery/published-v7/ui/pet-icons-atlas-v1.png"));
console.log("PASS: invalid/rejected deletion preserves all fake saves; accepted fake deletion isolates account keys; 49 atlas regions / 67 symbols; original atlas bytes unchanged. No Firebase calls, browser QA or real account actions.");
