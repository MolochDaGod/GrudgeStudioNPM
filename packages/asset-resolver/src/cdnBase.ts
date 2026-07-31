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

export const DEFAULT_ASSET_CDN_BASE = "https://assets.grudge-studio.com";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function readEnvBase(): string | undefined {
  try {
    const env = (
      globalThis as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env;
    if (env) {
      return (
        env.VITE_ASSETS_URL ||
        env.ASSETS_URL ||
        env.VITE_ASSET_CDN_URL ||
        env.ASSET_CDN_BASE ||
        undefined
      );
    }
  } catch {
    /* no reachable process.env — fall through to default */
  }
  return undefined;
}

/**
 * The active CDN origin. Exported as a live binding so ESM consumers see
 * updates made through setAssetCdnBase(); prefer getAssetCdnBase() for
 * robustness across CJS/ESM interop.
 */
export let ASSET_CDN_BASE = stripTrailingSlash(
  readEnvBase() || DEFAULT_ASSET_CDN_BASE,
);

/** Reliable runtime accessor for the active CDN origin. */
export function getAssetCdnBase(): string {
  return ASSET_CDN_BASE;
}

/**
 * Override the CDN origin at runtime (e.g. staging, or a Vite app passing
 * `import.meta.env.VITE_ASSETS_URL`). No-ops on empty input.
 */
export function setAssetCdnBase(url: string): void {
  if (!url) return;
  ASSET_CDN_BASE = stripTrailingSlash(url);
}
