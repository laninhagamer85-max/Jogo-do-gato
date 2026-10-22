import {drawExplorationDaylight} from './explorationDaylightView';
import {villageLayout,villageSettlements,settlementStage} from './explorationVillageLayout';
import {nearestVillager,villageCitizens} from './explorationVillage';
import {drawVillageMarket,drawVillageHouse,drawVillageResource,drawVillageCitizen} from './explorationVillageView';
import {royalActive} from './explorationCastleQuest';
import {drawRoyalHeld,drawRoyalPower} from './explorationRoyalView';
import {drawExplorationTrails} from './explorationTrails';
import {woodlandResource} from './explorationWoodlandResources';
import {baseLayout,baseVisible,baseView,insideSafeBase,BASE_BUILDINGS} from './explorationBase';
import {resourceNodes,resourceState,harvestingActive} from './explorationWorkshop';
import {drawResource,drawResourceLabel,drawHarvestTool,drawBaseBuilding,drawBaseProtection} from './explorationWorkshopView';
import {drawPaintedItem,type PaintedItem} from './explorationPaintedItems';
import {drawBiomeShelter,drawBiomeTree} from './explorationBiomeArt';
import {explorationGroves,openWorldPlants} from './explorationOpenWorld';
import {returnPortal} from './explorationChapter4';
import {drawCastleWorld} from './explorationCastleView';
import {drawOverviewLocation} from './explorationOverviewLocation';
import {nascentesTrees} from './explorationChapter4';
import {drawNascentesTerrain,drawNascentesItem,nascentesView,drawNascentesTree} from './explorationChapter4View';
import {drawExplorationLegend} from './explorationLegendView';
import {explorationColorVariant,AUTUMN_GROUND_FILTER,AUTUMN_PROP_FILTER} from './explorationColorCache';
import {hazardPhase} from './explorationHazards';
import {explorationMobFrame} from './explorationMobArt';
import {campaignRoom,campaignGardens,campaignEnemies,campaignWaterBlocks,RARE_ITEMS} from './explorationCampaign';
import {drawBiomeWater} from './biomeCompositionView';
import {drawCampaignBridge,drawCampaignKey,drawRiverProp,drawCampaignShore} from './explorationCampaignArt';
import {drawPortalEnergy,drawPortalArch} from './explorationPortal';
import { SCATTERED_GARDENS, OUTER_GARDENS, ROOM_EDGE_SOLIDS, ROOM_SCENERY, ROOM_GARDENS, ROOM_EDGE_GARDENS, PILOT_SHELTER } from "./explorationRoom";
import {drawGardenPatch,gardenPlacement,drawForestSun,drawForestFauna,drawForestPerches} from './forestNature';
import { drawExplorationGround, drawWoodlandProp, woodlandPropPlacement, GROUND_WORLD,FOREST_GROUND } from "./explorationScenery";
import { combatAttackPose, combatLootLift, combatPickupCue } from "./combatPresentation";
import { combatLevel, COMBAT_ITEMS, PILOT_CAMP, PILOT_ENEMIES, PILOT_INSECT, PILOT_EXIT, PILOT_MARKER, PILOT_NODES, PILOT_SIZE, PILOT_WALLS, type CombatPoint, type CombatState } from './explorationCombat';
import { drawWalkFrame } from './petWalkAtlas';
import { homeWalkDirection } from './petFrameCleanup';

/** Match phone pixel density while bounding the backing buffer to six million pixels. */
export function combatCanvasScale(width:number,height:number,pixelRatio:number){
  return Math.max(.5,Math.min(3,Math.max(1,pixelRatio||1),Math.sqrt(6_000_000/(Math.max(1,width)*Math.max(1,height)))));
}
export function combatView(width: number, height: number, player: CombatPoint, zoom = 1, overview = false,roomIndex=0) {
  if(overview){const l=Math.min(-84,player.x-3),r=Math.max(84,player.x+3),u=Math.min(-46,player.y-3),b=Math.max(80,player.y+3),portrait=height>width,top=portrait?180:12,availableW=width-(portrait?12:165),availableH=Math.max(100,height-top-12),tile=Math.min(availableW/(r-l),availableH/(b-u));return{tile,left:availableW/2-(l+r)/2*tile,top:top+availableH/2-(u+b)/2*tile};}
  const tile=Math.max(52,width/11,height/9)*zoom;
  return {tile,left:width/2-player.x*tile,top:height*.46-player.y*tile};
}
export function drawCombatPilot(ctx: CanvasRenderingContext2D, width: number, height: number, state: CombatState,
  pet: HTMLImageElement, atlas: HTMLImageElement, background: HTMLImageElement, zoom: number, overview: boolean, reducedMotion: boolean, enemiesAtlas?: HTMLImageElement, propsAtlas?: HTMLImageElement, itemArt?:Partial<Record<keyof typeof COMBAT_ITEMS,HTMLImageElement>>&Partial<Record<'perola'|'escama',HTMLImageElement>>,gardenAtlas?:HTMLImageElement,shelterAtlas?:HTMLImageElement,portalAtlas?:HTMLImageElement,bridgeAtlas?:HTMLImageElement,keyAtlas?:HTMLImageElement,mobsAtlas?:HTMLImageElement,rareAtlas?:HTMLImageElement,riverMobs?:HTMLImageElement,riverProps?:HTMLImageElement,riverPortal?:HTMLImageElement,waterTexture?:HTMLImageElement,autumnMobs?:HTMLImageElement,powerArt?:HTMLImageElement,chapter4Stone?:HTMLImageElement,chapter4Cliff?:HTMLImageElement,chapter4Soil?:HTMLImageElement,baseEditing=false) {
  if(state.castle?.active){drawCastleWorld(ctx,width,height,state,pet,atlas,zoom,overview,reducedMotion,powerArt);return;}
  if(state.village?.duel)state={...state,player:state.village.duel.player};
  const qa=typeof window!=='undefined'&&window.location.pathname==='/qa-exploration-lab';let mark=qa?performance.now():0;const trace=(name:string)=>{if(qa){ctx.canvas.dataset[name]=(performance.now()-mark).toFixed(1);mark=performance.now();}};
  const room=campaignRoom(state.roomIndex),river=room.biome==='river',autumn=room.biome==='autumn',definitions=campaignEnemies(state.roomIndex,state.encounterSeed);
  if(autumn){background=explorationColorVariant(background,AUTUMN_GROUND_FILTER)!;propsAtlas=explorationColorVariant(propsAtlas,AUTUMN_PROP_FILTER);gardenAtlas=explorationColorVariant(gardenAtlas,AUTUMN_PROP_FILTER);mobsAtlas=explorationColorVariant(mobsAtlas,'sepia(.65) saturate(1.4) hue-rotate(338deg)');portalAtlas=explorationColorVariant(portalAtlas,'sepia(.6) saturate(1.3)');}
  trace('paletteMs');
  const v = baseEditing?baseView(width,height,state):room.index>=30?nascentesView(width,height,state.player,zoom,overview):combatView(width, height, state.player, zoom, overview,room.index), t = v.tile;
  const point = (p: CombatPoint) => ({ x: v.left + p.x * t, y: v.top + p.y * t });
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if(room.biome==='nascentes')drawNascentesTerrain(ctx,width,height,v.left,v.top,t,background,chapter4Stone,state.gateOpen,bridgeAtlas,chapter4Cliff,propsAtlas,state.time,reducedMotion,portalAtlas,waterTexture,undefined,room.index,false,chapter4Soil,()=>drawExplorationTrails(ctx,room.index,v.left,v.top,t,chapter4Soil,state.encounterSeed,villageSettlements(room.index).map(c=>settlementStage(state.village,room.index,c.slot))));
  else drawExplorationGround(ctx,width,height,background,v.left,v.top,t,FOREST_GROUND,room.composition??false);
  if(room.index<30&&room.composition)drawBiomeWater(ctx,room.composition,v.left,v.top,t,state.time,reducedMotion,waterTexture);
  if(room.index<30)drawCampaignShore(ctx,room,v.left,v.top,t,propsAtlas,gardenAtlas,riverProps);
  trace('terrainMs');
  if(room.biome!=='nascentes')drawExplorationTrails(ctx,room.index,v.left,v.top,t,chapter4Soil,state.encounterSeed,villageSettlements(room.index).map(c=>settlementStage(state.village,room.index,c.slot)));
  trace('trailsMs');
  drawCampaignBridge(ctx,bridgeAtlas,room,v.left,v.top,t);
  ctx.restore();
  const drawProp=(prop:{x:number;y:number;index:number;width:number;height:number;worldTree?:boolean;variant?:number})=>{
    const p=point(prop),b=woodlandPropPlacement(prop.index,p.x,p.y,t,prop);
    if(b.x+b.width<0||b.y+b.height<0||b.x>width||b.y>height)return;
    if(prop.worldTree){const n=woodlandResource(room.index,prop);if(n&&!resourceState(state.workshop,n.id).remaining){drawResource(ctx,state,n,p.x,p.y,t);return;}if(drawBiomeTree(ctx,room.index,{...prop,variant:prop.variant??0},p.x,p.y,t)){if(n)drawResourceLabel(ctx,state,n,p.x,p.y,t);return;}}
    if(river){if(b.x+b.width>=0&&b.y+b.height>=0&&b.x<=width&&b.y<=height)drawRiverProp(ctx,riverProps,prop.index,p.x,p.y,t,prop);return;}
    if(autumn)ctx.save();
    if(propsAtlas&&b.x+b.width>=0&&b.y+b.height>=0&&b.x<=width&&b.y<=height)drawWoodlandProp(ctx,propsAtlas,prop.index,p.x,p.y,t,prop,true);if(autumn)ctx.restore();
  };
  ctx.save();
  if(room.index<30&&gardenAtlas)for(const patch of [...campaignGardens(room),...openWorldPlants({left:-v.left/t,top:-v.top/t,width:width/t,height:height/t},room.index)].filter(p=>!campaignWaterBlocks(p,.15,room))){
    const p=point(patch),b=gardenPlacement(patch,t,p.x,p.y);
    if(b.x+b.width>=0&&b.y+b.height>=0&&b.x<=width&&b.y<=height)river?drawRiverProp(ctx,riverProps,3+patch.index%2,p.x,p.y,t,{width:patch.width??1.2,height:1}):drawGardenPatch(ctx,gardenAtlas,patch,p.x,p.y,t,state.time,reducedMotion);
  }
  ctx.restore();
  if(room.index<30){drawForestSun(ctx,v.left,v.top,t);drawForestFauna(ctx,v.left,v.top,t,state.time,reducedMotion,width,height);}
  const scenery=room.index>=30?[]:[...room.scenery,...explorationGroves({left:-v.left/t,top:-v.top/t,width:width/t,height:height/t},room.index)].filter(p=>!campaignWaterBlocks(p,.4,room));
  if(room.index>0&&room.index<30&&state.completedRooms.includes(room.index-1)){const q=point(returnPortal(room.index));drawPortalEnergy(ctx,q.x,q.y,t,state.time,true,reducedMotion);drawPortalArch(ctx,river?riverPortal:portalAtlas,q.x,q.y,t);ctx.save();ctx.font="600 12px sans-serif";ctx.fillStyle="#fff1ce";ctx.textAlign="center";ctx.fillText(`Sala ${room.index} · voltar`,q.x,q.y+t*.4);ctx.restore();}
  if(!state.gateOpen&&room.gateBlock)scenery.push({x:room.gateBlock.x+.5,y:room.gateBlock.y+.9,index:2,width:1.28,height:1.28});

  if(room.index<30){
  const camp = point(baseLayout(state).home); ctx.strokeStyle = '#b7e4b5'; ctx.lineWidth = 2;
  // Safe area stays functional without a circular marker on the terrain.
  ctx.fillStyle = '#e8f4c2'; ctx.font = `500 ${Math.min(12, Math.max(10, t * .16))}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('Local seguro', camp.x, camp.y - t * .6);
  const marker = point(room.marker);
  if(river)drawRiverProp(ctx,riverProps,5,marker.x,marker.y+t*.15,t*.8);else if(propsAtlas)drawWoodlandProp(ctx,propsAtlas,5,marker.x,marker.y+t*.15,t*.8,undefined,true);
  ctx.fillStyle=state.gateOpen?'#e0d499':'#d5d1ab';ctx.font=`600 ${Math.max(10,t*.15)}px sans-serif`;ctx.textAlign='center';ctx.fillText(state.gateOpen?'✓':room.index>=30?'Platô superior':`${room.fibers} fibras`,marker.x,marker.y-t*.4);
  const exit = point(room.exit);
  drawPortalEnergy(ctx,exit.x,exit.y,t,state.time,state.gateOpen,reducedMotion);

  }
  if(room.key&&!state.hasRoomKey)drawCampaignKey(ctx,keyAtlas,room.key,v.left,v.top,t,state.time,reducedMotion);
  for(const [i,plate] of room.switches.entries()){
    const p=point(plate);if(room.index>=30)drawNascentesItem(ctx,chapter4Stone,3,p.x,p.y,t,.58);else if(propsAtlas)drawWoodlandProp(ctx,propsAtlas,5,p.x,p.y+t*.15,t*.65,undefined,true);
    ctx.fillStyle=i<state.switchStep?'#caf1a0':'#fff2bd';ctx.font=`600 ${Math.max(12,t*.2)}px sans-serif`;ctx.textAlign='center';ctx.fillText(i<state.switchStep?'✓':String(i+1),p.x,p.y-t*.35);
  }
  for (const n of room.nodes) if (!state.collectedNodes.includes(n.id)) {
    const cue=combatPickupCue(state.time,0,reducedMotion);
    if(room.index>=30){const p=point(n);drawNascentesItem(ctx,chapter4Stone,n.item==='fibra'?0:n.item==='ambar'?1:2,p.x,p.y-cue.hover,t,.45);}else drawPickup(ctx,n.item,point(n),t,cue.hover,n.quantity,Math.hypot(state.player.x-n.x,state.player.y-n.y)<2,itemArt?.[n.item]);
  }
  for (const loot of state.loot) {
    const p=point(loot),fall=combatLootLift(state.time,loot.bornAt,loot.landedAt,reducedMotion),cue=combatPickupCue(state.time,loot.landedAt,reducedMotion);
    if((loot.rare==='perola'||loot.rare==='escama')&&itemArt?.[loot.rare]?.naturalWidth){const h=t*.58;drawPaintedItem(ctx,itemArt[loot.rare],loot.rare,p.x,p.y-h/2-fall-cue.hover,h);ctx.fillStyle='#e9dcac';ctx.font=`600 ${Math.max(10,t*.14)}px sans-serif`;ctx.textAlign='center';ctx.fillText(`${RARE_ITEMS[loot.rare]} ×${loot.quantity}`,p.x,p.y+t*.18);}
    else if(loot.rare&&rareAtlas?.complete&&rareAtlas.naturalWidth){
      const sw=rareAtlas.naturalWidth/2,sh=rareAtlas.naturalHeight,h=t*.5,w=h*sw/sh;
      ctx.drawImage(rareAtlas,loot.rare==='seiva'?0:sw,0,sw,sh,p.x-w/2,p.y-h-fall-cue.hover,w,h);
      ctx.fillStyle='#e9dcac';ctx.font=`600 ${Math.max(10,t*.14)}px sans-serif`;ctx.textAlign='center';ctx.fillText(`${RARE_ITEMS[loot.rare]} ×${loot.quantity}`,p.x,p.y+t*.18);
    }else drawPickup(ctx,loot.item,p,t,fall+cue.hover,loot.quantity,Math.hypot(state.player.x-loot.x,state.player.y-loot.y)<2,itemArt?.[loot.item]);
  }
  for(const h of room.hazards??[]){const p=point(h),phase=hazardPhase(h,state.time);ctx.save();const warning=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,t*h.radius);warning.addColorStop(0,phase==='active'?'#d89b5b55':phase==='warning'?'#e8c87844':'#00000000');warning.addColorStop(1,'#00000000');ctx.fillStyle=warning;ctx.fillRect(p.x-t*h.radius,p.y-t*h.radius,t*h.radius*2,t*h.radius*2);ctx.globalAlpha=phase==='active'?1:phase==='warning'?.75:.4;drawPaintedItem(ctx,itemArt?.fibra,h.kind==='steam'?'steam':'spikes',p.x,p.y-t*.18,t*h.radius*2.2);ctx.globalAlpha=1;ctx.fillStyle='#fff0be';ctx.font=`600 ${Math.max(10,t*.15)}px sans-serif`;ctx.textAlign='center';ctx.fillText(h.kind==='steam'?'Vapor':'Espinhos',p.x,p.y+t*.6);ctx.restore();}
  const fx=state.powerFx;
  if(fx&&!royalActive(state,'power')&&fx.until>state.time&&powerArt?.complete&&powerArt.naturalWidth){const progress=Math.max(0,Math.min(1,(state.time-fx.startedAt)/800)),p=point(fx),column={burst:0,roots:1,tide:2,amber:3}[fx.power],cw=powerArt.naturalWidth/4,ch=powerArt.naturalHeight/2,size=t*(fx.power==='roots'?4.4:3.4)*(reducedMotion?1:.8+progress*.35);ctx.save();ctx.globalAlpha=(1-progress)*.8;ctx.drawImage(powerArt,column*cw,ch,cw,ch,p.x-size/2,p.y-size*.62,size,size);ctx.restore();}
  drawRoyalPower(ctx,state,point,t);
  drawBaseProtection(ctx,state,point,t);
  const citizens=villageCitizens(state),focusedCitizen=nearestVillager(state)?.id??null;
  const entities = [...(villageLayout(room.index).markets.map(m=>({type:'village-market' as const,p:m}))),...(villageLayout(room.index).homes.map(h=>({type:'village-home' as const,p:h}))),...(villageLayout(room.index).work.map(w=>({type:'village-resource' as const,p:w}))),...citizens.map(c=>({type:'citizen' as const,id:c.id,p:state.village?.duel?.id===c.id?state.village.duel.npc:c})),...resourceNodes(room.index).map(n=>({type:'resource' as const,p:n})),...(room.index>=30?nascentesTrees({left:-v.left/t,top:-v.top/t,width:width/t,height:height/t},room.index).map(tree=>({type:'nascentes-tree' as const,p:tree})):[]),...scenery.map(prop=>({type:'prop' as const,p:prop})), ...BASE_BUILDINGS.filter(k=>k!=='home'&&baseVisible(state,k)).map(k=>({type:'base' as const,k:k as 'chest'|'workshop'|'potions',p:baseLayout(state)[k]})),{type:'shelter' as const,p:baseLayout(state).home},...(room.index>=30?[]:[{type:'portal' as const,p:room.exit}]), ...state.enemies.filter(e => e.hp > 0).map(e => ({ type: 'enemy' as const, p: e })), { type: 'pet' as const, p: state.player }].sort((a, b) => a.p.y - b.p.y);
  for (const entity of entities) {
    const p = point(entity.p);
    if((entity.type.startsWith('village-')||entity.type==='citizen'||entity.type==='resource')&&(p.x<-t*5||p.x>width+t*5||p.y<-t*2||p.y>height+t*5))continue;
    if(entity.type==='village-market'){drawVillageMarket(ctx,entity.p,p.x,p.y,t);continue;}
    if(entity.type==='village-home'){drawVillageHouse(ctx,entity.p,p.x,p.y,t,state);continue;}
    if(entity.type==='village-resource'){drawVillageResource(ctx,entity.p.kind,p.x,p.y,t);continue;}
    if(entity.type==='citizen'){drawVillageCitizen(ctx,state,entity.id,p.x,p.y,t,reducedMotion,focusedCitizen);continue;}
    if(entity.type==='base'){drawBaseBuilding(ctx,state,entity.k,p.x,p.y,t,!baseEditing);continue;}
    if(entity.type==='resource'){drawResource(ctx,state,entity.p,p.x,p.y,t);continue;}
    if(entity.type==='nascentes-tree'){const n=woodlandResource(room.index,entity.p);if(n&&!resourceState(state.workshop,n.id).remaining)drawResource(ctx,state,n,p.x,p.y,t);else{drawNascentesTree(ctx,bridgeAtlas,entity.p,p.x,p.y,t);if(n)drawResourceLabel(ctx,state,n,p.x,p.y,t);}continue;}
    if(entity.type==='prop'){drawProp(entity.p);continue;}
    if(entity.type==='portal'){ctx.save();drawPortalArch(ctx,river?riverPortal:portalAtlas,p.x,p.y,t);ctx.restore();continue;}
    if(entity.type==='shelter'){
      ctx.save();if(state.player.y<entity.p.y&&state.player.y>entity.p.y-3.6&&Math.abs(state.player.x-entity.p.x)<1.8)ctx.globalAlpha=.3;
      if(shelterAtlas?.complete&&shelterAtlas.naturalWidth){
        if(room.index>=30){const h=t*3.6,w=h*1034/1103;ctx.drawImage(shelterAtlas,119,66,1034,1103,p.x-w/2,p.y-h,w,h);ctx.restore();continue;}
        drawBiomeShelter(ctx,room.index,p.x,p.y,t,shelterAtlas);
      }ctx.restore();continue;
    }
    const shadow=entity.type==='enemy'?.21:.28;
    ctx.fillStyle = 'rgba(10,24,15,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + t * .07, t * shadow, t * shadow*.36, 0, 0, Math.PI * 2); ctx.fill();
    if (entity.type === 'enemy') {
      const enemy = entity.p as CombatState['enemies'][number], def = definitions.find(e => e.id === enemy.id)!;
      const range = Math.hypot(state.player.x-enemy.x,state.player.y-enemy.y);
      const safe = insideSafeBase(state);
      const moving = (!safe && range<4 && range>PILOT_INSECT.stopDistance) || ((safe || range>4) && Math.hypot(enemy.x-def.x,enemy.y-def.y)>.1);
      const mobImage=def.art==='autumn-mobs'?autumnMobs:def.art==='river-mobs'?riverMobs:mobsAtlas;
      if(def.art&&mobImage?.complete&&mobImage.naturalWidth){
        const frame=def.art==='autumn-mobs'?((enemy.windupUntil??0)>state.time||enemy.attackAt-state.time>1250&&enemy.attackAt-state.time<=1500?3:moving&&!reducedMotion?1+Math.floor(state.time/170)%2:0):moving&&!reducedMotion?Math.floor(state.time/170)%4:0,rect=explorationMobFrame(def.art,def.spriteRow??0,frame,mobImage.naturalWidth,mobImage.naturalHeight),cw=rect.width,ch=rect.height;
        const dw=t*(def.width??.78),dh=dw*ch/cw;
        ctx.save();if(def.tint&&(!autumn||def.variantName))ctx.filter=def.tint;ctx.translate(p.x,p.y);if(state.player.x<enemy.x)ctx.scale(-1,1);
        ctx.drawImage(mobImage,rect.x,rect.y,cw,ch,-dw/2,t*.12-dh,dw,dh);ctx.restore();
      }else if(!def.art&&enemiesAtlas?.complete && enemiesAtlas.naturalWidth){
        const row=def.name==='Besouro'?0:1, frame=moving&&!reducedMotion?Math.floor(state.time/150)%4:0;
        const cw=enemiesAtlas.naturalWidth/4,ch=enemiesAtlas.naturalHeight/2;
        ctx.save();if(def.tint&&(!autumn||def.variantName))ctx.filter=def.tint;ctx.translate(p.x,p.y);if(state.player.x<enemy.x)ctx.scale(-1,1);
        const attacking=enemy.attackAt-state.time>1250 && enemy.attackAt-state.time<=1500;
        if(attacking&&!reducedMotion)ctx.rotate(-.08*Math.sin((1500-enemy.attackAt+state.time)/250*Math.PI));
        const sy=(row ? .125 : .2734375)*ch+row*ch, sh=ch*(row ? .5859375 : .6640625), dw=t*PILOT_INSECT.width, dh=dw*sh/cw;
        ctx.drawImage(enemiesAtlas,frame*cw,sy,cw,sh,-dw/2,t*.07-dh,dw,dh);ctx.restore();
      }
      if(def.boss&&enemy.windupUntil&&enemy.windupUntil>state.time){ctx.save();ctx.strokeStyle='#f3b86c';ctx.lineWidth=t*.04;ctx.setLineDash([t*.12,t*.08]);ctx.beginPath();ctx.ellipse(p.x,p.y,t*2.1,t*2.1,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      const labelY=def.boss?1.75:.83;
      ctx.fillStyle = '#273d37'; ctx.fillRect(p.x - t * .31, p.y - t * (labelY-.11), t * .62, t * .065);
      ctx.fillStyle = '#ef817d'; ctx.fillRect(p.x - t * .31, p.y - t * (labelY-.11), t * .62 * enemy.hp / def.hp, t * .065);
      ctx.fillStyle = def.level > combatLevel(state.xp) ? '#ffe4a2' : '#fff9df'; ctx.font = `500 ${Math.min(12, Math.max(10, t * .16))}px sans-serif`; ctx.textAlign = 'center';
      if(!overview&&!baseEditing||def.boss)ctx.fillText(`${def.name}${def.variantName?" · "+def.variantName:""} · Nv ${def.level}${def.boss?' · MESTRE':def.rarity==='rare'?' · Raro':''}`, p.x, p.y - t * labelY);
    } else {
      if((state.levelUpUntil??0)>state.time){
        const remaining=(state.levelUpUntil!-state.time)/2600,fade=Math.min(1,remaining*4),pulse=reducedMotion?1:1+Math.sin(state.time/140)*.06;
        ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=fade*.65;
        const glow=ctx.createRadialGradient(p.x,p.y-t*.38,t*.18,p.x,p.y-t*.38,t*1.05*pulse);
        glow.addColorStop(0,'rgba(255,235,150,0)');glow.addColorStop(.45,'rgba(255,224,115,.16)');glow.addColorStop(.72,'rgba(255,210,85,.65)');glow.addColorStop(1,'rgba(255,208,90,0)');
        ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(p.x,p.y-t*.38,t*1.05*pulse,t*1.12*pulse,0,0,Math.PI*2);ctx.fill();
        if(!reducedMotion)for(let i=0;i<8;i++){const a=i*Math.PI/4+state.time/900,r=t*(.72+(1-remaining)*.25),sx=p.x+Math.cos(a)*r,sy=p.y-t*.38+Math.sin(a)*r;
          const spark=ctx.createRadialGradient(sx,sy,0,sx,sy,t*.1);spark.addColorStop(0,'rgba(255,250,208,.95)');spark.addColorStop(1,'rgba(255,219,95,0)');ctx.fillStyle=spark;ctx.fillRect(sx-t*.1,sy-t*.1,t*.2,t*.2);}
        ctx.restore();
      }
      const direction = homeWalkDirection(state.facing.x, -state.facing.y);
      const attack=combatAttackPose(state.time,state.strikeUntil,reducedMotion);
      const px=p.x+state.facing.x*attack.lean*t, py=p.y+state.facing.y*attack.lean*t;
      if(!state.legends?.active&&harvestingActive(state)&&state.facing.y<-.3)drawHarvestTool(ctx,state,px,py,t);
      const legendDrawn=drawExplorationLegend(ctx,state,px,py,t,reducedMotion);
      if(legendDrawn){
        // The active Legendary owns its body and weapon rendering.
      } else if (atlas.complete && atlas.naturalWidth && (state.walking || attack.active)) {
        ctx.save(); ctx.translate(px, py); if (direction.mirror) ctx.scale(-1, 1);
        drawWalkFrame(ctx, atlas, direction.row, attack.active ? attack.phase*.74 : state.walkPhase, -t * .46, -t * .82, t * .92, t * .92); ctx.restore();
      } else if (pet.complete && pet.naturalWidth) ctx.drawImage(pet, px - t * .38, py - t * .72, t * .76, t * .8);
      if(!legendDrawn){if(state.facing.y>=-.3)drawHarvestTool(ctx,state,px,py,t);if(!state.village?.duel&&!harvestingActive(state)&&royalActive(state,'sword'))drawRoyalHeld(ctx,state,'sword',px+t*.25,py-t*.35,t);}
      if (attack.active && !harvestingActive(state) && !(state.powerFx&&state.time-state.powerFx.startedAt<320) && !(state.legends?.active&&state.legends.weapon==='bow')) {
        // A short swipe in front of the body, never a synthetic limb over the face.
        ctx.save();ctx.translate(px+state.facing.x*t*.35,py+state.facing.y*t*.28-t*.03);ctx.rotate(Math.atan2(state.facing.y,state.facing.x));
        ctx.globalAlpha=.55*Math.max(0,attack.reach);ctx.strokeStyle='#ecdfb2';ctx.lineWidth=Math.max(1,t*.018);ctx.lineCap='round';
        for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(0,0,t*(.27+i*.035),-.48,.48);ctx.stroke();}ctx.restore();
      }

    }
  }
  if(!room.index)drawForestPerches(ctx,v.left,v.top,t,state.time,reducedMotion,width,height,enemiesAtlas);
  state.feedback.forEach((f, i) => {
    const p = point(f), life = Math.max(0, Math.min(1, (f.until - state.time) / 1100));
    ctx.save(); ctx.globalAlpha = Math.min(1, life * 4); ctx.font = `600 ${Math.min(13, Math.max(11, t * .17))}px sans-serif`; ctx.textAlign = 'center';
    const y = p.y - t * .9 - (reducedMotion ? 0 : (1 - life) * t * .55) - (i % 3) * 13;
    ctx.lineWidth = 2; ctx.strokeStyle = '#243a30'; ctx.strokeText(f.text.replace(/ HP$/, ''), p.x, y);
    ctx.fillStyle = f.kind === 'damage' ? '#e9a19a' : f.kind === 'heal' ? '#b9d8b0' : f.kind === 'xp' ? '#ddd2ac' : '#fffbe7'; ctx.fillText(f.text.replace(/ HP$/, ''), p.x, y); ctx.restore();
  });
  if(overview){ctx.save();ctx.font='600 11px sans-serif';ctx.textAlign='center';ctx.strokeStyle='#20372c';ctx.lineWidth=3;ctx.fillStyle='#fff0c9';for(const c of villageSettlements(room.index)){const q=point(c),stage=settlementStage(state.village,room.index,c.slot),name=`${stage===2?'Cidade':stage===1?'Vila':'Povoado'} ${c.slot+1}`;ctx.strokeText(name,q.x,q.y+t*3);ctx.fillText(name,q.x,q.y+t*3);}ctx.restore();}
  trace('entitiesMs');
  if(!overview&&!baseEditing)drawExplorationDaylight(ctx,width,height,state,v);
  if(overview)drawOverviewLocation(ctx,width,height,point(state.player));
}

/** Common pickup language for enemy drops and room collection nodes. */
function drawPickup(ctx:CanvasRenderingContext2D,item:keyof typeof COMBAT_ITEMS,p:CombatPoint,tile:number,lift:number,quantity:number,near:boolean,image?:HTMLImageElement){
  ctx.save();
  // A restrained contact shadow stays on the ground while the item falls or hovers.
  const shadow=ctx.createRadialGradient(p.x,p.y+tile*.06,0,p.x,p.y+tile*.06,tile*.28);
  shadow.addColorStop(0,'rgba(18,35,20,.18)');shadow.addColorStop(1,'rgba(18,35,20,0)');
  ctx.save();ctx.translate(p.x,p.y+tile*.06);ctx.scale(1,.36);
  ctx.fillStyle='rgba(18,35,20,.08)';ctx.beginPath();ctx.arc(0,0,tile*.24,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(p.x,p.y+tile*.06,tile*.3,tile*.12,0,0,Math.PI*2);ctx.fill();
  const y=p.y-lift*tile-tile*.12;
  drawPaintedItem(ctx,image,item as PaintedItem,p.x,y-tile*.07,tile*.72);
  if(near){
    ctx.font='500 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const label=`${COMBAT_ITEMS[item]} ×${quantity}`,w=ctx.measureText(label).width+10,ly=y+tile*.34;
    ctx.fillStyle='#18382bd9';ctx.beginPath();ctx.roundRect(p.x-w/2,ly-8,w,16,5);ctx.fill();
    ctx.fillStyle='#fff3cf';ctx.fillText(label,p.x,ly);
  }
  ctx.restore();
}
