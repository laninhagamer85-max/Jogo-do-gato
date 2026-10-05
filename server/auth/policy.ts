import { timingSafeEqual } from "node:crypto";

export const SESSION_TTL_MS = 5 * 24 * 60 * 60 * 1000;
export const FRESH_AUTH_MAX_AGE_SECONDS = 5 * 60;

export type SupportedProvider = "password" | "google";

export function isSupportedProvider(provider: unknown): provider is "password" | "google.com" {
  return provider === "password" || provider === "google.com";
}

export function toLoginMethod(provider: "password" | "google.com"): SupportedProvider {
  return provider === "google.com" ? "google" : "password";
}

export function isTotpMfaVerified(secondFactor: unknown): boolean {
  return secondFactor === "totp";
}

export function isTotpProviderEnabled(config: unknown): boolean {
  if (!config || typeof config !== "object") return false;
  const value = config as {
    state?: unknown;
    providerConfigs?: Array<{ state?: unknown; totpProviderConfig?: unknown }>;
  };
  return value.state === "ENABLED"
    && Array.isArray(value.providerConfigs)
    && value.providerConfigs.some((provider) => provider?.state === "ENABLED" && Boolean(provider.totpProviderConfig));
}

export function hasRecentAuthentication(authTimeSeconds: number, nowMs = Date.now(), maxAgeSeconds = FRESH_AUTH_MAX_AGE_SECONDS): boolean {
  const ageSeconds = Math.floor(nowMs / 1000) - Math.floor(authTimeSeconds);
  return Number.isFinite(ageSeconds) && ageSeconds >= 0 && ageSeconds <= maxAgeSeconds;
}

export function constantTimeEqual(left: string | undefined, right: string | undefined): boolean {
  if (!left || !right) return false;
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isSameOrigin(requestOrigin: string | undefined, expectedOrigin: string): boolean {
  if (!requestOrigin) return false;
  try {
    const actual = new URL(requestOrigin);
    const expected = new URL(expectedOrigin);
    return actual.origin === expected.origin;
  } catch {
    return false;
  }
}

export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.toLowerCase().split("@");
  if (!domain) return "••••";
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(3, Math.min(8, local.length - visible.length)))}@${domain}`;
}

export function isBoundedJsonString(value: unknown, maxChars = 400_000): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxChars;
}

export type FirstAdminBootstrapFailure = "admin_already_exists" | "guardian_unavailable" | "email_unverified" | "totp_required" | "notices_not_current";

export function firstAdminBootstrapFailure(input: {
  hasExistingAdmin: boolean;
  guardianExists: boolean;
  guardianActive: boolean;
  emailVerified: boolean;
  totpEnabled: boolean;
  noticesCurrent: boolean;
}): FirstAdminBootstrapFailure | null {
  if (input.hasExistingAdmin) return "admin_already_exists";
  if (!input.guardianExists || !input.guardianActive) return "guardian_unavailable";
  if (!input.emailVerified) return "email_unverified";
  if (!input.totpEnabled) return "totp_required";
  if (!input.noticesCurrent) return "notices_not_current";
  return null;
}
