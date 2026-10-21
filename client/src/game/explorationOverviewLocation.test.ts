import { expect, it } from "vitest";
import { overviewLocationLayout } from "./explorationOverviewLocation";
import { nascentesView } from "./explorationChapter4View";
it.each([
  [390, 714],
  [844, 298],
  [375, 545],
])(
  "keeps world position exact and label readable at %ix%i",
  (width, height) => {
    for (const player of [
      { x: 17, y: -2 },
      { x: -45, y: 32 },
      { x: 100, y: -100 },
    ]) {
      const view = nascentesView(width, height, player, 1, true),
        point = {
          x: view.left + player.x * view.tile,
          y: view.top + player.y * view.tile,
        },
        marker = overviewLocationLayout(width, height, point);
      expect(marker.point).toEqual(point);
      expect(point.x).toBeGreaterThan(0);
      expect(point.x).toBeLessThan(width);
      expect(point.y).toBeGreaterThan(height > width ? 170 : 0);
      expect(marker.label.x).toBeGreaterThanOrEqual(0);
      expect(marker.label.x + marker.label.width).toBeLessThanOrEqual(width);
      expect(marker.label.y + marker.label.height).toBeLessThanOrEqual(height);
      expect(marker.radius).toBe(8);
    }
  }
);
