import ExplorationWorkshop from './ExplorationWorkshop';
import ExplorationBasePlacement from './ExplorationBasePlacement';
import {baseLayout,buildingAt,insideSafeBase,placeBaseBuilding,BASE_NAMES,type BaseBuilding} from '@/game/explorationBase';
import {baseArtRevision} from '@/game/explorationWorkshopView';
import {pilotWalkable} from '@/game/explorationCombat';
import {workshopCommand,nearestResource} from '@/game/explorationWorkshop';
import {PAINTED_ITEMS} from '@/game/explorationPaintedItems';
import {biomeArtRevision} from '@/game/explorationBiomeArt';
import {castleRoom,castleRoute,castlePassages} from '@/game/explorationCastle';
import {castleView,castleArtReady,castleArtRevision} from '@/game/explorationCastleView';
import {nascentesView} from '@/game/explorationChapter4View';
import {NASCENTES_ASSETS} from '@/game/explorationChapter4';
import {normalizeQuickItems,setCombatQuickItem,quickItemCount,canUseQuickItem,useCombatQuickItem,type CombatQuickItem} from '@/game/explorationCombat';
import {RARE_ITEMS} from '@/game/explorationCampaign';
import PowerSymbol from './PowerSymbol';
import {preloadLegend} from '@/game/explorationLegendView';
import {changeLegend,eligibleLegend,legendName,readLegendProgress} from '@/game/explorationLegends';
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
import { COMBAT_POWERS,equipCombatPower,bossCardForRoom,tickCombatPortal,equipCombatCard,useRareCombatItem,COMBAT_CARDS, combatAttack, combatLevel, combatMaxHp, combatSnapshot, COMBAT_ITEMS, consumeCombatItem, createCombatState, equipCombatCharm, pilotRoute, readCombatState, stepCombat, type CombatItem, type CombatPoint, type CombatState } from '@/game/explorationCombat';
import { combatCanvasScale, combatView, drawCombatPilot } from '@/game/explorationCombatView';
import {FOREST_NATURE} from '@/game/forestNature';
import {PILOT_SHELTER} from '@/game/explorationRoom';
import './ExplorationCombatPilot.css';

type Props = { replayMode?:boolean; soundOn: boolean; onToggleSound: () => void; profile: PetProfile | null; progress: Record<string, unknown>; onSave: (save: Record<string, unknown>) => void; onBack: () => void };
type Panel = ExplorationPanel;
export default function ExplorationCombatPilot({ profile, progress, onSave, onBack, soundOn, onToggleSound,replayMode=false }: Props) {
  const [initial] = useState(() => readCombatState(progress));
  const [game, setGame] = useState<CombatState>(() => (()=>{const s=initial.supported?initial.state:createCombatState();if(s.legends?.active&&s.legends.active!==eligibleLegend(profile?.gender??'menino'))return {...s,legends:{...readLegendProgress(s.legends),active:null}};return s;})());
  const replayElapsed=useRef(0),backRef=useRef(onBack);backRef.current=onBack;
  const current = useRef(game), saveRef = useRef(onSave), controls = useRef(new ForestControls());
  const pending = useRef({ attack: false, power: false, interact: false });
  const pendingBuilding=useRef<BaseBuilding|null>(null);
  const route = useRef<CombatPoint[]>([]), panelRef = useRef<Panel>(null), overviewRef = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null), dialog = useRef<HTMLDialogElement>(null), pauseButton = useRef<HTMLButtonElement>(null);
  const [assetStatus, setAssetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [panel, setPanel] = useState<Panel>(null), [overview, setOverview] = useState(false), [zoom, setZoom] = useState(.65);
  const [audioMix]=useState(loadExplorationAudio);
  const audio=useRef<ExplorationAudio|null>(null),mixRef=useRef(audioMix);mixRef.current=audioMix;
  useEffect(()=>{const controller=new ExplorationAudio();audio.current=controller;return()=>{controller.dispose();audio.current=null;};},[]);
  useEffect(()=>{audio.current?.configure(audioMix,soundOn&&!panel&&!overview&&assetStatus==='ready'&&!game.completed,chapterNumber(game.roomIndex));},[audioMix,soundOn,panel,overview,assetStatus,game.completed,game.roomIndex,game.castle?.active]);
  const [noticeVisible,setNoticeVisible]=useState(true);
  useEffect(()=>{setNoticeVisible(true);const timer=setTimeout(()=>setNoticeVisible(false),4500);return ()=>clearTimeout(timer);},[game.message,game.roomIndex]);
  const [inventoryTab,setInventoryTab]=useState<'all'|'legends'>('all');
  const [lensExpanded,setLensExpanded]=useState(false);
  const [viewport,setViewport]=useState(()=>({width:typeof window==='undefined'?390:window.innerWidth,height:typeof window==='undefined'?844:window.innerHeight}));
  const zoomRef = useRef(zoom), lastSaved = useRef('');
  const accessibleTimers = useRef(new Set<number>());
  const stick = useRef({ x: 0, y: 0, pointer: -1 });
  const soundRef = useRef(soundOn); soundRef.current = soundOn;
  const char = profile?.characterId ?? 'menino-preto';
  saveRef.current = onSave; zoomRef.current = zoom;
  function clear() { pendingBuilding.current=null;stick.current = { x: 0, y: 0, pointer: -1 }; controls.current.clear(); route.current = []; pending.current = { attack: false, power: false, interact: false }; for (const id of accessibleTimers.current) window.clearTimeout(id); accessibleTimers.current.clear(); }
  function persist() { if (!initial.supported) return; const snapshot = combatSnapshot(current.current), key = JSON.stringify(snapshot); if (key !== lastSaved.current) { lastSaved.current = key; saveRef.current(snapshot); } }
  function openPanel(value: Panel) { clear(); persist(); overviewRef.current=false;setOverview(false);panelRef.current = value; setPanel(value); }
  function change(next: CombatState) { if(next.legends?.active)preloadLegend(next.legends.active); if (next === current.current) return; current.current = next; setGame(next); persist(); }
  function leave() { clear(); persist(); onBack(); }
  function action(kind: keyof typeof pending.current) { if (!panelRef.current && !overviewRef.current && !current.current.completed) { unlockPlatformAudio(); audio.current?.unlock(); route.current = []; pending.current[kind] = true; } }
  function dockAction(action:'pause'|'inventory'|'map'){
    const next=lensDockAction(panelRef.current,overviewRef.current,action);
    clear();persist();overviewRef.current=next.overview;setOverview(next.overview);panelRef.current=next.panel;setPanel(next.panel);
  }
  function viewRoom(){dockAction('map');}

  useEffect(() => {
    const el=dialog.current;if(!el)return;
    if(panel&&panel!=='build'&&!el.open)el.showModal();
    if((!panel||panel==='build')&&el.open){el.close();pauseButton.current?.focus();}
  },[panel]);
  useEffect(()=>{const resize=()=>setViewport({width:window.innerWidth,height:window.innerHeight});window.addEventListener('resize',resize);resize();return ()=>window.removeEventListener('resize',resize);},[]);
  useEffect(() => {
    if (!initial.supported) return;
    const el = canvas.current, ctx = el?.getContext('2d'); if (!el || !ctx) return;
    const props = new Image(); props.src = '/forest-adventure/woodland-props-v2.png';
    const garden = new Image(); garden.src = FOREST_NATURE.garden.asset;
    const mobs = new Image();mobs.src='/forest-adventure/forest-mobs-v1.webp';
    const autumnMobs=new Image();autumnMobs.src='/forest-adventure/autumn-mobs-v1.png';
    const powerArt=new Image();powerArt.src='/forest-adventure/powers-painted-v1.png';
    const riverMobs=new Image();riverMobs.src='/forest-adventure/river-mobs-v1.webp';
    const riverProps=new Image();riverProps.src='/forest-adventure/river-props-v1.webp';
    const riverPortal=new Image();riverPortal.src='/forest-adventure/river-portal-v1.webp';
    const water=new Image();water.src='/forest-adventure/painted-water-v1.webp';
    const rareArt = new Image();rareArt.src='/forest-adventure/forest-rare-items-v1.webp';
    const bridge = new Image();bridge.src=current.current.roomIndex>=30?NASCENTES_ASSETS.trees:'/forest-adventure/chapter1-bridge-v1.webp';
    const keyArt = new Image();keyArt.src='/forest-adventure/chapter1-key-v1.webp';
    const portal = new Image(); portal.src = current.current.roomIndex>=30?NASCENTES_ASSETS.portal:'/forest-adventure/woodland-portal-v2.webp';
    const shelter = new Image(); shelter.src = current.current.roomIndex>=30?NASCENTES_ASSETS.shelter:PILOT_SHELTER.asset;
    const stone=new Image();stone.src=current.current.roomIndex>=30?NASCENTES_ASSETS.stone:'/forest-adventure/ground-proposals-20261016/option-3.webp';
    const soil=new Image();soil.src=current.current.roomIndex>=30?NASCENTES_ASSETS.soil:'/forest-adventure/ground-proposals-20261016/option-3.webp';
    const cliff=new Image();cliff.src=current.current.roomIndex>=30?(current.current.roomIndex===31?NASCENTES_ASSETS.grassPlateau:NASCENTES_ASSETS.cliff):'/forest-adventure/ground-proposals-20261016/option-3.webp';
    const enemies = new Image(); enemies.src = '/forest-adventure/enemies-illustrated-v1.png';
    const pet = new Image(); pet.src = GAME_ASSETS.characters[char]; const atlas = new Image(); const url = petWalkAtlas(char); if (url) atlas.src = url;
    const itemArt=Object.fromEntries([...Object.keys(COMBAT_ITEMS),'perola','escama'].map(id=>{const image=new Image();image.src=PAINTED_ITEMS;return [id,image];})) as Record<CombatItem,HTMLImageElement> & Record<'perola'|'escama',HTMLImageElement>;
    const bg = new Image(); bg.src = current.current.roomIndex>=30?NASCENTES_ASSETS.grass:'/forest-adventure/ground-proposals-20261016/option-3.webp';
    let assetsReady = false;
    const checkAssets = () => { if (soil.naturalWidth && stone.naturalWidth && cliff.naturalWidth && autumnMobs.naturalWidth && powerArt.naturalWidth && pet.naturalWidth && atlas.naturalWidth && enemies.naturalWidth && props.naturalWidth && garden.naturalWidth && shelter.naturalWidth && portal.naturalWidth && bridge.naturalWidth && keyArt.naturalWidth && mobs.naturalWidth && rareArt.naturalWidth && riverMobs.naturalWidth && riverProps.naturalWidth && riverPortal.naturalWidth && water.naturalWidth && bg.naturalWidth && Object.values(itemArt).every(image=>image.naturalWidth)) { assetsReady = true; setAssetStatus('ready'); } };
    pet.onload = checkAssets; atlas.onload = checkAssets; enemies.onload = checkAssets; props.onload = checkAssets; garden.onload = checkAssets; bg.onload = checkAssets;
    shelter.onload=checkAssets; portal.onload=checkAssets;bridge.onload=checkAssets;keyArt.onload=checkAssets;mobs.onload=checkAssets;rareArt.onload=checkAssets;
    pet.onerror = atlas.onerror = enemies.onerror = props.onerror = garden.onerror = bg.onerror = () => { assetsReady = false; setAssetStatus('error'); };
    shelter.onerror=pet.onerror; portal.onerror=pet.onerror;bridge.onerror=pet.onerror;keyArt.onerror=pet.onerror;mobs.onerror=pet.onerror;rareArt.onerror=pet.onerror;
    Object.values(itemArt).forEach(image=>{image.onload=checkAssets;image.onerror=()=>{assetsReady=false;setAssetStatus('error');};});
    for(const image of [soil,stone,cliff,autumnMobs,powerArt,riverMobs,riverProps,riverPortal,water]){image.onload=checkAssets;image.onerror=pet.onerror;}
    checkAssets();
    let w = 1, h = 1, last = 0, ui = 0, savedAt = 0, frame = 0,paintKey='',draws=0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => { const r = el.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); const dpr = combatCanvasScale(w,h,window.devicePixelRatio || 1); el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const loop = (now: number) => {
      if(!shouldRunExplorationFrame(last,now)){frame=window.requestAnimationFrame(loop);return;}
      const dt = last ? Math.min(50, now - last) : 0; last = now;
      if (assetsReady && (!current.current.castle?.active||castleArtReady(current.current.castle.room)) && !panelRef.current && !overviewRef.current && !document.hidden && !current.current.completed) {
        const held = controls.current.snapshot(); let dx = Number(held.right) - Number(held.left) || stick.current.x, dy = Number(held.down) - Number(held.up) || stick.current.y;
        if (dx || dy) route.current = [];
        else if (route.current.length) {
          const position=current.current.castle?.active?current.current.castle.player:current.current.player,target=route.current[0],distance=Math.hypot(target.x-position.x,target.y-position.y);
          if (distance < (current.current.castle?.active?.015:.06)) route.current.shift();
          else { const scale = Math.min(1, distance / Math.max(.001, dt * .003)); dx = (target.x - position.x) / distance * scale; dy = (target.y - position.y) / distance * scale; }
        }
        const urgent = pending.current.attack || pending.current.power || pending.current.interact;
        const before = current.current;
        current.current = stepCombat(before, { dx, dy, ...pending.current }, dt);
        audio.current?.configure(mixRef.current,soundRef.current,chapterNumber(current.current.roomIndex));audio.current?.tick();
        if (soundRef.current) {
          if(current.current.enemies.some((e,i)=>(e.windupUntil??0)>(before.enemies[i]?.windupUntil??0)||e.attackAt>(before.enemies[i]?.attackAt??0)))audio.current?.cue(current.current.enemies.some(e=>(e.windupUntil??0)>current.current.time));
          if (current.current.strikeUntil !== before.strikeUntil && current.current.strikeUntil > current.current.time) audio.current?.action(pending.current.power?'power':'paw');
          if (current.current.hp < before.hp || current.current.deaths > before.deaths) audio.current?.action('hurt');
          if (current.current.loot.length < before.loot.length || current.current.collectedNodes.length > before.collectedNodes.length) audio.current?.action('pickup');
        }
        pending.current = { attack: false, power: false, interact: false };
        if (current.current.roomIndex!==before.roomIndex || current.current.castle?.room!==before.castle?.room || current.current.castle?.active!==before.castle?.active || current.current.deaths !== before.deaths || current.current.completed) clear();
        if(pendingBuilding.current&&insideSafeBase(current.current)){const k=pendingBuilding.current;openPanel(k);}
        const changedEvent = current.current.castle?.room!==before.castle?.room || current.current.castle?.active!==before.castle?.active || urgent || current.current.xp !== before.xp || current.current.collectedNodes.length !== before.collectedNodes.length || current.current.loot.length !== before.loot.length || current.current.feedback.length !== before.feedback.length || current.current.hp !== before.hp || current.current.completed;
        if (changedEvent || now - savedAt > 1000) { persist(); savedAt = now; }
        if (now - ui > 100 || current.current.completed) { setGame(current.current); ui = now; }
      }
      if(assetsReady&&current.current.completed&&!document.hidden&&!panelRef.current&&!overviewRef.current){
        if(replayMode&&current.current.roomIndex<30){replayElapsed.current+=dt;if(replayElapsed.current>=850){clear();persist();backRef.current();return;}}
        const before=current.current;if(!replayMode||current.current.roomIndex>=30)current.current=tickCombatPortal(before,dt);
        if(current.current!==before){if(current.current.roomIndex!==before.roomIndex){clear();persist();}setGame(current.current);}
      }
      const key=`${current.current.revision}:${w}:${h}:${zoomRef.current}:${overviewRef.current}:${assetsReady}:${reduced.matches}:${castleArtRevision()}:${biomeArtRevision()}:${baseArtRevision()}:${panelRef.current}`;
      if(assetsReady&&shouldDrawExplorationFrame(!panelRef.current&&!overviewRef.current,key,paintKey)){
      drawCombatPilot(ctx, w, h, current.current, pet, atlas, bg, zoomRef.current, overviewRef.current, reduced.matches, enemies, props, itemArt,garden,shelter,portal,bridge,keyArt,mobs,rareArt,riverMobs,riverProps,riverPortal,water,autumnMobs,powerArt,stone,cliff,soil,panelRef.current==='build');
      paintKey=key;draws++;
      }
      if(window.location.pathname==='/qa-exploration-lab'&&now-ui<40){const position=current.current.castle?.active?current.current.castle.player:current.current.player;el.dataset.runningDraws=String(draws);el.dataset.gameTime=String(Math.round(current.current.time));el.dataset.playerX=String(position.x);el.dataset.playerY=String(position.y);}
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => { window.cancelAnimationFrame(frame); observer.disconnect(); clear(); };
  }, [char, initial.supported,game.roomIndex,game.castle?.active]);

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
  }, [initial.supported,game.castle?.active]);
  const room=campaignRoom(game.roomIndex),castle=game.castle?.active?game.castle:undefined;
  const fibers = game.roomIndex===0?game.stock.fibra+game.bag.fibra:game.roomCollectedFibers;
  const canUse = (item:CombatQuickItem) => canUseQuickItem(game,item);
  const useItem = (item:CombatQuickItem) => {if(!panelRef.current&&!overviewRef.current)change(useCombatQuickItem(current.current,item));};
  const modalTitle=panel&&panel in BASE_NAMES?BASE_NAMES[panel as BaseBuilding]:panel==='inventory'?'Mochila da Exploração':panel==='exit'?'Voltar aos capítulos?':'Exploração pausada';
  if (!initial.supported) return <section className="combat-pilot combat-unavailable"><h1>Atualize o jogo para continuar</h1><p>Este progresso pertence a uma versão mais nova e foi preservado.</p><button onClick={onBack}>Voltar à Exploração</button></section>;

  const dock=lensDockLayout(viewport.width,viewport.height,lensExpanded);
  const dockStyle={'--lens-size':`${dock.diameter}px`,'--lens-top':`${dock.top}px`,'--lens-bottom':`${dock.bottom}px`,'--lens-hud-width':`${dock.hudWidth}px`} as CSSProperties;
  return <section onPointerDownCapture={()=>{if(soundRef.current)audio.current?.unlock();}} onKeyDownCapture={()=>{if(soundRef.current)audio.current?.unlock();}} style={dockStyle} className={`combat-pilot combat-pilot--lens-dock ${panel==='build'?'is-base-editing':''} ${overview&&game.roomIndex>=30?'is-chapter4-overview':''}`} aria-label="Campanha de Exploração">

    <div className="combat-stage">
      {assetStatus !== 'ready' && <div className="combat-result" role="status"><h2>{assetStatus === 'error' ? 'Não foi possível carregar seu pet' : 'Preparando a caminhada…'}</h2><p>{assetStatus === 'error' ? 'Volte ao mapa e tente novamente. Seu progresso foi preservado.' : 'A sala começa quando a animação estiver pronta.'}</p><button onClick={leave}>Voltar ao mapa</button></div>}
      <canvas ref={canvas} aria-label={castle?(overview?`Mapa geral do Castelo. Você está em ${castleRoom(castle.room).name}.`:`${castleRoom(castle.room).name}. Mesmos controles da exploração; caminhe até as portas brilhantes.`):overview?`Mapa completo da sala ${game.roomIndex+1}. O marcador vermelho com a legenda Você está aqui mostra a posição atual do personagem.`:"Clareira de combate. Joystick, setas ou WASD movem. E ou Espaço: patada. Q: poder. F: marco. I: mochila."} onPointerUp={event => {
        if (panelRef.current || overviewRef.current || current.current.completed) return;
        const r = event.currentTarget.getBoundingClientRect();if(current.current.castle?.active){const c=current.current.castle,v=castleView(r.width,r.height,c.player,zoom);const target={x:(event.clientX-r.left-v.left)/v.tile,y:(event.clientY-r.top-v.top)/v.tile};const door=castlePassages(c.room).find(d=>Math.hypot(d.x-target.x,d.y-target.y)<1);route.current=castleRoute(c.player,door??target,c.room);return;}const v = current.current.roomIndex>=30?nascentesView(r.width,r.height,current.current.player,zoom,false):combatView(r.width, r.height, current.current.player, zoom, false);
        const target={x:(event.clientX-r.left-v.left)/v.tile,y:(event.clientY-r.top-v.top)/v.tile},building=buildingAt(current.current,target);if(building){if(insideSafeBase(current.current)){openPanel(building);return;}pendingBuilding.current=building;const q=baseLayout(current.current)[building];route.current=pilotRoute(current.current.player,{x:q.x,y:q.y+.9},current.current.gateOpen,current.current.roomIndex,current.current.workshop);return;}route.current=pilotRoute(current.current.player,target,current.current.gateOpen,current.current.roomIndex,current.current.workshop);
      }} />

      <div className="combat-status-stack" aria-label="Estado da exploração">    <header className="combat-top"><div><small>{castle?`CAP. 5 · ${castleRoom(castle.room).name.toUpperCase()}`:<>{replayMode?'REPETIÇÃO · ':''}CAP. {chapterNumber(game.roomIndex)} · SALA {game.roomIndex+1}/{EXPLORATION_ROOMS.length} · {room.title.toUpperCase()}</>}</small><h1>{legendName(game)??profile?.name??'Seu pet'} · Nv {combatLevel(game.xp)}</h1></div><div><span>XP {game.xp} / {combatLevel(game.xp) ** 2 * 40}</span></div></header>      <div className="combat-vitals"><label>HP <strong>{Math.ceil(game.hp)}/{combatMaxHp(game.xp)}</strong><progress value={game.hp} max={combatMaxHp(game.xp)} aria-label="Vida do pet" /></label><label>Energia <strong>{Math.floor(game.energy)}/100</strong><progress value={game.energy} max={100} aria-label="Energia de combate" /></label></div>      {!castle&&<div className="combat-objective"><ExplorationItemIcon item="fibra" size={23} /><span>{Math.min(room.fibers, fibers)}/{room.fibers} fibras</span>{room.encounters>0&&<span>{Math.min(room.encounters,game.roomIndex===0?game.defeated:game.defeatedEnemyIds.length)}/{room.encounters} encontros</span>}<span>{game.gateOpen ? "Siga ao portal" : room.index>=30?"Libere a passagem":"Ative o marco"}</span>{room.switches.length>0&&<span>Placas {game.switchStep}/{room.switches.length}</span>}{room.key&&<span>{game.hasRoomKey?'Chave ✓':'Busque a chave'}</span>}{room.bridge&&<span>{game.bridgeCrossed?'Ponte ✓':'Atravesse a ponte'}</span>}{room.bossId&&<span>{game.defeatedEnemyIds.includes(room.bossId)?'Mestre ✓':'Vença o mestre'}</span>}{room.useConsumable&&<span>{game.consumablesUsed?'Recuperação ✓':'Use fruta/erva'}</span>}</div>}
      {(overview||noticeVisible)&&<div className="combat-goal" role="status">{overview ? (castle?'Mapa geral · Portas livres · Voltar ao pet retoma':'Inspeção pausada · Voltar ao pet retoma') : game.message}</div>}
</div>
      {!castle&&panel!=='build'&&<button className="combat-base-shortcut" onClick={()=>openPanel('home')} aria-label="Abrir casa e construções">Casa e construções <span className="combat-base-state">{insideSafeBase(game)?' · Protegido':''}</span></button>}
      {panel==='build'&&!castle&&<ExplorationBasePlacement game={game} width={canvas.current?.clientWidth??viewport.width} height={canvas.current?.clientHeight??viewport.height} onDone={()=>openPanel('home')} onPlace={(k,p)=>change(placeBaseBuilding(current.current,k,p,(q,r)=>pilotWalkable(q,current.current.gateOpen,r,current.current.roomIndex,undefined,true)))}/>}
      <ExplorationMinimap state={game}>
        <nav className="combat-lens-dock" aria-label="Atalhos da Exploração">
          <button className="combat-lens-slot combat-lens-sound" onClick={()=>{if(!soundOn)audio.current?.unlock();onToggleSound();}} aria-label={soundOn?'Desligar som':'Ligar som'} aria-pressed={soundOn} title={soundOn?'Desligar som':'Ligar som'}>{soundOn?<Volume2/>:<VolumeX/>}</button>
          <button className="combat-lens-slot combat-lens-pause" ref={pauseButton} onClick={()=>dockAction('pause')} aria-label={panel||overview?'Continuar exploração':'Pausar exploração'} aria-pressed={Boolean(panel)||overview} title={panel||overview?'Continuar':'Pausar'}>{panel||overview?<Play/>:<Pause/>}</button>
          <button className="combat-lens-slot combat-lens-inventory" onClick={()=>{setInventoryTab('all');dockAction('inventory');}} aria-label={panel==='inventory'?'Fechar mochila':'Abrir mochila'} aria-expanded={panel==='inventory'} aria-controls="combat-panel" title={panel==='inventory'?'Fechar mochila':'Abrir mochila'}>{panel==='inventory'?<X/>:<Backpack/>}</button>
          <button className="combat-lens-slot combat-lens-equipment" onClick={()=>{setInventoryTab('legends');openPanel('inventory');}} aria-label="Equipar itens do Lendário" title="Equipamentos do Lendário"><PowerSymbol power="roots"/></button><button className="combat-lens-slot combat-lens-size" onClick={()=>setLensExpanded(value=>!value)} aria-label={lensExpanded?'Reduzir tamanho da lupa':'Ampliar tamanho da lupa'} aria-pressed={lensExpanded} title={lensExpanded?'Reduzir lupa':'Ampliar lupa'}>{lensExpanded?<Minus/>:<Plus/>}</button>
          <button className="combat-lens-slot combat-lens-map" onClick={viewRoom} aria-label={overview?'Voltar ao pet':'Ver mapa completo'} aria-pressed={overview} title={overview?'Voltar ao pet':'Ver mapa completo'}>{overview?<X/>:<Map/>}</button>
          <button type="button" className="combat-lens-slot combat-lens-zoom-in" disabled={overview} onClick={()=>{route.current=[];setZoom(z=>Math.min(1.4,+(z+.25).toFixed(2)));}} aria-label="Aproximar personagem" title="Aproximar personagem"><ZoomIn/></button>
          <button type="button" className="combat-lens-slot combat-lens-zoom-out" disabled={overview} onClick={()=>{route.current=[];setZoom(z=>Math.max(.65,+(z-.25).toFixed(2)));}} aria-label="Afastar personagem" title="Afastar personagem"><ZoomOut/></button>
        </nav>
      </ExplorationMinimap>
      {!game.completed&&room.bossId&&game.defeatedEnemyIds.includes(room.bossId)&&<aside className="combat-card-note" role="status"><strong>Carta rara conquistada</strong><p>{COMBAT_CARDS[bossCardForRoom(game.roomIndex)].description}</p><small>Já equipada · disponível na mochila</small></aside>}
      {!game.completed && <div className="combat-item-tray" aria-label="Itens e uso rápido">
        <span className="combat-collect-slot" title="Fibras coletadas"><ExplorationItemIcon item="fibra" size={28}/><small>{Math.min(room.fibers, fibers)}/{room.fibers}</small></span>
        <span className="combat-collect-slot" title="Âmbar coletado"><ExplorationItemIcon item="ambar" size={28}/><small>{game.stock.ambar + game.bag.ambar}</small></span>
        {normalizeQuickItems(game.quickItems).map(item => <button key={item} disabled={!canUse(item)||Boolean(panel)||overview} onClick={()=>useItem(item)} aria-label={`Usar ${item==='erva'||item==='fruta'?COMBAT_ITEMS[item]:RARE_ITEMS[item]}, ${quickItemCount(game,item)} disponível`}><ExplorationItemIcon item={item} size={30}/><span>{quickItemCount(game,item)}</span><small>{item==='fruta'?'Energia':'Curar'}</small></button>)}
      </div>}
      {!game.completed && <div className="combat-controls">
        <ExplorationJoystick disabled={Boolean(panel) || overview || game.completed} onChange={value=>{stick.current={...value,pointer:-1};if(value.x||value.y){route.current=[];}}}/>

        <div className="combat-actions">{(['attack', 'power', 'interact'] as const).map((kind, index) => <button className={`combat-action-${kind}`} key={kind} disabled={Boolean(panel) || overview || (kind === 'power' && game.energy < 25)} aria-label={[game.legends?.active?'Ataque do Lendário, E ou espaço':'Patada, E ou espaço', `Usar ${COMBAT_POWERS[game.activePower??'burst'].name}, Q, custa 25 de energia`, 'Interagir com marco, F'][index]} onPointerDown={e => { e.preventDefault(); action(kind); }} onClick={e => { if (e.detail === 0) action(kind); }}>{index === 0 ? <PawPrint /> : index === 1 ? <PowerSymbol power={game.activePower??'burst'}/> : <Shield />}<span>{['Atacar', COMBAT_POWERS[game.activePower??'burst'].name, nearestResource(game)?'Coletar':'Marco'][index]}</span></button>)}</div>
      </div>}
      {game.completed && <div className={`combat-teleport ${game.roomIndex===EXPLORATION_ROOMS.length-1?'combat-teleport-final':''}`} role="status" aria-live="polite"><div className="combat-teleport-light"/><h2>{game.portalTarget!==undefined?'Atravessando o portal…':replayMode?'Sala repetida! Voltando ao mapa…':game.roomIndex===EXPLORATION_ROOMS.length-1?(game.roomIndex>=30?'Sala piloto concluída!':'Biomas concluídos!'):'Atravessando o portal…'}</h2><p>{game.portalTarget!==undefined?`Destino: ${chapterName(game.portalTarget)} · Sala ${game.portalTarget+1}`:replayMode?'Seu ponto de avanço na campanha foi preservado.':game.roomIndex<EXPLORATION_ROOMS.length-1?`${chapterName(game.roomIndex+1)} · Sala ${game.roomIndex+2}/${EXPLORATION_ROOMS.length}`:'Progresso salvo. As próximas salas serão criadas após a aprovação deste cenário.'}</p>{room.bossId&&game.activeCard&&<p><strong>Carta rara: {COMBAT_CARDS[game.activeCard].name}</strong><br/>{COMBAT_CARDS[game.activeCard].description}</p>}{!replayMode&&game.portalTarget===undefined&&game.roomIndex===EXPLORATION_ROOMS.length-1&&<button onClick={leave}>Salvar e sair</button>}</div>}
    </div>
    <dialog id="combat-panel" ref={dialog} className={`combat-dialog ${panel&&panel in BASE_NAMES?'combat-dialog-base':''} ${panel === 'inventory'||panel&&panel in BASE_NAMES ? 'combat-dialog-inventory' : ''}`} aria-labelledby="combat-dialog-title" onCancel={event => { event.preventDefault(); openPanel(null); }} onClose={() => { if (panelRef.current&&panelRef.current!=='build') openPanel(null); }}>
      <header className="combat-dialog-heading"><h2 id="combat-dialog-title">{modalTitle}</h2>{panel && <button onClick={() => openPanel(null)} aria-label={panel==='inventory'?'Fechar mochila e retomar':'Fechar painel e retomar'}><X size={20}/></button>}</header>
      {panel&&panel in BASE_NAMES?<ExplorationWorkshop key={panel} game={game} mode={panel as BaseBuilding} onAction={a=>change(workshopCommand(current.current,a))} onOrganize={()=>openPanel('build')} onOpenBuilding={k=>openPanel(k)}/>:panel === 'inventory' ? <CombatInventory onWorkshop={a=>change(workshopCommand(current.current,a))} onQuick={(slot,item)=>change(setCombatQuickItem(current.current,slot,item))} key={inventoryTab} initialTab={inventoryTab} gender={profile?.gender??'menino'} onLegend={a=>change(changeLegend(current.current,profile?.gender??'menino',a))} game={game} onUse={item => change(consumeCombatItem(current.current, item))} onEquip={() => change(equipCombatCharm(current.current))} onRare={item=>change(useRareCombatItem(current.current,item))} onPower={power=>change(equipCombatPower(current.current,power))} onCard={(card,slot)=>change(equipCombatCard(current.current,card,slot))} /> : panel === 'exit' ? <p>Seu nível de combate, HP, inimigos e coleta serão mantidos para continuar depois.</p> : <><p>{castle?'Explore as salas do castelo. As portas brilhantes estão liberadas para ir e voltar; veja sua localização no mapa da lupa.':room.hint}</p><p>As configurações e os guias ficam na tela de capítulos. Salve e volte ao mapa para consultá-los.</p></>}

      {panel !== 'inventory' && <div className="combat-dialog-actions"><button onClick={() => openPanel(null)}><Play size={16} />{panel === 'exit' ? 'Continuar aqui' : 'Retomar'}</button>{panel === 'exit' ? <button onClick={leave}>Salvar e voltar</button> : <button onClick={() => openPanel('exit')}>Voltar aos capítulos</button>}</div>}
    </dialog>
  </section>;
}
