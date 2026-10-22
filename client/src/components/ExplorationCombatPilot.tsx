import {castleOverviewPlayerPoint} from '@/game/explorationCastleView';
import {explorationDay} from '@/game/explorationDayCycle';
import ExplorationMarket from './ExplorationMarket';
import {nearMarket,marketCommand} from '@/game/explorationMarket';
import ExplorationVillageDialog from './ExplorationVillageDialog';
import {tickVillage,citizenIndoors,nearestVillager,villageCitizens,villageDueling,villageGift,startVillageDuel,endVillageDuel} from '@/game/explorationVillage';
import {nearCityService,villageLayout,WORLD_VILLAGERS as VILLAGERS,type VillagerId} from '@/game/explorationVillageLayout';
import {RoyalItemArt} from './ExplorationRoyalInventory';
import {ROYAL_CHESTS} from '@/game/explorationCastleObjects';
import {bindCastleActor,castleDown,nearestRoyalChest,royalDispersed,visibleCastleChests,royalActive,royalCommand} from '@/game/explorationCastleQuest';
import ExplorationGatheringGuide from './ExplorationGatheringGuide';
import ExplorationWorkshop from './ExplorationWorkshop';
import ExplorationBasePlacement from './ExplorationBasePlacement';
import {baseLayout,pendingBaseBuilding,buildingAt,insideSafeBase,placeBaseBuilding,BASE_NAMES,type BaseBuilding} from '@/game/explorationBase';
import {baseArtRevision} from '@/game/explorationWorkshopView';
import {pilotWalkable} from '@/game/explorationCombat';
import {workshopCommand,nearestResource,resourceState} from '@/game/explorationWorkshop';
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
  const [game, setGame] = useState<CombatState>(() => (()=>{const s=initial.supported?initial.state:createCombatState();if(s.legends?.active&&s.legends.active!==eligibleLegend(profile?.gender??'menino'))return {...s,legends:{...readLegendProgress(s.legends),active:null}};return bindCastleActor(s,profile?.characterId??'menino-preto');})());
  const [cardNotice,setCardNotice]=useState<ReturnType<typeof bossCardForRoom>|null>(null);
  const notifiedBosses=useRef(new Set(game.defeatedEnemyIds));
  useEffect(()=>{const boss=campaignRoom(game.roomIndex).bossId;if(boss&&game.defeatedEnemyIds.includes(boss)&&!notifiedBosses.current.has(boss)){notifiedBosses.current.add(boss);setCardNotice(bossCardForRoom(game.roomIndex));}},[game.roomIndex,game.defeatedEnemyIds]);
  useEffect(()=>{if(!cardNotice)return;const id=window.setTimeout(()=>setCardNotice(null),8000);return()=>window.clearTimeout(id);},[cardNotice]);
  const current = useRef(game), saveRef = useRef(onSave), controls = useRef(new ForestControls());
  const pending = useRef({ attack: false, power: false, interact: false });
  const pendingBuilding=useRef<BaseBuilding|null>(null);
  const route = useRef<CombatPoint[]>([]), panelRef = useRef<Panel>(null), overviewRef = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null), dialog = useRef<HTMLDialogElement>(null), pauseButton = useRef<HTMLButtonElement>(null);
  const [assetStatus, setAssetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [panel, setPanel] = useState<Panel>(null), [overview, setOverview] = useState(false), [zoom, setZoom] = useState(.65);
  const tutorialKey=`meupet-gathering-guide-v1:${profile?.name??'visitante'}:${profile?.characterId??'pet'}`;
  const tutorialStarted=useRef(false);
  useEffect(()=>{if(assetStatus!=='ready'||tutorialStarted.current)return;tutorialStarted.current=true;let seen=false;try{seen=localStorage.getItem(tutorialKey)==='done';}catch{}if(!seen)openPanel('guide');},[assetStatus,tutorialKey]);
  function finishGuide(){try{localStorage.setItem(tutorialKey,'done');}catch{}openPanel(null);}
  const [audioMix]=useState(loadExplorationAudio);
  const audio=useRef<ExplorationAudio|null>(null),mixRef=useRef(audioMix);mixRef.current=audioMix;
  useEffect(()=>{const controller=new ExplorationAudio();audio.current=controller;return()=>{controller.dispose();audio.current=null;};},[]);
  useEffect(()=>{audio.current?.configure(audioMix,soundOn&&!panel&&!overview&&assetStatus==='ready'&&!game.completed,chapterNumber(game.roomIndex));},[audioMix,soundOn,panel,overview,assetStatus,game.completed,game.roomIndex,game.castle?.active]);
  const [noticeVisible,setNoticeVisible]=useState(true);
  useEffect(()=>{setNoticeVisible(true);const timer=setTimeout(()=>setNoticeVisible(false),4500);return ()=>clearTimeout(timer);},[game.message,game.roomIndex]);
  const [selectedVillager,setSelectedVillager]=useState<VillagerId>('tomas');
  const [inventoryTab,setInventoryTab]=useState<'all'|'legends'|'crafted'>('all');
  const [lensExpanded,setLensExpanded]=useState(false),[lensMinimized,setLensMinimized]=useState(false);
  const [mapScale,setMapScale]=useState(1),[mapPan,setMapPan]=useState({x:0,y:0});const mapDrag=useRef<{id:number;x:number;y:number;pan:{x:number;y:number}}|null>(null);
  function centerMap(){const el=canvas.current;if(!el)return;const s=current.current,w=el.clientWidth,h=el.clientHeight;let p:{x:number;y:number};if(s.castle?.active){p=castleOverviewPlayerPoint(w,h,s.castle);}else{const v=(s.roomIndex>=30?nascentesView:combatView)(w,h,s.player,zoom,true);p={x:v.left+s.player.x*v.tile,y:v.top+s.player.y*v.tile};}setMapPan({x:(w/2-p.x)*mapScale,y:(h/2-p.y)*mapScale});}

  const [viewport,setViewport]=useState(()=>({width:typeof window==='undefined'?390:window.innerWidth,height:typeof window==='undefined'?844:window.innerHeight}));
  const zoomRef = useRef(zoom), lastSaved = useRef('');
  const accessibleTimers = useRef(new Set<number>());
  const stick = useRef({ x: 0, y: 0, pointer: -1 });
  const soundRef = useRef(soundOn); soundRef.current = soundOn;
  const char = profile?.characterId ?? 'menino-preto';
  saveRef.current = onSave; zoomRef.current = zoom;
  function clear() { pendingBuilding.current=null;stick.current = { x: 0, y: 0, pointer: -1 }; controls.current.clear(); route.current = []; pending.current = { attack: false, power: false, interact: false }; for (const id of accessibleTimers.current) window.clearTimeout(id); accessibleTimers.current.clear(); }
  function persist() { if (!initial.supported) return; const snapshot = combatSnapshot(current.current), key = JSON.stringify(snapshot); if (key !== lastSaved.current) { lastSaved.current = key; saveRef.current(snapshot); } }
  function openPanel(value: Panel) {if(value!=='village'&&current.current.village?.conversation){current.current={...current.current,village:{...current.current.village,conversation:undefined}};setGame(current.current);} if(villageDueling(current.current)&&value&&!['pause','exit'].includes(value))return; clear(); persist(); overviewRef.current=false;setOverview(false);panelRef.current = value; setPanel(value); }
  function renewConversation(id=selectedVillager){const s=current.current;if(!s.village)return;current.current={...s,village:{...s.village,conversation:{id,until:s.village.clock+20000}}};setGame(current.current);}
  function talkTo(id:VillagerId){setSelectedVillager(id);openPanel('village');renewConversation(id);}
  useEffect(()=>{if(panel==='village'&&game.village?.conversation&&game.village.clock>=game.village.conversation.until)openPanel(null);},[panel,game.village?.clock]);
  function change(next: CombatState) { if(next.legends?.active)preloadLegend(next.legends.active); if (next === current.current) return; current.current = next; setGame(next); persist(); }
  function leave() { clear(); persist(); onBack(); }
  function action(kind: keyof typeof pending.current) { if(kind==='interact'&&!villageDueling(current.current)){const civic=nearCityService(current.current);if(civic){openPanel(civic.art===0?'workshop':'potions');return;}if(nearMarket(current.current)){openPanel('market');return;}const citizen=nearestVillager(current.current);if(citizen){talkTo(citizen.id);return;}} if (!castleDown(current.current) && !panelRef.current && !overviewRef.current && !current.current.completed) { unlockPlatformAudio(); audio.current?.unlock(); route.current = []; pending.current[kind] = true; } }
  function dockAction(action:'pause'|'inventory'|'map'){
    if(villageDueling(current.current)&&action!=='pause')return;
    const next=lensDockAction(panelRef.current,overviewRef.current,action);
    if(next.overview){setMapScale(1);setMapPan({x:0,y:0});}clear();persist();overviewRef.current=next.overview;setOverview(next.overview);panelRef.current=next.panel;setPanel(next.panel);
  }
  function viewRoom(){dockAction('map');}

  useEffect(() => {
    const el=dialog.current;if(!el)return;
    if(panel&&panel!=='build'&&panel!=='village'&&!el.open)el.showModal();
    if((!panel||panel==='build'||panel==='village')&&el.open){el.close();pauseButton.current?.focus();}
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
    const soil=new Image();soil.src=NASCENTES_ASSETS.soil;
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
    let w = 1, h = 1, last = 0, ui = 0, savedAt = 0, frame = 0,paintKey='',draws=0;const costs:number[]=[];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => { w = Math.max(1, el.clientWidth); h = Math.max(1, el.clientHeight); const dpr = combatCanvasScale(w,h,window.devicePixelRatio || 1); const bw=Math.round(w*dpr),bh=Math.round(h*dpr);if(el.width!==bw||el.height!==bh){el.width=bw;el.height=bh;paintKey="";}ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const loop = (now: number) => {
      if(!shouldRunExplorationFrame(last,now)){frame=window.requestAnimationFrame(loop);return;}
      const frameStarted=performance.now();const dt = last ? Math.min(50, now - last) : 0; last = now;
      if (assetsReady && (!current.current.castle?.active||castleArtReady(current.current.castle.room)) && (!panelRef.current||panelRef.current==='village') && !overviewRef.current && !document.hidden && !current.current.completed) {
        const held = controls.current.snapshot(); let dx = Number(held.right) - Number(held.left) || stick.current.x, dy = Number(held.down) - Number(held.up) || stick.current.y;
        if(panelRef.current==='village'){dx=0;dy=0;route.current=[];}if (dx || dy) route.current = [];
        else if (route.current.length) {
          const position=current.current.castle?.active?current.current.castle.player:current.current.player,target=route.current[0],distance=Math.hypot(target.x-position.x,target.y-position.y);
          if (distance < (current.current.castle?.active?.015:.06)) route.current.shift();
          else { const scale = Math.min(1, distance / Math.max(.001, dt * .003)); dx = (target.x - position.x) / distance * scale; dy = (target.y - position.y) / distance * scale; }
        }
        const urgent = pending.current.attack || pending.current.power || pending.current.interact;
        let before = current.current;if(before.workshop?.job&&Date.now()>=before.workshop.job.finishAt){const finished=workshopCommand(before,{type:'claim'});if(finished!==before){change(finished);before=finished;}}
        current.current = panelRef.current==='village'?tickVillage(before,dt):stepCombat(before, { dx, dy, ...pending.current }, dt);
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
        const changedEvent = current.current.castle?.room!==before.castle?.room || current.current.castle?.active!==before.castle?.active || current.current.xp !== before.xp || current.current.collectedNodes.length !== before.collectedNodes.length || current.current.loot.length !== before.loot.length || current.current.deaths !== before.deaths || current.current.completed;
        if (changedEvent || now - savedAt > 5000) { persist(); savedAt = now; }
        if (now - ui > 100 || current.current.completed) { setGame(current.current); ui = now; }
      }
      if(assetsReady&&current.current.completed&&!document.hidden&&!panelRef.current&&!overviewRef.current){
        const before=current.current;current.current=tickCombatPortal(before,dt);
        if(current.current!==before){if(current.current.roomIndex!==before.roomIndex){clear();persist();}setGame(current.current);}
      }
      if(window.location.pathname==='/qa-exploration-lab')el.dataset.logicMs=(performance.now()-frameStarted).toFixed(2);
      const key=`${current.current.revision}:${w}:${h}:${zoomRef.current}:${overviewRef.current}:${assetsReady}:${reduced.matches}:${castleArtRevision()}:${biomeArtRevision()}:${baseArtRevision()}:${panelRef.current}:${current.current.workshop?.job?Math.floor(Date.now()/250):0}`;
      if(assetsReady&&shouldDrawExplorationFrame((!panelRef.current||panelRef.current==='village')&&!overviewRef.current,key,paintKey)){
      drawCombatPilot(ctx, w, h, current.current, pet, atlas, bg, zoomRef.current, overviewRef.current, reduced.matches, enemies, props, itemArt,garden,shelter,portal,bridge,keyArt,mobs,rareArt,riverMobs,riverProps,riverPortal,water,autumnMobs,powerArt,stone,cliff,soil,panelRef.current==='build');
      paintKey=key;draws++;
      }
      if(window.location.pathname==='/qa-exploration-lab'&&now-ui<40){const position=current.current.castle?.active?current.current.castle.player:current.current.player;costs.push(performance.now()-frameStarted);if(costs.length>300)costs.shift();const ordered=[...costs].sort((a,b)=>a-b);el.dataset.frameAverageMs=(costs.reduce((a,b)=>a+b,0)/costs.length).toFixed(2);el.dataset.frameP95Ms=(ordered[Math.floor(ordered.length*.95)]??0).toFixed(2);el.dataset.zoom=String(zoomRef.current);el.dataset.runningDraws=String(draws);el.dataset.gameTime=String(Math.round(current.current.time));el.dataset.playerX=String(position.x);el.dataset.playerY=String(position.y);}
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
  const daylight=explorationDay(game.village?.dayClock??game.village?.clock),speaker=panel==='village'?villageCitizens(game).find(c=>c.id===selectedVillager):undefined,speechView=(game.roomIndex>=30?nascentesView:combatView)(canvas.current?.clientWidth??viewport.width,canvas.current?.clientHeight??viewport.height,game.player,zoom,false);
  const civic=nearCityService(game),social=nearestVillager(game),duel=game.village?.duel;
  const royalChest=nearestRoyalChest(game);
  const resource=nearestResource(game);
  const powerName=royalActive(game,'power')?'Explosão Real':COMBAT_POWERS[game.activePower??'burst'].name;
  const gatherLabel=royalChest?'Golpeie o baú':resource?(resource.tool==='axe'?'Cortar madeira':'Minerar'): 'Marco';
  const modalTitle=panel==='market'?'Mercado da Vila':panel==='village'?`Conversar com ${VILLAGERS.find(d=>d.id===selectedVillager)!.name}`:panel==='guide'?'Primeiros passos: coletar e fabricar':panel&&panel in BASE_NAMES?BASE_NAMES[panel as BaseBuilding]:panel==='inventory'?'Mochila da Exploração':panel==='exit'?'Voltar aos capítulos?':'Exploração pausada';
  if (!initial.supported) return <section className="combat-pilot combat-unavailable"><h1>Atualize o jogo para continuar</h1><p>Este progresso pertence a uma versão mais nova e foi preservado.</p><button onClick={onBack}>Voltar à Exploração</button></section>;

  const dock=lensDockLayout(viewport.width,viewport.height,lensExpanded);
  const dockStyle={'--lens-size':`${dock.diameter}px`,'--lens-top':`${dock.top}px`,'--lens-bottom':`${dock.bottom}px`,'--lens-hud-width':`${dock.hudWidth}px`} as CSSProperties;
  return <section onPointerDownCapture={()=>{if(soundRef.current)audio.current?.unlock();}} onKeyDownCapture={()=>{if(soundRef.current)audio.current?.unlock();}} style={dockStyle} className={`combat-pilot combat-pilot--lens-dock ${overview?'is-map-overview':''} ${panel==='build'?'is-base-editing':''} ${overview&&game.roomIndex>=30?'is-chapter4-overview':''}`} aria-label="Campanha de Exploração">

    <div className="combat-stage">{castleDown(game)&&<div role="alert" style={{position:"absolute",top:"40%",left:"10%",right:"10%",zIndex:25,background:"#1b2135ee",color:"white",padding:20,borderRadius:18,textAlign:"center"}}>Armadura encantada!<br/>Aguarde {Math.max(0,Math.ceil(((game.castleQuest?.reviveAt??0)-Date.now())/1000))} segundos para se levantar.</div>}
      {assetStatus !== 'ready' && <div className="combat-result" role="status"><h2>{assetStatus === 'error' ? 'Não foi possível carregar seu pet' : 'Preparando a caminhada…'}</h2><p>{assetStatus === 'error' ? 'Volte ao mapa e tente novamente. Seu progresso foi preservado.' : 'A sala começa quando a animação estiver pronta.'}</p><button onClick={leave}>Voltar ao mapa</button></div>}
      <canvas ref={canvas} style={overview?{transform:`translate(${mapPan.x}px,${mapPan.y}px) scale(${mapScale})`,transformOrigin:"50% 50%",touchAction:"none",cursor:"grab"}:undefined} onPointerDown={e=>{if(!overview)return;e.currentTarget.setPointerCapture(e.pointerId);mapDrag.current={id:e.pointerId,x:e.clientX,y:e.clientY,pan:mapPan};}} onPointerMove={e=>{const d=mapDrag.current;if(!overview||!d||d.id!==e.pointerId)return;setMapPan({x:d.pan.x+e.clientX-d.x,y:d.pan.y+e.clientY-d.y});}} onPointerCancel={()=>{mapDrag.current=null;}} aria-label={castle?(overview?`Mapa geral do Castelo. Você está em ${castleRoom(castle.room).name}.`:`${castleRoom(castle.room).name}. Mesmos controles da exploração; caminhe até as portas brilhantes.`):overview?`Mapa completo da sala ${game.roomIndex+1}. O marcador vermelho com a legenda Você está aqui mostra a posição atual do personagem.`:"Clareira de combate. Joystick, setas ou WASD movem. E ou Espaço: patada. Q: poder. F: marco. I: mochila."} onPointerUp={event => {
        if(overviewRef.current){mapDrag.current=null;return;}
        if (villageDueling(current.current)||castleDown(current.current) || panelRef.current || overviewRef.current || current.current.completed) return;
        const r = event.currentTarget.getBoundingClientRect();if(current.current.castle?.active){const c=current.current.castle,v=castleView(r.width,r.height,c.player,zoom);const target={x:(event.clientX-r.left-v.left)/v.tile,y:(event.clientY-r.top-v.top)/v.tile};const door=castlePassages(c.room).find(d=>Math.hypot(d.x-target.x,d.y-target.y)<1);route.current=castleRoute(c.player,door??target,c.room,royalDispersed(current.current));return;}const v = current.current.roomIndex>=30?nascentesView(r.width,r.height,current.current.player,zoom,false):combatView(r.width, r.height, current.current.player, zoom, false);
        const target={x:(event.clientX-r.left-v.left)/v.tile,y:(event.clientY-r.top-v.top)/v.tile},civic=nearCityService({...current.current,player:target});if(civic){const currentService=nearCityService(current.current);if(currentService?.id===civic.id){openPanel(civic.art===0?'workshop':'potions');return;}route.current=pilotRoute(current.current.player,{x:civic.x,y:civic.y+.8},current.current.gateOpen,current.current.roomIndex,current.current.workshop);return;}const building=buildingAt(current.current,target);if(building){if(insideSafeBase(current.current)){openPanel(building);return;}pendingBuilding.current=building;const q=baseLayout(current.current)[building];route.current=pilotRoute(current.current.player,{x:q.x,y:q.y+.9},current.current.gateOpen,current.current.roomIndex,current.current.workshop);return;}route.current=pilotRoute(current.current.player,target,current.current.gateOpen,current.current.roomIndex,current.current.workshop);
      }} />

      {castle&&!overview&&!panel&&!castleDown(game)&&visibleCastleChests(game).map(chest=>{const v=castleView(canvas.current?.clientWidth??viewport.width,canvas.current?.clientHeight??viewport.height,castle.player,zoom),x=v.left+chest.x*v.tile,y=v.top+chest.y*v.tile;return <button key={chest.id} aria-label={`Baú ${chest.id+1}: aproximar para golpear`} style={{position:'absolute',left:x-22,top:y-44,width:44,height:44,zIndex:3,background:'transparent',border:0}} onClick={()=>{route.current=castleRoute(current.current.castle!.player,{x:chest.x,y:chest.y+.75},current.current.castle!.room,royalDispersed(current.current));}}/>;})}
      {!duel&&!overview&&!panel&&!castle&&villageLayout(game.roomIndex).markets.filter(m=>m.art!==2).map(m=>{const v=(game.roomIndex>=30?nascentesView:combatView)(viewport.width,viewport.height,game.player,zoom,false),x=v.left+m.x*v.tile,y=v.top+m.y*v.tile;if(x<-48||x>viewport.width+48||y<-48||y>viewport.height+v.tile*4)return null;return <button key={m.id} aria-label={`Visitar ${m.name}`} style={{position:'absolute',left:x-24,top:y-48,width:48,height:48,zIndex:3,background:'transparent',border:0}} onClick={()=>{if(nearMarket(current.current)?.id===m.id)openPanel('market');else route.current=pilotRoute(current.current.player,{x:m.x,y:m.y+.9},current.current.gateOpen,current.current.roomIndex,current.current.workshop);}}/>;})}
      {!duel&&!overview&&!panel&&villageCitizens(game).filter(c=>!citizenIndoors(c,c.home,c.room)).map(c=>{const v=(game.roomIndex>=30?nascentesView:combatView)(canvas.current?.clientWidth??viewport.width,canvas.current?.clientHeight??viewport.height,game.player,zoom,false),x=v.left+c.x*v.tile,y=v.top+c.y*v.tile;if(x<-44||x>viewport.width+44||y<0||y>viewport.height+v.tile*1.2)return null;return <button key={c.id} aria-label={`Conversar com ${c.name}`} style={{position:'absolute',left:x-22,top:y-v.tile*1.3,width:44,height:Math.max(44,v.tile*1.3),zIndex:3,background:'transparent',border:0}} onClick={()=>{if(Math.hypot(c.x-current.current.player.x,c.y-current.current.player.y)<1.8){talkTo(c.id);}else route.current=pilotRoute(current.current.player,{x:c.x,y:c.y+.7},current.current.gateOpen,current.current.roomIndex,current.current.workshop);}}/>;})}
      {speaker&&<aside className="village-speech" role="dialog" aria-label={`Conversar com ${speaker.name}`} style={{left:Math.max(12,Math.min((canvas.current?.clientWidth??viewport.width)-276,speechView.left+speaker.x*speechView.tile-130)),top:Math.max(12,Math.min((canvas.current?.clientHeight??viewport.height)-210,speechView.top+speaker.y*speechView.tile-speechView.tile*1.3-170))}} onPointerDownCapture={()=>renewConversation()} onKeyDownCapture={()=>renewConversation()}><button className="village-speech-close" aria-label="Encerrar conversa" onClick={()=>openPanel(null)}><X size={18}/></button><ExplorationVillageDialog game={game} id={selectedVillager} onGift={()=>{change(villageGift(current.current,selectedVillager));renewConversation();}} onDuel={()=>{const next=startVillageDuel(current.current,selectedVillager);change(next);if(next.village?.duel)openPanel(null);}}/></aside>}
      {duel&&<aside className="village-duel-hud" aria-label="Duelo de treino"><strong>{VILLAGERS.find(d=>d.id===duel.id)!.name} · Nv {VILLAGERS.find(d=>d.id===duel.id)!.level}</strong><label>Vida do adversário <progress aria-label="Vida do aldeão no duelo" value={duel.npcHp} max={duel.npcMaxHp}/><span>{duel.npcHp}/{duel.npcMaxHp}</span></label><small>Somente golpes de mão · esquive quando preparar o golpe</small><button onClick={()=>{clear();change(endVillageDuel(current.current));}}>Encerrar treino</button></aside>}
      <div className="combat-status-stack" aria-label="Estado da exploração">    <header className="combat-top"><div><small>{castle?`CAP. 5 · ${castleRoom(castle.room).name.toUpperCase()}`:<>{replayMode?'REPETIÇÃO · ':''}CAP. {chapterNumber(game.roomIndex)} · SALA {game.roomIndex+1}/{EXPLORATION_ROOMS.length} · {room.title.toUpperCase()}</>}</small><h1>{legendName(game)??profile?.name??'Seu pet'} · Nv {combatLevel(game.xp)}</h1></div><div><span>XP {game.xp} / {combatLevel(game.xp) ** 2 * 40}</span></div></header><span className="combat-day-period" aria-label="Período do mundo">{daylight.label} · {daylight.minutesLeft}min{daylight.phase==='night'?' · Luz: 5 passos':''}</span>      <div className="combat-vitals"><label>HP <strong>{Math.ceil(duel?.hp??game.hp)}/{duel?.maxHp??combatMaxHp(game.xp)}</strong><progress value={duel?.hp??game.hp} max={duel?.maxHp??combatMaxHp(game.xp)} aria-label="Vida do pet" /></label><label>Energia <strong>{Math.floor(game.energy)}/100</strong><progress value={game.energy} max={100} aria-label="Energia de combate" /></label></div>      {!castle&&!duel&&<div className="combat-objective"><ExplorationItemIcon item="fibra" size={23} /><span>{Math.min(room.fibers, fibers)}/{room.fibers} fibras</span>{room.encounters>0&&<span>{Math.min(room.encounters,game.roomIndex===0?game.defeated:game.defeatedEnemyIds.length)}/{room.encounters} encontros</span>}<span>{game.gateOpen ? "Siga ao portal" : room.index>=30?"Libere a passagem":"Ative o marco"}</span>{room.switches.length>0&&<span>Placas {game.switchStep}/{room.switches.length}</span>}{room.key&&<span>{game.hasRoomKey?'Chave ✓':'Busque a chave'}</span>}{room.bridge&&<span>{game.bridgeCrossed?'Ponte ✓':'Atravesse a ponte'}</span>}{room.bossId&&<span>{game.defeatedEnemyIds.includes(room.bossId)?'Mestre ✓':'Vença o mestre'}</span>}{room.useConsumable&&<span>{game.consumablesUsed?'Recuperação ✓':'Use fruta/erva'}</span>}</div>}
      {(overview||noticeVisible)&&<div className="combat-goal" role="status">{overview ? (castle?'Mapa geral · Portas livres · Voltar ao pet retoma':'Inspeção pausada · Voltar ao pet retoma') : game.message}</div>}
</div>
      {!duel&&!castle&&panel!=='build'&&<button className="combat-base-shortcut" onClick={()=>openPanel('home')} aria-label="Abrir casa e construções">Casa e construções <span className="combat-base-state">{insideSafeBase(game)?' · Protegido':''}</span></button>}
      {panel==='build'&&!castle&&<ExplorationBasePlacement game={game} width={canvas.current?.clientWidth??viewport.width} height={canvas.current?.clientHeight??viewport.height} onDone={()=>openPanel('home')} onPlace={(k,p)=>change(placeBaseBuilding(current.current,k,p,(q,r)=>pilotWalkable(q,current.current.gateOpen,r,current.current.roomIndex,undefined,true)))}/>}
      {!lensMinimized&&<ExplorationMinimap state={game}>
        <nav className="combat-lens-dock" aria-label="Atalhos da Exploração">
          <button className="combat-lens-slot combat-lens-sound" onClick={()=>{if(!soundOn)audio.current?.unlock();onToggleSound();}} aria-label={soundOn?'Desligar som':'Ligar som'} aria-pressed={soundOn} title={soundOn?'Desligar som':'Ligar som'}>{soundOn?<Volume2/>:<VolumeX/>}</button>
          <button className="combat-lens-slot combat-lens-pause" ref={pauseButton} onClick={()=>dockAction('pause')} aria-label={panel||overview?'Continuar exploração':'Pausar exploração'} aria-pressed={Boolean(panel)||overview} title={panel||overview?'Continuar':'Pausar'}>{panel||overview?<Play/>:<Pause/>}</button>
          <button className="combat-lens-slot combat-lens-inventory" onClick={()=>{setInventoryTab('all');dockAction('inventory');}} aria-label={panel==='inventory'?'Fechar mochila':'Abrir mochila'} aria-expanded={panel==='inventory'} aria-controls="combat-panel" title={panel==='inventory'?'Fechar mochila':'Abrir mochila'}>{panel==='inventory'?<X/>:<Backpack/>}</button>
          <button className="combat-lens-slot combat-lens-equipment" onClick={()=>{setInventoryTab('legends');openPanel('inventory');}} aria-label="Equipar itens do Lendário" title="Equipamentos do Lendário"><PowerSymbol power="roots"/></button><button className="combat-lens-slot combat-lens-size" onClick={()=>setLensExpanded(value=>!value)} aria-label={lensExpanded?'Reduzir tamanho da lupa':'Ampliar tamanho da lupa'} aria-pressed={lensExpanded} title={lensExpanded?'Reduzir lupa':'Ampliar lupa'}>{lensExpanded?<Minus/>:<Plus/>}</button>
          <button className="combat-lens-slot combat-lens-map" onClick={viewRoom} aria-label={overview?'Voltar ao pet':'Ver mapa completo'} aria-pressed={overview} title={overview?'Voltar ao pet':'Ver mapa completo'}>{overview?<X/>:<Map/>}</button>
          <button type="button" className="combat-lens-slot combat-lens-zoom-in" disabled={overview} onClick={()=>{route.current=[];setZoom(z=>Math.min(1.4,+(z+.25).toFixed(2)));}} aria-label="Aproximar personagem" title="Aproximar personagem"><ZoomIn/></button>
          <button type="button" className="combat-lens-slot combat-lens-zoom-out" disabled={overview} onClick={()=>{route.current=[];setZoom(z=>Math.max(.25,+(z-.2).toFixed(2)));}} aria-label="Afastar personagem" title="Afastar personagem"><ZoomOut/></button>
        </nav>
      </ExplorationMinimap>}
      <button className={`combat-lens-collapse ${lensMinimized?"is-minimized":""}`} aria-label={lensMinimized?"Mostrar lupa e atalhos":"Recolher lupa e atalhos"} aria-expanded={!lensMinimized} onClick={()=>setLensMinimized(v=>!v)}>{lensMinimized?<Map/>:<Minus/>}</button>
      {overview&&<nav className="combat-map-controls" aria-label="Navegar pelo mapa"><button disabled={mapScale>=4} aria-label="Aproximar mapa" onClick={()=>setMapScale(s=>Math.min(4,s+.5))}><ZoomIn/></button><button disabled={mapScale<=1} aria-label="Afastar mapa" onClick={()=>{setMapScale(s=>Math.max(1,s-.5));}}><ZoomOut/></button><button onClick={centerMap}>Onde estou</button><button onClick={()=>{setMapScale(1);setMapPan({x:0,y:0});}}>Mapa inteiro</button><button onClick={viewRoom}>Voltar ao pet</button></nav>}
      {game.workshop?.result&&Date.now()<game.workshop.result.until&&<aside className={`combat-craft-result ${game.workshop.result.success?'is-success':'is-failure'}`} role="status"><strong>{game.workshop.result.success?'Produção concluída':'Melhoria falhou'}</strong><span>{game.workshop.result.name}</span><button onClick={()=>{setInventoryTab('crafted');openPanel('inventory');}}>Ver itens e equipamentos</button></aside>}
      {!game.completed&&cardNotice&&<aside className="combat-card-note" role="status"><strong>Carta rara conquistada</strong><p>{COMBAT_CARDS[cardNotice].description}</p><small>Disponível na mochila · veja os espaços de cartas para equipar</small><button aria-label="Fechar aviso de carta rara" onClick={()=>setCardNotice(null)}>Fechar</button></aside>}
      {!game.completed && <div className="combat-item-tray" aria-label="Itens e uso rápido">
        <span className="combat-collect-slot" title="Fibras coletadas"><ExplorationItemIcon item="fibra" size={28}/><small>{Math.min(room.fibers, fibers)}/{room.fibers}</small></span>
        <span className="combat-collect-slot" title="Âmbar coletado"><ExplorationItemIcon item="ambar" size={28}/><small>{game.stock.ambar + game.bag.ambar}</small></span>
        {normalizeQuickItems(game.quickItems).map(item => <button key={item} disabled={Boolean(duel)||castleDown(game)||!canUse(item)||Boolean(panel)||overview} onClick={()=>useItem(item)} aria-label={`Usar ${item==='erva'||item==='fruta'?COMBAT_ITEMS[item]:RARE_ITEMS[item]}, ${quickItemCount(game,item)} disponível`}><ExplorationItemIcon item={item} size={30}/><span>{quickItemCount(game,item)}</span><small>{item==='fruta'?'Energia':'Curar'}</small></button>)}
      </div>}
      {!game.completed && <div className="combat-controls">
        <ExplorationJoystick disabled={castleDown(game) || Boolean(panel) || overview || game.completed} onChange={value=>{stick.current={...value,pointer:-1};if(value.x||value.y){route.current=[];}}}/>

        <div className="combat-actions">{resource&&<p className="combat-gather-hint" role="status">{resourceState(game.workshop,resource.id).remaining?`${gatherLabel} · ${resourceState(game.workshop,resource.id).remaining}/5 · ${resource.tool==='axe'?'Machado':'Picareta'} Nv ${resource.required}`:`Esgotado · renova em ${Math.ceil(Math.max(0,resourceState(game.workshop,resource.id).respawnAt-Date.now())/60000)}min`}</p>}{(['attack', 'power', 'interact'] as const).map((kind, index) => <button className={`combat-action-${kind}`} key={kind} disabled={castleDown(game) || Boolean(panel) || overview || (kind === 'power' && (Boolean(duel)||game.energy < 25))||(kind==='interact'&&Boolean(duel))} aria-label={[game.legends?.active?'Ataque do Lendário, E ou espaço':'Patada, E ou espaço', `Usar ${powerName}, Q, custa 25 de energia`, civic?`Usar ${civic.art===0?'oficina da cidade':'casa de cura'}, F`:social?`Conversar com ${social.name}, F`:resource?`${gatherLabel}, F`:'Interagir com marco, F'][index]} onPointerDown={e => { e.preventDefault(); action(kind); }} onClick={e => { if (e.detail === 0) action(kind); }}>{index === 0 ? <PawPrint /> : index === 1 ? royalActive(game,'power')?<RoyalItemArt item='power' size={30}/>:<PowerSymbol power={game.activePower??'burst'}/> : <Shield />}<span>{[duel?'Soco':royalChest?'Golpear baú':'Atacar', duel?'Suspenso':powerName, civic?(civic.art===0?'Oficina':'Cura'):nearMarket(game)?'Negociar':social?'Conversar':resource?gatherLabel:'Marco'][index]}</span></button>)}</div>
      </div>}
      {game.completed && <div className={`combat-teleport ${game.roomIndex===EXPLORATION_ROOMS.length-1?'combat-teleport-final':''}`} role="status" aria-live="polite"><div className="combat-teleport-light"/><h2>{game.portalTarget!==undefined?'Atravessando o portal…':game.roomIndex===EXPLORATION_ROOMS.length-1?(game.roomIndex>=30?'Sala piloto concluída!':'Biomas concluídos!'):'Atravessando o portal…'}</h2><p>{game.portalTarget!==undefined?`Destino: ${chapterName(game.portalTarget)} · Sala ${game.portalTarget+1}`:game.roomIndex<EXPLORATION_ROOMS.length-1?`${chapterName(game.roomIndex+1)} · Sala ${game.roomIndex+2}/${EXPLORATION_ROOMS.length}`:'Progresso salvo. As próximas salas serão criadas após a aprovação deste cenário.'}</p>{room.bossId&&game.activeCard&&<p><strong>Carta rara: {COMBAT_CARDS[game.activeCard].name}</strong><br/>{COMBAT_CARDS[game.activeCard].description}</p>}{game.portalTarget===undefined&&game.roomIndex===EXPLORATION_ROOMS.length-1&&<button onClick={leave}>Salvar e sair</button>}</div>}
    </div>
    <dialog id="combat-panel" ref={dialog} className={`combat-dialog ${panel&&panel in BASE_NAMES?'combat-dialog-base':''} ${panel === 'inventory'||panel&&panel in BASE_NAMES ? 'combat-dialog-inventory' : ''}`} aria-labelledby="combat-dialog-title" onCancel={event => { event.preventDefault(); openPanel(null); }} onClose={() => { if (panelRef.current&&panelRef.current!=='build') openPanel(null); }}>
      <header className="combat-dialog-heading"><h2 id="combat-dialog-title">{modalTitle}</h2>{panel && <button onClick={() => openPanel(null)} aria-label={panel==='inventory'?'Fechar mochila e retomar':'Fechar painel e retomar'}><X size={20}/></button>}</header>
      {panel==='market'?<ExplorationMarket game={game} id={nearMarket(game)?.id??'loja'} onAction={a=>change(marketCommand(current.current,nearMarket(current.current)?.id??'loja',a))}/>:panel==='village'?<ExplorationVillageDialog game={game} id={selectedVillager} onGift={()=>change(villageGift(current.current,selectedVillager))} onDuel={()=>{const next=startVillageDuel(current.current,selectedVillager);change(next);if(next.village?.duel)openPanel(null);}}/>:panel==='guide'?<ExplorationGatheringGuide onDone={finishGuide}/>:panel&&panel in BASE_NAMES?<ExplorationWorkshop key={panel} game={game} mode={panel as BaseBuilding} onAction={a=>{const before=current.current,next=workshopCommand(before,a);change(next);if(a.type==='start'&&next!==before)openPanel(null);}} onOrganize={()=>openPanel('build')} onOpenBuilding={k=>openPanel(k)} onGuide={()=>openPanel('guide')}/>:panel === 'inventory' ? <CombatInventory onRoyal={item=>change(royalCommand(current.current,item))} onWorkshop={a=>{const before=current.current,next=workshopCommand(before,a);change(next);if(a.type==='start'&&next!==before)openPanel(null);}} onQuick={(slot,item)=>change(setCombatQuickItem(current.current,slot,item))} key={inventoryTab} initialTab={inventoryTab} gender={profile?.gender??'menino'} onLegend={a=>change(castleDown(current.current)?current.current:bindCastleActor(changeLegend(current.current,profile?.gender??'menino',a),char))} game={game} onUse={item => change(consumeCombatItem(current.current, item))} onEquip={() => change(equipCombatCharm(current.current))} onRare={item=>change(useRareCombatItem(current.current,item))} onPower={power=>change(equipCombatPower(current.current,power))} onCard={(card,slot)=>change(equipCombatCard(current.current,card,slot))} /> : panel === 'exit' ? <p>Seu nível de combate, HP, inimigos e coleta serão mantidos para continuar depois.</p> : <><p>{castle?'Explore as salas do castelo. As portas brilhantes estão liberadas para ir e voltar; veja sua localização no mapa da lupa.':room.hint}</p><button onClick={()=>openPanel('guide')}>Como coletar, refinar e fabricar</button><p>As configurações e os guias ficam na tela de capítulos. Salve e volte ao mapa para consultá-los.</p></>}

      {panel !== 'inventory' && <div className="combat-dialog-actions"><button onClick={() => openPanel(null)}><Play size={16} />{panel === 'exit' ? 'Continuar aqui' : 'Retomar'}</button>{panel === 'exit' ? <button onClick={leave}>Salvar e voltar</button> : <button onClick={() => openPanel('exit')}>Voltar aos capítulos</button>}</div>}
    </dialog>
  </section>;
}
