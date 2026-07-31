import { getFleetUrls } from "./urls";

/** Approved client token storage keys (read all, write canonical). */
export const FLEET_AUTH_TOKEN_KEYS = [
  "grudge_auth_token",
  "grudge_session_token",
  "grudge.token",
  "sso_token",
] as const;

export function buildGrudgeLoginUrl(
  redirectUri: string,
  opts: { app?: string; origin?: string } = {},
): string {
  const auth = getFleetUrls().auth.replace(/\/$/, "");
  const dest = redirectUri;
  const q = new URLSearchParams();
  q.set("redirect_uri", dest);
  q.set("redirect", dest);
  q.set("return", dest);
  if (opts.app) q.set("app", opts.app);
  if (opts.origin) q.set("origin", opts.origin);
  return `${auth}/login?${q.toString()}`;
}

/** Default callback on current origin. */
export function buildDefaultLoginUrl(app = "grudge-app"): string {
  if (typeof window === "undefined") {
    return buildGrudgeLoginUrl("https://grudgewarlords.com/auth/callback", { app });
  }
  const origin = window.location.origin;
  return buildGrudgeLoginUrl(`${origin}/auth/callback`, { app, origin });
}

export function readStoredToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  for (const k of FLEET_AUTH_TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export function storeAuthToken(token: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("grudge_auth_token", token);
  localStorage.setItem("grudge_session_token", token);
  localStorage.setItem("sso_token", token);
}

/** Consume ?grudge_token= / ?sso_token= from URL and clean history. */
export function consumeAuthQuery(search = typeof location !== "undefined" ? location.search : ""): string | null {
  try {
    const p = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const t = p.get("grudge_token") || p.get("sso_token");
    if (t) {
      storeAuthToken(t);
      if (typeof window !== "undefined" && window.history?.replaceState) {
        const u = new URL(window.location.href);
        u.searchParams.delete("grudge_token");
        u.searchParams.delete("sso_token");
        window.history.replaceState({}, "", u.pathname + u.search + u.hash);
      }
    }
    return t;
  } catch {
    return null;
  }
}
