/** Chapter five is a branch, not a substitute for the unfinished chapter-four campaign. */
export type CastlePoint = { x: number; y: number };
export const CASTLE_ROOMS = [
  {
    id: "vestibulo",
    name: "Vestíbulo",
    grid: [1, 1],
    props: [
      { kind: 5, x: 2, y: 2 },
      { kind: 5, x: 8, y: 2 },
    ],
  },
  {
    id: "guarda",
    name: "Sala da Guarda",
    grid: [0, 1],
    props: [
      { kind: 1, x: 2, y: 2 },
      { kind: 1, x: 8, y: 2 },
    ],
  },
  {
    id: "biblioteca",
    name: "Biblioteca",
    grid: [2, 1],
    props: [
      { kind: 0, x: 2, y: 2 },
      { kind: 0, x: 8, y: 2 },
      { kind: 0, x: 2, y: 6 },
    ],
  },
  {
    id: "trono",
    name: "Salão do Trono",
    grid: [1, 0],
    props: [
      { kind: 2, x: 5, y: 2 },
      { kind: 5, x: 2, y: 3 },
    ],
  },
  {
    id: "arsenal",
    name: "Arsenal",
    grid: [0, 0],
    props: [
      { kind: 1, x: 2, y: 2 },
      { kind: 1, x: 8, y: 2 },
      { kind: 5, x: 2, y: 6 },
    ],
  },
  {
    id: "refeitorio",
    name: "Refeitório",
    grid: [2, 0],
    props: [
      { kind: 4, x: 2, y: 2 },
      { kind: 3, x: 5, y: 4 },
    ],
  },
] as const;
export type CastleRoomId = (typeof CASTLE_ROOMS)[number]["id"];
export type CastleProgress = {
  active: boolean;
  room: CastleRoomId;
  player: CastlePoint;
  visited: CastleRoomId[];
  cooldown: number;
};
export const CASTLE_GATE = { x: 14.5, y: -8.1 };
export const castleRoom = (id: CastleRoomId) =>
  CASTLE_ROOMS.find(r => r.id === id)!;
export function castleDoors(id: CastleRoomId) {
  const r = castleRoom(id);
  return CASTLE_ROOMS.filter(
    q => Math.abs(q.grid[0] - r.grid[0]) + Math.abs(q.grid[1] - r.grid[1]) === 1
  ).map(q => ({
    target: q.id,
    x: q.grid[0] < r.grid[0] ? 0.65 : q.grid[0] > r.grid[0] ? 9.35 : 5,
    y: q.grid[1] < r.grid[1] ? 0.8 : q.grid[1] > r.grid[1] ? 7.2 : 4,
  }));
}
export function castleWalkable(p: CastlePoint, id: CastleRoomId) {
  return (
    Number.isFinite(p.x) &&
    Number.isFinite(p.y) &&
    p.x >= 0.55 &&
    p.x <= 9.45 &&
    p.y >= 0.65 &&
    p.y <= 7.35 &&
    !castleRoom(id).props.some(
      q => Math.abs(q.x - p.x) < 0.8 && Math.abs(q.y - p.y) < 0.55
    )
  );
}
export function readCastle(raw: unknown): CastleProgress | undefined {
  if (!raw || typeof raw !== "object") return;
  const r = raw as Partial<CastleProgress>;
  if (!CASTLE_ROOMS.some(q => q.id === r.room)) return;
  const room = r.room!;
  return {
    active: r.active === true,
    room,
    player:
      r.player && castleWalkable(r.player, room)
        ? { ...r.player }
        : { x: 5, y: 6 },
    visited: CASTLE_ROOMS.filter(
      q => (Array.isArray(r.visited)&&r.visited.includes(q.id)) || q.id === room
    ).map(q => q.id),
    cooldown: 600,
  };
}
export function enterCastle(raw?: CastleProgress): CastleProgress {
  return raw
    ? {
        ...raw,
        active: true,
        player: raw.room === "vestibulo" ? { x: 5, y: 6 } : raw.player,
        cooldown: 800,
      }
    : {
        active: true,
        room: "vestibulo",
        player: { x: 5, y: 6 },
        visited: ["vestibulo"],
        cooldown: 800,
      };
}
export function stepCastle(
  s: CastleProgress,
  dx: number,
  dy: number,
  dt: number
): CastleProgress {
  const delta = Math.min(50, Math.max(0, dt)),
    length = Math.max(1, Math.hypot(dx, dy)),
    speed = delta * 0.0035;
  let player = { ...s.player };
  for (const [x, y] of [
    [(dx / length) * speed, 0],
    [0, (dy / length) * speed],
  ]) {
    const q = { x: player.x + x, y: player.y + y };
    if (castleWalkable(q, s.room)) player = q;
  }
  const cooldown = Math.max(0, s.cooldown - delta);
  if (!cooldown) {
    if (
      s.room === "vestibulo" &&
      Math.hypot(player.x - 5, player.y - 7.2) < 0.55
    )
      return { ...s, active: false, player, cooldown: 900 };
    const door = castleDoors(s.room).find(
      q => Math.hypot(player.x - q.x, player.y - q.y) < 0.5
    );
    if (door) {
      const reverse = castleDoors(door.target).find(q => q.target === s.room)!;
      return {
        active: true,
        room: door.target,
        player: {
          x: reverse.x < 1 ? 1.5 : reverse.x > 9 ? 8.5 : 5,
          y: reverse.y < 1 ? 1.6 : reverse.y > 7 ? 6.4 : 4,
        },
        visited: [...new Set([...s.visited, door.target])],
        cooldown: 900,
      };
    }
  }
  return { ...s, player, cooldown };
}
export function castleRoute(
  from: CastlePoint,
  to: CastlePoint,
  id: CastleRoomId
): CastlePoint[] {
  if (!castleWalkable(to, id)) return [];
  const key = (p: CastlePoint) =>
      `${Math.round(p.x * 2)},${Math.round(p.y * 2)}`,
    start = key(from),
    goal = key(to),
    queue = [start],
    parent = new Map<string, string | null>([[start, null]]);
  for (let i = 0; i < queue.length && i < 400; i++) {
    const k = queue[i];
    if (k === goal) {
      const route: CastlePoint[] = [to];
      let p: string | null = k;
      while (p && p !== start) {
        const [x, y] = p.split(",").map(Number);
        route.unshift({ x: x / 2, y: y / 2 });
        p = parent.get(p) ?? null;
      }
      return route;
    }
    const [x, y] = k.split(",").map(Number);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const n = `${x + dx},${y + dy}`;
      if (
        !parent.has(n) &&
        castleWalkable({ x: (x + dx) / 2, y: (y + dy) / 2 }, id)
      ) {
        parent.set(n, k);
        queue.push(n);
      }
    }
  }
  return [];
}
