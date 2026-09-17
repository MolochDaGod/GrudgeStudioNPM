/**
 * cdnBase.ts — single source of the Cloudflare R2 image CDN origin.
 *
 * Default: https://assets.grudge-studio.com (the canonical Grudge Studio
 * source of truth for images/binary assets).
 *
 * Framework-agnostic resolution order:
 *   1. An explicit runtime override set via setAssetCdnBase().
 *   2. An environment variable, when a `process.env` is reachable
 *      (Node, or a bundler that injects it): VITE_ASSETS_URL,
 *      ASSETS_URL, VITE_ASSET_CDN_URL, or ASSET_CDN_BASE.
 *   3. The built-in default.
 *
 * Note for browser/Vite apps: `import.meta.env` is intentionally NOT read
 * here (it is invalid syntax in a CJS build). Vite consumers that want a
 * build-time override should call
 * `setAssetCdnBase(import.meta.env.VITE_ASSETS_URL)` at app startup.
 */
declare const DEFAULT_ASSET_CDN_BASE = "https://assets.grudge-studio.com";
/**
 * The active CDN origin. Exported as a live binding so ESM consumers see
 * updates made through setAssetCdnBase(); prefer getAssetCdnBase() for
 * robustness across CJS/ESM interop.
 */
declare let ASSET_CDN_BASE: string;
/** Reliable runtime accessor for the active CDN origin. */
declare function getAssetCdnBase(): string;
/**
 * Override the CDN origin at runtime (e.g. staging, or a Vite app passing
 * `import.meta.env.VITE_ASSETS_URL`). No-ops on empty input.
 */
declare function setAssetCdnBase(url: string): void;

/**
 * assetConfig.ts — image/binary asset URL builders.
 *
 * Every game asset (image, sprite, icon, background, audio, model) resolves to
 * the Cloudflare R2 CDN at assets.grudge-studio.com, the single source of truth.
 */
/**
 * Build a URL for a game asset (image, sprite, audio, etc.) on the R2 CDN.
 *
 * @example
 *   assetUrl("/backgrounds/general.png")
 *   // => "https://assets.grudge-studio.com/backgrounds/general.png"
 */
declare function assetUrl(path: string): string;
/** CDN asset URL — alias of assetUrl() (both resolve to the R2 CDN). */
declare function cdnAssetUrl(path: string): string;

/**
 * Legacy → CDN path normalization.
 * Maps pre-migration /assets/* paths to ObjectStore/R2 layout.
 */
/**
 * Rewrite a legacy asset path to the canonical CDN-relative path.
 * Absolute URLs and already-migrated paths pass through unchanged.
 */
declare function normalizeAssetPath(path: string): string;

/**
 * iconResolver.ts — ONE TRUTH icon URLs for the Grudge Warlords era.
 *
 * Canonical binary icons: assets.grudge-studio.com/icons/pack/*
 * Named weapon icons:      assets.grudge-studio.com/icons/weapons/{kebab-name}.png
 *
 * Rewrites deprecated molochdagod.github.io/ObjectStore and *.pages.dev URLs,
 * plus image URLs that point at info.grudge-studio.com, to the R2 CDN at runtime.
 */
interface IconResolveContext {
    category?: string;
    type?: string;
    name?: string;
    weaponType?: string;
}
/** Minimal structural type for an <img> error target (DOM-lib-agnostic). */
interface ImageErrorTarget {
    src: string;
    onerror: ((...args: unknown[]) => unknown) | null;
}
declare function getPackIconForCategory(ctx?: IconResolveContext): string;
/**
 * Resolve any icon URL/path to a working assets.grudge-studio.com URL.
 * Falls back to pack icons (grudge-guide.html convention) when named icons 404.
 */
declare function resolveIconUrl(urlOrPath?: string | null, ctx?: IconResolveContext): string;
/** img onError handler — swap to pack fallback */
declare function iconOnError(e: {
    currentTarget: ImageErrorTarget;
}, ctx?: IconResolveContext): void;

export { ASSET_CDN_BASE, DEFAULT_ASSET_CDN_BASE, type IconResolveContext, type ImageErrorTarget, assetUrl, cdnAssetUrl, getAssetCdnBase, getPackIconForCategory, iconOnError, normalizeAssetPath, resolveIconUrl, setAssetCdnBase };
