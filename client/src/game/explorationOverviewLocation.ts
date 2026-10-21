import type { CombatPoint } from "./explorationCombat";
/** Fixed CSS-pixel beacon: readable even when the entire world is zoomed out. */
export function overviewLocationLayout(
  width: number,
  height: number,
  point: CombatPoint
) {
  const labelWidth = 116,
    labelHeight = 24;
  return {
    point: { ...point },
    radius: 8,
    label: {
      x: Math.max(
        4,
        Math.min(width - labelWidth - 4, point.x - labelWidth / 2)
      ),
      y: Math.max(4, Math.min(height - labelHeight - 4, point.y + 19)),
      width: labelWidth,
      height: labelHeight,
    },
  };
}
export function drawOverviewLocation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  point: CombatPoint
) {
  const v = overviewLocationLayout(width, height, point),
    p = v.point,
    b = v.label;
  ctx.save();
  ctx.shadowColor = "#ff725b";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "rgba(255,107,78,.22)";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#f75445";
  ctx.strokeStyle = "#fff7d9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(p.x, p.y, v.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff9e6";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(20,38,30,.93)";
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.width, b.height, 8);
  ctx.fill();
  ctx.font = "600 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff8df";
  ctx.fillText("Você está aqui", b.x + b.width / 2, b.y + b.height / 2);
  ctx.restore();
}
