import { describe, expect, it } from "vitest";
import { CANONICAL_SITE_HOST, CANONICAL_SITE_ORIGIN, getCanonicalRedirectUrl, shouldNoIndex } from "./siteRouting";

describe("canonical site routing", () => {
  it("keeps the official host unchanged in production", () => {
    expect(getCanonicalRedirectUrl(CANONICAL_SITE_HOST, "/guardian", true)).toBeNull();
    expect(getCanonicalRedirectUrl(`${CANONICAL_SITE_HOST}.`, "/", true)).toBeNull();
  });

  it("redirects alternate production hosts while preserving path and query", () => {
    expect(getCanonicalRedirectUrl("old-preview.example", "/guardian?from=old", true)).toBe(
      `${CANONICAL_SITE_ORIGIN}/guardian?from=old`,
    );
  });

  it("uses a destination-specific official origin when configured", () => {
    expect(getCanonicalRedirectUrl("old-preview.example", "/guardian", true, "https://new-official.example")).toBe(
      "https://new-official.example/guardian",
    );
  });

  it("refuses invalid or insecure canonical origins", () => {
    expect(getCanonicalRedirectUrl("old-preview.example", "/", true, "javascript:alert(1)")).toBeNull();
    expect(getCanonicalRedirectUrl("old-preview.example", "/", true, "https://user:pass@example.com")).toBeNull();
  });

  it("does not redirect development previews and marks them non-indexable", () => {
    expect(getCanonicalRedirectUrl("3000-preview.manus.computer", "/", false)).toBeNull();
    expect(shouldNoIndex(false)).toBe(true);
    expect(shouldNoIndex(true)).toBe(false);
  });

  it("does not turn protocol-relative request targets into open redirects", () => {
    expect(getCanonicalRedirectUrl("old-preview.example", "//attacker.example/path", true)).toBe(
      `${CANONICAL_SITE_ORIGIN}/`,
    );
  });
});
