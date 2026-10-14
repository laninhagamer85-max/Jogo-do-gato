import { PET_WALK_PILOT, drawWalkFrame } from "@/game/petWalkAtlas";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, CircleHelp, Compass, DoorOpen, Home, KeyRound, Pause, Play, RotateCcw, Trees, Volume2, VolumeX } from "lucide-react";
import { GAME_ASSETS } from "@/game/assets";
import { playPlatformSfx } from "@/game/platformerAudio";
import {
  createForestGameState, FOREST_CHAPTERS, FOREST_MAP, getForestRoom, stepForestGame,
  type ForestDirection, type ForestGameState, type ForestInput,
} from "@/game/forestPuzzle";
import { normalizeForestProgress } from "@/game/forestProgress";
import type { PetProfile } from "@/game/PetGame";
import "./ForestPuzzleAdventure.css";
import ForestSessionConfirm, { type ForestExit } from "./ForestSessionConfirm";
import { ForestControls } from "@/game/forestControls";
import { forestView, forestActionLabel } from "@/game/forestView";

type Overlay = "pause" | "room" | "chapter" | null;
type Held = Record<ForestDirection, boolean>;
type Props = {
  profile: PetProfile | null;
  savedProgress: Record<string, unknown>;
  soundOn: boolean;
  onToggleSound: () => void;
  onCompleteChapter: (chapter: number, actions: number) => void;
  onBack: () => void;
  onGoToHouse: () => void;
};
const EMPTY_HELD: Held = { up: false, down: false, left: false, right: false };
const CHAPTER_THEMES: Record<number, { background: string; soil: string; water: string; wall: string; accent: string }> = {
  1: { background: "#416a3c", soil: "#916744", water: "#6aab78", wall: "#24553b", accent: "#e7bf59" },
  2: { background: "#356d73", soil: "#80684a", water: "#44b7c8", wall: "#286551", accent: "#e8d58a" },
  3: { background: "#353d6e", soil: "#615344", water: "#5584bd", wall: "#32395d", accent: "#efd279" },
};

function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size + 0.5, size + 0.5);
}
function drawRoom(ctx: CanvasRenderingContext2D, width: number, height: number, state: ForestGameState, pet: HTMLImageElement, backgrounds: Map<number, HTMLImageElement>, now: number, overview: boolean, focus?: { x: number; y: number }, walkAtlas?: HTMLImageElement, controlsHeight = 0) {
  const spec = getForestRoom(state.chapter, state.room);
  const theme = CHAPTER_THEMES[state.chapter] ?? CHAPTER_THEMES[1];
  const { tile, boardWidth, boardHeight, left, top } = forestView(width, height, state.player, overview, focus, { top: 44, bottom: controlsHeight + 8 });
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);
  const background = backgrounds.get(state.chapter);
  if (background?.complete && background.naturalWidth > 0) {
    const scale = Math.max(boardWidth / background.naturalWidth, boardHeight / background.naturalHeight);
    const drawnWidth = background.naturalWidth * scale;
    const drawnHeight = background.naturalHeight * scale;
    ctx.globalAlpha = 0.48;
    ctx.drawImage(background, left + (boardWidth - drawnWidth) / 2, top + (boardHeight - drawnHeight) / 2, drawnWidth, drawnHeight);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = "rgba(20,40,29,.22)";
  ctx.fillRect(left, top, boardWidth, boardHeight);

  for (let y = 0; y < FOREST_MAP.rows; y++) for (let x = 0; x < FOREST_MAP.columns; x++) {
    const key = `${x},${y}`;
    const isWater = spec.water.some((item) => `${item.x},${item.y}` === key) && !spec.bridgeSockets.some((socket) => `${socket.x},${socket.y}` === key && state.placedBridges.includes(socket.id));
    const isWall = spec.walls.some((item) => `${item.x},${item.y}` === key);
    const px = left + x * tile; const py = top + y * tile;
    if (isWater) {
      const wave = Math.sin(now / 350 + x * 0.8 + y) * tile * 0.06;
      ctx.fillStyle = theme.water; ctx.fillRect(px, py, tile + 0.5, tile + 0.5);
      ctx.strokeStyle = "rgba(220,250,246,.32)"; ctx.lineWidth = Math.max(1, tile * 0.035);
      ctx.beginPath(); ctx.moveTo(px + tile * 0.12, py + tile * (0.38 + wave / tile)); ctx.quadraticCurveTo(px + tile * 0.45, py + tile * 0.24, px + tile * 0.82, py + tile * 0.42); ctx.stroke();
      continue;
    }
    if (isWall) {
      ctx.fillStyle = theme.wall; ctx.fillRect(px, py, tile + 0.5, tile + 0.5);
      ctx.fillStyle = "rgba(170,220,110,.40)";
      for (const [cx, cy, radius] of [[0.22, 0.48, 0.3], [0.52, 0.31, 0.35], [0.78, 0.5, 0.27]] as const) {
        ctx.beginPath(); ctx.arc(px + tile * cx, py + tile * cy, tile * radius, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "rgba(10,42,29,.28)"; ctx.fillRect(px, py + tile * 0.82, tile, tile * 0.18);
      continue;
    }
    ctx.fillStyle = (x + y) % 2 ? "rgba(220,248,176,.09)" : "rgba(15,55,37,.07)";
    ctx.fillRect(px, py, tile, tile);
    ctx.strokeStyle = "rgba(255,246,196,.08)"; ctx.lineWidth = 1;
    ctx.strokeRect(px + tile * 0.12, py + tile * 0.12, tile * 0.76, tile * 0.76);
  }

  for (const plate of spec.plates) {
    const px = left + (plate.x + 0.5) * tile; const py = top + (plate.y + 0.5) * tile;
    const pressed = state.openGates.includes(plate.gateId);
    ctx.fillStyle = pressed ? "#efd273" : "#715138";
    ctx.beginPath(); ctx.ellipse(px, py + tile * 0.2, tile * 0.31, tile * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = pressed ? "#fff0a3" : "#c5a76b"; ctx.lineWidth = Math.max(2, tile * 0.045);
    ctx.beginPath(); ctx.ellipse(px, py + tile * 0.2, tile * 0.23, tile * 0.09, 0, 0, Math.PI * 2); ctx.stroke();
  }

  for (const gate of spec.gates) {
    const px = left + gate.x * tile; const py = top + gate.y * tile;
    if (state.openGates.includes(gate.id)) {
      ctx.strokeStyle = "rgba(255,226,137,.92)"; ctx.lineWidth = Math.max(2, tile * 0.055);
      ctx.beginPath(); ctx.arc(px + tile / 2, py + tile * 0.62, tile * 0.34, Math.PI, Math.PI * 2); ctx.stroke();
    } else {
      ctx.fillStyle = "#80502f"; ctx.fillRect(px + tile * 0.1, py + tile * 0.12, tile * 0.8, tile * 0.76);
      ctx.strokeStyle = "#d5a65d"; ctx.lineWidth = Math.max(2, tile * 0.055);
      for (let index = 1; index <= 3; index++) { ctx.beginPath(); ctx.moveTo(px + tile * index * 0.22, py + tile * 0.16); ctx.lineTo(px + tile * index * 0.22, py + tile * 0.86); ctx.stroke(); }
    }
  }

  for (const socket of spec.bridgeSockets) if (state.placedBridges.includes(socket.id)) {
    const px = left + socket.x * tile; const py = top + socket.y * tile;
    ctx.fillStyle = "#8c5a33"; ctx.fillRect(px + tile * 0.08, py + tile * 0.18, tile * 0.84, tile * 0.64);
    ctx.strokeStyle = "#e0b66f"; ctx.lineWidth = Math.max(1.5, tile * 0.035);
    for (const offset of [0.28, 0.5, 0.72]) { ctx.beginPath(); ctx.moveTo(px + tile * offset, py + tile * 0.2); ctx.lineTo(px + tile * offset, py + tile * 0.8); ctx.stroke(); }
  }

  const drawLog = (x: number, y: number) => {
    const px = left + (x + 0.5) * tile; const py = top + (y + 0.54) * tile;
    ctx.fillStyle = "rgba(20,34,20,.3)"; ctx.beginPath(); ctx.ellipse(px, py + tile * 0.16, tile * 0.38, tile * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8d5732"; ctx.beginPath(); ctx.roundRect(px - tile * 0.38, py - tile * 0.17, tile * 0.76, tile * 0.34, tile * 0.14); ctx.fill();
    ctx.strokeStyle = "#d4a064"; ctx.lineWidth = Math.max(1.5, tile * 0.035);
    ctx.beginPath(); ctx.ellipse(px - tile * 0.34, py, tile * 0.07, tile * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - tile * 0.1, py - tile * 0.14); ctx.lineTo(px - tile * 0.1, py + tile * 0.14); ctx.stroke();
  };
  for (const key of spec.keys) if (!state.collectedKeys.includes(key.id)) {
    const px = left + (key.x + 0.5) * tile; const py = top + (key.y + 0.5) * tile + Math.sin(now / 280) * tile * 0.035;
    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.32); ctx.strokeStyle = "#ffdf65"; ctx.lineWidth = Math.max(2, tile * 0.065);
    ctx.beginPath(); ctx.arc(-tile * 0.07, 0, tile * 0.13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tile * 0.06, 0); ctx.lineTo(tile * 0.29, 0); ctx.lineTo(tile * 0.29, tile * 0.1); ctx.moveTo(tile * 0.2, 0); ctx.lineTo(tile * 0.2, tile * 0.08); ctx.stroke(); ctx.restore();
  }

  for (const object of state.objects) {
    if (object.id === state.carriedObjectId) continue;
    const px = left + (object.x + 0.5) * tile; const py = top + (object.y + 0.5) * tile;
    if (object.kind === "log") drawLog(object.x, object.y);
    else if (object.kind === "plank") {
      ctx.fillStyle = "#9d6938"; ctx.beginPath(); ctx.roundRect(px - tile * 0.34, py - tile * 0.15, tile * 0.68, tile * 0.3, tile * 0.07); ctx.fill();
      ctx.strokeStyle = "#e7bf78"; ctx.lineWidth = Math.max(1, tile * 0.03); ctx.strokeRect(px - tile * 0.28, py - tile * 0.1, tile * 0.56, tile * 0.2);
    } else if (object.kind === "stone") {
      ctx.fillStyle = "#9aa39b"; ctx.beginPath(); ctx.ellipse(px, py, tile * 0.24, tile * 0.19, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.beginPath(); ctx.arc(px - tile * 0.07, py - tile * 0.05, tile * 0.04, 0, Math.PI * 2); ctx.fill();
    } else if (object.kind === "bell") {
      ctx.fillStyle = "#d5a94a"; ctx.beginPath(); ctx.arc(px, py - tile * 0.03, tile * 0.18, Math.PI, 0); ctx.lineTo(px + tile * 0.2, py + tile * 0.13); ctx.lineTo(px - tile * 0.2, py + tile * 0.13); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff0a2"; ctx.beginPath(); ctx.arc(px, py - tile * 0.2, tile * 0.07, 0, Math.PI * 2); ctx.fill();
    }
  }

  const exitX = left + (spec.exit.x + 0.5) * tile; const exitY = top + (spec.exit.y + 0.5) * tile;
  const glow = ctx.createRadialGradient(exitX, exitY, tile * 0.03, exitX, exitY, tile * 0.49);
  glow.addColorStop(0, "rgba(255,240,173,.78)"); glow.addColorStop(1, "rgba(255,221,99,0)");
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(exitX, exitY, tile * 0.49, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = theme.accent; ctx.lineWidth = Math.max(3, tile * 0.075); ctx.beginPath(); ctx.arc(exitX, exitY + tile * 0.08, tile * 0.27, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = "rgba(255,246,194,.38)"; ctx.fillRect(exitX - tile * 0.24, exitY + tile * 0.08, tile * 0.48, tile * 0.27);

  for (const guard of state.guards) {
    const gx = left + guard.x * tile; const gy = top + guard.y * tile;
    ctx.fillStyle = "rgba(12,23,28,.28)"; ctx.beginPath(); ctx.ellipse(gx, gy + tile * 0.22, tile * 0.25, tile * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = guard.lured ? "#b8ca76" : "#b7a776"; ctx.beginPath(); ctx.ellipse(gx, gy, tile * 0.23, tile * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff9e2"; ctx.beginPath(); ctx.arc(gx - tile * 0.075, gy - tile * 0.02, tile * 0.055, 0, Math.PI * 2); ctx.arc(gx + tile * 0.075, gy - tile * 0.02, tile * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#233a36"; ctx.beginPath(); ctx.arc(gx - tile * 0.075, gy - tile * 0.01, tile * 0.025, 0, Math.PI * 2); ctx.arc(gx + tile * 0.075, gy - tile * 0.01, tile * 0.025, 0, Math.PI * 2); ctx.fill();
    if (guard.lured) { ctx.fillStyle = "#fff1a4"; ctx.font = `${Math.max(10, tile * 0.35)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("♪", gx, gy - tile * 0.3); }
  }

  const playerX = left + state.player.x * tile;
  const playerY = top + state.player.y * tile;
  const motionEnergy = state.walking ? 1 : 0;
  const movingBob = Math.sin(state.walkPhase * Math.PI * 2);
  const bob = movingBob * tile * 0.105 * motionEnergy;
  const sway = Math.cos(state.walkPhase * Math.PI * 2) * tile * 0.035 * motionEnergy;
  const gaitSquash = Math.abs(movingBob) * motionEnergy;
  ctx.fillStyle = "rgba(15,32,26,.35)"; ctx.beginPath(); ctx.ellipse(playerX + sway * 0.3, playerY + tile * 0.28, tile * (0.27 + gaitSquash * 0.025), tile * 0.11, 0, 0, Math.PI * 2); ctx.fill();
  if (state.walking && walkAtlas?.complete && walkAtlas.naturalWidth > 0) {
    ctx.save(); ctx.translate(playerX, playerY);
    if (state.facing === 'left') ctx.scale(-1, 1);
    const row = state.facing === 'up' ? 2 : state.facing === 'down' ? 1 : 3;
    drawWalkFrame(ctx, walkAtlas, row, state.walkPhase, -tile * .43, -tile * .5, tile * .86, tile * .86);
    ctx.restore();
  } else if (pet.complete && pet.naturalWidth > 0) {
    ctx.save(); ctx.translate(playerX + sway, playerY - bob);
    const facingScale = state.facing === "left" ? -1 : 1;
    const bobScale = 1 + gaitSquash * 0.07;
    const facingLean = state.facing === "left" ? -0.06 : state.facing === "right" ? 0.06 : 0;
    ctx.rotate(facingLean + movingBob * motionEnergy * 0.045);
    ctx.scale(facingScale * bobScale, 1 / bobScale);
    ctx.shadowColor = "rgba(8,23,20,.35)"; ctx.shadowBlur = tile * 0.12; ctx.shadowOffsetY = tile * 0.04;
    ctx.drawImage(pet, -tile * 0.33, -tile * 0.39, tile * 0.66, tile * 0.76);
    ctx.restore();
  } else {
    ctx.fillStyle = "#fff5df"; ctx.beginPath(); ctx.arc(playerX, top + state.player.y * tile, tile * 0.27, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#263a32"; ctx.font = `${tile * 0.34}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("🐈", playerX, top + state.player.y * tile + tile * 0.12);
  }
  if (state.carriedObjectId) {
    const item = state.objects.find((object) => object.id === state.carriedObjectId);
    ctx.fillStyle = item?.kind === "plank" ? "#c58a45" : "#925b35";
    ctx.beginPath(); ctx.roundRect(playerX - tile * 0.22, top + state.player.y * tile - tile * 0.49 - bob, tile * 0.44, tile * 0.11, tile * 0.05); ctx.fill();
  }
}

export default function ForestPuzzleAdventure({ profile, savedProgress, soundOn, onToggleSound, onCompleteChapter, onBack, onGoToHouse }: Props) {
  const characterId = profile?.characterId ?? "menino-prata";
  const petName = profile?.name ?? "Seu pet";
  const progressRead = useMemo(() => normalizeForestProgress(savedProgress), [savedProgress]);
  const supported = progressRead.supported;
  const progress = supported ? progressRead.progress : null;
  const unlockedChapter = progress?.unlockedChapter ?? 0;
  const [selectedChapter, setSelectedChapter] = useState(Math.max(1, unlockedChapter));
  const [game, setGame] = useState<ForestGameState | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [summary, setSummary] = useState<ForestGameState | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [uiMessage, setUiMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsElementRef = useRef<HTMLElement>(null);
  const stateRef = useRef<ForestGameState | null>(null);
  const heldRef = useRef<Held>({ ...EMPTY_HELD });
  const pendingActionRef = useRef(false);
  const pendingUseRef = useRef(false);
  const overlayRef = useRef<Overlay>(null);
  const lastFrameRef = useRef(0);
  const lastUiRef = useRef(0);
  const completeReportedRef = useRef(false);
  const onCompleteRef = useRef(onCompleteChapter);
  const soundOnRef = useRef(soundOn);
  const animationRef = useRef(0);
  const gameRef = useRef<ForestGameState | null>(null);
  const [overview, setOverview] = useState(false);
  const overviewRef = useRef(false);
  const cameraFocusRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const followPet = () => {
    cameraFocusRef.current = null; dragRef.current = null;
    overviewRef.current = false; setOverview(false); setInspecting(false);
  };
  const [exitAction, setExitAction] = useState<ForestExit | null>(null);
  const controlsRef = useRef(new ForestControls());
  const tapTimersRef = useRef(new Set<number>());
  const pauseButtonRef = useRef<HTMLButtonElement>(null);
  const overlayElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => { onCompleteRef.current = onCompleteChapter; }, [onCompleteChapter]);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);
  useEffect(() => {
    if (supported) setSelectedChapter((current) => Math.min(Math.max(1, current), progress?.unlockedChapter ?? 1));
  }, [supported, progress?.unlockedChapter]);

  const openGame = useCallback((chapter: number, room: 1 | 2 = 1) => {
    cameraFocusRef.current = null; dragRef.current = null; overviewRef.current = false;
    setOverview(false); setInspecting(false);
    const initial = createForestGameState(chapter, room);
    stateRef.current = initial; gameRef.current = initial; setGame(initial); setSummary(null);
    heldRef.current = { ...EMPTY_HELD }; controlsRef.current.clear();
    pendingActionRef.current = false; pendingUseRef.current = false;
    completeReportedRef.current = false; overlayRef.current = null; setOverlay(null); setUiMessage(initial.message);
  }, []);
  const setOverlaySafe = useCallback((value: Overlay) => { overlayRef.current = value; setOverlay(value); }, []);
  const stopHeld = useCallback(() => {
    dragRef.current = null;
    heldRef.current = { ...EMPTY_HELD }; controlsRef.current.clear();
    pendingActionRef.current = false; pendingUseRef.current = false; lastFrameRef.current = 0;
    for (const timer of tapTimersRef.current) window.clearTimeout(timer);
    tapTimersRef.current.clear();
  }, []);

  useEffect(() => {
    if (!overlay) return;
    stopHeld();
    const panel = overlayElementRef.current;
    const first = panel?.querySelector<HTMLButtonElement>("button");
    first?.focus();
    return () => { pauseButtonRef.current?.focus(); };
  }, [overlay, stopHeld]);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d");
    const walkAtlas = new Image();
    if (characterId === 'menino-prata') walkAtlas.src = PET_WALK_PILOT;
    if (!canvas || !ctx) return;
    const pet = new Image(); pet.src = GAME_ASSETS.characters[characterId];
    const backgrounds = new Map<number, HTMLImageElement>();
    for (const chapter of FOREST_CHAPTERS) { const image = new Image(); image.src = chapter.image; backgrounds.set(chapter.id, image); }
    let width = 1; let height = 1; let dpr = 1; let controlsHeight = 0;
    const resize = () => {
      controlsHeight = controlsElementRef.current?.getBoundingClientRect().height ?? 0;
      const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      dpr = Math.min(2, window.devicePixelRatio || 1); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now: number) => {
      const current = gameRef.current;
      if (current) drawRoom(ctx, width, height, current, pet, backgrounds, now, overviewRef.current, cameraFocusRef.current ?? undefined, walkAtlas, controlsHeight);
      else { ctx.clearRect(0, 0, width, height); }
    };
    const loop = (now: number) => {
      const delta = lastFrameRef.current ? Math.min(0.05, Math.max(0, (now - lastFrameRef.current) / 1000)) : 0;
      lastFrameRef.current = now;
      const current = stateRef.current;
      if (current && !overlayRef.current && !overviewRef.current && !cameraFocusRef.current && !current.chapterComplete) {
        const input: ForestInput = {
          ...heldRef.current,
          actionPressed: pendingActionRef.current,
          usePressed: pendingUseRef.current,
        };
        pendingActionRef.current = false; pendingUseRef.current = false;
        const result = stepForestGame(current, input, delta);
        stateRef.current = result.state; gameRef.current = result.state;
        if (soundOnRef.current) {
          if (result.events.includes("bump")) playPlatformSfx("bump");
          if (result.events.includes("key-collected")) playPlatformSfx("forest-key");
          if (result.events.includes("gate-opened")) playPlatformSfx("forest-gate");
          if (result.events.includes("bridge-placed")) playPlatformSfx("forest-bridge");
          if (result.events.includes("room-cleared")) playPlatformSfx("forest-room");
          if (result.events.includes("chapter-cleared")) playPlatformSfx("forest-chapter");
        }
        if (result.events.includes("room-cleared")) { setSummary(result.state); setOverlaySafe("room"); }
        if (result.events.includes("chapter-cleared")) {
          setSummary(result.state); setOverlaySafe("chapter");
          if (!completeReportedRef.current) { completeReportedRef.current = true; onCompleteRef.current(result.state.chapter, result.state.actions); }
        }
        if (result.events.includes("bump")) setUiMessage(result.state.message);
        if (result.events.includes("key-collected") || result.events.includes("gate-opened") || result.events.includes("bridge-placed")) setUiMessage(result.state.message);
        if (now - lastUiRef.current > 140) { lastUiRef.current = now; setGame(result.state); setUiMessage(result.state.message); }
      }
      draw(now); animationRef.current = window.requestAnimationFrame(loop);
    };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resize(); observer?.observe(canvas); if (controlsElementRef.current) observer?.observe(controlsElementRef.current); window.addEventListener("resize", resize);
    animationRef.current = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(animationRef.current); observer?.disconnect(); window.removeEventListener("resize", resize);
      pet.onload = null; backgrounds.forEach((image) => { image.onload = null; });
    };
  }, [characterId, openGame, setOverlaySafe, Boolean(game)]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!stateRef.current) return;
      if (overlayRef.current) {
        if (event.key === "Escape" && overlayRef.current === "pause" && !exitAction) { event.preventDefault(); setOverlaySafe(null); }
        return;
      }
      if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) followPet();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " ", "e", "f", "q", "escape", "p"].includes(key)) event.preventDefault();
      if (["arrowup", "w"].includes(key)) { controlsRef.current.keyDown(key, "up"); syncHeld(); }
      else if (["arrowdown", "s"].includes(key)) { controlsRef.current.keyDown(key, "down"); syncHeld(); }
      else if (["arrowleft", "a"].includes(key)) { controlsRef.current.keyDown(key, "left"); syncHeld(); }
      else if (["arrowright", "d"].includes(key)) { controlsRef.current.keyDown(key, "right"); syncHeld(); }
      else if (!event.repeat && ["e", " "].includes(key)) triggerAction(false);
      else if (!event.repeat && ["f", "q"].includes(key)) triggerAction(true);
      else if (!event.repeat && ["escape", "p"].includes(key) && stateRef.current) {
        setOverlaySafe(overlayRef.current === "pause" ? null : "pause"); stopHeld();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "w"].includes(key)) { controlsRef.current.keyUp(key); syncHeld(); }
      else if (["arrowdown", "s"].includes(key)) { controlsRef.current.keyUp(key); syncHeld(); }
      else if (["arrowleft", "a"].includes(key)) { controlsRef.current.keyUp(key); syncHeld(); }
      else if (["arrowright", "d"].includes(key)) { controlsRef.current.keyUp(key); syncHeld(); }
    };
    const onVisibility = () => { if (document.hidden && stateRef.current) { stopHeld(); setOverlaySafe("pause"); } };
    const onBlur = () => stopHeld();
    window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur); document.addEventListener("visibilitychange", onVisibility);
    return () => { stopHeld(); window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("blur", onBlur); document.removeEventListener("visibilitychange", onVisibility); };
  }, [setOverlaySafe, stopHeld, exitAction]);

  function syncHeld() {
    heldRef.current = controlsRef.current.snapshot();
  }
  const onDirectionPointerDown = (direction: ForestDirection) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (overlayRef.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    followPet();
    controlsRef.current.pointerDown(event.pointerId, direction); syncHeld();
  };
  const releasePointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    controlsRef.current.pointerUp(event.pointerId); syncHeld();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const accessibleTap = (direction: ForestDirection) => (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0 || overlayRef.current) return;
    followPet();
    const key = `accessible-tap-${performance.now()}`;
    controlsRef.current.keyDown(key, direction); syncHeld();
    const timer = window.setTimeout(() => { controlsRef.current.keyUp(key); syncHeld(); tapTimersRef.current.delete(timer); }, 180);
    tapTimersRef.current.add(timer);
  };
  const triggerAction = (use: boolean) => {
    if (overlayRef.current || !stateRef.current || cameraFocusRef.current || overviewRef.current) return;
    if (use) pendingUseRef.current = true; else pendingActionRef.current = true;
  };
  const pause = () => { stopHeld(); setOverlaySafe(overlayRef.current === "pause" ? null : "pause"); };
  const returnToMap = () => { stateRef.current = null; gameRef.current = null; setGame(null); setSummary(null); setOverlaySafe(null); stopHeld(); };
  const requestExit = (action: ForestExit) => { stopHeld(); setOverlaySafe("pause"); setExitAction(action); };
  const cancelExit = () => { setExitAction(null); setOverlaySafe(null); stopHeld(); };
  const confirmExit = () => {
    const action = exitAction; setExitAction(null); stopHeld();
    if (action === "restart" && stateRef.current) openGame(stateRef.current.chapter, stateRef.current.room);
    else { returnToMap(); if (action === "house") onGoToHouse(); if (action === "adventure") onBack(); }
  };
  const beginSelected = () => { if (supported && selectedChapter <= unlockedChapter) openGame(selectedChapter); };
  const trapOverlayFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
    const first = buttons[0]; const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const petImage = GAME_ASSETS.characters[characterId];
  const currentSpec = game ? getForestRoom(game.chapter, game.room) : null;
  const qaTelemetryEnabled = import.meta.env.DEV && typeof window !== "undefined" && ["/qa-review.html", "/qa-adventure.html"].includes(window.location.pathname);
  const qaTelemetryAttributes = qaTelemetryEnabled ? {
    "data-qa-player-x": game?.player.x.toFixed(2),
    "data-qa-player-y": game?.player.y.toFixed(2),
    "data-qa-bumps": game?.bumps,
    "data-qa-keys": game?.collectedKeys.length,
    "data-qa-bridges": game?.placedBridges.join(","),
  } : {};

  return <div className={`forest-adventure ${game ? "is-playing" : ""}`} role="application" aria-label="Bosque dos Caminhos, modo de exploração">
    <header className="forest-adventure-topbar">
      <div className="forest-adventure-brand"><span><Trees size={21} /></span><div><strong>Bosque dos Caminhos</strong><small>EXPLORAÇÃO E QUEBRA-CABEÇAS</small></div></div>
      <div className="forest-adventure-top-actions">
        <button type="button" onClick={onToggleSound} aria-label={soundOn ? "Silenciar efeitos" : "Ativar efeitos"} aria-pressed={soundOn} title={soundOn ? "Silenciar efeitos" : "Ativar efeitos"}>{soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
        {!game && <><button type="button" onClick={onBack}><ArrowLeft size={16} /> Aventura</button>
        <button type="button" onClick={onGoToHouse}><Home size={16} /> Minha Casa</button></>}
      </div>
    </header>
    {!game ? <main className="forest-adventure-map">
      <section className="forest-adventure-intro"><div><span className="forest-adventure-eyebrow"><Compass size={15} /> UMA NOVA TRILHA</span><h1>Explore com seu pet</h1><p>Procure chaves, mova objetos e encontre caminhos. Os guardiões são gentis: não há combate, vidas ou cronômetro.</p></div>
        <div className="forest-adventure-pet-chip"><img src={petImage} alt="" /><span><small>AVENTUREIRO</small><strong>{petName}</strong></span></div>
      </section>
      {!supported && <div className="forest-adventure-version-note" role="status">Este perfil tem progresso de uma versão mais nova. Atualize o jogo para continuar; nada será sobrescrito.</div>}
      <section className="forest-chapter-grid" aria-label="Seleção de capítulos">
        {FOREST_CHAPTERS.map((chapter) => {
          const isLocked = !supported || chapter.id > unlockedChapter;
          const isComplete = Boolean(progress?.completedChapters.includes(chapter.id));
          return <button key={chapter.id} className={`forest-chapter-card ${selectedChapter === chapter.id ? "is-selected" : ""} ${isLocked ? "is-locked" : ""}`} type="button" disabled={isLocked} onClick={() => setSelectedChapter(chapter.id)} aria-pressed={selectedChapter === chapter.id}>
            <span className="forest-chapter-art"><img src={chapter.image} alt="" loading="lazy" />{isLocked && <span className="forest-chapter-lock">🔒</span>}<span className="forest-chapter-number">CAPÍTULO {chapter.id}</span></span>
            <span className="forest-chapter-copy"><strong>{chapter.name}</strong><small>{chapter.subtitle}</small><span className={isComplete ? "is-complete" : isLocked ? "is-locked" : "is-open"}>{isComplete ? <><Check size={13} /> Concluído</> : isLocked ? "Conclua o capítulo anterior" : "Disponível · 2 salas"}</span></span>
          </button>;
        })}
      </section>
      <div className="forest-map-actions"><button className="forest-primary" type="button" onClick={beginSelected} disabled={!supported || selectedChapter > unlockedChapter}><Play size={17} fill="currentColor" /> Entrar na trilha</button><div className="forest-save-note"><KeyRound size={15} /> Progresso próprio por capítulo; esta trilha não altera a Aventura lateral, moedas ou itens.</div></div>
    </main> : <main className="forest-adventure-game">
      <section className="forest-game-heading"><div><span className="forest-adventure-eyebrow"><Compass size={15} /> CAPÍTULO {game.chapter} · SALA {game.room} DE 2</span><h1>{currentSpec?.title}</h1><p>{currentSpec?.objective}</p></div>
        <div className="forest-game-metrics"><span className="forest-key-counter" aria-label={`${game.collectedKeys.length} chaves`}><KeyRound size={18} />{game.collectedKeys.length}</span><button type="button" aria-pressed={overview || inspecting} onClick={() => { stopHeld(); if (overviewRef.current || cameraFocusRef.current) followPet(); else { overviewRef.current = true; setOverview(true); } }} aria-label={overview || inspecting ? "Voltar ao pet" : "Ver sala inteira"}>{overview || inspecting ? "Voltar ao pet" : "Ver sala"}</button><span><strong>{game.steps}</strong><small>passos</small></span><span><strong>{game.actions}</strong><small>ações</small></span><button ref={pauseButtonRef} type="button" onClick={pause} aria-label={overlay === "pause" ? "Retomar" : "Pausar"}>{overlay === "pause" ? <Play size={17} /> : <Pause size={17} />}</button></div>
      </section>
      <div className="forest-game-layout">
        <div className="forest-canvas-wrap"><canvas ref={canvasRef}
          onPointerDown={(event) => {
            if (overlayRef.current || overviewRef.current || dragRef.current || event.button !== 0) return;
            stopHeld(); const current = stateRef.current; if (!current) return;
            cameraFocusRef.current ??= { ...current.player };
            dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId); setInspecting(true);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current; const focus = cameraFocusRef.current;
            if (!drag || drag.id !== event.pointerId || !focus) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const view = forestView(rect.width, rect.height, focus);
            focus.x = Math.max(0, Math.min(FOREST_MAP.columns, focus.x - (event.clientX - drag.x) / view.tile));
            focus.y = Math.max(0, Math.min(FOREST_MAP.rows, focus.y - (event.clientY - drag.y) / view.tile));
            drag.x = event.clientX; drag.y = event.clientY;
          }}
          onPointerUp={(event) => { if (dragRef.current?.id === event.pointerId) dragRef.current = null; }}
          onPointerCancel={(event) => { if (dragRef.current?.id === event.pointerId) dragRef.current = null; }}
          onLostPointerCapture={(event) => { if (dragRef.current?.id === event.pointerId) dragRef.current = null; }} aria-label={`Mapa de cima: ${currentSpec?.title}. Setas ou WASD movem o pet; E interage; F usa o objeto.`}
          {...qaTelemetryAttributes} />
          <div className="forest-live-message" aria-live="polite">{overview || inspecting ? "Inspeção pausada · use Voltar ao pet ou o direcional para jogar" : uiMessage || game.message}</div>
          {overlay && <div ref={overlayElementRef} onKeyDown={trapOverlayFocus} className="forest-overlay" role="dialog" aria-modal="true" aria-label={overlay === "pause" ? "Jogo pausado" : overlay === "room" ? "Sala concluída" : "Capítulo concluído"}>
            <div className="forest-dialog">
              <span className="forest-dialog-icon">{overlay === "pause" ? "Ⅱ" : overlay === "room" ? "↗" : "✦"}</span>
              <small>{overlay === "pause" ? "PAUSADO" : overlay === "room" ? "SALA CONCLUÍDA" : "CAPÍTULO CONCLUÍDO"}</small>
              <h2>{overlay === "pause" ? "O bosque espera" : overlay === "room" ? "Mais um caminho aberto!" : "Que aventura bonita!"}</h2>
              <p>{overlay === "pause" ? "Descanse; o estado desta sala continua intacto." : overlay === "room" ? "A primeira sala terminou. A próxima já está pronta." : "Esta campanha tem progresso próprio; não há recompensa em moedas nesta modalidade."}</p>
              {overlay === "pause" ? <button className="forest-primary" type="button" onClick={() => setOverlaySafe(null)}><Play size={16} fill="currentColor" /> Retomar</button>
                : overlay === "room" ? <button className="forest-primary" type="button" onClick={() => { setOverlaySafe(null); setUiMessage(stateRef.current?.message ?? ""); }}><DoorOpen size={17} /> Entrar na sala 2</button>
                : <div className="forest-dialog-actions"><button className="forest-primary" type="button" onClick={() => { const next = Math.min(3, (summary?.chapter ?? game.chapter) + 1); setSelectedChapter(next); returnToMap(); }}><Compass size={16} /> Ver capítulos</button><button className="forest-secondary" type="button" onClick={() => openGame(summary?.chapter ?? game.chapter)}><RotateCcw size={15} /> Rejogar capítulo</button></div>}
              {overlay === "pause" && <div className="forest-pause-menu">
                <button type="button" className="forest-secondary" onClick={() => setShowHelp(value => !value)} aria-expanded={showHelp}><CircleHelp size={16} /> Como jogar</button>
                {showHelp && <p>Setas ou WASD movem. E interage com o objeto à frente; F usa ou solta o objeto carregado. Arraste o cenário para inspecionar com o jogo pausado. Ver sala mostra o mapa inteiro; Voltar ao pet ou o direcional retoma a partida.</p>}
                <button type="button" className="forest-secondary" onClick={() => requestExit("restart")}><RotateCcw size={16} /> Reiniciar sala</button>
                <button type="button" className="forest-secondary" onClick={() => requestExit("map")}><Compass size={16} /> Seleção de capítulos</button>
                <button type="button" className="forest-secondary" onClick={() => requestExit("adventure")}><ArrowLeft size={16} /> Aventura</button>
                <button type="button" className="forest-secondary" onClick={() => requestExit("house")}><Home size={16} /> Minha Casa</button>
              </div>}
              {overlay !== "pause" && <button className="forest-dialog-map" type="button" onClick={returnToMap}>Voltar à seleção de capítulos</button>}
            </div>
          </div>}
        </div>
        <aside ref={controlsElementRef} className="forest-game-controls" aria-label="Controles do jogo">
          <div className="forest-game-pet"><img src={petImage} alt="" /><span><small>COM VOCÊ</small><strong>{petName}</strong></span></div>
          <div className="forest-status-row"><span className={game.collectedKeys.length ? "done" : ""}><KeyRound size={14} /> {game.collectedKeys.length} chave(s)</span><span className={game.carriedObjectId ? "done" : ""}><span aria-hidden="true">▰</span> {game.carriedObjectId ? "carregando" : "patinhas livres"}</span></div>
          <div className="forest-dpad" aria-label="Controles de movimento">
            <button type="button" aria-label="Mover para cima" onPointerDown={onDirectionPointerDown("up")} onPointerUp={releasePointer} onPointerCancel={releasePointer} onLostPointerCapture={releasePointer} onClick={accessibleTap("up")}><ArrowUp /></button>
            <button type="button" aria-label="Mover para a esquerda" onPointerDown={onDirectionPointerDown("left")} onPointerUp={releasePointer} onPointerCancel={releasePointer} onLostPointerCapture={releasePointer} onClick={accessibleTap("left")}><ArrowLeft /></button>
            <button type="button" aria-label="Mover para baixo" onPointerDown={onDirectionPointerDown("down")} onPointerUp={releasePointer} onPointerCancel={releasePointer} onLostPointerCapture={releasePointer} onClick={accessibleTap("down")}><ArrowDown /></button>
            <button type="button" aria-label="Mover para a direita" onPointerDown={onDirectionPointerDown("right")} onPointerUp={releasePointer} onPointerCancel={releasePointer} onLostPointerCapture={releasePointer} onClick={accessibleTap("right")}><ArrowRight /></button>
          </div>
          <div className="forest-action-buttons"><button type="button" onPointerDown={(event) => { event.preventDefault(); triggerAction(false); }} onClick={(event) => { if (event.detail === 0) triggerAction(false); }}><span>E</span> {forestActionLabel(game)}</button><button type="button" disabled={!game.carriedObjectId || Boolean(overlay) || inspecting || overview} onPointerDown={(event) => { event.preventDefault(); triggerAction(true); }} onClick={(event) => { if (event.detail === 0) triggerAction(true); }}><span>F</span> Usar / soltar</button></div>
          <div className="forest-utility-buttons"><button type="button" onClick={() => setShowHelp((value) => !value)} aria-expanded={showHelp}><CircleHelp size={15} /> Como jogar</button><button type="button" onClick={pause}><Pause size={15} /> Pausar</button></div>
          {showHelp && <p className="forest-help-copy">Setas/WASD movem. E empurra ou pega o objeto à frente e aciona o sino. F coloca ou solta o objeto. Chaves são coletadas ao tocar nelas.</p>}
          <p className="forest-safe-note">Sem combate, sem vidas e sem limite de tempo.</p>
        </aside>
      </div>
    </main>}
    <ForestSessionConfirm action={exitAction} onCancel={cancelExit} onConfirm={confirmExit} />
  </div>;
}
