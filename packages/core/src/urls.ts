/** Canonical Grudge Studio fleet endpoints. Override via setFleetUrls(). */

export const DEFAULT_FLEET_URLS = {
  auth: "https://id.grudge-studio.com",
  gameData: "https://grudge-api-production-0d46.up.railway.app",
  assets: "https://assets.grudge-studio.com",
  objectStore: "https://objectstore.grudge-studio.com/api/v1",
  ai: "https://ai.grudge-studio.com",
  portal: "https://grudge-studio.com",
  warlords: "https://grudgewarlords.com",
  forge: "https://forge.grudge-studio.com",
  studioEditor: "https://grudge-studio-editor.vercel.app",
  warlordGenesis: "https://warlord-genesis.vercel.app",
  characterStudio: "https://character.grudge-studio.com",
  /** HYDRA UI Kit + studio — ui.grudge-studio.com */
  uiEditor: "https://ui.grudge-studio.com",
  dash: "https://dash.grudge-studio.com",
} as const;

export type FleetUrlKey = keyof typeof DEFAULT_FLEET_URLS;

let fleetUrls: Record<FleetUrlKey, string> = { ...DEFAULT_FLEET_URLS };

export function getFleetUrls(): Readonly<Record<FleetUrlKey, string>> {
  return fleetUrls;
}

export function setFleetUrls(partial: Partial<Record<FleetUrlKey, string>>): void {
  fleetUrls = { ...fleetUrls, ...partial };
}

/** FLEET_GAME_ORIGINS — SSO return + navigateToGame. */
export const FLEET_GAME_ORIGINS = {
  "warlord-genesis": "https://warlord-genesis.vercel.app",
  "rts-grudge": "https://rts-grudge.vercel.app",
  forge: "https://forge.grudge-studio.com",
  "tactical-infinity": "https://water.grudge-studio.com",
  arena: "https://grudge-arena.grudge-studio.com",
  survival: "https://survival.grudge-studio.com",
} as const;
