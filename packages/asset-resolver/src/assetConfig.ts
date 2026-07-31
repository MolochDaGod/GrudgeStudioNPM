/**
 * assetConfig.ts — image/binary asset URL builders.
 *
 * Every game asset (image, sprite, icon, background, audio, model) resolves to
 * the Cloudflare R2 CDN at assets.grudge-studio.com, the single source of truth.
 */

import { normalizeAssetPath } from "./legacyAssetPaths";
import { getAssetCdnBase } from "./cdnBase";

/**
 * Build a URL for a game asset (image, sprite, audio, etc.) on the R2 CDN.
 *
 * @example
 *   assetUrl("/backgrounds/general.png")
 *   // => "https://assets.grudge-studio.com/backgrounds/general.png"
 */
export function assetUrl(path: string): string {
  const cleanPath = normalizeAssetPath(path);
  return `${getAssetCdnBase()}${cleanPath}`;
}

/** CDN asset URL — alias of assetUrl() (both resolve to the R2 CDN). */
export function cdnAssetUrl(path: string): string {
  return assetUrl(path);
}
