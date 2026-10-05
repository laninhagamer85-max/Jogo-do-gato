import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { readFirebaseAdminConfig } from "./firebaseAdmin";

const emptyEnv = {
  FIREBASE_PROJECT_ID: "",
  FIREBASE_ADMIN_CLIENT_EMAIL: "",
  FIREBASE_ADMIN_PRIVATE_KEY: "",
};

const testPrivateKey = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
}).privateKey;

describe("explicit Firebase Admin configuration", () => {
  it("fails closed when any required server setting is absent", () => {
    expect(readFirebaseAdminConfig(emptyEnv)).toBeNull();
    expect(readFirebaseAdminConfig({ ...emptyEnv, FIREBASE_PROJECT_ID: "staging-project" })).toBeNull();
  });

  it("normalizes escaped PEM newlines and validates the key without logging it", () => {
    const escaped = testPrivateKey.replace(/\n/g, "\\n");
    const config = readFirebaseAdminConfig({
      FIREBASE_PROJECT_ID: "staging-project",
      FIREBASE_ADMIN_CLIENT_EMAIL: "firebase-admin@staging-project.iam.gserviceaccount.com",
      FIREBASE_ADMIN_PRIVATE_KEY: escaped,
    });
    expect(config?.projectId).toBe("staging-project");
    expect(config?.clientEmail).toContain("@staging-project.iam.gserviceaccount.com");
    expect(config?.privateKey).toBe(testPrivateKey);
  });

  it("rejects malformed private-key material", () => {
    expect(readFirebaseAdminConfig({
      FIREBASE_PROJECT_ID: "staging-project",
      FIREBASE_ADMIN_CLIENT_EMAIL: "firebase-admin@staging-project.iam.gserviceaccount.com",
      FIREBASE_ADMIN_PRIVATE_KEY: "not-a-private-key",
    })).toBeNull();
  });

  it("validates any project credentials configured in the protected environment without printing them", () => {
    const names = ["FIREBASE_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY"] as const;
    const presentCount = names.filter((name) => Boolean(process.env[name])).length;
    if (presentCount > 0) {
      expect(presentCount).toBe(names.length);
      expect(readFirebaseAdminConfig(process.env)).not.toBeNull();
    }
  });
});
