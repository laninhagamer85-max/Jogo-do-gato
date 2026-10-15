import { ROOM_EDGES, ROOM_SCENERY } from "./explorationRoom";
import { drawExplorationGround, drawWoodlandProp } from "./explorationScenery";
import { combatAttackPose, combatLootLift, combatPickupCue } from "./combatPresentation";
import { combatLevel, COMBAT_ITEMS, PILOT_CAMP, PILOT_ENEMIES, PILOT_EXIT, PILOT_MARKER, PILOT_NODES, PILOT_SIZE, PILOT_WALLS, type CombatPoint, type CombatState } from './explorationCombat';
import { drawWalkFrame } from './petWalkAtlas';
import { homeWalkDirection } from './petFrameCleanup';

/** Match phone pixel density while bounding the backing buffer to six million pixels. */
export function combatCanvasScale(width:number,height:number,pixelRatio:number){
  return Math.max(.5,Math.min(3,Math.max(1,pixelRatio||1),Math.sqrt(6_000_000/(Math.max(1,width)*Math.max(1,height)))));
}
export function combatView(width: number, height: number, player: CombatPoint, zoom = 1, overview = false) {
  const tile = overview ? Math.min(width / PILOT_SIZE.width, Math.max(1, height - 100) / PILOT_SIZE.height) : Math.max(52, width / 11, height / 9) * zoom;
  const bw = tile * PILOT_SIZE.width, bh = tile * PILOT_SIZE.height;
  const left = overview ? (width - bw) / 2 : width / 2 - player.x * tile;
  const top = overview ? (height - bh) / 2 : height * .46 - player.y * tile;
  return { tile, left, top };
}
export function drawCombatPilot(ctx: CanvasRenderingContext2D, width: number, height: number, state: CombatState,
  pet: HTMLImageElement, atlas: HTMLImageElement, background: HTMLImageElement, zoom: number, overview: boolean, reducedMotion: boolean, enemiesAtlas?: HTMLImageElement, propsAtlas?: HTMLImageElement) {
  const v = combatView(width, height, state.player, zoom, overview), t = v.tile;
  const point = (p: CombatPoint) => ({ x: v.left + p.x * t, y: v.top + p.y * t });
  ctx.clearRect(0, 0, width, height);
  drawExplorationGround(ctx,width,height,background,v.left,v.top,t);
  const scenery=[...ROOM_EDGES,...ROOM_SCENERY];
  if(!state.gateOpen)scenery.push({x:9.5,y:4.9,index:2,width:1.28,height:1.28});
  const camp = point(PILOT_CAMP); ctx.strokeStyle = '#b7e4b5'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(camp.x, camp.y, t * .54, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#e8f4c2'; ctx.font = `500 ${Math.min(12, Math.max(10, t * .16))}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('Seguro', camp.x, camp.y - t * .6);
  const marker = point(PILOT_MARKER);
  if(propsAtlas)drawWoodlandProp(ctx,propsAtlas,5,marker.x,marker.y+t*.15,t*.8);
  ctx.fillStyle=state.gateOpen?'#e0d499':'#d5d1ab';ctx.font=`600 ${Math.max(10,t*.15)}px sans-serif`;ctx.textAlign='center';ctx.fillText(state.gateOpen?'✓':'6 fibras',marker.x,marker.y-t*.4);
  const exit = point(PILOT_EXIT); ctx.strokeStyle = state.gateOpen ? '#ffe4a2' : '#80907c'; ctx.lineWidth = Math.max(3, t * .06); ctx.beginPath(); ctx.arc(exit.x, exit.y, t * .4, 0, Math.PI * 2); ctx.stroke();
  for (const n of PILOT_NODES) if (!state.collectedNodes.includes(n.id)) {
    const cue=combatPickupCue(state.time,0,reducedMotion);
    drawPickup(ctx,n.item,point(n),t,cue.hover,n.quantity,Math.hypot(state.player.x-n.x,state.player.y-n.y)<2);
  }
  for (const loot of state.loot) {
    const p=point(loot),fall=combatLootLift(state.time,loot.bornAt,loot.landedAt,reducedMotion),cue=combatPickupCue(state.time,loot.landedAt,reducedMotion);
    drawPickup(ctx,loot.item,p,t,fall+cue.hover,loot.quantity,Math.hypot(state.player.x-loot.x,state.player.y-loot.y)<2);
  }
  const entities = [...scenery.map(prop=>({type:'prop' as const,p:prop})), ...state.enemies.filter(e => e.hp > 0).map(e => ({ type: 'enemy' as const, p: e })), { type: 'pet' as const, p: state.player }].sort((a, b) => a.p.y - b.p.y);
  for (const entity of entities) {
    const p = point(entity.p);
    if(entity.type==='prop'){if(propsAtlas)drawWoodlandProp(ctx,propsAtlas,entity.p.index,p.x,p.y,t,entity.p);continue;}
    ctx.fillStyle = 'rgba(10,24,15,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + t * .07, t * .28, t * .10, 0, 0, Math.PI * 2); ctx.fill();
    if (entity.type === 'enemy') {
      const enemy = entity.p as CombatState['enemies'][number], def = PILOT_ENEMIES.find(e => e.id === enemy.id)!;
      const range = Math.hypot(state.player.x-enemy.x,state.player.y-enemy.y);
      const safe = Math.hypot(state.player.x-PILOT_CAMP.x,state.player.y-PILOT_CAMP.y)<1.6;
      const moving = (!safe && range<4 && range>.65) || ((safe || range>4) && Math.hypot(enemy.x-def.x,enemy.y-def.y)>.1);
      if(enemiesAtlas?.complete && enemiesAtlas.naturalWidth){
        const row=enemy.id==='beetle'?0:1, frame=moving&&!reducedMotion?Math.floor(state.time/150)%4:0;
        const cw=enemiesAtlas.naturalWidth/4,ch=enemiesAtlas.naturalHeight/2;
        ctx.save();ctx.translate(p.x,p.y);if(state.player.x<enemy.x)ctx.scale(-1,1);
        const attacking=enemy.attackAt-state.time>1250 && enemy.attackAt-state.time<=1500;
        if(attacking&&!reducedMotion)ctx.rotate(-.08*Math.sin((1500-enemy.attackAt+state.time)/250*Math.PI));
        const sy=(row ? .125 : .2734375)*ch+row*ch, sh=ch*(row ? .5859375 : .6640625), dh=t*1.02*sh/cw;
        ctx.drawImage(enemiesAtlas,frame*cw,sy,cw,sh,-t*.51,t*.07-dh,t*1.02,dh);ctx.restore();
      }
      ctx.fillStyle = '#273d37'; ctx.fillRect(p.x - t * .37, p.y - t * .88, t * .74, t * .075);
      ctx.fillStyle = '#ef817d'; ctx.fillRect(p.x - t * .37, p.y - t * .88, t * .74 * enemy.hp / def.hp, t * .075);
      ctx.fillStyle = def.level > combatLevel(state.xp) ? '#ffe4a2' : '#fff9df'; ctx.font = `500 ${Math.min(12, Math.max(10, t * .16))}px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(`${def.name} · Nv ${def.level}`, p.x, p.y - t * .99);
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
  state.feedback.forEach((f, i) => {
    const p = point(f), life = Math.max(0, Math.min(1, (f.until - state.time) / 1100));
    ctx.save(); ctx.globalAlpha = Math.min(1, life * 4); ctx.font = `600 ${Math.min(13, Math.max(11, t * .17))}px sans-serif`; ctx.textAlign = 'center';
    const y = p.y - t * .9 - (reducedMotion ? 0 : (1 - life) * t * .55) - (i % 3) * 13;
    ctx.lineWidth = 2; ctx.strokeStyle = '#243a30'; ctx.strokeText(f.text.replace(/ HP$/, ''), p.x, y);
    ctx.fillStyle = f.kind === 'damage' ? '#e9a19a' : f.kind === 'heal' ? '#b9d8b0' : f.kind === 'xp' ? '#ddd2ac' : '#fffbe7'; ctx.fillText(f.text.replace(/ HP$/, ''), p.x, y); ctx.restore();
  });
}

/** Common pickup language for enemy drops and room collection nodes. */
function drawPickup(ctx:CanvasRenderingContext2D,item:keyof typeof COMBAT_ITEMS,p:CombatPoint,tile:number,lift:number,quantity:number,near:boolean){
  ctx.save();
  // A restrained contact shadow stays on the ground while the item falls or hovers.
  const shadow=ctx.createRadialGradient(p.x,p.y+tile*.06,0,p.x,p.y+tile*.06,tile*.28);
  shadow.addColorStop(0,'rgba(18,35,20,.18)');shadow.addColorStop(1,'rgba(18,35,20,0)');
  ctx.save();ctx.translate(p.x,p.y+tile*.06);ctx.scale(1,.36);
  ctx.fillStyle='rgba(18,35,20,.08)';ctx.beginPath();ctx.arc(0,0,tile*.24,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(p.x,p.y+tile*.06,tile*.3,tile*.12,0,0,Math.PI*2);ctx.fill();
  const y=p.y-lift*tile-tile*.12;
  drawGroundItem(ctx,item,{x:p.x,y:y+tile*.07},tile*.65,0);
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
