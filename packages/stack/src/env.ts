/** Documented env keys for fleet games (client = VITE_ only). */
export const CLIENT_ENV_KEYS = [
  "VITE_ASSETS_URL",
  "VITE_AUTH_GATEWAY_URL",
  "VITE_GAME_DATA_API",
  "VITE_OBJECTSTORE_URL",
  "VITE_AI_URL",
  "BASE_PATH",
] as const;

export const SERVER_ENV_KEYS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CORS_ORIGINS",
  "AUTH_EXTRA_RETURN_HOSTS",
] as const;

export const DEPLOY_SURFACES = {
  forge: {
    url: "https://forge.grudge-studio.com",
    role: "npm-and-editor-deploy-app",
    repo: "Grudge-Studio-Forge",
    notes: "Primary editor + package consumer; publish scenes/assets to R2/ObjectStore",
  },
  uiEditor: {
    url: "https://ui.grudge-studio.com",
    role: "game-ui-kit-hydra",
    repo: "grudge-ui-editor",
    notes:
      "Static multi-page HYDRA; Vercel rewrites → Railway auth + ai.grudge-studio.com (ui/ux agents) + ObjectStore; Puter KV packs",
  },
  aiHub: {
    url: "https://ai.grudge-studio.com",
    role: "fleet-ai-gateway",
    repo: "grudge-ai-hub",
    notes: "CF Worker: Gemini BYOK + Workers AI; D1 agent_roles; JWT or API key",
  },
  dash: {
    url: "https://dash.grudge-studio.com",
    role: "admin-dashboard",
    repo: "grudge-studio-dash",
    notes: "React 19 + TanStack Query + Tailwind v4 admin shell",
  },
  npm: {
    scope: "@grudge-studio",
    monorepo: "GrudgeStudioNPM",
    packages: ["core", "assets", "animator", "engine", "stack", "asset-resolver", "sdk"],
  },
  vercel: { role: "SPA frontends" },
  railway: { role: "Postgres game-data + optional game servers" },
  workers: { role: "auth edge, ObjectStore, CDN, AI" },
} as const;
