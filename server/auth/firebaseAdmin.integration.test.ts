import { describe, expect, it } from "vitest";
import { getFirebaseAdminAuth } from "./firebaseAdmin";

describe("Firebase Admin staging credential", () => {
  it("authenticates a read-only Firebase Identity Platform API request", async () => {
    const auth = getFirebaseAdminAuth();
    expect(auth).not.toBeNull();

    let userCount: number;
    try {
      const result = await auth!.listUsers(1);
      userCount = result.users.length;
    } catch {
      throw new Error("Firebase Admin API credential check failed; credential and response details intentionally omitted.");
    }
    expect(userCount).toBeLessThanOrEqual(1);
  }, 30_000);
});
