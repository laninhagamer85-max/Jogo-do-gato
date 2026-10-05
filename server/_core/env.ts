export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseAdminClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
  firebaseAdminPrivateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "",
  appCheckRequired: process.env.FIREBASE_APP_CHECK_REQUIRED === "true",
  isProduction: process.env.NODE_ENV === "production",
};
