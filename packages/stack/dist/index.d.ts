interface VercelRewrite {
    source: string;
    destination: string;
}
/** Standard satellite rewrites (auth + Railway game data). Call before SPA catch-all. */
declare function buildFleetSatelliteRewrites(opts?: {
    gameData?: string;
    auth?: string;
}): VercelRewrite[];
/**
 * Same-origin AI Hub proxy for Vercel satellites (ui.grudge-studio.com pattern).
 * Maps /api/ai/* → ai.grudge-studio.com/v1/* (health is special-cased).
 */
declare function buildAiProxyRewrites(opts?: {
    ai?: string;
}): VercelRewrite[];
/** ObjectStore + R2 asset proxies for editors (ui / forge / dash satellites). */
declare function buildAssetProxyRewrites(opts?: {
    objectStore?: string;
    assets?: string;
}): VercelRewrite[];
/**
 * Full rewrite set for UI Editor / editor satellites:
 * fleet auth + game data + AI + assets, before SPA catch-all.
 */
declare function buildUiEditorRewrites(opts?: {
    gameData?: string;
    auth?: string;
    ai?: string;
    objectStore?: string;
    assets?: string;
}): VercelRewrite[];
declare const JS_CONTENT_TYPE_HEADERS: {
    source: string;
    headers: {
        key: string;
        value: string;
    }[];
}[];

/** Documented env keys for fleet games (client = VITE_ only). */
declare const CLIENT_ENV_KEYS: readonly ["VITE_ASSETS_URL", "VITE_AUTH_GATEWAY_URL", "VITE_GAME_DATA_API", "VITE_OBJECTSTORE_URL", "VITE_AI_URL", "BASE_PATH"];
declare const SERVER_ENV_KEYS: readonly ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGINS", "AUTH_EXTRA_RETURN_HOSTS"];
declare const DEPLOY_SURFACES: {
    readonly forge: {
        readonly url: "https://forge.grudge-studio.com";
        readonly role: "npm-and-editor-deploy-app";
        readonly repo: "Grudge-Studio-Forge";
        readonly notes: "Primary editor + package consumer; publish scenes/assets to R2/ObjectStore";
    };
    readonly uiEditor: {
        readonly url: "https://ui.grudge-studio.com";
        readonly role: "game-ui-kit-hydra";
        readonly repo: "grudge-ui-editor";
        readonly notes: "Static multi-page HYDRA; Vercel rewrites → Railway auth + ai.grudge-studio.com (ui/ux agents) + ObjectStore; Puter KV packs";
    };
    readonly aiHub: {
        readonly url: "https://ai.grudge-studio.com";
        readonly role: "fleet-ai-gateway";
        readonly repo: "grudge-ai-hub";
        readonly notes: "CF Worker: Gemini BYOK + Workers AI; D1 agent_roles; JWT or API key";
    };
    readonly dash: {
        readonly url: "https://dash.grudge-studio.com";
        readonly role: "admin-dashboard";
        readonly repo: "grudge-studio-dash";
        readonly notes: "React 19 + TanStack Query + Tailwind v4 admin shell";
    };
    readonly npm: {
        readonly scope: "@grudge-studio";
        readonly monorepo: "GrudgeStudioNPM";
        readonly packages: readonly ["core", "assets", "animator", "engine", "stack", "asset-resolver", "sdk"];
    };
    readonly vercel: {
        readonly role: "SPA frontends";
    };
    readonly railway: {
        readonly role: "Postgres game-data + optional game servers";
    };
    readonly workers: {
        readonly role: "auth edge, ObjectStore, CDN, AI";
    };
};

export { CLIENT_ENV_KEYS, DEPLOY_SURFACES, JS_CONTENT_TYPE_HEADERS, SERVER_ENV_KEYS, type VercelRewrite, buildAiProxyRewrites, buildAssetProxyRewrites, buildFleetSatelliteRewrites, buildUiEditorRewrites };
