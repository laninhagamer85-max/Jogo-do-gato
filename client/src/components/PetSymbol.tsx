import { useId } from "react";
import { getPetSymbol } from "@/game/petIconAtlas";
import "./PublishedParity.css";

export const petSymbolLabel = (symbol: string) => getPetSymbol(symbol).label;

export default function PetSymbol({ symbol, label }: { symbol: string; label?: string }) {
  const icon = getPetSymbol(symbol);
  const clipId = `pet-icon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return <span className="pet-symbol" data-symbol={symbol} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <svg viewBox={`${icon.x} ${icon.y} ${icon.width} ${icon.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <defs><clipPath id={clipId}><path d={icon.clip} /></clipPath></defs>
      <image href="/ui/pet-icons-atlas-v1.png" width={1254} height={1254} clipPath={`url(#${clipId})`} />
    </svg>
  </span>;
}
