import "dotenv/config";
import { getFirebaseAdminAuth } from "../server/auth/firebaseAdmin";
import { bootstrapFirstAdmin, getDb } from "../server/db";

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("bootstrap_configuration_missing");
  }

  const auth = getFirebaseAdminAuth();
  if (!auth) throw new Error("firebase_admin_unavailable");
  const identity = await auth.getUserByEmail(email).catch(() => null);
  if (!identity || identity.disabled || !identity.email || identity.email.toLowerCase() !== email) {
    throw new Error("firebase_identity_unavailable");
  }
  const totpEnabled = (identity.multiFactor?.enrolledFactors ?? []).some((factor) => factor.factorId === "totp");
  const result = await bootstrapFirstAdmin({
    firebaseUid: identity.uid,
    email,
    emailVerified: identity.emailVerified,
    totpEnabled,
  });
  if (!result.ok) throw new Error(`bootstrap_precondition_${result.reason}`);
  console.log("First administrator bootstrapped; verified email, TOTP and current notices were required.");
}

main()
  .catch((error: unknown) => {
    const rawMessage = error instanceof Error ? error.message : "";
    const message = /^[a-z0-9_]+$/.test(rawMessage) ? rawMessage : "unexpected_failure";
    // Only stable reason codes are logged; never expose emails, UIDs, SQL, tokens, or Firebase payloads.
    console.error(`First administrator bootstrap failed (${message}).`);
    process.exitCode = 1;
  })
  .finally(async () => {
    const db = await getDb().catch(() => null);
    const pool = (db as unknown as { $client?: { end?: () => Promise<void> } } | null)?.$client;
    try { await pool?.end?.(); } catch { /* Best-effort close after the operator command. */ }
  });
