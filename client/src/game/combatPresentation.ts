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
