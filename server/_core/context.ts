import { createHash } from "node:crypto";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { and, eq, gt, isNull } from "drizzle-orm";
import { authSessions, guardianAccounts, noticeAcknowledgements } from "../../drizzle/schema";
import { POLICY_VERSIONS } from "../../shared/policy";
import { getFirebaseAdminAuth } from "../auth/firebaseAdmin";
import { readSessionCookie } from "../auth/cookies";
import { getDb } from "../db";

export type GuardianPrincipal = {
  id: number;
  firebaseUid: string;
  email: string;
  role: "guardian" | "admin";
  status: "pending_email" | "active" | "suspended" | "deletion_requested";
  loginMethod: "password" | "google";
  sessionId: string;
  authTimeSeconds: number;
  secondFactor: string | null;
  consentsCurrent: boolean;
  consentWithdrawn: boolean;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  guardian: GuardianPrincipal | null;
};

async function verifyRequestPrincipal(req: CreateExpressContextOptions["req"]): Promise<GuardianPrincipal | null> {
  const cookie = readSessionCookie(req);
  const auth = getFirebaseAdminAuth();
  if (!cookie || !auth) return null;
  try {
    const decoded = await auth.verifySessionCookie(cookie, true);
    const db = await getDb();
    if (!db) return null;
    const accounts = await db.select().from(guardianAccounts).where(eq(guardianAccounts.firebaseUid, decoded.uid)).limit(1);
    const account = accounts[0];
    if (!account) return null;

    const tokenHash = createHash("sha256").update(cookie).digest("hex");
    const sessions = await db.select({ id: authSessions.id, sessionId: authSessions.sessionId, lastSeenAt: authSessions.lastSeenAt })
      .from(authSessions).where(and(
        eq(authSessions.guardianId, account.id),
        eq(authSessions.tokenHash, tokenHash),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      )).limit(1);
    const session = sessions[0];
    if (!session) return null;
    if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
      await db.update(authSessions).set({ lastSeenAt: new Date() }).where(eq(authSessions.id, session.id));
    }

    const notices = await db.select({ noticeType: noticeAcknowledgements.noticeType, version: noticeAcknowledgements.version })
      .from(noticeAcknowledgements).where(and(
        eq(noticeAcknowledgements.guardianId, account.id),
        isNull(noticeAcknowledgements.withdrawnAt),
      ));
    const has = (type: keyof typeof POLICY_VERSIONS) => notices.some((item) => item.noticeType === type && item.version === POLICY_VERSIONS[type]);
    const consentsCurrent = has("terms") && has("privacy") && has("guardianConsent");
    const firebaseClaims = decoded.firebase as { sign_in_second_factor?: string | null } | undefined;

    return {
      id: account.id,
      firebaseUid: account.firebaseUid,
      email: account.email,
      role: account.role,
      status: account.status,
      loginMethod: account.loginMethod,
      sessionId: session.sessionId,
      authTimeSeconds: Number(decoded.auth_time ?? 0),
      secondFactor: firebaseClaims?.sign_in_second_factor ?? null,
      consentsCurrent,
      consentWithdrawn: account.guardianConsentWithdrawnAt !== null,
    };
  } catch {
    return null;
  }
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  return { req: opts.req, res: opts.res, guardian: await verifyRequestPrincipal(opts.req) };
}
