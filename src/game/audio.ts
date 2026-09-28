import { GAME_ASSETS } from "./assets";
import type { CompanionId, PetGender } from "./PetGame";

export type PetVoiceCue = "welcome" | "care" | "level";
let currentVoice: HTMLAudioElement | null = null;

function playClip(source: string): void {
  if (!source || typeof window === "undefined") return;
  try {
    currentVoice?.pause();
    const audio = new Audio(source);
    audio.volume = 0.88;
    currentVoice = audio;
    void audio.play().catch(() => {
      // Browser autoplay is blocked until a user gesture; the next user action can retry.
    });
  } catch {
    // Voice and sound assets are optional browser enhancements.
  }
}

export function playPetVoice(cue: PetVoiceCue, gender?: PetGender | null): void {
  const source = cue === "level" && gender
    ? gender === "menina" ? GAME_ASSETS.voice.levelGirl : GAME_ASSETS.voice.levelBoy
    : GAME_ASSETS.voice[cue];
  playClip(source);
}

export function playCompanionVoice(id: CompanionId): void {
  playClip(GAME_ASSETS.voice[id]);
}

export function playMatchSound(): void {
  playClip(GAME_ASSETS.sounds.match);
}

export function speakPetText(text: string, gender?: PetGender | null): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("pt-br"))
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("pt"));
    if (!portugueseVoice) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.94;
    utterance.pitch = gender === "menina" ? 1.35 : 0.94;
    utterance.voice = portugueseVoice;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis is not available in every browser/device.
  }
}

export function stopPetVoice(): void {
  currentVoice?.pause();
  currentVoice = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
