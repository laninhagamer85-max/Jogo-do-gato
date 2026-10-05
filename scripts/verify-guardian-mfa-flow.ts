import "dotenv/config";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import { spawnSync } from "node:child_process";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import {
  getMultiFactorResolver,
  inMemoryPersistence,
  initializeAuth,
  multiFactor,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
  type Auth,
} from "firebase/auth";
import superjson from "superjson";
import { adminAuditEvents, authSessions, childProfiles, guardianAccounts, noticeAcknowledgements, securityEvents } from "../drizzle/schema";
import { POLICY_VERSIONS } from "../shared/policy";
import { isTotpProviderEnabled } from "../server/auth/policy";
import { getFirebaseAdminAuth } from "../server/auth/firebaseAdmin";
import { getDb, getGuardianByUid } from "../server/db";
import type { AppRouter } from "../server/routers";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

function safeErrorCode(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? (error as { code?: unknown }).code : null;
  if (typeof code === "string" && /^[a-zA-Z0-9/_-]{1,80}$/.test(code)) return code.toLowerCase();
  const message = error instanceof Error ? error.message : "";
  return /^[a-z0-9_]{1,80}$/.test(message) ? message : "unexpected_failure";
}

function decodeBase32(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let buffer = 0;
  let bits = 0;
  const bytes: number[] = [];
  for (const char of value.toUpperCase().replace(/=+$/g, "")) {
    const digit = alphabet.indexOf(char);
    if (digit < 0) throw new Error("totp_secret_invalid");
    buffer = (buffer << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

function totpAt(secret: string, timestampMs: number): string {
  const counter = BigInt(Math.floor(timestampMs / 30_000));
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(counter);
  const digest = createHmac("sha1", decodeBase32(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary = ((digest[offset]! & 0x7f) << 24)
    | ((digest[offset + 1]! & 0xff) << 16)
    | ((digest[offset + 2]! & 0xff) << 8)
    | (digest[offset + 3]! & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

async function stableTotp(secret: string): Promise<string> {
  const remaining = 30_000 - (Date.now() % 30_000);
  if (remaining < 8_000) await new Promise((resolve) => setTimeout(resolve, remaining + 400));
  return totpAt(secret, Date.now());
}

function responseSetCookies(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const header = response.headers.get("set-cookie");
  return header ? [header] : [];
}

function namedCookie(headers: string[], name: string): string | null {
  const line = headers.find((value) => value.startsWith(`${name}=`));
  return line ? line.split(";", 1)[0] ?? null : null;
}

function trpcErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const value = error as { data?: { code?: unknown; data?: { code?: unknown } }; shape?: { data?: { code?: unknown } } };
  const code = value.data?.data?.code ?? value.data?.code ?? value.shape?.data?.code;
  return typeof code === "string" ? code : null;
}

async function main() {
  if (process.env.MPV_GUARDIAN_MFA_QA_CONFIRM !== "staging-only" || process.env.NODE_ENV !== "development") {
    throw new Error("explicit_staging_development_confirmation_required");
  }
  if (!process.env.DATABASE_URL || !process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_AUTH_DOMAIN || !process.env.VITE_FIREBASE_PROJECT_ID || !process.env.VITE_FIREBASE_APP_ID || !process.env.VITE_RECAPTCHA_SITE_KEY) {
    throw new Error("staging_configuration_incomplete");
  }
  assert(process.env.FIREBASE_PROJECT_ID === process.env.VITE_FIREBASE_PROJECT_ID, "firebase_project_mismatch");

  const baseUrl = process.env.MPV_GUARDIAN_MFA_BASE_URL ?? `http://127.0.0.1:${process.env.PORT || "3000"}`;
  const base = new URL(baseUrl);
  assert(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "qa_endpoint_must_be_local");
  const origin = base.origin;

  const admin = getFirebaseAdminAuth();
  assert(admin, "firebase_admin_unavailable");
  const projectConfig = await admin.projectConfigManager().getProjectConfig();
  assert(isTotpProviderEnabled(projectConfig.multiFactorConfig), "firebase_totp_provider_not_enabled");

  const db = await getDb();
  assert(db, "development_database_unavailable");
  const currentAdmins = await db.select({ count: sql<number>`COUNT(*)` }).from(guardianAccounts).where(eq(guardianAccounts.role, "admin"));
  if (Number(currentAdmins[0]?.count ?? 0) !== 0) {
    const pool = (db as unknown as { $client?: { end?: () => Promise<void> } }).$client;
    try { await pool?.end?.(); } catch { /* Best-effort close on precondition failure. */ }
    throw new Error("existing_admin_prevents_first_admin_fixture");
  }

  const suffix = randomUUID();
  const guardians = [
    { email: `mpv-qa-admin-${suffix}@example.invalid`, password: randomBytes(32).toString("base64url"), uid: "" },
    { email: `mpv-qa-guardian-${suffix}@example.invalid`, password: randomBytes(32).toString("base64url"), uid: "" },
  ];
  const firebaseUids: string[] = [];
  const guardianIds: number[] = [];
  const profileIds: number[] = [];
  let app: FirebaseApp | null = null;
  let auth: Auth | null = null;
  let checks = 0;
  let completed = false;
  let cleanupOk = true;
  let csrfCookie = "";
  let csrfToken = "";
  let sessionCookieA = "";
  let sessionCookieB = "";

  async function requestCsrf() {
    const response = await fetch(`${origin}/api/auth/csrf`, { headers: { origin } });
    assert(response.ok, "csrf_initialization_failed");
    const body = await response.json() as { csrfToken?: string };
    const cookie = namedCookie(responseSetCookies(response), "mpv_csrf") ?? namedCookie(responseSetCookies(response), "__Host-mpv_csrf");
    assert(body.csrfToken && cookie, "csrf_cookie_missing");
    csrfToken = body.csrfToken;
    csrfCookie = cookie;
  }

  async function authPost(path: "/api/auth/register" | "/api/auth/session", body: Record<string, unknown>) {
    const response = await fetch(`${origin}${path}`, {
      method: "POST",
      headers: { origin, "content-type": "application/json", "x-csrf-token": csrfToken, cookie: csrfCookie },
      body: JSON.stringify(body),
    });
    const setCookies = responseSetCookies(response);
    if (!response.ok) {
      const responseBody = await response.json().catch(() => ({})) as { code?: unknown };
      const code = typeof responseBody.code === "string" && /^[A-Z0-9_]{1,60}$/.test(responseBody.code) ? responseBody.code.toLowerCase() : "rejected";
      throw new Error(`auth_${response.status}_${code}`);
    }
    return { setCookies, body: await response.json().catch(() => ({})) as Record<string, unknown> };
  }

  function makeTrpc(sessionCookie: string) {
    return createTRPCProxyClient<AppRouter>({
      transformer: superjson,
      links: [httpBatchLink({
        url: `${origin}/api/trpc`,
        headers: () => ({ origin, cookie: `${csrfCookie}; ${sessionCookie}`, "x-csrf-token": csrfToken }),
      })],
    });
  }

  async function registerGuardian(credentialUser: { getIdToken: (forceRefresh?: boolean) => Promise<string> }) {
    const result = await authPost("/api/auth/register", {
      idToken: await credentialUser.getIdToken(true),
      guardianAttested: true,
      termsVersion: POLICY_VERSIONS.terms,
      privacyVersion: POLICY_VERSIONS.privacy,
      guardianConsentVersion: POLICY_VERSIONS.guardianConsent,
    });
    assert(result.body.ok === true, "guardian_registration_rejected");
    checks += 1;
  }

  async function createSession(idToken: string): Promise<string> {
    const result = await authPost("/api/auth/session", { idToken });
    const cookies = result.setCookies;
    const sessionCookie = namedCookie(cookies, "mpv_session") ?? namedCookie(cookies, "__Host-mpv_session");
    const attributes = cookies.find((value) => value.startsWith("mpv_session=") || value.startsWith("__Host-mpv_session=")) ?? "";
    assert(sessionCookie && /httponly/i.test(attributes) && /samesite=lax/i.test(attributes) && /path=\//i.test(attributes), "secure_session_cookie_attributes_missing");
    checks += 1;
    return sessionCookie;
  }

  async function loginWithTotp(account: typeof guardians[number], secret: string) {
    assert(auth, "firebase_web_auth_unavailable");
    await signOut(auth).catch(() => undefined);
    let credential: Awaited<ReturnType<typeof signInWithEmailAndPassword>> | null = null;
    let mfaError: unknown;
    try {
      credential = await signInWithEmailAndPassword(auth, account.email, account.password);
    } catch (error) {
      mfaError = error;
    }
    assert(!credential && safeErrorCode(mfaError) === "auth/multi-factor-auth-required", "totp_challenge_not_enforced");
    const resolver = getMultiFactorResolver(auth, mfaError as Parameters<typeof getMultiFactorResolver>[1]);
    const hint = resolver.hints.find((factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID);
    assert(hint, "totp_factor_not_offered");
    const totp = await stableTotp(secret);
    const resolved = await resolver.resolveSignIn(TotpMultiFactorGenerator.assertionForSignIn(hint.uid, totp));
    const idToken = await resolved.user.getIdToken(true);
    const decoded = await admin.verifyIdToken(idToken, true);
    assert(decoded.firebase?.sign_in_second_factor === "totp", "totp_claim_missing");
    checks += 2;
    return { user: resolved.user, idToken };
  }

  try {
    const webConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    };
    app = initializeApp(webConfig, `mpv-mfa-qa-${suffix}`);
    auth = initializeAuth(app, { persistence: inMemoryPersistence });
    await requestCsrf();

    for (const account of guardians) {
      const created = await admin.createUser({ email: account.email, password: account.password, emailVerified: true, displayName: "QA Guardian" });
      account.uid = created.uid;
      firebaseUids.push(created.uid);
    }
    checks += 2;

    const firstLogin = await signInWithEmailAndPassword(auth, guardians[0]!.email, guardians[0]!.password);
    await registerGuardian(firstLogin.user);
    const totpSession = await multiFactor(firstLogin.user).getSession();
    const totpSecret = await TotpMultiFactorGenerator.generateSecret(totpSession);
    const enrollmentCode = await stableTotp(totpSecret.secretKey);
    await multiFactor(firstLogin.user).enroll(TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, enrollmentCode), "QA authenticator");
    const enrolledIdentity = await admin.getUser(guardians[0]!.uid);
    assert((enrolledIdentity.multiFactor?.enrolledFactors ?? []).some((factor) => factor.factorId === "totp"), "totp_enrollment_not_persisted");
    checks += 1;

    const guardianLogin = await loginWithTotp(guardians[0]!, totpSecret.secretKey);
    sessionCookieA = await createSession(guardianLogin.idToken);
    const guardianAccountA = await getGuardianByUid(guardians[0]!.uid);
    assert(guardianAccountA?.role === "guardian" && guardianAccountA.status === "active", "guardian_account_not_provisioned");
    guardianIds.push(guardianAccountA.id);
    const guardianApi = makeTrpc(sessionCookieA);
    const meA = await guardianApi.auth.me.query();
    assert(meA?.loginMethod === "password" && meA.hasTOTP, "guardian_session_not_authenticated");
    checks += 1;

    await signOut(auth);
    const secondLogin = await signInWithEmailAndPassword(auth, guardians[1]!.email, guardians[1]!.password);
    await registerGuardian(secondLogin.user);
    const secondIdToken = await secondLogin.user.getIdToken(true);
    sessionCookieB = await createSession(secondIdToken);
    const guardianAccountB = await getGuardianByUid(guardians[1]!.uid);
    assert(guardianAccountB?.role === "guardian" && guardianAccountB.status === "active", "second_guardian_not_provisioned");
    guardianIds.push(guardianAccountB.id);
    const secondApi = makeTrpc(sessionCookieB);
    const meB = await secondApi.auth.me.query();
    assert(meB?.role === "guardian", "second_guardian_session_not_authenticated");
    checks += 1;

    const profileA = await guardianApi.profiles.create.mutate({ nickname: "QA Flor", avatarId: "menina-creme" });
    const profileB = await secondApi.profiles.create.mutate({ nickname: "QA Bigode", avatarId: "menino-cinza" });
    profileIds.push(profileA.id, profileB.id);
    const listedB = await secondApi.profiles.list.query();
    assert(listedB.length === 1 && listedB[0]?.id === profileB.id, "profile_list_cross_owner_leak");
    let crossOwnerCode: string | null = null;
    try {
      await secondApi.profiles.update.mutate({ profileId: profileA.id, nickname: "QA invasor", avatarId: "menino-cinza" });
    } catch (error) {
      crossOwnerCode = trpcErrorCode(error);
    }
    assert(crossOwnerCode === "NOT_FOUND", "cross_owner_profile_update_not_blocked");
    checks += 2;

    const deletionRequest = await guardianApi.profiles.requestDeletion.mutate({ profileId: profileA.id });
    assert(deletionRequest.status === "deletion_requested", "guardian_profile_deletion_request_failed");
    checks += 1;

    const bootstrap = spawnSync("pnpm", ["admin:bootstrap"], {
      cwd: process.cwd(),
      env: { ...process.env, INITIAL_ADMIN_EMAIL: guardians[0]!.email },
      encoding: "utf8",
      timeout: 90_000,
    });
    assert(bootstrap.status === 0, "first_admin_bootstrap_command_failed");
    const promoted = await getGuardianByUid(guardians[0]!.uid);
    assert(promoted?.role === "admin", "first_admin_bootstrap_not_persisted");
    checks += 1;

    const adminLogin = await loginWithTotp(guardians[0]!, totpSecret.secretKey);
    sessionCookieA = await createSession(adminLogin.idToken);
    const adminApi = makeTrpc(sessionCookieA);
    const adminMe = await adminApi.auth.me.query();
    assert(adminMe?.role === "admin" && adminMe.hasTOTP, "admin_totp_session_not_accepted");
    const overview = await adminApi.admin.overview.query();
    assert(Number.isFinite(overview.guardians) && overview.guardians >= 2, "admin_overview_not_available");
    checks += 2;

    const erased = await adminApi.admin.fulfillProfileDeletion.mutate({
      profileId: profileA.id,
      confirmation: `EXCLUIR PERFIL ${profileA.id}`,
    });
    assert(erased.ok, "admin_profile_erasure_failed");
    const erasedRows = await db.select({ id: childProfiles.id }).from(childProfiles).where(eq(childProfiles.id, profileA.id)).limit(1);
    assert(erasedRows.length === 0, "profile_data_not_erased");
    checks += 2;
    completed = true;
  } finally {
    try {
      const fixtureGuardianRows = firebaseUids.length
        ? await db.select({ id: guardianAccounts.id }).from(guardianAccounts).where(inArray(guardianAccounts.firebaseUid, firebaseUids))
        : [];
      const cleanupGuardianIds = [...new Set([...guardianIds, ...fixtureGuardianRows.map((row) => row.id)])];
      if (cleanupGuardianIds.length) {
        const ownedProfiles = await db.select({ id: childProfiles.id }).from(childProfiles).where(inArray(childProfiles.guardianId, cleanupGuardianIds));
        const cleanupProfileIds = [...new Set([...profileIds, ...ownedProfiles.map((row) => row.id)])];
        const auditWhere = cleanupProfileIds.length
          ? or(inArray(adminAuditEvents.actorGuardianId, cleanupGuardianIds), inArray(adminAuditEvents.targetGuardianId, cleanupGuardianIds), inArray(adminAuditEvents.targetProfileId, cleanupProfileIds))
          : or(inArray(adminAuditEvents.actorGuardianId, cleanupGuardianIds), inArray(adminAuditEvents.targetGuardianId, cleanupGuardianIds));
        if (auditWhere) await db.delete(adminAuditEvents).where(auditWhere);
        await db.delete(authSessions).where(inArray(authSessions.guardianId, cleanupGuardianIds));
        await db.delete(noticeAcknowledgements).where(inArray(noticeAcknowledgements.guardianId, cleanupGuardianIds));
        await db.delete(securityEvents).where(inArray(securityEvents.guardianId, cleanupGuardianIds));
        await db.delete(childProfiles).where(inArray(childProfiles.guardianId, cleanupGuardianIds));
        await db.delete(guardianAccounts).where(inArray(guardianAccounts.id, cleanupGuardianIds));
      }
      if (firebaseUids.length) {
        const remaining = await db.select({ id: guardianAccounts.id }).from(guardianAccounts).where(inArray(guardianAccounts.firebaseUid, firebaseUids)).limit(1);
        if (remaining.length) cleanupOk = false;
      }
    } catch {
      cleanupOk = false;
      console.error("MFA QA cleanup warning: database fixture cleanup needs operator review.");
    }
    for (const uid of firebaseUids) {
      try { await admin.deleteUser(uid); } catch { cleanupOk = false; console.error("MFA QA cleanup warning: a synthetic Firebase identity could not be removed."); }
    }
    if (auth) await signOut(auth).catch(() => undefined);
    if (app) await deleteApp(app).catch(() => undefined);
    const pool = (db as unknown as { $client?: { end?: () => Promise<void> } }).$client;
    try { await pool?.end?.(); } catch { /* Best-effort close without leaking connection details. */ }
  }
  if (!cleanupOk) throw new Error("fixture_cleanup_failed");
  if (completed) console.log(JSON.stringify({ ok: true, checks, totpEnrollment: true, totpChallengeAndClaim: true, firstAdminBootstrap: true, adminTotpSession: true, crossGuardianProfileIsolation: true, profileDeletionRequestAndErasure: true, syntheticAccounts: 2, cleanup: "completed" }));
}

main().catch((error: unknown) => {
  console.error(`Guardian MFA QA failed (${safeErrorCode(error)}).`);
  process.exitCode = 1;
});
