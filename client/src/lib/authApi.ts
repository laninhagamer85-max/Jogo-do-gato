import { getAppCheckHeader } from "./firebase";

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = getAppCheckHeader().then((appCheck) => fetch("/api/auth/csrf", { credentials: "include", cache: "no-store", headers: { Accept: "application/json", ...appCheck } }))
      .then(async (response) => {
        if (!response.ok) throw new Error("CSRF_INIT_FAILED");
        const body = await response.json() as { csrfToken?: string };
        if (!body.csrfToken) throw new Error("CSRF_INIT_FAILED");
        csrfToken = body.csrfToken;
        return csrfToken;
      }).finally(() => { csrfPromise = null; });
  }
  return csrfPromise;
}

export async function getSecurityHeaders(): Promise<Record<string, string>> {
  const [csrf, appCheck] = await Promise.all([getCsrfToken(), getAppCheckHeader()]);
  return { "X-CSRF-Token": csrf, ...appCheck };
}

export async function authPost<T>(path: "/api/auth/register" | "/api/auth/session" | "/api/auth/logout", body?: unknown): Promise<T> {
  const securityHeaders = await getSecurityHeaders();
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...securityHeaders },
    body: JSON.stringify(body ?? {}),
  });
  const result = await response.json().catch(() => ({})) as { message?: string; code?: string } & T;
  if (!response.ok) {
    const error = new Error(result.message ?? "Não foi possível concluir a solicitação.");
    Object.assign(error, { code: result.code ?? "REQUEST_FAILED", status: response.status });
    throw error;
  }
  return result;
}
