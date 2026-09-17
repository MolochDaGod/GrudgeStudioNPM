'use strict';

var core = require('@grudge-studio/core');

// src/rewrites.ts
function buildFleetSatelliteRewrites(opts) {
  const gameData = (opts?.gameData ?? core.getFleetUrls().gameData).replace(/\/$/, "");
  const auth = (opts?.auth ?? core.getFleetUrls().auth).replace(/\/$/, "");
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
    { source: "/login", destination: `${auth}/login` }
  ];
}
function buildAiProxyRewrites(opts) {
  const ai = (opts?.ai ?? core.getFleetUrls().ai).replace(/\/$/, "");
  return [
    { source: "/api/ai/health", destination: `${ai}/health` },
    { source: "/api/ai/agents", destination: `${ai}/v1/agents` },
    { source: "/api/ai/:path*", destination: `${ai}/v1/:path*` }
  ];
}
function buildAssetProxyRewrites(opts) {
  const objectStore = (opts?.objectStore ?? core.getFleetUrls().objectStore).replace(/\/$/, "");
  const assets = (opts?.assets ?? core.getFleetUrls().assets).replace(/\/$/, "");
  return [
    { source: "/api/objectstore/:path*", destination: `${objectStore}/:path*` },
    { source: "/api/assets/:path*", destination: `${assets}/:path*` }
  ];
}
function buildUiEditorRewrites(opts) {
  return [
    ...buildFleetSatelliteRewrites(opts),
    ...buildAiProxyRewrites(opts),
    ...buildAssetProxyRewrites(opts)
  ];
}
var JS_CONTENT_TYPE_HEADERS = [
  {
    source: "/(.*).js",
    headers: [{ key: "Content-Type", value: "application/javascript; charset=utf-8" }]
  },
  {
    source: "/grudge-game-bootstrap.js",
    headers: [{ key: "Content-Type", value: "application/javascript; charset=utf-8" }]
  }
];

// src/env.ts
var CLIENT_ENV_KEYS = [
  "VITE_ASSETS_URL",
  "VITE_AUTH_GATEWAY_URL",
  "VITE_GAME_DATA_API",
  "VITE_OBJECTSTORE_URL",
  "VITE_AI_URL",
  "BASE_PATH"
];
var SERVER_ENV_KEYS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CORS_ORIGINS",
  "AUTH_EXTRA_RETURN_HOSTS"
];
var DEPLOY_SURFACES = {
  forge: {
    url: "https://forge.grudge-studio.com",
    role: "npm-and-editor-deploy-app",
    repo: "Grudge-Studio-Forge",
    notes: "Primary editor + package consumer; publish scenes/assets to R2/ObjectStore"
  },
  uiEditor: {
    url: "https://ui.grudge-studio.com",
    role: "game-ui-kit-hydra",
    repo: "grudge-ui-editor",
    notes: "Static multi-page HYDRA; Vercel rewrites \u2192 Railway auth + ai.grudge-studio.com (ui/ux agents) + ObjectStore; Puter KV packs"
  },
  aiHub: {
    url: "https://ai.grudge-studio.com",
    role: "fleet-ai-gateway",
    repo: "grudge-ai-hub",
    notes: "CF Worker: Gemini BYOK + Workers AI; D1 agent_roles; JWT or API key"
  },
  dash: {
    url: "https://dash.grudge-studio.com",
    role: "admin-dashboard",
    repo: "grudge-studio-dash",
    notes: "React 19 + TanStack Query + Tailwind v4 admin shell"
  },
  npm: {
    scope: "@grudge-studio",
    monorepo: "GrudgeStudioNPM",
    packages: ["core", "assets", "animator", "engine", "stack", "asset-resolver", "sdk"]
  },
  vercel: { role: "SPA frontends" },
  railway: { role: "Postgres game-data + optional game servers" },
  workers: { role: "auth edge, ObjectStore, CDN, AI" }
};

exports.CLIENT_ENV_KEYS = CLIENT_ENV_KEYS;
exports.DEPLOY_SURFACES = DEPLOY_SURFACES;
exports.JS_CONTENT_TYPE_HEADERS = JS_CONTENT_TYPE_HEADERS;
exports.SERVER_ENV_KEYS = SERVER_ENV_KEYS;
exports.buildAiProxyRewrites = buildAiProxyRewrites;
exports.buildAssetProxyRewrites = buildAssetProxyRewrites;
exports.buildFleetSatelliteRewrites = buildFleetSatelliteRewrites;
exports.buildUiEditorRewrites = buildUiEditorRewrites;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map