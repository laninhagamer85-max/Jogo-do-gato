import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bath,
  Check,
  ChevronRight,
  Coins,
  Gamepad2,
  Heart,
  Moon,
  PawPrint,
  Plus,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Utensils,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import GameCanvas from "@/components/GameCanvas";
import {
  buyBoost,
  buySkin,
  completeMinigame,
  INITIAL_GAME_STATE,
  performCare,
  SKINS,
  tickPet,
  type CareAction,
  type GameState,
  type SkinId,
} from "@/game/PetGame";

type MiniId = "patas" | "memoria" | "bolhas";
const SAVE_KEY = "meu-pet-virtual-save-v1";

function loadGame(): GameState {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<GameState>;
      return {
        ...INITIAL_GAME_STATE,
        ...parsed,
        stats: { ...INITIAL_GAME_STATE.stats, ...(parsed.stats ?? {}) },
        ownedSkins: Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins : ["tigrinho"],
      };
    }
    const oldPet = JSON.parse(localStorage.getItem("pet_estado") || "null") as Record<string, unknown> | null;
    if (oldPet) {
      const oldLevel = Number(localStorage.getItem("pet_lvl"));
      const oldXp = Number(localStorage.getItem("pet_xp"));
      const oldCoins = Number(localStorage.getItem("pet_moedas"));
      return {
        ...INITIAL_GAME_STATE,
        level: Number.isFinite(oldLevel) && oldLevel > 0 ? oldLevel : INITIAL_GAME_STATE.level,
        xp: Number.isFinite(oldXp) && oldXp >= 0 ? oldXp : INITIAL_GAME_STATE.xp,
        coins: Number.isFinite(oldCoins) && oldCoins >= 0 ? oldCoins : INITIAL_GAME_STATE.coins,
        stats: {
          felicidade: Number(oldPet.felicidade ?? 85),
          fome: Number(oldPet.fome ?? 70),
          higiene: Number(oldPet.higiene ?? 92),
          energia: Number(oldPet.energia ?? 65),
        },
        sleeping: oldPet.dormindo === true,
      };
    }
  } catch {
    // A malformed local save is ignored; the game starts with the visual-reference defaults.
  }
  return INITIAL_GAME_STATE;
}

const statMeta = [
  { key: "felicidade", label: "Felicidade", icon: "💗", color: "pink" },
  { key: "fome", label: "Fome", icon: "🍲", color: "gold" },
  { key: "higiene", label: "Higiene", icon: "💧", color: "cyan" },
  { key: "energia", label: "Energia", icon: "⚡", color: "violet" },
] as const;

const miniGames: Array<{ id: MiniId; title: string; subtitle: string; icon: string; goal: number }> = [
  { id: "patas", title: "Patas velozes", subtitle: "Toque 7 vezes na patinha", icon: "🐾", goal: 7 },
  { id: "memoria", title: "Memória felina", subtitle: "Encontre os 3 pares", icon: "🧠", goal: 3 },
  { id: "bolhas", title: "Bolhas de peixe", subtitle: "Estoure 6 bolhas", icon: "🫧", goal: 6 },
];
const memorySymbols = ["🐟", "🐟", "🧶", "🧶", "🐾", "🐾"];

function shuffledMemory() {
  return [...memorySymbols].sort(() => Math.random() - 0.5);
}

function dispatchPetEvent(name: string, detail: Record<string, string>) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function PetMood({ game }: { game: GameState }) {
  if (game.sleeping) return <>Zzz… estou tirando uma soneca. <span>💤</span></>;
  if (game.stats.fome < 30) return <>Minha barriguinha está roncando! <span>🍲</span></>;
  if (game.stats.energia < 28) return <>Um colinho e uma soneca? <span>🌙</span></>;
  if (game.stats.higiene < 30) return <>Acho que está na hora do banho… <span>🫧</span></>;
  return <>Miau! Que bom te ver! <span>💗</span></>;
}

export default function Home() {
  const [game, setGame] = useState<GameState>(loadGame);
  const [activeTab, setActiveTab] = useState<"care" | "games" | "shop">("care");
  const [gamesOpen, setGamesOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<"skins" | "boosts">("skins");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [toast, setToast] = useState("");
  const [petLine, setPetLine] = useState("Miau! Que bom te ver!");
  const [miniId, setMiniId] = useState<MiniId | null>(null);
  const [miniTaps, setMiniTaps] = useState(0);
  const [memoryDeck, setMemoryDeck] = useState<string[]>([]);
  const [memoryOpen, setMemoryOpen] = useState<number[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<number[]>([]);
  const audioRef = useRef<AudioContext | null>(null);
  const miniTimerRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    const id = window.setInterval(() => setGame((current) => (paused ? current : tickPet(current))), 45000);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    dispatchPetEvent("pet:skin", { skinId: game.skin });
  }, [game.skin]);

  useEffect(() => {
    if (memoryOpen.length !== 2 || !miniId || miniId !== "memoria") return;
    if (memoryDeck[memoryOpen[0]] === memoryDeck[memoryOpen[1]]) {
      const nextMatched = [...memoryMatched, ...memoryOpen];
      setMemoryMatched(nextMatched);
      setMemoryOpen([]);
      if (nextMatched.length === memoryDeck.length) {
        miniTimerRef.current = window.setTimeout(() => finishMinigame(), 450);
      }
      return;
    }
    miniTimerRef.current = window.setTimeout(() => setMemoryOpen([]), 650);
    return () => {
      if (miniTimerRef.current !== null) window.clearTimeout(miniTimerRef.current);
    };
  }, [memoryOpen, memoryDeck, memoryMatched, miniId]);

  useEffect(() => () => {
    if (miniTimerRef.current !== null) window.clearTimeout(miniTimerRef.current);
    if (audioRef.current) void audioRef.current.close();
  }, []);

  const xpPercent = Math.min(100, (game.xp / game.xpMax) * 100);
  const missionPercent = Math.min(100, (game.missionProgress / 3) * 100);
  const currentMini = useMemo(() => miniGames.find((item) => item.id === miniId), [miniId]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
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
      gain.gain.setValueAtTime(0.055, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
    } catch {
      // Audio is an optional browser enhancement.
    }
  }

  function care(action: CareAction) {
    const result = performCare(game, action);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    setGame(result.state);
    setPetLine(result.message);
    dispatchPetEvent("pet:action", { action });
    playTone();
    if (action === "sleep") setPetLine(result.message);
  }

  function openMiniHub() {
    setActiveTab("games");
    setGamesOpen(true);
    setMiniId(null);
  }

  function openShop() {
    setActiveTab("shop");
    setShopOpen(true);
  }

  function startMinigame(id: MiniId) {
    setMiniId(id);
    setMiniTaps(0);
    setMemoryOpen([]);
    setMemoryMatched([]);
    setMemoryDeck(id === "memoria" ? shuffledMemory() : []);
    playTone();
  }

  function finishMinigame() {
    setGame((current) => completeMinigame(current));
    setMiniId(null);
    setMemoryOpen([]);
    setMemoryMatched([]);
    showToast(game.missionProgress + 1 >= 3 && !game.missionClaimed ? "Missão concluída! +200 moedas" : "Minijogo concluído! +60 moedas e +80 XP");
    playTone("reward");
  }

  function tapMiniTarget() {
    const next = miniTaps + 1;
    setMiniTaps(next);
    dispatchPetEvent("pet:action", { action: "play" });
    playTone("reward");
    if (next >= (currentMini?.goal ?? 7)) finishMinigame();
  }

  function tapMemoryCard(index: number) {
    if (memoryOpen.length >= 2 || memoryMatched.includes(index) || memoryOpen.includes(index)) return;
    setMemoryOpen((current) => [...current, index]);
  }

  function chooseSkin(id: SkinId) {
    const result = buySkin(game, id);
    if (result.ok) {
      setGame(result.state);
      showToast(result.message);
      playTone("reward");
    } else showToast(result.message);
  }

  function buyStatBoost(stat: keyof GameState["stats"]) {
    const result = buyBoost(game, stat);
    if (result.ok) {
      setGame(result.state);
      showToast(result.message);
      playTone("reward");
    } else showToast(result.message);
  }

  function selectCareTab() {
    setActiveTab("care");
    setGamesOpen(false);
    setShopOpen(false);
  }

  return (
    <div className="game-root">
      <GameCanvas />
      <div className="room-overlay" aria-hidden="true" />
      <div className="screen-ui">
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-paw"><PawPrint size={28} fill="currentColor" /></span>
            <div><strong>Meu Pet</strong><small>VIRTUAL</small></div>
          </div>
          <div className="level-card">
            <div className="level-heading"><span className="level-star"><Star size={23} fill="currentColor" /></span><strong>Nível {game.level}</strong><span className="xp-copy">{game.xp} / {game.xpMax} XP</span></div>
            <div className="xp-track"><span style={{ width: `${xpPercent}%` }} /></div>
          </div>
          <div className="top-actions">
            <button className="coin-pill" onClick={openShop} aria-label="Abrir loja"><Coins size={21} fill="currentColor" /><strong>{game.coins.toLocaleString("pt-BR")}</strong><span className="coin-plus"><Plus size={15} /></span></button>
            <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Configurações"><Settings size={19} /></button>
            <button className="icon-button" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Desligar sons" : "Ligar sons"}>{soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</button>
            <button className="icon-button" onClick={() => setPaused(true)} aria-label="Pausar jogo"><span className="pause-symbol">Ⅱ</span></button>
          </div>
        </header>

        <main className="dashboard-grid">
          <aside className="side-column side-left">
            <section className="glass-panel stats-panel">
              <div className="panel-heading"><h2>Como estou?</h2><span className="status-dot" /></div>
              <div className="stats-list">
                {statMeta.map((item) => (
                  <div className="stat-row" key={item.key}>
                    <div className="stat-icon">{item.icon}</div>
                    <div className="stat-main"><div className="stat-label"><strong>{item.label}</strong><span>{Math.round(game.stats[item.key])}%</span></div><div className={`stat-track ${item.color}`}><span style={{ width: `${game.stats[item.key]}%` }} /></div></div>
                  </div>
                ))}
              </div>
            </section>
            <section className="glass-panel care-panel">
              <div className="panel-heading"><h2>Cuidar</h2><span className="panel-caption">um gesto de carinho</span></div>
              <div className="care-grid">
                <button className="care-button feed" onClick={() => care("food")}><span>🍎</span><b>Alimentar</b><small>18 moedas</small></button>
                <button className="care-button bath" onClick={() => care("bath")}><span><Bath size={22} /></span><b>Banho</b><small>12 moedas</small></button>
                <button className="care-button love" onClick={() => care("love")}><span><Heart size={22} fill="currentColor" /></span><b>Carinho</b><small>grátis</small></button>
                <button className={`care-button sleep ${game.sleeping ? "sleeping" : ""}`} onClick={() => care("sleep")}><span><Moon size={22} fill="currentColor" /></span><b>{game.sleeping ? "Acordar" : "Dormir"}</b><small>recupera energia</small></button>
              </div>
            </section>
          </aside>

          <section className="center-stage" aria-label="Quarto do pet">
            <div className="pet-speech"><PetMood game={game} /></div>
            <div className="pet-nameplate"><span className="online-dot" /> Pudim <span className="pet-level">amigo nível {game.level}</span></div>
            <div className="stage-hint"><Sparkles size={14} /> Toque no Pudim para interagir</div>
            <button className="pet-tap-area" onClick={() => { setPetLine("Purrr… adorei o carinho!"); dispatchPetEvent("pet:action", { action: "love" }); playTone(); }} aria-label="Fazer carinho no Pudim" />
          </section>

          <aside className="side-column side-right">
            <section className="mission-card">
              <div className="mission-heading"><span className="mission-star"><Star size={24} fill="currentColor" /></span><div><small>MISSÃO DO NÍVEL {game.level}</small><h2>{game.missionClaimed ? "Desafio concluído!" : "Brincar faz bem"}</h2></div></div>
              <p>Complete 3 minijogos</p>
              <div className="mission-progress-row"><div className="mission-track"><span style={{ width: `${missionPercent}%` }} /></div><strong>{Math.min(game.missionProgress, 3)}/3</strong></div>
              <div className="mission-reward"><span>Recompensa</span><strong><Coins size={17} fill="currentColor" /> +200</strong></div>
              <button className="mission-button" onClick={openMiniHub}>{game.missionClaimed ? "Jogar de novo" : "Ver minijogos"}<ChevronRight size={16} /></button>
            </section>
            <section className="glass-panel shop-preview">
              <div className="panel-heading"><h2><ShoppingBag size={19} /> Loja</h2><button className="text-link" onClick={openShop}>Ver tudo <ChevronRight size={14} /></button></div>
              <div className="shop-shortcuts">
                <button onClick={() => { setShopTab("skins"); openShop(); }}><span>🐱</span><small>Skins</small></button>
                <button onClick={() => { setShopTab("boosts"); openShop(); }}><span>⚡</span><small>Boosts</small></button>
                <button onClick={() => { setShopTab("boosts"); openShop(); }}><span>🧸</span><small>Cuidados</small></button>
                <button onClick={openShop}><span>🪙</span><small>Moedas</small></button>
              </div>
              <div className="shop-nudge"><span>✨</span><p>Um visual novo para um dia especial!</p></div>
            </section>
          </aside>
        </main>

        <nav className="bottom-nav" aria-label="Navegação do jogo">
          <button className={`nav-item ${activeTab === "care" ? "active care-active" : ""}`} onClick={selectCareTab}><span><PawPrint size={20} fill="currentColor" /></span><b>Cuidar</b></button>
          <button className={`nav-item ${activeTab === "games" ? "active games-active" : ""}`} onClick={openMiniHub}><span><Gamepad2 size={21} /></span><b>Minijogos</b></button>
          <button className={`nav-item ${activeTab === "shop" ? "active shop-active" : ""}`} onClick={openShop}><span><ShoppingBag size={20} /></span><b>Loja</b></button>
        </nav>
      </div>

      {toast && <div className="toast-message" role="status"><Sparkles size={16} />{toast}</div>}

      {paused && <div className="modal-backdrop"><section className="modal-card pause-card" role="dialog" aria-modal="true" aria-labelledby="pause-title"><button className="modal-close" onClick={() => setPaused(false)} aria-label="Fechar"><X size={18} /></button><span className="modal-hero-icon">Ⅱ</span><h2 id="pause-title">Pausa para um cafuné</h2><p>O Pudim está esperando por você.</p><button className="primary-action" onClick={() => setPaused(false)}>Continuar brincando</button></section></div>}

      {settingsOpen && <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}><section className="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSettingsOpen(false)} aria-label="Fechar"><X size={18} /></button><span className="modal-kicker">MEU PET VIRTUAL</span><h2 id="settings-title">Configurações</h2><p className="modal-subtitle">Deixe a brincadeira do seu jeito.</p><button className="setting-row" onClick={() => setSoundOn((value) => !value)}><span className="setting-icon">{soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}</span><span><strong>Efeitos sonoros</strong><small>{soundOn ? "Ligados" : "Desligados"}</small></span><span className={`toggle ${soundOn ? "on" : ""}`} /></button><button className="secondary-action reset-action" onClick={() => { setGame(INITIAL_GAME_STATE); setPetLine("Vamos começar uma nova aventura!"); showToast("Progresso reiniciado neste navegador."); }}><span>↻</span> Reiniciar progresso</button><p className="privacy-note">Seu progresso fica salvo neste navegador.</p></section></div>}

      {gamesOpen && <div className="modal-backdrop" onClick={() => { setGamesOpen(false); setMiniId(null); }}><section className="modal-card games-card" role="dialog" aria-modal="true" aria-labelledby="games-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => { setGamesOpen(false); setMiniId(null); }} aria-label="Fechar"><X size={18} /></button>
        {!miniId ? <><span className="modal-kicker">HORA DA DIVERSÃO</span><h2 id="games-title">Minijogos</h2><p className="modal-subtitle">Escolha uma brincadeira e ganhe moedas e XP.</p><div className="mini-game-grid">{miniGames.map((item) => <button className="mini-game-card" key={item.id} onClick={() => startMinigame(item.id)}><span className="mini-icon">{item.icon}</span><strong>{item.title}</strong><small>{item.subtitle}</small><span className="play-chip">Jogar <ChevronRight size={14} /></span></button>)}</div><div className="modal-footer-note"><Trophy size={16} /> Progresso da missão: {Math.min(game.missionProgress, 3)} de 3 brincadeiras</div></> : <><span className="modal-kicker">MINIJOGO • RECOMPENSA +60 MOEDAS</span><h2 id="games-title">{currentMini?.title}</h2><p className="modal-subtitle">{currentMini?.subtitle}</p>{miniId === "memoria" ? <div className="memory-board">{memoryDeck.map((symbol, index) => { const visible = memoryOpen.includes(index) || memoryMatched.includes(index); return <button className={`memory-tile ${visible ? "revealed" : ""} ${memoryMatched.includes(index) ? "matched" : ""}`} key={index} onClick={() => tapMemoryCard(index)} aria-label={visible ? symbol : "Revelar carta"}>{visible ? symbol : "?"}</button>; })}</div> : <div className={`tap-arena ${miniId}`}><p>{miniId === "bolhas" ? "Estoure as bolhas antes que elas subam!" : "A patinha quer brincar: toque nela!"}</p><button className="moving-target" onClick={tapMiniTarget} aria-label="Acertar alvo">{miniId === "bolhas" ? "🫧" : "🐾"}</button><div className="tap-progress"><span style={{ width: `${Math.min(100, (miniTaps / (currentMini?.goal ?? 7)) * 100)}%` }} /></div><strong>{miniTaps} / {currentMini?.goal ?? 7}</strong></div>}<button className="back-link" onClick={() => setMiniId(null)}>← Voltar aos minijogos</button></>}
      </section></div>}

      {shopOpen && <div className="modal-backdrop" onClick={() => setShopOpen(false)}><section className="modal-card shop-card" role="dialog" aria-modal="true" aria-labelledby="shop-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShopOpen(false)} aria-label="Fechar"><X size={18} /></button><span className="modal-kicker">UM MIMO PARA O PUDIM</span><div className="shop-modal-title"><div><h2 id="shop-title">Loja do Pudim</h2><p className="modal-subtitle">Moedas disponíveis: <strong>{game.coins.toLocaleString("pt-BR")}</strong></p></div><span className="shop-paw">🐾</span></div><div className="shop-tabs"><button className={shopTab === "skins" ? "selected" : ""} onClick={() => setShopTab("skins")}>Skins</button><button className={shopTab === "boosts" ? "selected" : ""} onClick={() => setShopTab("boosts")}>Cuidados & boosts</button></div>{shopTab === "skins" ? <div className="skin-grid">{SKINS.map((skin) => { const owned = game.ownedSkins.includes(skin.id); const active = game.skin === skin.id; return <article className={`skin-card ${active ? "equipped" : ""}`} key={skin.id}><div className="skin-art">{skin.icon}<span className="skin-spark">✦</span></div><strong>{skin.name}</strong><small>{skin.description}</small><button className={active ? "owned-button" : "buy-button"} onClick={() => chooseSkin(skin.id)}>{active ? <><Check size={14} /> Em uso</> : owned ? "Equipar" : <><Coins size={14} fill="currentColor" /> {skin.price.toLocaleString("pt-BR")}</>}</button></article>; })}</div> : <div className="boost-list">{statMeta.map((item) => <div className="boost-row" key={item.key}><span className="boost-emoji">{item.icon}</span><span className="boost-copy"><strong>{item.label} +30</strong><small>Um mimo que melhora o dia</small></span><button onClick={() => buyStatBoost(item.key)}><Coins size={14} /> 100</button></div>)}</div>}<div className="shop-safe-note"><Sparkles size={15} /> Moedas são virtuais e ficam salvas neste navegador.</div></section></div>}
    </div>
  );
}
