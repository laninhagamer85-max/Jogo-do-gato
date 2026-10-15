import { describe, expect, it } from 'vitest';
import { advanceCompanionGait, companionWalkAtlas, companionWaitingForWalkArt, COMPANION_WALK_FILES, type CompanionGait } from './companionWalkAtlas';
import { walkFrame } from './petWalkAtlas';
import { GAME_ASSETS } from './assets';
import type { CompanionId } from './PetGame';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

describe('companion walking tied to actual displacement', () => {
  const idle: CompanionGait = { phase: 0, direction: { row: 1, mirror: false }, moving: false };
  it('alternates four frames over a travelled stride and stops at rest', () => {
    let gait = idle;
    const frames: number[] = [];
    for (let i = 0; i < 4; i++) {
      gait = advanceCompanionGait(gait, { x: 0, y: 0 }, { x: 0.18, y: 0 });
      frames.push(walkFrame(gait.phase));
    }
    expect(frames).toEqual([1, 2, 3, 0]);
    expect(advanceCompanionGait(gait, { x: 1, y: 0 }, { x: 1, y: 0 })).toMatchObject({ phase: 0, moving: false });
  });
  it('uses the travelled direction including detours, rather than the original destination', () => {
    expect(advanceCompanionGait(idle, { x: 0, y: 0 }, { x: -0.1, y: 0 }).direction).toEqual({ row: 0, mirror: true });
    expect(advanceCompanionGait(idle, { x: 0, y: 0 }, { x: 0, y: 0.1 }).direction.row).toBe(2);
    expect(advanceCompanionGait(idle, { x: 0, y: 0 }, { x: 0, y: -0.1 }).direction.row).toBe(1);
  });
  it('covers every selectable friend with a distinct atlas, preserving approved paths', () => {
    expect(companionWalkAtlas('sol')).toContain('sol-walk');
    expect(companionWalkAtlas('mimo')).toContain('mimo-walk');
    expect(companionWalkAtlas('mimo')).not.toBe(companionWalkAtlas('sol'));
    const ids = Object.keys(GAME_ASSETS.companions) as CompanionId[];
    expect(Object.keys(COMPANION_WALK_FILES).sort()).toEqual([...ids].sort());
    expect(new Set(ids.map(companionWalkAtlas)).size).toBe(ids.length);
    expect(companionWalkAtlas(null)).toBeUndefined();
  });
  it('ships a recoverable original PNG for every selectable friend', () => {
    const directory = new URL('../../../recovery/companion-atlases/', import.meta.url);
    const manifest = JSON.parse(readFileSync(new URL('manifest.json', directory), 'utf8')) as { atlases: {id: CompanionId; sha256: string}[] };
    expect(manifest.atlases.map(a => a.id).sort()).toEqual(Object.keys(GAME_ASSETS.companions).sort());
    expect(manifest.atlases.find(a => a.id === 'sol')?.sha256).toBe('2df0e03d995404a2f4234fdfd5eeb13a5346d9f5cfffff047ee5c30a9a0e209c');
    expect(manifest.atlases.find(a => a.id === 'mimo')?.sha256).toBe('58359efee8528fac19c9614bfc7d6ab60fdd95745c9ebaf5145a80a7407607d6');
    for (const atlas of manifest.atlases) {
      const bytes = Buffer.from(readFileSync(new URL(`${atlas.id}-walk-v1.png.b64`, directory), 'utf8').trim(), 'base64');
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(atlas.sha256);
      expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(bytes.readUInt32BE(16)).toBeGreaterThanOrEqual(1024);
      expect(bytes.readUInt32BE(20)).toBe(bytes.readUInt32BE(16));
      expect(bytes[25]).toBe(6); // RGBA, not an opaque replacement background.
    }
  });
  it('returns to rest and keeps the last facing after a pause', () => {
    const moving = advanceCompanionGait(idle, { x: 1, y: 0 }, { x: 0.8, y: 0 });
    const stopped = advanceCompanionGait(moving, { x: 0.8, y: 0 }, { x: 0.8, y: 0 });
    expect(stopped).toEqual({ phase: 0, moving: false, direction: moving.direction });
  });
  it('prevents every friend sliding on a slow or failed texture load', () => {
    for (const id of Object.keys(GAME_ASSETS.companions) as CompanionId[]) {
      expect(companionWaitingForWalkArt(id, false)).toBe(true);
      expect(companionWaitingForWalkArt(id, true)).toBe(false);
    }
    expect(companionWaitingForWalkArt(null, false)).toBe(false);
  });
  it('faces the planned first leg while keeping paws and position still during anticipation', () => {
    const point = { x: 1, y: -1 };
    const gait = advanceCompanionGait({ ...idle, phase: 0.5 }, point, point, { x: 0, y: -1 });
    expect(gait).toEqual({ phase: 0, moving: false, direction: { row: 0, mirror: true } });
    expect(point).toEqual({ x: 1, y: -1 });
  });
});
