import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Home, KeyRound, Pause, Play, RotateCcw, Sparkles, Trees } from "lucide-react";
import { GAME_ASSETS } from "@/game/assets";
import { createForestPuzzleState, FOREST_PUZZLE, moveForestPuzzle, type Cell, type ForestPuzzleState } from "@/game/forestPuzzle";
import type { PetProfile } from "@/game/PetGame";
import "./ForestPuzzleAdventure.css";

type Props = { profile: PetProfile | null; onBack: () => void; onGoToHouse: () => void };
type Direction = "up" | "down" | "left" | "right";
const DELTAS: Record<Direction, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const MOVE_DURATION = 150;

function cellKey(x: number, y: number) { return `${x},${y}`; }

function paintRoom(ctx: CanvasRenderingContext2D, width: number, height: number, state: ForestPuzzleState, pet: HTMLImageElement, now: number, motion: { from: { x: number; y: number }; startedAt: number }) {
  const cell = Math.min(width / FOREST_PUZZLE.columns, height / FOREST_PUZZLE.rows);
  const left = (width - cell * FOREST_PUZZLE.columns) / 2;
  const top = (height - cell * FOREST_PUZZLE.rows) / 2;
  ctx.clearRect(0, 0, width, height);
  const ground = ctx.createLinearGradient(0, top, 0, top + height);
  ground.addColorStop(0, "#7ecb62"); ground.addColorStop(1, "#4d9b48");
  ctx.fillStyle = ground; ctx.fillRect(left, top, cell * FOREST_PUZZLE.columns, cell * FOREST_PUZZLE.rows);

  for (let y = 1; y < FOREST_PUZZLE.rows - 1; y++) for (let x = 1; x < FOREST_PUZZLE.columns - 1; x++) {
    const px = left + x * cell; const py = top + y * cell;
    ctx.fillStyle = (x + y) % 2 ? "rgba(225,255,178,.11)" : "rgba(20,85,45,.08)";
    ctx.beginPath(); ctx.roundRect(px + cell * .08, py + cell * .08, cell * .84, cell * .84, cell * .16); ctx.fill();
    ctx.fillStyle = "rgba(245,255,211,.22)";
    ctx.beginPath(); ctx.arc(px + cell * (.24 + ((x * 17 + y * 13) % 5) * .1), py + cell * (.28 + ((y * 11 + x) % 4) * .11), Math.max(1.2, cell * .025), 0, Math.PI * 2); ctx.fill();
  }

  const drawTree = (x: number, y: number) => {
    const px = left + (x + .5) * cell; const py = top + (y + .5) * cell;
    ctx.fillStyle = "rgba(28,65,35,.27)"; ctx.beginPath(); ctx.ellipse(px + 2, py + cell * .25, cell * .37, cell * .2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#79502f"; ctx.fillRect(px - cell * .11, py + cell * .04, cell * .22, cell * .34);
    ctx.fillStyle = "#226640"; ctx.beginPath(); ctx.arc(px, py - cell * .04, cell * .37, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3f9e55"; ctx.beginPath(); ctx.arc(px - cell * .1, py - cell * .13, cell * .24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#a4d95a"; ctx.beginPath(); ctx.arc(px - cell * .15, py - cell * .22, cell * .07, 0, Math.PI * 2); ctx.fill();
  };
  for (let x = 0; x < FOREST_PUZZLE.columns; x++) { drawTree(x, 0); drawTree(x, FOREST_PUZZLE.rows - 1); }
  for (let y = 1; y < FOREST_PUZZLE.rows - 1; y++) { drawTree(0, y); drawTree(FOREST_PUZZLE.columns - 1, y); }
  for (let y = 1; y < FOREST_PUZZLE.rows - 1; y++) if (y !== FOREST_PUZZLE.gate.y) drawTree(FOREST_PUZZLE.gate.x, y);

  const plateX = left + (FOREST_PUZZLE.pressurePlate.x + .5) * cell;
  const plateY = top + (FOREST_PUZZLE.pressurePlate.y + .5) * cell;
  ctx.fillStyle = state.gateOpen ? "rgba(255,218,93,.7)" : "rgba(110,83,51,.55)";
  ctx.beginPath(); ctx.ellipse(plateX, plateY + cell * .22, cell * .3, cell * .13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = state.gateOpen ? "#fff1a0" : "#c3ab75"; ctx.lineWidth = Math.max(2, cell * .055);
  ctx.beginPath(); ctx.ellipse(plateX, plateY + cell * .22, cell * .23, cell * .085, 0, 0, Math.PI * 2); ctx.stroke();

  if (!state.gateOpen) {
    const gx = left + FOREST_PUZZLE.gate.x * cell; const gy = top + FOREST_PUZZLE.gate.y * cell;
    ctx.fillStyle = "#754726"; ctx.fillRect(gx + cell * .07, gy + cell * .13, cell * .86, cell * .75);
    ctx.strokeStyle = "#d39a51"; ctx.lineWidth = Math.max(2, cell * .07);
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(gx + cell * i * .22, gy + cell * .14); ctx.lineTo(gx + cell * i * .22, gy + cell * .86); ctx.stroke(); }
    ctx.fillStyle = "#ffe283"; ctx.beginPath(); ctx.arc(gx + cell * .73, gy + cell * .52, cell * .045, 0, Math.PI * 2); ctx.fill();
  } else {
    const gx = left + (FOREST_PUZZLE.gate.x + .5) * cell; const gy = top + (FOREST_PUZZLE.gate.y + .5) * cell;
    ctx.strokeStyle = "rgba(255,236,151,.85)"; ctx.lineWidth = Math.max(2, cell * .045);
    ctx.beginPath(); ctx.arc(gx, gy + cell * .1, cell * .31, Math.PI, Math.PI * 2); ctx.stroke();
  }

  const logX = left + (state.log.x + .5) * cell; const logY = top + (state.log.y + .55) * cell;
  ctx.fillStyle = "rgba(28,56,34,.26)"; ctx.beginPath(); ctx.ellipse(logX, logY + cell * .2, cell * .38, cell * .16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#91582e"; ctx.beginPath(); ctx.roundRect(logX - cell * .37, logY - cell * .17, cell * .74, cell * .34, cell * .17); ctx.fill();
  ctx.strokeStyle = "#d49a55"; ctx.lineWidth = Math.max(2, cell * .055);
  for (const offset of [-.2, 0, .2]) { ctx.beginPath(); ctx.moveTo(logX + cell * offset, logY - cell * .15); ctx.lineTo(logX + cell * offset, logY + cell * .15); ctx.stroke(); }
  ctx.fillStyle = "#dfb16e"; ctx.beginPath(); ctx.ellipse(logX - cell * .34, logY, cell * .07, cell * .16, 0, 0, Math.PI * 2); ctx.fill();

  if (!state.keyCollected) {
    const kx = left + (FOREST_PUZZLE.key.x + .5) * cell; const ky = top + (FOREST_PUZZLE.key.y + .5) * cell + Math.sin(now / 250) * cell * .04;
    ctx.save(); ctx.translate(kx, ky); ctx.rotate(-.25);
    ctx.strokeStyle = "#ffdc58"; ctx.lineWidth = Math.max(2.5, cell * .07); ctx.beginPath(); ctx.arc(-cell * .08, 0, cell * .13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cell * .05, 0); ctx.lineTo(cell * .28, 0); ctx.lineTo(cell * .28, cell * .09); ctx.moveTo(cell * .2, 0); ctx.lineTo(cell * .2, cell * .07); ctx.stroke(); ctx.restore();
  }
  const ex = left + (FOREST_PUZZLE.exit.x + .5) * cell; const ey = top + (FOREST_PUZZLE.exit.y + .5) * cell;
  const glow = ctx.createRadialGradient(ex, ey, cell * .03, ex, ey, cell * .48); glow.addColorStop(0, "rgba(255,239,155,.82)"); glow.addColorStop(1, "rgba(255,225,106,0)");
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ex, ey, cell * .48, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#ffe277"; ctx.lineWidth = Math.max(3, cell * .08); ctx.beginPath(); ctx.arc(ex, ey + cell * .08, cell * .27, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = "rgba(255,244,179,.38)"; ctx.fillRect(ex - cell * .25, ey + cell * .08, cell * .5, cell * .27);

  const moveProgress = Math.min(1, Math.max(0, (now - motion.startedAt) / MOVE_DURATION));
  const from = motion.from;
  const px = left + (from.x + (state.player.x - from.x) * moveProgress + .5) * cell;
  const py = top + (from.y + (state.player.y - from.y) * moveProgress + .5) * cell;
  const stepping = moveProgress < 1;
  const bob = stepping ? Math.sin(moveProgress * Math.PI) * cell * .07 : Math.sin(now / 450) * cell * .012;
  if (pet.complete && pet.naturalWidth > 0) {
    ctx.save(); ctx.translate(px, py - bob);
    if (stepping) { const stretch = 1 + Math.sin(moveProgress * Math.PI) * .045; ctx.scale(stretch, 1 / stretch); }
    ctx.shadowColor = "rgba(16,48,34,.35)"; ctx.shadowBlur = cell * .13; ctx.shadowOffsetY = cell * .045;
    ctx.drawImage(pet, -cell * .37, -cell * .43, cell * .74, cell * .82);
    ctx.restore();
  }
}

export default function ForestPuzzleAdventure({ profile, onBack, onGoToHouse }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ForestPuzzleState>(createForestPuzzleState());
  const movingFromRef = useRef<Cell>({ ...FOREST_PUZZLE.start });
  const movingStartedRef = useRef(0);
  const lastInputRef = useRef(0);
  const pausedRef = useRef(false);
  const [game, setGame] = useState(stateRef.current);
  const [paused, setPaused] = useState(false);
  const [hint, setHint] = useState(false);
  const profileName = profile?.name ?? "Seu pet";
  const characterId = profile?.characterId ?? "menino-prata";

  const reset = useCallback(() => {
    const initial = createForestPuzzleState(); stateRef.current = initial; setGame(initial);
    movingFromRef.current = { ...initial.player }; movingStartedRef.current = performance.now();
    pausedRef.current = false; setPaused(false); setHint(false); lastInputRef.current = 0;
  }, []);

  const move = useCallback((direction: Direction) => {
    if (pausedRef.current || stateRef.current.complete) return;
    const now = performance.now();
    if (now - lastInputRef.current < MOVE_DURATION * .83) return;
    lastInputRef.current = now;
    const before = stateRef.current;
    const [dx, dy] = DELTAS[direction];
    const next = moveForestPuzzle(before, dx, dy);
    if (next === before) return;
    movingFromRef.current = before.player; movingStartedRef.current = now;
    stateRef.current = next; setGame(next);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pet = new Image(); pet.src = GAME_ASSETS.characters[characterId];
    let raf = 0; let width = 1; let height = 1; let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      dpr = Math.min(2, window.devicePixelRatio || 1); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now: number) => {
      paintRoom(ctx, width, height, stateRef.current, pet, now, { from: movingFromRef.current, startedAt: movingStartedRef.current });
      raf = window.requestAnimationFrame(draw);
    };
    resize(); window.addEventListener("resize", resize); raf = window.requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); pet.onload = null; };
  }, [characterId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const direction: Direction | null = key === "arrowup" || key === "w" ? "up" : key === "arrowdown" || key === "s" ? "down" : key === "arrowleft" || key === "a" ? "left" : key === "arrowright" || key === "d" ? "right" : null;
      if (direction) { event.preventDefault(); move(direction); }
      if (key === "escape" || key === "p") { event.preventDefault(); setPaused((current) => { pausedRef.current = !current; return !current; }); }
    };
    const onVisibility = () => { if (document.hidden) { pausedRef.current = true; setPaused(true); } };
    window.addEventListener("keydown", onKeyDown); document.addEventListener("visibilitychange", onVisibility);
    return () => { window.removeEventListener("keydown", onKeyDown); document.removeEventListener("visibilitychange", onVisibility); };
  }, [move]);

  const togglePause = () => setPaused((current) => { pausedRef.current = !current; return !current; });
  const step = (direction: Direction) => () => move(direction);

  return <div className="forest-puzzle" role="application" aria-label="Exploração do Bosque">
    <header className="forest-puzzle-topbar">
      <div className="forest-puzzle-brand"><span aria-hidden="true">🐾</span><div><strong>Exploração</strong><small>AVENTURA DO BOSQUE</small></div></div>
      <div className="forest-puzzle-actions">
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> Voltar à Aventura</button>
        <button type="button" onClick={onGoToHouse}><Home size={17} /> Minha Casa</button>
      </div>
    </header>
    <main className="forest-puzzle-main">
      <section className="forest-puzzle-intro">
        <div><span className="forest-puzzle-kicker"><Trees size={15} /> TRILHA 01 · BOSQUE DAS PATINHAS</span><h1>A trilha do tronco curioso</h1><p>{profileName} precisa abrir o portão, encontrar a chave dourada e alcançar a saída brilhante.</p></div>
        <div className="forest-puzzle-objectives" aria-label="Objetivos da trilha"><span className={game.gateOpen ? "done" : ""}><i>1</i> Empurre o tronco até a placa</span><span className={game.keyCollected ? "done" : ""}><i><KeyRound size={13} /></i> Pegue a chave</span><span className={game.complete ? "done" : ""}><i><Sparkles size={13} /></i> Encontre a saída</span></div>
      </section>
      <section className="forest-puzzle-board" aria-label="Tabuleiro de quebra-cabeça">
        <div className="forest-puzzle-canvas-wrap"><canvas ref={canvasRef} aria-label="Mapa visto de cima: mova o pet com as setas ou WASD; empurre o tronco até a placa dourada" />
          {(paused || game.complete) && <div className="forest-puzzle-overlay" role="dialog" aria-modal="true"><div className="forest-puzzle-dialog"><span className="forest-puzzle-dialog-icon">{game.complete ? "✨" : "⏸"}</span><small>{game.complete ? "TRILHA CONCLUÍDA" : "JOGO PAUSADO"}</small><h2>{game.complete ? "Que aventura bonita!" : "Respire um pouquinho"}</h2><p>{game.complete ? `${profileName} abriu o caminho e encontrou a saída. Esta vitória vale só nesta sessão de teste.` : "O bosque fica esperando. Nenhuma partida ou progresso foi salvo."}</p>{game.complete ? <button type="button" className="forest-puzzle-primary" onClick={reset}><RotateCcw size={17} /> Jogar novamente</button> : <button type="button" className="forest-puzzle-primary" onClick={togglePause}><Play size={17} fill="currentColor" /> Continuar</button>}</div></div>}
        </div>
        <aside className="forest-puzzle-side">
          <div className="forest-puzzle-pet"><img src={GAME_ASSETS.characters[characterId]} alt={profileName} /><div><small>AVENTUREIRO</small><strong>{profileName}</strong></div></div>
          <div className="forest-puzzle-status"><small>CAMINHO</small><strong>{game.gateOpen ? "O portão está aberto!" : "Procure a placa dourada"}</strong><div><span className={game.gateOpen ? "done" : ""}>Portão</span><span className={game.keyCollected ? "done" : ""}>Chave</span><span className={game.complete ? "done" : ""}>Saída</span></div></div>
          <div className="forest-puzzle-controls"><small>CONTROLES</small><div className="forest-puzzle-dpad"><button type="button" aria-label="Mover para cima" onClick={step("up")}><ArrowUp /></button><button type="button" aria-label="Mover para a esquerda" onClick={step("left")}><ArrowLeft /></button><button type="button" aria-label="Mover para baixo" onClick={step("down")}><ArrowDown /></button><button type="button" aria-label="Mover para a direita" onClick={step("right")}><ArrowRight /></button></div><p>Setas ou WASD no teclado; no celular, toque nas setas.</p></div>
          <div className="forest-puzzle-footer-actions"><button type="button" onClick={togglePause} aria-label={paused ? "Retomar jogo" : "Pausar jogo"}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? "Continuar" : "Pausar"}</button><button type="button" onClick={reset}><RotateCcw size={15} /> Reiniciar</button></div>
          <button className="forest-puzzle-hint" type="button" aria-expanded={hint} onClick={() => setHint((current) => !current)}>{hint ? "Esconder dica" : "Precisa de uma dica?"}</button>
          {hint && <p className="forest-puzzle-hint-copy">Chegue ao lado de cima do tronco e empurre-o para baixo, até a placa dourada. O portão fica aberto depois que a placa é acionada.</p>}
        </aside>
      </section>
      <p className="forest-puzzle-session-note">Modo experimental · partida isolada nesta tela · sem conta, salvamento, moedas ou alteração da campanha.</p>
    </main>
  </div>;
}
