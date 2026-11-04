import assert from 'node:assert/strict';
import { soilTiles, usesPilotTerrain, drawPilotTerrain } from '../client/src/game/pilotTerrain';
import type { PlatformSurface } from '../client/src/game/platformerLevels';

const ground: PlatformSurface = Object.freeze({ x: 0, y: 420, width: 100000, height: 300, kind: 'ground' });
const before = JSON.stringify(ground);
for (const viewport of [375, 390, 844, 1366]) {
  for (const camera of [0, 1, 259, 260, 12345]) {
    const tiles = soilTiles(ground, camera, viewport);
    assert.ok(tiles.length <= (Math.ceil(viewport / 260) + 1) * 2);
    for (const tile of tiles) {
      assert.equal(tile.width / tile.height, 1024 / 520);
      assert.equal((tile.x + camera) % 260, 0);
      assert.ok(tile.x < viewport && tile.x + tile.width > 0);
      assert.ok(tile.y >= ground.y && tile.y < ground.y + ground.height);
    }
  }
}
const a = soilTiles(ground, 100, 375);
const b = soilTiles(ground, 101, 375);
assert.deepEqual(a.map(t => ({ ...t, x: t.x - 1 })), b);
assert.deepEqual(soilTiles({ ...ground, height: 20 }, 0, 375), []);
assert.deepEqual(soilTiles({ ...ground, x: 1000, width: 100 }, 0, 375), []);
assert.deepEqual(soilTiles(ground, 0, 0), []);
for (let stage = 1; stage <= 100; stage++) assert.equal(usesPilotTerrain(stage), stage === 1);
const calls: number[][] = [];
const ctx = { drawImage: (_image: unknown, ...args: number[]) => calls.push(args) } as unknown as CanvasRenderingContext2D;
drawPilotTerrain(ctx, {} as HTMLImageElement, ground, 12345, 375);
assert.ok(calls.length > 0 && calls.length <= 9);
for (const call of calls.filter(c => c[1] === 165)) assert.equal(call[6] / call[7], 1024 / 520);
assert.equal(JSON.stringify(ground), before);
console.log('PASS: soil proportions, camera anchoring, visible tile bounds, short/offscreen surfaces, stage-1 gate, draw commands and immutable geometry. Not a browser/playtest.');
