import { describe, expect, it } from 'vitest';
import { roomDepthIndex, decorationDepthIndex } from './roomDepth';

describe('shared room depth for characters and decorations', () => {
  it('puts the same friend behind an object upstage and in front downstage', () => {
    const object = decorationDepthIndex('terraco-vaso-sol', 0, 1, 0);
    expect(roomDepthIndex(0)).toBeLessThan(object);
    expect(roomDepthIndex(-1)).toBeGreaterThan(object);
  });
  it('uses the same feet ordering for the cat and the companion', () => {
    expect(roomDepthIndex(-2)).toBeGreaterThan(roomDepthIndex(-1));
    expect(roomDepthIndex(-1)).toBeGreaterThan(roomDepthIndex(0));
    expect(roomDepthIndex(-1, true)).toBeGreaterThan(roomDepthIndex(-1));
  });
  it('keeps rugs below contact shadows even when the friend walks toward the back', () => {
    expect(decorationDepthIndex('terraco-tapete-estrelas', -3, 1, 45)).toBeLessThan(-1);
    expect(decorationDepthIndex('terraco-tapete-estrelas', -3, 1, 45)).toBeLessThan(roomDepthIndex(1));
  });
});
