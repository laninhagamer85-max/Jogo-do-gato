import "dotenv/config";
import { and, eq, inArray, or } from "drizzle-orm";
import { adminAuditEvents, childProfiles, guardianAccounts } from "../drizzle/schema";
import {
  acceptCurrentNotices,
  createChildProfile,
  ensureGuardianAccount,
  finalizeRequestedProfileDeletion,
  getChildProfileSave,
  getDb,
  requestChildProfileDeletion,
  saveChildProfileState,
} from "../server/db";
import { randomUUID } from "node:crypto";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

async function main() {
  if (process.env.MPV_PROFILE_QA_CONFIRM !== "development-only" || process.env.NODE_ENV === "production") {
    throw new Error("explicit_development_database_confirmation_required");
  }
  if (!process.env.DATABASE_URL) throw new Error("development_database_not_configured");
  const db = await getDb();
  if (!db) throw new Error("development_database_unavailable");

  const suffix = randomUUID();
  const fixtures = [
    { firebaseUid: `mpv-qa-a-${suffix}`, email: `qa-a-${suffix}@example.invalid` },
    { firebaseUid: `mpv-qa-b-${suffix}`, email: `qa-b-${suffix}@example.invalid` },
  ];
  const createdGuardianIds: number[] = [];
  let profileAId: number | null = null;
  let checks = 0;

  try {
    const guardians = [];
    for (const fixture of fixtures) {
      const guardian = await ensureGuardianAccount({ ...fixture, loginMethod: "password", emailVerified: true });
      assert(guardian, "fixture_guardian_create_failed");
      guardians.push(guardian);
      createdGuardianIds.push(guardian.id);
      await acceptCurrentNotices(guardian.id);
    }
    const [guardianA, guardianB] = guardians;
    assert(guardianA && guardianB, "fixture_guardians_missing");

    const profileA = await createChildProfile(guardianA.id, { nickname: "QA Pudim", avatarId: "menina-creme" });
    const profileB = await createChildProfile(guardianB.id, { nickname: "QA Bigodes", avatarId: "menino-cinza" });
    assert(profileA && profileB, "fixture_profiles_create_failed");
    profileAId = profileA.id;

    const writeA = await saveChildProfileState({ guardianId: guardianA.id, profileId: profileA.id, revision: 0, rawState: JSON.stringify({ level: 2, platformProgress: { unlockedStage: 3 } }) });
    const writeB = await saveChildProfileState({ guardianId: guardianB.id, profileId: profileB.id, revision: 0, rawState: JSON.stringify({ level: 5, platformProgress: { unlockedStage: 7 } }) });
    assert(writeA.ok && writeB.ok, "owner_save_failed");
    checks += 2;

    const crossRead = await getChildProfileSave(guardianB.id, profileA.id);
    assert(crossRead === null, "cross_guardian_read_allowed");
    checks += 1;
    const crossWrite = await saveChildProfileState({ guardianId: guardianB.id, profileId: profileA.id, revision: 1, rawState: JSON.stringify({ level: 9 }) });
    assert(!crossWrite.ok, "cross_guardian_write_allowed");
    checks += 1;

    const ownA = await getChildProfileSave(guardianA.id, profileA.id);
    const ownB = await getChildProfileSave(guardianB.id, profileB.id);
    assert(ownA?.level === 2 && ownA.revision === 1, "guardian_a_save_mismatch");
    assert(ownB?.level === 5 && ownB.revision === 1, "guardian_b_save_mismatch");
    checks += 2;

    const wrongOwnerDelete = await requestChildProfileDeletion(guardianB.id, profileA.id);
    assert(!wrongOwnerDelete, "cross_guardian_delete_allowed");
    const ownerDelete = await requestChildProfileDeletion(guardianA.id, profileA.id);
    assert(ownerDelete, "owner_deletion_request_failed");
    checks += 2;

    const finalize = await finalizeRequestedProfileDeletion({ actorId: guardianB.id, profileId: profileA.id });
    assert(finalize, "admin_deletion_finalizer_failed");
    const erasedProfile = await db.select({ id: childProfiles.id }).from(childProfiles).where(eq(childProfiles.id, profileA.id)).limit(1);
    assert(erasedProfile.length === 0, "profile_data_not_erased");
    const deleted = await db.select({ id: adminAuditEvents.id }).from(adminAuditEvents).where(and(
      eq(adminAuditEvents.eventType, "child_profile_data_erased"),
      eq(adminAuditEvents.actorGuardianId, guardianB.id),
    )).limit(1);
    assert(deleted.length === 1, "deletion_audit_missing");
    checks += 2;

    console.log(JSON.stringify({ ok: true, checks, crossOwnerReadBlocked: true, crossOwnerWriteBlocked: true, crossOwnerDeleteBlocked: true, profileErasureAudited: true }));
  } finally {
    if (profileAId !== null && createdGuardianIds.length > 0) {
      await db.delete(adminAuditEvents).where(and(eq(adminAuditEvents.eventType, "child_profile_data_erased"), eq(adminAuditEvents.targetProfileId, profileAId))).catch(() => undefined);
    }
    if (createdGuardianIds.length > 0) {
      await db.delete(adminAuditEvents).where(or(
        inArray(adminAuditEvents.actorGuardianId, createdGuardianIds),
        inArray(adminAuditEvents.targetGuardianId, createdGuardianIds),
      )).catch(() => undefined);
      await db.delete(guardianAccounts).where(inArray(guardianAccounts.id, createdGuardianIds)).catch(() => undefined);
    }
    const pool = (db as unknown as { $client?: { end?: () => Promise<void> } }).$client;
    try { await pool?.end?.(); } catch { /* Keep cleanup best-effort without masking the QA result. */ }
  }
}

main().catch((error: unknown) => {
  const rawMessage = error instanceof Error ? error.message : "";
  const message = /^[a-z0-9_]+$/.test(rawMessage) ? rawMessage : "unexpected_database_error";
  console.error(`Profile isolation QA failed (${message}).`);
  process.exitCode = 1;
});
