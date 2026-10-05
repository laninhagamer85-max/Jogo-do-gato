import { randomBytes } from "node:crypto";
import { parse } from "cookie";
import type { Request, Response } from "express";
import { constantTimeEqual, isSameOrigin, SESSION_TTL_MS } from "./policy";

const SECURE_SESSION_COOKIE = "__Host-mpv_session";
const LOCAL_SESSION_COOKIE = "mpv_session";
const SECURE_CSRF_COOKIE = "__Host-mpv_csrf";
const LOCAL_CSRF_COOKIE = "mpv_csrf";

export function requestUsesHttps(req: Request): boolean {
  return req.secure || process.env.NODE_ENV === "production";
}

export function sessionCookieName(req: Request): string {
  return requestUsesHttps(req) ? SECURE_SESSION_COOKIE : LOCAL_SESSION_COOKIE;
}

export function csrfCookieName(req: Request): string {
  return requestUsesHttps(req) ? SECURE_CSRF_COOKIE : LOCAL_CSRF_COOKIE;
}

export function readCookies(req: Request): Record<string, string | undefined> {
  return parse(req.headers.cookie ?? "");
}

export function readSessionCookie(req: Request): string | null {
  const cookies = readCookies(req);
  return requestUsesHttps(req) ? cookies[SECURE_SESSION_COOKIE] ?? null : cookies[LOCAL_SESSION_COOKIE] ?? null;
}

export function setSessionCookie(req: Request, res: Response, token: string): void {
  const secure = requestUsesHttps(req);
  res.cookie(sessionCookieName(req), token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  });
  if (secure) res.clearCookie(LOCAL_SESSION_COOKIE, { path: "/" });
}

export function clearSessionCookies(res: Response): void {
  for (const name of [SECURE_SESSION_COOKIE, LOCAL_SESSION_COOKIE]) {
    res.clearCookie(name, { httpOnly: true, secure: name.startsWith("__Host-"), sameSite: "lax", path: "/" });
  }
}

export function issueCsrfToken(req: Request, res: Response): string {
  const token = randomBytes(32).toString("base64url");
  const secure = requestUsesHttps(req);
  res.cookie(csrfCookieName(req), token, {
    httpOnly: false,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 12 * 60 * 60 * 1000,
  });
  return token;
}

export function verifyCsrfRequest(req: Request): boolean {
  const cookies = readCookies(req);
  const cookieToken = cookies[csrfCookieName(req)];
  const headerToken = req.get("x-csrf-token");
  const host = req.get("host");
  if (!host) return false;
  const expectedOrigin = `${req.protocol}://${host}`;
  return isSameOrigin(req.get("origin"), expectedOrigin) && constantTimeEqual(cookieToken, headerToken);
}

export function getRequestOrigin(req: Request): string | null {
  const host = req.get("host");
  return host ? `${req.protocol}://${host}` : null;
}
