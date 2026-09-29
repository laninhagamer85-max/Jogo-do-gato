import { lazy, Suspense, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  Bath, BookOpen, Camera, Check, ChevronDown, ChevronRight, Coins, Gamepad2, Gift, Heart,
  Home as HomeIcon, LockKeyhole, MapPin, Moon, PawPrint, Plus, Settings, ShoppingBag,
  Eye, EyeOff, Sparkles, Star, Trophy, Utensils, Volume2, VolumeX, X,
} from "lucide-react";
import MiniGameBoard from "@/components/MiniGameBoard";
import OnboardingFlow from "@/components/OnboardingFlow";
import PlatformAdventure from "@/components/PlatformAdventure";
import { SceneDecoration, SceneDecorationPicker, SceneGift } from "@/components/SceneDecoration";
import CreatorPlaquePicker from "@/components/CreatorPlaquePicker";
import CreatorTributeModal from "@/components/CreatorTributeModal";
import TutorialOverlay from "@/components/TutorialOverlay";
import {
  buyBoost, buyDecoration, buySkin, buyStoreItem, chooseCompanion, collectSurpriseGift, completeMinigame, completePlatformStage,
  createInitialGameState, CURRENT_SAVE_KEY, DECORATIONS, PET_CHARACTERS, expireGifts, LEGACY_SAVE_KEYS,
  getDecorationStageId, migrateGameState, performCare, placeDecoration, removeDecoration, selectRoom, setPetProfile,
  SKINS, spawnSurpriseGift, STORE_ITEMS, tickPet, updateDecoration, useStoreItem,
  type CareAction, type CompanionId, type DecorationId, type DecorationPlacement, type GameState,
  type PetGender, type PetProfile, type SkinId, type StoreItemId,
} from "@/game/PetGame";
import { CAMPAIGN_LEVELS, getCampaignLevel, MINI_GAMES, type MiniGameId } from "@/game/levels";
import { playCompanionVoice, playMatchSound, playPetVoice, stopPetVoice, type PetVoiceCue } from "@/game/audio";
import { GAME_ASSETS } from "@/game/assets";
import { legacyStagePercentToBackground, screenToBackgroundPercent } from "@/game/decorationCoordinates";

type ShopTab = "looks" | "items" | "boosts" | "friends" | "decor";
type CollapsedPanels = { stats: boolean; care: boolean; mission: boolean; shop: boolean };
type GiftRevealBase = { key: string; sourceRoom: number; phase: "opening" | "revealed" };
type GiftReveal = (GiftRevealBase & { kind: "coins"; amount: number }) | (GiftRevealBase & { kind: "decoration"; itemId: DecorationId; itemRoom: number; name: string; image: string });
const PANEL_PREF_KEY = "meu-pet-panels-v2";
const SOUND_PREF_KEY = "meu-pet-sound-v2";
const VOICE_PREF_KEY = "meu-pet-voice-v2";
const FOCUS_MODE_PREF_KEY = "meu-pet-focus-mode-v1";
const DEFAULT_PANELS: CollapsedPanels = { stats: false, care: false, mission: false, shop: false };
const GameCanvas = lazy(() => import("@/components/GameCanvas"));

function loadGame(): GameState {
  try {
    const current = localStorage.getItem(CURRENT_SAVE_KEY);
    if (current) {
      const state = migrateGameState(JSON.parse(current));
      if (!state.profile && state.level > 1) {
        const archiveKey = "meu-pet-virtual-save-v2-archive";
        if (!localStorage.getItem(archiveKey)) localStorage.setItem(archiveKey, current);
        return createInitialGameState();
      }
      return state;
    }
    // An old campaign without a profile is preserved under its original key; this new story begins at level 1.
    if (LEGACY_SAVE_KEYS.some((key) => localStorage.getItem(key))) return createInitialGameState();
    if (localStorage.getItem("pet_estado")) return createInitialGameState();
  } catch {
    // Ignore malformed saves; prior storage is left intact and a new profile starts cleanly.
  }
  return createInitialGameState();
}

function loadPanels(): CollapsedPanels {
  try { return { ...DEFAULT_PANELS, ...(JSON.parse(localStorage.getItem(PANEL_PREF_KEY) || "{}") as Partial<CollapsedPanels>) }; }
  catch { return DEFAULT_PANELS; }
}

function createDemoGameState(): GameState {
  const base = setPetProfile(createInitialGameState(), { name: "Pudim", age: 2, gender: "menino", characterId: "menino-prata" });
  const demoNow = Date.now();
  return {
    ...base,
    skin: "laranja",
    ownedSkins: ["tigrinho", "laranja"],
    level: 3,
    xp: 160,
    xpMax: 338,
    coins: 920,
    missionProgress: 2,
    missionsCompleted: 2,
    gamesPlayed: 7,
    stats: { felicidade: 82, fome: 58, higiene: 84, energia: 67 },
    inventory: { sardinha: 2, novelo: 1, banho: 1, caminha: 0 },
    ownedCompanions: ["mimi"],
    activeCompanionId: "mimi",
    activeRoom: 1,
    decorInventory: { ...base.decorInventory, tower: 0, bed: 0, plant: 0, lamp: 0 },
    roomDecorations: { "1": [
      { id: "demo-tower", itemId: "tower", x: 40, y: 46, rotation: 0, anchor: "background" },
      { id: "demo-bed", itemId: "bed", x: 60, y: 46, rotation: 0, anchor: "background" },
      { id: "demo-plant", itemId: "plant", x: 50, y: 36, rotation: 0, anchor: "background" },
    ] },
    gifts: [{ id: "demo-gift", room: 1, x: 0.18, spawnedAt: demoNow, expiresAt: demoNow + 90000, reward: "coins", coins: 110 }],
    tutorialComplete: true,
  };
}

function getRequestedDemoGame(): MiniGameId | null {
  const requested = new URLSearchParams(window.location.search).get("play");
  return MINI_GAMES.find((item) => item.id === requested)?.id ?? null;
}

const statMeta = [
  { key: "felicidade", label: "Felicidade", icon: "💗", color: "pink" },
  { key: "fome", label: "Fome", icon: "🍲", color: "gold" },
  { key: "higiene", label: "Higiene", icon: "💧", color: "cyan" },
  { key: "energia", label: "Energia", icon: "⚡", color: "violet" },
] as const;
const companionMeta: Array<{ id: CompanionId; name: string; species: string; unlock: number; image: string; icon: string }> = [
  { id: "mimi", name: "Mimi", species: "gatinha laranja", unlock: 3, image: GAME_ASSETS.companions.mimi, icon: "🐱" },
  { id: "tico", name: "Tico", species: "cachorrinho creme", unlock: 7, image: GAME_ASSETS.companions.tico, icon: "🐶" },
];

function dispatchPetEvent(name: string, detail: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function CollapseButton({ collapsed, onClick, label }: { collapsed: boolean; onClick: () => void; label: string }) {
  return <button className="panel-collapse" type="button" onClick={onClick} aria-label={`${collapsed ? "Expandir" : "Minimizar"} ${label}`} aria-expanded={!collapsed}><ChevronDown size={16} /></button>;
}

export default function Home() {
  const demoMode = useMemo(() => ["1", "platformer"].includes(new URLSearchParams(window.location.search).get("demo") ?? ""), []);
  const platformerDemoMode = useMemo(() => new URLSearchParams(window.location.search).get("demo") === "platformer", []);
  const demoMiniGame = useMemo(() => demoMode ? getRequestedDemoGame() : null, [demoMode]);
  const [game, setGame] = useState<GameState>(() => demoMode ? createDemoGameState() : loadGame());
  const [adventureOpen, setAdventureOpen] = useState(() => platformerDemoMode);
  const [activeTab, setActiveTab] = useState<"care" | "games" | "shop">(demoMiniGame ? "games" : "care");
  const [gamesOpen, setGamesOpen] = useState(Boolean(demoMiniGame));
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<ShopTab>("items");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem(SOUND_PREF_KEY) !== "false");
  const [voiceOn, setVoiceOn] = useState(() => localStorage.getItem(VOICE_PREF_KEY) !== "false");
  const [collapsed, setCollapsed] = useState<CollapsedPanels>(loadPanels);
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem(FOCUS_MODE_PREF_KEY) === "true");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [storyLevel, setStoryLevel] = useState<number | null>(null);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [selectedDecorationId, setSelectedDecorationId] = useState<string | null>(null);
  const [pendingDecoration, setPendingDecoration] = useState<DecorationId | null>(null);
  const [giftClock, setGiftClock] = useState(Date.now());
  const [giftNextSpawnAt, setGiftNextSpawnAt] = useState(() => Date.now() + 150_000);
  const [giftReveal, setGiftReveal] = useState<GiftReveal | null>(null);
  const [creatorInfoOpen, setCreatorInfoOpen] = useState(false);
  const [previewCharacter, setPreviewCharacter] = useState<{ gender: PetGender; characterId: PetProfile["characterId"] } | null>(null);
  const [toast, setToast] = useState("");
  const [petLine, setPetLine] = useState("");
  const [petSpeechVisible, setPetSpeechVisible] = useState(false);
  const [showPetName, setShowPetName] = useState(false);
  const [miniId, setMiniId] = useState<MiniGameId | null>(demoMiniGame);
  const audioRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const placementMigrationRef = useRef(false);
  const petSpeechTimerRef = useRef<number | null>(null);
  const petSpeechClearTimerRef = useRef<number | null>(null);
  const petNameTimerRef = useRef<number | null>(null);
  const giftRevealTimerRef = useRef<number | null>(null);
  const photoBusyRef = useRef(false);
  const adventureEnteredAtRef = useRef<number | null>(!demoMode ? Date.now() : null);
  const petTapAreaRef = useRef<HTMLButtonElement>(null);
  const petSpeechElementRef = useRef<HTMLDivElement>(null);
  const petNameplateRef = useRef<HTMLDivElement>(null);
  const previousLevelRef = useRef(game.level);
  const voiceOnRef = useRef(voiceOn);

  const currentChapter = getCampaignLevel(game.level);
  const xpPercent = Math.min(100, (game.xp / Math.max(1, game.xpMax)) * 100);
  const missionPercent = Math.min(100, (game.missionProgress / 3) * 100);
  const petName = game.profile?.name || "meu pet";
  const profileCharacter = game.profile ? PET_CHARACTERS.find((item) => item.id === game.profile?.characterId) : undefined;
  const currentCompanion = companionMeta.find((item) => item.id === game.activeCompanionId);
  const currentMini = useMemo(() => MINI_GAMES.find((item) => item.id === miniId), [miniId]);
  const storyChapter = storyLevel ? getCampaignLevel(storyLevel) : null;
  const activeChapter = getCampaignLevel(game.activeRoom);
  const roomDecorations = game.roomDecorations[String(game.activeRoom)] ?? [];
  const roomDecorationCatalog = DECORATIONS.filter((item) => item.room === game.activeRoom);
  const roomGifts = game.gifts.filter((gift) => gift.room === game.activeRoom);

  useEffect(() => { if (!demoMode) localStorage.setItem(CURRENT_SAVE_KEY, JSON.stringify(game)); }, [game, demoMode]);
  useEffect(() => {
    if (placementMigrationRef.current) return;
    const stage = document.querySelector<HTMLElement>(".center-stage");
    if (!stage) return;
    placementMigrationRef.current = true;
    const rect = stage.getBoundingClientRect();
    setGame((current) => {
      let changed = false;
      const migratedRooms = Object.fromEntries(Object.entries(current.roomDecorations).map(([room, placements]) => [
        room,
        placements.map((placement) => {
          if (placement.anchor === "background") return placement;
          changed = true;
          return { ...placement, ...legacyStagePercentToBackground({ x: placement.x, y: placement.y }, rect), anchor: "background" as const };
        }),
      ]));
      return changed ? { ...current, roomDecorations: migratedRooms } : current;
    });
  }, []);
  useEffect(() => { localStorage.setItem(PANEL_PREF_KEY, JSON.stringify(collapsed)); }, [collapsed]);
  useEffect(() => { localStorage.setItem(SOUND_PREF_KEY, String(soundOn)); }, [soundOn]);
  useEffect(() => { localStorage.setItem(VOICE_PREF_KEY, String(voiceOn)); }, [voiceOn]);
  useEffect(() => { localStorage.setItem(FOCUS_MODE_PREF_KEY, String(focusMode)); }, [focusMode]);
  useEffect(() => { voiceOnRef.current = voiceOn; }, [voiceOn]);

  useEffect(() => {
    const followPet = (event: Event) => {
      const detail = (event as CustomEvent<{ x: number; y: number; width: number; height: number }>).detail;
      const stage = document.querySelector<HTMLElement>(".center-stage");
      if (!stage || !detail) return;
      const rect = stage.getBoundingClientRect();
      const x = detail.x - rect.left;
      const y = detail.y - rect.top;
      const tapArea = petTapAreaRef.current;
      if (tapArea) {
        tapArea.style.left = `${x}px`;
        tapArea.style.top = `${y}px`;
        tapArea.style.width = `${detail.width}px`;
        tapArea.style.height = `${detail.height}px`;
        tapArea.dataset.positioned = "true";
      }
      const petTop = y - detail.height / 2;
      if (petSpeechElementRef.current) {
        petSpeechElementRef.current.style.left = `${x}px`;
        petSpeechElementRef.current.style.top = `${Math.max(16, petTop - 24)}px`;
      }
      if (petNameplateRef.current) {
        petNameplateRef.current.style.left = `${x}px`;
        petNameplateRef.current.style.top = `${Math.max(16, petTop + 6)}px`;
      }
    };
    window.addEventListener("pet:hitbox", followPet);
    return () => window.removeEventListener("pet:hitbox", followPet);
  }, []);

  useEffect(() => {
    if (game.profile && !game.tutorialComplete) setTutorialOpen(true);
  }, [game.profile, game.tutorialComplete]);

  useEffect(() => {
    const prior = previousLevelRef.current;
    if (game.level > prior) {
      dispatchPetEvent("pet:level", { level: game.level });
      setGamesOpen(false); setShopOpen(false); setSettingsOpen(false); setProfileOpen(false); setPaused(false); setTutorialOpen(false); setRoomsOpen(false);
      setMiniId(null); setSelectedDecorationId(null); setPendingDecoration(null); setActiveTab("care");
      setStoryLevel(game.level);
      showPetSpeech(`Conseguimos! A casa agora é: ${getCampaignLevel(game.level).location}.`, 9000);
      dispatchPetEvent("pet:action", { action: "level" });
      if (voiceOnRef.current) playPetVoice("level", game.profile?.gender, dismissPetSpeech);
    }
    previousLevelRef.current = game.level;
  }, [game.level, game.profile?.gender]);

  useEffect(() => {
    if (!game.profile) return;
    const timer = window.setInterval(() => {
      if (!adventureOpen && !paused && !gamesOpen && !shopOpen && !settingsOpen && !tutorialOpen && storyLevel === null) setGame((current) => tickPet(current));
    }, 45000);
    return () => window.clearInterval(timer);
  }, [game.profile, adventureOpen, paused, gamesOpen, shopOpen, settingsOpen, tutorialOpen, storyLevel]);

  useEffect(() => {
    if (!game.profile || demoMode || adventureOpen || paused || gamesOpen || shopOpen || settingsOpen || tutorialOpen || storyLevel !== null) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setGiftClock(now);
      const giftId = `gift-${now}-${Math.random().toString(36).slice(2, 8)}`;
      setGame((current) => {
        const next = expireGifts(current, now);
        return now >= giftNextSpawnAt ? spawnSurpriseGift(next, giftId, now) : next;
      });
      if (now >= giftNextSpawnAt) setGiftNextSpawnAt(now + 270_000 + Math.floor(Math.random() * 180_000));
    }, 15000);
    return () => window.clearInterval(timer);
  }, [game.profile, demoMode, adventureOpen, paused, gamesOpen, shopOpen, settingsOpen, tutorialOpen, storyLevel, giftNextSpawnAt]);

  useEffect(() => {
    if (!game.gifts.length || adventureOpen) return;
    const timer = window.setInterval(() => {
      setGiftClock(Date.now());
      setGame((current) => expireGifts(current));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [game.gifts.length, adventureOpen]);

  useEffect(() => {
    const syncScene = () => {
      dispatchPetEvent("pet:room", { room: game.activeRoom });
      dispatchPetEvent("pet:decorations", { placements: roomDecorations.filter((placement) => placement.id !== selectedDecorationId) });
    };
    window.addEventListener("pet:scene-ready", syncScene);
    syncScene();
    return () => window.removeEventListener("pet:scene-ready", syncScene);
  }, [game.activeRoom, game.roomDecorations, selectedDecorationId]);

  useEffect(() => {
    const syncPetAppearance = () => {
      const currentProfile = game.profile ?? previewCharacter;
      if (currentProfile) dispatchPetEvent("pet:profile", { gender: currentProfile.gender, characterId: currentProfile.characterId });
      dispatchPetEvent("pet:skin", { skinId: game.skin });
      dispatchPetEvent("pet:companion", { companionId: game.activeCompanionId });
    };
    window.addEventListener("pet:scene-ready", syncPetAppearance);
    syncPetAppearance();
    return () => window.removeEventListener("pet:scene-ready", syncPetAppearance);
  }, [game.profile, previewCharacter, game.skin, game.activeCompanionId]);

  useEffect(() => () => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    if (petSpeechTimerRef.current !== null) window.clearTimeout(petSpeechTimerRef.current);
    if (petSpeechClearTimerRef.current !== null) window.clearTimeout(petSpeechClearTimerRef.current);
    if (petNameTimerRef.current !== null) window.clearTimeout(petNameTimerRef.current);
    if (giftRevealTimerRef.current !== null) window.clearTimeout(giftRevealTimerRef.current);
    if (audioRef.current) void audioRef.current.close();
    stopPetVoice();
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2700);
  }

  async function saveScenePhoto() {
    if (photoBusyRef.current) return;
    if (selectedDecorationId || pendingDecoration) {
      showToast("Fixe ou cancele o item em edição para fotografar a cena completa.");
      return;
    }
    photoBusyRef.current = true;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error("A captura demorou demais.")), 10000);
        window.dispatchEvent(new CustomEvent("pet:capture-photo", { detail: {
          resolve: (value: string) => { window.clearTimeout(timer); resolve(value); },
          reject: (error: Error) => { window.clearTimeout(timer); reject(error); },
        } }));
      });
      const blob = await (await fetch(dataUrl)).blob();
      const filename = `meu-pet-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      let canShareFile = false;
      try { canShareFile = typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }); } catch { /* Fallback to a regular PNG download. */ }
      if (canShareFile && navigator.share) {
        try {
          await navigator.share({ files: [file], title: "Meu Pet Virtual", text: "Meu pet e sua casa!" });
          showToast("Foto pronta! Escolha Fotos ou Galeria na partilha para salvá-la.");
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            showToast("Compartilhamento cancelado.");
            return;
          }
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      showToast("Foto PNG baixada. Abra a imagem em Fotos/Galeria para adicioná-la.");
    } catch {
      showToast("Não consegui capturar a foto agora. Tente novamente.");
    } finally {
      photoBusyRef.current = false;
    }
  }

  function dismissPetSpeech() {
    if (petSpeechTimerRef.current !== null) window.clearTimeout(petSpeechTimerRef.current);
    petSpeechTimerRef.current = null;
    setPetSpeechVisible(false);
    if (petSpeechClearTimerRef.current !== null) window.clearTimeout(petSpeechClearTimerRef.current);
    petSpeechClearTimerRef.current = window.setTimeout(() => setPetLine(""), 520);
  }

  function showPetSpeech(message: string, fallbackMs = 5600) {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    if (petSpeechTimerRef.current !== null) window.clearTimeout(petSpeechTimerRef.current);
    if (petSpeechClearTimerRef.current !== null) window.clearTimeout(petSpeechClearTimerRef.current);
    setPetLine(cleanMessage);
    setPetSpeechVisible(true);
    petSpeechTimerRef.current = window.setTimeout(dismissPetSpeech, fallbackMs);
  }

  function revealPetName() {
    if (!game.profile) return;
    setShowPetName(true);
    dispatchPetEvent("pet:blink", {});
    if (petNameTimerRef.current !== null) window.clearTimeout(petNameTimerRef.current);
    petNameTimerRef.current = window.setTimeout(() => setShowPetName(false), 2600);
  }

  function playTone(kind: "care" | "reward" = "care") {
    if (!soundOn) return;
    try {
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;
      const context = audioRef.current ?? new AudioContextClass();
      audioRef.current = context;
      if (context.state === "suspended") void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = kind === "reward" ? 780 : 520;
      gain.gain.setValueAtTime(0.045, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.13);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.13);
    } catch { /* Sound effects are an optional enhancement. */ }
  }

  function speak(cue: PetVoiceCue, onEnd?: () => void) { if (voiceOn) playPetVoice(cue, game.profile?.gender, onEnd); }
  function togglePanel(key: keyof CollapsedPanels) { setCollapsed((value) => ({ ...value, [key]: !value[key] })); }

  function placeDecorationAt(clientX: number, clientY: number) {
    if (!pendingDecoration) return;
    const { x, y } = screenToBackgroundPercent(clientX, clientY);
    const id = globalThis.crypto?.randomUUID?.() ?? `decor-${Date.now()}`;
    const result = placeDecoration(game, { id, itemId: pendingDecoration, x, y, rotation: 0, anchor: "background" });
    if (!result.ok) { showToast(result.message); return; }
    setGame(result.state); setPendingDecoration(null); setSelectedDecorationId(null); showToast(result.message); playTone("reward");
  }

  function handleStageClick(event: MouseEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (pendingDecoration) { placeDecorationAt(event.clientX, event.clientY); return; }
    setSelectedDecorationId(null);
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(7, Math.min(93, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(15, Math.min(86, ((event.clientY - bounds.top) / bounds.height) * 100));
    dispatchPetEvent("pet:move", { x, y });
  }

  function petTap(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    if (pendingDecoration) { event.stopPropagation(); placeDecorationAt(event.clientX, event.clientY); return; }
    care("love", false);
    if (game.profile) {
      revealPetName();
      const line = "Adorei esse cafuné! Meu dia ficou mais feliz!";
      showPetSpeech(line, 7200);
      if (voiceOn) playPetVoice("tap", game.profile.gender, dismissPetSpeech);
    }
  }

  function selectHouse(room: number) {
    setGame((current) => selectRoom(current, room));
    setRoomsOpen(false); setShopOpen(false); setGamesOpen(false); setMiniId(null); setSelectedDecorationId(null); setPendingDecoration(null);
    showPetSpeech(`Vamos passear de volta para ${getCampaignLevel(room).location}!`);
    dispatchPetEvent("pet:room", { room });
  }

  function buyOrEquipDecoration(id: DecorationId) {
    const stageId = getDecorationStageId(id);
    if (!stageId || !game.platformProgress.completedStages.includes(stageId)) {
      showToast(`🔒 Vença a fase ${stageId ?? "correspondente"} na Aventura para liberar este item.`);
      return;
    }
    const item = DECORATIONS.find((entry) => entry.id === id);
    if (item && item.room !== game.activeRoom) {
      showToast(`${item.name} pertence à Casa ${item.room}.`);
      return;
    }
    if (game.decorInventory[id] > 0) {
      setPendingDecoration(id); setSelectedDecorationId(null); setShopOpen(false);
      showPetSpeech("Escolha um cantinho da casa para colocar seu mimo.");
      showToast("Toque no cenário para colocar; depois toque no item para ajustar ou fixar.");
      return;
    }
    const result = buyDecoration(game, id);
    if (result.ok) { setGame(result.state); showToast(result.message); playTone("reward"); }
    else showToast(result.message);
  }

  function moveDecoration(id: string, patch: Partial<Pick<DecorationPlacement, "x" | "y" | "rotation" | "anchor">>) {
    setGame((current) => updateDecoration(current, id, patch));
  }

  function collectGift(id: string) {
    const gift = game.gifts.find((item) => item.id === id);
    const result = collectSurpriseGift(game, id, giftClock);
    setGame(result.state);
    if (!result.ok) { showToast(result.message); return; }
    const key = gift?.id ?? id;
    const sourceRoom = gift?.room ?? game.activeRoom;
    const itemId = gift?.decorationId ?? "plant";
    const decorationGranted = gift?.reward === "decoration" && (result.state.decorInventory[itemId] ?? 0) > (game.decorInventory[itemId] ?? 0);
    if (decorationGranted) {
      const item = DECORATIONS.find((entry) => entry.id === itemId);
      setGiftReveal({ key, kind: "decoration", itemId, itemRoom: item?.room ?? sourceRoom, sourceRoom, phase: "opening", name: item?.name ?? "Novo mimo", image: GAME_ASSETS.decorations[itemId] ?? GAME_ASSETS.decorations.plant });
    } else {
      setGiftReveal({ key, kind: "coins", sourceRoom, phase: "opening", amount: result.state.coins - game.coins });
    }
    if (giftRevealTimerRef.current !== null) window.clearTimeout(giftRevealTimerRef.current);
    giftRevealTimerRef.current = window.setTimeout(() => {
      setGiftReveal((current) => current?.key === key ? { ...current, phase: "revealed" } : current);
      giftRevealTimerRef.current = window.setTimeout(() => setGiftReveal((current) => current?.key === key ? null : current), 15_500);
    }, 1_550);
    playTone("reward");
  }

  function closeGiftReveal() {
    if (giftRevealTimerRef.current !== null) window.clearTimeout(giftRevealTimerRef.current);
    giftRevealTimerRef.current = null;
    setGiftReveal(null);
  }

  function tapCompanion(id: CompanionId) {
    const lines = id === "mimi"
      ? ["Mimi: vim conferir se os petiscos estão em dia!", "Mimi: eu não ronrono… faço motorzinho de luxo!", "Mimi: quem trouxe o novelo? Pergunto para uma amiga."]
      : ["Tico: au-au! Ops, era para miar?", "Tico: farejei um biscoito a três casas daqui!", "Tico: prometo não perseguir o próprio rabo. Talvez."];
    const line = lines[Math.floor(Math.random() * lines.length)];
    showPetSpeech(line, 6500);
    if (voiceOn) playCompanionVoice(id, dismissPetSpeech);
  }

  function care(action: CareAction, announce = true) {
    const result = performCare(game, action);
    if (!result.ok) { showToast(result.message); return; }
    setGame(result.state);
    if (announce) showPetSpeech(`${petName}: ${result.message}`, 6800);
    dispatchPetEvent("pet:action", { action, sleeping: result.state.sleeping });
    playTone();
    if (announce && (action === "food" || action === "love")) speak("care", dismissPetSpeech);
  }

  function handleProfile(profile: PetProfile) {
    setPreviewCharacter(null);
    setGame((current) => setPetProfile(current, profile));
    adventureEnteredAtRef.current = null;
    setAdventureOpen(false);
    showPetSpeech(`Miau! Oi, ${profile.name}! Eu adorei esse nome!`, 8000);
    dispatchPetEvent("pet:profile", { gender: profile.gender, characterId: profile.characterId });
    dispatchPetEvent("pet:action", { action: "love" });
  }

  function completeTutorial() {
    setGame((current) => ({ ...current, tutorialComplete: true }));
    setTutorialOpen(false);
    showToast("Pronto! A aventura começa no primeiro capítulo.");
  }

  function completeAdventureTutorial() {
    setGame((current) => ({ ...current, tutorialComplete: true }));
    setTutorialOpen(false);
  }

  function completeAdventureStage(stageId: number, stars: number, coins: number) {
    const result = completePlatformStage(game, stageId, stars, coins);
    if (result.ok) setGame(result.state);
    return result;
  }

  function openMiniHub() { setActiveTab("games"); setGamesOpen(true); setMiniId(null); }
  function openAdventure() { adventureEnteredAtRef.current = Date.now(); setAdventureOpen(true); }
  function closeAdventure() {
    const enteredAt = adventureEnteredAtRef.current;
    if (enteredAt !== null) {
      const awayFor = Math.max(0, Date.now() - enteredAt);
      if (awayFor > 0) setGame((current) => ({ ...current, gifts: current.gifts.map((gift) => ({ ...gift, spawnedAt: gift.spawnedAt + awayFor, expiresAt: gift.expiresAt + awayFor })) }));
    }
    adventureEnteredAtRef.current = null;
    setAdventureOpen(false);
  }
  function openShop(tab: ShopTab = shopTab) { setActiveTab("shop"); setShopTab(tab); setShopOpen(true); }
  function selectCareTab() { setActiveTab("care"); setGamesOpen(false); setShopOpen(false); }
  function startMinigame(id: MiniGameId) { setMiniId(id); playTone(); }

  function finishMinigame() {
    setGame((current) => {
      const next = completeMinigame(current);
      const levelsGained = next.level - current.level;
      return levelsGained > 0 ? { ...next, coins: next.coins + getCampaignLevel(next.level).reward } : next;
    });
    setMiniId(null);
    showToast(game.missionProgress >= 2 && !game.missionClaimed ? "Missão concluída! +200 moedas" : "Brincadeira concluída! +60 moedas, +80 XP e progresso salvo.");
    dispatchPetEvent("pet:action", { action: "play" });
    playTone("reward");
  }

  function chooseSkin(id: SkinId) {
    const result = buySkin(game, id);
    if (result.ok) { setGame(result.state); showToast(result.message); playTone("reward"); }
    else showToast(result.message);
  }

  function boost(stat: keyof GameState["stats"]) {
    const result = buyBoost(game, stat);
    if (result.ok) { setGame(result.state); showToast(result.message); playTone("reward"); }
    else showToast(result.message);
  }

  function purchaseItem(id: StoreItemId) {
    const result = buyStoreItem(game, id);
    if (result.ok) { setGame(result.state); showToast(result.message); playTone("reward"); }
    else showToast(result.message);
  }

  function consumeItem(id: StoreItemId) {
    const result = useStoreItem(game, id);
    if (result.ok) {
      setGame(result.state); showPetSpeech(result.message, 6800); showToast(result.message);
      dispatchPetEvent("pet:action", { action: id === "caminha" ? "sleep" : "love", sleeping: result.state.sleeping });
      speak("care", dismissPetSpeech); playTone("reward");
    } else showToast(result.message);
  }

  function selectCompanion(id: CompanionId | null) {
    const result = chooseCompanion(game, id);
    if (result.ok) {
      setGame(result.state); showToast(result.message);
      dispatchPetEvent("pet:companion", { companionId: id }); playTone("reward");
    } else showToast(result.message);
  }

  function startNewGame() {
    const current = localStorage.getItem(CURRENT_SAVE_KEY);
    if (current) localStorage.setItem(`meu-pet-virtual-save-v2-archive-${Date.now()}`, current);
    setGame(createInitialGameState());
    adventureEnteredAtRef.current = null;
    setAdventureOpen(false);
    setTutorialOpen(false);
    setStoryLevel(null);
    setSelectedDecorationId(null); setPendingDecoration(null); setProfileOpen(false);
    setSettingsOpen(false);
    setRoomsOpen(false);
    showToast("Novo jogo iniciado. Seu save anterior foi arquivado neste navegador.");
  }

  const closeGames = () => { setGamesOpen(false); setMiniId(null); };

  if (adventureOpen && game.profile) {
    return <PlatformAdventure
      state={game}
      soundOn={soundOn}
      onToggleSound={() => setSoundOn((value) => !value)}
      onGoToHouse={closeAdventure}
      onCompleteTutorial={completeAdventureTutorial}
      onCompleteStage={completeAdventureStage}
    />;
  }

  return (
    <div className={`game-root ${focusMode ? "focus-mode" : ""}`}>
      <Suspense fallback={<div className="scene-loading" aria-label="Carregando cenário do pet" />}><GameCanvas initialState={{ level: game.level, room: game.activeRoom, skin: game.skin, sleeping: game.sleeping, gender: game.profile?.gender ?? null, characterId: game.profile?.characterId ?? null, companion: game.activeCompanionId }} /></Suspense>
      <div className="room-overlay" aria-hidden="true" />
      <div className="screen-ui">
        <header className="topbar">
          <div className="brand-lockup"><span className="brand-paw"><PawPrint size={28} fill="currentColor" /></span><div><strong>Meu Pet</strong><small>UMA CASA DE CADA VEZ</small>{demoMode && <small className="demo-state">DEMO · SAVE PRESERVADO</small>}</div></div>
          <div className="level-card" aria-label={`Nível ${game.level}, ${game.xp} de ${game.xpMax} XP`}>
            <div className="level-heading"><span className="level-star"><Star size={23} fill="currentColor" /></span><strong>Nível {game.level}</strong><span className="xp-copy">{game.xp} / {game.xpMax} XP</span></div>
            <div className="xp-track"><span style={{ width: `${xpPercent}%` }} /></div>
            <button className="level-location room-map-button" onClick={() => setRoomsOpen(true)} aria-label="Abrir mapa das casas conquistadas"><MapPin size={11} /> {currentChapter.location}<span>{game.level}/10</span></button>
          </div>
          <div className="top-actions">
            <button className="adventure-home-button" type="button" onClick={openAdventure} aria-label="Voltar à aventura de 100 fases"><Gamepad2 size={17} /><span>Aventura</span></button>
            <button className="coin-pill" onClick={() => openShop("items")} aria-label="Abrir a loja de itens"><Coins size={21} fill="currentColor" /><strong>{game.coins.toLocaleString("pt-BR")}</strong><span className="coin-plus"><Plus size={15} /></span></button>
            <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Configurações"><Settings size={19} /></button>
            <button className="icon-button sound-toggle" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Desligar efeitos sonoros" : "Ligar efeitos sonoros"}>{soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</button>
            <button className="icon-button pause-toggle" onClick={() => setPaused(true)} aria-label="Pausar jogo"><span className="pause-symbol">Ⅱ</span></button>
            <button className="icon-button focus-mode-toggle" type="button" onClick={() => setFocusMode((value) => !value)} aria-pressed={focusMode} aria-label={focusMode ? "Mostrar todas as informações" : "Ativar tela limpa"} title={focusMode ? "Mostrar interface completa" : "Tela limpa"}>{focusMode ? <Eye size={19} /> : <EyeOff size={19} />}</button>
          </div>
        </header>

        <main className="dashboard-grid">
          <aside className="side-column side-left">
            <section className={`glass-panel stats-panel ${collapsed.stats ? "panel-is-collapsed" : ""}`}>
              <div className="panel-heading"><h2>Como estou?</h2><div className="panel-heading-actions"><span className="status-dot" /><CollapseButton collapsed={collapsed.stats} onClick={() => togglePanel("stats")} label="status" /></div></div>
              {!collapsed.stats && <div className="stats-list">{statMeta.map((item) => <div className="stat-row" key={item.key}><div className="stat-icon">{item.icon}</div><div className="stat-main"><div className="stat-label"><strong>{item.label}</strong><span>{Math.round(game.stats[item.key])}%</span></div><div className={`stat-track ${item.color}`}><span style={{ width: `${game.stats[item.key]}%` }} /></div></div></div>)}</div>}
            </section>
            <section className={`glass-panel care-panel ${collapsed.care ? "panel-is-collapsed" : ""}`}>
              <div className="panel-heading"><h2>Cuidar</h2><div className="panel-heading-actions"><span className="panel-caption">um gesto de carinho</span><CollapseButton collapsed={collapsed.care} onClick={() => togglePanel("care")} label="cuidados" /></div></div>
              {!collapsed.care && <div className="care-grid">
                <button className="care-button feed" onClick={() => care("food")}><span>🍎</span><b>Alimentar</b><small>18 moedas</small></button>
                <button className="care-button bath" onClick={() => care("bath")}><span><Bath size={22} /></span><b>Banho</b><small>12 moedas</small></button>
                <button className="care-button love" onClick={() => care("love")}><span><Heart size={22} fill="currentColor" /></span><b>Carinho</b><small>grátis</small></button>
                <button className={`care-button sleep ${game.sleeping ? "sleeping" : ""}`} onClick={() => care("sleep")}><span><Moon size={22} fill="currentColor" /></span><b>{game.sleeping ? "Acordar" : "Dormir"}</b><small>recupera energia</small></button>
              </div>}
              {!collapsed.care && <button className="care-inventory-link" onClick={() => openShop("items")}>Usar item da mochila <ChevronRight size={15} /></button>}
            </section>
          </aside>

          <section className="center-stage" aria-label={`Cenário de ${activeChapter.location}`} onClick={handleStageClick}>
            <div className="stage-location-tag"><HomeIcon size={13} /><span>CASA {game.activeRoom}</span><i />{activeChapter.location}</div>
            <CreatorPlaquePicker onOpen={() => setCreatorInfoOpen(true)} />
            {currentCompanion && <button className="stage-companion-tag" type="button" onClick={() => tapCompanion(currentCompanion.id)} aria-label={`Ouvir ${currentCompanion.name}`}><span>✦</span> {currentCompanion.name}: toque para ouvir</button>}
            {roomDecorations.filter((placement) => placement.id !== selectedDecorationId).map((placement) => <SceneDecorationPicker key={`picker-${placement.id}`} placement={placement} onSelect={() => setSelectedDecorationId(placement.id)} />)}
            {roomDecorations.filter((placement) => selectedDecorationId === placement.id).map((placement) => <SceneDecoration key={placement.id} placement={placement} image={GAME_ASSETS.decorations[placement.itemId]} selected onSelect={() => setSelectedDecorationId(placement.id)} onFix={() => setSelectedDecorationId(null)} onMove={moveDecoration} onRemove={(id) => { setSelectedDecorationId(null); setGame((current) => removeDecoration(current, id)); showToast("Item guardado novamente na mochila."); }} />)}
            {roomGifts.map((gift) => <SceneGift key={gift.id} gift={gift} image={GAME_ASSETS.gift} now={giftClock} onCollect={collectGift} />)}
            <div className="stage-toolbar" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={() => setRoomsOpen(true)}><MapPin size={14} /> Casas</button>
              <button type="button" onClick={() => { setSelectedDecorationId(null); setPendingDecoration(null); openShop("decor"); }}><Sparkles size={14} /> Decorar</button>
            </div>
            <button className="scene-photo-button" type="button" onClick={(event) => { event.stopPropagation(); void saveScenePhoto(); }} aria-label="Salvar foto limpa do cenário e do pet" title="Salvar foto limpa"><Camera size={16} /></button>
            {pendingDecoration && <div className="placement-nudge"><Sparkles size={14} /> Toque onde quer colocar o item</div>}
            {petLine && <div ref={petSpeechElementRef} className={`pet-speech ${petSpeechVisible ? "is-visible" : "is-fading"}`} role="status" aria-live="polite">{petLine}</div>}
            {game.profile && <div ref={petNameplateRef} className={`pet-nameplate ${showPetName ? "is-visible" : ""}`} aria-hidden={!showPetName}><span className="online-dot" /> {game.profile.name}</div>}
            <div className="stage-hint"><Sparkles size={14} /> {pendingDecoration ? "Toque no cenário para colocar o item" : selectedDecorationId ? "Arraste para ajustar · toque em Fixar ao terminar" : "Toque no cenário para passear · toque no pet para carinho"}</div>
            <button ref={petTapAreaRef} className="pet-tap-area" onClick={petTap} aria-label={`Fazer carinho em ${petName}`} />
          </section>

          <aside className="side-column side-right">
            <section className={`mission-card ${collapsed.mission ? "panel-is-collapsed" : ""}`}>
              <div className="mission-heading"><span className="mission-star"><Star size={24} fill="currentColor" /></span><div><small>MISSÃO DO NÍVEL {game.level}</small><h2>{game.missionClaimed ? "Desafio concluído!" : "Brincar faz bem"}</h2></div><CollapseButton collapsed={collapsed.mission} onClick={() => togglePanel("mission")} label="missão" /></div>
              {!collapsed.mission && <><p>Complete 3 minijogos para ganhar moedas e XP.</p><div className="mission-progress-row"><div className="mission-track"><span style={{ width: `${missionPercent}%` }} /></div><strong>{Math.min(game.missionProgress, 3)}/3</strong></div><div className="mission-reward"><span>Recompensa</span><strong><Coins size={17} fill="currentColor" /> +200</strong></div><button className="mission-button" onClick={openMiniHub}>{game.missionClaimed ? "Jogar de novo" : "Ver minijogos"}<ChevronRight size={16} /></button></>}
            </section>
            <section className={`glass-panel shop-preview ${collapsed.shop ? "panel-is-collapsed" : ""}`}>
              <div className="panel-heading"><h2><ShoppingBag size={19} /> Loja</h2><div className="panel-heading-actions"><button className="text-link" onClick={() => openShop("items")}>Ver tudo <ChevronRight size={14} /></button><CollapseButton collapsed={collapsed.shop} onClick={() => togglePanel("shop")} label="loja" /></div></div>
              {!collapsed.shop && <><div className="shop-shortcuts">
                <button onClick={() => openShop("looks")}><span>🎀</span><small>Visuais</small></button>
                <button onClick={() => openShop("items")}><span>🐟</span><small>Itens</small></button>
                <button onClick={() => openShop("boosts")}><span>⚡</span><small>Boosts</small></button>
                <button onClick={() => openShop("friends")}><span>🐾</span><small>Amigos</small></button>
              </div><div className="shop-nudge"><span>✨</span><p>Moedas virtuais viram mimos, cuidados e novos companheiros.</p></div></>}
            </section>
            <button className="chapter-shortcut" onClick={() => setStoryLevel(game.level)}><BookOpen size={17} /><span><small>SUA HISTÓRIA</small><strong>{currentChapter.title}</strong></span><ChevronRight size={17} /></button>
          </aside>
        </main>

        <nav className="bottom-nav" aria-label="Navegação do jogo">
          <button className={`nav-item ${activeTab === "care" ? "active care-active" : ""}`} onClick={selectCareTab}><span><PawPrint size={20} fill="currentColor" /></span><b>Cuidar</b></button>
          <button className={`nav-item ${activeTab === "games" ? "active games-active" : ""}`} onClick={openMiniHub}><span><Gamepad2 size={21} /></span><b>Minijogos <i>11</i></b></button>
          <button className={`nav-item ${activeTab === "shop" ? "active shop-active" : ""}`} onClick={() => openShop("items")}><span><ShoppingBag size={20} /></span><b>Loja</b></button>
        </nav>
      </div>

      {toast && <div className="toast-message" role="status"><Sparkles size={16} />{toast}</div>}
      {giftReveal && <div className="gift-reveal-layer" aria-live="polite" role="status"><div key={giftReveal.key} className={`gift-reveal-card ${giftReveal.phase === "revealed" ? "is-revealed" : "is-opening"}`}>
        <span className="gift-reveal-spark"><Sparkles size={18} /></span>
        {giftReveal.kind === "coins" ? <span className="gift-reveal-art coins-art"><Coins size={35} fill="currentColor" /></span> : <span className="gift-reveal-art"><img src={giftReveal.image} alt="" /></span>}
        <div className="gift-reveal-copy">
          <small>{giftReveal.phase === "opening" ? "ABRINDO PRESENTE" : "PRESENTE ABERTO"}</small>
          <strong>{giftReveal.phase === "opening" ? "Uma surpresa para você…" : giftReveal.kind === "coins" ? `+${giftReveal.amount} moedas` : giftReveal.name}</strong>
          {giftReveal.phase === "opening" ? <span>Espere só um pouquinho…</span> : giftReveal.kind === "coins" ? <span>Encontrado na Casa {giftReveal.sourceRoom} · {getCampaignLevel(giftReveal.sourceRoom).location}. Moedas adicionadas!</span> : <span>Encontrado na Casa {giftReveal.sourceRoom} · {getCampaignLevel(giftReveal.sourceRoom).location}. Decoração da Casa {giftReveal.itemRoom} · {getCampaignLevel(giftReveal.itemRoom).location}.</span>}
          {giftReveal.phase === "revealed" && <div className="gift-reveal-actions">
            {giftReveal.kind === "decoration" && <button className="gift-use-button" type="button" onClick={() => { closeGiftReveal(); buyOrEquipDecoration(giftReveal.itemId); }}>Usar · colocar na casa</button>}
            <button className="gift-close-button" type="button" onClick={closeGiftReveal} aria-label="Fechar recompensa">{giftReveal.kind === "decoration" ? "Depois" : <X size={14} />}</button>
          </div>}
        </div>
      </div></div>}

      {creatorInfoOpen && <CreatorTributeModal onClose={() => setCreatorInfoOpen(false)} />}

      {!game.profile && <OnboardingFlow profile={game.profile} onComplete={handleProfile} onHearIntro={() => { if (voiceOn) playPetVoice("intro"); }} onHearPet={(gender) => { if (voiceOn) playPetVoice("welcome", gender); }} onPreviewPet={(gender, characterId) => setPreviewCharacter({ gender, characterId })} />}
      {tutorialOpen && game.profile && <TutorialOverlay onComplete={completeTutorial} onClose={completeTutorial} />}

      {roomsOpen && <div className="modal-backdrop room-map-backdrop" onClick={() => setRoomsOpen(false)}><section className="modal-card room-map-card" role="dialog" aria-modal="true" aria-labelledby="room-map-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setRoomsOpen(false)} aria-label="Fechar mapa"><X size={18} /></button><span className="modal-kicker">CADA CASA GUARDA UMA HISTÓRIA</span><h2 id="room-map-title">Voltar para uma casa</h2><p className="modal-subtitle">As casas conquistadas continuam decoradas. A próxima será liberada ao subir de nível.</p><div className="room-map-grid">{CAMPAIGN_LEVELS.slice(0, game.level).map((chapter) => <button type="button" key={chapter.level} className={`room-map-item ${game.activeRoom === chapter.level ? "current" : ""}`} onClick={() => selectHouse(chapter.level)} style={{ backgroundImage: `linear-gradient(180deg,rgba(7,17,42,.18),rgba(7,17,42,.92)),url(${GAME_ASSETS.levels[chapter.level - 1]})` }}><span>CASA {chapter.level}</span><strong>{chapter.location}</strong><small>{chapter.title}</small>{game.activeRoom === chapter.level && <i>Você está aqui</i>}</button>)}</div><p className="room-map-note"><MapPin size={14} /> {game.level} de 10 casas desbloqueadas · progresso: nível {game.level}</p></section></div>}

      {storyChapter && storyLevel !== null && <div className="modal-backdrop story-backdrop"><section className="modal-card story-card" role="dialog" aria-modal="true" aria-labelledby="story-title"><button className="modal-close" onClick={() => setStoryLevel(null)} aria-label="Fechar história"><X size={18} /></button><div className="story-art-ribbon"><span>✦</span><span>✧</span><span>✦</span><span>✧</span></div><span className="modal-kicker">CAPÍTULO {storyChapter.level} · {storyChapter.location.toUpperCase()}</span><div className="story-level-medallion"><Star size={27} fill="currentColor" /></div><h2 id="story-title">{storyChapter.title}</h2><p className="story-copy">{storyChapter.story.replace(/Pudim/g, petName)}</p>{storyChapter.companionUnlock && <div className="story-friend-card"><img src={storyChapter.companionUnlock === "mimi" ? GAME_ASSETS.companions.mimi : GAME_ASSETS.companions.tico} alt={storyChapter.companionUnlock === "mimi" ? "Mimi, a gatinha companheira" : "Tico, o cachorrinho companheiro"} /><div><small>NOVO AMIGO DA TURMA</small><strong>{storyChapter.companionUnlock === "mimi" ? "Mimi chegou!" : "Tico chegou!"}</strong><span>Agora ele participa das aventuras.</span></div><Check size={18} /></div>}<div className="story-reward-line"><span><Coins size={17} fill="currentColor" /> Bônus deste capítulo</span><strong>+{storyChapter.reward} moedas</strong></div><button className="primary-action story-continue" onClick={() => { setStoryLevel(null); showPetSpeech("Que tal conhecer a próxima aventura?"); }}>Explorar esta casa <ChevronRight size={17} /></button><p className="story-progress-note">{storyChapter.level < 10 ? `O primeiro arco tem 10 níveis. O próximo lugar: ${CAMPAIGN_LEVELS[storyChapter.level].location}.` : "Primeiro arco completo. Mais histórias podem ser adicionadas depois."}</p></section></div>}

      {paused && <div className="modal-backdrop"><section className="modal-card pause-card" role="dialog" aria-modal="true" aria-labelledby="pause-title"><button className="modal-close" onClick={() => setPaused(false)} aria-label="Fechar"><X size={18} /></button><span className="modal-hero-icon">Ⅱ</span><h2 id="pause-title">Pausa para um cafuné</h2><p>{petName} está esperando por você.</p><button className="primary-action" onClick={() => setPaused(false)}>Continuar brincando</button></section></div>}

      {settingsOpen && <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}><section className="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSettingsOpen(false)} aria-label="Fechar"><X size={18} /></button><span className="modal-kicker">MEU PET VIRTUAL</span><h2 id="settings-title">Configurações</h2><p className="modal-subtitle">Deixe a brincadeira do seu jeito.</p>{game.profile && <button className="setting-row profile-setting" onClick={() => { setSettingsOpen(false); setProfileOpen(true); }}><span className="setting-icon"><PawPrint size={19} /></span><span><strong>Perfil do pet</strong><small>{game.profile.name} · {game.profile.age} {game.profile.age === 1 ? "ano" : "anos"}</small></span><ChevronRight size={17} /></button>}<button className="setting-row" onClick={() => setSoundOn((value) => !value)}><span className="setting-icon">{soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</span><span><strong>Efeitos sonoros</strong><small>{soundOn ? "Ligados" : "Desligados"}</small></span><span className={`toggle ${soundOn ? "on" : ""}`} /></button><button className="setting-row" onClick={() => setVoiceOn((value) => !value)}><span className="setting-icon">{voiceOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</span><span><strong>Voz do pet em português</strong><small>{voiceOn ? "Falas e reações ligadas" : "Desligada"}</small></span><span className={`toggle ${voiceOn ? "on" : ""}`} /></button><button className="setting-row guide-setting" onClick={() => { setSettingsOpen(false); setTutorialOpen(true); }}><span className="setting-icon"><BookOpen size={19} /></span><span><strong>Como jogar</strong><small>Reabrir o guia passo a passo</small></span><ChevronRight size={17} /></button><button className="secondary-action reset-action" onClick={startNewGame}><span>↻</span> Começar um novo jogo</button><p className="privacy-note">Seu progresso fica salvo neste navegador. Saves da versão anterior não são apagados.</p></section></div>}
      {profileOpen && game.profile && <div className="modal-backdrop profile-backdrop" onClick={() => setProfileOpen(false)}><section className="modal-card profile-card" role="dialog" aria-modal="true" aria-labelledby="profile-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setProfileOpen(false)} aria-label="Fechar perfil"><X size={18} /></button><span className="modal-kicker">FICHA DO COMPANHEIRO</span><div className="profile-hero"><div className="profile-avatar"><img src={GAME_ASSETS.characters[game.profile.characterId]} alt={game.profile.name} /></div><div><h2 id="profile-title">{game.profile.name}</h2><p>{profileCharacter?.name ?? "Meu gatinho"} · {game.profile.gender === "menina" ? "menina" : "menino"}</p><small>{profileCharacter?.description}</small></div></div><div className="profile-facts"><div className="profile-fact"><small>Idade</small><strong>{game.profile.age} {game.profile.age === 1 ? "ano" : "anos"}</strong></div><div className="profile-fact"><small>Nível</small><strong>{game.level} de 10</strong></div><div className="profile-fact"><small>Casa atual</small><strong>{activeChapter.location}</strong></div><div className="profile-fact"><small>Experiência</small><strong>{game.xp} / {game.xpMax} XP</strong></div><div className="profile-fact"><small>Moedas</small><strong>{game.coins.toLocaleString("pt-BR")}</strong></div><div className="profile-fact"><small>Companheiro</small><strong>{currentCompanion?.name ?? "Só nós dois"}</strong></div></div><h3 className="profile-section-title">Como está hoje</h3><div className="profile-stat-list">{statMeta.map((item) => <div className="profile-stat" key={item.key}><span>{item.icon} {item.label}</span><div className={`stat-track ${item.color}`}><span style={{ width: `${game.stats[item.key]}%` }} /></div><strong>{Math.round(game.stats[item.key])}%</strong></div>)}</div><p className="profile-footnote">Esses dados e o progresso ficam salvos neste navegador.</p></section></div>}

      {gamesOpen && <div className="modal-backdrop games-backdrop" onClick={closeGames}><section className={`modal-card games-card ${miniId ? "playing-minigame" : ""}`} role="dialog" aria-modal="true" aria-labelledby="games-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={closeGames} aria-label="Fechar minijogos"><X size={18} /></button>
        {!miniId ? <><span className="modal-kicker">HORA DA DIVERSÃO · 11 JOGOS PRONTOS</span><div className="games-title-row"><div><h2 id="games-title">Minijogos</h2><p className="modal-subtitle">Cada brincadeira soma moedas, XP e progresso para a missão do capítulo.</p></div><span className="games-count"><Gamepad2 size={18} /> 11</span></div><div className="mini-game-grid expanded-game-grid">{MINI_GAMES.map((item) => <button className={`mini-game-card ${item.id === "colheita" ? "mini-game-featured" : ""}`} key={item.id} onClick={() => startMinigame(item.id)}><span className="mini-icon">{item.icon}</span><span className="mini-card-copy"><small className="mini-game-badge">{item.badge}</small><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className="play-chip">Jogar <ChevronRight size={14} /></span></button>)}</div><div className="modal-footer-note"><Trophy size={16} /> Missão do nível {game.level}: {Math.min(game.missionProgress, 3)} de 3 partidas completas · recompensa +200 moedas</div></> : currentMini ? <MiniGameBoard key={miniId} id={miniId} petName={petName} onWin={finishMinigame} onExit={() => setMiniId(null)} soundOn={soundOn} difficulty={game.level} /> : null}
      </section></div>}

      {shopOpen && <div className="modal-backdrop" onClick={() => setShopOpen(false)}><section className="modal-card shop-card" role="dialog" aria-modal="true" aria-labelledby="shop-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShopOpen(false)} aria-label="Fechar loja"><X size={18} /></button><span className="modal-kicker">{shopTab === "decor" ? "RECOMPENSAS DA AVENTURA" : "MIMOS COM MOEDAS VIRTUAIS"}</span><div className="shop-modal-title"><div><h2 id="shop-title">Loja da turma</h2><p className="modal-subtitle">Saldo: <strong>{game.coins.toLocaleString("pt-BR")} moedas</strong></p></div><span className="shop-paw">🐾</span></div><div className="shop-tabs"><button className={shopTab === "items" ? "selected" : ""} onClick={() => setShopTab("items")}>Itens</button><button className={shopTab === "decor" ? "selected" : ""} onClick={() => setShopTab("decor")}>Decoração</button><button className={shopTab === "looks" ? "selected" : ""} onClick={() => setShopTab("looks")}>Visuais</button><button className={shopTab === "boosts" ? "selected" : ""} onClick={() => setShopTab("boosts")}>Boosts</button><button className={shopTab === "friends" ? "selected" : ""} onClick={() => setShopTab("friends")}>Amigos</button></div>
        {shopTab === "items" && <div className="store-item-grid">{STORE_ITEMS.map((item) => { const count = game.inventory[item.id]; return <article className="store-item-card" key={item.id}><div className={`store-item-art item-${item.id}`}>{item.icon}</div><span className="store-item-stock">na mochila: {count}</span><strong>{item.name}</strong><small>{item.description}</small><div className="store-item-actions">{count > 0 && <button className="use-item-button" onClick={() => consumeItem(item.id)}>Usar</button>}<button className="buy-button" onClick={() => purchaseItem(item.id)}><Coins size={13} fill="currentColor" /> {item.price}</button></div></article>; })}</div>}
        {shopTab === "decor" && <>
          <div className="decor-room-summary"><div><strong>Casa {game.activeRoom} · {activeChapter.location}</strong><small>Peças únicas liberadas ao vencer cada fase desta casa</small></div><span>{(game.roomDecorations[String(game.activeRoom)] ?? []).length}/10</span></div>
          <div className="decor-shop-grid">{roomDecorationCatalog.map((item) => {
            const count = game.decorInventory[item.id] ?? 0;
            const requiredStage = getDecorationStageId(item.id);
            const isUnlocked = Boolean(requiredStage && game.platformProgress.completedStages.includes(requiredStage));
            const isPlaced = Object.values(game.roomDecorations).some((items) => items.some((placement) => placement.itemId === item.id));
            const lockReason = isUnlocked ? null : `Vença a fase ${requiredStage ?? "correspondente"}`;
            return <article className={`decor-shop-card ${lockReason || isPlaced ? "is-locked" : ""}`} key={item.id}>
              <div className="decor-shop-art"><img src={GAME_ASSETS.decorations[item.id]} alt={item.name} loading="lazy" /></div>
              <span className={`store-item-stock ${lockReason || isPlaced ? "decoration-locked-label" : ""}`}>{lockReason ? "BLOQUEADO" : isPlaced ? "JÁ FIXADO" : count > 0 ? "NA MOCHILA" : "DESBLOQUEADO"}</span>
              <strong>{item.name}</strong><small>{item.description}</small>
              <button disabled={Boolean(lockReason) || isPlaced || count < 1} className={lockReason || isPlaced || count < 1 ? "locked-button" : "use-item-button"} onClick={() => buyOrEquipDecoration(item.id)}>
                {lockReason ? <><LockKeyhole size={13} /> {lockReason}</> : isPlaced ? "Peça única já fixada" : count > 0 ? "Colocar na casa" : "Recompensa já aplicada"}
              </button>
            </article>;
          })}</div>
          <p className="decor-shop-tip"><Sparkles size={14} /> Cada peça é única e vem da fase correspondente da Aventura. Após liberar, toque para posicionar na casa desse mundo.</p>
        </>}
        {shopTab === "looks" && <><div className="skin-grid">{SKINS.map((skin) => { const owned = game.ownedSkins.includes(skin.id); const active = game.skin === skin.id; return <article className={`skin-card ${active ? "equipped" : ""}`} key={skin.id}><div className="skin-art">{skin.icon}<span className="skin-spark">✦</span></div><strong>{skin.name}</strong><small>{skin.description}</small><button className={active ? "owned-button" : "buy-button"} onClick={() => chooseSkin(skin.id)}>{active ? <><Check size={14} /> Em uso</> : owned ? "Equipar" : <><Coins size={14} fill="currentColor" /> {skin.price.toLocaleString("pt-BR")}</>}</button></article>; })}</div><p className="accessory-note">🧢 Menino usa boné · 🎀 Menina usa lacinho. A escolha foi feita no cadastro do pet.</p></>}
        {shopTab === "boosts" && <div className="boost-list">{statMeta.map((item) => <div className="boost-row" key={item.key}><span className="boost-emoji">{item.icon}</span><span className="boost-copy"><strong>{item.label} +30</strong><small>Um mimo rápido que melhora o dia</small></span><button onClick={() => boost(item.key)}><Coins size={14} /> 100</button></div>)}</div>}
        {shopTab === "friends" && <div className="friend-shop-grid"><article className={`friend-card ${game.activeCompanionId === null ? "friend-selected" : ""}`}><div className="friend-avatar neutral-avatar">🐾</div><small>AVENTURA A DOIS</small><strong>Só nós dois</strong><p>Explore sem um companheiro ao lado.</p><button onClick={() => selectCompanion(null)}>{game.activeCompanionId === null ? "Em passeio" : "Escolher"}</button></article>{companionMeta.map((friend) => { const unlocked = game.ownedCompanions.includes(friend.id); const active = game.activeCompanionId === friend.id; return <article className={`friend-card ${active ? "friend-selected" : ""} ${!unlocked ? "friend-locked" : ""}`} key={friend.id}><div className="friend-avatar">{unlocked ? <img src={friend.image} alt={friend.name} /> : friend.icon}</div><small>{unlocked ? "AMIGO DA TURMA" : `DESBLOQUEIA NO NÍVEL ${friend.unlock}`}</small><strong>{friend.name}</strong><p>{friend.species}{unlocked ? " pronto para brincar" : " esperando na próxima casa"}</p><button disabled={!unlocked} onClick={() => selectCompanion(friend.id)}>{active ? "Passeando com vocês" : unlocked ? "Convidar" : "Ainda fechado"}</button></article>; })}</div>}
        <div className="shop-safe-note"><Sparkles size={15} /> Itens e moedas são virtuais e ficam salvos neste navegador.</div></section></div>}
    </div>
  );
}
