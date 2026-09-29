import { useEffect, useState } from "react";
import { backgroundPercentToScreen } from "@/game/decorationCoordinates";

type Point = { left: number; top: number; width: number; height: number };

/** Native, fixed room decoration; its click target never covers the pet and contains no portrait. */
export default function CreatorPlaquePicker({ onOpen }: { onOpen: () => void }) {
  const [point, setPoint] = useState<Point | null>(null);

  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".center-stage");
    if (!stage) return;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      const mobile = window.innerWidth < 600;
      const width = Math.max(94, Math.min(148, window.innerWidth * 0.12));
      const height = width * 0.61;
      const anchor = { x: mobile ? 63 : 69, y: mobile ? 12 : 17 };
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
      aria-label="Abrir a homenagem à idealizadora Allana Gabriela"
      title="Toque para conhecer a idealizadora"
    >
      <span className="creator-plaque-icon" aria-hidden="true">✦</span>
      <strong>Allana Gabriela</strong>
      <small>IDEALIZADORA · 2026</small>
      <i aria-hidden="true" />
    </button>
  );
}
