import ExplorationMinimap from './ExplorationMinimap';
import CombatInventory from "./CombatInventory";
import ExplorationJoystick from "./ExplorationJoystick";
import { playPlatformSfx, unlockPlatformAudio } from "@/game/platformerAudio";
import ExplorationItemIcon from "./ExplorationItemIcon";
import { useEffect, useRef, useState } from 'react';
import { Backpack, Map, Pause, Play, Shield, Sparkles, ZoomIn, ZoomOut, Volume2, VolumeX, PawPrint, X } from 'lucide-react';
import { GAME_ASSETS } from '@/game/assets';
import type { PetProfile } from '@/game/PetGame';
import { ForestControls } from '@/game/forestControls';
import type { ForestDirection } from '@/game/forestPuzzle';
import { petWalkAtlas } from '@/game/petWalkAtlas';
import { combatAttack, combatLevel, combatMaxHp, combatSnapshot, COMBAT_ITEMS, consumeCombatItem, createCombatState, equipCombatCharm, pilotRoute, readCombatState, replayCompletedCombat, stepCombat, type CombatItem, type CombatPoint, type CombatState } from '@/game/explorationCombat';
import { combatCanvasScale, combatView, drawCombatPilot } from '@/game/explorationCombatView';
import {FOREST_NATURE} from '@/game/forestNature';
import {PILOT_SHELTER} from '@/game/explorationRoom';
import './ExplorationCombatPilot.css';

type Props = { soundOn: boolean; onToggleSound: () => void; profile: PetProfile | null; progress: Record<string, unknown>; onSave: (save: Record<string, unknown>) => void; onBack: () => void };
type Panel = 'pause' | 'inventory' | 'exit' | null;
export default function ExplorationCombatPilot({ profile, progress, onSave, onBack, soundOn, onToggleSound }: Props) {
  const [initial] = useState(() => readCombatState(progress));
  const [game, setGame] = useState<CombatState>(() => initial.supported ? initial.state : createCombatState());
  const current = useRef(game), saveRef = useRef(onSave), controls = useRef(new ForestControls());
  const pending = useRef({ attack: false, power: false, interact: false });
  const route = useRef<CombatPoint[]>([]), panelRef = useRef<Panel>(null), overviewRef = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null), dialog = useRef<HTMLDialogElement>(null), pauseButton = useRef<HTMLButtonElement>(null);
  const [assetStatus, setAssetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [panel, setPanel] = useState<Panel>(null), [overview, setOverview] = useState(false), [zoom, setZoom] = useState(1);
  const zoomRef = useRef(zoom), lastSaved = useRef('');
  const accessibleTimers = useRef(new Set<number>());
  const stick = useRef({ x: 0, y: 0, pointer: -1 });
  const soundRef = useRef(soundOn); soundRef.current = soundOn;
  const char = profile?.characterId ?? 'menino-preto';
  saveRef.current = onSave; zoomRef.current = zoom;
  function clear() { stick.current = { x: 0, y: 0, pointer: -1 }; controls.current.clear(); route.current = []; pending.current = { attack: false, power: false, interact: false }; for (const id of accessibleTimers.current) window.clearTimeout(id); accessibleTimers.current.clear(); }
  function persist() { if (!initial.supported) return; const snapshot = combatSnapshot(current.current), key = JSON.stringify(snapshot); if (key !== lastSaved.current) { lastSaved.current = key; saveRef.current(snapshot); } }
  function openPanel(value: Panel) { clear(); persist(); panelRef.current = value; setPanel(value); }
  function change(next: CombatState) { if (next === current.current) return; current.current = next; setGame(next); persist(); }
  function replay() { clear(); overviewRef.current = false; setOverview(false); panelRef.current = null; setPanel(null); change(replayCompletedCombat(current.current)); }
  function leave() { clear(); persist(); onBack(); }
  function action(kind: keyof typeof pending.current) { if (!panelRef.current && !overviewRef.current && !current.current.completed) { unlockPlatformAudio(); route.current = []; pending.current[kind] = true; } }
  function viewRoom() { clear(); overviewRef.current = !overviewRef.current; setOverview(overviewRef.current); }

  useEffect(() => {
    const el = dialog.current;
    if (panel && el && !el.open) el.showModal();
    else if (!panel && el?.open) el.close();
    if (!panel) pauseButton.current?.focus();
  }, [panel]);
  useEffect(() => {
    if (!initial.supported) return;
    const el = canvas.current, ctx = el?.getContext('2d'); if (!el || !ctx) return;
    const props = new Image(); props.src = '/forest-adventure/woodland-props-v2.png';
    const garden = new Image(); garden.src = FOREST_NATURE.garden.asset;
    const portal = new Image(); portal.src = '/forest-adventure/woodland-portal-v1.webp';
    const shelter = new Image(); shelter.src = PILOT_SHELTER.asset;
    const enemies = new Image(); enemies.src = '/forest-adventure/enemies-illustrated-v1.png';
    const pet = new Image(); pet.src = GAME_ASSETS.characters[char]; const atlas = new Image(); const url = petWalkAtlas(char); if (url) atlas.src = url;
    const itemArt=Object.fromEntries(Object.keys(COMBAT_ITEMS).map(id=>{const image=new Image();image.src='/forest-adventure/items/'+id+'.svg';return [id,image];})) as Record<CombatItem,HTMLImageElement>;
    const bg = new Image(); bg.src = '/forest-adventure/ground-proposals-20261016/option-3.webp';
    let assetsReady = false;
    const checkAssets = () => { if (pet.naturalWidth && atlas.naturalWidth && enemies.naturalWidth && props.naturalWidth && garden.naturalWidth && shelter.naturalWidth && portal.naturalWidth && bg.naturalWidth && Object.values(itemArt).every(image=>image.naturalWidth)) { assetsReady = true; setAssetStatus('ready'); } };
    pet.onload = checkAssets; atlas.onload = checkAssets; enemies.onload = checkAssets; props.onload = checkAssets; garden.onload = checkAssets; bg.onload = checkAssets;
    shelter.onload=checkAssets; portal.onload=checkAssets;
    pet.onerror = atlas.onerror = enemies.onerror = props.onerror = garden.onerror = bg.onerror = () => { assetsReady = false; setAssetStatus('error'); };
    shelter.onerror=pet.onerror; portal.onerror=pet.onerror;
    Object.values(itemArt).forEach(image=>{image.onload=checkAssets;image.onerror=()=>{assetsReady=false;setAssetStatus('error');};});
    checkAssets();
    let w = 1, h = 1, last = 0, ui = 0, savedAt = 0, frame = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => { const r = el.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); const dpr = combatCanvasScale(w,h,window.devicePixelRatio || 1); el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const loop = (now: number) => {
      const dt = last ? Math.min(50, now - last) : 0; last = now;
      if (assetsReady && !panelRef.current && !overviewRef.current && !document.hidden && !current.current.completed) {
        const held = controls.current.snapshot(); let dx = Number(held.right) - Number(held.left) || stick.current.x, dy = Number(held.down) - Number(held.up) || stick.current.y;
        if (dx || dy) route.current = [];
        else if (route.current.length) {
          const target = route.current[0], distance = Math.hypot(target.x - current.current.player.x, target.y - current.current.player.y);
          if (distance < .06) route.current.shift();
          else { const scale = Math.min(1, distance / Math.max(.001, dt * .003)); dx = (target.x - current.current.player.x) / distance * scale; dy = (target.y - current.current.player.y) / distance * scale; }
        }
        const urgent = pending.current.attack || pending.current.power || pending.current.interact;
        const before = current.current;
        current.current = stepCombat(before, { dx, dy, ...pending.current }, dt);
        if (soundRef.current) {
          if (current.current.strikeUntil !== before.strikeUntil && current.current.strikeUntil > current.current.time) playPlatformSfx(pending.current.power ? 'combat-power' : 'paw');
          if (current.current.hp < before.hp || current.current.deaths > before.deaths) playPlatformSfx('hurt');
          if (current.current.loot.length < before.loot.length || current.current.collectedNodes.length > before.collectedNodes.length) playPlatformSfx('combat-pickup');
        }
        pending.current = { attack: false, power: false, interact: false };
        if (current.current.deaths !== before.deaths || current.current.completed) clear();
        const changedEvent = urgent || current.current.xp !== before.xp || current.current.collectedNodes.length !== before.collectedNodes.length || current.current.loot.length !== before.loot.length || current.current.feedback.length !== before.feedback.length || current.current.hp !== before.hp || current.current.completed;
        if (changedEvent || now - savedAt > 1000) { persist(); savedAt = now; }
        if (now - ui > 100 || current.current.completed) { setGame(current.current); ui = now; }
      }
      drawCombatPilot(ctx, w, h, current.current, pet, atlas, bg, zoomRef.current, overviewRef.current, reduced.matches, enemies, props, itemArt,garden,shelter,portal);
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => { window.cancelAnimationFrame(frame); observer.disconnect(); clear(); };
  }, [char, initial.supported]);

  useEffect(() => {
    if (!initial.supported) return;
    const map: Record<string, ForestDirection> = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase(); if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
      if (panelRef.current) return;
      if (map[key] || [' ', 'e', 'q', 'f', 'i', 'escape', 'p'].includes(key)) event.preventDefault();
      if (map[key]) { overviewRef.current = false; setOverview(false); controls.current.keyDown(key, map[key]); }
      else if (!event.repeat && [' ', 'e'].includes(key)) action('attack');
      else if (!event.repeat && key === 'q') action('power');
      else if (!event.repeat && key === 'f') action('interact');
      else if (!event.repeat && key === 'i') openPanel('inventory');
      else if (!event.repeat && ['escape', 'p'].includes(key)) openPanel('pause');
    };
    const up = (event: KeyboardEvent) => controls.current.keyUp(event.key.toLowerCase());
    const hidden = () => { if (document.hidden) openPanel('pause'); };
    const blur = () => { clear(); openPanel('pause'); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', hidden);
    return () => { clear(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', hidden); };
  }, [initial.supported]);
  const fibers = game.stock.fibra + game.bag.fibra;
  const canUse = (item: 'erva' | 'fruta') => !game.completed && game.stock[item] + game.bag[item] > 0 && (item === 'erva' ? game.hp < combatMaxHp(game.xp) : game.energy < 100);
  const useItem = (item: 'erva' | 'fruta') => { if (!panelRef.current && !overviewRef.current) change(consumeCombatItem(current.current, item)); };
  const modalTitle = panel === 'inventory' ? 'Mochila da Exploração' : panel === 'exit' ? 'Voltar aos capítulos?' : 'Clareira pausada';
  if (!initial.supported) return <section className="combat-pilot combat-unavailable"><h1>Atualize o jogo para continuar</h1><p>Este progresso pertence a uma versão mais nova e foi preservado.</p><button onClick={onBack}>Voltar à Exploração</button></section>;
  return <section className="combat-pilot" aria-label="Exploração, sala piloto de combate">
    <header className="combat-top"><div><small>SALA PILOTO · CLAREIRA</small><h1>{profile?.name ?? 'Seu pet'} · Nv {combatLevel(game.xp)}</h1></div><div><span>XP {game.xp} / {combatLevel(game.xp) ** 2 * 40}</span><button onClick={onToggleSound} aria-label={soundOn ? "Silenciar efeitos" : "Ativar efeitos"} aria-pressed={soundOn}>{soundOn ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button><button onClick={() => openPanel('inventory')} aria-label="Abrir mochila"><Backpack size={19}/></button><button ref={pauseButton} onClick={() => openPanel('pause')} aria-label="Pausar exploração"><Pause size={21} /></button></div></header>
    <div className="combat-stage">
      {assetStatus !== 'ready' && <div className="combat-result" role="status"><h2>{assetStatus === 'error' ? 'Não foi possível carregar seu pet' : 'Preparando a caminhada…'}</h2><p>{assetStatus === 'error' ? 'Volte ao mapa e tente novamente. Seu progresso foi preservado.' : 'A sala começa quando a animação estiver pronta.'}</p><button onClick={leave}>Voltar ao mapa</button></div>}
      <canvas ref={canvas} aria-label="Clareira de combate. Joystick, setas ou WASD movem. E ou Espaço: patada. Q: poder. F: marco. I: mochila." onPointerUp={event => {
        if (panelRef.current || overviewRef.current || current.current.completed) return;
        const r = event.currentTarget.getBoundingClientRect(), v = combatView(r.width, r.height, current.current.player, zoom, false);
        route.current = pilotRoute(current.current.player, { x: (event.clientX - r.left - v.left) / v.tile, y: (event.clientY - r.top - v.top) / v.tile }, current.current.gateOpen);
      }} />
      <div className="combat-vitals"><label>HP <strong>{Math.ceil(game.hp)}/{combatMaxHp(game.xp)}</strong><progress value={game.hp} max={combatMaxHp(game.xp)} aria-label="Vida do pet" /></label><label>Energia <strong>{Math.floor(game.energy)}/100</strong><progress value={game.energy} max={100} aria-label="Energia de combate" /></label></div>
      <ExplorationMinimap state={game}/>
      <nav className="combat-camera" aria-label="Câmera"><button aria-label="Reduzir zoom do cenário" disabled={zoom <= 1 || overview} onClick={() => setZoom(z => Math.max(1, z - .25))}><ZoomOut size={18} /></button><button aria-label="Aumentar zoom do cenário" disabled={zoom >= 2 || overview} onClick={() => setZoom(z => Math.min(2, z + .25))}><ZoomIn size={18} /></button><button onClick={viewRoom} aria-pressed={overview}><Map size={17} />{overview ? 'Voltar ao pet' : 'Ver sala'}</button></nav>
      <div className="combat-objective"><ExplorationItemIcon item="fibra" size={23} /><span>{Math.min(6, fibers)}/6 fibras</span><span>{game.defeated > 0 ? "✓" : "0/1"} adversário</span><span>{game.gateOpen ? "Siga até a saída" : "Ative o marco"}</span></div>
      <div className="combat-goal" role="status">{overview ? 'Inspeção pausada · Voltar ao pet retoma' : game.message}</div>
      {!game.completed && <div className="combat-item-tray" aria-label="Itens e uso rápido">
        <span className="combat-collect-slot" title="Fibras coletadas"><ExplorationItemIcon item="fibra" size={28}/><small>{Math.min(6, fibers)}/6</small></span>
        <span className="combat-collect-slot" title="Âmbar coletado"><ExplorationItemIcon item="ambar" size={28}/><small>{game.stock.ambar + game.bag.ambar}</small></span>
        {(['erva', 'fruta'] as const).map(item => <button key={item} disabled={!canUse(item) || Boolean(panel) || overview} onClick={() => useItem(item)} aria-label={`Usar ${COMBAT_ITEMS[item]}, ${game.stock[item] + game.bag[item]} disponível, recupera até ${item === 'erva' ? '35 HP' : '30 de energia'}`} title={item === 'erva' ? 'Usar erva: até +35 HP' : 'Usar fruta: até +30 energia'}><ExplorationItemIcon item={item} size={30}/><span>{game.stock[item] + game.bag[item]}</span><small>{item === 'erva' ? 'Curar' : 'Energia'}</small></button>)}
      </div>}
      {!game.completed && <div className="combat-controls">
        <ExplorationJoystick disabled={Boolean(panel) || overview || game.completed} onChange={value=>{stick.current={...value,pointer:-1};if(value.x||value.y){route.current=[];}}}/>

        <div className="combat-actions">{(['attack', 'power', 'interact'] as const).map((kind, index) => <button className={`combat-action-${kind}`} key={kind} disabled={Boolean(panel) || overview || (kind === 'power' && game.energy < 25)} aria-label={['Patada, E ou espaço', 'Poder, Q, custa 25 de energia', 'Interagir com marco, F'][index]} onPointerDown={e => { e.preventDefault(); action(kind); }} onClick={e => { if (e.detail === 0) action(kind); }}>{index === 0 ? <PawPrint /> : index === 1 ? <Sparkles /> : <Shield />}<span>{['Atacar', 'Poder', 'Marco'][index]}</span></button>)}</div>
      </div>}
      {game.completed && <div className="combat-victory"><h2>Sala piloto concluída!</h2><p>Coleta guardada. Você pode repetir para explorar e testar novamente, mantendo seu nível, inventário e broche. O bônus de conclusão não é entregue outra vez.</p><button onClick={replay}>Repetir sala piloto</button><button onClick={leave}>Voltar aos capítulos</button></div>}
    </div>
    <dialog ref={dialog} className={`combat-dialog ${panel === 'inventory' ? 'combat-dialog-inventory' : ''}`} aria-labelledby="combat-dialog-title" onCancel={event => { event.preventDefault(); openPanel(null); }} onClose={() => { if (panelRef.current) openPanel(null); }}>
      <header className="combat-dialog-heading"><h2 id="combat-dialog-title">{modalTitle}</h2>{panel === 'inventory' && <button onClick={() => openPanel(null)} aria-label="Fechar mochila e retomar"><X size={20}/></button>}</header>
      {panel === 'inventory' ? <CombatInventory game={game} onUse={item => change(consumeCombatItem(current.current, item))} onEquip={() => change(equipCombatCharm(current.current))} /> : panel === 'exit' ? <p>Seu nível de combate, HP, inimigos e coleta serão mantidos para continuar depois.</p> : <><p>Arraste o direcional, use WASD/Setas ou toque no chão para mover. E/Espaço: patada à frente. Q: poder ao redor. F: marco. I: mochila.</p><p>Consiga seis fibras e vença um besouro. Ative o marco e siga até a saída. Nv 3 indica um adversário mais forte. O círculo do acampamento é seguro.</p></>}
      {panel !== 'inventory' && <div className="combat-dialog-actions"><button autoFocus onClick={() => openPanel(null)}><Play size={16} />{panel === 'exit' ? 'Continuar aqui' : 'Retomar'}</button>{panel === 'exit' ? <button onClick={leave}>Salvar e voltar</button> : <button onClick={() => openPanel('exit')}>Voltar aos capítulos</button>}</div>}
    </dialog>
  </section>;
}
