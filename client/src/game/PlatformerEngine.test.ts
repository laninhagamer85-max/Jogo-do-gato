import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlatformerEngine } from "./PlatformerEngine";
import { getPetMotionPose } from "./platformerAnimation";
import { createInitialGameState, setPetProfile, type PetCharacterId } from "./PetGame";

// The DOM/Canvas are stubs. These are engine regressions, not rendered playtests.
function harness(characterId: PetCharacterId = "menino-prata") {
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
  const contextCalls = new Map<string, ReturnType<typeof vi.fn>>();
  const ctx = new Proxy({}, { get: (_target, key) => {
    if (String(key).startsWith("create")) return () => gradient;
    const name = String(key);
    if (!contextCalls.has(name)) contextCalls.set(name, vi.fn());
    return contextCalls.get(name);
  } });
  let size = { width: 368, height: 403 };
  const canvas = {
    clientHeight: size.height, width: 0, height: 0,
    getContext: () => ctx, getBoundingClientRect: () => size,
  } as unknown as HTMLCanvasElement;
  const profile = setPetProfile(createInitialGameState(), { name: "QA", age: 2, gender: characterId.startsWith("menina") ? "menina" : "menino", characterId }).profile!;
  const callbacks = { onHud: vi.fn(), onCollectible: vi.fn(), onWin: vi.fn(), onLose: vi.fn() };
  const engine = new PlatformerEngine(canvas, 1, profile, callbacks);
  const internals = engine as any;
  return {
    engine, internals, callbacks, documentStub, contextCalls, context: ctx as CanvasRenderingContext2D,
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

// Synthetic unit fixtures only. They are not live browser runs or acceptance victories.
describe("PlatformerEngine existing gameplay contracts", () => {
  it("accepts a grounded jump once, and releases only excessive upward velocity", () => {
    const h = harness(); h.engine.setSoundEnabled(false); h.stand(0);
    h.engine.setInput("jump", true); h.internals.update(0, 1);
    expect(h.internals.player.vy).toBe(-655);
    expect(h.internals.player.grounded).toBe(false);
    expect(h.internals.jumpLatched).toBe(true);
    h.internals.update(1 / 60, 17);
    expect(h.internals.player.vy).toBeGreaterThan(-655);
    h.engine.setInput("jump", false);
    expect(h.internals.player.vy).toBe(-360);
    expect(h.internals.jumpLatched).toBe(false);
    h.internals.player.vy = -250;
    h.engine.setInput("jump", false);
    expect(h.internals.player.vy).toBe(-250);
    h.engine.dispose();
  });

  it("renders articulated running frames instead of the still run illustration", () => {
    const h = harness(); h.stand(0);
    h.internals.player.vx = 220;
    h.internals.walkCycle = 0.2;
    h.internals.drawPlayer(h.context);
    const firstTailPose = h.contextCalls.get("bezierCurveTo")?.mock.calls.at(-1);
    expect(firstTailPose).toBeDefined();
    expect(h.contextCalls.get("drawImage")?.mock.calls.length ?? 0).toBe(0);
    h.contextCalls.get("bezierCurveTo")?.mockClear();
    h.internals.walkCycle = 0.3;
    h.internals.drawPlayer(h.context);
    const nextTailPose = h.contextCalls.get("bezierCurveTo")?.mock.calls.at(-1);
    expect(nextTailPose).not.toEqual(firstTailPose);
    h.engine.dispose();
  });

  it("accepts jump before leaving the final edge, but not after walking off it", () => {
    for (const jumpFirst of [true, false]) {
      const h = harness(); h.engine.setSoundEnabled(false);
      const index = h.internals.layout.surfaces.findIndex((s: any) => s.x === 4301.400000000001);
      const surface = h.internals.layout.surfaces[index];
      h.stand(index, surface.x + surface.width - 9.5);
      h.engine.setInput("right", true);
      if (!jumpFirst) h.internals.update(1 / 60, 17);
      h.engine.setInput("jump", true); h.internals.update(1 / 60, 34);
      expect(h.internals.player.vy < 0).toBe(jumpFirst);
      expect(h.internals.player.grounded).toBe(false);
      h.engine.dispose();
    }
  });

  it("lands at a visible edge only while the contracted 7px margin overlaps", () => {
    for (const inside of [true, false]) {
      const h = harness(); h.engine.setSoundEnabled(false);
      const s = h.internals.layout.surfaces[0];
      Object.assign(h.internals.player, { x: s.x + s.width - (inside ? 10 : 7), y: s.y - 62, vy: 240, grounded: false });
      h.internals.update(1 / 60, 17);
      expect(h.internals.player.grounded).toBe(inside);
      if (inside) expect(h.internals.player.y + 60).toBe(s.y);
      h.engine.dispose();
    }
  });

  it("stomps on descending contact from above without losing a heart", () => {
    const h = harness(); h.engine.setSoundEnabled(false);
    const enemy = h.internals.layout.enemies[0];
    Object.assign(h.internals.player, { x: enemy.x - 26, y: enemy.y - 20 + 1 - 60, vy: 300, grounded: false });
    h.internals.update(1 / 60, 17);
    expect(h.internals.defeatedEnemyIds.has(enemy.id)).toBe(true);
    expect(h.internals.hearts).toBe(3);
    expect(h.internals.player.vy).toBeCloseTo(-655 * 0.52);
    h.engine.dispose();
  });

  it("treats lower/lateral enemy contact as damage, not as a stomp", () => {
    const h = harness(); h.engine.setSoundEnabled(false);
    const enemy = h.internals.layout.enemies[0];
    Object.assign(h.internals.player, { x: enemy.x - 26, y: enemy.y - 50, vy: 0, grounded: false });
    h.internals.update(1 / 60, 17);
    expect(h.internals.defeatedEnemyIds.has(enemy.id)).toBe(false);
    expect(h.internals.hearts).toBe(2);
    expect(h.internals.player.x).toBe(h.internals.layout.start.x);
    expect(h.internals.invulnerableFor).toBe(1.45);
    h.engine.dispose();
  });

  it("loses a heart and respawns when falling below height plus 110", () => {
    const h = harness(); h.engine.setSoundEnabled(false);
    h.internals.player.y = h.internals.height + 111;
    h.internals.player.grounded = false;
    h.internals.update(0, 1);
    expect(h.internals.hearts).toBe(2);
    expect(h.internals.player.x).toBe(h.internals.layout.start.x);
    expect(h.internals.player.vy).toBe(-120);
    expect(h.callbacks.onLose).not.toHaveBeenCalled();
    h.engine.dispose();
  });

  it("counts a coin and a world item only once", () => {
    const h = harness(); h.engine.setSoundEnabled(false);
    const coin = h.internals.layout.coins[0];
    Object.assign(h.internals.player, { x: coin.x - 26, y: coin.y - 30 });
    h.internals.update(0, 1); h.internals.update(0, 2);
    expect(h.internals.coinsCollected).toBe(1);
    const token = h.internals.layout.worldItems[0];
    Object.assign(h.internals.player, { x: token.x - 26, y: token.y - 30 });
    h.internals.update(0, 3); h.internals.update(0, 4);
    expect(h.internals.worldItemsCollected).toBe(1);
    expect(h.callbacks.onCollectible).toHaveBeenCalledTimes(1);
    expect(h.callbacks.onCollectible).toHaveBeenCalledWith(1, h.internals.layout.worldItems.length);
    h.engine.dispose();
  });

  it("crossing the portal invokes the normal callback and stops future frames", () => {
    const h = harness(); h.engine.setSoundEnabled(false);
    // Position is synthetic in this stubbed unit test, never in the browser playthrough.
    h.internals.player.x = h.internals.layout.goalX - 52;
    h.internals.update(0, 1); h.internals.frame(17);
    expect(h.callbacks.onWin).toHaveBeenCalledTimes(1);
    expect(h.callbacks.onWin).toHaveBeenCalledWith(h.internals.coinsCollected, 3, h.internals.layout.coins.length, 0, h.internals.layout.worldItems.length);
    expect(h.internals.running).toBe(false);
  });
});

describe("pet presentation-only animation", () => {
  const base = { grounded: true, horizontalSpeed: 0, verticalSpeed: 0, elapsed: 0, landingFor: 0 };

  it("uses a resting portrait and a gentle breathing cycle while idle", () => {
    const early = getPetMotionPose({ ...base, elapsed: 0.1 });
    const later = getPetMotionPose({ ...base, elapsed: 0.8 });
    expect(early.state).toBe("idle");
    expect(early.sprite).toBe("rest");
    expect(later.scaleY).not.toBe(early.scaleY);
  });

  it("switches to the running pose and visibly cycles the stride while moving", () => {
    const first = getPetMotionPose({ ...base, horizontalSpeed: 300, elapsed: 0.1 });
    const second = getPetMotionPose({ ...base, horizontalSpeed: 300, elapsed: 0.3 });
    expect(first.state).toBe("run");
    expect(first.sprite).toBe("run");
    expect(second.bobY).not.toBe(first.bobY);
    expect(second.rotation).not.toBe(first.rotation);
  });

  it("distinguishes ascent, descent and landing poses", () => {
    const rising = getPetMotionPose({ ...base, grounded: false, verticalSpeed: -450 });
    const falling = getPetMotionPose({ ...base, grounded: false, verticalSpeed: 480 });
    const landing = getPetMotionPose({ ...base, landingFor: 0.08 });
    expect(rising.state).toBe("rise");
    expect(rising.scaleY).toBeGreaterThan(1);
    expect(falling.state).toBe("fall");
    expect(falling.scaleY).toBeLessThan(1);
    expect(landing.state).toBe("land");
    expect(landing.scaleY).toBeLessThan(1);
    expect(landing.scaleX).toBeGreaterThan(1);
  });

  it("keeps visual transforms finite and bounded at extreme animation inputs", () => {
    for (const input of [
      { ...base, horizontalSpeed: 300, elapsed: 1e4 },
      { ...base, grounded: false, verticalSpeed: -900 },
      { ...base, grounded: false, verticalSpeed: 900 },
      { ...base, landingFor: 0.001 },
    ]) {
      const pose = getPetMotionPose(input);
      expect(Object.values(pose).every((value) => typeof value !== "number" || Number.isFinite(value))).toBe(true);
      expect(pose.scaleX).toBeGreaterThan(0.8);
      expect(pose.scaleX).toBeLessThan(1.2);
      expect(pose.scaleY).toBeGreaterThan(0.8);
      expect(pose.scaleY).toBeLessThan(1.2);
    }
  });
});

// DOM/Canvas stubs only; these assertions are not a visual acceptance test.
describe('consistent pet renderer and distance-driven gait', () => {
  it('uses the same articulated character while resting and moving', () => {
    const h = harness(); h.stand(0);
    h.contextCalls.get('ellipse')?.mockClear();
    h.contextCalls.get('drawImage')?.mockClear();
    h.internals.player.vx = 0;
    h.internals.drawPlayer(h.context);
    const idlePaws = h.contextCalls.get('ellipse')?.mock.calls.filter((call: unknown[]) => call[2] === 5 && call[3] === 3.2).length;
    h.contextCalls.get('ellipse')?.mockClear();
    h.internals.player.vx = 300; h.internals.walkCycle = 1;
    h.internals.drawPlayer(h.context);
    const movingPaws = h.contextCalls.get('ellipse')?.mock.calls.filter((call: unknown[]) => call[2] === 5 && call[3] === 3.2).length;
    expect(idlePaws).toBe(4); expect(movingPaws).toBe(4);
    expect(h.contextCalls.get('drawImage')?.mock.calls.length ?? 0).toBe(0);
    h.engine.dispose();
  });
  it('advances gait with actual ground travel and freezes it while idle or clamped', () => {
    const h = harness(); h.engine.setSoundEnabled(false); h.stand(0);
    h.engine.setInput('right', true); h.internals.update(1 / 60, 17);
    expect(h.internals.walkCycle).toBeGreaterThan(0);
    h.engine.setInput('right', false);
    const cycle = h.internals.walkCycle;
    h.internals.update(1 / 60, 34); expect(h.internals.walkCycle).toBe(cycle);
    h.internals.player.x = 0; h.engine.setInput('left', true);
    h.internals.update(1 / 60, 51); expect(h.internals.walkCycle).toBe(cycle);
    h.engine.dispose();
  });
});

describe('silver kitten atlas pilot', () => {
  it('returns to the original seated art when held movement is blocked', () => {
    const h=harness(); h.engine.setSoundEnabled(false); h.stand(0);
    Object.assign(h.internals.walkAtlas,{complete:true,naturalWidth:1254,naturalHeight:1254});
    Object.assign(h.internals.idleImage,{complete:true,naturalWidth:768,naturalHeight:768});
    h.engine.setInput('right',true); h.internals.update(1/60,17);
    h.internals.drawPlayer(h.context);
    expect(h.contextCalls.get('drawImage')?.mock.calls.at(-1)?.[0]).toBe(h.internals.walkAtlas);
    h.internals.player.x=0; h.engine.setInput('right',false); h.engine.setInput('left',true);
    h.internals.update(1/60,34); h.internals.drawPlayer(h.context);
    expect(h.contextCalls.get('drawImage')?.mock.calls.at(-1)?.[0]).toBe(h.internals.idleImage);
    h.engine.dispose();
  });
});

describe('black kitten pilot integration', () => {
  it('uses its own atlas while moving and its own portrait while resting', () => {
    const h=harness('menino-preto'); h.engine.setSoundEnabled(false); h.stand(0);
    expect(h.internals.walkAtlas.src).toContain('menino-preto-walk');
    expect(h.internals.idleImage.src).toContain('boy-preto');
    Object.assign(h.internals.walkAtlas,{complete:true,naturalWidth:1254,naturalHeight:1254});
    Object.assign(h.internals.idleImage,{complete:true,naturalWidth:768,naturalHeight:768});
    h.engine.setInput('right',true); h.internals.update(1/60,17); h.internals.drawPlayer(h.context);
    expect(h.contextCalls.get('drawImage')?.mock.calls.at(-1)?.[0]).toBe(h.internals.walkAtlas);
    h.engine.setInput('right',false); h.internals.update(1/60,34); h.internals.drawPlayer(h.context);
    expect(h.contextCalls.get('drawImage')?.mock.calls.at(-1)?.[0]).toBe(h.internals.idleImage);
    h.engine.dispose();
  });
});

describe('remaining character walk integration', () => {
  for(const id of ['menino-laranja','menina-creme','menina-calico','menina-azul'] as const) {
    it(`preserves ${id} identity across movement and seated state`, () => {
      const h=harness(id);h.engine.setSoundEnabled(false);h.stand(0);
      expect(h.internals.walkAtlas.src).toContain(id+'-walk');
      Object.assign(h.internals.walkAtlas,{complete:true,naturalWidth:1254,naturalHeight:1254});
      Object.assign(h.internals.idleImage,{complete:true,naturalWidth:768,naturalHeight:768});
      h.engine.setInput('right',true);h.internals.update(1/60,17);h.internals.drawPlayer(h.context);
      expect(h.contextCalls.get('drawImage')?.mock.calls.at(-1)?.[0]).toBe(h.internals.walkAtlas);
      h.engine.setInput('right',false);h.internals.update(1/60,34);h.internals.drawPlayer(h.context);
      expect(h.contextCalls.get('drawImage')?.mock.calls.at(-1)?.[0]).toBe(h.internals.idleImage);
      h.engine.dispose();
    });
  }
});

describe('optional pet size',()=>{
  it('clamps at the approved normal size and preserves simulation, progress and input',()=>{
    const h=harness();h.stand(0);h.internals.coinsCollected=3;
    h.engine.setInput('right',true);
    const before={player:{...h.internals.player},layout:h.internals.layout,camera:h.internals.cameraX,hearts:h.internals.hearts};
    for(const value of [1.25,1.5,1.75,2,.2,9,NaN,1]) {
      h.engine.setViewZoom(value);
      expect(h.internals.viewZoom).toBeGreaterThanOrEqual(1);
      expect(h.internals.viewZoom).toBeLessThanOrEqual(2);
      expect(h.internals.player).toEqual(before.player);
      expect(h.internals.layout).toBe(before.layout);
      expect(h.internals.cameraX).toBe(before.camera);
      expect(h.internals.hearts).toBe(before.hearts);
      expect(h.internals.coinsCollected).toBe(3);
      expect(h.internals.input.right).toBe(true);
    }
    h.resize(844,390);expect(h.internals.viewZoom).toBe(1);
    h.engine.dispose();
  });
});

describe('pet-only presentation scaling',()=>{
  it('scales after scenery drawing and before the pet, preserving the contact anchor',()=>{
    const h=harness();h.stand(0);const order:string[]=[];
    for(const method of ['drawRoomBackground','drawGapWarnings','drawPlatform','drawHazard','drawCheckpoint','drawCoin','drawWorldItem','drawEnemy','drawGoal'])h.internals[method]=()=>order.push('world');
    h.internals.drawPlayer=()=>order.push('pet');
    h.contextCalls.get('scale')?.mockImplementation(()=>order.push('scale'));
    // Ensure the proxy has created the method before replacing it.
    h.context.scale(1,1);order.length=0;
    h.contextCalls.get('scale')!.mockImplementation(()=>order.push('scale'));
    h.engine.setViewZoom(2);
    expect(order.lastIndexOf('world')).toBeLessThan(order.indexOf('scale'));
    expect(order.indexOf('scale')).toBeLessThan(order.indexOf('pet'));
    const point={x:h.internals.player.x-h.internals.cameraX+26,y:h.internals.player.y+60};
    expect(h.contextCalls.get('translate')?.mock.calls.at(-1)).toEqual([-point.x,-point.y]);
    h.engine.dispose();
  });
});
