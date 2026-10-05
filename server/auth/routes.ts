import { createHash, randomUUID } from "node:crypto";
import { Router, type Express, type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { and, eq, isNull } from "drizzle-orm";
import { authSessions } from "../../drizzle/schema";
import { registerSchema, sessionSchema } from "./validators";
import { getFirebaseAdminAuth } from "./firebaseAdmin";
import { clearSessionCookies, issueCsrfToken, readSessionCookie, setSessionCookie, verifyCsrfRequest } from "./cookies";
import { hasRecentAuthentication, isSupportedProvider, SESSION_TTL_MS, toLoginMethod } from "./policy";
import { acceptCurrentNotices, createAuthSession, ensureGuardianAccount, getGuardianByUid, recordSecurityEvent, revokeAuthSession, getDb } from "../db";

function jsonNoStore(res: Response) {
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Pragma", "no-cache");
}

function csrfGuard(req: Request, res: Response, next: NextFunction) {
  if (!verifyCsrfRequest(req)) {
    res.status(403).json({ code: "CSRF_REJECTED", message: "A solicitação não pôde ser validada." });
    return;
  }
  next();
}

function safeDeviceType(userAgent: string | undefined): "desktop" | "mobile" | "tablet" | "unknown" {
  if (!userAgent) return "unknown";
  if (/ipad|tablet|kindle/i.test(userAgent)) return "tablet";
  if (/mobile|android|iphone|ipod/i.test(userAgent)) return "mobile";
  return "desktop";
}

function safeUnavailable(res: Response) {
  jsonNoStore(res);
  res.status(503).json({ code: "IDENTITY_NOT_CONFIGURED", message: "O acesso das contas ainda não foi habilitado neste ambiente." });
}

export function registerAuthRoutes(app: Express) {
  const authRouter = Router();
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { code: "RATE_LIMITED", message: "Muitas tentativas. Aguarde antes de tentar novamente." },
  });
  authRouter.use(authLimiter);
  authRouter.get("/csrf", (req, res) => {
    jsonNoStore(res);
    const csrfToken = issueCsrfToken(req, res);
    res.status(200).json({ csrfToken });
  });

  authRouter.post("/register", csrfGuard, async (req, res) => {
    jsonNoStore(res);
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: "INVALID_REGISTRATION", message: "Revise os dados e os avisos da conta." });
      return;
    }
    const auth = getFirebaseAdminAuth();
    if (!auth) return safeUnavailable(res);

    try {
      const decoded = await auth.verifyIdToken(parsed.data.idToken, true);
      const provider = decoded.firebase?.sign_in_provider;
      if (provider !== "password" || !decoded.email || !hasRecentAuthentication(Number(decoded.auth_time ?? 0))) {
        await recordSecurityEvent({ eventType: "registration_rejected", outcome: "blocked", safeCode: "identity_requirements" });
        res.status(403).json({ code: "REGISTRATION_REJECTED", message: "Não foi possível concluir o cadastro com estes dados." });
        return;
      }
      const account = await ensureGuardianAccount({
        firebaseUid: decoded.uid,
        email: decoded.email,
        loginMethod: "password",
        emailVerified: decoded.email_verified === true,
      });
      if (!account || account.status === "suspended" || account.status === "deletion_requested") {
        await recordSecurityEvent({ guardianId: account?.id, eventType: "registration_rejected", outcome: "blocked", safeCode: "account_status" });
        res.status(403).json({ code: "REGISTRATION_REJECTED", message: "Não foi possível concluir o cadastro com estes dados." });
        return;
      }
      await acceptCurrentNotices(account.id);
      await recordSecurityEvent({ guardianId: account.id, eventType: "registration_started", outcome: "success", safeCode: "email_verification_required" });
      res.status(200).json({ ok: true, emailVerificationRequired: decoded.email_verified !== true });
    } catch {
      await recordSecurityEvent({ eventType: "registration_rejected", outcome: "failure", safeCode: "identity_verification_failed" });
      res.status(401).json({ code: "REGISTRATION_REJECTED", message: "Não foi possível concluir o cadastro com estes dados." });
    }
  });

  authRouter.post("/session", csrfGuard, async (req, res) => {
    jsonNoStore(res);
    const parsed = sessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: "INVALID_SESSION", message: "A sessão não pôde ser iniciada." });
      return;
    }
    const auth = getFirebaseAdminAuth();
    if (!auth) return safeUnavailable(res);

    try {
      const decoded = await auth.verifyIdToken(parsed.data.idToken, true);
      const provider = decoded.firebase?.sign_in_provider;
      if (!isSupportedProvider(provider) || !decoded.email || decoded.email_verified !== true || !hasRecentAuthentication(Number(decoded.auth_time ?? 0))) {
        await recordSecurityEvent({ eventType: "session_rejected", outcome: "blocked", safeCode: "identity_requirements" });
        res.status(403).json({ code: "SESSION_REJECTED", message: "Confirme o e-mail e entre novamente para continuar." });
        return;
      }
      const firebaseUser = await auth.getUser(decoded.uid);
      if (firebaseUser.disabled) {
        await recordSecurityEvent({ eventType: "session_rejected", outcome: "blocked", safeCode: "account_disabled" });
        res.status(403).json({ code: "SESSION_REJECTED", message: "Esta conta não pode iniciar uma sessão." });
        return;
      }
      const account = await ensureGuardianAccount({
        firebaseUid: decoded.uid,
        email: decoded.email,
        loginMethod: toLoginMethod(provider),
        emailVerified: true,
      });
      if (!account || account.status !== "active") {
        await recordSecurityEvent({ guardianId: account?.id, eventType: "session_rejected", outcome: "blocked", safeCode: "account_status" });
        res.status(403).json({ code: "SESSION_REJECTED", message: "Esta conta não pode iniciar uma sessão." });
        return;
      }
      const secondFactor = decoded.firebase?.sign_in_second_factor ?? null;
      if (account.role === "admin" && (secondFactor !== "totp" || !(firebaseUser.multiFactor?.enrolledFactors ?? []).some((factor) => factor.factorId === "totp"))) {
        await recordSecurityEvent({ guardianId: account.id, eventType: "admin_session_rejected", outcome: "blocked", safeCode: "totp_required" });
        res.status(403).json({ code: "MFA_REQUIRED", message: "Esta conta administrativa exige autenticação por aplicativo autenticador." });
        return;
      }

      const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, { expiresIn: SESSION_TTL_MS });
      const sessionId = randomUUID();
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      const tokenHash = createHash("sha256").update(sessionCookie).digest("hex");
      await createAuthSession({
        sessionId,
        guardianId: account.id,
        tokenHash,
        deviceType: safeDeviceType(req.get("user-agent")),
        expiresAt,
      });
      setSessionCookie(req, res, sessionCookie);
      await recordSecurityEvent({ guardianId: account.id, eventType: "session_created", outcome: "success", safeCode: secondFactor === "totp" ? "totp" : "single_factor" });
      res.status(200).json({ ok: true });
    } catch {
      await recordSecurityEvent({ eventType: "session_rejected", outcome: "failure", safeCode: "identity_verification_failed" });
      res.status(401).json({ code: "SESSION_REJECTED", message: "A sessão não pôde ser iniciada. Entre novamente." });
    }
  });

  authRouter.post("/logout", csrfGuard, async (req, res) => {
    jsonNoStore(res);
    const token = readSessionCookie(req);
    if (token) {
      const auth = getFirebaseAdminAuth();
      if (auth) {
        try {
          const decoded = await auth.verifySessionCookie(token, false);
          const account = await getGuardianByUid(decoded.uid);
          if (account) {
            const tokenHash = createHash("sha256").update(token).digest("hex");
            const db = await getDb();
            if (db) {
              const rows = await db.select({ sessionId: authSessions.sessionId }).from(authSessions).where(and(eq(authSessions.guardianId, account.id), eq(authSessions.tokenHash, tokenHash), isNull(authSessions.revokedAt))).limit(1);
              if (rows[0]) await revokeAuthSession(account.id, rows[0].sessionId);
            }
          }
        } catch {
          // Invalid or expired cookies are still cleared below.
        }
      }
    }
    clearSessionCookies(res);
    res.status(200).json({ ok: true });
  });

  app.use("/api/auth", authRouter);
}
