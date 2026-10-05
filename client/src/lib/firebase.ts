import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider, getToken, type AppCheck } from "firebase/app-check";
import { getAuth, inMemoryPersistence, setPersistence, type Auth } from "firebase/auth";

const env = import.meta.env as ImportMetaEnv & {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_RECAPTCHA_SITE_KEY?: string;
};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
export const firebaseApp = firebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseAuthReady = firebaseAuth ? setPersistence(firebaseAuth, inMemoryPersistence) : Promise.resolve();

let appCheck: AppCheck | null = null;
let appCheckHeadersCache: { headers: Record<string, string>; expiresAt: number } | null = null;
let appCheckHeadersPending: Promise<Record<string, string>> | null = null;
if (firebaseApp && env.VITE_RECAPTCHA_SITE_KEY) {
  try {
    appCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    appCheck = null;
  }
}
export const appCheckConfigured = Boolean(appCheck);

export async function getAppCheckHeader(): Promise<Record<string, string>> {
  if (!appCheck) return {};
  if (appCheckHeadersCache && appCheckHeadersCache.expiresAt > Date.now()) return appCheckHeadersCache.headers;
  if (!appCheckHeadersPending) {
    appCheckHeadersPending = new Promise<Record<string, string>>((resolve) => {
      let settled = false;
      const timeout = window.setTimeout(() => {
        settled = true;
        resolve({});
      }, 2500);
      getToken(appCheck!, false).then((result) => {
        if (settled) return;
        window.clearTimeout(timeout);
        resolve(result.token ? { "X-Firebase-AppCheck": result.token } : {});
      }).catch(() => {
        if (settled) return;
        window.clearTimeout(timeout);
        resolve({});
      });
    }).then((headers) => {
      appCheckHeadersCache = { headers, expiresAt: Date.now() + (headers["X-Firebase-AppCheck"] ? 30_000 : 5_000) };
      return headers;
    }).finally(() => {
      appCheckHeadersPending = null;
    });
  }
  return appCheckHeadersPending;
}
