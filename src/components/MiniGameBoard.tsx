import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, RotateCcw, X } from "lucide-react";
import MatchThreeBoard from "./MatchThreeBoard";
import { MINI_GAMES, type MiniGameId } from "@/game/levels";

const MEMORY_ICONS = ["🐟", "🧶", "🪶", "🐾"];
const SEQUENCE_ICONS = ["🐟", "🧶", "🪶", "💗"];
const SORT_ITEMS = [
  { id: "treat", icon: "🐟", label: "Peixinho", bin: "comida" as const },
  { id: "ball", icon: "🧶", label: "Novelo", bin: "brinquedo" as const },
  { id: "milk", icon: "🥛", label: "Leite", bin: "comida" as const },
  { id: "feather", icon: "🪶", label: "Pena", bin: "brinquedo" as const },
  { id: "cookie", icon: "🍪", label: "Biscoito", bin: "comida" as const },
  { id: "mouse", icon: "🐭", label: "Ratinho", bin: "brinquedo" as const },
];
const MAZE = ["...#.", "##.#.", "...#.", ".###.", "....."];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

type Props = { id: MiniGameId; petName: string; onWin: () => void; onExit: () => void; soundOn?: boolean; difficulty?: number };

export default function MiniGameBoard({ id, petName, onWin, onExit, soundOn = true, difficulty = 1 }: Props) {
  const definition = MINI_GAMES.find((game) => game.id === id)!;
  const completionRef = useRef(false);
  const [message, setMessage] = useState("Vamos brincar!");
  const [taps, setTaps] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ left: 48, top: 48 });
  const [memoryDeck] = useState(() => shuffle([...MEMORY_ICONS, ...MEMORY_ICONS]));
  const [memoryOpen, setMemoryOpen] = useState<number[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<number[]>([]);
  const [fishingCaught, setFishingCaught] = useState<number[]>([]);
  const [mazePosition, setMazePosition] = useState({ row: 0, col: 0 });
  const [sequence] = useState(() => Array.from({ length: 4 }, () => Math.floor(Math.random() * SEQUENCE_ICONS.length)));
  const [sequenceVisible, setSequenceVisible] = useState(true);
  const [sequenceInput, setSequenceInput] = useState<number[]>([]);
  const [sortRemaining, setSortRemaining] = useState(() => shuffle(SORT_ITEMS));
  const [sortSelected, setSortSelected] = useState<string | null>(null);
  const [shellTarget, setShellTarget] = useState(() => Math.floor(Math.random() * 3));
  const [shellWins, setShellWins] = useState(0);
  const [shellShuffling, setShellShuffling] = useState(true);
  const [meter, setMeter] = useState(0);
  const [meterDirection, setMeterDirection] = useState(1);
  const [timingWins, setTimingWins] = useState(0);
  const [collectionTarget] = useState(() => ["🐟", "🧶", "🪶"][Math.floor(Math.random() * 3)]);
  const [collectionBoard, setCollectionBoard] = useState<string[]>(() => buildCollectionBoard(collectionTarget));

  const finish = () => {
    if (completionRef.current) return;
    completionRef.current = true;
    onWin();
  };

  useEffect(() => {
    if (id !== "memoria" || memoryOpen.length !== 2) return;
    const [first, second] = memoryOpen;
    if (memoryDeck[first] === memoryDeck[second]) {
      const next = [...memoryMatched, first, second];
      setMemoryMatched(next);
      setMemoryOpen([]);
      if (next.length === memoryDeck.length) window.setTimeout(finish, 350);
    } else {
      const timer = window.setTimeout(() => setMemoryOpen([]), 700);
      return () => window.clearTimeout(timer);
    }
  }, [id, memoryOpen, memoryDeck, memoryMatched]);

  useEffect(() => {
    if (id === "sequencia") {
      const timer = window.setTimeout(() => { setSequenceVisible(false); setMessage("Agora toque nos símbolos na mesma ordem."); }, 1700);
      return () => window.clearTimeout(timer);
    }
    return;
  }, [id]);

  useEffect(() => {
    if (id === "ratinho") {
      const timer = window.setTimeout(() => { setShellShuffling(false); setMessage("Em qual caixa o ratinho se escondeu?"); }, 850);
      return () => window.clearTimeout(timer);
    }
    return;
  }, [id]);

  useEffect(() => {
    if (id !== "salto") return;
    const timer = window.setInterval(() => {
      setMeter((value) => {
        const next = value + meterDirection * 2.5;
        if (next >= 100) { setMeterDirection(-1); return 100; }
        if (next <= 0) { setMeterDirection(1); return 0; }
        return next;
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [id, meterDirection]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keys: Record<string, string> = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
      const direction = keys[event.key.toLowerCase()];
      if (direction) {
        event.preventDefault();
        if (id === "labirinto") moveMaze(direction);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [id, mazePosition]);

  const memoryDone = Math.floor(memoryMatched.length / 2);
  const gameArea = useMemo(() => {
    if (definition.mode === "match3") return <MatchThreeBoard onWin={finish} soundOn={soundOn} difficulty={difficulty} />;
    if (definition.mode === "tap") {
      const goal = (id === "bolhas" ? 7 : 8) + Math.floor(Math.max(1, difficulty - 1) / 3);
      const icon = id === "bolhas" ? "🫧" : "🐾";
      const tap = () => {
        const next = taps + 1;
        setTaps(next);
        setTargetPosition({ left: 17 + Math.round(Math.random() * 66), top: 17 + Math.round(Math.random() * 56) });
        setMessage(id === "bolhas" ? "Ploc! A próxima bolha apareceu." : "Agilidade de gatinho! Mais uma patinha.");
        if (next >= goal) finish();
      };
      return <div className={`tap-challenge tap-challenge-${id}`}><div className="tap-score"><span>ALVOS</span><strong>{Math.min(taps, goal)} <i>/ {goal}</i></strong></div><p>{definition.subtitle}</p><button type="button" className="tap-floating-target" style={{ left: `${targetPosition.left}%`, top: `${targetPosition.top}%` }} onClick={tap} aria-label={`Acertar alvo ${icon}`}>{icon}</button><small className="tap-safe-zone">Acompanhe o alvo e toque nele</small></div>;
    }
    if (definition.mode === "memory") {
      const open = (index: number) => {
        if (memoryOpen.length >= 2 || memoryMatched.includes(index) || memoryOpen.includes(index)) return;
        setMemoryOpen((current) => [...current, index]);
        setMessage("Encontre todas as quatro duplas.");
      };
      return <div className="memory-challenge"><div className="challenge-metric"><span>Duplas encontradas</span><strong>{memoryDone}<i> / 4</i></strong></div><div className="memory-board improved-memory-board">{memoryDeck.map((item, index) => { const visible = memoryOpen.includes(index) || memoryMatched.includes(index); return <button type="button" key={`${index}-${item}`} className={`memory-tile ${visible ? "revealed" : ""} ${memoryMatched.includes(index) ? "matched" : ""}`} onClick={() => open(index)} aria-label={visible ? item : "Revelar carta"}>{visible ? item : "✦"}</button>; })}</div></div>;
    }
    if (definition.mode === "fishing") {
      const targets = ["🐟", "🐠", "🪸", "🥾", "🐟", "🐡", "🪣", "🐟", "🐠", "🥾", "🐟", "🐡"];
      const catchFish = (icon: string, index: number) => {
        if (fishingCaught.includes(index)) return;
        if (icon === "🥾" || icon === "🪣" || icon === "🪸") { setMessage("Quase! Essa bota não vira petisco. Tente outro peixinho."); return; }
        const next = taps + 1; setTaps(next); setFishingCaught((current) => [...current, index]); setMessage("Peixinho na rede! Continue pescando.");
        if (next >= 5) finish();
      };
      return <div className="fishing-challenge"><div className="challenge-metric"><span>Peixinhos na rede</span><strong>{Math.min(taps, 5)}<i> / 5</i></strong></div><div className="fishing-water">{targets.map((icon, index) => { const caught = fishingCaught.includes(index); const junk = icon === "🥾" || icon === "🪣" || icon === "🪸"; return <button type="button" key={index} disabled={caught} className={`fishing-item ${junk ? "junk" : ""} ${caught ? "caught" : ""}`} onClick={() => catchFish(icon, index)} aria-label={junk ? "Desviar de um objeto" : `Pescar ${icon}`}>{icon}</button>; })}</div><p className="challenge-hint">Toque nos peixes; desvie de botas e baldes.</p></div>;
    }
    if (definition.mode === "maze") {
      const move = (direction: string) => moveMaze(direction);
      return <div className="maze-challenge"><div className="challenge-metric"><span>Encontre o ratinho de feltro</span><strong>🐭</strong></div><div className="maze-board" role="grid" aria-label="Labirinto"><div className="maze-grid">{MAZE.map((row, rowIndex) => row.split("").map((cell, colIndex) => { const here = mazePosition.row === rowIndex && mazePosition.col === colIndex; const goal = rowIndex === 4 && colIndex === 4; return <span className={`maze-cell ${cell === "#" ? "wall" : "path"} ${here ? "player" : ""} ${goal ? "goal" : ""}`} key={`${rowIndex}-${colIndex}`}>{here ? "🐾" : goal ? "🐭" : ""}</span>; }))}</div></div><div className="maze-controls"><button type="button" onClick={() => move("up")} aria-label="Mover para cima"><ArrowUp size={18} /></button><button type="button" onClick={() => move("left")} aria-label="Mover para a esquerda"><ArrowLeft size={18} /></button><button type="button" onClick={() => move("down")} aria-label="Mover para baixo"><ArrowDown size={18} /></button><button type="button" onClick={() => move("right")} aria-label="Mover para a direita"><ArrowRight size={18} /></button></div><small className="challenge-hint">Use as setas ou WASD no computador.</small></div>;
    }
    if (definition.mode === "sequence") {
      const choose = (choice: number) => {
        if (sequenceVisible) return;
        const next = [...sequenceInput, choice];
        setSequenceInput(next);
        if (sequence[next.length - 1] !== choice) {
          setSequenceInput([]);
          setSequenceVisible(true);
          setMessage("Quase! Memorize a sequência novamente.");
          window.setTimeout(() => { setSequenceVisible(false); setMessage("Agora toque nos símbolos na mesma ordem."); }, 1700);
          return;
        }
        setMessage("Isso! Você está seguindo a sequência certinha.");
        if (next.length >= sequence.length) finish();
      };
      return <div className="sequence-challenge"><div className="challenge-metric"><span>Ordem de brinquedos</span><strong>{sequenceVisible ? "MEMORIZE" : `${sequenceInput.length} / ${sequence.length}`}</strong></div><div className={`sequence-display ${sequenceVisible ? "showing" : "hidden"}`}>{sequence.map((item, index) => <span key={index}>{sequenceVisible ? SEQUENCE_ICONS[item] : "•"}</span>)}</div><p>{sequenceVisible ? "Guarde esta sequência…" : "Toque nos brinquedos na ordem"}</p><div className="sequence-buttons">{SEQUENCE_ICONS.map((icon, index) => <button type="button" key={icon} onClick={() => choose(index)} disabled={sequenceVisible} aria-label={`Escolher ${icon}`}>{icon}</button>)}</div></div>;
    }
    if (definition.mode === "sort") {
      const chosen = sortRemaining.find((item) => item.id === sortSelected);
      const place = (bin: "comida" | "brinquedo") => {
        if (!chosen) { setMessage("Escolha um item primeiro."); return; }
        if (chosen.bin !== bin) { setMessage("Esse vai na outra cesta. Tente de novo!"); return; }
        const next = sortRemaining.filter((item) => item.id !== chosen.id);
        setSortRemaining(next); setSortSelected(null); setMessage("No lugar certo! A caminha está ficando arrumada.");
        if (next.length === 0) finish();
      };
      return <div className="sort-challenge"><div className="challenge-metric"><span>Itens na cesta</span><strong>{SORT_ITEMS.length - sortRemaining.length} <i>/ {SORT_ITEMS.length}</i></strong></div><div className="sort-items">{sortRemaining.map((item) => <button type="button" key={item.id} className={sortSelected === item.id ? "picked" : ""} onClick={() => setSortSelected(item.id)} aria-pressed={sortSelected === item.id}><span>{item.icon}</span><small>{item.label}</small></button>)}</div><div className="sort-bins"><button type="button" className="sort-bin food" onClick={() => place("comida")}><span>🍽️</span><strong>Comidinhas</strong><small>peixe, leite, biscoito</small></button><button type="button" className="sort-bin toys" onClick={() => place("brinquedo")}><span>🧸</span><strong>Brinquedos</strong><small>novelo, pena, ratinho</small></button></div></div>;
    }
    if (definition.mode === "shell") {
      const pick = (cup: number) => {
        if (shellShuffling) return;
        if (cup === shellTarget) {
          const next = shellWins + 1; setShellWins(next); setMessage("Achou! O ratinho mudou de esconderijo.");
          if (next >= 3) { finish(); return; }
          setShellTarget(Math.floor(Math.random() * 3)); setShellShuffling(true); window.setTimeout(() => setShellShuffling(false), 500);
        } else {
          setMessage("Essa caixa está vazia! Tente observar com atenção."); setShellTarget(Math.floor(Math.random() * 3)); setShellShuffling(true); window.setTimeout(() => setShellShuffling(false), 700);
        }
      };
      return <div className="shell-challenge"><div className="challenge-metric"><span>Ratinho encontrado</span><strong>{shellWins}<i> / 3</i></strong></div><p>{shellShuffling ? "As caixas estão trocando…" : "Em qual caixa o ratinho está?"}</p><div className={`shell-cups ${shellShuffling ? "shuffling" : ""}`}>{[0, 1, 2].map((cup) => <button type="button" key={cup} onClick={() => pick(cup)} disabled={shellShuffling} aria-label={`Escolher caixa ${cup + 1}`}><span>{!shellShuffling && cup === shellTarget ? "🐭" : "📦"}</span><small>CAIXA 0{cup + 1}</small></button>)}</div></div>;
    }
    if (definition.mode === "timing") {
      const jump = () => {
        const landed = meter >= 47 && meter <= 62;
        if (landed) { const next = timingWins + 1; setTimingWins(next); setMessage("Pulo perfeito! Agora a barra acelera um pouquinho."); if (next >= 3) finish(); }
        else setMessage("Ops! Tente saltar quando a luz estiver na zona dourada.");
      };
      return <div className="timing-challenge"><div className="challenge-metric"><span>Saltos perfeitos</span><strong>{timingWins}<i> / 3</i></strong></div><div className="jump-stage"><span className="jump-cat">🐈</span><span className="jump-hoop">⭕</span><span className="jump-stars">✦　✧</span></div><div className="timing-track"><span className="timing-zone" /><span className="timing-cursor" style={{ left: `${meter}%` }} /></div><button type="button" className="timing-button" onClick={jump}>PULAR</button><small className="challenge-hint">Toque quando a patinha entrar na zona dourada.</small></div>;
    }
    if (definition.mode === "collection") {
      const collect = (icon: string, index: number) => {
        if (icon !== collectionTarget) { setMessage("Esse não está na lista. Procure o item brilhante!"); return; }
        const next = taps + 1; setTaps(next); setCollectionBoard(buildCollectionBoard(collectionTarget)); setMessage("Item encontrado! Mais um para a coleção.");
        if (next >= 5) finish();
      };
      return <div className="collection-challenge"><div className="challenge-metric"><span>Encontre cinco itens:</span><strong>{collectionTarget}</strong><b>{Math.min(taps, 5)}<i> / 5</i></b></div><div className="collection-grid">{collectionBoard.map((icon, index) => <button type="button" key={`${index}-${icon}`} onClick={() => collect(icon, index)} aria-label={`Procurar item ${icon}`}>{icon}</button>)}</div><small className="challenge-hint">O item procurado muda a cada rodada.</small></div>;
    }
    return null;
  // The panel remounts on id change; this is deliberate for deterministic game resets.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definition.mode, id, taps, targetPosition, memoryDeck, memoryOpen, memoryMatched, memoryDone, mazePosition, sequence, sequenceVisible, sequenceInput, sortRemaining, sortSelected, shellTarget, shellWins, shellShuffling, meter, meterDirection, timingWins, collectionTarget, collectionBoard, message]);

  function moveMaze(direction: string) {
    const delta = direction === "up" ? [-1, 0] : direction === "down" ? [1, 0] : direction === "left" ? [0, -1] : [0, 1];
    const row = mazePosition.row + delta[0]; const col = mazePosition.col + delta[1];
    if (row < 0 || row >= MAZE.length || col < 0 || col >= MAZE[row].length || MAZE[row][col] === "#") { setMessage("Tem um obstáculo aí. Siga pelo caminho claro."); return; }
    setMazePosition({ row, col }); setMessage("Boa! Continue pelo caminho.");
    if (row === 4 && col === 4) finish();
  }

  return (
    <section className={`minigame-board-shell mode-${definition.mode}`} aria-label={`Minijogo ${definition.title}`}>
      <header className="minigame-board-header"><button type="button" className="mini-exit" onClick={onExit}><X size={18} /><span>Sair</span></button><div><span className="modal-kicker">{definition.badge} · PRÊMIOS AO CONCLUIR</span><h2>{definition.title}</h2><p>{definition.subtitle}</p></div><span className="mini-pet-chip">{petName} <span>♥</span></span></header>
      {id !== "colheita" && <p className="minigame-live-message" aria-live="polite">{message}</p>}
      {gameArea}
      {id !== "colheita" && <div className="minigame-board-footer"><span>+60 moedas</span><span>+80 XP</span><span>missão do nível</span></div>}
    </section>
  );
}

function buildCollectionBoard(target: string): string[] {
  const icons = ["🧸", "🐠", "🪶", "🧶", "🎾", "🐟", "⭐", "🦋", "🧡", "🐭", "🪀", "🥛"];
  const board = Array.from({ length: 12 }, () => icons[Math.floor(Math.random() * icons.length)]);
  for (let index = 0; index < 4; index += 1) board[Math.floor(Math.random() * board.length)] = target;
  return board;
}
