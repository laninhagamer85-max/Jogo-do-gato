import { GAME_ASSETS } from "./assets";
import { createPlatformLayout, getPlatformStage, type PlatformLayout, type PlatformStage, type PlatformSurface, type PlatformWorldItem } from "./platformerLevels";
import type { PetProfile } from "./PetGame";
import { playPlatformSfx } from "./platformerAudio";

type InputAction = "left" | "right" | "jump";
export type PlatformerHud = { hearts: number; coins: number; totalCoins: number; worldItems: number; totalWorldItems: number; progress: number; checkpoint: boolean };

type Callbacks = {
  onHud: (hud: PlatformerHud) => void;
  onCollectible: (collected: number, total: number) => void;
  onWin: (coinsCollected: number, hearts: number, totalCoins: number, worldItemsCollected: number, totalWorldItems: number) => void;
  onLose: () => void;
};

const PLAYER_WIDTH = 52;
const PLAYER_HEIGHT = 60;
const GRAVITY = 1750;
const JUMP_SPEED = 655;
const MOVE_SPEED = 300;

function intersects(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Canvas-owned simulation. React only supplies profile, stage and semantic input actions. */
export class PlatformerEngine {
  private ctx: CanvasRenderingContext2D;
  private stage: PlatformStage;
  private layout: PlatformLayout;
  private profile: PetProfile;
  private callbacks: Callbacks;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private player = { x: 0, y: 0, vx: 0, vy: 0, grounded: false, facing: 1 };
  private cameraX = 0;
  private hearts = 3;
  private coinsCollected = 0;
  private collectedCoinIds = new Set<number>();
  private worldItemsCollected = 0;
  private collectedWorldItemIds = new Set<number>();
  private defeatedEnemyIds = new Set<number>();
  private checkpointReached = false;
  private invulnerableFor = 0;
  private paused = false;
  private running = false;
  private jumpLatched = false;
  private elapsed = 0;
  private lastFrame = 0;
  private lastHudAt = 0;
  private raf = 0;
  private input: Record<InputAction, boolean> = { left: false, right: false, jump: false };
  private platformImage = new Image();
  private terrainImage = new Image();
  private portalImage = new Image();
  private roomImage = new Image();
  private playerImage = new Image();
  private observer: ResizeObserver | null = null;
  private resizeFallback: () => void;
  private keyDown: (event: KeyboardEvent) => void;
  private keyUp: (event: KeyboardEvent) => void;
  private visibilityChange: () => void;
  private soundEnabled = true;

  constructor(canvas: HTMLCanvasElement, stageId: number, profile: PetProfile, callbacks: Callbacks) {
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) throw new Error("Não foi possível iniciar o canvas do jogo.");
    this.ctx = ctx;
    this.stage = getPlatformStage(stageId) ?? getPlatformStage(1)!;
    this.profile = profile;
    this.callbacks = callbacks;
    this.layout = createPlatformLayout(stageId, Math.max(180, canvas.clientHeight));
    this.player.x = this.layout.start.x;
    this.player.y = this.layout.start.y;
    this.platformImage.src = GAME_ASSETS.platformer.grass;
    this.terrainImage.src = GAME_ASSETS.platformer.terrain;
    this.portalImage.src = GAME_ASSETS.platformer.portal;
    this.roomImage.src = GAME_ASSETS.levels[this.stage.world - 1] ?? GAME_ASSETS.levels[0];
    this.playerImage.src = GAME_ASSETS.platformer.cats[profile.characterId] ?? GAME_ASSETS.platformer.cats["menino-prata"];
    this.resizeFallback = () => this.resize(canvas);
    this.keyDown = (event) => this.handleKey(event, true);
    this.keyUp = (event) => this.handleKey(event, false);
    this.visibilityChange = () => this.setPaused(document.hidden);

    this.resize(canvas);
    if (typeof ResizeObserver !== "undefined") {
      this.observer = new ResizeObserver(this.resizeFallback);
      this.observer.observe(canvas);
    } else window.addEventListener("resize", this.resizeFallback);
    window.addEventListener("keydown", this.keyDown, { passive: false });
    window.addEventListener("keyup", this.keyUp, { passive: false });
    document.addEventListener("visibilitychange", this.visibilityChange);
    this.running = true;
    this.raf = window.requestAnimationFrame(this.frame);
  }

  setInput(action: InputAction, pressed: boolean) {
    this.input[action] = pressed;
    if (action === "jump" && !pressed) {
      this.jumpLatched = false;
      if (this.player.vy < -360) this.player.vy = -360;
    }
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) this.input = { left: false, right: false, jump: false };
    this.lastFrame = 0;
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  getAutoPilotSnapshot() {
    const standingSurface = this.layout.surfaces.find((surface) =>
      this.player.x + PLAYER_WIDTH - 7 > surface.x &&
      this.player.x + 7 < surface.x + surface.width &&
      Math.abs(this.player.y + PLAYER_HEIGHT - surface.y) < 2,
    );
    return {
      x: this.player.x,
      y: this.player.y,
      grounded: this.player.grounded,
      groundedOnGround: standingSurface?.kind === "ground",
      currentSurface: standingSurface ? { x: standingSurface.x, y: standingSurface.y, width: standingSurface.width, kind: standingSurface.kind } : null,
      hearts: this.hearts,
      playerWidth: PLAYER_WIDTH,
      playerHeight: PLAYER_HEIGHT,
      goalX: this.layout.goalX,
      surfaces: this.layout.surfaces.map(({ x, y, width }) => ({ x, y, width })),
      groundSurfaces: this.layout.groundSurfaces.map(({ x, y, width }) => ({ x, y, width })),
      hazards: this.layout.hazards.map(({ x, y, width, height }) => ({ x, y, width, height })),
      enemies: this.layout.enemies.filter(({ id }) => !this.defeatedEnemyIds.has(id)).map(({ x, y }) => ({ x, y })),
    };
  }

  dispose() {
    this.running = false;
    window.cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    window.removeEventListener("resize", this.resizeFallback);
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
    document.removeEventListener("visibilitychange", this.visibilityChange);
  }

  private resize(canvas: HTMLCanvasElement) {
    const oldHeight = this.height;
    const isFirstResize = oldHeight <= 1;
    const wasGrounded = this.player.grounded;
    const rect = canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    canvas.width = Math.round(this.width * this.dpr);
    canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.layout = createPlatformLayout(this.stage.id, this.height);
    this.layout.coins.forEach((coin) => { coin.collected = this.collectedCoinIds.has(coin.id); });
    this.layout.worldItems.forEach((item) => { item.collected = this.collectedWorldItemIds.has(item.id); });
    if (isFirstResize) {
      this.player.x = this.layout.start.x;
      this.player.y = this.layout.start.y;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.grounded = false;
    } else if (!wasGrounded) this.player.y *= this.height / oldHeight;
    if (!isFirstResize && wasGrounded) {
      const surface = this.findSurfaceAt(this.player.x + PLAYER_WIDTH / 2);
      if (surface) this.player.y = surface.y - PLAYER_HEIGHT;
    }
    this.cameraX = Math.max(0, Math.min(this.layout.worldWidth - this.width, this.player.x - this.width * 0.34));
    this.render();
  }

  private handleKey(event: KeyboardEvent, pressed: boolean) {
    const key = event.key.toLowerCase();
    const action: InputAction | null = key === "arrowleft" || key === "a" ? "left" : key === "arrowright" || key === "d" ? "right" : key === " " || key === "arrowup" || key === "w" ? "jump" : null;
    if (!action) return;
    event.preventDefault();
    this.setInput(action, pressed);
  }

  private playTone(kind: "jump" | "coin" | "hurt" | "bump" | "clear") {
    if (!this.soundEnabled) return;
    playPlatformSfx(kind);
  }

  private findSurfaceAt(x: number): PlatformSurface | undefined {
    return this.layout.surfaces.find((surface) => x >= surface.x && x <= surface.x + surface.width);
  }

  private frame = (time: number) => {
    if (!this.running) return;
    if (!this.lastFrame) this.lastFrame = time;
    const dt = Math.min(0.034, Math.max(0, (time - this.lastFrame) / 1000));
    this.lastFrame = time;
    if (!this.paused && !document.hidden) this.update(dt, time);
    this.render();
    this.raf = window.requestAnimationFrame(this.frame);
  };

  private update(dt: number, now: number) {
    this.elapsed += dt;
    this.invulnerableFor = Math.max(0, this.invulnerableFor - dt);
    const previousBottom = this.player.y + PLAYER_HEIGHT;
    const direction = Number(this.input.right) - Number(this.input.left);
    this.player.vx = direction * MOVE_SPEED;
    if (direction) this.player.facing = direction;
    if (this.input.jump && !this.jumpLatched && this.player.grounded) {
      this.player.vy = -JUMP_SPEED;
      this.player.grounded = false;
      this.jumpLatched = true;
      this.playTone("jump");
    }
    if (!this.input.jump) this.jumpLatched = false;
    this.player.x = Math.max(0, Math.min(this.layout.worldWidth - PLAYER_WIDTH, this.player.x + this.player.vx * dt));
    this.player.y += this.player.vy * dt;
    this.player.vy = Math.min(900, this.player.vy + GRAVITY * dt);
    this.player.grounded = false;

    for (const surface of this.layout.surfaces) {
      const horizontalOverlap = this.player.x + PLAYER_WIDTH - 7 > surface.x && this.player.x + 7 < surface.x + surface.width;
      const currentBottom = this.player.y + PLAYER_HEIGHT;
      if (horizontalOverlap && this.player.vy >= 0 && previousBottom <= surface.y + 8 && currentBottom >= surface.y) {
        this.player.y = surface.y - PLAYER_HEIGHT;
        this.player.vy = 0;
        this.player.grounded = true;
      }
    }

    for (const coin of this.layout.coins) {
      if (!coin.collected && Math.abs(this.player.x + PLAYER_WIDTH / 2 - coin.x) < 30 && Math.abs(this.player.y + PLAYER_HEIGHT / 2 - coin.y) < 37) {
        coin.collected = true;
        this.collectedCoinIds.add(coin.id);
        this.coinsCollected += 1;
        this.playTone("coin");
      }
    }

    for (const item of this.layout.worldItems) {
      if (!item.collected && Math.abs(this.player.x + PLAYER_WIDTH / 2 - item.x) < 31 && Math.abs(this.player.y + PLAYER_HEIGHT / 2 - item.y) < 38) {
        item.collected = true;
        this.collectedWorldItemIds.add(item.id);
        this.worldItemsCollected += 1;
        this.callbacks.onCollectible(this.worldItemsCollected, this.layout.worldItems.length);
        this.playTone("coin");
      }
    }

    for (const enemy of this.layout.enemies) {
      if (this.defeatedEnemyIds.has(enemy.id)) continue;
      enemy.x += enemy.direction * enemy.speed * dt;
      if (enemy.x < enemy.minX || enemy.x > enemy.maxX) {
        enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX, enemy.x));
        enemy.direction *= -1;
      }
      if (this.invulnerableFor <= 0 && intersects(this.player.x + 6, this.player.y + 8, PLAYER_WIDTH - 12, PLAYER_HEIGHT - 10, enemy.x - 17, enemy.y - 20, 34, 27)) {
        this.playTone("bump");
        const enemyTop = enemy.y - 20;
        if (this.player.vy > 0 && previousBottom <= enemyTop + 14) {
          this.defeatedEnemyIds.add(enemy.id);
          this.player.vy = -JUMP_SPEED * 0.52;
          this.player.grounded = false;
          continue;
        }
        this.takeHit(now);
        break;
      }
    }

    for (const hazard of this.layout.hazards) {
      if (this.invulnerableFor <= 0 && intersects(this.player.x + 7, this.player.y + 10, PLAYER_WIDTH - 14, PLAYER_HEIGHT - 12, hazard.x, hazard.y, hazard.width, hazard.height)) {
        this.takeHit(now);
        break;
      }
    }

    if (!this.checkpointReached && this.player.x > this.layout.checkpoint.x) this.checkpointReached = true;
    if (this.player.y > this.height + 110) this.takeHit(now, true);
    if (this.player.x + PLAYER_WIDTH >= this.layout.goalX) {
      this.playTone("clear");
      this.callbacks.onWin(this.coinsCollected, this.hearts, this.layout.coins.length, this.worldItemsCollected, this.layout.worldItems.length);
      this.dispose();
      return;
    }
    const cameraTarget = this.player.x - this.width * 0.34;
    this.cameraX += (Math.max(0, Math.min(this.layout.worldWidth - this.width, cameraTarget)) - this.cameraX) * Math.min(1, dt * 6.5);
    if (now - this.lastHudAt > 100) {
      this.lastHudAt = now;
      this.callbacks.onHud({ hearts: this.hearts, coins: this.coinsCollected, totalCoins: this.layout.coins.length, worldItems: this.worldItemsCollected, totalWorldItems: this.layout.worldItems.length, progress: Math.min(100, Math.round((this.player.x / this.layout.goalX) * 100)), checkpoint: this.checkpointReached });
    }
  }

  private takeHit(now: number, fell = false) {
    if (this.invulnerableFor > 0) return;
    this.hearts -= 1;
    this.invulnerableFor = 1.45;
    this.playTone("hurt");
    if (this.hearts <= 0) {
      this.callbacks.onLose();
      this.dispose();
      return;
    }
    const spawnX = this.checkpointReached ? this.layout.checkpoint.x - PLAYER_WIDTH / 2 : this.layout.start.x;
    const surface = this.findSurfaceAt(spawnX + PLAYER_WIDTH / 2) ?? this.layout.surfaces[0];
    this.player.x = spawnX;
    this.player.y = surface.y - PLAYER_HEIGHT;
    this.player.vx = 0;
    this.player.vy = fell ? -120 : 0;
    this.player.grounded = !fell;
    this.cameraX = Math.max(0, Math.min(this.layout.worldWidth - this.width, this.player.x - this.width * 0.34));
    this.callbacks.onHud({ hearts: this.hearts, coins: this.coinsCollected, totalCoins: this.layout.coins.length, worldItems: this.worldItemsCollected, totalWorldItems: this.layout.worldItems.length, progress: Math.min(100, Math.round((this.player.x / this.layout.goalX) * 100)), checkpoint: this.checkpointReached });
    this.lastHudAt = now;
  }

  private render() {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.drawRoomBackground(ctx, width, height);
    this.drawGapWarnings(ctx, height);
    for (const surface of this.layout.surfaces) this.drawPlatform(ctx, surface);
    for (const hazard of this.layout.hazards) this.drawHazard(ctx, hazard);
    this.drawCheckpoint(ctx);
    for (const coin of this.layout.coins) if (!coin.collected) this.drawCoin(ctx, coin.x, coin.y);
    for (const item of this.layout.worldItems) if (!item.collected) this.drawWorldItem(ctx, item);
    for (const enemy of this.layout.enemies) if (!this.defeatedEnemyIds.has(enemy.id)) this.drawEnemy(ctx, enemy.x, enemy.y, enemy.direction);
    this.drawGoal(ctx);
    this.drawPlayer(ctx);
  }

  private drawRoomBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const image = this.roomImage;
    if (image.complete && image.naturalWidth > 0) {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, this.stage.palette.skyTop);
      gradient.addColorStop(1, this.stage.palette.skyBottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.fillStyle = "rgba(16, 29, 45, .035)";
    ctx.fillRect(0, 0, width, height);
    const floorFade = ctx.createLinearGradient(0, height * 0.52, 0, height);
    floorFade.addColorStop(0, "rgba(18, 30, 45, 0)");
    floorFade.addColorStop(1, "rgba(18, 30, 45, .16)");
    ctx.fillStyle = floorFade;
    ctx.fillRect(0, height * 0.52, width, height * 0.48);
  }

  private drawGapWarnings(ctx: CanvasRenderingContext2D, height: number) {
    const surfaces = this.layout.surfaces;
    ctx.save();
    for (let index = 0; index < surfaces.length - 1; index += 1) {
      const left = surfaces[index];
      const right = surfaces[index + 1];
      const gapLeft = left.x + left.width - this.cameraX;
      const gapRight = right.x - this.cameraX;
      if (gapRight <= 0 || gapLeft >= this.width || gapRight <= gapLeft) continue;
      ctx.beginPath();
      ctx.moveTo(gapLeft, left.y - 1);
      ctx.lineTo(gapRight, right.y - 1);
      ctx.lineTo(gapRight, height + 4);
      ctx.lineTo(gapLeft, height + 4);
      ctx.closePath();
      ctx.fillStyle = "rgba(22, 30, 47, .48)";
      ctx.fill();
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 117, 104, .88)";
      ctx.beginPath();
      ctx.moveTo(gapLeft + 2, left.y + 1);
      ctx.lineTo(gapLeft + 2, Math.min(height, left.y + 24));
      ctx.moveTo(gapRight - 2, right.y + 1);
      ctx.lineTo(gapRight - 2, Math.min(height, right.y + 24));
      ctx.stroke();
      ctx.setLineDash([]);
      for (const edge of [{ x: gapLeft, y: left.y }, { x: gapRight, y: right.y }]) {
        ctx.fillStyle = "#ffb15c";
        ctx.beginPath();
        ctx.moveTo(edge.x - 6, edge.y + 1);
        ctx.lineTo(edge.x + 6, edge.y + 1);
        ctx.lineTo(edge.x, edge.y + 10);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawHills(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, speed: number, baseY: number, amplitude: number) {
    const band = width + 250;
    const offset = (this.cameraX * speed) % band;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-120, height);
    for (let x = -200; x <= width + 240; x += 48) {
      const wave = Math.sin((x + offset) * 0.0041) * height * amplitude;
      ctx.lineTo(x, baseY + wave);
    }
    ctx.lineTo(width + 160, height);
    ctx.closePath();
    ctx.fill();
  }

  private drawClouds(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.54)";
    for (let index = 0; index < 5; index += 1) {
      const cloudWidth = 54 + (index % 3) * 18;
      const band = width + 180;
      const x = ((index * 211 + 45 - this.cameraX * 0.16) % band + band) % band - 60;
      const y = height * (0.16 + (index % 3) * 0.095);
      ctx.beginPath();
      ctx.ellipse(x, y, cloudWidth * 0.35, 11, 0, 0, Math.PI * 2);
      ctx.ellipse(x + cloudWidth * 0.2, y - 7, cloudWidth * 0.25, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(x + cloudWidth * 0.43, y + 1, cloudWidth * 0.3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPlatform(ctx: CanvasRenderingContext2D, surface: PlatformSurface) {
    const x = surface.x - this.cameraX;
    const width = surface.width;
    const height = surface.height;
    if (x > this.width + 20 || x + width < -20) return;
    ctx.save();
    roundedRect(ctx, x, surface.y, width, height, 7);
    ctx.clip();
    const base = ctx.createLinearGradient(0, surface.y, 0, surface.y + height);
    base.addColorStop(0, this.stage.palette.soil);
    base.addColorStop(1, this.stage.palette.soilShadow);
    ctx.fillStyle = base;
    ctx.fillRect(x, surface.y, width, height);

    if (this.terrainImage.complete && this.terrainImage.naturalWidth > 0) {
      const tileWidth = 260;
      const firstTile = Math.floor(surface.x / tileWidth) * tileWidth;
      const grassHeight = Math.min(38, height);
      for (let tileX = firstTile; tileX < surface.x + width; tileX += tileWidth) {
        const screenX = tileX - this.cameraX;
        ctx.drawImage(this.terrainImage, 0, 0, 1024, 190, screenX, surface.y, tileWidth + 1, grassHeight);
        if (height > grassHeight) {
          ctx.drawImage(this.terrainImage, 0, 165, 1024, 520, screenX, surface.y + grassHeight - 2, tileWidth + 1, height - grassHeight + 2);
        }
      }
    } else if (this.platformImage.complete && this.platformImage.naturalWidth > 0) {
      ctx.drawImage(this.platformImage, 0, 0, this.platformImage.naturalWidth, this.platformImage.naturalHeight, x, surface.y, width, Math.min(44, height));
    }

    ctx.globalAlpha = .1;
    ctx.fillStyle = this.stage.palette.terrainTint;
    ctx.fillRect(x, surface.y, width, height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.stage.palette.grassLight;
    ctx.fillRect(x, surface.y, width, 3);
    ctx.fillStyle = this.stage.palette.grass;
    for (let tuft = 0; tuft < Math.ceil(width / 36); tuft += 1) {
      const tuftX = x + tuft * 36 + 12;
      ctx.beginPath();
      ctx.moveTo(tuftX - 3, surface.y + 4);
      ctx.lineTo(tuftX, surface.y - 1);
      ctx.lineTo(tuftX + 3, surface.y + 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawCoin(ctx: CanvasRenderingContext2D, worldX: number, y: number) {
    const x = worldX - this.cameraX;
    if (x < -30 || x > this.width + 30) return;
    const bob = Math.sin(this.elapsed * 5 + worldX) * 3;
    ctx.save();
    ctx.shadowColor = "rgba(255,183,30,.65)";
    ctx.shadowBlur = 13;
    ctx.fillStyle = "#ffd34f";
    ctx.beginPath();
    ctx.arc(x, y + bob, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff3ad";
    ctx.stroke();
    ctx.fillStyle = "#fff7cb";
    ctx.beginPath();
    ctx.arc(x, y + bob, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawWorldItem(ctx: CanvasRenderingContext2D, item: PlatformWorldItem) {
    const x = item.x - this.cameraX;
    if (x < -30 || x > this.width + 30) return;
    const bob = Math.sin(this.elapsed * 4.4 + item.x) * 4;
    ctx.save();
    ctx.shadowColor = this.stage.palette.accent;
    ctx.shadowBlur = 13;
    ctx.fillStyle = "rgba(255,255,255,.96)";
    ctx.beginPath();
    ctx.arc(x, item.y + bob, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.stage.palette.accent;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '17px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    ctx.fillText(this.stage.mascot.collectibleIcon, x, item.y + bob + 1);
    ctx.restore();
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, worldX: number, y: number, direction: number) {
    const x = worldX - this.cameraX;
    if (x < -40 || x > this.width + 40) return;
    const squash = Math.sin(this.elapsed * 7 + worldX) * 2;
    ctx.save();
    ctx.fillStyle = this.stage.palette.hazard;
    ctx.shadowColor = "rgba(56,24,61,.22)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(x, y - squash, 18, 15 + squash * 0.35, 0, Math.PI, 0);
    ctx.lineTo(x + 18, y + 9);
    ctx.quadraticCurveTo(x, y + 21, x - 18, y + 9);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(x + direction * 5, y - 3, 4, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(x + direction * 13, y - 3, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#37354e";
    ctx.beginPath();
    ctx.arc(x + direction * 6, y - 3, 1.7, 0, Math.PI * 2);
    ctx.arc(x + direction * 14, y - 3, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '15px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    ctx.fillText(this.stage.mascot.enemyIcon, x, y - 23);
    ctx.restore();
  }

  private drawHazard(ctx: CanvasRenderingContext2D, hazard: { x: number; y: number; width: number; height: number }) {
    const x = hazard.x - this.cameraX;
    if (x < -60 || x > this.width + 60) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = '15px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    ctx.fillText(this.stage.mascot.hazardIcon, x + hazard.width / 2, hazard.y - 1);
    ctx.fillStyle = "#e95671";
    ctx.strokeStyle = "#a8375d";
    ctx.lineWidth = 2;
    const spikes = Math.max(2, Math.floor(hazard.width / 15));
    ctx.beginPath();
    ctx.moveTo(x, hazard.y + hazard.height);
    for (let index = 0; index < spikes; index += 1) {
      const left = x + (hazard.width / spikes) * index;
      ctx.lineTo(left + hazard.width / spikes / 2, hazard.y);
      ctx.lineTo(left + hazard.width / spikes, hazard.y + hazard.height);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawCheckpoint(ctx: CanvasRenderingContext2D) {
    const worldX = this.layout.checkpoint.x;
    const x = worldX - this.cameraX;
    if (x < -32 || x > this.width + 32) return;
    const surface = this.findSurfaceAt(worldX);
    const y = surface?.y ?? this.layout.groundY;
    ctx.fillStyle = this.checkpointReached ? "#4be0a0" : "rgba(255,255,255,.78)";
    ctx.strokeStyle = "rgba(29,85,99,.52)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 60);
    ctx.lineTo(x, y - 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 2, y - 59);
    ctx.lineTo(x + 28, y - 51);
    ctx.lineTo(x + 2, y - 42);
    ctx.closePath();
    ctx.fill();
    if (this.checkpointReached) {
      ctx.fillStyle = "#154e59";
      ctx.font = "bold 10px Nunito, sans-serif";
      ctx.fillText("CHECK", x - 17, y - 66);
    }
  }

  private drawGoal(ctx: CanvasRenderingContext2D) {
    const surface = this.findSurfaceAt(this.layout.goalX + 30) ?? this.layout.surfaces[this.layout.surfaces.length - 1];
    const x = this.layout.goalX - this.cameraX - 55;
    const drawHeight = Math.min(130, Math.max(88, this.height * 0.52));
    const y = surface.y - drawHeight - 10;
    if (x < -130 || x > this.width + 50) return;
    const pulse = 1 + Math.sin(this.elapsed * 3.7) * 0.025;
    const drawWidth = drawHeight * 0.86 * pulse;
    const pulsedHeight = drawHeight * pulse;
    ctx.save();
    ctx.shadowColor = "rgba(255,220,74,.56)";
    ctx.shadowBlur = 18;
    if (this.portalImage.complete && this.portalImage.naturalWidth) {
      ctx.drawImage(this.portalImage, 260, 55, 1400, 1380, x - drawWidth / 2, y, drawWidth, pulsedHeight);
    } else {
      ctx.strokeStyle = "#ffdf5e";
      ctx.lineWidth = Math.max(7, drawWidth * 0.09);
      ctx.beginPath();
      ctx.ellipse(x, y + pulsedHeight / 2, drawWidth * 0.34, pulsedHeight * 0.43, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,226,101,.35)";
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const x = this.player.x - this.cameraX;
    const moving = this.player.grounded && Math.abs(this.player.vx) > 0;
    const runCycle = this.elapsed * 17;
    const bounce = moving ? Math.abs(Math.sin(runCycle)) * 2.2 : this.player.grounded ? Math.sin(this.elapsed * 2.1) * 0.7 : 0;
    const bodyLean = moving ? -0.045 : this.player.grounded ? 0 : this.player.vy < 0 ? -0.13 : 0.1;
    if (this.invulnerableFor > 0 && Math.floor(this.elapsed * 12) % 2 === 0) return;
    if (this.playerImage.complete && this.playerImage.naturalWidth > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(26,37,48,.2)";
      ctx.beginPath();
      ctx.ellipse(x + PLAYER_WIDTH / 2, this.player.y + PLAYER_HEIGHT + 5, Math.max(14, 31 - Math.max(0, -this.player.vy) * .012), 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(x + PLAYER_WIDTH / 2, this.player.y + PLAYER_HEIGHT - bounce);
      ctx.scale(this.player.facing < 0 ? -1 : 1, moving ? 1 + Math.sin(runCycle * 2) * .018 : 1);
      ctx.rotate(bodyLean);
      ctx.drawImage(this.playerImage, -55, -72, 110, 73);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.fillStyle = "rgba(26,37,48,.18)";
    ctx.beginPath();
    ctx.ellipse(x + PLAYER_WIDTH / 2, this.player.y + PLAYER_HEIGHT + 5, Math.max(14, 25 - Math.max(0, -this.player.vy) * 0.012), 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(x + PLAYER_WIDTH / 2, this.player.y + PLAYER_HEIGHT - bounce);
    ctx.scale(this.player.facing < 0 ? -1 : 1, 1);
    ctx.rotate(bodyLean);
    const appearance = this.catAppearance();
    const stride = moving ? Math.sin(runCycle) * 7 : this.player.grounded ? Math.sin(this.elapsed * 2.1) * 1.4 : -4;

    // Tail, behind the body. The wave reads as a run cycle rather than a seated portrait.
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = appearance.shadow;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-15, -24);
    ctx.bezierCurveTo(-32, -22 - Math.sin(runCycle * 0.55) * 5, -35, -43 + Math.sin(runCycle * 0.55) * 6, -22, -47);
    ctx.stroke();
    ctx.strokeStyle = appearance.furLight;
    ctx.lineWidth = 4;
    ctx.stroke();

    const legStroke = (startX: number, swing: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(startX, -14);
      ctx.lineTo(startX + swing, -6);
      ctx.lineTo(startX + swing * 1.22, -1.5);
      ctx.stroke();
      ctx.fillStyle = appearance.paw;
      ctx.beginPath();
      ctx.ellipse(startX + swing * 1.22 + 2, -1.8, 5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    legStroke(-12, -stride, appearance.shadow);
    legStroke(10, stride, appearance.fur);

    const body = ctx.createLinearGradient(-18, -37, 20, -10);
    body.addColorStop(0, appearance.furLight);
    body.addColorStop(1, appearance.fur);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, -25, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    if (appearance.pattern === "tabby") {
      ctx.strokeStyle = appearance.shadow;
      ctx.lineWidth = 2.4;
      for (let index = 0; index < 3; index += 1) {
        ctx.beginPath();
        ctx.moveTo(-11 + index * 8, -36);
        ctx.lineTo(-6 + index * 8, -28);
        ctx.stroke();
      }
    } else if (appearance.pattern === "calico") {
      ctx.fillStyle = "#dc7945";
      ctx.beginPath();
      ctx.ellipse(-9, -29, 7, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#414052";
      ctx.beginPath();
      ctx.ellipse(3, -20, 6, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Running side-profile head, ears, face, and whiskers.
    ctx.fillStyle = appearance.fur;
    ctx.beginPath();
    ctx.moveTo(8, -44); ctx.lineTo(7, -58); ctx.lineTo(18, -49);
    ctx.quadraticCurveTo(28, -53, 31, -42);
    ctx.quadraticCurveTo(34, -28, 22, -20);
    ctx.quadraticCurveTo(9, -23, 7, -34);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = appearance.ear;
    ctx.beginPath();
    ctx.moveTo(11, -51); ctx.lineTo(10, -55); ctx.lineTo(16, -50); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = appearance.muzzle;
    ctx.beginPath();
    ctx.ellipse(26, -33, 7, 5, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = appearance.eye;
    ctx.beginPath();
    ctx.ellipse(22, -42, 3.4, 4.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#21313a";
    ctx.beginPath();
    ctx.arc(23, -42, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(23.7, -43.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ee8a9e";
    ctx.beginPath();
    ctx.moveTo(31, -36); ctx.lineTo(35, -34); ctx.lineTo(31, -32); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = appearance.whisker;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(29, -31); ctx.lineTo(39, -29);
    ctx.moveTo(29, -33); ctx.lineTo(40, -34);
    ctx.stroke();

    // Gender accessory mirrors the existing cap/bow choice in the home scene.
    if (this.profile.gender === "menino") {
      ctx.fillStyle = "#2f8ca4";
      ctx.beginPath();
      ctx.ellipse(20, -52, 12, 4, -0.12, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#24758f";
      ctx.beginPath();
      ctx.ellipse(24, -49, 12, 2.5, -0.08, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#ef91b5";
      ctx.beginPath();
      ctx.ellipse(11, -55, 4, 3.3, -0.45, 0, Math.PI * 2);
      ctx.ellipse(17, -55, 4, 3.3, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd7e6";
      ctx.beginPath();
      ctx.arc(14, -55, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    if (moving) {
      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = "#fff2be";
      ctx.lineWidth = 2;
      for (let index = 0; index < 2; index += 1) {
        const dashY = -13 + index * 7 + Math.sin(runCycle + index) * 2;
        ctx.beginPath();
        ctx.moveTo(-34 - index * 5, dashY);
        ctx.lineTo(-26 - index * 5, dashY);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private catAppearance() {
    const palettes: Record<string, { fur: string; furLight: string; shadow: string; paw: string; ear: string; muzzle: string; eye: string; whisker: string; pattern: "tabby" | "calico" | "plain" }> = {
      "menino-prata": { fur: "#9caab7", furLight: "#e5e9eb", shadow: "#586979", paw: "#f1e9df", ear: "#ef9b9c", muzzle: "#f3e8df", eye: "#79c864", whisker: "#e8edf0", pattern: "tabby" },
      "menino-laranja": { fur: "#e9873f", furLight: "#ffc276", shadow: "#a94c24", paw: "#ffe4c7", ear: "#ee8a91", muzzle: "#ffe7d2", eye: "#75bd56", whisker: "#fff2df", pattern: "tabby" },
      "menino-preto": { fur: "#41404e", furLight: "#7b778c", shadow: "#252633", paw: "#f2e9e6", ear: "#c67b88", muzzle: "#ede0df", eye: "#dcbd59", whisker: "#f2ebee", pattern: "plain" },
      "menina-creme": { fur: "#e8cda5", furLight: "#fff0cf", shadow: "#a78a67", paw: "#fff5e7", ear: "#ed9ba1", muzzle: "#fff1df", eye: "#6aa9df", whisker: "#fff7e9", pattern: "plain" },
      "menina-calico": { fur: "#e9d6bc", furLight: "#fff0d8", shadow: "#6d5c59", paw: "#fff3df", ear: "#eb9ba1", muzzle: "#fff2e5", eye: "#79b85a", whisker: "#fff6e8", pattern: "calico" },
      "menina-azul": { fur: "#8496b8", furLight: "#c6d1e5", shadow: "#515c7c", paw: "#f1e9ea", ear: "#df9eb6", muzzle: "#f3e8ed", eye: "#73bddd", whisker: "#f4f1f8", pattern: "plain" },
    };
    return palettes[this.profile.characterId] ?? palettes["menino-prata"];
  }

  private drawForeground(ctx: CanvasRenderingContext2D, width: number, height: number, accent: string) {
    const y = height - 20;
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = accent;
    for (let index = 0; index < 13; index += 1) {
      const x = ((index * 119 - this.cameraX * 0.58) % (width + 100) + width + 100) % (width + 100) - 40;
      const sway = Math.sin(this.elapsed * 2 + index) * 4;
      ctx.beginPath();
      ctx.ellipse(x, y - (index % 3) * 5, 4, 13, sway * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
