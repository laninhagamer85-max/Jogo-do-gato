import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Bath, BookOpen, Check, ChevronDown, ChevronRight, Coins, Gamepad2, Heart,
  Home as HomeIcon, MapPin, Moon, PawPrint, Plus, Settings, ShoppingBag,
  Sparkles, Star, Trophy, Utensils, Volume2, VolumeX, X,
} from "lucide-react";
import MiniGameBoard from "@/components/MiniGameBoard";
import OnboardingFlow from "@/components/OnboardingFlow";
import TutorialOverlay from "@/components/TutorialOverlay";
import {
  buyBoost, buySkin, buyStoreItem, chooseCompanion, completeMinigame,
  createInitialGameState, CURRENT_SAVE_KEY, LEGACY_SAVE_KEYS,
  migrateGameState, performCare, setPetProfile, SKINS, STORE_ITEMS, tickPet,
  useStoreItem, type CareAction, type CompanionId, type GameState, type PetGender,
  type PetProfile, type SkinId, type StoreItemId,
} from "@/game/PetGame";
import { CAMPAIGN_LEVELS, getCampaignLevel, MINI_GAMES, type MiniGameId } from "@/game/levels";
import { playPetVoice, speakPetText, stopPetVoice, type PetVoiceCue } from "@/game/audio";
import { GAME_ASSETS } from "@/game/assets";

type ShopTab = "looks" | "items" | "boosts" | "friends";
type CollapsedPanels = { stats: boolean; care: boolean; mission: boolean; shop: boolean };
const PANEL_PREF_KEY = "meu-pet-panels-v2";
const SOUND_PREF_KEY = "meu-pet-sound-v2";
const VOICE_PREF_KEY = "meu-pet-voice-v2";
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
  const base = setPetProfile(createInitialGameState(), { name: "Pudim", age: 2, gender: "menino" });
  return {
    ...base,
    level: 3,
    xp: 160,
    xpMax: 338,
    coins: 920,
    missionProgress: 2,
    gamesPlayed: 7,
    stats: { felicidade: 82, fome: 58, higiene: 84, energia: 67 },
    inventory: { sardinha: 2, novelo: 1, banho: 1, caminha: 0 },
    ownedCompanions: ["mimi"],
    activeCompanionId: "mimi",
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

function PetMood({ game }: { game: GameState }) {
  if (game.sleeping) return <>Zzz… estou tirando uma soneca. <span>💤</span></>;
  if (game.stats.fome < 30) return <>Minha barriguinha está roncando! <span>🍲</span></>;
  if (game.stats.energia < 28) return <>Um colinho e uma soneca? <span>🌙</span></>;
  if (game.stats.higiene < 30) return <>Acho que está na hora do banho… <span>🫧</span></>;
  return <>Miau! Que bom te ver! <span>💗</span></>;
}

function CollapseButton({ collapsed, onClick, label }: { collapsed: boolean; onClick: () => void; label: string }) {
  return <button className="panel-collapse" type="button" onClick={onClick} aria-label={`${collapsed ? "Expandir" : "Minimizar"} ${label}`} aria-expanded={!collapsed}><ChevronDown size={16} /></button>;
}

export default function Home() {
  const demoMode = useMemo(() => new URLSearchParams(window.location.search).get("demo") === "1", []);
  const demoMiniGame = useMemo(() => demoMode ? getRequestedDemoGame() : null, [demoMode]);
  const [game, setGame] = useState<GameState>(() => demoMode ? createDemoGameState() : loadGame());
  const [activeTab, setActiveTab] = useState<"care" | "games" | "shop">(demoMiniGame ? "games" : "care");
  const [gamesOpen, setGamesOpen] = useState(Boolean(demoMiniGame));
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<ShopTab>("items");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem(SOUND_PREF_KEY) !== "false");
  const [voiceOn, setVoiceOn] = useState(() => localStorage.getItem(VOICE_PREF_KEY) !== "false");
  const [collapsed, setCollapsed] = useState<CollapsedPanels>(loadPanels);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [storyLevel, setStoryLevel] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [petLine, setPetLine] = useState("Miau! Que bom te ver!");
  const [miniId, setMiniId] = useState<MiniGameId | null>(demoMiniGame);
  const audioRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const previousLevelRef = useRef(game.level);
  const voiceOnRef = useRef(voiceOn);

  const currentChapter = getCampaignLevel(game.level);
  const xpPercent = Math.min(100, (game.xp / Math.max(1, game.xpMax)) * 100);
  const missionPercent = Math.min(100, (game.missionProgress / 3) * 100);
  const petName = game.profile?.name || "meu pet";
  const currentCompanion = companionMeta.find((item) => item.id === game.activeCompanionId);
  const currentMini = useMemo(() => MINI_GAMES.find((item) => item.id === miniId), [miniId]);
  const storyChapter = storyLevel ? getCampaignLevel(storyLevel) : null;

  useEffect(() => { if (!demoMode) localStorage.setItem(CURRENT_SAVE_KEY, JSON.stringify(game)); }, [game, demoMode]);
  useEffect(() => { localStorage.setItem(PANEL_PREF_KEY, JSON.stringify(collapsed)); }, [collapsed]);
  useEffect(() => { localStorage.setItem(SOUND_PREF_KEY, String(soundOn)); }, [soundOn]);
  useEffect(() => { localStorage.setItem(VOICE_PREF_KEY, String(voiceOn)); }, [voiceOn]);
  useEffect(() => { voiceOnRef.current = voiceOn; }, [voiceOn]);

  useEffect(() => {
    if (game.profile && !game.tutorialComplete) setTutorialOpen(true);
  }, [game.profile, game.tutorialComplete]);

  useEffect(() => {
    dispatchPetEvent("pet:skin", { skinId: game.skin });
    dispatchPetEvent("pet:level", { level: game.level });
    dispatchPetEvent("pet:profile", { gender: game.profile?.gender ?? "menina" });
    dispatchPetEvent("pet:companion", { companionId: game.activeCompanionId });
    const prior = previousLevelRef.current;
    if (game.level > prior) {
      setStoryLevel(game.level);
      setPetLine(`Conseguimos! A casa agora é: ${getCampaignLevel(game.level).location}.`);
      dispatchPetEvent("pet:action", { action: "level" });
      if (voiceOnRef.current) playPetVoice("level");
    }
    previousLevelRef.current = game.level;
  }, [game.level, game.skin, game.profile?.gender, game.activeCompanionId]);

  useEffect(() => {
    if (!game.profile) return;
    const timer = window.setInterval(() => {
      if (!paused && !gamesOpen && !shopOpen && !settingsOpen && !tutorialOpen && storyLevel === null) setGame((current) => tickPet(current));
    }, 45000);
    return () => window.clearInterval(timer);
  }, [game.profile, paused, gamesOpen, shopOpen, settingsOpen, tutorialOpen, storyLevel]);

  useEffect(() => () => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    if (audioRef.current) void audioRef.current.close();
    stopPetVoice();
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2700);
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

  function speak(cue: PetVoiceCue) { if (voiceOn) playPetVoice(cue); }
  function togglePanel(key: keyof CollapsedPanels) { setCollapsed((value) => ({ ...value, [key]: !value[key] })); }

  function care(action: CareAction) {
    const result = performCare(game, action);
    if (!result.ok) { showToast(result.message); return; }
    setGame(result.state);
    setPetLine(`${petName}: ${result.message}`);
    dispatchPetEvent("pet:action", { action, sleeping: result.state.sleeping });
    playTone();
    if (action === "food" || action === "love") speak("care");
  }

  function handleProfile(profile: PetProfile) {
    setGame((current) => setPetProfile(current, profile));
    setPetLine(`Miau! Oi, ${profile.name}! Eu adorei esse nome!`);
    dispatchPetEvent("pet:profile", { gender: profile.gender });
    if (voiceOn) speakPetText(`Oi, ${profile.name}! Eu adorei esse nome. Vamos brincar juntos?`);
    dispatchPetEvent("pet:action", { action: "love" });
  }

  function completeTutorial() {
    setGame((current) => ({ ...current, tutorialComplete: true }));
    setTutorialOpen(false);
    showToast("Pronto! A aventura começa no primeiro capítulo.");
  }

  function openMiniHub() { setActiveTab("games"); setGamesOpen(true); setMiniId(null); }
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
      setGame(result.state); setPetLine(result.message); showToast(result.message);
      dispatchPetEvent("pet:action", { action: id === "caminha" ? "sleep" : "love", sleeping: result.state.sleeping });
      speak("care"); playTone("reward");
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
    setTutorialOpen(false);
    setStoryLevel(null);
    setPetLine("Vamos começar uma nova aventura!");
    setSettingsOpen(false);
    showToast("Novo jogo iniciado. Seu save anterior foi arquivado neste navegador.");
  }

  const closeGames = () => { setGamesOpen(false); setMiniId(null); };

  return (
    <div className="game-root">
      <Suspense fallback={<div className="scene-loading" aria-label="Carregando cenário do pet" />}><GameCanvas initialState={{ level: game.level, skin: game.skin, sleeping: game.sleeping, gender: game.profile?.gender ?? null, companion: game.activeCompanionId }} /></Suspense>
      <div className="room-overlay" aria-hidden="true" />
      <div className="screen-ui">
        <header className="topbar">
          <div className="brand-lockup"><span className="brand-paw"><PawPrint size={28} fill="currentColor" /></span><div><strong>Meu Pet</strong><small>UMA CASA DE CADA VEZ</small>{demoMode && <small className="demo-state">DEMO · SAVE PRESERVADO</small>}</div></div>
          <div className="level-card" aria-label={`Nível ${game.level}, ${game.xp} de ${game.xpMax} XP`}>
            <div className="level-heading"><span className="level-star"><Star size={23} fill="currentColor" /></span><strong>Nível {game.level}</strong><span className="xp-copy">{game.xp} / {game.xpMax} XP</span></div>
            <div className="xp-track"><span style={{ width: `${xpPercent}%` }} /></div>
            <div className="level-location"><MapPin size={11} /> {currentChapter.location}<span>{game.level}/10</span></div>
          </div>
          <div className="top-actions">
            <button className="coin-pill" onClick={() => openShop("items")} aria-label="Abrir a loja de itens"><Coins size={21} fill="currentColor" /><strong>{game.coins.toLocaleString("pt-BR")}</strong><span className="coin-plus"><Plus size={15} /></span></button>
            <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Configurações"><Settings size={19} /></button>
            <button className="icon-button" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Desligar efeitos sonoros" : "Ligar efeitos sonoros"}>{soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</button>
            <button className="icon-button" onClick={() => setPaused(true)} aria-label="Pausar jogo"><span className="pause-symbol">Ⅱ</span></button>
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

          <section className="center-stage" aria-label={`Cenário de ${currentChapter.location}`}>
            <div className="stage-location-tag"><HomeIcon size={13} /><span>CAPÍTULO {game.level}</span><i />{currentChapter.location}</div>
            {currentCompanion && <div className="stage-companion-tag"><span>✦</span> {currentCompanion.name} está brincando com vocês</div>}
            <div className="pet-speech"><PetMood game={game} /><small>{petLine !== "Miau! Que bom te ver!" ? petLine : ""}</small></div>
            <div className="pet-nameplate"><span className="online-dot" /> {game.profile?.name || "Novo amigo"}<span className="pet-level">{game.profile ? `${game.profile.age} ${game.profile.age === 1 ? "ano" : "anos"} · nível ${game.level}` : "escolha um nome"}</span></div>
            <div className="stage-hint"><Sparkles size={14} /> Toque no pet para fazer carinho</div>
            <button className="pet-tap-area" onClick={() => care("love")} aria-label={`Fazer carinho em ${petName}`} />
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

      {!game.profile && <OnboardingFlow profile={game.profile} onComplete={handleProfile} onHearPet={() => speak("welcome")} />}
      {tutorialOpen && game.profile && <TutorialOverlay onComplete={completeTutorial} onClose={completeTutorial} />}

      {storyChapter && storyLevel !== null && <div className="modal-backdrop story-backdrop"><section className="modal-card story-card" role="dialog" aria-modal="true" aria-labelledby="story-title"><button className="modal-close" onClick={() => setStoryLevel(null)} aria-label="Fechar história"><X size={18} /></button><div className="story-art-ribbon"><span>✦</span><span>✧</span><span>✦</span><span>✧</span></div><span className="modal-kicker">CAPÍTULO {storyChapter.level} · {storyChapter.location.toUpperCase()}</span><div className="story-level-medallion"><Star size={27} fill="currentColor" /></div><h2 id="story-title">{storyChapter.title}</h2><p className="story-copy">{storyChapter.story.replace(/Pudim/g, petName)}</p>{storyChapter.companionUnlock && <div className="story-friend-card"><img src={storyChapter.companionUnlock === "mimi" ? GAME_ASSETS.companions.mimi : GAME_ASSETS.companions.tico} alt={storyChapter.companionUnlock === "mimi" ? "Mimi, a gatinha companheira" : "Tico, o cachorrinho companheiro"} /><div><small>NOVO AMIGO DA TURMA</small><strong>{storyChapter.companionUnlock === "mimi" ? "Mimi chegou!" : "Tico chegou!"}</strong><span>Agora ele participa das aventuras.</span></div><Check size={18} /></div>}<div className="story-reward-line"><span><Coins size={17} fill="currentColor" /> Bônus deste capítulo</span><strong>+{storyChapter.reward} moedas</strong></div><button className="primary-action story-continue" onClick={() => { setStoryLevel(null); setPetLine("Que tal conhecer a próxima aventura?"); }}>Explorar esta casa <ChevronRight size={17} /></button><p className="story-progress-note">{storyChapter.level < 10 ? `O primeiro arco tem 10 níveis. O próximo lugar: ${CAMPAIGN_LEVELS[storyChapter.level].location}.` : "Primeiro arco completo. Mais histórias podem ser adicionadas depois."}</p></section></div>}

      {paused && <div className="modal-backdrop"><section className="modal-card pause-card" role="dialog" aria-modal="true" aria-labelledby="pause-title"><button className="modal-close" onClick={() => setPaused(false)} aria-label="Fechar"><X size={18} /></button><span className="modal-hero-icon">Ⅱ</span><h2 id="pause-title">Pausa para um cafuné</h2><p>{petName} está esperando por você.</p><button className="primary-action" onClick={() => setPaused(false)}>Continuar brincando</button></section></div>}

      {settingsOpen && <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}><section className="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSettingsOpen(false)} aria-label="Fechar"><X size={18} /></button><span className="modal-kicker">MEU PET VIRTUAL</span><h2 id="settings-title">Configurações</h2><p className="modal-subtitle">Deixe a brincadeira do seu jeito.</p><button className="setting-row" onClick={() => setSoundOn((value) => !value)}><span className="setting-icon">{soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</span><span><strong>Efeitos sonoros</strong><small>{soundOn ? "Ligados" : "Desligados"}</small></span><span className={`toggle ${soundOn ? "on" : ""}`} /></button><button className="setting-row" onClick={() => setVoiceOn((value) => !value)}><span className="setting-icon">{voiceOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</span><span><strong>Voz do pet em português</strong><small>{voiceOn ? "Falas e reações ligadas" : "Desligada"}</small></span><span className={`toggle ${voiceOn ? "on" : ""}`} /></button><button className="setting-row guide-setting" onClick={() => { setSettingsOpen(false); setTutorialOpen(true); }}><span className="setting-icon"><BookOpen size={19} /></span><span><strong>Como jogar</strong><small>Reabrir o guia passo a passo</small></span><ChevronRight size={17} /></button><button className="secondary-action reset-action" onClick={startNewGame}><span>↻</span> Começar um novo jogo</button><p className="privacy-note">Seu progresso fica salvo neste navegador. Saves da versão anterior não são apagados.</p></section></div>}

      {gamesOpen && <div className="modal-backdrop games-backdrop" onClick={closeGames}><section className={`modal-card games-card ${miniId ? "playing-minigame" : ""}`} role="dialog" aria-modal="true" aria-labelledby="games-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={closeGames} aria-label="Fechar minijogos"><X size={18} /></button>
        {!miniId ? <><span className="modal-kicker">HORA DA DIVERSÃO · 11 JOGOS PRONTOS</span><div className="games-title-row"><div><h2 id="games-title">Minijogos</h2><p className="modal-subtitle">Cada brincadeira soma moedas, XP e progresso para a missão do capítulo.</p></div><span className="games-count"><Gamepad2 size={18} /> 11</span></div><div className="mini-game-grid expanded-game-grid">{MINI_GAMES.map((item) => <button className={`mini-game-card ${item.id === "colheita" ? "mini-game-featured" : ""}`} key={item.id} onClick={() => startMinigame(item.id)}><span className="mini-icon">{item.icon}</span><span className="mini-card-copy"><small className="mini-game-badge">{item.badge}</small><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className="play-chip">Jogar <ChevronRight size={14} /></span></button>)}</div><div className="modal-footer-note"><Trophy size={16} /> Missão do nível {game.level}: {Math.min(game.missionProgress, 3)} de 3 partidas completas · recompensa +200 moedas</div></> : currentMini ? <MiniGameBoard key={miniId} id={miniId} petName={petName} onWin={finishMinigame} onExit={() => setMiniId(null)} /> : null}
      </section></div>}

      {shopOpen && <div className="modal-backdrop" onClick={() => setShopOpen(false)}><section className="modal-card shop-card" role="dialog" aria-modal="true" aria-labelledby="shop-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShopOpen(false)} aria-label="Fechar loja"><X size={18} /></button><span className="modal-kicker">MIMOS COM MOEDAS VIRTUAIS</span><div className="shop-modal-title"><div><h2 id="shop-title">Loja da turma</h2><p className="modal-subtitle">Saldo: <strong>{game.coins.toLocaleString("pt-BR")} moedas</strong></p></div><span className="shop-paw">🐾</span></div><div className="shop-tabs"><button className={shopTab === "items" ? "selected" : ""} onClick={() => setShopTab("items")}>Itens</button><button className={shopTab === "looks" ? "selected" : ""} onClick={() => setShopTab("looks")}>Visuais</button><button className={shopTab === "boosts" ? "selected" : ""} onClick={() => setShopTab("boosts")}>Boosts</button><button className={shopTab === "friends" ? "selected" : ""} onClick={() => setShopTab("friends")}>Amigos</button></div>
        {shopTab === "items" && <div className="store-item-grid">{STORE_ITEMS.map((item) => { const count = game.inventory[item.id]; return <article className="store-item-card" key={item.id}><div className={`store-item-art item-${item.id}`}>{item.icon}</div><span className="store-item-stock">na mochila: {count}</span><strong>{item.name}</strong><small>{item.description}</small><div className="store-item-actions">{count > 0 && <button className="use-item-button" onClick={() => consumeItem(item.id)}>Usar</button>}<button className="buy-button" onClick={() => purchaseItem(item.id)}><Coins size={13} fill="currentColor" /> {item.price}</button></div></article>; })}</div>}
        {shopTab === "looks" && <><div className="skin-grid">{SKINS.map((skin) => { const owned = game.ownedSkins.includes(skin.id); const active = game.skin === skin.id; return <article className={`skin-card ${active ? "equipped" : ""}`} key={skin.id}><div className="skin-art">{skin.icon}<span className="skin-spark">✦</span></div><strong>{skin.name}</strong><small>{skin.description}</small><button className={active ? "owned-button" : "buy-button"} onClick={() => chooseSkin(skin.id)}>{active ? <><Check size={14} /> Em uso</> : owned ? "Equipar" : <><Coins size={14} fill="currentColor" /> {skin.price.toLocaleString("pt-BR")}</>}</button></article>; })}</div><p className="accessory-note">🧢 Menino usa boné · 🎀 Menina usa lacinho. A escolha foi feita no cadastro do pet.</p></>}
        {shopTab === "boosts" && <div className="boost-list">{statMeta.map((item) => <div className="boost-row" key={item.key}><span className="boost-emoji">{item.icon}</span><span className="boost-copy"><strong>{item.label} +30</strong><small>Um mimo rápido que melhora o dia</small></span><button onClick={() => boost(item.key)}><Coins size={14} /> 100</button></div>)}</div>}
        {shopTab === "friends" && <div className="friend-shop-grid"><article className={`friend-card ${game.activeCompanionId === null ? "friend-selected" : ""}`}><div className="friend-avatar neutral-avatar">🐾</div><small>AVENTURA A DOIS</small><strong>Só nós dois</strong><p>Explore sem um companheiro ao lado.</p><button onClick={() => selectCompanion(null)}>{game.activeCompanionId === null ? "Em passeio" : "Escolher"}</button></article>{companionMeta.map((friend) => { const unlocked = game.ownedCompanions.includes(friend.id); const active = game.activeCompanionId === friend.id; return <article className={`friend-card ${active ? "friend-selected" : ""} ${!unlocked ? "friend-locked" : ""}`} key={friend.id}><div className="friend-avatar">{unlocked ? <img src={friend.image} alt={friend.name} /> : friend.icon}</div><small>{unlocked ? "AMIGO DA TURMA" : `DESBLOQUEIA NO NÍVEL ${friend.unlock}`}</small><strong>{friend.name}</strong><p>{friend.species}{unlocked ? " pronto para brincar" : " esperando na próxima casa"}</p><button disabled={!unlocked} onClick={() => selectCompanion(friend.id)}>{active ? "Passeando com vocês" : unlocked ? "Convidar" : "Ainda fechado"}</button></article>; })}</div>}
        <div className="shop-safe-note"><Sparkles size={15} /> Itens e moedas são virtuais e ficam salvos neste navegador.</div></section></div>}
    </div>
  );
}
