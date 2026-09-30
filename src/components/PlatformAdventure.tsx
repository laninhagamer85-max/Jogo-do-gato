import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Coins, Gamepad2, Heart, Home as HomeIcon,
  LockKeyhole, Map, Pause, PawPrint, Play, RotateCcw, Settings, Sparkles, Star, Trophy, Volume2, VolumeX, X,
} from "lucide-react";
import { GAME_ASSETS } from "@/game/assets";
import { completePlatformStage, type GameState } from "@/game/PetGame";
import AudioVolumeControls from "@/components/AudioVolumeControls";
import { PlatformerEngine, type PlatformerHud } from "@/game/PlatformerEngine";
import { setPlatformAudioMix, startPlatformMusic, stopPlatformMusic, unlockPlatformAudio, type PlatformAudioMix } from "@/game/platformerAudio";
import { getPlatformStage, getPlatformWorld } from "@/game/platformerLevels";
import "./PlatformAdventure.css";

type Phase = "map" | "playing" | "paused" | "failed" | "won";
type Completion = ReturnType<typeof completePlatformStage>;

type Props = {
  state: GameState;
  soundOn: boolean;
  audioMix: PlatformAudioMix;
  onAudioMixChange: (mix: PlatformAudioMix) => void;
  onToggleSound: () => void;
  onGoToHouse: () => void;
  onCompleteTutorial: () => void;
  onCompleteStage: (stageId: number, stars: number, coins: number) => Completion;
};

const START_HUD: PlatformerHud = { hearts: 3, coins: 0, totalCoins: 0, progress: 0, checkpoint: false };
const CREATOR_COPY = <>Este jogo foi idealizado e criado com muito carinho e criatividade pela jovem desenvolvedora <strong>Allana Gabriela</strong>, de apenas <strong>11 Anos</strong>, no ano de <strong>2026</strong>. Ela provou que não há limite de idade para transformar imaginação em arte e código!</>;

function starsForRun(hud: PlatformerHud) {
  const ratio = hud.totalCoins ? hud.coins / hud.totalCoins : 0;
  if (ratio >= 0.72 && hud.hearts === 3) return 3;
  if (ratio >= 0.36 || hud.hearts === 3) return 2;
  return 1;
}

function formatStars(stars: number) {
  return `${"★".repeat(stars)}${"☆".repeat(Math.max(0, 3 - stars))}`;
}

export default function PlatformAdventure({ state, soundOn, audioMix, onAudioMixChange, onToggleSound, onGoToHouse, onCompleteTutorial, onCompleteStage }: Props) {
  const qaAutoPilot = useMemo(() => import.meta.env.DEV && new URLSearchParams(window.location.search).get("autoplay") === "1", []);
  const qaStageLimit = useMemo(() => {
    const requested = Number(new URLSearchParams(window.location.search).get("qa-stages"));
    return Math.max(1, Math.min(100, Number.isFinite(requested) && requested > 0 ? Math.round(requested) : 5));
  }, []);
  const initialWorld = Math.min(10, Math.max(1, Math.ceil(state.platformProgress.unlockedStage / 10)));
  const [world, setWorld] = useState(initialWorld);
  const [stageId, setStageId] = useState(state.platformProgress.unlockedStage <= 100 ? state.platformProgress.unlockedStage : 100);
  const [phase, setPhase] = useState<Phase>("map");
  const [hud, setHud] = useState<PlatformerHud>(START_HUD);
  const [attempt, setAttempt] = useState(0);
  const [reward, setReward] = useState<Completion | null>(null);
  const [rewardStep, setRewardStep] = useState(0);
  const [helpOpen, setHelpOpen] = useState(!state.tutorialComplete);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageCarouselRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PlatformerEngine | null>(null);
  const completeStageRef = useRef(onCompleteStage);
  const currentStage = useMemo(() => getPlatformStage(stageId)!, [stageId]);
  const chapter = getPlatformWorld(world)!;
  const completed = state.platformProgress.completedStages;
  const currentWorldStages = Array.from({ length: 10 }, (_, index) => (world - 1) * 10 + index + 1);
  const worldDone = currentWorldStages.filter((id) => completed.includes(id)).length;
  const totalDone = completed.length;
  const availableWorld = Math.min(10, Math.max(1, Math.ceil(state.platformProgress.unlockedStage / 10)));
  const focusStage = state.platformProgress.unlockedStage > (world - 1) * 10 && state.platformProgress.unlockedStage <= world * 10
    ? state.platformProgress.unlockedStage
    : world * 10;

  useEffect(() => { completeStageRef.current = onCompleteStage; }, [onCompleteStage]);

  useEffect(() => {
    setPlatformAudioMix(audioMix);
  }, [audioMix]);

  useEffect(() => {
    startPlatformMusic();
    const unlock = () => unlockPlatformAudio();
    window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
    window.addEventListener("keydown", unlock, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      stopPlatformMusic();
    };
  }, []);

  useEffect(() => {
    if (phase !== "map") return;
    document.getElementById(`pa-stage-${focusStage}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [phase, world, focusStage]);

  useEffect(() => {
    if (!qaAutoPilot || phase !== "map" || state.platformProgress.unlockedStage > qaStageLimit) return;
    const timer = window.setTimeout(() => beginStage(state.platformProgress.unlockedStage), 500);
    return () => window.clearTimeout(timer);
  }, [qaAutoPilot, qaStageLimit, phase, state.platformProgress.unlockedStage]);

  useEffect(() => {
    const stageData = getPlatformStage(stageId);
    const canvas = canvasRef.current;
    if ((phase === "playing" || phase === "paused") && canvas && stageData && state.profile) {
      if (!engineRef.current) {
        engineRef.current = new PlatformerEngine(canvas, stageId, state.profile, {
          onHud: setHud,
          onWin: (coins, hearts, totalCoins) => {
            const ratio = totalCoins ? coins / totalCoins : 0;
            const stars = ratio >= 0.72 && hearts === 3 ? 3 : ratio >= 0.36 || hearts === 3 ? 2 : 1;
            const outcome = completeStageRef.current(stageId, stars, coins);
            setReward(outcome);
            setRewardStep(0);
            setPhase("won");
          },
          onLose: () => setPhase("failed"),
        });
      }
      engineRef.current.setSoundEnabled(soundOn);
      engineRef.current.setPaused(phase === "paused" || settingsOpen);
    } else if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }
  }, [phase, stageId, attempt, state.profile, soundOn, settingsOpen]);

  useEffect(() => () => {
    engineRef.current?.dispose();
    engineRef.current = null;
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (settingsOpen) { setSettingsOpen(false); return; }
      if (creatorOpen) { setCreatorOpen(false); return; }
      if (helpOpen) { setHelpOpen(false); return; }
      if (phase === "playing") setPhase("paused");
      else if (phase === "paused") setPhase("playing");
      else if (phase === "won" && rewardStep < 2) setRewardStep((step) => Math.min(2, step + 1));
      else if (phase === "failed" || phase === "won") { setPhase("map"); setReward(null); setRewardStep(0); }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [phase, rewardStep, helpOpen, creatorOpen, settingsOpen]);

  useEffect(() => {
    if (phase !== "playing") return;
    setHud(START_HUD);
  }, [phase, stageId, attempt]);

  useEffect(() => {
    if (!qaAutoPilot || phase !== "playing") return;
    let jumpReleaseTimer: number | null = null;
    const interval = window.setInterval(() => {
      const engine = engineRef.current;
      if (!engine) return;
      const snapshot = engine.getAutoPilotSnapshot();
      if (snapshot.hearts <= 0) return;
      engine.setInput("right", true);
      const current = snapshot.currentSurface;
      const next = current ? snapshot.surfaces
        .filter((surface) => surface.x >= current.x + current.width - 2)
        .sort((a, b) => a.x - b.x)[0] : undefined;
      const edgeDistance = current ? current.x + current.width - (snapshot.x + snapshot.playerWidth) : Infinity;
      const gapWidth = current && next ? next.x - (current.x + current.width) : Infinity;
      const jumpWindow = current?.kind === "floating" ? 20 : 115;
      const jumpForGap = Boolean(current && next && gapWidth < 250 && next.y >= current.y - 118 && edgeDistance < jumpWindow);
      const frontX = snapshot.x + snapshot.playerWidth;
      const enemyAhead = snapshot.enemies.some((enemy) => enemy.y - 20 < snapshot.y + snapshot.playerHeight + 24 && enemy.y + 7 > snapshot.y - 12 && enemy.x - 17 > frontX && enemy.x - 17 - frontX < 110);
      const hazardAhead = snapshot.hazards.some((hazard) => hazard.y < snapshot.y + snapshot.playerHeight + 20 && hazard.y + hazard.height > snapshot.y - 10 && hazard.x > frontX && hazard.x - frontX < 120);
      if (snapshot.grounded && (jumpForGap || enemyAhead || hazardAhead)) {
        engine.setInput("jump", true);
        if (jumpReleaseTimer !== null) window.clearTimeout(jumpReleaseTimer);
        jumpReleaseTimer = window.setTimeout(() => {
          engineRef.current?.setInput("jump", false);
          jumpReleaseTimer = null;
        }, jumpForGap ? 240 : 90);
      }
    }, 16);
    return () => {
      window.clearInterval(interval);
      if (jumpReleaseTimer !== null) window.clearTimeout(jumpReleaseTimer);
      engineRef.current?.setInput("right", false);
      engineRef.current?.setInput("jump", false);
    };
  }, [qaAutoPilot, phase, stageId, attempt]);

  useEffect(() => {
    if (!qaAutoPilot || phase !== "won" || !reward) return;
    const timer = window.setTimeout(() => {
      if (rewardStep < 2) setRewardStep((step) => Math.min(2, step + 1));
      else if (stageId < qaStageLimit && state.platformProgress.unlockedStage > stageId) beginStage(stageId + 1);
      else if (stageId >= qaStageLimit) {
        setReward(null);
        setRewardStep(0);
        setPhase("map");
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [qaAutoPilot, qaStageLimit, phase, reward, rewardStep, stageId, state.platformProgress.unlockedStage]);

  function beginStage(id: number) {
    if (id > state.platformProgress.unlockedStage) return;
    setStageId(id);
    setWorld(Math.ceil(id / 10));
    setHud(START_HUD);
    setReward(null);
    setRewardStep(0);
    setPhase("playing");
  }

  function replayStage() {
    setReward(null);
    setRewardStep(0);
    setHud(START_HUD);
    setAttempt((value) => value + 1);
    setPhase("playing");
  }

  function finishGuide() {
    setHelpOpen(false);
    if (!state.tutorialComplete) onCompleteTutorial();
  }

  function setControl(action: "left" | "right" | "jump", pressed: boolean, event?: ReactPointerEvent<HTMLButtonElement>) {
    if (event) {
      event.preventDefault();
      if (pressed) event.currentTarget.setPointerCapture(event.pointerId);
      else if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
    engineRef.current?.setInput(action, pressed);
  }

  function stageTile(stage: number) {
    const data = getPlatformStage(stage)!;
    const isComplete = completed.includes(stage);
    const isLocked = stage > state.platformProgress.unlockedStage;
    const rewardEarned = isComplete;
    const stars = state.platformProgress.starsByStage[String(stage)] ?? 0;
    return <button
      id={`pa-stage-${stage}`}
      className={`pa-stage-tile ${isComplete ? "is-complete" : ""} ${isLocked ? "is-locked" : "is-open"} ${stage === state.platformProgress.unlockedStage ? "is-current" : ""}`}
      key={stage}
      type="button"
      disabled={isLocked}
      onClick={() => beginStage(stage)}
      aria-label={`Fase ${stage}, ${data.subtitle}${isLocked ? ", bloqueada" : isComplete ? ", concluída" : ", disponível"}`}
    >
      <span className="pa-stage-number">{String(data.stageInWorld).padStart(2, "0")}</span>
      <span className={`pa-reward-art ${rewardEarned ? "is-earned" : ""}`}>
        <img src={GAME_ASSETS.decorations[data.reward.id]} alt="" loading="lazy" />
        {!rewardEarned && <span className="pa-lock-badge"><LockKeyhole size={14} /></span>}
      </span>
      <strong>{rewardEarned ? data.reward.name : data.subtitle}</strong>
      <small>{isLocked ? "Conclua a fase anterior" : isComplete ? "Rejogar · prêmio recebido" : rewardEarned ? "Já está na mochila" : "Prêmio ao vencer"}</small>
      {isComplete && <span className="pa-stage-stars" aria-label={`${stars} estrelas`}>{formatStars(stars)}</span>}
      {stage === state.platformProgress.unlockedStage && <span className="pa-ready-pill">JOGAR</span>}
      {isLocked && <span className="pa-tile-lock"><LockKeyhole size={16} /></span>}
      {isComplete && <span className="pa-complete-check"><Check size={12} /></span>}
    </button>;
  }

  return <div className={`platform-adventure ${phase === "playing" || phase === "paused" ? "pa-in-game" : ""}`}>
    <header className="pa-topbar">
      <div className="pa-brand"><span><PawPrint size={24} fill="currentColor" /></span><div><strong>Meu Pet Virtual</strong><small>AVENTURA DA TURMA</small></div></div>
      <div className="pa-mode-switch" aria-label="Modo do jogo"><span className="pa-mode-active"><Gamepad2 size={15} /> Aventura <b>100</b></span><button type="button" onClick={onGoToHouse}><HomeIcon size={15} /> Minha Casa</button></div>
      <button className="pa-creator-badge" type="button" onClick={() => setCreatorOpen(true)} aria-label="Conheça Allana Gabriela, idealizadora do Meu Pet Virtual">
        <span className="pa-creator-emblem" aria-hidden="true">✦</span><span><small>IDEIA QUE VIROU JOGO</small><strong>Allana Gabriela</strong></span><ChevronRight size={15} />
      </button>
      <div className="pa-top-actions">
        <div className="pa-pet-level"><Star size={16} fill="currentColor" /><span>Nível {state.level}</span><small>{state.xp}/{state.xpMax} XP</small></div>
        <div className="pa-wallet"><Coins size={17} fill="currentColor" /><strong>{state.coins.toLocaleString("pt-BR")}</strong></div>
        <button className="pa-icon-button" type="button" onClick={onToggleSound} aria-label={soundOn ? "Desligar efeitos sonoros" : "Ligar efeitos sonoros"} title={soundOn ? "Desligar efeitos sonoros" : "Ligar efeitos sonoros"}>{soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <button className="pa-icon-button" type="button" onClick={() => setSettingsOpen(true)} aria-label="Configurações de áudio" title="Configurações de áudio"><Settings size={18} /></button>
        <button className="pa-icon-button" type="button" onClick={() => setHelpOpen(true)} aria-label="Como jogar"><BookOpen size={18} /></button>
      </div>
    </header>

    {phase === "map" ? <main className="pa-map-layout">
      <aside className="pa-world-story" style={{ "--pa-accent": PLATFORM_PALETTE(world).accent } as React.CSSProperties}>
        <span className="pa-kicker"><Map size={13} /> MAPA DA AVENTURA</span>
        <div className="pa-story-pet"><img src={GAME_ASSETS.characters[state.profile?.characterId ?? "menino-prata"]} alt={state.profile?.name ?? "Seu gatinho"} /><span><b>{state.profile?.name ?? "Seu pet"}</b><small>pronto para explorar</small></span></div>
        <span className="pa-world-number">MUNDO {String(world).padStart(2, "0")} <i>·</i> 10</span>
        <h1>{chapter.location}</h1>
        <p className="pa-world-story-copy">{chapter.story}</p>
        <div className="pa-current-objective"><span><Sparkles size={15} /></span><div><small>DESAFIO DA VEZ</small><strong>{state.platformProgress.unlockedStage <= 100 ? (getPlatformStage(state.platformProgress.unlockedStage)?.subtitle ?? "Todos os mundos celebram!") : "A jornada completa!"}</strong></div></div>
        <div className="pa-world-progress"><div><span>Fases deste mundo</span><strong>{worldDone}/10</strong></div><div className="pa-progress-track"><i style={{ width: `${worldDone * 10}%` }} /></div></div>
        <div className="pa-campaign-progress"><Trophy size={16} /><span><strong>{totalDone} / 100</strong><small>aventuras concluídas</small></span><i>{Math.round(totalDone)}%</i></div>
        <div className="pa-house-link"><Gamepad2 size={15} /><span>Minijogos e cuidados na casa ainda dão <b>XP e moedas</b> para ajudar seu pet a evoluir.</span></div>
      </aside>

      <section className="pa-map-card" aria-label="Mapa de fases">
        <div className="pa-map-heading"><div><span className="pa-kicker">10 MUNDOS · 10 ETAPAS CADA</span><h2>Escolha sua próxima aventura</h2></div><span className="pa-collectible-key"><span className="pa-key-coin">✦</span> Moedas pelo caminho</span></div>
        <div className="pa-world-tabs" role="tablist" aria-label="Mundos da campanha">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((worldId) => {
            const worldData = getPlatformWorld(worldId)!;
            const locked = worldId > availableWorld;
            const done = currentWorldStages.filter((id) => id <= totalDone && Math.ceil(id / 10) === worldId).length;
            return <button className={`${world === worldId ? "active" : ""} ${locked ? "locked" : ""}`} type="button" role="tab" aria-selected={world === worldId} disabled={locked} key={worldId} onClick={() => setWorld(worldId)} title={worldData.location}>
              <span>{locked ? <LockKeyhole size={13} /> : String(worldId).padStart(2, "0")}</span><small>{worldData.location.split(" ").slice(-1)[0]}</small>
            </button>;
          })}
        </div>
        <div className="pa-map-world-caption"><div><span>CASA {world}</span><strong>{chapter.title}</strong></div><span className="pa-map-story-step">{worldDone === 10 ? "MUNDO CONCLUÍDO" : `${worldDone} de 10 fases`}</span></div>
        <div className="pa-stage-carousel-shell">
          <button className="pa-carousel-arrow" type="button" aria-label="Ver fases anteriores" onClick={() => stageCarouselRef.current?.scrollBy({ left: -260, behavior: "smooth" })}><ArrowLeft size={17} /></button>
          <div ref={stageCarouselRef} className="pa-stage-carousel" tabIndex={0} aria-label={`Fases da Casa ${world}; deslize para ver os próximos prêmios`}>
            {currentWorldStages.map(stageTile)}
          </div>
          <button className="pa-carousel-arrow" type="button" aria-label="Ver próximas fases e prêmios bloqueados" onClick={() => stageCarouselRef.current?.scrollBy({ left: 260, behavior: "smooth" })}><ArrowRight size={17} /></button>
        </div>
        <p className="pa-swipe-hint"><ArrowLeft size={11} /> Deslize para conhecer as próximas fases e ver qual decoração será conquistada <ArrowRight size={11} /></p>
        <div className="pa-map-foot"><span><i className="pa-foot-current" /> Sua próxima fase</span><span><LockKeyhole size={12} /> Prêmio bloqueado até vencer</span><button type="button" onClick={onGoToHouse}>Ir para Minha Casa <ChevronRight size={14} /></button></div>
      </section>
    </main> : <main className="pa-play-layout">
      <div className="pa-game-heading"><div><button type="button" className="pa-back-map" onClick={() => { setPhase("map"); setReward(null); }}><ArrowLeft size={15} /> Mapa</button><span className="pa-game-stage">MUNDO {currentStage.world} · FASE {currentStage.stageInWorld}</span><h1>{currentStage.title}</h1><p>{currentStage.objective}</p></div>
        <div className="pa-game-status"><div className="pa-heart-row" aria-label={`${hud.hearts} vidas restantes`}>{Array.from({ length: 3 }, (_, index) => <Heart key={index} size={19} fill={index < hud.hearts ? "currentColor" : "transparent"} className={index < hud.hearts ? "heart-on" : "heart-off"} />)}</div><span className="pa-live-coins"><Coins size={15} fill="currentColor" /> {hud.coins}<small>/{hud.totalCoins}</small></span><button type="button" className="pa-pause-button" onClick={() => setPhase(phase === "paused" ? "playing" : "paused")} aria-label={phase === "paused" ? "Continuar" : "Pausar fase"}>{phase === "paused" ? <Play size={16} /> : <Pause size={16} />}</button></div>
      </div>
      <section className="pa-playfield" aria-label={`Fase ${stageId}: ${currentStage.subtitle}`}>
        <canvas ref={canvasRef} className="pa-canvas" aria-label="Jogo de plataforma: use as setas para correr, espaço para pular e alcance o portal dourado" />
        <div className="pa-canvas-vignette" aria-hidden="true" />
        <div className="pa-level-progress"><span>{hud.checkpoint ? "MARCO ATIVADO" : "RUMO AO PORTAL"}</span><div><i style={{ width: `${hud.progress}%` }} /></div><small>{hud.progress}%</small></div>
        <div className="pa-touch-controls" aria-label="Controles de toque">
          <div className="pa-direction-controls">
            <button type="button" aria-label="Mover para a esquerda" onPointerDown={(event) => setControl("left", true, event)} onPointerUp={(event) => setControl("left", false, event)} onPointerCancel={(event) => setControl("left", false, event)} onLostPointerCapture={() => setControl("left", false)}><ArrowLeft size={26} /></button>
            <button type="button" aria-label="Mover para a direita" onPointerDown={(event) => setControl("right", true, event)} onPointerUp={(event) => setControl("right", false, event)} onPointerCancel={(event) => setControl("right", false, event)} onLostPointerCapture={() => setControl("right", false)}><ArrowRight size={26} /></button>
          </div>
          <button type="button" className="pa-jump-control" aria-label="Pular" onPointerDown={(event) => setControl("jump", true, event)} onPointerUp={(event) => setControl("jump", false, event)} onPointerCancel={(event) => setControl("jump", false, event)} onLostPointerCapture={() => setControl("jump", false)}><span>↑</span><small>PULAR</small></button>
        </div>
        {(phase === "paused" || phase === "failed" || phase === "won") && <div className={`pa-game-overlay ${phase}`} role="dialog" aria-modal="true">
          {phase === "paused" && <div className="pa-end-card"><span className="pa-overlay-icon pause"><Pause size={26} fill="currentColor" /></span><small>FASE {currentStage.id} · PAUSADA</small><h2>Respire um pouquinho</h2><p>Seu progresso e as moedas deste caminho ficam guardados durante a pausa.</p><button className="pa-primary-action" type="button" onClick={() => setPhase("playing")}><Play size={16} fill="currentColor" /> Continuar</button><button className="pa-secondary-action" type="button" onClick={() => setPhase("map")}><Map size={15} /> Voltar ao mapa</button></div>}
          {phase === "failed" && <div className="pa-end-card"><span className="pa-overlay-icon retry"><Heart size={26} /></span><small>AS PATINHAS PRECISAM DE UM DESCANSO</small><h2>Vamos tentar de novo?</h2><p>Você chega mais longe a cada tentativa. O marco ativado ajuda a recomeçar do meio do caminho.</p><button className="pa-primary-action" type="button" onClick={replayStage}><RotateCcw size={16} /> Tentar novamente</button><button className="pa-secondary-action" type="button" onClick={() => setPhase("map")}><Map size={15} /> Escolher outra fase</button></div>}
          {phase === "won" && <div className="pa-end-card pa-reward-card" aria-live="polite">
            <span className={`pa-overlay-icon win pa-reveal-icon step-${rewardStep}`}>{rewardStep === 0 ? <Trophy size={27} fill="currentColor" /> : rewardStep === 1 ? <Sparkles size={27} /> : <Coins size={27} fill="currentColor" />}</span>
            <small>{rewardStep === 0 ? "OBJETIVO CONCLUÍDO" : rewardStep === 1 ? "RECOMPENSA DA FASE" : "MOEDAS CONQUISTADAS"}</small>
            <h2>{rewardStep === 0 ? "Missão cumprida!" : rewardStep === 1 ? (reward?.firstClear ? "Decoração desbloqueada!" : "Decoração já conquistada") : "Olha só o que você ganhou!"}</h2>
            {rewardStep === 0 && <div className="pa-reveal-panel"><div className="pa-win-stars" aria-label={`${state.platformProgress.starsByStage[String(currentStage.id)] ?? starsForRun(hud)} estrelas`}>{formatStars(state.platformProgress.starsByStage[String(currentStage.id)] ?? starsForRun(hud))}</div><p>Você chegou ao portal e concluiu <strong>{currentStage.title}</strong>.</p><small>Prepare as patinhas: sua recompensa está chegando.</small></div>}
            {rewardStep === 1 && (reward?.firstClear ? <div className="pa-stage-reward pa-stage-reward-large"><img src={GAME_ASSETS.decorations[currentStage.reward.id]} alt={currentStage.reward.name} /><div><small>CASA {currentStage.world} · FASE {currentStage.stageInWorld}</small><strong>{currentStage.reward.name}</strong><span>Conquistada e guardada na mochila para decorar Minha Casa.</span></div></div> : <div className="pa-reveal-panel"><p><strong>{currentStage.reward.name}</strong> já tinha sido conquistada nesta fase.</p><small>O replay não duplica decorações.</small></div>)}
            {rewardStep === 2 && <><div className="pa-earned-coins"><Coins size={25} fill="currentColor" /><strong>+{reward?.coins ?? 0}</strong><span>moedas</span></div><p className="pa-reward-caption">{reward?.firstClear ? "As moedas já foram adicionadas à sua carteira." : "Replay concluído: moedas e decoração não são duplicadas."}</p>
              {currentStage.id < 100 && state.platformProgress.unlockedStage > currentStage.id && <button className="pa-primary-action" type="button" onClick={() => beginStage(currentStage.id + 1)}>Próxima fase <ChevronRight size={16} /></button>}
              <button className="pa-secondary-action" type="button" onClick={() => { setPhase("map"); setReward(null); setRewardStep(0); }}><Map size={15} /> Voltar ao mapa</button></>}
            {rewardStep < 2 && <button className="pa-primary-action" type="button" onClick={() => setRewardStep((step) => Math.min(2, step + 1))}>{rewardStep === 0 ? "Ver decoração conquistada" : "Ver moedas da fase"} <ChevronRight size={16} /></button>}
          </div>}
        </div>}
      </section>
      <div className="pa-play-footer"><span><kbd>←</kbd><kbd>→</kbd> mover <kbd>ESPAÇO</kbd> pular</span><span>Alcance o portal e pegue moedas pelo caminho</span><button type="button" onClick={onGoToHouse}><HomeIcon size={14} /> Minha Casa</button></div>
    </main>}

    {helpOpen && <div className="pa-modal-backdrop" onClick={finishGuide}><section className="pa-guide-modal" role="dialog" aria-modal="true" aria-labelledby="pa-guide-title" onClick={(event) => event.stopPropagation()}>
      <button className="pa-modal-close" type="button" onClick={finishGuide} aria-label="Fechar guia"><X size={18} /></button><span className="pa-guide-art"><BookOpen size={25} /></span><small>UM GUIA DE PATINHAS</small><h2 id="pa-guide-title">Como jogar a aventura</h2><div className="pa-guide-steps"><p><b>1</b><span><strong>Escolha uma fase aberta</strong><small>O mapa mostra 10 mundos e 100 etapas. Vença a próxima para abrir o caminho.</small></span></p><p><b>2</b><span><strong>Corra e pule</strong><small>No teclado: setas ou A/D para mover e Espaço, W ou ↑ para pular. No celular: use as setas e o botão PULAR.</small></span></p><p><b>3</b><span><strong>Desvie e colete</strong><small>Evite os guardiões e espinhos, pegue moedas e ative o marco no meio do caminho.</small></span></p><p><b>4</b><span><strong>Entre no portal dourado</strong><small>Ganhe estrelas, moedas e uma decoração nova para a casa deste mundo. Replay não duplica prêmio.</small></span></p></div><div className="pa-guide-note"><Gamepad2 size={16} /><span>Os minijogos e cuidados continuam em Minha Casa e ajudam seu pet a evoluir com XP.</span></div><button className="pa-primary-action" type="button" onClick={finishGuide}>Entendi · vamos brincar <ChevronRight size={16} /></button>
    </section></div>}

    {creatorOpen && <div className="pa-modal-backdrop" onClick={() => setCreatorOpen(false)}><section className="pa-creator-modal" role="dialog" aria-modal="true" aria-labelledby="pa-creator-title" onClick={(event) => event.stopPropagation()}><button className="pa-modal-close" type="button" onClick={() => setCreatorOpen(false)} aria-label="Fechar homenagem"><X size={18} /></button><small>UMA IDEIA QUE VIROU JOGO</small><span className="pa-creator-modal-emblem" aria-hidden="true">✦</span><h2 id="pa-creator-title">Allana Gabriela</h2><p>{CREATOR_COPY}</p><button className="pa-primary-action" type="button" onClick={() => setCreatorOpen(false)}>Voltar à aventura</button></section></div>}

    {settingsOpen && <div className="pa-modal-backdrop" onClick={() => setSettingsOpen(false)}><section className="pa-guide-modal pa-settings-modal" role="dialog" aria-modal="true" aria-labelledby="pa-settings-title" onClick={(event) => event.stopPropagation()}>
      <button className="pa-modal-close" type="button" onClick={() => setSettingsOpen(false)} aria-label="Fechar configurações"><X size={18} /></button>
      <span className="pa-guide-art"><Settings size={23} /></span><small>AJUSTE DO SEU JEITO</small>
      <h2 id="pa-settings-title">Som e música</h2>
      <p className="pa-settings-copy">Regule cada áudio separadamente. Sua escolha fica salva neste aparelho.</p>
      <AudioVolumeControls
        musicVolume={audioMix.music}
        effectsVolume={audioMix.effects}
        onMusicChange={(music) => onAudioMixChange({ ...audioMix, music })}
        onEffectsChange={(effects) => onAudioMixChange({ ...audioMix, effects })}
      />
      <button className="pa-primary-action" type="button" onClick={() => setSettingsOpen(false)}>Pronto <Check size={16} /></button>
    </section></div>}
  </div>;
}

function PLATFORM_PALETTE(world: number) {
  const palettes = ["#ffd45e", "#83d982", "#f18b62", "#ffd46a", "#ff9871", "#8fda77", "#8edcf1", "#e4bb8d", "#b8a0ff", "#ff97b8"];
  return { accent: palettes[world - 1] ?? palettes[0] };
}
