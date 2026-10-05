import { describe, expect, it } from "vitest";
import { POLICY_VERSIONS } from "../../shared/policy";
import { gameSaveSchema, profileCreateSchema, registerSchema } from "./validators";
import { constantTimeEqual, firstAdminBootstrapFailure, hasRecentAuthentication, isSameOrigin, isSupportedProvider, isTotpMfaVerified, isTotpProviderEnabled, maskEmail, toLoginMethod } from "./policy";

describe("guardian identity policy", () => {
  it("accepts only the two explicitly supported Firebase providers and never maps provider email to a shared account", () => {
    expect(isSupportedProvider("password")).toBe(true);
    expect(isSupportedProvider("google.com")).toBe(true);
    expect(isSupportedProvider("apple.com")).toBe(false);
    expect(toLoginMethod("password")).toBe("password");
    expect(toLoginMethod("google.com")).toBe("google");
  });

  it("recognizes only a verified TOTP second factor and bounds fresh authentication", () => {
    expect(isTotpMfaVerified("totp")).toBe(true);
    expect(isTotpMfaVerified("phone")).toBe(false);
    const now = 1_800_000_000_000;
    expect(hasRecentAuthentication(now / 1000 - 299, now)).toBe(true);
    expect(hasRecentAuthentication(now / 1000 - 301, now)).toBe(false);
    expect(hasRecentAuthentication(now / 1000 + 1, now)).toBe(false);
  });

  it("allows MFA QA only when both the project and TOTP provider are enabled", () => {
    expect(isTotpProviderEnabled(undefined)).toBe(false);
    expect(isTotpProviderEnabled({ state: "DISABLED", providerConfigs: [{ state: "ENABLED", totpProviderConfig: {} }] })).toBe(false);
    expect(isTotpProviderEnabled({ state: "ENABLED", providerConfigs: [{ state: "DISABLED", totpProviderConfig: {} }] })).toBe(false);
    expect(isTotpProviderEnabled({ state: "ENABLED", providerConfigs: [{ state: "ENABLED" }] })).toBe(false);
    expect(isTotpProviderEnabled({ state: "ENABLED", providerConfigs: [{ state: "ENABLED", totpProviderConfig: { adjacentIntervals: 1 } }] })).toBe(true);
  });

  it("accepts same-origin writes only and compares CSRF tokens without accepting missing values", () => {
    expect(isSameOrigin("https://pets.example.test", "https://pets.example.test/api")).toBe(true);
    expect(isSameOrigin("https://evil.example.test", "https://pets.example.test")).toBe(false);
    expect(isSameOrigin(undefined, "https://pets.example.test")).toBe(false);
    expect(constantTimeEqual("same-token", "same-token")).toBe(true);
    expect(constantTimeEqual("same-token", "different-token")).toBe(false);
    expect(constantTimeEqual(undefined, "same-token")).toBe(false);
  });

  it("masks guardian e-mail in administrative lists", () => {
    expect(maskEmail("responsavel@example.test")).toMatch(/^re••+@example\.test$/);
    expect(maskEmail("bad-address")).toBe("••••");
  });

  it("fails closed when bootstrapping the first admin unless every prerequisite is satisfied", () => {
    const eligible = { hasExistingAdmin: false, guardianExists: true, guardianActive: true, emailVerified: true, totpEnabled: true, noticesCurrent: true };
    expect(firstAdminBootstrapFailure(eligible)).toBeNull();
    expect(firstAdminBootstrapFailure({ ...eligible, hasExistingAdmin: true })).toBe("admin_already_exists");
    expect(firstAdminBootstrapFailure({ ...eligible, guardianActive: false })).toBe("guardian_unavailable");
    expect(firstAdminBootstrapFailure({ ...eligible, emailVerified: false })).toBe("email_unverified");
    expect(firstAdminBootstrapFailure({ ...eligible, totpEnabled: false })).toBe("totp_required");
    expect(firstAdminBootstrapFailure({ ...eligible, noticesCurrent: false })).toBe("notices_not_current");
  });
});

describe("guardian data validation", () => {
  it("requires parental acknowledgement of the exact current draft notice versions", () => {
    const valid = registerSchema.safeParse({
      idToken: "x".repeat(120),
      guardianAttested: true,
      termsVersion: POLICY_VERSIONS.terms,
      privacyVersion: POLICY_VERSIONS.privacy,
      guardianConsentVersion: POLICY_VERSIONS.guardianConsent,
    });
    expect(valid.success).toBe(true);
    const stale = registerSchema.safeParse({
      idToken: "x".repeat(120),
      guardianAttested: true,
      termsVersion: "old-version",
      privacyVersion: POLICY_VERSIONS.privacy,
      guardianConsentVersion: POLICY_VERSIONS.guardianConsent,
    });
    expect(stale.success).toBe(false);
  });

  it("stores only a nickname/avatar in a child profile, rejecting identifiers and extra fields", () => {
    expect(profileCreateSchema.safeParse({ nickname: "Pudim", avatarId: "menina-creme" }).success).toBe(true);
    expect(profileCreateSchema.safeParse({ nickname: "Allana", avatarId: "menina-creme", birthDate: "2015-01-01" }).success).toBe(false);
    expect(profileCreateSchema.safeParse({ nickname: "Nome <script>", avatarId: "menina-creme" }).success).toBe(false);
    expect(profileCreateSchema.safeParse({ nickname: "", avatarId: "menina-creme" }).success).toBe(false);
  });

  it("bounds cloud saves and requires a positive server-selected profile id and integer revision", () => {
    const smallState = JSON.stringify({ level: 1 });
    expect(gameSaveSchema.safeParse({ profileId: 3, revision: 0, stateJson: smallState }).success).toBe(true);
    expect(gameSaveSchema.safeParse({ profileId: 0, revision: 0, stateJson: smallState }).success).toBe(false);
    expect(gameSaveSchema.safeParse({ profileId: 3, revision: -1, stateJson: smallState }).success).toBe(false);
    expect(gameSaveSchema.safeParse({ profileId: 3, revision: 0, stateJson: "x".repeat(400_001) }).success).toBe(false);
  });
});
