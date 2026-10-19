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
export function combatView(width: number, height: number, player: CombatPoint, zoom = 1, overview = false) {
  const desiredTile = overview ? Math.min(width / PILOT_SIZE.width, Math.max(1, height - 100) / PILOT_SIZE.height) : Math.max(52, width / 11, height / 9) * zoom;
  const tile=Math.max(desiredTile,width/GROUND_WORLD.width,height/GROUND_WORLD.height);
  const bw = tile * PILOT_SIZE.width, bh = tile * PILOT_SIZE.height;
  const left = overview ? (width - bw) / 2 - PILOT_SIZE.left*tile : width / 2 - player.x * tile;
  const top = overview ? (height - bh) / 2 - PILOT_SIZE.top*tile : height * .46 - player.y * tile;
  return {tile,
    left:Math.max(width-(GROUND_WORLD.left+GROUND_WORLD.width)*tile,Math.min(-GROUND_WORLD.left*tile,left)),
    top:Math.max(height-(GROUND_WORLD.top+GROUND_WORLD.height)*tile,Math.min(-GROUND_WORLD.top*tile,top))};
}
export function drawCombatPilot(ctx: CanvasRenderingContext2D, width: number, height: number, state: CombatState,
  pet: HTMLImageElement, atlas: HTMLImageElement, background: HTMLImageElement, zoom: number, overview: boolean, reducedMotion: boolean, enemiesAtlas?: HTMLImageElement, propsAtlas?: HTMLImageElement, itemArt?:Partial<Record<keyof typeof COMBAT_ITEMS,HTMLImageElement>>&Partial<Record<'perola'|'escama',HTMLImageElement>>,gardenAtlas?:HTMLImageElement,shelterAtlas?:HTMLImageElement,portalAtlas?:HTMLImageElement,bridgeAtlas?:HTMLImageElement,keyAtlas?:HTMLImageElement,mobsAtlas?:HTMLImageElement,rareAtlas?:HTMLImageElement,riverMobs?:HTMLImageElement,riverProps?:HTMLImageElement,riverPortal?:HTMLImageElement,waterTexture?:HTMLImageElement) {
  const room=campaignRoom(state.roomIndex),river=room.biome==='river',autumn=room.biome==='autumn',definitions=campaignEnemies(state.roomIndex,state.encounterSeed);
  if(autumn){background=explorationColorVariant(background,AUTUMN_GROUND_FILTER)!;propsAtlas=explorationColorVariant(propsAtlas,AUTUMN_PROP_FILTER);gardenAtlas=explorationColorVariant(gardenAtlas,AUTUMN_PROP_FILTER);mobsAtlas=explorationColorVariant(mobsAtlas,'sepia(.65) saturate(1.4) hue-rotate(338deg)');portalAtlas=explorationColorVariant(portalAtlas,'sepia(.6) saturate(1.3)');}
  const v = combatView(width, height, state.player, zoom, overview), t = v.tile;
  const point = (p: CombatPoint) => ({ x: v.left + p.x * t, y: v.top + p.y * t });
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  drawExplorationGround(ctx,width,height,background,v.left,v.top,t,FOREST_GROUND,room.composition??false);
  if(room.composition)drawBiomeWater(ctx,room.composition,v.left,v.top,t,state.time,reducedMotion,waterTexture);
  drawCampaignShore(ctx,room,v.left,v.top,t,propsAtlas,gardenAtlas,riverProps);
  drawCampaignBridge(ctx,bridgeAtlas,room,v.left,v.top,t);
  ctx.restore();
  const drawProp=(prop:{x:number;y:number;index:number;width:number;height:number})=>{
    const p=point(prop),b=woodlandPropPlacement(prop.index,p.x,p.y,t,prop);
    if(river){if(b.x+b.width>=0&&b.y+b.height>=0&&b.x<=width&&b.y<=height)drawRiverProp(ctx,riverProps,prop.index,p.x,p.y,t,prop);return;}
    if(autumn)ctx.save();
    if(propsAtlas&&b.x+b.width>=0&&b.y+b.height>=0&&b.x<=width&&b.y<=height)drawWoodlandProp(ctx,propsAtlas,prop.index,p.x,p.y,t,prop,true);if(autumn)ctx.restore();
  };
  ctx.save();
  if(gardenAtlas)for(const patch of [...campaignGardens(room),...ROOM_EDGE_GARDENS,...OUTER_GARDENS].filter(p=>!campaignWaterBlocks(p,.15,room))){
    const p=point(patch),b=gardenPlacement(patch,t,p.x,p.y);
    if(b.x+b.width>=0&&b.y+b.height>=0&&b.x<=width&&b.y<=height)river?drawRiverProp(ctx,riverProps,3+patch.index%2,p.x,p.y,t,{width:patch.width??1.2,height:1}):drawGardenPatch(ctx,gardenAtlas,patch,p.x,p.y,t,state.time,reducedMotion);
  }
  ctx.restore();
  drawForestSun(ctx,v.left,v.top,t);
  drawForestFauna(ctx,v.left,v.top,t,state.time,reducedMotion,width,height);
  const scenery=[...ROOM_EDGE_SOLIDS,...room.scenery];
  if(!state.gateOpen&&room.gateBlock)scenery.push({x:room.gateBlock.x+.5,y:room.gateBlock.y+.9,index:2,width:1.28,height:1.28});
  const camp = point(room.camp); ctx.strokeStyle = '#b7e4b5'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(camp.x, camp.y, t * .54, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#e8f4c2'; ctx.font = `500 ${Math.min(12, Math.max(10, t * .16))}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('Local seguro', camp.x, camp.y - t * .6);
  const marker = point(room.marker);
  if(river)drawRiverProp(ctx,riverProps,5,marker.x,marker.y+t*.15,t*.8);else if(propsAtlas)drawWoodlandProp(ctx,propsAtlas,5,marker.x,marker.y+t*.15,t*.8,undefined,true);
  ctx.fillStyle=state.gateOpen?'#e0d499':'#d5d1ab';ctx.font=`600 ${Math.max(10,t*.15)}px sans-serif`;ctx.textAlign='center';ctx.fillText(state.gateOpen?'✓':`${room.fibers} fibras`,marker.x,marker.y-t*.4);
  const exit = point(room.exit);
  drawPortalEnergy(ctx,exit.x,exit.y,t,state.time,state.gateOpen,reducedMotion);

  if(room.key&&!state.hasRoomKey)drawCampaignKey(ctx,keyAtlas,room.key,v.left,v.top,t,state.time,reducedMotion);
  for(const [i,plate] of room.switches.entries()){
    const p=point(plate);if(propsAtlas)drawWoodlandProp(ctx,propsAtlas,5,p.x,p.y+t*.15,t*.65,undefined,true);
    ctx.fillStyle=i<state.switchStep?'#caf1a0':'#fff2bd';ctx.font=`600 ${Math.max(12,t*.2)}px sans-serif`;ctx.textAlign='center';ctx.fillText(i<state.switchStep?'✓':String(i+1),p.x,p.y-t*.35);
  }
  for (const n of room.nodes) if (!state.collectedNodes.includes(n.id)) {
    const cue=combatPickupCue(state.time,0,reducedMotion);
    drawPickup(ctx,n.item,point(n),t,cue.hover,n.quantity,Math.hypot(state.player.x-n.x,state.player.y-n.y)<2,itemArt?.[n.item]);
  }
  for (const loot of state.loot) {
    const p=point(loot),fall=combatLootLift(state.time,loot.bornAt,loot.landedAt,reducedMotion),cue=combatPickupCue(state.time,loot.landedAt,reducedMotion);
    if((loot.rare==='perola'||loot.rare==='escama')&&itemArt?.[loot.rare]?.naturalWidth){const h=t*.58;ctx.drawImage(itemArt[loot.rare]!,p.x-h/2,p.y-h-fall-cue.hover,h,h);ctx.fillStyle='#e9dcac';ctx.font=`600 ${Math.max(10,t*.14)}px sans-serif`;ctx.textAlign='center';ctx.fillText(`${RARE_ITEMS[loot.rare]} ×${loot.quantity}`,p.x,p.y+t*.18);}
    else if(loot.rare&&rareAtlas?.complete&&rareAtlas.naturalWidth){
      const sw=rareAtlas.naturalWidth/2,sh=rareAtlas.naturalHeight,h=t*.5,w=h*sw/sh;
      ctx.drawImage(rareAtlas,loot.rare==='seiva'?0:sw,0,sw,sh,p.x-w/2,p.y-h-fall-cue.hover,w,h);
      ctx.fillStyle='#e9dcac';ctx.font=`600 ${Math.max(10,t*.14)}px sans-serif`;ctx.textAlign='center';ctx.fillText(`${RARE_ITEMS[loot.rare]} ×${loot.quantity}`,p.x,p.y+t*.18);
    }else drawPickup(ctx,loot.item,p,t,fall+cue.hover,loot.quantity,Math.hypot(state.player.x-loot.x,state.player.y-loot.y)<2,itemArt?.[loot.item]);
  }
  for(const h of room.hazards??[]){const p=point(h),phase=hazardPhase(h,state.time);ctx.save();ctx.fillStyle=phase==='active'?'#cb754788':phase==='warning'?'#e3bb4f55':'#76593644';ctx.strokeStyle=phase==='active'?'#ffdc96':'#d6b577';ctx.lineWidth=Math.max(1,t*.025);ctx.setLineDash(phase==='warning'?[t*.12,t*.09]:[]);ctx.beginPath();ctx.arc(p.x,p.y,t*h.radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);if(phase==='active'){if(h.kind==='steam'){for(let i=0;i<3;i++){ctx.strokeStyle='#f4ead9aa';ctx.beginPath();ctx.moveTo(p.x+(i-1)*t*.2,p.y);ctx.quadraticCurveTo(p.x+(i-1)*t*.2-t*.14,p.y-t*.35,p.x+(i-1)*t*.2,p.y-t*.65);ctx.stroke();}}else{ctx.fillStyle='#987848';for(let i=0;i<5;i++){const x=p.x+(i-2)*t*.2;ctx.beginPath();ctx.moveTo(x-t*.1,p.y);ctx.lineTo(x,p.y-t*.3);ctx.lineTo(x+t*.1,p.y);ctx.fill();}}}ctx.fillStyle='#fff0be';ctx.font=`600 ${Math.max(10,t*.15)}px sans-serif`;ctx.textAlign='center';ctx.fillText(h.kind==='steam'?'Vapor':'Espinhos',p.x,p.y+t*.6);ctx.restore();}
  const entities = [...scenery.map(prop=>({type:'prop' as const,p:prop})), {type:'shelter' as const,p:PILOT_SHELTER}, {type:'portal' as const,p:room.exit}, ...state.enemies.filter(e => e.hp > 0).map(e => ({ type: 'enemy' as const, p: e })), { type: 'pet' as const, p: state.player }].sort((a, b) => a.p.y - b.p.y);
  for (const entity of entities) {
    const p = point(entity.p);
    if(entity.type==='prop'){drawProp(entity.p);continue;}
    if(entity.type==='portal'){ctx.save();drawPortalArch(ctx,river?riverPortal:portalAtlas,p.x,p.y,t);ctx.restore();continue;}
    if(entity.type==='shelter'){
      if(shelterAtlas?.complete&&shelterAtlas.naturalWidth){
        const scale=Math.min(t*PILOT_SHELTER.width/shelterAtlas.naturalWidth,t*PILOT_SHELTER.height/shelterAtlas.naturalHeight),w=shelterAtlas.naturalWidth*scale,h=shelterAtlas.naturalHeight*scale;
        ctx.drawImage(shelterAtlas,p.x-w/2,p.y-h,w,h);
      }continue;
    }
    const shadow=entity.type==='enemy'?.21:.28;
    ctx.fillStyle = 'rgba(10,24,15,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + t * .07, t * shadow, t * shadow*.36, 0, 0, Math.PI * 2); ctx.fill();
    if (entity.type === 'enemy') {
      const enemy = entity.p as CombatState['enemies'][number], def = definitions.find(e => e.id === enemy.id)!;
      const range = Math.hypot(state.player.x-enemy.x,state.player.y-enemy.y);
      const safe = Math.hypot(state.player.x-room.camp.x,state.player.y-room.camp.y)<1.6;
      const moving = (!safe && range<4 && range>PILOT_INSECT.stopDistance) || ((safe || range>4) && Math.hypot(enemy.x-def.x,enemy.y-def.y)>.1);
      const mobImage=def.art==='river-mobs'?riverMobs:mobsAtlas;
      if(def.art&&mobImage?.complete&&mobImage.naturalWidth){
        const frame=moving&&!reducedMotion?Math.floor(state.time/170)%4:0,rect=explorationMobFrame(def.art,def.spriteRow??0,frame,mobImage.naturalWidth,mobImage.naturalHeight),cw=rect.width,ch=rect.height;
        const dw=t*(def.width??.78),dh=dw*ch/cw;
        ctx.save();if(def.tint&&!autumn)ctx.filter=def.tint;ctx.translate(p.x,p.y);if(state.player.x<enemy.x)ctx.scale(-1,1);
        ctx.drawImage(mobImage,rect.x,rect.y,cw,ch,-dw/2,t*.12-dh,dw,dh);ctx.restore();
      }else if(!def.art&&enemiesAtlas?.complete && enemiesAtlas.naturalWidth){
        const row=def.name==='Besouro'?0:1, frame=moving&&!reducedMotion?Math.floor(state.time/150)%4:0;
        const cw=enemiesAtlas.naturalWidth/4,ch=enemiesAtlas.naturalHeight/2;
        ctx.save();if(def.tint&&!autumn)ctx.filter=def.tint;ctx.translate(p.x,p.y);if(state.player.x<enemy.x)ctx.scale(-1,1);
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
      if(!overview||def.boss)ctx.fillText(`${def.name} · Nv ${def.level}${def.boss?' · MESTRE':def.rarity==='rare'?' · Raro':''}`, p.x, p.y - t * labelY);
    } else {
      const direction = homeWalkDirection(state.facing.x, -state.facing.y);
      const attack=combatAttackPose(state.time,state.strikeUntil,reducedMotion);
      const px=p.x+state.facing.x*attack.lean*t, py=p.y+state.facing.y*attack.lean*t;
      if (atlas.complete && atlas.naturalWidth && (state.walking || attack.active)) {
        ctx.save(); ctx.translate(px, py); if (direction.mirror) ctx.scale(-1, 1);
        drawWalkFrame(ctx, atlas, direction.row, attack.active ? attack.phase*.74 : state.walkPhase, -t * .46, -t * .82, t * .92, t * .92); ctx.restore();
      } else if (pet.complete && pet.naturalWidth) ctx.drawImage(pet, px - t * .38, py - t * .72, t * .76, t * .8);
      if (attack.active) {
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
  if(image?.complete&&image.naturalWidth)ctx.drawImage(image,p.x-tile*.29,y-tile*.36,tile*.58,tile*.58);
  else drawGroundItem(ctx,item,{x:p.x,y:y+tile*.07},tile*.65,0);
  if(near){
    ctx.font='500 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const label=`${COMBAT_ITEMS[item]} ×${quantity}`,w=ctx.measureText(label).width+10,ly=y+tile*.34;
    ctx.fillStyle='#18382bd9';ctx.beginPath();ctx.roundRect(p.x-w/2,ly-8,w,16,5);ctx.fill();
    ctx.fillStyle='#fff3cf';ctx.fillText(label,p.x,ly);
  }
  ctx.restore();
}

/** Original item silhouettes match the visual inventory, rather than generic squares. */
function drawGroundItem(ctx:CanvasRenderingContext2D,item:string,p:CombatPoint,size:number,turn:number){
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(turn*.35);ctx.lineJoin='round';
  if(item==='fibra'){
    ctx.strokeStyle='#c3c47b';ctx.lineWidth=size*.1;ctx.lineCap='round';for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*size*.12,size*.2);ctx.quadraticCurveTo(i*size*.24,-size*.2,i*size*.28,-size*.55);ctx.stroke();ctx.strokeStyle='#8ea663';ctx.beginPath();ctx.moveTo(i*size*.2,-size*.18);ctx.lineTo(i*size*.2+size*.16,-size*.34);ctx.stroke();ctx.strokeStyle='#c3c47b';}ctx.fillStyle='#a47843';ctx.fillRect(-size*.24,size*.03,size*.48,size*.1);
  }else if(item==='ambar'){
    const g=ctx.createLinearGradient(-size*.3,-size*.4,size*.3,size*.3);g.addColorStop(0,'#f4d68d');g.addColorStop(1,'#a87e41');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-size*.55);ctx.lineTo(size*.36,-size*.25);ctx.lineTo(size*.3,size*.25);ctx.lineTo(0,size*.42);ctx.lineTo(-size*.3,size*.2);ctx.lineTo(-size*.34,-size*.2);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff0b4';ctx.lineWidth=size*.04;ctx.beginPath();ctx.moveTo(0,-size*.42);ctx.lineTo(-size*.14,0);ctx.stroke();
  }else{
    ctx.fillStyle=item==='fruta'?'#c29165':'#9fbd75';ctx.beginPath();ctx.ellipse(0,-size*.1,size*.25,size*.38,.6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#65834a';ctx.lineWidth=size*.06;ctx.beginPath();ctx.moveTo(0,size*.2);ctx.lineTo(size*.12,-size*.38);ctx.stroke();
  }ctx.restore();
}
