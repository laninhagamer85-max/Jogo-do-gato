export type GameAccessGuardian = {
  status: string;
  needsConsent: boolean;
} | null | undefined;

/** Client route gate for UX; all profile reads/writes remain server-authorized. */
export function canAccessGameProfile(
  guardian: GameAccessGuardian,
  requestedProfileId: number,
  ownedProfileIds: readonly number[],
): boolean {
  if (!guardian || guardian.status !== "active" || guardian.needsConsent) return false;
  if (!Number.isSafeInteger(requestedProfileId) || requestedProfileId <= 0) return false;
  return ownedProfileIds.includes(requestedProfileId);
}
