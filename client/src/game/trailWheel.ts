type TrailWheelEvent = Pick<WheelEvent,
  'deltaX' | 'deltaY' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey' |
  'defaultPrevented' | 'cancelable' | 'preventDefault'>;

/** Route ordinary wheel input along a landscape trail without consuming browser zoom. */
export function handleTrailWheel(event: TrailWheelEvent, viewport: { scrollLeft: number }) {
  // Trackpad pinch is also a wheel event with ctrlKey; modified gestures belong to the browser.
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
    event.defaultPrevented || !event.cancelable || !Number.isFinite(event.deltaX) ||
    !Number.isFinite(event.deltaY) || event.deltaY === 0 ||
    Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  const before = viewport.scrollLeft;
  viewport.scrollLeft += event.deltaY;
  // At either end, let the surrounding page receive its normal scroll.
  if (viewport.scrollLeft !== before) event.preventDefault();
}
