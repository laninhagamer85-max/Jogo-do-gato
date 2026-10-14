import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlatformerEngine } from "./PlatformerEngine";
import { createInitialGameState, setPetProfile } from "./PetGame";

// The DOM/Canvas are stubs. These are engine regressions, not rendered playtests.
function harness() {
  const listeners = new Map<string, () => void>();
  const documentStub = {
    hidden: false,
    addEventListener: vi.fn((name: string, listener: () => void) => listeners.set(name, listener)),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("document", documentStub);
  vi.stubGlobal("window", {
    devicePixelRatio: 1,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    requestAnimationFrame: vi.fn(() => 1), cancelAnimationFrame: vi.fn(),
  });
  vi.stubGlobal("ResizeObserver", undefined);
  vi.stubGlobal("Image", class { complete = false; naturalWidth = 0; src = ""; });
  const gradient = { addColorStop: vi.fn() };
  const ctx = new Proxy({}, { get: (_target, key) => String(key).startsWith("create") ? () => gradient : vi.fn() });
  let size = { width: 368, height: 403 };
  const canvas = {
    clientHeight: size.height, width: 0, height: 0,
    getContext: () => ctx, getBoundingClientRect: () => size,
  } as unknown as HTMLCanvasElement;
  const profile = setPetProfile(createInitialGameState(), { name: "QA", age: 2, gender: "menino", characterId: "menino-prata" }).profile!;
  const callbacks = { onHud: vi.fn(), onCollectible: vi.fn(), onWin: vi.fn(), onLose: vi.fn() };
  const engine = new PlatformerEngine(canvas, 1, profile, callbacks);
  const internals = engine as any;
  return {
    engine, internals, callbacks, documentStub,
    visibility: () => listeners.get("visibilitychange")!(),
    resize: (width: number, height: number) => { size = { width, height }; internals.resize(canvas); },
    stand: (index: number, x?: number) => {
      const support = internals.layout.surfaces[index];
      Object.assign(internals.player, { x: x ?? support.x + 40, y: support.y - 60, vx: 0, vy: 0, grounded: true });
    },
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("PlatformerEngine resize and explicit pause", () => {
  it("keeps the same elevated support across portrait-landscape-portrait", () => {
    const h = harness();
    const index = h.internals.layout.surfaces.findIndex((s: any) => s.kind === "floating");
    h.stand(index);
    const x = h.internals.player.x;
    h.internals.coinsCollected = 4;
    h.internals.collectedCoinIds.add(0);
    h.internals.checkpointReached = true;
    for (const [width, height] of [[826, 247], [353, 338], [1290, 548], [368, 403]]) {
      h.resize(width, height);
      expect(h.engine.getAutoPilotSnapshot().currentSurface?.kind).toBe("floating");
      expect(h.internals.player.y + 60).toBe(h.internals.layout.surfaces[index].y);
      expect(h.internals.player.x).toBe(x);
      expect(h.internals.hearts).toBe(3);
      expect(h.internals.coinsCollected).toBe(4);
      expect(h.internals.layout.coins[0].collected).toBe(true);
      expect(h.internals.checkpointReached).toBe(true);
    }
    h.engine.dispose();
  });

  it("preserves support at both edges when the centre is outside the platform", () => {
    for (const edge of ["left", "right"]) {
      const h = harness();
      const index = h.internals.layout.surfaces.findIndex((s: any) => s.kind === "floating");
      const support = h.internals.layout.surfaces[index];
      h.stand(index, edge === "left" ? support.x - 40 : support.x + support.width - 10);
      h.resize(826, 247);
      expect(h.engine.getAutoPilotSnapshot().currentSurface?.kind).toBe("floating");
      expect(h.internals.player.y + 60).toBe(h.internals.layout.surfaces[index].y);
      h.engine.dispose();
    }
  });

  it("keeps ground support and airborne state on resize", () => {
    const h = harness();
    h.stand(0);
    h.resize(826, 247);
    expect(h.internals.player.y + 60).toBe(h.internals.layout.surfaces[0].y);
    Object.assign(h.internals.player, { y: 50, vy: -300, grounded: false });
    h.resize(368, 403);
    expect(h.internals.player.grounded).toBe(false);
    expect(h.internals.player.vy).toBe(-300);
    expect(h.internals.player.y).toBeCloseTo(50 * 403 / 247);
    h.engine.dispose();
  });

  it("does not unpause a paused run when the tab becomes visible", () => {
    const h = harness();
    h.engine.setPaused(true);
    h.documentStub.hidden = true;
    h.visibility();
    h.documentStub.hidden = false;
    h.visibility();
    expect(h.internals.paused).toBe(true);
    const x = h.internals.player.x;
    h.internals.frame(1000);
    h.internals.frame(1034);
    expect(h.internals.player.x).toBe(x);
    expect(h.internals.elapsed).toBe(0);
    h.engine.dispose();
  });

  it("clears held controls on hiding without changing the playing state", () => {
    const h = harness();
    h.engine.setInput("right", true);
    h.engine.setInput("jump", true);
    h.internals.lastFrame = 100;
    h.documentStub.hidden = true;
    h.visibility();
    expect(h.internals.input).toEqual({ left: false, right: false, jump: false });
    expect(h.internals.lastFrame).toBe(0);
    expect(h.internals.paused).toBe(false);
    h.documentStub.hidden = false;
    h.visibility();
    expect(h.internals.paused).toBe(false);
    h.engine.dispose();
  });
});
