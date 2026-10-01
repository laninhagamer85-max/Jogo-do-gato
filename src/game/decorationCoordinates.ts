export type DecorationPoint = { x: number; y: number };
export type StageRect = { left: number; top: number; width: number; height: number };

const BACKGROUND_ASPECT = 16 / 9;
const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

/** The Babylon room art is rendered as a 16:9 cover across the full viewport. */
export function getBackgroundRect(viewWidth: number, viewHeight: number) {
  const width = Math.max(viewWidth, viewHeight * BACKGROUND_ASPECT);
  const height = Math.max(viewHeight, viewWidth / BACKGROUND_ASPECT);
  return {
    left: (viewWidth - width) / 2,
    top: (viewHeight - height) / 2,
    width,
    height,
  };
}

export function screenToBackgroundPercent(
  screenX: number,
  screenY: number,
  viewWidth = window.innerWidth,
  viewHeight = window.innerHeight,
): DecorationPoint {
  const rect = getBackgroundRect(viewWidth, viewHeight);
  return {
    x: clampPercent(((screenX - rect.left) / rect.width) * 100),
    y: clampPercent(((screenY - rect.top) / rect.height) * 100),
  };
}

export function backgroundPercentToScreen(
  point: DecorationPoint,
  viewWidth = window.innerWidth,
  viewHeight = window.innerHeight,
): DecorationPoint {
  const rect = getBackgroundRect(viewWidth, viewHeight);
  return {
    x: rect.left + (point.x / 100) * rect.width,
    y: rect.top + (point.y / 100) * rect.height,
  };
}

/** Preserve the visible position of a legacy placement stored relative to .center-stage. */
export function legacyStagePercentToBackground(
  point: DecorationPoint,
  stageRect: StageRect,
  viewWidth = window.innerWidth,
  viewHeight = window.innerHeight,
): DecorationPoint {
  return screenToBackgroundPercent(
    stageRect.left + (point.x / 100) * stageRect.width,
    stageRect.top + (point.y / 100) * stageRect.height,
    viewWidth,
    viewHeight,
  );
}
