import { useEffect, useRef, useState } from "react";
import { Info, PictureInPicture2 } from "lucide-react";
import { GAME_ASSETS } from "@/game/assets";
import { backgroundPercentToScreen } from "@/game/decorationCoordinates";

type Point = { left: number; top: number; width: number; height: number };
type DragState = { pointerId: number; startX: number; startY: number; left: number; top: number };
const POSITION_KEY = "meu-pet-creator-frame-position-v1";
const MINIMIZED_KEY = "meu-pet-creator-frame-minimized-v1";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Mini porta-retrato nativo da sala: sempre presente, arrastável e minimizável, mas nunca removível. */
export default function CreatorPlaquePicker({ onOpen }: { onOpen: () => void }) {
  const [point, setPoint] = useState<Point | null>(null);
  const [minimized, setMinimized] = useState(() => {
    try { return localStorage.getItem(MINIMIZED_KEY) === "1"; } catch { return false; }
  });
  const drag = useRef<DragState | null>(null);
  const didDrag = useRef(false);
  const savedPosition = useRef<{ left: number; top: number } | null>((() => {
    try {
      const raw = localStorage.getItem(POSITION_KEY);
      if (!raw) return null;
      const value = JSON.parse(raw) as { left?: number; top?: number };
      return typeof value.left === "number" && typeof value.top === "number" ? { left: value.left, top: value.top } : null;
    } catch { return null; }
  })());

  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".center-stage");
    if (!stage) return;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      const mobile = window.innerWidth < 600;
      const width = Math.max(78, Math.min(112, window.innerWidth * 0.09));
      const height = width * 1.45;
      const anchor = { x: mobile ? 19 : 69, y: mobile ? 20 : 21 };
      const screen = backgroundPercentToScreen(anchor);
      const margin = 8;
      const saved = savedPosition.current;
      const left = saved ? clamp(saved.left, margin, rect.width - width - margin) : screen.x - rect.left - width / 2;
      const top = saved ? clamp(saved.top, margin, rect.height - height - margin) : screen.y - rect.top - height / 2;
      setPoint({ left: clamp(left, margin, rect.width - width - margin), top: clamp(top, margin, rect.height - height - margin), width, height });
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

  useEffect(() => {
    try { localStorage.setItem(MINIMIZED_KEY, minimized ? "1" : "0"); } catch { /* Optional preference. */ }
  }, [minimized]);

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!point || event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: point.left, top: point.top };
    didDrag.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId || !point) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 7) didDrag.current = true;
    if (!didDrag.current) return;
    const stage = event.currentTarget.closest<HTMLElement>(".center-stage");
    if (!stage) return;
    const margin = 8;
    const next = {
      left: clamp(current.left + dx, margin, stage.clientWidth - point.width - margin),
      top: clamp(current.top + dy, margin, stage.clientHeight - point.height - margin),
    };
    savedPosition.current = next;
    setPoint((value) => value ? { ...value, ...next } : value);
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(next)); } catch { /* Optional preference. */ }
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  }

  function openFrame(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (didDrag.current) { didDrag.current = false; return; }
    onOpen();
  }

  if (!point) return null;
  if (minimized) return (
    <div className="creator-frame-minimized" style={{ left: "10px", top: "72px" }}>
      <button className="creator-frame-info-button" type="button" onClick={(event) => { event.stopPropagation(); onOpen(); }} aria-label="Informações sobre a idealizadora Allana Gabriela" title="Sobre a idealizadora">
        <Info size={17} /><span>Sobre</span>
      </button>
      <button className="creator-frame-restore" type="button" onClick={(event) => { event.stopPropagation(); setMinimized(false); }} aria-label="Restaurar porta-retrato" title="Mostrar porta-retrato"><PictureInPicture2 size={15} /></button>
    </div>
  );

  return (
    <div className="creator-frame-widget" style={{ left: `${point.left}px`, top: `${point.top}px`, width: `${point.width}px`, height: `${point.height}px` }}>
      <button
        className="creator-plaque-picker"
        type="button"
        onClick={openFrame}
        onDoubleClick={openFrame}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label="Porta-retrato de Allana Gabriela. Arraste para mover; toque ou dê dois cliques para abrir as informações."
        title="Arraste para mover · toque ou dê dois cliques para conhecer a idealizadora"
      >
        <span className="creator-plaque-photo-wrap" aria-hidden="true">
          <img src={GAME_ASSETS.creatorPlaque} alt="" loading="eager" decoding="async" />
          <i />
        </span>
        <span className="creator-plaque-nameplate"><strong>Allana Gabriela</strong><small>IDEALIZADORA · 2026</small></span>
        <b className="creator-plaque-nail creator-plaque-nail-left" aria-hidden="true" />
        <b className="creator-plaque-nail creator-plaque-nail-right" aria-hidden="true" />
      </button>
      <button className="creator-frame-minimize" type="button" onClick={(event) => { event.stopPropagation(); setMinimized(true); }} aria-label="Minimizar porta-retrato" title="Minimizar"><span aria-hidden="true">−</span></button>
    </div>
  );
}
