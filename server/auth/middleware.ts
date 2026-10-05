import type { NextFunction, Request, Response } from "express";
import { getFirebaseAdminAppCheck } from "./firebaseAdmin";
import { verifyCsrfRequest } from "./cookies";

export async function firebaseAppCheckGuard(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "production" && process.env.FIREBASE_APP_CHECK_REQUIRED !== "true") return next();
  const appCheck = getFirebaseAdminAppCheck();
  const token = req.get("x-firebase-appcheck");
  if (!appCheck || !token) {
    res.status(403).json({ code: "APP_CHECK_REQUIRED", message: "A verificação de integridade do aplicativo não foi aprovada." });
    return;
  }
  try {
    await appCheck.verifyToken(token);
    next();
  } catch {
    res.status(403).json({ code: "APP_CHECK_REJECTED", message: "A verificação de integridade do aplicativo não foi aprovada." });
  }
}

export function trpcCsrfGuard(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  if (!verifyCsrfRequest(req)) {
    res.status(403).json({ error: { json: { message: "A solicitação não pôde ser validada.", code: -32003, data: { code: "FORBIDDEN", httpStatus: 403, path: req.path } } } });
    return;
  }
  next();
}
