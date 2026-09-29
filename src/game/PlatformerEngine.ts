import { GAME_ASSETS } from "./assets";
import { createPlatformLayout, getPlatformStage, type PlatformLayout, type PlatformStage, type PlatformSurface } from "./platformerLevels";
import type { PetProfile } from "./PetGame";

type InputAction = "left" | "right" | "jump";
export type PlatformerHud = { hearts: number; coins: number; totalCoins: number; progress: number; checkpoint: boolean };

type Callbacks = {
  onHud: (hud: PlatformerHud) => void;
  onWin: (coinsCollected: number, hearts: number, totalCoins: number) => void;
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
  private portalImage = new Image();
  private heroImage = new Image();
  private observer: ResizeObserver | null = null;
  private resizeFallback: () => void;
  private keyDown: (event: KeyboardEvent) => void;
  private keyUp: (event: KeyboardEvent) => void;
  private visibilityChange: () => void;
  private soundContext: AudioContext | null = null;
  private soundEnabled = true;

  constructor(canvas: HTMLCanvasElement, stageId: number, profile: PetProfile, callbacks: Callbacks) {
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) throw new Error("Não foi possível iniciar o canvas do jogo.");
    this.ctx = ctx;
    this.stage = getPlatformStage(stageId) ?? getPlatformStage(1)!;
    this.profile = profile;
    this.callbacks = callbacks;
    this.layout = createPlatformLayout(stageId, Math.max(420, canvas.clientHeight));
    this.player.x = this.layout.start.x;
    this.player.y = this.layout.start.y;
    this.platformImage.src = GAME_ASSETS.platformer.grass;
    this.portalImage.src = GAME_ASSETS.platformer.portal;
    this.heroImage.src = GAME_ASSETS.characters[profile.characterId];
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
    if (action === "jump" && !pressed) this.jumpLatched = false;
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) this.input = { left: false, right: false, jump: false };
    this.lastFrame = 0;
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  dispose() {
    this.running = false;
    window.cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    window.removeEventListener("resize", this.resizeFallback);
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
    document.removeEventListener("visibilitychange", this.visibilityChange);
    if (this.soundContext) void this.soundContext.close();
  }

  private resize(canvas: HTMLCanvasElement) {
    const oldHeight = this.height;
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
    if (oldHeight > 1 && !wasGrounded) this.player.y *= this.height / oldHeight;
    if (wasGrounded) {
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

  private playTone(kind: "jump" | "coin" | "hurt" | "clear") {
    if (!this.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;
      this.soundContext = this.soundContext ?? new AudioContextClass();
      if (this.soundContext.state === "suspended") void this.soundContext.resume();
      const context = this.soundContext;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const settings = {
        jump: [390, 550, 0.09], coin: [760, 1050, 0.12], hurt: [240, 120, 0.18], clear: [620, 1040, 0.28],
      }[kind];
      oscillator.type = kind === "hurt" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(settings[0], context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(settings[1], context.currentTime + settings[2]);
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + settings[2]);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + settings[2]);
    } catch { /* Audio is a progressive enhancement and follows the user's first input. */ }
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

    for (const enemy of this.layout.enemies) {
      enemy.x += enemy.direction * enemy.speed * dt;
      if (enemy.x < enemy.minX || enemy.x > enemy.maxX) {
        enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX, enemy.x));
        enemy.direction *= -1;
      }
      if (this.invulnerableFor <= 0 && intersects(this.player.x + 6, this.player.y + 8, PLAYER_WIDTH - 12, PLAYER_HEIGHT - 10, enemy.x - 17, enemy.y - 20, 34, 27)) {
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
      this.callbacks.onWin(this.coinsCollected, this.hearts, this.layout.coins.length);
      this.dispose();
      return;
    }
    const cameraTarget = this.player.x - this.width * 0.34;
    this.cameraX += (Math.max(0, Math.min(this.layout.worldWidth - this.width, cameraTarget)) - this.cameraX) * Math.min(1, dt * 6.5);
    if (now - this.lastHudAt > 100) {
      this.lastHudAt = now;
      this.callbacks.onHud({ hearts: this.hearts, coins: this.coinsCollected, totalCoins: this.layout.coins.length, progress: Math.min(100, Math.round((this.player.x / this.layout.goalX) * 100)), checkpoint: this.checkpointReached });
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
    this.callbacks.onHud({ hearts: this.hearts, coins: this.coinsCollected, totalCoins: this.layout.coins.length, progress: Math.min(100, Math.round((this.player.x / this.layout.goalX) * 100)), checkpoint: this.checkpointReached });
    this.lastHudAt = now;
  }

  private render() {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    const palette = this.stage.palette;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, palette.skyTop);
    sky.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.fillStyle = palette.star;
    for (let index = 0; index < 20; index += 1) {
      const worldX = (index * 149 + 37) % Math.max(1, this.layout.worldWidth);
      const sx = ((worldX - this.cameraX * 0.12) % (width + 90) + width + 90) % (width + 90) - 45;
      const sy = 42 + ((index * 73) % Math.max(80, height * 0.39));
      ctx.beginPath();
      ctx.arc(sx, sy + Math.sin(this.elapsed * 0.8 + index) * 3, index % 4 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const sunX = width * 0.78 - this.cameraX * 0.055;
    const sunY = height * 0.22;
    const glow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, Math.max(70, width * 0.12));
    glow.addColorStop(0, `${palette.accent}aa`);
    glow.addColorStop(1, `${palette.accent}00`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, Math.max(70, width * 0.12), 0, Math.PI * 2);
    ctx.fill();

    this.drawHills(ctx, width, height, palette.farHill, 0.12, height * 0.64, 0.17);
    this.drawHills(ctx, width, height, palette.nearHill, 0.24, height * 0.76, 0.12);
    this.drawClouds(ctx, width, height);

    for (const hazard of this.layout.hazards) this.drawHazard(ctx, hazard);
    for (const surface of this.layout.surfaces) this.drawPlatform(ctx, surface);
    this.drawCheckpoint(ctx);
    for (const coin of this.layout.coins) if (!coin.collected) this.drawCoin(ctx, coin.x, coin.y);
    for (const enemy of this.layout.enemies) this.drawEnemy(ctx, enemy.x, enemy.y, enemy.direction);
    this.drawGoal(ctx);
    this.drawPlayer(ctx);
    this.drawForeground(ctx, width, height, palette.accent);
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
    const x = surface.x - this.cameraX - 38;
    const width = surface.width + 76;
    const height = Math.max(64, width * 0.27);
    if (x > this.width + 80 || x + width < -80) return;
    if (this.platformImage.complete && this.platformImage.naturalWidth) {
      ctx.drawImage(this.platformImage, 58, 250, 1440, 390, x, surface.y - 12, width, height);
      return;
    }
    roundedRect(ctx, x, surface.y - 4, width, height, 17);
    ctx.fillStyle = "#8d5737";
    ctx.fill();
    roundedRect(ctx, x, surface.y - 9, width, 20, 11);
    ctx.fillStyle = "#73c94f";
    ctx.fill();
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
    ctx.restore();
  }

  private drawHazard(ctx: CanvasRenderingContext2D, hazard: { x: number; y: number; width: number; height: number }) {
    const x = hazard.x - this.cameraX;
    if (x < -60 || x > this.width + 60) return;
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
    const y = surface.y - 145;
    if (x < -130 || x > this.width + 50) return;
    const pulse = 1 + Math.sin(this.elapsed * 3.7) * 0.025;
    const drawWidth = 112 * pulse;
    const drawHeight = 130 * pulse;
    ctx.save();
    ctx.shadowColor = "rgba(255,220,74,.56)";
    ctx.shadowBlur = 18;
    if (this.portalImage.complete && this.portalImage.naturalWidth) {
      ctx.drawImage(this.portalImage, 260, 55, 1400, 1380, x - drawWidth / 2, y, drawWidth, drawHeight);
    } else {
      ctx.strokeStyle = "#ffdf5e";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(x, y + 65, 37, 58, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,226,101,.35)";
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const x = this.player.x - this.cameraX;
    const bounce = this.player.grounded ? Math.abs(Math.sin(this.elapsed * (Math.abs(this.player.vx) > 0 ? 15 : 2))) * (Math.abs(this.player.vx) > 0 ? 2.3 : 0.5) : 0;
    const y = this.player.y + bounce;
    if (this.invulnerableFor > 0 && Math.floor(this.elapsed * 12) % 2 === 0) return;
    ctx.save();
    ctx.fillStyle = "rgba(26,37,48,.18)";
    ctx.beginPath();
    ctx.ellipse(x + PLAYER_WIDTH / 2, this.player.y + PLAYER_HEIGHT + 5, 25, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    if (this.heroImage.complete && this.heroImage.naturalWidth) {
      const drawX = this.player.facing < 0 ? x + PLAYER_WIDTH + 14 : x - 14;
      ctx.translate(drawX, y - 18);
      if (this.player.facing < 0) ctx.scale(-1, 1);
      ctx.drawImage(this.heroImage, 0, 0, PLAYER_WIDTH + 28, PLAYER_HEIGHT + 30);
    } else {
      ctx.font = "54px serif";
      ctx.textAlign = "center";
      ctx.fillText("🐈", x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT - 4);
    }
    ctx.restore();
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
