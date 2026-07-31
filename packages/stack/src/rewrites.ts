import { getFleetUrls } from "@grudge-studio/core";

export interface VercelRewrite {
  source: string;
  destination: string;
}

/** Standard satellite rewrites (auth + Railway game data). Call before SPA catch-all. */
export function buildFleetSatelliteRewrites(opts?: {
  gameData?: string;
  auth?: string;
}): VercelRewrite[] {
  const gameData = (opts?.gameData ?? getFleetUrls().gameData).replace(/\/$/, "");
  const auth = (opts?.auth ?? getFleetUrls().auth).replace(/\/$/, "");
  return [
    { source: "/auth/callback", destination: "/index.html" },
    { source: "/api/auth/guest", destination: `${gameData}/api/auth/guest` },
    { source: "/api/auth/me", destination: `${gameData}/api/auth/me` },
    { source: "/api/auth/puter", destination: `${gameData}/api/auth/puter` },
    { source: "/api/auth/puter-sso", destination: `${gameData}/api/auth/puter-sso` },
    { source: "/api/auth/session/exchange", destination: `${gameData}/api/auth/session/exchange` },
    { source: "/api/auth/popup-token", destination: `${gameData}/api/auth/popup-token` },
    { source: "/api/characters", destination: `${gameData}/api/characters` },
    { source: "/api/characters/:path*", destination: `${gameData}/api/characters/:path*` },
    { source: "/api/account", destination: `${gameData}/api/account` },
    { source: "/api/account/:path*", destination: `${gameData}/api/account/:path*` },
    { source: "/api/auth/:path*", destination: `${auth}/api/auth/:path*` },
    { source: "/auth/:path*", destination: `${auth}/auth/:path*` },
    { source: "/login", destination: `${auth}/login` },
  ];
}

/**
 * Same-origin AI Hub proxy for Vercel satellites (ui.grudge-studio.com pattern).
 * Maps /api/ai/* → ai.grudge-studio.com/v1/* (health is special-cased).
 */
export function buildAiProxyRewrites(opts?: { ai?: string }): VercelRewrite[] {
  const ai = (opts?.ai ?? getFleetUrls().ai).replace(/\/$/, "");
  return [
    { source: "/api/ai/health", destination: `${ai}/health` },
    { source: "/api/ai/agents", destination: `${ai}/v1/agents` },
    { source: "/api/ai/:path*", destination: `${ai}/v1/:path*` },
  ];
}

/** ObjectStore + R2 asset proxies for editors (ui / forge / dash satellites). */
export function buildAssetProxyRewrites(opts?: {
  objectStore?: string;
  assets?: string;
}): VercelRewrite[] {
  const objectStore = (opts?.objectStore ?? getFleetUrls().objectStore).replace(/\/$/, "");
  const assets = (opts?.assets ?? getFleetUrls().assets).replace(/\/$/, "");
  return [
    { source: "/api/objectstore/:path*", destination: `${objectStore}/:path*` },
    { source: "/api/assets/:path*", destination: `${assets}/:path*` },
  ];
}

/**
 * Full rewrite set for UI Editor / editor satellites:
 * fleet auth + game data + AI + assets, before SPA catch-all.
 */
export function buildUiEditorRewrites(opts?: {
  gameData?: string;
  auth?: string;
  ai?: string;
  objectStore?: string;
  assets?: string;
}): VercelRewrite[] {
  return [
    ...buildFleetSatelliteRewrites(opts),
    ...buildAiProxyRewrites(opts),
    ...buildAssetProxyRewrites(opts),
  ];
}

export const JS_CONTENT_TYPE_HEADERS = [
  {
    source: "/(.*).js",
    headers: [{ key: "Content-Type", value: "application/javascript; charset=utf-8" }],
  },
  {
    source: "/grudge-game-bootstrap.js",
    headers: [{ key: "Content-Type", value: "application/javascript; charset=utf-8" }],
  },
];
