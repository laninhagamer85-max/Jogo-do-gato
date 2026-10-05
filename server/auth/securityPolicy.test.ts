import { describe, expect, it } from "vitest";
import { getConnectSrc, getCrossOriginOpenerPolicy, getScriptSrc } from "./securityPolicy";

describe("Cross-Origin-Opener-Policy for OAuth", () => {
  it("allows cross-origin sign-in popups while retaining same-origin isolation for normal documents", () => {
    expect(getCrossOriginOpenerPolicy()).toBe("same-origin-allow-popups");
    expect(getCrossOriginOpenerPolicy()).not.toBe("unsafe-none");
  });
});

describe("Content Security Policy connect-src", () => {
  it("allows the Firebase App Check token exchange endpoint without broad network wildcards", () => {
    const sources = getConnectSrc(false);
    expect(sources).toContain("https://firebaseappcheck.googleapis.com");
    expect(sources).toContain("https://content-firebaseappcheck.googleapis.com");
    expect(sources).toContain("https://www.google.com/recaptcha/");
    expect(sources).not.toContain("https:");
    expect(sources).not.toContain("*");
    expect(sources).not.toContain("ws:");
    expect(sources).not.toContain("wss:");
  });

  it("adds only the HMR websocket schemes in development", () => {
    const sources = getConnectSrc(true);
    expect(sources).toContain("ws:");
    expect(sources).toContain("wss:");
    expect(sources).toContain("https://content-firebaseappcheck.googleapis.com");
  });
});

describe("Content Security Policy script-src", () => {
  it("allows only the Google API script path required by Firebase OAuth", () => {
    const sources = getScriptSrc(false);
    expect(sources).toContain("https://apis.google.com/js/");
    expect(sources).toContain("https://apis.google.com/_/scs/");
    expect(sources).not.toContain("https://apis.google.com");
    expect(sources).not.toContain("https:");
    expect(sources).toContain("https://www.google.com/recaptcha/");
  });

  it("keeps development-only inline/eval allowances out of production", () => {
    expect(getScriptSrc(false)).not.toContain("'unsafe-inline'");
    expect(getScriptSrc(false)).not.toContain("'unsafe-eval'");
    expect(getScriptSrc(true)).toContain("'unsafe-inline'");
    expect(getScriptSrc(true)).toContain("'unsafe-eval'");
  });
});
