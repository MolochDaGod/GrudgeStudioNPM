/**
 * Canonical hub links — R2 CDN, D1 catalog, and satellite apps.
 * R2 key paths mirror upload-r2.ts / upload-rts-assets.mjs conventions.
 */

export const ASSET_CDN = 'https://assets.grudge-studio.com'

export const HUB_LINKS = {
  groundRts: 'https://grudge-space-rts.vercel.app/ground-rts',
  warlordGenesis: 'https://warlord-genesis.vercel.app/play',
  warlordGenesisHub: 'https://warlord-genesis.vercel.app/',
  characterViewer: 'https://character.grudge-studio.com/viewer',
  assetCdn: ASSET_CDN,
  r2Paths: {
    characters: '/assets/{race}/models/characters/',
    textures: '/assets/{race}/textures/',
    bakedAnims: '/anims/baked/',
    rtsModels: '/grudge-nexus/models/rts/',
    rtsIcons: '/grudge-nexus/icons/skills/',
  },
}

export const PIPELINE_BADGES = [
  { id: 'r2', label: 'Cloudflare R2', detail: 'Static assets via assets.grudge-studio.com' },
  { id: 'd1', label: 'D1 Heroes', detail: 'Canonical hero catalog (race × class × grudgeId)' },
  { id: 'bip', label: 'Bip001 Clips', detail: 'Rotation-only baked JSON — no runtime Mixamo retarget' },
  { id: 'webp', label: 'WebP Textures', detail: 'Race unit sheets from asset pipeline' },
]