export const CANONICAL_SITE_ORIGIN = "https://meupetgame-4hwhw32b.manus.space";
export const CANONICAL_SITE_HOST = "meupetgame-4hwhw32b.manus.space";

/** In production, keep all public paths on the single official project hostname. */
export function getCanonicalRedirectUrl(
  hostname: string,
  requestTarget: string,
  isProduction: boolean,
  configuredOrigin = CANONICAL_SITE_ORIGIN,
): string | null {
  let canonical: URL;
  try {
    canonical = new URL(configuredOrigin);
  } catch {
    return null;
  }
  if (canonical.protocol !== "https:" || canonical.username || canonical.password) return null;
  if (!isProduction || hostname.trim().toLowerCase().replace(/\.$/, "") === canonical.host.toLowerCase()) return null;
  const safePath = requestTarget.startsWith("/") && !requestTarget.startsWith("//") ? requestTarget : "/";
  return `${canonical.origin}${safePath}`;
}

/** Development previews are QA-only and should not compete with the official URL in search indexes. */
export function shouldNoIndex(isProduction: boolean): boolean {
  return !isProduction;
}
