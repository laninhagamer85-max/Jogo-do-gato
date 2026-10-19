import {shouldRunExplorationFrame,shouldDrawExplorationFrame} from '@/game/explorationFramePolicy';
import {ExplorationAudio,loadExplorationAudio} from '@/game/explorationAudio';
import {campaignRoom,EXPLORATION_ROOMS,chapterName,chapterNumber,roomInChapter} from '@/game/explorationCampaign';
import {lensDockAction,lensDockLayout,toggleWorldCameraZoom,type ExplorationPanel} from '@/game/explorationLens';
import ExplorationMinimap from './ExplorationMinimap';
import CombatInventory from "./CombatInventory";
import ExplorationJoystick from "./ExplorationJoystick";
import { unlockPlatformAudio } from "@/game/platformerAudio";
import ExplorationItemIcon from "./ExplorationItemIcon";
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Backpack, Map, Pause, Play, Shield, Sparkles, Plus, Minus, ZoomIn, ZoomOut, Volume2, VolumeX, PawPrint, X } from 'lucide-react';
import { GAME_ASSETS } from '@/game/assets';
import type { PetProfile } from '@/game/PetGame';
import { ForestControls } from '@/game/forestControls';
import type { ForestDirection } from '@/game/forestPuzzle';
import { petWalkAtlas } from '@/game/petWalkAtlas';
import { bossCardForRoom,tickCombatPortal,equipCombatCard,useRareCombatItem,COMBAT_CARDS, combatAttack, combatLevel, combatMaxHp, combatSnapshot, COMBAT_ITEMS, consumeCombatItem, createCombatState, equipCombatCharm, pilotRoute, readCombatState, stepCombat, type CombatItem, type CombatPoint, type CombatState } from '@/game/explorationCombat';
import { combatCanvasScale, combatView, drawCombatPilot } from '@/game/explorationCombatView';
import {FOREST_NATURE} from '@/game/forestNature';
import {PILOT_SHELTER} from '@/game/explorationRoom';
import './ExplorationCombatPilot.css';

type Props = { replayMode?:boolean; soundOn: boolean; onToggleSound: () => void; profile: PetProfile | null; progress: Record<string, unknown>; onSave: (save: Record<string, unknown>) => void; onBack: () => void };
type Panel = ExplorationPanel;
export default function ExplorationCombatPilot({ profile, progress, onSave, onBack, soundOn, onToggleSound,replayMode=false }: Props) {
  const [initial] = useState(() => readCombatState(progress));
  const [game, setGame] = useState<CombatState>(() => initial.supported ? initial.state : createCombatState());
  const replayElapsed=useRef(0),backRef=useRef(onBack);backRef.current=onBack;
  const current = useRef(game), saveRef = useRef(onSave), controls = useRef(new ForestControls());
  const pending = useRef({ attack: false, power: false, interact: false });
  const route = useRef<CombatPoint[]>([]), panelRef = useRef<Panel>(null), overviewRef = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null), dialog = useRef<HTMLDialogElement>(null), pauseButton = useRef<HTMLButtonElement>(null);
  const [assetStatus, setAssetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [panel, setPanel] = useState<Panel>(null), [overview, setOverview] = useState(false), [zoom, setZoom] = useState(1);
  const [audioMix]=useState(loadExplorationAudio);
  const audio=useRef<ExplorationAudio|null>(null),mixRef=useRef(audioMix);mixRef.current=audioMix;
  useEffect(()=>{const controller=new ExplorationAudio();audio.current=controller;return()=>{controller.dispose();audio.current=null;};},[]);
  useEffect(()=>{audio.current?.configure(audioMix,soundOn&&!panel&&!overview&&assetStatus==='ready'&&!game.completed);},[audioMix,soundOn,panel,overview,assetStatus,game.completed]);
  const [lensExpanded,setLensExpanded]=useState(false);
  const [viewport,setViewport]=useState(()=>({width:typeof window==='undefined'?390:window.innerWidth,height:typeof window==='undefined'?844:window.innerHeight}));
  const zoomRef = useRef(zoom), lastSaved = useRef('');
  const accessibleTimers = useRef(new Set<number>());
  const stick = useRef({ x: 0, y: 0, pointer: -1 });
  const soundRef = useRef(soundOn); soundRef.current = soundOn;
  const char = profile?.characterId ?? 'menino-preto';
  saveRef.current = onSave; zoomRef.current = zoom;
  function clear() { stick.current = { x: 0, y: 0, pointer: -1 }; controls.current.clear(); route.current = []; pending.current = { attack: false, power: false, interact: false }; for (const id of accessibleTimers.current) window.clearTimeout(id); accessibleTimers.current.clear(); }
  function persist() { if (!initial.supported) return; const snapshot = combatSnapshot(current.current), key = JSON.stringify(snapshot); if (key !== lastSaved.current) { lastSaved.current = key; saveRef.current(snapshot); } }
  function openPanel(value: Panel) { clear(); persist(); overviewRef.current=false;setOverview(false);panelRef.current = value; setPanel(value); }
  function change(next: CombatState) { if (next === current.current) return; current.current = next; setGame(next); persist(); }
  function leave() { clear(); persist(); onBack(); }
  function action(kind: keyof typeof pending.current) { if (!panelRef.current && !overviewRef.current && !current.current.completed) { unlockPlatformAudio(); audio.current?.unlock(); route.current = []; pending.current[kind] = true; } }
  function dockAction(action:'pause'|'inventory'|'map'){
    const next=lensDockAction(panelRef.current,overviewRef.current,action);
    clear();persist();overviewRef.current=next.overview;setOverview(next.overview);panelRef.current=next.panel;setPanel(next.panel);
  }
  function viewRoom(){dockAction('map');}

  useEffect(() => {
    const el=dialog.current;if(!el)return;
    if(panel&&!el.open)el.showModal();
    if(!panel&&el.open){el.close();pauseButton.current?.focus();}
  },[panel]);
  useEffect(()=>{const resize=()=>setViewport({width:window.innerWidth,height:window.innerHeight});window.addEventListener('resize',resize);resize();return ()=>window.removeEventListener('resize',resize);},[]);
  useEffect(() => {
    if (!initial.supported) return;
    const el = canvas.current, ctx = el?.getContext('2d'); if (!el || !ctx) return;
    const props = new Image(); props.src = '/forest-adventure/woodland-props-v2.png';
    const garden = new Image(); garden.src = FOREST_NATURE.garden.asset;
    const mobs = new Image();mobs.src='/forest-adventure/forest-mobs-v1.webp';
    const riverMobs=new Image();riverMobs.src='/forest-adventure/river-mobs-v1.webp';
    const riverProps=new Image();riverProps.src='/forest-adventure/river-props-v1.webp';
    const riverPortal=new Image();riverPortal.src='/forest-adventure/river-portal-v1.webp';
    const water=new Image();water.src='/forest-adventure/painted-water-v1.webp';
    const rareArt = new Image();rareArt.src='/forest-adventure/forest-rare-items-v1.webp';
    const bridge = new Image();bridge.src='/forest-adventure/chapter1-bridge-v1.webp';
    const keyArt = new Image();keyArt.src='/forest-adventure/chapter1-key-v1.webp';
    const portal = new Image(); portal.src = '/forest-adventure/woodland-portal-v2.webp';
    const shelter = new Image(); shelter.src = PILOT_SHELTER.asset;
    const enemies = new Image(); enemies.src = '/forest-adventure/enemies-illustrated-v1.png';
    const pet = new Image(); pet.src = GAME_ASSETS.characters[char]; const atlas = new Image(); const url = petWalkAtlas(char); if (url) atlas.src = url;
    const itemArt=Object.fromEntries([...Object.keys(COMBAT_ITEMS),'perola','escama'].map(id=>{const image=new Image();image.src='/forest-adventure/items/'+id+'.svg';return [id,image];})) as Record<CombatItem,HTMLImageElement> & Record<'perola'|'escama',HTMLImageElement>;
    const bg = new Image(); bg.src = '/forest-adventure/ground-proposals-20261016/option-3.webp';
    let assetsReady = false;
    const checkAssets = () => { if (pet.naturalWidth && atlas.naturalWidth && enemies.naturalWidth && props.naturalWidth && garden.naturalWidth && shelter.naturalWidth && portal.naturalWidth && bridge.naturalWidth && keyArt.naturalWidth && mobs.naturalWidth && rareArt.naturalWidth && riverMobs.naturalWidth && riverProps.naturalWidth && riverPortal.naturalWidth && water.naturalWidth && bg.naturalWidth && Object.values(itemArt).every(image=>image.naturalWidth)) { assetsReady = true; setAssetStatus('ready'); } };
    pet.onload = checkAssets; atlas.onload = checkAssets; enemies.onload = checkAssets; props.onload = checkAssets; garden.onload = checkAssets; bg.onload = checkAssets;
    shelter.onload=checkAssets; portal.onload=checkAssets;bridge.onload=checkAssets;keyArt.onload=checkAssets;mobs.onload=checkAssets;rareArt.onload=checkAssets;
    pet.onerror = atlas.onerror = enemies.onerror = props.onerror = garden.onerror = bg.onerror = () => { assetsReady = false; setAssetStatus('error'); };
    shelter.onerror=pet.onerror; portal.onerror=pet.onerror;bridge.onerror=pet.onerror;keyArt.onerror=pet.onerror;mobs.onerror=pet.onerror;rareArt.onerror=pet.onerror;
    Object.values(itemArt).forEach(image=>{image.onload=checkAssets;image.onerror=()=>{assetsReady=false;setAssetStatus('error');};});
    for(const image of [riverMobs,riverProps,riverPortal,water]){image.onload=checkAssets;image.onerror=pet.onerror;}
    checkAssets();
    let w = 1, h = 1, last = 0, ui = 0, savedAt = 0, frame = 0,paintKey='',draws=0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => { const r = el.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); const dpr = combatCanvasScale(w,h,window.devicePixelRatio || 1); el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const loop = (now: number) => {
      if(!shouldRunExplorationFrame(last,now)){frame=window.requestAnimationFrame(loop);return;}
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
        audio.current?.configure(mixRef.current,soundRef.current);
        if (soundRef.current) {
          if(current.current.enemies.some((e,i)=>(e.windupUntil??0)>(before.enemies[i]?.windupUntil??0)||e.attackAt>(before.enemies[i]?.attackAt??0)))audio.current?.cue(current.current.enemies.some(e=>(e.windupUntil??0)>current.current.time));
          if (current.current.strikeUntil !== before.strikeUntil && current.current.strikeUntil > current.current.time) audio.current?.action(pending.current.power?'power':'paw');
          if (current.current.hp < before.hp || current.current.deaths > before.deaths) audio.current?.action('hurt');
          if (current.current.loot.length < before.loot.length || current.current.collectedNodes.length > before.collectedNodes.length) audio.current?.action('pickup');
        }
        pending.current = { attack: false, power: false, interact: false };
        if (current.current.deaths !== before.deaths || current.current.completed) clear();
        const changedEvent = urgent || current.current.xp !== before.xp || current.current.collectedNodes.length !== before.collectedNodes.length || current.current.loot.length !== before.loot.length || current.current.feedback.length !== before.feedback.length || current.current.hp !== before.hp || current.current.completed;
        if (changedEvent || now - savedAt > 1000) { persist(); savedAt = now; }
        if (now - ui > 100 || current.current.completed) { setGame(current.current); ui = now; }
      }
      if(assetsReady&&current.current.completed&&!document.hidden&&!panelRef.current&&!overviewRef.current){
        if(replayMode){replayElapsed.current+=dt;if(replayElapsed.current>=850){clear();persist();backRef.current();return;}}
        const before=current.current;if(!replayMode)current.current=tickCombatPortal(before,dt);
        if(current.current!==before){if(current.current.roomIndex!==before.roomIndex){clear();persist();}setGame(current.current);}
      }
      const key=`${current.current.revision}:${w}:${h}:${zoomRef.current}:${overviewRef.current}:${assetsReady}:${reduced.matches}`;
      if(assetsReady&&shouldDrawExplorationFrame(!panelRef.current&&!overviewRef.current,key,paintKey)){
      drawCombatPilot(ctx, w, h, current.current, pet, atlas, bg, zoomRef.current, overviewRef.current, reduced.matches, enemies, props, itemArt,garden,shelter,portal,bridge,keyArt,mobs,rareArt,riverMobs,riverProps,riverPortal,water);
      paintKey=key;draws++;
      }
      if(window.location.pathname==='/qa-exploration-lab'&&now-ui<40){el.dataset.runningDraws=String(draws);el.dataset.gameTime=String(Math.round(current.current.time));}
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
      if(!event.repeat&&['escape','p'].includes(key)){event.preventDefault();dockAction('pause');return;}
      if(!event.repeat&&key==='i'){event.preventDefault();dockAction('inventory');return;}
      if (panelRef.current) return;
      if(event.target instanceof HTMLElement&&event.target.closest('button,a,select,textarea')&&[' ','enter'].includes(key))return;
      if (map[key] || [' ', 'e', 'q', 'f', 'i', 'escape', 'p'].includes(key)) event.preventDefault();
      if (map[key]) { overviewRef.current = false; setOverview(false); controls.current.keyDown(key, map[key]); }
      else if (!event.repeat && [' ', 'e'].includes(key)) action('attack');
      else if (!event.repeat && key === 'q') action('power');
      else if (!event.repeat && key === 'f') action('interact');

    };
    const up = (event: KeyboardEvent) => controls.current.keyUp(event.key.toLowerCase());
    const hidden = () => { if (document.hidden) openPanel('pause'); };
    const blur = () => { clear(); openPanel('pause'); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', hidden);
    return () => { clear(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', hidden); };
  }, [initial.supported]);
  const room=campaignRoom(game.roomIndex);
  const fibers = game.roomIndex===0?game.stock.fibra+game.bag.fibra:game.roomCollectedFibers;
  const canUse = (item: 'erva' | 'fruta') => !game.completed && game.stock[item] + game.bag[item] > 0 && (item === 'erva' ? game.hp < combatMaxHp(game.xp) : game.energy < 100);
  const useItem = (item: 'erva' | 'fruta') => { if (!panelRef.current && !overviewRef.current) change(consumeCombatItem(current.current, item)); };
  const modalTitle=panel==='inventory'?'Mochila da Exploração':panel==='exit'?'Voltar aos capítulos?':'Exploração pausada';
  if (!initial.supported) return <section className="combat-pilot combat-unavailable"><h1>Atualize o jogo para continuar</h1><p>Este progresso pertence a uma versão mais nova e foi preservado.</p><button onClick={onBack}>Voltar à Exploração</button></section>;
  const dock=lensDockLayout(viewport.width,viewport.height,lensExpanded);
  const dockStyle={'--lens-size':`${dock.diameter}px`,'--lens-top':`${dock.top}px`,'--lens-bottom':`${dock.bottom}px`,'--lens-hud-width':`${dock.hudWidth}px`} as CSSProperties;
  return <section style={dockStyle} className="combat-pilot combat-pilot--lens-dock" aria-label="Campanha de Exploração">
    <header className="combat-top"><div><small>{replayMode?'REPETIÇÃO · ':''}CAP. {chapterNumber(game.roomIndex)} · SALA {game.roomIndex+1}/{EXPLORATION_ROOMS.length} · {room.title.toUpperCase()}</small><h1>{profile?.name ?? 'Seu pet'} · Nv {combatLevel(game.xp)}</h1></div><div><span>XP {game.xp} / {combatLevel(game.xp) ** 2 * 40}</span></div></header>
    <div className="combat-stage">
      {assetStatus !== 'ready' && <div className="combat-result" role="status"><h2>{assetStatus === 'error' ? 'Não foi possível carregar seu pet' : 'Preparando a caminhada…'}</h2><p>{assetStatus === 'error' ? 'Volte ao mapa e tente novamente. Seu progresso foi preservado.' : 'A sala começa quando a animação estiver pronta.'}</p><button onClick={leave}>Voltar ao mapa</button></div>}
      <canvas ref={canvas} aria-label="Clareira de combate. Joystick, setas ou WASD movem. E ou Espaço: patada. Q: poder. F: marco. I: mochila." onPointerUp={event => {
        if (panelRef.current || overviewRef.current || current.current.completed) return;
        const r = event.currentTarget.getBoundingClientRect(), v = combatView(r.width, r.height, current.current.player, zoom, false);
        route.current = pilotRoute(current.current.player, { x: (event.clientX - r.left - v.left) / v.tile, y: (event.clientY - r.top - v.top) / v.tile }, current.current.gateOpen,current.current.roomIndex);
      }} />
      <div className="combat-vitals"><label>HP <strong>{Math.ceil(game.hp)}/{combatMaxHp(game.xp)}</strong><progress value={game.hp} max={combatMaxHp(game.xp)} aria-label="Vida do pet" /></label><label>Energia <strong>{Math.floor(game.energy)}/100</strong><progress value={game.energy} max={100} aria-label="Energia de combate" /></label></div>
      <ExplorationMinimap state={game}>
        <nav className="combat-lens-dock" aria-label="Atalhos da Exploração">
          <button className="combat-lens-slot combat-lens-sound" onClick={onToggleSound} aria-label={soundOn?'Desligar som':'Ligar som'} aria-pressed={soundOn} title={soundOn?'Desligar som':'Ligar som'}>{soundOn?<Volume2/>:<VolumeX/>}</button>
          <button className="combat-lens-slot combat-lens-pause" ref={pauseButton} onClick={()=>dockAction('pause')} aria-label={panel||overview?'Continuar exploração':'Pausar exploração'} aria-pressed={Boolean(panel)||overview} title={panel||overview?'Continuar':'Pausar'}>{panel||overview?<Play/>:<Pause/>}</button>
          <button className="combat-lens-slot combat-lens-inventory" onClick={()=>dockAction('inventory')} aria-label={panel==='inventory'?'Fechar mochila':'Abrir mochila'} aria-expanded={panel==='inventory'} aria-controls="combat-panel" title={panel==='inventory'?'Fechar mochila':'Abrir mochila'}>{panel==='inventory'?<X/>:<Backpack/>}</button>
          <button className="combat-lens-slot combat-lens-size" onClick={()=>setLensExpanded(value=>!value)} aria-label={lensExpanded?'Reduzir tamanho da lupa':'Ampliar tamanho da lupa'} aria-pressed={lensExpanded} title={lensExpanded?'Reduzir lupa':'Ampliar lupa'}>{lensExpanded?<Minus/>:<Plus/>}</button>
          <button className="combat-lens-slot combat-lens-map" onClick={viewRoom} aria-label={overview?'Voltar ao pet':'Ver mapa completo'} aria-pressed={overview} title={overview?'Voltar ao pet':'Ver mapa completo'}>{overview?<X/>:<Map/>}</button>
          <button type="button" className="combat-lens-slot combat-lens-camera" disabled={overview} onClick={()=>{route.current=[];setZoom(toggleWorldCameraZoom);}} aria-label={zoom>1?'Afastar câmera para 1×':'Aproximar câmera para 2×'} aria-pressed={zoom>1} title={zoom>1?'Câmera: voltar para 1×':'Câmera: aproximar para 2×'}>{zoom>1?<ZoomOut/>:<ZoomIn/>}</button>
        </nav>
      </ExplorationMinimap>
      <div className="combat-objective"><ExplorationItemIcon item="fibra" size={23} /><span>{Math.min(room.fibers, fibers)}/{room.fibers} fibras</span><span>{Math.min(room.encounters,game.roomIndex===0?game.defeated:game.defeatedEnemyIds.length)}/{room.encounters} encontros</span><span>{game.gateOpen ? "Siga ao portal" : "Ative o marco"}</span>{room.switches.length>0&&<span>Placas {game.switchStep}/{room.switches.length}</span>}{room.key&&<span>{game.hasRoomKey?'Chave ✓':'Busque a chave'}</span>}{room.bridge&&<span>{game.bridgeCrossed?'Ponte ✓':'Atravesse a ponte'}</span>}{room.bossId&&<span>{game.defeatedEnemyIds.includes(room.bossId)?'Mestre ✓':'Vença o mestre'}</span>}{room.useConsumable&&<span>{game.consumablesUsed?'Recuperação ✓':'Use fruta/erva'}</span>}</div>
      <div className="combat-goal" role="status">{overview ? 'Inspeção pausada · Voltar ao pet retoma' : game.message}</div>
      {!game.completed&&room.bossId&&game.defeatedEnemyIds.includes(room.bossId)&&<aside className="combat-card-note" role="status"><strong>Carta rara conquistada</strong><p>{COMBAT_CARDS[bossCardForRoom(game.roomIndex)].description}</p><small>Já equipada · disponível na mochila</small></aside>}
      {!game.completed && <div className="combat-item-tray" aria-label="Itens e uso rápido">
        <span className="combat-collect-slot" title="Fibras coletadas"><ExplorationItemIcon item="fibra" size={28}/><small>{Math.min(room.fibers, fibers)}/{room.fibers}</small></span>
        <span className="combat-collect-slot" title="Âmbar coletado"><ExplorationItemIcon item="ambar" size={28}/><small>{game.stock.ambar + game.bag.ambar}</small></span>
        {(['erva', 'fruta'] as const).map(item => <button key={item} disabled={!canUse(item) || Boolean(panel) || overview} onClick={() => useItem(item)} aria-label={`Usar ${COMBAT_ITEMS[item]}, ${game.stock[item] + game.bag[item]} disponível, recupera até ${item === 'erva' ? '35 HP' : '30 de energia'}`} title={item === 'erva' ? 'Usar erva: até +35 HP' : 'Usar fruta: até +30 energia'}><ExplorationItemIcon item={item} size={30}/><span>{game.stock[item] + game.bag[item]}</span><small>{item === 'erva' ? 'Curar' : 'Energia'}</small></button>)}
      </div>}
      {!game.completed && <div className="combat-controls">
        <ExplorationJoystick disabled={Boolean(panel) || overview || game.completed} onChange={value=>{stick.current={...value,pointer:-1};if(value.x||value.y){route.current=[];}}}/>

        <div className="combat-actions">{(['attack', 'power', 'interact'] as const).map((kind, index) => <button className={`combat-action-${kind}`} key={kind} disabled={Boolean(panel) || overview || (kind === 'power' && game.energy < 25)} aria-label={['Patada, E ou espaço', 'Poder, Q, custa 25 de energia', 'Interagir com marco, F'][index]} onPointerDown={e => { e.preventDefault(); action(kind); }} onClick={e => { if (e.detail === 0) action(kind); }}>{index === 0 ? <PawPrint /> : index === 1 ? <Sparkles /> : <Shield />}<span>{['Atacar', 'Poder', 'Marco'][index]}</span></button>)}</div>
      </div>}
      {game.completed && <div className={`combat-teleport ${game.roomIndex===EXPLORATION_ROOMS.length-1?'combat-teleport-final':''}`} role="status" aria-live="polite"><div className="combat-teleport-light"/><h2>{replayMode?'Sala repetida! Voltando ao mapa…':game.roomIndex===EXPLORATION_ROOMS.length-1?'Biomas concluídos!':'Atravessando o portal…'}</h2><p>{replayMode?'Seu ponto de avanço na campanha foi preservado.':game.roomIndex<EXPLORATION_ROOMS.length-1?`${chapterName(game.roomIndex+1)} · Sala ${game.roomIndex+2}/${EXPLORATION_ROOMS.length}`:'Progresso salvo. Novas trilhas virão na próxima expansão.'}</p>{room.bossId&&game.activeCard&&<p><strong>Carta rara: {COMBAT_CARDS[game.activeCard].name}</strong><br/>{COMBAT_CARDS[game.activeCard].description}</p>}{!replayMode&&game.roomIndex===EXPLORATION_ROOMS.length-1&&<button onClick={leave}>Salvar e sair</button>}</div>}
    </div>
    <dialog id="combat-panel" ref={dialog} className={`combat-dialog ${panel === 'inventory' ? 'combat-dialog-inventory' : ''}`} aria-labelledby="combat-dialog-title" onCancel={event => { event.preventDefault(); openPanel(null); }} onClose={() => { if (panelRef.current) openPanel(null); }}>
      <header className="combat-dialog-heading"><h2 id="combat-dialog-title">{modalTitle}</h2>{panel && <button onClick={() => openPanel(null)} aria-label={panel==='inventory'?'Fechar mochila e retomar':'Fechar painel e retomar'}><X size={20}/></button>}</header>
      {panel === 'inventory' ? <CombatInventory game={game} onUse={item => change(consumeCombatItem(current.current, item))} onEquip={() => change(equipCombatCharm(current.current))} onRare={item=>change(useRareCombatItem(current.current,item))} onCard={card=>change(equipCombatCard(current.current,card))} /> : panel === 'exit' ? <p>Seu nível de combate, HP, inimigos e coleta serão mantidos para continuar depois.</p> : <><p>{room.hint}</p><p>As configurações e os guias ficam na tela de capítulos. Salve e volte ao mapa para consultá-los.</p></>}

      {panel !== 'inventory' && <div className="combat-dialog-actions"><button onClick={() => openPanel(null)}><Play size={16} />{panel === 'exit' ? 'Continuar aqui' : 'Retomar'}</button>{panel === 'exit' ? <button onClick={leave}>Salvar e voltar</button> : <button onClick={() => openPanel('exit')}>Voltar aos capítulos</button>}</div>}
    </dialog>
  </section>;
}
