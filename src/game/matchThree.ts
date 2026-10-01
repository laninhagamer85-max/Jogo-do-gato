export const TILE_KINDS = ["fish", "yarn", "paw", "milk", "feather", "heart"] as const;
export type TileKind = (typeof TILE_KINDS)[number];
export type TreatBoard = Array<TileKind | null>;

export const TILE_META: Record<TileKind, { icon: string; label: string; color: string }> = {
  fish: { icon: "🐟", label: "peixinhos", color: "fish" },
  yarn: { icon: "🧶", label: "novelos", color: "yarn" },
  paw: { icon: "🐾", label: "patinhas", color: "paw" },
  milk: { icon: "🥛", label: "leites", color: "milk" },
  feather: { icon: "🪶", label: "peninhas", color: "feather" },
  heart: { icon: "💗", label: "corações", color: "heart" },
};

const randomTile = (random: () => number) => TILE_KINDS[Math.floor(random() * TILE_KINDS.length)];

export function findMatches(board: TreatBoard, rows = 7, columns = 7): Set<number> {
  const matches = new Set<number>();
  for (let row = 0; row < rows; row += 1) {
    let start = 0;
    while (start < columns) {
      const index = row * columns + start;
      const kind = board[index];
      if (!kind) { start += 1; continue; }
      let end = start + 1;
      while (end < columns && board[row * columns + end] === kind) end += 1;
      if (end - start >= 3) for (let col = start; col < end; col += 1) matches.add(row * columns + col);
      start = end;
    }
  }
  for (let column = 0; column < columns; column += 1) {
    let start = 0;
    while (start < rows) {
      const kind = board[start * columns + column];
      if (!kind) { start += 1; continue; }
      let end = start + 1;
      while (end < rows && board[end * columns + column] === kind) end += 1;
      if (end - start >= 3) for (let row = start; row < end; row += 1) matches.add(row * columns + column);
      start = end;
    }
  }
  return matches;
}

export function createTreatBoard(rows = 7, columns = 7, random: () => number = Math.random): TreatBoard {
  const board: TreatBoard = Array.from({ length: rows * columns }, () => null);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const forbidden = new Set<TileKind>();
      if (col >= 2 && board[row * columns + col - 1] === board[row * columns + col - 2]) {
        const kind = board[row * columns + col - 1];
        if (kind) forbidden.add(kind);
      }
      if (row >= 2 && board[(row - 1) * columns + col] === board[(row - 2) * columns + col]) {
        const kind = board[(row - 1) * columns + col];
        if (kind) forbidden.add(kind);
      }
      let next = randomTile(random);
      let attempts = 0;
      while (forbidden.has(next) && attempts < TILE_KINDS.length * 2) { next = randomTile(random); attempts += 1; }
      board[row * columns + col] = next;
    }
  }
  return board;
}

export function areAdjacent(a: number, b: number, columns = 7): boolean {
  const rowA = Math.floor(a / columns); const colA = a % columns;
  const rowB = Math.floor(b / columns); const colB = b % columns;
  return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
}

export function swapIfMatched(board: TreatBoard, a: number, b: number, rows = 7, columns = 7): { ok: boolean; board: TreatBoard } {
  if (!areAdjacent(a, b, columns)) return { ok: false, board };
  const swapped = [...board];
  [swapped[a], swapped[b]] = [swapped[b], swapped[a]];
  if (findMatches(swapped, rows, columns).size === 0) return { ok: false, board };
  return { ok: true, board: swapped };
}

export function resolveMatches(board: TreatBoard, rows = 7, columns = 7, random: () => number = Math.random): {
  board: TreatBoard;
  collected: Record<TileKind, number>;
  cascades: number;
} {
  let next = [...board];
  const collected: Record<TileKind, number> = { fish: 0, yarn: 0, paw: 0, milk: 0, feather: 0, heart: 0 };
  let cascades = 0;
  while (cascades < 10) {
    const matches = findMatches(next, rows, columns);
    if (matches.size === 0) break;
    cascades += 1;
    matches.forEach((index) => {
      const kind = next[index];
      if (kind) collected[kind] += cascades > 1 ? 2 : 1;
      next[index] = null;
    });
    for (let column = 0; column < columns; column += 1) {
      let writeRow = rows - 1;
      for (let row = rows - 1; row >= 0; row -= 1) {
        const value = next[row * columns + column];
        if (value) { next[writeRow * columns + column] = value; writeRow -= 1; }
      }
      for (let row = writeRow; row >= 0; row -= 1) next[row * columns + column] = randomTile(random);
    }
  }
  return { board: next, collected, cascades };
}
