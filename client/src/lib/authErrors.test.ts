import { describe, expect, it } from "vitest";
import { authErrorCode, guardianAuthErrorMessage, isActionableResetError, needsGoogleEmailVerification } from "./authErrors";

describe("guardian authentication error UX", () => {
  it("requests email verification only for unverified Google identities", () => {
    expect(needsGoogleEmailVerification("google.com", false)).toBe(true);
    expect(needsGoogleEmailVerification("google.com", true)).toBe(false);
    expect(needsGoogleEmailVerification("password", false)).toBe(false);
    expect(needsGoogleEmailVerification(null, false)).toBe(false);
  });

  it("explains provider, authorized-domain, popup, network, and session configuration failures", () => {
    expect(guardianAuthErrorMessage({ code: "auth/operation-not-allowed" })).toContain("está desativado");
    expect(guardianAuthErrorMessage({ code: "auth/unauthorized-domain" })).toContain("Domínios autorizados");
    expect(guardianAuthErrorMessage({ code: "auth/popup-blocked" })).toContain("Permita pop-ups");
    expect(guardianAuthErrorMessage({ code: "auth/network-request-failed" })).toContain("conexão");
    expect(guardianAuthErrorMessage({ code: "SESSION_REJECTED" })).toContain("servidor não aceitou");
  });

  it("keeps credential and account-existence errors generic while honoring the no-linking policy", () => {
    expect(guardianAuthErrorMessage({ code: "auth/wrong-password" })).toBe(guardianAuthErrorMessage({ code: "auth/user-not-found" }));
    expect(guardianAuthErrorMessage({ code: "auth/account-exists-with-different-credential" })).toContain("não vincula contas automaticamente");
    expect(guardianAuthErrorMessage(new Error("unknown"))).toContain("Confira os dados");
    expect(authErrorCode({ code: 4 })).toBeNull();
  });

  it("shows actionable setup failures for reset, but not whether an address exists", () => {
    expect(isActionableResetError({ code: "auth/operation-not-allowed" })).toBe(true);
    expect(isActionableResetError({ code: "auth/unauthorized-domain" })).toBe(true);
    expect(isActionableResetError({ code: "auth/user-not-found" })).toBe(false);
    expect(isActionableResetError({ code: "auth/invalid-email" })).toBe(false);
  });
});
