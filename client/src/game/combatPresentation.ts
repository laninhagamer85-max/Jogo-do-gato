/** Touch and animation presentation; these helpers never change combat damage. */
export function combatStick(x: number, y: number, radius: number) {
  if (![x, y, radius].every(Number.isFinite) || radius <= 0) return { x: 0, y: 0 };
  const length = Math.hypot(x, y), strength = Math.min(1, length / radius);
  if (strength < .14) return { x: 0, y: 0 };
  return { x: x / length * strength, y: y / length * strength };
}
export function combatAttackPose(time: number, until: number, reducedMotion: boolean) {
  const active = until > time && until - time <= 320;
  if (!active) return { active: false, reach: 0, lean: 0, phase: 0 };
  const phase = 1 - (until - time) / 320;
  const reach = phase < .22 ? -.15 * phase / .22 : Math.sin((phase - .22) / .78 * Math.PI);
  return { active: true, reach: reducedMotion ? .5 : reach, lean: reducedMotion ? 0 : reach * .12, phase };
}
export function combatLootLift(time: number, bornAt: number | undefined, landedAt: number | undefined, reducedMotion: boolean) {
  if (reducedMotion || bornAt === undefined || landedAt === undefined || landedAt <= bornAt || time >= landedAt) return 0;
  const phase = Math.max(0, Math.min(1, (time - bornAt) / (landedAt - bornAt)));
  return Math.sin(phase * Math.PI) * .6;
}

/** Puzzle rooms keep one cardinal direction; combat may use the analog diagonal. */
export function forestStickDirection(value:{x:number;y:number}):'up'|'down'|'left'|'right'|null {
  if(!Number.isFinite(value.x)||!Number.isFinite(value.y)||Math.hypot(value.x,value.y)<.14)return null;
  return Math.abs(value.x)>Math.abs(value.y)?value.x>0?'right':'left':value.y>0?'down':'up';
}

/** Visual-only pickup cue. Ground coordinates and collection radius never move. */
export function combatPickupCue(time:number,landedAt:number|undefined,reducedMotion:boolean){
  if(reducedMotion)return {hover:0};
  const elapsed=Math.max(0,time-(landedAt??0));
  if(time<(landedAt??0))return {hover:0};
  return {hover:.045*(1-Math.cos(elapsed/520))};
}
