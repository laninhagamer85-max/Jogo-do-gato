import ExplorationItemIcon from "./ExplorationItemIcon";
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Backpack, Hand, Map, Pause, Play, Shield, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { GAME_ASSETS } from '@/game/assets';
import type { PetProfile } from '@/game/PetGame';
import { ForestControls } from '@/game/forestControls';
import type { ForestDirection } from '@/game/forestPuzzle';
import { petWalkAtlas } from '@/game/petWalkAtlas';
import { combatAttack, combatLevel, combatMaxHp, combatSnapshot, COMBAT_ITEMS, consumeCombatItem, createCombatState, equipCombatCharm, pilotRoute, readCombatState, stepCombat, type CombatItem, type CombatPoint, type CombatState } from '@/game/explorationCombat';
import { combatView, drawCombatPilot } from '@/game/explorationCombatView';
import './ExplorationCombatPilot.css';

type Props = { profile: PetProfile | null; progress: Record<string, unknown>; onSave: (save: Record<string, unknown>) => void; onBack: () => void };
type Panel = 'pause' | 'inventory' | 'exit' | null;
export default function ExplorationCombatPilot({ profile, progress, onSave, onBack }: Props) {
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
  const char = profile?.characterId ?? 'menino-preto';
  saveRef.current = onSave; zoomRef.current = zoom;
  function clear() { controls.current.clear(); route.current = []; pending.current = { attack: false, power: false, interact: false }; for (const id of accessibleTimers.current) window.clearTimeout(id); accessibleTimers.current.clear(); }
  function persist() { if (!initial.supported) return; const snapshot = combatSnapshot(current.current), key = JSON.stringify(snapshot); if (key !== lastSaved.current) { lastSaved.current = key; saveRef.current(snapshot); } }
  function openPanel(value: Panel) { clear(); persist(); panelRef.current = value; setPanel(value); }
  function change(next: CombatState) { if (next === current.current) return; current.current = next; setGame(next); persist(); }
  function leave() { clear(); persist(); onBack(); }
  function action(kind: keyof typeof pending.current) { if (!panelRef.current && !overviewRef.current && !current.current.completed) { route.current = []; pending.current[kind] = true; } }
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
    const pet = new Image(); pet.src = GAME_ASSETS.characters[char]; const atlas = new Image(); const url = petWalkAtlas(char); if (url) atlas.src = url;
    let assetsReady = false;
    const checkAssets = () => { if (pet.naturalWidth && atlas.naturalWidth) { assetsReady = true; setAssetStatus('ready'); } };
    pet.onload = checkAssets; atlas.onload = checkAssets;
    pet.onerror = atlas.onerror = () => { assetsReady = false; setAssetStatus('error'); };
    checkAssets();
    const bg = new Image(); bg.src = '/forest-adventure/backgrounds/clearing.webp';
    let w = 1, h = 1, last = 0, ui = 0, savedAt = 0, frame = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => { const r = el.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); const dpr = Math.min(2, window.devicePixelRatio || 1); el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const loop = (now: number) => {
      const dt = last ? Math.min(50, now - last) : 0; last = now;
      if (assetsReady && !panelRef.current && !overviewRef.current && !document.hidden && !current.current.completed) {
        const held = controls.current.snapshot(); let dx = Number(held.right) - Number(held.left), dy = Number(held.down) - Number(held.up);
        if (dx || dy) route.current = [];
        else if (route.current.length) {
          const target = route.current[0], distance = Math.hypot(target.x - current.current.player.x, target.y - current.current.player.y);
          if (distance < .06) route.current.shift();
          else { const scale = Math.min(1, distance / Math.max(.001, dt * .003)); dx = (target.x - current.current.player.x) / distance * scale; dy = (target.y - current.current.player.y) / distance * scale; }
        }
        const urgent = pending.current.attack || pending.current.power || pending.current.interact;
        const before = current.current;
        current.current = stepCombat(before, { dx, dy, ...pending.current }, dt);
        pending.current = { attack: false, power: false, interact: false };
        if (current.current.deaths !== before.deaths || current.current.completed) clear();
        const changedEvent = urgent || current.current.xp !== before.xp || current.current.collectedNodes.length !== before.collectedNodes.length || current.current.loot.length !== before.loot.length || current.current.feedback.length !== before.feedback.length || current.current.hp !== before.hp || current.current.completed;
        if (changedEvent || now - savedAt > 1000) { persist(); savedAt = now; }
        if (now - ui > 100 || current.current.completed) { setGame(current.current); ui = now; }
      }
      drawCombatPilot(ctx, w, h, current.current, pet, atlas, bg, zoomRef.current, overviewRef.current, reduced.matches);
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
  const moveDown = (direction: ForestDirection) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault(); if (panelRef.current || current.current.completed) return;
    overviewRef.current = false; setOverview(false); route.current = []; event.currentTarget.setPointerCapture(event.pointerId); controls.current.pointerDown(event.pointerId, direction);
  };
  const moveUp = (event: PointerEvent<HTMLButtonElement>) => { controls.current.pointerUp(event.pointerId); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); };
  const fibers = game.stock.fibra + game.bag.fibra;
  const canUse = (item: 'erva' | 'fruta') => !game.completed && game.stock[item] + game.bag[item] > 0 && (item === 'erva' ? game.hp < combatMaxHp(game.xp) : game.energy < 100);
  const useItem = (item: 'erva' | 'fruta') => { if (!panelRef.current && !overviewRef.current) change(consumeCombatItem(current.current, item)); };
  const modalTitle = panel === 'inventory' ? 'Mochila da Exploração' : panel === 'exit' ? 'Voltar aos capítulos?' : 'Clareira pausada';
  if (!initial.supported) return <section className="combat-pilot combat-unavailable"><h1>Atualize o jogo para continuar</h1><p>Este progresso pertence a uma versão mais nova e foi preservado.</p><button onClick={onBack}>Voltar à Exploração</button></section>;
  return <section className="combat-pilot" aria-label="Exploração, sala piloto de combate">
    <header className="combat-top"><div><small>SALA PILOTO · CLAREIRA</small><h1>{profile?.name ?? 'Seu pet'} · Nv {combatLevel(game.xp)}</h1></div><div><span>XP {game.xp} / {combatLevel(game.xp) ** 2 * 40}</span><button ref={pauseButton} onClick={() => openPanel('pause')} aria-label="Pausar exploração"><Pause size={21} /></button></div></header>
    <div className="combat-stage">
      {assetStatus !== 'ready' && <div className="combat-result" role="status"><h2>{assetStatus === 'error' ? 'Não foi possível carregar seu pet' : 'Preparando a caminhada…'}</h2><p>{assetStatus === 'error' ? 'Volte ao mapa e tente novamente. Seu progresso foi preservado.' : 'A sala começa quando a animação estiver pronta.'}</p><button onClick={leave}>Voltar ao mapa</button></div>}
      <canvas ref={canvas} aria-label="Clareira de combate. Setas ou WASD movem. E ou Espaço: patada. Q: poder. F: marco. I: mochila." onPointerUp={event => {
        if (panelRef.current || overviewRef.current || current.current.completed) return;
        const r = event.currentTarget.getBoundingClientRect(), v = combatView(r.width, r.height, current.current.player, zoom, false);
        route.current = pilotRoute(current.current.player, { x: (event.clientX - r.left - v.left) / v.tile, y: (event.clientY - r.top - v.top) / v.tile }, current.current.gateOpen);
      }} />
      <div className="combat-vitals"><label>HP <strong>{Math.ceil(game.hp)}/{combatMaxHp(game.xp)}</strong><progress value={game.hp} max={combatMaxHp(game.xp)} aria-label="Vida do pet" /></label><label>Energia <strong>{Math.floor(game.energy)}/100</strong><progress value={game.energy} max={100} aria-label="Energia de combate" /></label></div>
      <nav className="combat-camera" aria-label="Câmera"><button aria-label="Reduzir zoom do cenário" disabled={zoom <= 1 || overview} onClick={() => setZoom(z => Math.max(1, z - .25))}><ZoomOut size={18} /></button><button aria-label="Aumentar zoom do cenário" disabled={zoom >= 2 || overview} onClick={() => setZoom(z => Math.min(2, z + .25))}><ZoomIn size={18} /></button><button onClick={viewRoom} aria-pressed={overview}><Map size={17} />{overview ? 'Voltar ao pet' : 'Ver sala'}</button></nav>
      <div className="combat-objective"><ExplorationItemIcon item="fibra" size={23} /><span>{Math.min(6, fibers)}/6 fibras</span><span>{game.defeated > 0 ? "✓" : "0/1"} adversário</span><span>{game.gateOpen ? "Siga até a saída" : "Ative o marco"}</span></div>
      <div className="combat-goal" role="status">{overview ? 'Inspeção pausada · Voltar ao pet retoma' : game.message}</div>
      {!game.completed && <div className="combat-item-tray" aria-label="Itens e uso rápido">
        <span className="combat-collect-slot" title="Fibras coletadas"><ExplorationItemIcon item="fibra" size={28}/><small>{fibers}/6</small></span>
        <span className="combat-collect-slot" title="Âmbar coletado"><ExplorationItemIcon item="ambar" size={28}/><small>{game.stock.ambar + game.bag.ambar}</small></span>
        {(['erva', 'fruta'] as const).map(item => <button key={item} disabled={!canUse(item) || Boolean(panel) || overview} onClick={() => useItem(item)} aria-label={`Usar ${COMBAT_ITEMS[item]}, ${game.stock[item] + game.bag[item]} disponível, recupera até ${item === 'erva' ? '35 HP' : '30 de energia'}`} title={item === 'erva' ? 'Usar erva: até +35 HP' : 'Usar fruta: até +30 energia'}><ExplorationItemIcon item={item} size={30}/><span>{game.stock[item] + game.bag[item]}</span><small>{item === 'erva' ? 'Curar' : 'Energia'}</small></button>)}
      </div>}
      {!game.completed && <div className="combat-controls">
        <div className="combat-dpad" aria-label="Movimento">{([['up', ArrowUp], ['left', ArrowLeft], ['down', ArrowDown], ['right', ArrowRight]] as const).map(([direction, Icon]) => <button key={direction} className={`combat-${direction}`} aria-label={`Mover ${ { up: 'para cima', left: 'para esquerda', down: 'para baixo', right: 'para direita' }[direction]}`} onPointerDown={moveDown(direction)} onPointerUp={moveUp} onPointerCancel={moveUp} onLostPointerCapture={moveUp} onClick={e => {
          if (e.detail !== 0 || panelRef.current) return; overviewRef.current = false; setOverview(false);
          route.current = []; const key = `accessible-${performance.now()}`; controls.current.keyDown(key, direction);
          const id = window.setTimeout(() => { controls.current.keyUp(key); accessibleTimers.current.delete(id); }, 160); accessibleTimers.current.add(id);
        }}><Icon /></button>)}</div>
        <div className="combat-actions">{(['attack', 'power', 'interact'] as const).map((kind, index) => <button key={kind} disabled={Boolean(panel) || overview || (kind === 'power' && game.energy < 25)} aria-label={['Patada, E ou espaço', 'Poder, Q, custa 25 de energia', 'Interagir com marco, F'][index]} onPointerDown={e => { e.preventDefault(); action(kind); }} onClick={e => { if (e.detail === 0) action(kind); }}>{index === 0 ? <Hand /> : index === 1 ? <Sparkles /> : <Shield />}<span>{['Patada', 'Poder', 'Marco'][index]}</span></button>)}<button onClick={() => openPanel('inventory')} aria-label="Abrir mochila, I"><Backpack /><span>Mochila</span></button></div>
      </div>}
      {game.completed && <div className="combat-victory"><h2>Sala piloto concluída!</h2><p>Coleta guardada. Broche da Clareira conquistado. Esta é a primeira sala em desenvolvimento, não os 60 níveis completos.</p><button onClick={leave}>Voltar aos capítulos</button></div>}
    </div>
    <dialog ref={dialog} className="combat-dialog" aria-labelledby="combat-dialog-title" onCancel={event => { event.preventDefault(); openPanel(null); }} onClose={() => { if (panelRef.current) openPanel(null); }}>
      <h2 id="combat-dialog-title">{modalTitle}</h2>
      {panel === 'inventory' ? <><p>Materiais da sala podem perder 10% na derrota. Estoque guardado e equipamentos são preservados.</p><div className="combat-inventory-grid">{(Object.keys(COMBAT_ITEMS) as CombatItem[]).map(item => <div className="combat-item-card" key={item}><ExplorationItemIcon item={item} size={48}/><strong>{COMBAT_ITEMS[item]}</strong><span>{game.stock[item] + game.bag[item]} no total</span><small>{game.bag[item]} na sala · {game.stock[item]} guardado(s)</small>{(item === 'erva' || item === 'fruta') && <button disabled={!canUse(item)} onClick={() => { change(consumeCombatItem(current.current, item)); openPanel(null); }}>Usar · {item === 'erva' ? '+35 HP' : '+30 energia'}</button>}</div>)}</div><p>Ataque: {combatAttack(game)} · retornos ao ponto seguro: {game.deaths}</p><button className="combat-equipment" disabled={!game.equipmentOwned} onClick={() => change(equipCombatCharm(current.current))}><ExplorationItemIcon item="broche" size={35}/>{game.equipmentOwned ? game.equipmentOn ? 'Retirar Broche (+4 ataque)' : 'Equipar Broche (+4 ataque)' : 'Broche: conquiste ao concluir a sala'}</button></> : panel === 'exit' ? <p>Seu nível de combate, HP, inimigos e coleta serão mantidos para continuar depois.</p> : <><p>WASD/Setas ou toque no chão movem. E/Espaço: patada à frente. Q: poder ao redor. F: marco. I: mochila.</p><p>Consiga seis fibras e vença um besouro. Ative o marco e siga até a saída. Nv 3 indica um adversário mais forte. O círculo do acampamento é seguro.</p></>}
      <div className="combat-dialog-actions"><button autoFocus onClick={() => openPanel(null)}><Play size={16} />{panel === 'exit' ? 'Continuar aqui' : 'Retomar'}</button>{panel === 'exit' ? <button onClick={leave}>Salvar e voltar</button> : <button onClick={() => openPanel('exit')}>Voltar aos capítulos</button>}</div>
    </dialog>
  </section>;
}
