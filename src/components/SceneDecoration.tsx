import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Check, RotateCw, X } from "lucide-react";
import { DECORATIONS, type DecorationPlacement } from "@/game/PetGame";
import {
  backgroundPercentToScreen,
  legacyStagePercentToBackground,
  screenToBackgroundPercent,
} from "@/game/decorationCoordinates";

type DecorationMovePatch = Partial<Pick<DecorationPlacement, "x" | "y" | "rotation" | "anchor">>;
type ScreenOffset = { left: number; top: number };

export function SceneDecoration({ placement, image, selected, onSelect, onFix, onMove, onRemove }: {
  placement: DecorationPlacement;
  image: string;
  selected: boolean;
  onSelect: () => void;
  onFix: () => void;
  onMove: (id: string, patch: DecorationMovePatch) => void;
  onRemove: (id: string) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [position, setPosition] = useState({ x: placement.x, y: placement.y });
  const [screenOffset, setScreenOffset] = useState<ScreenOffset | null>(null);
  const name = DECORATIONS.find((item) => item.id === placement.itemId)?.name ?? "Decoração";

  useEffect(() => setPosition({ x: placement.x, y: placement.y }), [placement.x, placement.y]);

  useEffect(() => {
    const node = nodeRef.current;
    const stage = node?.parentElement;
    if (!stage || placement.anchor !== "background") {
      setScreenOffset(null);
      return;
    }
    const updateScreenPosition = () => {
      const stageRect = stage.getBoundingClientRect();
      const screen = backgroundPercentToScreen(position);
      setScreenOffset({ left: screen.x - stageRect.left, top: screen.y - stageRect.top });
    };
    updateScreenPosition();
    const observer = new ResizeObserver(updateScreenPosition);
    observer.observe(stage);
    window.addEventListener("resize", updateScreenPosition);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScreenPosition);
    };
  }, [position, placement.anchor]);

  function currentBackgroundPoint() {
    if (placement.anchor === "background") return position;
    const stageRect = nodeRef.current?.parentElement?.getBoundingClientRect();
    if (!stageRect) return position;
    return legacyStagePercentToBackground(position, stageRect);
  }

  function pointAfterDrag(start: NonNullable<typeof startRef.current>, clientX: number, clientY: number) {
    const initialScreen = backgroundPercentToScreen({ x: start.x, y: start.y });
    return screenToBackgroundPercent(
      initialScreen.x + clientX - start.px,
      initialScreen.y + clientY - start.py,
    );
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (!selected) {
      onSelect();
      return;
    }
    const point = currentBackgroundPoint();
    startRef.current = { ...point, px: event.clientX, py: event.clientY };
    if (placement.anchor !== "background") {
      setPosition(point);
      onMove(placement.id, { ...point, anchor: "background" });
    }
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Older browsers may not expose pointer capture. */ }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = startRef.current;
    if (!selected || !start || !(event.buttons || event.pointerType === "touch")) return;
    event.stopPropagation();
    setPosition(pointAfterDrag(start, event.clientX, event.clientY));
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = startRef.current;
    if (!start) return;
    event.stopPropagation();
    startRef.current = null;
    const dx = Math.abs(event.clientX - start.px);
    const dy = Math.abs(event.clientY - start.py);
    if (dx + dy > 4) {
      const next = pointAfterDrag(start, event.clientX, event.clientY);
      setPosition(next);
      onMove(placement.id, { ...next, anchor: "background" });
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (!selected) onSelect();
      return;
    }
    const step = event.shiftKey ? 5 : 1;
    const next = currentBackgroundPoint();
    if (event.key === "ArrowLeft") next.x = Math.max(0, next.x - step);
    else if (event.key === "ArrowRight") next.x = Math.min(100, next.x + step);
    else if (event.key === "ArrowUp") next.y = Math.max(0, next.y - step);
    else if (event.key === "ArrowDown") next.y = Math.min(100, next.y + step);
    else return;
    if (!selected) onSelect();
    event.preventDefault();
    event.stopPropagation();
    setPosition(next);
    onMove(placement.id, { ...next, anchor: "background" });
  }

  const positionStyle = placement.anchor === "background" && screenOffset
    ? { left: `${screenOffset.left}px`, top: `${screenOffset.top}px` }
    : { left: `${position.x}%`, top: `${position.y}%` };

  return (
    <div
      ref={nodeRef}
      className={`scene-decoration ${selected ? "selected" : "fixed"}`}
      style={{ ...positionStyle, transform: `translate(-50%,-50%) rotate(${placement.rotation}deg)` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { startRef.current = null; }}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={selected ? `${name}. Arraste para ajustar; use os controles para girar, fixar ou guardar.` : `${name}. Toque para ajustar a posição.`}
    >
      <img src={image} alt="" draggable={false} />
      {selected && <>
        <span className="decor-move-hint">arraste para mover</span>
        <div className="decor-tools" onPointerDown={(event) => event.stopPropagation()}>
          <button className="decor-rotate" type="button" onClick={(event) => { event.stopPropagation(); onMove(placement.id, { rotation: placement.rotation + 15 }); }} aria-label={`Girar ${name}`}><RotateCw size={13} /></button>
          <button className="decor-fix" type="button" onClick={(event) => { event.stopPropagation(); onFix(); }} aria-label={`Fixar ${name}`}><Check size={13} /><span>Fixar</span></button>
          <button className="decor-remove" type="button" onClick={(event) => { event.stopPropagation(); onRemove(placement.id); }} aria-label={`Guardar ${name} de volta na mochila`}><X size={13} /></button>
        </div>
      </>}
    </div>
  );
}

export function SceneGift({ gift, image, now, onCollect }: {
  gift: { id: string; x: number; expiresAt: number };
  image: string;
  now: number;
  onCollect: (id: string) => void;
}) {
  const seconds = Math.max(0, Math.ceil((gift.expiresAt - now) / 1000));
  return <button className={`scene-gift ${seconds <= 15 ? "urgent" : ""}`} type="button" style={{ left: `${gift.x * 100}%` }} onClick={(event) => { event.stopPropagation(); onCollect(gift.id); }} aria-label={`Abrir presente surpresa. Some em ${seconds} segundos`}>
    <img src={image} alt="" /><span>ABRIR</span><small>{seconds}s</small>
  </button>;
}
