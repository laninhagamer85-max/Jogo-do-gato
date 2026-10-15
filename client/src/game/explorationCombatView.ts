import { combatLevel, PILOT_CAMP, PILOT_ENEMIES, PILOT_EXIT, PILOT_MARKER, PILOT_NODES, PILOT_SIZE, PILOT_WALLS, type CombatPoint, type CombatState } from './explorationCombat';
import { drawWalkFrame } from './petWalkAtlas';
import { homeWalkDirection } from './petFrameCleanup';

export function combatView(width: number, height: number, player: CombatPoint, zoom = 1, overview = false) {
  const tile = overview ? Math.min(width / PILOT_SIZE.width, Math.max(1, height - 100) / PILOT_SIZE.height) : Math.max(48, width / 10, (height - 160) / 7) * zoom;
  const bw = tile * PILOT_SIZE.width, bh = tile * PILOT_SIZE.height;
  const left = bw < width ? (width - bw) / 2 : Math.min(0, Math.max(width - bw, width / 2 - player.x * tile));
  const top = bh < height - 80 ? (height - bh) / 2 : Math.min(38, Math.max(height - 130 - bh, (height - 90) / 2 - player.y * tile));
  return { tile, left, top };
}
export function drawCombatPilot(ctx: CanvasRenderingContext2D, width: number, height: number, state: CombatState,
  pet: HTMLImageElement, atlas: HTMLImageElement, background: HTMLImageElement, zoom: number, overview: boolean, reducedMotion: boolean) {
  const v = combatView(width, height, state.player, zoom, overview), t = v.tile;
  const point = (p: CombatPoint) => ({ x: v.left + p.x * t, y: v.top + p.y * t });
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#386146'; ctx.fillRect(0, 0, width, height);
  const bw = PILOT_SIZE.width * t, bh = PILOT_SIZE.height * t;
  if (background.complete && background.naturalWidth) ctx.drawImage(background, v.left, v.top, bw, bh);
  ctx.fillStyle = 'rgba(20,50,30,.36)'; ctx.fillRect(v.left, v.top, bw, bh);
  ctx.fillStyle = '#254735';
  ctx.fillRect(v.left, v.top, bw, t); ctx.fillRect(v.left, v.top + bh - t, bw, t);
  ctx.fillRect(v.left, v.top, t, bh); ctx.fillRect(v.left + bw - t, v.top, t, bh);
  for (const wall of PILOT_WALLS) {
    const p = point(wall); ctx.fillStyle = '#3b6546'; ctx.beginPath(); ctx.roundRect(p.x, p.y, t, t, t * .2); ctx.fill();
    ctx.fillStyle = '#64895a'; ctx.fillRect(p.x + t * .12, p.y + t * .09, t * .76, t * .12);
  }
  const camp = point(PILOT_CAMP); ctx.strokeStyle = '#b7e4b5'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(camp.x, camp.y, t * .54, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#e8f4c2'; ctx.font = `500 ${Math.min(12, Math.max(10, t * .16))}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('Seguro', camp.x, camp.y - t * .6);
  const marker = point(PILOT_MARKER); ctx.fillStyle = state.gateOpen ? '#f6d77d' : '#8b8d72'; ctx.beginPath(); ctx.roundRect(marker.x - t * .2, marker.y - t * .4, t * .4, t * .6, t * .1); ctx.fill();
  ctx.fillStyle = '#243927'; ctx.font = `bold ${t * .22}px sans-serif`; ctx.fillText('6', marker.x, marker.y);
  if (!state.gateOpen) { const g = point({ x: 9, y: 4 }); ctx.fillStyle = '#9c7244'; ctx.fillRect(g.x, g.y, t, t); ctx.strokeStyle = '#e9c989'; ctx.strokeRect(g.x + 3, g.y + 3, t - 6, t - 6); }
  const exit = point(PILOT_EXIT); ctx.strokeStyle = state.gateOpen ? '#ffe4a2' : '#80907c'; ctx.lineWidth = Math.max(3, t * .06); ctx.beginPath(); ctx.arc(exit.x, exit.y, t * .4, 0, Math.PI * 2); ctx.stroke();
  for (const n of PILOT_NODES) if (!state.collectedNodes.includes(n.id)) {
    const p = point(n); ctx.fillStyle = n.item === 'erva' ? '#ade3ad' : '#e4ce80';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, t * .13, t * .23, .5, 0, Math.PI * 2); ctx.fill();
  }
  for (const loot of state.loot) { const p = point(loot); ctx.fillStyle = '#f5cf74'; ctx.beginPath(); ctx.roundRect(p.x - t * .13, p.y - t * .13, t * .26, t * .26, 4); ctx.fill(); }
  const entities = [...state.enemies.filter(e => e.hp > 0).map(e => ({ type: 'enemy' as const, p: e })), { type: 'pet' as const, p: state.player }].sort((a, b) => a.p.y - b.p.y);
  for (const entity of entities) {
    const p = point(entity.p);
    ctx.fillStyle = 'rgba(10,24,15,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + t * .07, t * .28, t * .10, 0, 0, Math.PI * 2); ctx.fill();
    if (entity.type === 'enemy') {
      const enemy = entity.p as CombatState['enemies'][number], def = PILOT_ENEMIES.find(e => e.id === enemy.id)!;
      // Grounded, forest-coloured insects. Feet alternate only while travelling.
      const range = Math.hypot(state.player.x - enemy.x, state.player.y - enemy.y);
      const safe = Math.hypot(state.player.x - PILOT_CAMP.x, state.player.y - PILOT_CAMP.y) < 1.6;
      const travelling = (!safe && range < 4 && range > .65) || ((safe || range > 4) && Math.hypot(enemy.x - def.x, enemy.y - def.y) > .1);
      const phase = reducedMotion || !travelling ? 0 : state.time * .009;
      const sway = reducedMotion || !travelling ? 0 : Math.sin(phase * 2) * t * .012;
      ctx.save(); ctx.translate(p.x, p.y + sway);
      if (enemy.id === 'beetle') {
        ctx.strokeStyle = '#394c34'; ctx.lineWidth = Math.max(1.5, t * .032); ctx.lineCap = 'round';
        for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) {
          const stride = Math.sin(phase + (i + (side > 0 ? 1 : 0)) * Math.PI) * t * .045;
          ctx.beginPath(); ctx.moveTo(side * t * .12, i * t * .09); ctx.lineTo(side * t * .28, i * t * .14 + stride); ctx.lineTo(side * t * .34, i * t * .15 + stride); ctx.stroke();
        }
        const shell = ctx.createLinearGradient(-t * .2, -t * .3, t * .2, t * .2); shell.addColorStop(0, '#8c9d65'); shell.addColorStop(1, '#4b6644');
        ctx.fillStyle = shell; ctx.beginPath(); ctx.ellipse(0, -t * .07, t * .21, t * .26, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3d563d'; ctx.beginPath(); ctx.moveTo(0, -t * .26); ctx.lineTo(0, t * .16); ctx.stroke();
        ctx.fillStyle = '#526a43'; ctx.beginPath(); ctx.ellipse(0, -t * .29, t * .15, t * .12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#455a3b'; for (const side of [-1,1]) { ctx.beginPath(); ctx.moveTo(side*t*.07,-t*.35);ctx.quadraticCurveTo(side*t*.12,-t*.45,side*t*.18,-t*.43);ctx.stroke(); }
      } else {
        ctx.strokeStyle = '#556343'; ctx.lineWidth = Math.max(1.5, t * .027); ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          const crawl = Math.sin(phase + i * .9) * t * .025;
          for (const side of [-1,1]) { ctx.beginPath();ctx.moveTo((i-1.5)*t*.14,-t*.02);ctx.lineTo((i-1.5)*t*.14+side*t*.035,t*.09+Math.max(0,crawl));ctx.stroke(); }
        }
        for (let i = 3; i >= 0; i--) { const crawl = Math.sin(phase + i * .9)*t*.018;ctx.fillStyle=i%2 ? '#91a86b' : '#aabd7d';ctx.beginPath();ctx.ellipse((i-1.5)*t*.14,-t*.09+crawl,t*.14,t*.17,0,0,Math.PI*2);ctx.fill(); }
        ctx.fillStyle='#728e57';ctx.beginPath();ctx.ellipse(0,-t*.26,t*.15,t*.12,0,0,Math.PI*2);ctx.fill();
      }
      for (const side of [-1, 1]) { ctx.fillStyle = '#f2efdb';ctx.beginPath();ctx.arc(side*t*.06,-t*.30,t*.034,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2d4033';ctx.beginPath();ctx.arc(side*t*.06,-t*.30,t*.017,0,Math.PI*2);ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = '#273d37'; ctx.fillRect(p.x - t * .37, p.y - t * .66, t * .74, t * .075);
      ctx.fillStyle = '#ef817d'; ctx.fillRect(p.x - t * .37, p.y - t * .66, t * .74 * enemy.hp / def.hp, t * .075);
      ctx.fillStyle = def.level > combatLevel(state.xp) ? '#ffe4a2' : '#fff9df'; ctx.font = `500 ${Math.min(12, Math.max(10, t * .16))}px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(`${def.name} · Nv ${def.level}`, p.x, p.y - t * .76);
    } else {
      const direction = homeWalkDirection(state.facing.x, -state.facing.y);
      if (atlas.complete && atlas.naturalWidth && state.walking) {
        ctx.save(); ctx.translate(p.x, p.y); if (direction.mirror) ctx.scale(-1, 1);
        drawWalkFrame(ctx, atlas, direction.row, state.walkPhase, -t * .46, -t * .82, t * .92, t * .92); ctx.restore();
      } else if (pet.complete && pet.naturalWidth) ctx.drawImage(pet, p.x - t * .38, p.y - t * .72, t * .76, t * .8);
      if (state.strikeUntil > state.time) {
        ctx.save(); ctx.translate(p.x, p.y - t * .2); ctx.rotate(Math.atan2(state.facing.y, state.facing.x));
        ctx.strokeStyle = '#ffe5a0'; ctx.lineWidth = t * .08; ctx.beginPath(); ctx.arc(0, 0, t * .68, -.8, .8); ctx.stroke(); ctx.restore();
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
