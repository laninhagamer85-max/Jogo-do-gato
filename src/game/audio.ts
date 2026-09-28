import { GAME_ASSETS } from "./assets";

export type PetVoiceCue = "welcome" | "care" | "level";

let currentVoice: HTMLAudioElement | null = null;

export function playPetVoice(cue: PetVoiceCue): void {
  const source = GAME_ASSETS.voice[cue];
  if (!source || typeof window === "undefined") return;
  try {
    currentVoice?.pause();
    const audio = new Audio(source);
    audio.volume = 0.9;
    currentVoice = audio;
    void audio.play().catch(() => {
      // Browser autoplay is blocked until a user gesture; the next care action can retry.
    });
  } catch {
    // Voice is an optional browser enhancement.
  }
}

export function speakPetText(text: string): void {
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
    utterance.pitch = 1.22;
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
