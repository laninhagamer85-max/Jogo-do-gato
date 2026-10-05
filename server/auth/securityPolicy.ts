export function getConnectSrc(isDev: boolean): string[] {
  return [
    "'self'",
    ...(isDev ? ["ws:", "wss:"] : []),
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firebaseappcheck.googleapis.com",
    "https://content-firebaseappcheck.googleapis.com",
    "https://www.googleapis.com",
    "https://accounts.google.com",
    "https://oauth2.googleapis.com",
    "https://www.google.com/recaptcha/",
    "https://recaptcha.google.com/",
    "https://www.gstatic.com/recaptcha/",
  ];
}

/** Preserve cross-origin isolation for top-level navigations while allowing OAuth popup handshakes. */
export function getCrossOriginOpenerPolicy(): "same-origin-allow-popups" {
  return "same-origin-allow-popups";
}

export function getScriptSrc(isDev: boolean): string[] {
  return [
    "'self'",
    ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
    "https://apis.google.com/js/",
    "https://apis.google.com/_/scs/",
    "https://www.google.com/recaptcha/",
    "https://www.gstatic.com/recaptcha/",
  ];
}
