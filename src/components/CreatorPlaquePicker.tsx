import { useEffect, useState } from "react";
import { GAME_ASSETS } from "@/game/assets";
import { backgroundPercentToScreen } from "@/game/decorationCoordinates";

type Point = { left: number; top: number; width: number; height: number };

/** Interactive portrait frame anchored to the room background like a native decoration. */
export default function CreatorPlaquePicker({ onOpen }: { onOpen: () => void }) {
  const [point, setPoint] = useState<Point | null>(null);

  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".center-stage");
    if (!stage) return;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      const mobile = window.innerWidth < 600;
      const width = Math.max(78, Math.min(112, window.innerWidth * 0.09));
      const height = width * 1.45;
      const anchor = { x: mobile ? 64 : 69, y: mobile ? 19 : 21 };
      const screen = backgroundPercentToScreen(anchor);
      const margin = 8;
      setPoint({
        left: Math.max(margin, Math.min(rect.width - width - margin, screen.x - rect.left - width / 2)),
        top: Math.max(margin, Math.min(rect.height - height - margin, screen.y - rect.top - height / 2)),
        width,
        height,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!point) return null;
  return (
    <button
      className="creator-plaque-picker"
      type="button"
      style={{ left: `${point.left}px`, top: `${point.top}px`, width: `${point.width}px`, height: `${point.height}px` }}
      onClick={(event) => { event.stopPropagation(); onOpen(); }}
      aria-label="Abrir o porta-retrato e conhecer a idealizadora Allana Gabriela"
      title="Toque no porta-retrato para conhecer a idealizadora"
    >
      <span className="creator-plaque-photo-wrap" aria-hidden="true">
        <img src={GAME_ASSETS.creatorPlaque} alt="" loading="eager" decoding="async" />
        <i />
      </span>
      <span className="creator-plaque-nameplate">
        <strong>Allana Gabriela</strong>
        <small>IDEALIZADORA · 2026</small>
      </span>
      <b className="creator-plaque-nail creator-plaque-nail-left" aria-hidden="true" />
      <b className="creator-plaque-nail creator-plaque-nail-right" aria-hidden="true" />
    </button>
  );
}
