import { createPrivateKey } from "node:crypto";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAppCheck, type AppCheck } from "firebase-admin/app-check";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App | null = null;

export function readFirebaseAdminConfig(env: NodeJS.ProcessEnv = process.env) {
  const projectId = env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  try {
    createPrivateKey(privateKey);
    return { projectId, clientEmail, privateKey };
  } catch {
    return null;
  }
}

function getConfiguredAdminApp(): App | null {
  if (adminApp) return adminApp;

  const credentials = readFirebaseAdminConfig();
  if (!credentials) return null;

  try {
    adminApp = getApps().find((app) => app.name === "meu-pet-virtual-auth") ?? initializeApp({
      credential: cert(credentials),
      projectId: credentials.projectId,
    }, "meu-pet-virtual-auth");
    return adminApp;
  } catch {
    // Never log service-account material or SDK error payloads here.
    return null;
  }
}

export function getFirebaseAdminAuth(): Auth | null {
  const app = getConfiguredAdminApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseAdminAppCheck(): AppCheck | null {
  const app = getConfiguredAdminApp();
  return app ? getAppCheck(app) : null;
}

export function firebaseAdminConfigured(): boolean {
  return getConfiguredAdminApp() !== null;
}
