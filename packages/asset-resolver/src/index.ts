/**
 * @grudge-studio/asset-resolver
 *
 * Canonical image/asset URL resolution for the Grudge Studio fleet.
 * Cloudflare R2 (assets.grudge-studio.com) is the single source of truth.
 */

export {
  ASSET_CDN_BASE,
  DEFAULT_ASSET_CDN_BASE,
  getAssetCdnBase,
  setAssetCdnBase,
} from "./cdnBase";
export { assetUrl, cdnAssetUrl } from "./assetConfig";
export { normalizeAssetPath } from "./legacyAssetPaths";
export {
  resolveIconUrl,
  getPackIconForCategory,
  iconOnError,
} from "./iconResolver";
export type { IconResolveContext, ImageErrorTarget } from "./iconResolver";
