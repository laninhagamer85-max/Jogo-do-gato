import { useMemo, useRef, useState, type PointerEvent } from "react";
import { RotateCcw, Sparkles, Target } from "lucide-react";
import { createTreatBoard, resolveMatches, swapIfMatched, TILE_META, type TileKind } from "@/game/matchThree";
import { playMatchSound } from "@/game/audio";

const ROWS = 8;
const COLS = 8;
type Props = { onWin: () => void; soundOn?: boolean; difficulty?: number };

export default function MatchThreeBoard({ onWin, soundOn = true, difficulty = 1 }: Props) {
  const goals = useMemo(() => {
    const amount = 12 + Math.floor(Math.max(1, difficulty) / 2);
    return [{ kind: "fish", amount }, { kind: "yarn", amount }, { kind: "paw", amount }] as Array<{ kind: TileKind; amount: number }>;
  }, [difficulty]);
  const moves = 26 + Math.floor(Math.max(1, difficulty - 1) / 3) * 2;
  const [board, setBoard] = useState(() => createTreatBoard(ROWS, COLS));
  const [selected, setSelected] = useState<number | null>(null);
  const [movesLeft, setMovesLeft] = useState(moves);
  const [collected, setCollected] = useState<Record<TileKind, number>>({ fish: 0, yarn: 0, paw: 0, milk: 0, feather: 0, heart: 0 });
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [message, setMessage] = useState("Arraste uma peça para uma vizinha ou toque em duas peças.");
  const [combo, setCombo] = useState(0);
  const dragOriginRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const completedRef = useRef(false);

  function swapTiles(firstIndex: number, secondIndex: number) {
    if (status !== "playing" || firstIndex === secondIndex) return;
    const swap = swapIfMatched(board, firstIndex, secondIndex, ROWS, COLS);
    if (!swap.ok) {
      setSelected(secondIndex);
      setMessage("Essa troca não forma uma linha ainda. Experimente outra peça vizinha.");
      return;
    }
    const resolution = resolveMatches(swap.board, ROWS, COLS);
    const nextCollected = { ...collected };
    (Object.keys(resolution.collected) as TileKind[]).forEach((kind) => { nextCollected[kind] += resolution.collected[kind]; });
    const nextMoves = movesLeft - 1;
    setBoard(resolution.board);
    setCollected(nextCollected);
    setMovesLeft(nextMoves);
    setSelected(null);
    setCombo(resolution.cascades);
    setMessage(resolution.cascades > 1 ? `Cascata de ${resolution.cascades} combinações! Bônus de sequência!` : "Boa combinação! Continue com os pedidos.");
    if (soundOn) playMatchSound();

    const didWin = goals.every((goal) => nextCollected[goal.kind] >= goal.amount);
    if (didWin && !completedRef.current) {
      completedRef.current = true;
      setStatus("won");
      setMessage("Todos os petiscos pedidos chegaram à tigela!");
      window.setTimeout(onWin, 650);
    } else if (nextMoves <= 0) {
      setStatus("lost");
      setMessage("Os movimentos acabaram. Tente outra estratégia — sem perder moedas.");
    }
  }

  function moveTo(index: number) {
    if (status !== "playing") return;
    if (selected === null || selected === index) { setSelected(selected === index ? null : index); return; }
    swapTiles(selected, index);
  }

  function clickTile(index: number) {
    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
    moveTo(index);
  }

  function onTilePointerDown(index: number) { dragOriginRef.current = index; }
  function onTilePointerUp(event: PointerEvent<HTMLButtonElement>, index: number) {
    const origin = dragOriginRef.current;
    dragOriginRef.current = null;
    if (origin === null) return;
    const physicalTarget = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-tile-index]");
    const destination = physicalTarget ? Number(physicalTarget.dataset.tileIndex) : index;
    if (Number.isInteger(destination) && origin !== destination) {
      suppressClickRef.current = true;
      swapTiles(origin, destination);
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
  }

  function restart() {
    completedRef.current = false;
    setBoard(createTreatBoard(ROWS, COLS));
    setSelected(null);
    setMovesLeft(moves);
    setCollected({ fish: 0, yarn: 0, paw: 0, milk: 0, feather: 0, heart: 0 });
    setStatus("playing");
    setCombo(0);
    setMessage("Arraste uma peça para uma vizinha ou toque em duas peças.");
  }

  return (
    <div className="match-three-game">
      <div className="match-three-heading"><div><span className="match-game-kicker"><Sparkles size={14} /> DESAFIO DE COMBINAÇÃO · NÍVEL {difficulty}</span><h3>Encha a tigela</h3><p>Arraste itens vizinhos, planeje cascatas e cumpra três pedidos.</p></div><div className="moves-badge"><span>JOGADAS</span><strong>{movesLeft}</strong></div></div>
      <div className="match-objectives" aria-label="Metas de coleta">
        {goals.map((goal) => {
          const meta = TILE_META[goal.kind];
          const value = Math.min(goal.amount, collected[goal.kind]);
          return <div className={`match-objective objective-${meta.color}`} key={goal.kind}><span>{meta.icon}</span><div><small>{meta.label}</small><strong>{value}<i> / {goal.amount}</i></strong></div><div className="objective-track"><span style={{ width: `${(value / goal.amount) * 100}%` }} /></div></div>;
        })}
      </div>
      <div className={`match-board-shell ${status !== "playing" ? "is-finished" : ""}`}>
        <div className="match-board match-board-8" role="grid" aria-label="Tabuleiro 8 por 8; arraste uma peça até uma vizinha">
          {board.map((tile, index) => {
            const kind = tile ?? "fish";
            const meta = TILE_META[kind];
            return <button type="button" role="gridcell" key={`${index}-${tile}`} data-tile-index={index} className={`treat-tile tile-${meta.color} ${selected === index ? "selected" : ""}`} onPointerDown={() => onTilePointerDown(index)} onPointerUp={(event) => onTilePointerUp(event, index)} onPointerCancel={() => { dragOriginRef.current = null; }} onClick={() => clickTile(index)} aria-label={`${meta.label}${selected === index ? ", peça selecionada" : ""}`} aria-selected={selected === index}><span>{meta.icon}</span></button>;
          })}
        </div>
        {status !== "playing" && <div className={`match-result match-result-${status}`}><span>{status === "won" ? "🎉" : "🐾"}</span><strong>{status === "won" ? "Desafio concluído!" : "Quase lá!"}</strong><p>{status === "won" ? "A turma ganhou petiscos e experiência." : "Tente outra combinação. Você não perde moedas ao tentar de novo."}{combo > 1 && status === "won" ? ` Melhor cascata: ${combo}x.` : ""}</p>{status === "lost" && <button type="button" onClick={restart}><RotateCcw size={15} /> Tentar de novo</button>}</div>}
      </div>
      <div className="match-footer"><p aria-live="polite"><Target size={15} /> {message}</p><span>Arraste · combine 3+ · cascatas valem mais</span></div>
    </div>
  );
}
