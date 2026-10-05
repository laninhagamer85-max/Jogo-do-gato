import { describe, expect, it } from "vitest";
import { canAccessGameProfile } from "./gameAccess";

describe("canAccessGameProfile", () => {
  const ownedProfiles = [11, 22];
  const activeGuardian = { status: "active", needsConsent: false };

  it("blocks guests and accounts requiring current notices", () => {
    expect(canAccessGameProfile(null, 11, ownedProfiles)).toBe(false);
    expect(canAccessGameProfile({ status: "active", needsConsent: true }, 11, ownedProfiles)).toBe(false);
  });

  it("blocks suspended/deletion-requested accounts and invalid profile ids", () => {
    expect(canAccessGameProfile({ status: "suspended", needsConsent: false }, 11, ownedProfiles)).toBe(false);
    expect(canAccessGameProfile({ status: "deletion_requested", needsConsent: false }, 11, ownedProfiles)).toBe(false);
    expect(canAccessGameProfile(activeGuardian, 0, ownedProfiles)).toBe(false);
    expect(canAccessGameProfile(activeGuardian, Number.NaN, ownedProfiles)).toBe(false);
  });

  it("allows only an active guardian's listed profile", () => {
    expect(canAccessGameProfile(activeGuardian, 22, ownedProfiles)).toBe(true);
    expect(canAccessGameProfile(activeGuardian, 33, ownedProfiles)).toBe(false);
  });
});
