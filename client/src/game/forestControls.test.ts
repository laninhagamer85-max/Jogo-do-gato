import { describe, it, expect } from 'vitest';
import { ForestControls } from './forestControls';

describe('mixed keyboard and multitouch controls', () => {
  it('releasing one of two fingers does not release the other finger', () => {
    const input = new ForestControls();
    input.pointerDown(1, 'right'); input.pointerDown(2, 'right');
    input.pointerUp(1); expect(input.snapshot().right).toBe(true);
    input.pointerUp(2); expect(input.snapshot().right).toBe(false);
  });
  it('cancelling touch does not cancel a held keyboard direction', () => {
    const input = new ForestControls();
    input.keyDown('d', 'right'); input.pointerDown(1, 'right');
    input.pointerUp(1); expect(input.snapshot().right).toBe(true);
    input.keyUp('d'); expect(input.snapshot().right).toBe(false);
  });
  it('keeps aliases independent and clears all controls for pause/blur', () => {
    const input = new ForestControls();
    input.keyDown('d', 'right'); input.keyDown('arrowright', 'right');
    input.keyUp('d'); expect(input.snapshot().right).toBe(true);
    input.pointerDown(7, 'up');
    expect(input.snapshot()).toEqual({ right: true, up: true, left: false, down: false });
    input.clear(); input.pointerUp(7);
    expect(input.snapshot()).toEqual({ right: false, up: false, left: false, down: false });
  });
});
