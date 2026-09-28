import { GAME_ASSETS } from "./assets";
import type { CompanionId, PetGender } from "./PetGame";

export type PetVoiceCue = "intro" | "welcome" | "care" | "level" | "tap";
let currentVoice: HTMLAudioElement | null = null;

function playClip(source: string, onEnd?: () => void): void {
  if (!source || typeof window === "undefined") return;
  try {
    currentVoice?.pause();
    const audio = new Audio(source);
    audio.volume = 0.88;
    currentVoice = audio;
    const finish = () => {
      if (currentVoice === audio) currentVoice = null;
      onEnd?.();
    };
    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    void audio.play().catch(() => {
      // Browser autoplay is blocked until a user gesture; the next user action can retry.
    });
  } catch {
    // Voice and sound assets are optional browser enhancements.
  }
}

export function playPetVoice(cue: PetVoiceCue, gender?: PetGender | null, onEnd?: () => void): void {
  const source = cue === "welcome" && gender
    ? gender === "menina" ? GAME_ASSETS.voice.welcomeGirl : GAME_ASSETS.voice.welcomeBoy
    : cue === "level" && gender
      ? gender === "menina" ? GAME_ASSETS.voice.levelGirl : GAME_ASSETS.voice.levelBoy
      : cue === "care" && gender
        ? gender === "menina" ? GAME_ASSETS.voice.careGirl : GAME_ASSETS.voice.careBoy
        : cue === "tap"
          ? gender === "menina" ? GAME_ASSETS.voice.tapGirl : gender === "menino" ? GAME_ASSETS.voice.tapBoy : GAME_ASSETS.voice.care
          : GAME_ASSETS.voice[cue];
  playClip(source, onEnd);
}

export function playCompanionVoice(id: CompanionId, onEnd?: () => void): void {
  playClip(GAME_ASSETS.voice[id], onEnd);
}

export function playMatchSound(): void {
  playClip(GAME_ASSETS.sounds.match);
}

export function stopPetVoice(): void {
  currentVoice?.pause();
  currentVoice = null;
}
