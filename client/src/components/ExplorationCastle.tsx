import { homeWalkDirection } from "@/game/petFrameCleanup";
import { drawPortalArch, drawPortalEnergy } from "@/game/explorationPortal";
import { petWalkAtlas, drawWalkFrame } from "@/game/petWalkAtlas";
import { useEffect, useRef, useState } from "react";
import {
  CASTLE_ROOMS,
  castleRoom,
  castleDoors,
  castleRoute,
  stepCastle,
  type CastleProgress,
} from "@/game/explorationCastle";
import type { CombatState } from "@/game/explorationCombat";
import { drawExplorationLegend } from "@/game/explorationLegendView";
import { GAME_ASSETS } from "@/game/assets";
import ExplorationJoystick from "./ExplorationJoystick";
import "./ExplorationCastle.css";
type Props = {
  state: CombatState;
  character: keyof typeof GAME_ASSETS.characters;
  onChange: (value: CastleProgress) => void;
  onBack: () => void;
};
export default function ExplorationCastle({
  state,
  character,
  onChange,
  onBack,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null),
    current = useRef(state.castle!),
    callback = useRef(onChange),
    input = useRef({ x: 0, y: 0 }),
    keys = useRef(new Set<string>()),
    route = useRef<{ x: number; y: number }[]>([]),
    view = useRef({ tile: 1, left: 0, top: 0 });
  callback.current = onChange;
  const [room, setRoom] = useState(state.castle!.room),
    [map, setMap] = useState(false),
    [paused, setPaused] = useState(false),
    [error, setError] = useState(false);
  const stopped = useRef(false);
  stopped.current = map || paused;
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "w",
            "a",
            "s",
            "d",
          ].includes(e.key)
        ) {
          e.preventDefault();
          keys.current.add(e.key);
        }
        if (e.key === "Escape") setPaused(v => !v);
      },
      up = (e: KeyboardEvent) => keys.current.delete(e.key),
      blur = () => {
        keys.current.clear();
        input.current = { x: 0, y: 0 };
        setPaused(true);
      };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    let frame = 0,
      last = 0,
      saved = 0,
      time = 0;
    const floor = new Image(),
      pet = new Image(),
      props = new Image(),
      walls = new Image(),
      walk = new Image(),
      portal = new Image();
    portal.src = "/forest-adventure/river-portal-v1.webp";
    props.src = "/forest-adventure/castle5/props-atlas.webp";
    walls.src = "/forest-adventure/castle5/walls-atlas.webp";
    walk.src = petWalkAtlas(character) ?? "";
    floor.src = "/forest-adventure/castle5/floor-limestone.webp";
    pet.src = GAME_ASSETS.characters[character];
    floor.onerror = () => setError(true);
    const draw = (now: number) => {
      const dt = last ? Math.min(50, now - last) : 0;
      last = now;
      time += dt;
      const held = keys.current;
      let dx =
          Number(held.has("ArrowRight") || held.has("d")) -
            Number(held.has("ArrowLeft") || held.has("a")) || input.current.x,
        dy =
          Number(held.has("ArrowDown") || held.has("s")) -
            Number(held.has("ArrowUp") || held.has("w")) || input.current.y;
      if (dx || dy) route.current = [];
      else if (route.current.length) {
        const target = route.current[0],
          p = current.current.player,
          d = Math.hypot(target.x - p.x, target.y - p.y);
        if (d < 0.06) route.current.shift();
        else {
          dx =
            ((target.x - p.x) / d) *
            Math.min(1, d / Math.max(0.001, dt * 0.0035));
          dy =
            ((target.y - p.y) / d) *
            Math.min(1, d / Math.max(0.001, dt * 0.0035));
        }
      }
      if (!stopped.current) {
        const old = current.current;
        current.current = stepCastle(old, dx, dy, dt);
        if (old.room !== current.current.room) {
          route.current = [];
          setRoom(current.current.room);
          el.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 450 });
          callback.current(current.current);
        }
        if (!current.current.active) {
          callback.current(current.current);
          return;
        }
        if (now - saved > 1200) {
          saved = now;
          callback.current(current.current);
        }
      }
      const rect = el.getBoundingClientRect(),
        w = rect.width,
        h = rect.height,
        dpr = Math.min(2, devicePixelRatio || 1);
      if (
        el.width !== Math.round(w * dpr) ||
        el.height !== Math.round(h * dpr)
      ) {
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#171718";
      ctx.fillRect(0, 0, w, h);
      const tile = Math.min((w - 24) / 10, (h - (w < 480 ? 210 : 110)) / 8),
        left = (w - tile * 10) / 2,
        top = (w < 480 ? 115 : 65) + (h - (w < 480 ? 210 : 110) - tile * 8) / 2;
      view.current = { tile, left, top };
      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, tile * 10, tile * 8);
      ctx.clip();
      if (floor.naturalWidth) {
        ctx.drawImage(floor, left, top, tile * 10, tile * 8);
      } else {
        ctx.fillStyle = "#a69a7b";
        ctx.fillRect(left, top, tile * 10, tile * 8);
      }
      ctx.restore();
      ctx.strokeStyle = "#645942";
      ctx.lineWidth = tile * 0.45;
      ctx.strokeRect(
        left + tile * 0.2,
        top + tile * 0.2,
        tile * 9.6,
        tile * 7.6
      );
      for (const q of [
        ...castleDoors(current.current.room),
        ...(current.current.room === "vestibulo"
          ? [{ x: 5, y: 7.2, target: "exterior" }]
          : []),
      ]) {
        const x = left + q.x * tile,
          y = top + q.y * tile;
        drawPortalEnergy(ctx, x, y, tile * 0.65, time, true, false);
        drawPortalArch(ctx, portal, x, y, tile * 0.65);
      }
      const p = current.current.player,
        x = left + p.x * tile,
        y = top + p.y * tile;
      const s = {
        ...state,
        player: p,
        time,
        walking: !stopped.current && !!(dx || dy),
        walkPhase: time / 440,
        facing: dx || dy ? { x: dx, y: dy } : state.facing,
      };
      const crops = [
        [182, 21, 346, 415],
        [753, 49, 391, 407],
        [131, 439, 480, 415],
        [673, 499, 534, 342],
        [156, 843, 419, 392],
        [727, 874, 456, 353],
      ];
      const entities = [
        ...castleRoom(current.current.room).props.map(q => ({
          y: q.y,
          draw: () => {
            if (!props.naturalWidth) return;
            const r = crops[q.kind],
              dw = tile * (q.kind === 3 ? 2.2 : 1.7),
              dh = (dw * r[3]) / r[2];
            ctx.drawImage(
              props,
              r[0],
              r[1],
              r[2],
              r[3],
              left + q.x * tile - dw / 2,
              top + q.y * tile - dh,
              dw,
              dh
            );
          },
        })),
        {
          y: p.y,
          draw: () => {
            if (drawExplorationLegend(ctx, s, x, y, tile, false)) return;
            if (s.walking && walk.naturalWidth) {
              const direction = homeWalkDirection(dx, -dy);
              ctx.save();
              ctx.translate(x, y);
              if (direction.mirror) ctx.scale(-1, 1);
              drawWalkFrame(
                ctx,
                walk,
                direction.row,
                s.walkPhase,
                -tile * 0.46,
                -tile * 0.82,
                tile * 0.92,
                tile * 0.92
              );
              ctx.restore();
            } else if (pet.naturalWidth)
              ctx.drawImage(
                pet,
                x - tile * 0.38,
                y - tile * 0.72,
                tile * 0.76,
                tile * 0.8
              );
          },
        },
      ];
      entities.sort((a, b) => a.y - b.y).forEach(q => q.draw());
      if (walls.naturalWidth)
        for (const q of [
          { x: 0.6, y: 1.1 },
          { x: 9.4, y: 1.1 },
        ]) {
          const dh = tile * 1.5,
            dw = (dh * 364) / 667;
          ctx.drawImage(
            walls,
            1339,
            116,
            364,
            667,
            left + q.x * tile - dw / 2,
            top + q.y * tile - dh,
            dw,
            dh
          );
        }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [character]);
  return (
    <section
      className="castle-play"
      aria-label="Capítulo 5 Interior do Castelo"
    >
      <header>
        <div>
          <small>CAPÍTULO 5 · INTERIOR DO CASTELO</small>
          <h1>{castleRoom(room).name}</h1>
        </div>
        <button onClick={() => setMap(v => !v)}>
          {map ? "Fechar mapa" : "Mapa do castelo"}
        </button>
        <button onClick={() => setPaused(v => !v)}>
          {paused ? "Continuar" : "Pausar"}
        </button>
      </header>
      <canvas
        ref={canvas}
        onPointerUp={e => {
          if (stopped.current) return;
          const r = e.currentTarget.getBoundingClientRect(),
            v = view.current;
          route.current = castleRoute(
            current.current.player,
            {
              x: (e.clientX - r.left - v.left) / v.tile,
              y: (e.clientY - r.top - v.top) / v.tile,
            },
            current.current.room
          );
        }}
        aria-label="Sala fechada do castelo. Use o direcional ou as setas para atravessar os portais."
      />
      <p className="castle-hint">
        Portais livres · Caminhe até uma passagem para mudar de cômodo
      </p>
      <ExplorationJoystick
        disabled={map || paused}
        onChange={v => (input.current = v)}
      />
      {map && (
        <div className="castle-overlay">
          <h2>Mapa completo do castelo</h2>
          <p>Todos os portais estão liberados para teste.</p>
          <div className="castle-map">
            {CASTLE_ROOMS.map(r => (
              <div
                key={r.id}
                style={{ gridColumn: r.grid[0] + 1, gridRow: r.grid[1] + 1 }}
                className={`${r.id === room ? "is-current" : ""} ${r.grid[0] < 2 ? "link-right" : ""} ${r.grid[1] === 0 ? "link-down" : ""}`}
              >
                <strong>{r.name}</strong>
                {r.id === room && (
                  <i
                    className="castle-position"
                    style={{
                      left: `${current.current.player.x * 9}%`,
                      top: `${current.current.player.y * 10}%`,
                    }}
                  />
                )}
                <span>
                  {r.id === room
                    ? "● Você está aqui"
                    : current.current.visited.includes(r.id)
                      ? "Visitado"
                      : "A explorar"}
                </span>
              </div>
            ))}
          </div>
          <p>Saída para o Capítulo 4 pelo Vestíbulo.</p>
          <button onClick={() => setMap(false)}>Voltar ao personagem</button>
        </div>
      )}
      {paused && !map && (
        <div className="castle-overlay">
          <h2>Exploração pausada</h2>
          <button onClick={() => setPaused(false)}>Continuar</button>
          <button
            onClick={() => {
              callback.current(current.current);
              onBack();
            }}
          >
            Voltar aos capítulos
          </button>
        </div>
      )}
      {error && (
        <p role="alert">
          Não foi possível carregar o piso. Volte aos capítulos para tentar
          novamente.
        </p>
      )}
    </section>
  );
}
