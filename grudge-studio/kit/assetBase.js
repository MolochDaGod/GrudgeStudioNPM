/**
 * Asset host resolution — mirrors lib/character-kit/src/assetBase.ts
 */

const DEFAULT_ASSET_BASE = 'https://assets.grudge-studio.com'

let assetBase = DEFAULT_ASSET_BASE

export function setAssetBase(base) {
  assetBase = (base ?? '').replace(/\/+$/, '')
}

export function getAssetBase() {
  return assetBase
}

export function resolveAssetUrl(path) {
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path
  const rel = path.startsWith('/') ? path : `/${path}`
  return `${assetBase}${rel}`
}

export function assetLoadError(url, cause) {
  const hint =
    'Load /assets/* and /anims/baked/* from the configured asset host. ' +
    `Default: ${DEFAULT_ASSET_BASE}. Call setAssetBase() to override.`
  const err = new Error(`[grudge-kit] failed to load: ${url} (assetBase=${assetBase || DEFAULT_ASSET_BASE}). ${hint}`)
  if (cause !== undefined) err.cause = cause
  return err
}