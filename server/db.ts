import { and, desc, eq, gt, isNull, like, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { migrateGameState, type GameState } from "../client/src/game/PetGame";
import { POLICY_VERSIONS } from "../shared/policy";
import {
  adminAuditEvents,
  authSessions,
  childProfiles,
  guardianAccounts,
  noticeAcknowledgements,
  securityEvents,
} from "../drizzle/schema";
import { firstAdminBootstrapFailure, maskEmail, type SupportedProvider } from "./auth/policy";

let _db: ReturnType<typeof drizzle> | null = null;

/** Lazy DB initialization lets unit tests and the public game run without a connected database. */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch {
      _db = null;
    }
  }
  return _db;
}

function requireDb() {
  return getDb().then((db) => {
    if (!db) throw new Error("Database is not configured");
    return db;
  });
}

export async function getGuardianByUid(firebaseUid: string) {
  const db = await requireDb();
  const rows = await db.select().from(guardianAccounts).where(eq(guardianAccounts.firebaseUid, firebaseUid)).limit(1);
  return rows[0] ?? null;
}

export async function getGuardianById(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(guardianAccounts).where(eq(guardianAccounts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createAuthSession(input: {
  sessionId: string;
  guardianId: number;
  tokenHash: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  expiresAt: Date;
}) {
  const db = await requireDb();
  await db.insert(authSessions).values({ ...input, lastSeenAt: new Date() });
}

export async function revokeAuthSession(guardianId: number, sessionId: string) {
  const db = await requireDb();
  const now = new Date();
  await db.update(authSessions).set({ revokedAt: now }).where(and(
    eq(authSessions.guardianId, guardianId),
    eq(authSessions.sessionId, sessionId),
    isNull(authSessions.revokedAt),
  ));
}

export async function ensureGuardianAccount(input: {
  firebaseUid: string;
  email: string;
  loginMethod: SupportedProvider;
  emailVerified: boolean;
}) {
  const db = await requireDb();
  const now = new Date();
  await db.insert(guardianAccounts).values({
    firebaseUid: input.firebaseUid,
    email: input.email.toLowerCase(),
    loginMethod: input.loginMethod,
    status: input.emailVerified ? "active" : "pending_email",
    emailVerifiedAt: input.emailVerified ? now : null,
    lastSignedIn: input.emailVerified ? now : null,
  }).onDuplicateKeyUpdate({ set: {
    email: input.email.toLowerCase(),
    loginMethod: input.loginMethod,
    updatedAt: now,
    ...(input.emailVerified ? { emailVerifiedAt: now, lastSignedIn: now } : {}),
  } });

  if (input.emailVerified) {
    await db.update(guardianAccounts).set({ status: "active" }).where(and(
      eq(guardianAccounts.firebaseUid, input.firebaseUid),
      eq(guardianAccounts.status, "pending_email"),
    ));
  }
  return getGuardianByUid(input.firebaseUid);
}

export async function acceptCurrentNotices(guardianId: number) {
  const db = await requireDb();
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(noticeAcknowledgements).values((Object.entries(POLICY_VERSIONS) as Array<[keyof typeof POLICY_VERSIONS, string]>).map(([noticeType, version]) => ({
      guardianId,
      noticeType,
      version,
      acceptedAt: now,
      withdrawnAt: null,
    }))).onDuplicateKeyUpdate({ set: { acceptedAt: now, withdrawnAt: null } });
    await tx.update(guardianAccounts).set({ guardianConsentWithdrawnAt: null }).where(eq(guardianAccounts.id, guardianId));
  });
}

export async function withdrawGuardianConsent(guardianId: number) {
  const db = await requireDb();
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(noticeAcknowledgements).set({ withdrawnAt: now }).where(and(
      eq(noticeAcknowledgements.guardianId, guardianId),
      eq(noticeAcknowledgements.noticeType, "guardianConsent"),
      isNull(noticeAcknowledgements.withdrawnAt),
    ));
    await tx.update(guardianAccounts).set({ guardianConsentWithdrawnAt: now }).where(eq(guardianAccounts.id, guardianId));
    await tx.insert(securityEvents).values({ guardianId, eventType: "guardian_consent_withdrawn", outcome: "success", safeCode: "settings_action" });
  });
}

export async function requestGuardianDeletion(guardianId: number) {
  const db = await requireDb();
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(guardianAccounts).set({ status: "deletion_requested", deletionRequestedAt: now }).where(and(
      eq(guardianAccounts.id, guardianId),
      ne(guardianAccounts.status, "suspended"),
    ));
    await tx.insert(securityEvents).values({ guardianId, eventType: "account_deletion_requested", outcome: "success", safeCode: "guardian_request" });
  });
}

export async function cancelGuardianDeletion(guardianId: number) {
  const db = await requireDb();
  await db.update(guardianAccounts).set({ status: "active", deletionRequestedAt: null }).where(and(
    eq(guardianAccounts.id, guardianId),
    eq(guardianAccounts.status, "deletion_requested"),
  ));
}

export async function recordSecurityEvent(input: {
  guardianId?: number | null;
  eventType: string;
  outcome: "success" | "failure" | "blocked";
  safeCode?: string | null;
}) {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(securityEvents).values({
      guardianId: input.guardianId ?? null,
      eventType: input.eventType.slice(0, 48),
      outcome: input.outcome,
      safeCode: input.safeCode?.slice(0, 64) ?? null,
    });
  } catch {
    // Event logging never writes credentials, child data, IPs, or user agents.
  }
}

export async function createChildProfile(guardianId: number, input: { nickname: string; avatarId: string }) {
  const db = await requireDb();
  const result = await db.insert(childProfiles).values({ guardianId, nickname: input.nickname, avatarId: input.avatarId });
  const insertId = Number((Array.isArray(result) ? result[0] : result)?.insertId ?? 0);
  const rows = await db.select({ id: childProfiles.id, guardianId: childProfiles.guardianId, nickname: childProfiles.nickname, avatarId: childProfiles.avatarId, status: childProfiles.status, revision: childProfiles.revision, level: childProfiles.level, adventureStage: childProfiles.adventureStage, createdAt: childProfiles.createdAt, updatedAt: childProfiles.updatedAt })
    .from(childProfiles).where(eq(childProfiles.id, insertId)).limit(1);
  return rows[0] ?? null;
}

export async function listChildProfiles(guardianId: number) {
  const db = await requireDb();
  return db.select({
    id: childProfiles.id,
    guardianId: childProfiles.guardianId,
    nickname: childProfiles.nickname,
    avatarId: childProfiles.avatarId,
    status: childProfiles.status,
    revision: childProfiles.revision,
    level: childProfiles.level,
    adventureStage: childProfiles.adventureStage,
    createdAt: childProfiles.createdAt,
    updatedAt: childProfiles.updatedAt,
  }).from(childProfiles).where(and(eq(childProfiles.guardianId, guardianId), eq(childProfiles.status, "active"))).orderBy(desc(childProfiles.updatedAt));
}

export async function getChildProfile(guardianId: number, profileId: number) {
  const db = await requireDb();
  const rows = await db.select().from(childProfiles).where(and(
    eq(childProfiles.id, profileId),
    eq(childProfiles.guardianId, guardianId),
    eq(childProfiles.status, "active"),
  )).limit(1);
  return rows[0] ?? null;
}

export async function updateChildProfile(guardianId: number, input: { profileId: number; nickname: string; avatarId: string }) {
  const db = await requireDb();
  const [profile] = await db.select({ id: childProfiles.id }).from(childProfiles).where(and(
    eq(childProfiles.id, input.profileId), eq(childProfiles.guardianId, guardianId), eq(childProfiles.status, "active"),
  )).limit(1);
  if (!profile) return false;
  await db.update(childProfiles).set({ nickname: input.nickname, avatarId: input.avatarId }).where(eq(childProfiles.id, profile.id));
  return true;
}

export async function requestChildProfileDeletion(guardianId: number, profileId: number) {
  const db = await requireDb();
  const now = new Date();
  const result = await db.update(childProfiles).set({ status: "deletion_requested", deletionRequestedAt: now }).where(and(
    eq(childProfiles.id, profileId), eq(childProfiles.guardianId, guardianId), eq(childProfiles.status, "active"),
  ));
  const header = (Array.isArray(result) ? result[0] : result) as { affectedRows?: number };
  if (!header?.affectedRows) return false;
  await db.insert(securityEvents).values({ guardianId, eventType: "child_profile_deletion_requested", outcome: "success", safeCode: "guardian_request" });
  return true;
}

function normalizeGameState(raw: string): { state: GameState; json: string; level: number; adventureStage: number } | null {
  if (raw.length > 400_000) return null;
  try {
    const state = migrateGameState(JSON.parse(raw)) as GameState;
    const json = JSON.stringify(state);
    if (json.length > 400_000) return null;
    const level = Math.max(1, Math.min(10, Math.floor(Number(state.level) || 1)));
    const adventureStage = Math.max(1, Math.min(101, Math.floor(Number(state.platformProgress?.unlockedStage) || 1)));
    return { state, json, level, adventureStage };
  } catch {
    return null;
  }
}

export async function getChildProfileSave(guardianId: number, profileId: number) {
  const db = await requireDb();
  const rows = await db.select({ id: childProfiles.id, guardianId: childProfiles.guardianId, nickname: childProfiles.nickname, avatarId: childProfiles.avatarId, revision: childProfiles.revision, level: childProfiles.level, adventureStage: childProfiles.adventureStage, stateJson: childProfiles.stateJson, updatedAt: childProfiles.updatedAt })
    .from(childProfiles).where(and(eq(childProfiles.id, profileId), eq(childProfiles.guardianId, guardianId), eq(childProfiles.status, "active"))).limit(1);
  return rows[0] ?? null;
}

export async function saveChildProfileState(input: { guardianId: number; profileId: number; revision: number; rawState: string }) {
  const normalized = normalizeGameState(input.rawState);
  if (!normalized) return { ok: false as const, reason: "invalid_or_too_large" as const };
  const db = await requireDb();
  const updateResult = await db.update(childProfiles).set({
    stateJson: normalized.json,
    revision: input.revision + 1,
    level: normalized.level,
    adventureStage: normalized.adventureStage,
    updatedAt: new Date(),
  }).where(and(
    eq(childProfiles.id, input.profileId),
    eq(childProfiles.guardianId, input.guardianId),
    eq(childProfiles.status, "active"),
    eq(childProfiles.revision, input.revision),
  ));
  const header = (Array.isArray(updateResult) ? updateResult[0] : updateResult) as { affectedRows?: number };
  return header?.affectedRows ? { ok: true as const, revision: input.revision + 1 } : { ok: false as const, reason: "conflict_or_missing" as const };
}

export async function importChildProfileSave(input: { guardianId: number; profileId: number; revision: number; rawState: string; replaceExisting: boolean }) {
  const normalized = normalizeGameState(input.rawState);
  if (!normalized) return { ok: false as const, reason: "invalid_or_too_large" as const };
  const db = await requireDb();
  const conditions = [
    eq(childProfiles.id, input.profileId),
    eq(childProfiles.guardianId, input.guardianId),
    eq(childProfiles.status, "active"),
    eq(childProfiles.revision, input.revision),
  ];
  if (!input.replaceExisting) conditions.push(isNull(childProfiles.stateJson));
  const updateResult = await db.update(childProfiles).set({
    stateJson: normalized.json,
    revision: input.revision + 1,
    level: normalized.level,
    adventureStage: normalized.adventureStage,
    updatedAt: new Date(),
  }).where(and(...conditions));
  const header = (Array.isArray(updateResult) ? updateResult[0] : updateResult) as { affectedRows?: number };
  return header?.affectedRows ? { ok: true as const, revision: input.revision + 1 } : { ok: false as const, reason: "conflict_or_existing_save" as const };
}

export async function getGuardianSessions(guardianId: number, currentSessionId: string) {
  const db = await requireDb();
  const rows = await db.select({
    sessionId: authSessions.sessionId,
    deviceType: authSessions.deviceType,
    createdAt: authSessions.createdAt,
    expiresAt: authSessions.expiresAt,
    lastSeenAt: authSessions.lastSeenAt,
  }).from(authSessions).where(and(
    eq(authSessions.guardianId, guardianId), isNull(authSessions.revokedAt), gt(authSessions.expiresAt, new Date()),
  )).orderBy(desc(authSessions.lastSeenAt)).limit(20);
  return rows.map((row) => ({ ...row, isCurrent: row.sessionId === currentSessionId }));
}

export async function revokeOtherGuardianSessions(guardianId: number, currentSessionId: string) {
  const db = await requireDb();
  const now = new Date();
  const rows = await db.select({ id: authSessions.id }).from(authSessions).where(and(
    eq(authSessions.guardianId, guardianId), isNull(authSessions.revokedAt), ne(authSessions.sessionId, currentSessionId),
  )).limit(200);
  if (rows.length) await db.update(authSessions).set({ revokedAt: now }).where(and(
    eq(authSessions.guardianId, guardianId), isNull(authSessions.revokedAt), ne(authSessions.sessionId, currentSessionId),
  ));
  await recordSecurityEvent({ guardianId, eventType: "other_sessions_revoked", outcome: "success", safeCode: "guardian_settings" });
  return rows.length;
}

export async function getAdminOverview() {
  const db = await requireDb();
  const [accountCounts, profileCounts, active30d, security30d] = await Promise.all([
    db.select({ status: guardianAccounts.status, count: sql<number>`COUNT(*)` }).from(guardianAccounts).groupBy(guardianAccounts.status),
    db.select({ status: childProfiles.status, count: sql<number>`COUNT(*)` }).from(childProfiles).groupBy(childProfiles.status),
    db.select({ count: sql<number>`COUNT(*)` }).from(guardianAccounts).where(gt(guardianAccounts.lastSignedIn, new Date(Date.now() - 30 * 86400_000))),
    db.select({ count: sql<number>`COUNT(*)` }).from(securityEvents).where(gt(securityEvents.createdAt, new Date(Date.now() - 30 * 86400_000))),
  ]);
  const accountMap = Object.fromEntries(accountCounts.map((row) => [row.status, Number(row.count)]));
  const profileMap = Object.fromEntries(profileCounts.map((row) => [row.status, Number(row.count)]));
  return {
    guardians: Object.values(accountMap).reduce((sum, count) => sum + count, 0),
    activeGuardians: accountMap.active ?? 0,
    pendingEmail: accountMap.pending_email ?? 0,
    suspended: accountMap.suspended ?? 0,
    deletionRequests: accountMap.deletion_requested ?? 0,
    activeProfiles: profileMap.active ?? 0,
    profilesForDeletion: profileMap.deletion_requested ?? 0,
    activeLast30Days: Number(active30d[0]?.count ?? 0),
    securityEventsLast30Days: Number(security30d[0]?.count ?? 0),
  };
}

export async function listAdminGuardians(input: { offset: number; limit: number; status?: string; search?: string }) {
  const db = await requireDb();
  const clauses = [];
  if (input.status) clauses.push(eq(guardianAccounts.status, input.status as "pending_email" | "active" | "suspended" | "deletion_requested"));
  const search = input.search?.trim().slice(0, 80);
  if (search) clauses.push(like(guardianAccounts.email, `%${search.replace(/[\\%_]/g, "\\$&")}%`));
  const where = clauses.length ? and(...clauses) : undefined;
  const [rows, countRows] = await Promise.all([
    db.select({ id: guardianAccounts.id, role: guardianAccounts.role, status: guardianAccounts.status, loginMethod: guardianAccounts.loginMethod, email: guardianAccounts.email, createdAt: guardianAccounts.createdAt, lastSignedIn: guardianAccounts.lastSignedIn, deletionRequestedAt: guardianAccounts.deletionRequestedAt })
      .from(guardianAccounts).where(where).orderBy(desc(guardianAccounts.createdAt)).limit(input.limit).offset(input.offset),
    db.select({ count: sql<number>`COUNT(*)` }).from(guardianAccounts).where(where),
  ]);
  return { total: Number(countRows[0]?.count ?? 0), items: rows.map(({ email, ...item }) => ({ ...item, maskedEmail: maskEmail(email) })) };
}

export async function listAdminSecurityEvents(offset: number, limit: number) {
  const db = await requireDb();
  return db.select({ id: securityEvents.id, guardianId: securityEvents.guardianId, eventType: securityEvents.eventType, outcome: securityEvents.outcome, safeCode: securityEvents.safeCode, createdAt: securityEvents.createdAt })
    .from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(limit).offset(offset);
}

export async function listAdminAuditEvents(offset: number, limit: number) {
  const db = await requireDb();
  return db.select({ id: adminAuditEvents.id, actorGuardianId: adminAuditEvents.actorGuardianId, targetGuardianId: adminAuditEvents.targetGuardianId, targetProfileId: adminAuditEvents.targetProfileId, eventType: adminAuditEvents.eventType, safeMetadata: adminAuditEvents.safeMetadata, createdAt: adminAuditEvents.createdAt })
    .from(adminAuditEvents).orderBy(desc(adminAuditEvents.createdAt)).limit(limit).offset(offset);
}

export async function setGuardianStatusByAdmin(input: { actorId: number; targetId: number; status: "active" | "suspended" }) {
  const db = await requireDb();
  const now = new Date();
  const target = await db.select({ id: guardianAccounts.id, status: guardianAccounts.status }).from(guardianAccounts).where(eq(guardianAccounts.id, input.targetId)).limit(1);
  if (!target[0] || target[0].status === "deletion_requested") return false;
  return db.transaction(async (tx) => {
    await tx.update(guardianAccounts).set({ status: input.status }).where(eq(guardianAccounts.id, input.targetId));
    if (input.status === "suspended") await tx.update(authSessions).set({ revokedAt: now }).where(and(eq(authSessions.guardianId, input.targetId), isNull(authSessions.revokedAt)));
    await tx.insert(adminAuditEvents).values({ actorGuardianId: input.actorId, targetGuardianId: input.targetId, eventType: input.status === "suspended" ? "guardian_suspended" : "guardian_reactivated", safeMetadata: { status: input.status } });
    return true;
  });
}

export async function changeGuardianRole(input: { actorId: number; targetId: number; role: "guardian" | "admin" }) {
  const db = await requireDb();
  const target = await db.select({ id: guardianAccounts.id, role: guardianAccounts.role, status: guardianAccounts.status }).from(guardianAccounts).where(eq(guardianAccounts.id, input.targetId)).limit(1);
  if (!target[0] || target[0].status !== "active") return false;
  await db.transaction(async (tx) => {
    await tx.update(guardianAccounts).set({ role: input.role }).where(eq(guardianAccounts.id, input.targetId));
    await tx.insert(adminAuditEvents).values({ actorGuardianId: input.actorId, targetGuardianId: input.targetId, eventType: input.role === "admin" ? "administrator_granted" : "administrator_revoked", safeMetadata: { previousRole: target[0].role, role: input.role } });
  });
  return true;
}

export async function bootstrapFirstAdmin(input: {
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  totpEnabled: boolean;
}) {
  const db = await requireDb();
  return db.transaction(async (tx) => {
    // The one-time operator command locks the current guardian rows to serialize concurrent bootstraps.
    const lockedGuardians = await tx.select({ id: guardianAccounts.id }).from(guardianAccounts).orderBy(guardianAccounts.id).for("update");
    const existingAdmins = await tx.select({ id: guardianAccounts.id }).from(guardianAccounts).where(eq(guardianAccounts.role, "admin")).limit(1).for("update");
    const matches = await tx.select({
      id: guardianAccounts.id,
      email: guardianAccounts.email,
      role: guardianAccounts.role,
      status: guardianAccounts.status,
      guardianConsentWithdrawnAt: guardianAccounts.guardianConsentWithdrawnAt,
    }).from(guardianAccounts).where(eq(guardianAccounts.firebaseUid, input.firebaseUid)).limit(1).for("update");
    const target = matches[0];
    const accountMatches = Boolean(target && target.email.toLowerCase() === input.email.toLowerCase() && target.role === "guardian");
    const acceptedNotices = target ? await tx.select({ noticeType: noticeAcknowledgements.noticeType, version: noticeAcknowledgements.version })
      .from(noticeAcknowledgements).where(and(eq(noticeAcknowledgements.guardianId, target.id), isNull(noticeAcknowledgements.withdrawnAt))) : [];
    const noticesCurrent = Boolean(target && target.guardianConsentWithdrawnAt === null &&
      (Object.entries(POLICY_VERSIONS) as Array<[string, string]>).every(([noticeType, version]) =>
        acceptedNotices.some((notice) => notice.noticeType === noticeType && notice.version === version)));
    const failure = firstAdminBootstrapFailure({
      hasExistingAdmin: existingAdmins.length > 0,
      guardianExists: Boolean(target && accountMatches && lockedGuardians.some((row) => row.id === target.id)),
      guardianActive: target?.status === "active",
      emailVerified: input.emailVerified,
      totpEnabled: input.totpEnabled,
      noticesCurrent,
    });
    if (failure) return { ok: false as const, reason: failure };

    await tx.update(guardianAccounts).set({ role: "admin", updatedAt: new Date() }).where(and(
      eq(guardianAccounts.id, target!.id),
      eq(guardianAccounts.firebaseUid, input.firebaseUid),
      eq(guardianAccounts.role, "guardian"),
      eq(guardianAccounts.status, "active"),
    ));
    await tx.insert(adminAuditEvents).values({
      actorGuardianId: target!.id,
      targetGuardianId: target!.id,
      eventType: "first_admin_bootstrapped",
      safeMetadata: { method: "operator_setup", mfa: "totp" },
    });
    return { ok: true as const };
  });
}

export async function listDeletionRequests() {
  const db = await requireDb();
  const [guardians, profiles] = await Promise.all([
    db.select({ id: guardianAccounts.id, email: guardianAccounts.email, deletionRequestedAt: guardianAccounts.deletionRequestedAt }).from(guardianAccounts).where(eq(guardianAccounts.status, "deletion_requested")).orderBy(desc(guardianAccounts.deletionRequestedAt)).limit(100),
    db.select({ id: childProfiles.id, guardianId: childProfiles.guardianId, deletionRequestedAt: childProfiles.deletionRequestedAt }).from(childProfiles).where(eq(childProfiles.status, "deletion_requested")).orderBy(desc(childProfiles.deletionRequestedAt)).limit(100),
  ]);
  return { guardians: guardians.map(({ email, ...item }) => ({ ...item, maskedEmail: maskEmail(email) })), profiles };
}

export async function finalizeRequestedProfileDeletion(input: { actorId: number; profileId: number }) {
  const db = await requireDb();
  return db.transaction(async (tx) => {
    const rows = await tx.select({ id: childProfiles.id, status: childProfiles.status }).from(childProfiles)
      .where(and(eq(childProfiles.id, input.profileId), eq(childProfiles.status, "deletion_requested"))).limit(1);
    if (!rows[0]) return false;
    await tx.insert(adminAuditEvents).values({
      actorGuardianId: input.actorId,
      targetProfileId: input.profileId,
      eventType: "child_profile_data_erased",
      safeMetadata: { targetRef: `profile-${input.profileId}` },
    });
    await tx.delete(childProfiles).where(eq(childProfiles.id, input.profileId));
    return true;
  });
}

export async function finalizeRequestedGuardianDeletion(input: { actorId: number; targetId: number; targetRef: string }) {
  const db = await requireDb();
  return db.transaction(async (tx) => {
    const rows = await tx.select({ id: guardianAccounts.id }).from(guardianAccounts).where(and(
      eq(guardianAccounts.id, input.targetId), eq(guardianAccounts.status, "deletion_requested"),
    )).limit(1);
    if (!rows[0]) return false;
    await tx.insert(adminAuditEvents).values({
      actorGuardianId: input.actorId,
      targetGuardianId: input.targetId,
      eventType: "guardian_data_erased",
      safeMetadata: { targetRef: input.targetRef },
    });
    await tx.delete(guardianAccounts).where(eq(guardianAccounts.id, input.targetId));
    return true;
  });
}

export async function writeAdminAudit(input: { actorId: number; eventType: string; targetGuardianId?: number | null; targetProfileId?: number | null; safeMetadata?: Record<string, string | number | boolean | null> | null }) {
  const db = await requireDb();
  await db.insert(adminAuditEvents).values({
    actorGuardianId: input.actorId,
    targetGuardianId: input.targetGuardianId ?? null,
    targetProfileId: input.targetProfileId ?? null,
    eventType: input.eventType.slice(0, 64),
    safeMetadata: input.safeMetadata ?? null,
  });
}
