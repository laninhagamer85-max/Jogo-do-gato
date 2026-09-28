import { useRef, useState } from "react";
import { RotateCcw, Sparkles, Target } from "lucide-react";
import { createTreatBoard, resolveMatches, swapIfMatched, TILE_META, type TileKind } from "@/game/matchThree";

const ROWS = 7;
const COLS = 7;
const MOVES = 18;
const GOALS: Array<{ kind: TileKind; amount: number }> = [
  { kind: "fish", amount: 7 },
  { kind: "yarn", amount: 7 },
  { kind: "paw", amount: 7 },
];

type Props = { onWin: () => void };

export default function MatchThreeBoard({ onWin }: Props) {
  const [board, setBoard] = useState(() => createTreatBoard(ROWS, COLS));
  const [selected, setSelected] = useState<number | null>(null);
  const [movesLeft, setMovesLeft] = useState(MOVES);
  const [collected, setCollected] = useState<Record<TileKind, number>>({ fish: 0, yarn: 0, paw: 0, milk: 0, feather: 0, heart: 0 });
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [message, setMessage] = useState("Toque em duas peças vizinhas para trocar de lugar.");
  const [combo, setCombo] = useState(0);
  const completedRef = useRef(false);

  function clickTile(index: number) {
    if (status !== "playing") return;
    if (selected === null || selected === index) { setSelected(selected === index ? null : index); return; }
    const swap = swapIfMatched(board, selected, index, ROWS, COLS);
    if (!swap.ok) {
      setSelected(index);
      setMessage("Essa troca não forma uma linha ainda. Tente outras peças vizinhas.");
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
    setMessage(resolution.cascades > 1 ? `Cascata de ${resolution.cascades} combinações! Que demais!` : "Boa combinação! Continue com os pedidos.");

    const didWin = GOALS.every((goal) => nextCollected[goal.kind] >= goal.amount);
    if (didWin && !completedRef.current) {
      completedRef.current = true;
      setStatus("won");
      setMessage("Todos os petiscos pedidos chegaram à tigela!");
      window.setTimeout(onWin, 550);
    } else if (nextMoves <= 0) {
      setStatus("lost");
      setMessage("Os movimentos acabaram. Tente outra estratégia — sem perder moedas.");
    }
  }

  function restart() {
    completedRef.current = false;
    setBoard(createTreatBoard(ROWS, COLS));
    setSelected(null);
    setMovesLeft(MOVES);
    setCollected({ fish: 0, yarn: 0, paw: 0, milk: 0, feather: 0, heart: 0 });
    setStatus("playing");
    setCombo(0);
    setMessage("Toque em duas peças vizinhas para trocar de lugar.");
  }

  return (
    <div className="match-three-game">
      <div className="match-three-heading"><div><span className="match-game-kicker"><Sparkles size={14} /> DESAFIO DE COMBINAÇÃO</span><h3>Encha a tigela</h3><p>Combine três ou mais itens do mesmo tipo.</p></div><div className="moves-badge"><span>JOGADAS</span><strong>{movesLeft}</strong></div></div>
      <div className="match-objectives" aria-label="Metas de coleta">
        {GOALS.map((goal) => {
          const meta = TILE_META[goal.kind];
          const value = Math.min(goal.amount, collected[goal.kind]);
          return <div className={`match-objective objective-${meta.color}`} key={goal.kind}><span>{meta.icon}</span><div><small>{meta.label}</small><strong>{value}<i> / {goal.amount}</i></strong></div><div className="objective-track"><span style={{ width: `${(value / goal.amount) * 100}%` }} /></div></div>;
        })}
      </div>
      <div className={`match-board-shell ${status !== "playing" ? "is-finished" : ""}`}>
        <div className="match-board" role="grid" aria-label="Tabuleiro de peças">
          {board.map((tile, index) => {
            const kind = tile ?? "fish";
            const meta = TILE_META[kind];
            return <button type="button" role="gridcell" key={`${index}-${tile}`} className={`treat-tile tile-${meta.color} ${selected === index ? "selected" : ""}`} onClick={() => clickTile(index)} aria-label={`${meta.label}${selected === index ? ", peça selecionada" : ""}`} aria-selected={selected === index}><span>{meta.icon}</span></button>;
          })}
        </div>
        {status !== "playing" && <div className={`match-result match-result-${status}`}><span>{status === "won" ? "🎉" : "🐾"}</span><strong>{status === "won" ? "Desafio concluído!" : "Quase lá!"}</strong><p>{status === "won" ? "A turma ganhou petiscos e experiência." : "Tente outra combinação. Você não perde moedas ao tentar de novo."}{combo > 1 && status === "won" ? ` Melhor cascata: ${combo}x.` : ""}</p>{status === "lost" && <button type="button" onClick={restart}><RotateCcw size={15} /> Tentar de novo</button>}</div>}
      </div>
      <div className="match-footer"><p aria-live="polite"><Target size={15} /> {message}</p><span>3 em linha · 4+ peças dão bônus</span></div>
    </div>
  );
}
