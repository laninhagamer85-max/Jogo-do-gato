import { useEffect, useRef, useState, type PointerEvent } from "react";
import { RotateCw, X } from "lucide-react";
import { DECORATIONS, type DecorationPlacement } from "@/game/PetGame";

export function SceneDecoration({ placement, image, editable, onMove, onRemove }: {
  placement: DecorationPlacement;
  image: string;
  editable: boolean;
  onMove: (id: string, patch: Partial<Pick<DecorationPlacement, "x" | "y" | "rotation">>) => void;
  onRemove: (id: string) => void;
}) {
  const [position, setPosition] = useState({ x: placement.x, y: placement.y });
  const startRef = useRef<{ x: number; y: number; px: number; py: number; width: number; height: number } | null>(null);
  const name = DECORATIONS.find((item) => item.id === placement.itemId)?.name ?? "Decoração";
  useEffect(() => setPosition({ x: placement.x, y: placement.y }), [placement.x, placement.y]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!editable) return;
    event.stopPropagation();
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    startRef.current = { x: position.x, y: position.y, px: event.clientX, py: event.clientY, width: bounds.width, height: bounds.height };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* synthetic pointer events and older browsers may not support capture */ }
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = startRef.current;
    if (!editable || !start || !(event.buttons || event.pointerType === "touch")) return;
    event.stopPropagation();
    setPosition({ x: Math.max(5, Math.min(95, start.x + ((event.clientX - start.px) / start.width) * 100)), y: Math.max(12, Math.min(88, start.y + ((event.clientY - start.py) / start.height) * 100)) });
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = startRef.current;
    if (!start) return;
    event.stopPropagation();
    startRef.current = null;
    const dx = Math.abs(event.clientX - start.px);
    const dy = Math.abs(event.clientY - start.py);
    if (dx + dy > 4) onMove(placement.id, { ...position });
  }

  return (
    <div className={`scene-decoration ${editable ? "editable" : ""}`} style={{ left: `${position.x}%`, top: `${position.y}%`, transform: `translate(-50%,-50%) rotate(${placement.rotation}deg)` }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { startRef.current = null; }} role="img" aria-label={name}>
      <img src={image} alt="" draggable={false} />
      {editable && <><span className="decor-move-hint">↕ mover</span><button className="decor-rotate" type="button" onClick={(event) => { event.stopPropagation(); onMove(placement.id, { rotation: placement.rotation + 15 }); }} aria-label={`Girar ${name}`}><RotateCw size={12} /></button><button className="decor-remove" type="button" onClick={(event) => { event.stopPropagation(); onRemove(placement.id); }} aria-label={`Guardar ${name} de volta na mochila`}><X size={12} /></button></>}
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
