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
  ctx.fillStyle = '#e8f4c2'; ctx.font = `bold ${Math.max(11, t * .18)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('Seguro', camp.x, camp.y - t * .6);
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
      if (enemy.id === 'beetle') {
        ctx.strokeStyle = '#3d2845'; ctx.lineWidth = Math.max(2, t * .04);
        for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(p.x + side * t * .12, p.y + i * t * .09); ctx.lineTo(p.x + side * t * .3, p.y + i * t * .13); ctx.stroke(); }
        ctx.fillStyle = '#ac80ba'; ctx.beginPath(); ctx.ellipse(p.x, p.y - t * .1, t * .2, t * .27, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        for (let i = 2; i >= 0; i--) { ctx.fillStyle = i % 2 ? '#80a94f' : '#b9cd72'; ctx.beginPath(); ctx.arc(p.x + (i - 1) * t * .17, p.y - t * .08, t * .18, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.fillStyle = '#fff'; for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(p.x + side * t * .065, p.y - t * .23, t * .045, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#273d37'; ctx.fillRect(p.x - t * .37, p.y - t * .66, t * .74, t * .075);
      ctx.fillStyle = '#ef817d'; ctx.fillRect(p.x - t * .37, p.y - t * .66, t * .74 * enemy.hp / def.hp, t * .075);
      ctx.fillStyle = def.level > combatLevel(state.xp) ? '#ffe4a2' : '#fff9df'; ctx.font = `bold ${Math.max(11, t * .18)}px sans-serif`; ctx.textAlign = 'center';
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
    ctx.save(); ctx.globalAlpha = Math.min(1, life * 4); ctx.font = `bold ${Math.max(14, t * .24)}px sans-serif`; ctx.textAlign = 'center';
    const y = p.y - t * .9 - (reducedMotion ? 0 : (1 - life) * t * .55) - (i % 3) * 17;
    ctx.lineWidth = 3; ctx.strokeStyle = '#19382b'; ctx.strokeText(f.text, p.x, y);
    ctx.fillStyle = f.kind === 'damage' ? '#ffaaa6' : f.kind === 'heal' ? '#b7ffc1' : f.kind === 'xp' ? '#ffe39a' : '#fffbe7'; ctx.fillText(f.text, p.x, y); ctx.restore();
  });
}
