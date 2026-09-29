import { useEffect, useState } from "react";
import { backgroundPercentToScreen } from "@/game/decorationCoordinates";

type Point = { left: number; top: number; width: number; height: number };
const PLAQUE_ANCHOR = { x: 59, y: 25 };
const PLAQUE_ASPECT = 0.7105;
const CAPTION_HEIGHT = 23;

/** Transparent, accessible hit target aligned with the plaque rendered inside the Babylon scene. */
export default function CreatorPlaquePicker({ onOpen }: { onOpen: () => void }) {
  const [point, setPoint] = useState<Point | null>(null);

  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".center-stage");
    if (!stage) return;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      const size = Math.max(68, Math.min(126, window.innerWidth * 0.09));
      const anchor = { ...PLAQUE_ANCHOR, x: window.innerWidth < 600 ? 44 : PLAQUE_ANCHOR.x };
      const screen = backgroundPercentToScreen(anchor);
      const width = size * PLAQUE_ASPECT;
      const margin = 5;
      setPoint({
        left: Math.max(margin, Math.min(rect.width - width - margin, screen.x - rect.left - width / 2)),
        top: Math.max(margin, Math.min(rect.height - size - margin, screen.y - rect.top - size / 2)),
        width,
        height: size + CAPTION_HEIGHT,
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
      aria-label="Conheça Allana Gabriela, idealizadora do Meu Pet Virtual"
      title="Conheça a idealizadora do jogo"
    ><span className="creator-plaque-caption">Allana Gabriela</span></button>
  );
}
