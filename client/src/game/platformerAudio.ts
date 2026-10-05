export type PlatformAudioMix = { music: number; effects: number };

export const PLATFORM_AUDIO_STORAGE_KEY = "meu-pet-platform-audio-v1";
export const DEFAULT_PLATFORM_AUDIO_MIX: PlatformAudioMix = { music: 0.24, effects: 0.72 };

const clampVolume = (value: unknown, fallback: number) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric)) : fallback;
};

export function loadPlatformAudioMix(): PlatformAudioMix {
  if (typeof window === "undefined") return { ...DEFAULT_PLATFORM_AUDIO_MIX };
  try {
    const saved = JSON.parse(localStorage.getItem(PLATFORM_AUDIO_STORAGE_KEY) ?? "{}") as Partial<PlatformAudioMix>;
    return {
      music: clampVolume(saved.music, DEFAULT_PLATFORM_AUDIO_MIX.music),
      effects: clampVolume(saved.effects, DEFAULT_PLATFORM_AUDIO_MIX.effects),
    };
  } catch {
    return { ...DEFAULT_PLATFORM_AUDIO_MIX };
  }
}

export function savePlatformAudioMix(mix: PlatformAudioMix) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLATFORM_AUDIO_STORAGE_KEY, JSON.stringify({
      music: clampVolume(mix.music, DEFAULT_PLATFORM_AUDIO_MIX.music),
      effects: clampVolume(mix.effects, DEFAULT_PLATFORM_AUDIO_MIX.effects),
    }));
  } catch {
    // Audio preferences are optional; a full or private storage area should not interrupt gameplay.
  }
}

let context: AudioContext | null = null;
let musicBus: GainNode | null = null;
let effectsBus: GainNode | null = null;
let currentMix = { ...DEFAULT_PLATFORM_AUDIO_MIX };
let musicActive = false;
let musicTimer: number | null = null;
let musicStep = 0;

function ensureAudioGraph() {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!context || context.state === "closed") {
    context = new window.AudioContext();
    musicBus = context.createGain();
    effectsBus = context.createGain();
    musicBus.gain.value = musicActive ? currentMix.music * 0.62 : 0;
    effectsBus.gain.value = currentMix.effects;
    musicBus.connect(context.destination);
    effectsBus.connect(context.destination);
  }
  return context;
}

function rampGain(node: GainNode | null, value: number) {
  if (!context || !node || context.state === "closed") return;
  const now = context.currentTime;
  node.gain.cancelScheduledValues(now);
  node.gain.setTargetAtTime(value, now, 0.055);
}

export function setPlatformAudioMix(mix: PlatformAudioMix) {
  currentMix = {
    music: clampVolume(mix.music, DEFAULT_PLATFORM_AUDIO_MIX.music),
    effects: clampVolume(mix.effects, DEFAULT_PLATFORM_AUDIO_MIX.effects),
  };
  if (context?.state !== "closed") {
    rampGain(musicBus, musicActive ? currentMix.music * 0.62 : 0);
    rampGain(effectsBus, currentMix.effects);
  }
}

function playMusicNote(frequency: number, duration: number, velocity: number, wave: OscillatorType) {
  const audio = ensureAudioGraph();
  if (!audio || audio.state !== "running" || !musicBus || currentMix.music <= 0 || !musicActive) return;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  const start = audio.currentTime + 0.012;
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.linearRampToValueAtTime(velocity, start + 0.018);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  envelope.connect(musicBus);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.025);
}

function scheduleMusicStep() {
  if (!musicActive || !context || context.state !== "running" || currentMix.music <= 0) return;
  const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 987.77, 880, 698.46, 587.33, 659.25];
  const bass = [130.81, 130.81, 174.61, 196];
  const step = musicStep % melody.length;
  playMusicNote(melody[step], 0.19, 0.052, "triangle");
  if (step % 4 === 0) playMusicNote(bass[(step / 4) % bass.length], 0.31, 0.032, "sine");
  musicStep += 1;
}

function startMusicClock() {
  if (!musicActive || musicTimer !== null || !context || context.state !== "running") return;
  rampGain(musicBus, currentMix.music * 0.62);
  scheduleMusicStep();
  musicTimer = window.setInterval(scheduleMusicStep, 250);
}

export function unlockPlatformAudio() {
  const audio = ensureAudioGraph();
  if (!audio) return;
  if (audio.state === "suspended") {
    void audio.resume().then(() => startMusicClock()).catch(() => {
      // Browsers may require another explicit user gesture before audio can start.
    });
  } else startMusicClock();
}

export function startPlatformMusic() {
  musicActive = true;
  if (context?.state === "running") startMusicClock();
}

export function stopPlatformMusic() {
  musicActive = false;
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  rampGain(musicBus, 0);
}

export type PlatformSfx = "jump" | "coin" | "hurt" | "bump" | "clear";
type Note = { from: number; to: number; at: number; duration: number; wave: OscillatorType; volume: number };

const SFX_NOTES: Record<PlatformSfx, Note[]> = {
  jump: [{ from: 390, to: 650, at: 0, duration: 0.14, wave: "sine", volume: 0.045 }],
  coin: [
    { from: 820, to: 1120, at: 0, duration: 0.12, wave: "sine", volume: 0.055 },
    { from: 1120, to: 1580, at: 0.07, duration: 0.15, wave: "triangle", volume: 0.035 },
  ],
  bump: [{ from: 190, to: 78, at: 0, duration: 0.12, wave: "square", volume: 0.035 }],
  hurt: [
    { from: 320, to: 115, at: 0, duration: 0.27, wave: "triangle", volume: 0.055 },
    { from: 145, to: 72, at: 0.04, duration: 0.22, wave: "sine", volume: 0.026 },
  ],
  clear: [
    { from: 523, to: 523, at: 0, duration: 0.31, wave: "sine", volume: 0.045 },
    { from: 659, to: 659, at: 0.09, duration: 0.31, wave: "sine", volume: 0.045 },
    { from: 784, to: 784, at: 0.18, duration: 0.34, wave: "sine", volume: 0.05 },
    { from: 1047, to: 1047, at: 0.28, duration: 0.45, wave: "triangle", volume: 0.045 },
  ],
};

export function playPlatformSfx(kind: PlatformSfx) {
  if (currentMix.effects <= 0) return;
  const audio = ensureAudioGraph();
  if (!audio || !effectsBus) return;
  if (audio.state === "suspended") void audio.resume().catch(() => undefined);
  const startAt = audio.currentTime;
  for (const note of SFX_NOTES[kind]) {
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    const noteStart = startAt + note.at;
    oscillator.type = note.wave;
    oscillator.frequency.setValueAtTime(note.from, noteStart);
    if (note.from !== note.to) oscillator.frequency.exponentialRampToValueAtTime(note.to, noteStart + note.duration);
    envelope.gain.setValueAtTime(0.0001, noteStart);
    envelope.gain.linearRampToValueAtTime(note.volume, noteStart + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);
    oscillator.connect(envelope);
    envelope.connect(effectsBus);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + note.duration + 0.01);
  }
}
