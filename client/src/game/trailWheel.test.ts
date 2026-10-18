import { describe, expect, it, vi } from 'vitest';
import { handleTrailWheel } from './trailWheel';

function wheel(overrides: Partial<Parameters<typeof handleTrailWheel>[0]> = {}) {
  return { deltaX: 0, deltaY: 40, ctrlKey: false, metaKey: false, shiftKey: false,
    altKey: false, defaultPrevented: false, cancelable: true, preventDefault: vi.fn(), ...overrides };
}
/** Clamped scroll port is a fixture, not a DOM/browser test. */
function port(initial: number) {
  let x = initial;
  return { get scrollLeft() { return x; }, set scrollLeft(value: number) { x = Math.max(0, Math.min(500, value)); } };
}
describe('landscape trail wheel routing', () => {
  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const)('preserves browser gestures using %s', key => {
    const e = wheel({ [key]: true }), el = port(100);
    handleTrailWheel(e, el);
    expect(el.scrollLeft).toBe(100); expect(e.preventDefault).not.toHaveBeenCalled();
  });
  it('keeps native horizontal trackpad gestures', () => {
    const e = wheel({ deltaX: 60, deltaY: 10 }), el = port(100);
    handleTrailWheel(e, el); expect(el.scrollLeft).toBe(100); expect(e.preventDefault).not.toHaveBeenCalled();
  });
  it.each([40, -40])('routes an ordinary %i pixel wheel movement', deltaY => {
    const e = wheel({ deltaY }), el = port(100);
    handleTrailWheel(e, el); expect(el.scrollLeft).toBe(100 + deltaY); expect(e.preventDefault).toHaveBeenCalledOnce();
  });
  it.each([[0,-40],[500,40]])('leaves page scrolling available at boundary %i', (start,deltaY) => {
    const e = wheel({ deltaY }), el = port(start);
    handleTrailWheel(e, el); expect(el.scrollLeft).toBe(start); expect(e.preventDefault).not.toHaveBeenCalled();
  });
  it('consumes the final partial movement up to the trail edge', () => {
    const e = wheel(), el = port(490);
    handleTrailWheel(e, el); expect(el.scrollLeft).toBe(500); expect(e.preventDefault).toHaveBeenCalledOnce();
  });
  it.each([{ defaultPrevented: true }, { cancelable: false }, { deltaY: 0 }, { deltaY: NaN }, { deltaX: Infinity }])('leaves unusable or already-handled events untouched: %j', overrides => {
    const e = wheel(overrides), el = port(100);
    handleTrailWheel(e, el); expect(el.scrollLeft).toBe(100); expect(e.preventDefault).not.toHaveBeenCalled();
  });
});
