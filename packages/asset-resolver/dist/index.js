// src/cdnBase.ts
var DEFAULT_ASSET_CDN_BASE = "https://assets.grudge-studio.com";
function stripTrailingSlash(url) {
  return url.replace(/\/+$/, "");
}
function readEnvBase() {
  try {
    const env = globalThis.process?.env;
    if (env) {
      return env.VITE_ASSETS_URL || env.ASSETS_URL || env.VITE_ASSET_CDN_URL || env.ASSET_CDN_BASE || void 0;
    }
  } catch {
  }
  return void 0;
}
var ASSET_CDN_BASE = stripTrailingSlash(
  readEnvBase() || DEFAULT_ASSET_CDN_BASE
);
function getAssetCdnBase() {
  return ASSET_CDN_BASE;
}
function setAssetCdnBase(url) {
  if (!url) return;
  ASSET_CDN_BASE = stripTrailingSlash(url);
}

// src/legacyAssetPaths.ts
var PREFIX_MAP = [
  { old: "/assets/backgrounds/", next: "/backgrounds/" },
  { old: "/assets/events/", next: "/images/events/" },
  { old: "/assets/misc/", next: "/images/misc/" },
  { old: "/assets/pirate/", next: "/sprites/pirate/" },
  { old: "/assets/portraits/", next: "/images/portraits/" },
  { old: "/assets/professions/", next: "/images/professions/" },
  { old: "/assets/ui/sigils/", next: "/icons/sigils/" },
  { old: "/assets/ui/", next: "/images/ui/" },
  { old: "/assets/videos/", next: "/videos/" },
  { old: "/assets/skill-icons/", next: "/images/skill-icons/" }
];
function normalizeAssetPath(path) {
  if (!path || path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  for (const { old, next } of PREFIX_MAP) {
    if (withSlash.startsWith(old)) {
      return next + withSlash.slice(old.length);
    }
  }
  return withSlash;
}

// src/assetConfig.ts
function assetUrl(path) {
  const cleanPath = normalizeAssetPath(path);
  return `${getAssetCdnBase()}${cleanPath}`;
}
function cdnAssetUrl(path) {
  return assetUrl(path);
}

// src/iconResolver.ts
var DEPRECATED_HOSTS = [
  "molochdagod.github.io",
  "grudge-objectstore.pages.dev"
];
var PACK_BY_CATEGORY = {
  swords: "/icons/pack/weapons/Sword_01.png",
  sword: "/icons/pack/weapons/Sword_01.png",
  axes: "/icons/pack/weapons/Axe_01.png",
  axe: "/icons/pack/weapons/Axe_01.png",
  daggers: "/icons/pack/weapons/Dagger_01.png",
  dagger: "/icons/pack/weapons/Dagger_01.png",
  hammers: "/icons/pack/weapons/Hammer_01.png",
  hammer: "/icons/pack/weapons/Hammer_01.png",
  hammer1h: "/icons/pack/weapons/Hammer_01.png",
  hammer2h: "/icons/pack/weapons/Hammer_01.png",
  maces: "/icons/pack/weapons/Hammer_10.png",
  mace: "/icons/pack/weapons/Hammer_10.png",
  greatswords: "/icons/pack/weapons/Sword_10.png",
  greatsword: "/icons/pack/weapons/Sword_10.png",
  greataxes: "/icons/pack/weapons/Axe_10.png",
  greataxe: "/icons/pack/weapons/Axe_10.png",
  spears: "/icons/pack/weapons/Spear_01.png",
  spear: "/icons/pack/weapons/Spear_01.png",
  bows: "/icons/pack/weapons/Bow_01.png",
  bow: "/icons/pack/weapons/Bow_01.png",
  crossbows: "/icons/pack/weapons/Crossbow_01.png",
  crossbow: "/icons/pack/weapons/Crossbow_01.png",
  guns: "/icons/pack/weapons/Crossbow_10.png",
  gun: "/icons/pack/weapons/Crossbow_10.png",
  "fire staff": "/icons/pack/weapons/Staff_01.png",
  "frost staff": "/icons/pack/weapons/Staff_05.png",
  "holy staff": "/icons/pack/weapons/Staff_09.png",
  "lightning staff": "/icons/pack/weapons/Staff_13.png",
  "nature staff": "/icons/pack/weapons/Staff_17.png",
  "arcane staff": "/icons/pack/weapons/Staff_17.png",
  staves: "/icons/pack/weapons/Staff_01.png",
  staff: "/icons/pack/weapons/Staff_01.png",
  shields: "/icons/pack/weapons/Shield_01.png",
  shield: "/icons/pack/weapons/Shield_01.png",
  plate: "/icons/pack/weapons/Shield_01.png",
  leather: "/icons/pack/weapons/Dagger_01.png",
  cloth: "/icons/pack/weapons/Staff_01.png",
  ore: "/icons/pack/weapons/Hammer_01.png",
  ingot: "/icons/pack/weapons/Hammer_01.png",
  wood: "/icons/pack/weapons/Axe_01.png",
  plank: "/icons/pack/weapons/Axe_01.png",
  hide: "/icons/pack/weapons/Dagger_01.png",
  thread: "/icons/pack/weapons/Staff_01.png",
  food: "/icons/pack/misc/Burns.png",
  potion: "/icons/pack/misc/Effect.png",
  essence: "/icons/pack/misc/Effect.png",
  gem: "/icons/pack/misc/Electro.png",
  misc: "/icons/pack/misc/Effect.png"
};
var PACK_BY_WEAPON_TYPE = {
  Sword: "/icons/pack/weapons/Sword_01.png",
  Axe: "/icons/pack/weapons/Axe_01.png",
  Dagger: "/icons/pack/weapons/Dagger_01.png",
  Hammer1h: "/icons/pack/weapons/Hammer_01.png",
  Hammer2h: "/icons/pack/weapons/Hammer_01.png",
  Greatsword: "/icons/pack/weapons/Sword_10.png",
  Greataxe: "/icons/pack/weapons/Axe_10.png",
  Bow: "/icons/pack/weapons/Bow_01.png",
  Crossbow: "/icons/pack/weapons/Crossbow_01.png",
  Gun: "/icons/pack/weapons/Crossbow_10.png",
  "Fire Staff": "/icons/pack/weapons/Staff_01.png",
  "Frost Staff": "/icons/pack/weapons/Staff_05.png",
  "Holy Staff": "/icons/pack/weapons/Staff_09.png",
  "Lightning Staff": "/icons/pack/weapons/Staff_13.png",
  "Nature Staff": "/icons/pack/weapons/Staff_17.png",
  "Arcane Staff": "/icons/pack/weapons/Staff_17.png"
};
function toKebab(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
}
function rewriteDeprecatedHost(url) {
  const base = getAssetCdnBase();
  let out = url;
  for (const host of DEPRECATED_HOSTS) {
    if (!out.includes(host)) continue;
    out = out.replace(`https://${host}/ObjectStore`, base).replace(`http://${host}/ObjectStore`, base).replace(`https://${host}`, base).replace(`http://${host}`, base);
  }
  if (out.includes("info.grudge-studio.com") && /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(out)) {
    try {
      const u = new URL(out);
      const path = u.pathname.replace(/^\/api\/v1/, "");
      return `${base}${path}`;
    } catch {
    }
  }
  return out;
}
function flattenWeaponIconPath(path) {
  return path.replace(
    /\/icons\/weapons\/(?:swords|axes|daggers|hammers|greatswords|greataxes|bows|crossbows|guns|staves\/[^/]+|tomes\/[^/]+)\//i,
    "/icons/weapons/"
  );
}
function getPackIconForCategory(ctx = {}) {
  const keys = [ctx.weaponType, ctx.category, ctx.type, ctx.name].filter(
    Boolean
  );
  for (const key of keys) {
    const lower = key.toLowerCase();
    if (PACK_BY_WEAPON_TYPE[key]) return assetUrl(PACK_BY_WEAPON_TYPE[key]);
    if (PACK_BY_CATEGORY[lower]) return assetUrl(PACK_BY_CATEGORY[lower]);
    for (const [cat, path] of Object.entries(PACK_BY_CATEGORY)) {
      if (lower.includes(cat)) return assetUrl(path);
    }
  }
  return assetUrl("/icons/pack/misc/Effect.png");
}
function resolveIconUrl(urlOrPath, ctx = {}) {
  if (!urlOrPath) return getPackIconForCategory(ctx);
  let raw = urlOrPath.trim();
  if (!raw) return getPackIconForCategory(ctx);
  const base = getAssetCdnBase();
  if (raw.startsWith("http")) {
    raw = rewriteDeprecatedHost(raw);
    if (raw.startsWith(base)) return raw;
    if (/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(raw)) return raw;
  }
  let path = raw.startsWith("/") ? raw : `/${raw}`;
  path = flattenWeaponIconPath(path);
  if (path.includes("/icons/weapons/")) {
    const file = path.split("/").pop() || "";
    const kebab = toKebab(file.replace(/\.(png|jpe?g|webp)$/i, ""));
    return assetUrl(`/icons/weapons/${kebab}.png`);
  }
  if (path.startsWith("http")) return path;
  return assetUrl(path);
}
function iconOnError(e, ctx = {}) {
  const img = e.currentTarget;
  const fallback = getPackIconForCategory(ctx);
  if (img.src !== fallback) {
    img.src = fallback;
    img.onerror = null;
  }
}

export { ASSET_CDN_BASE, DEFAULT_ASSET_CDN_BASE, assetUrl, cdnAssetUrl, getAssetCdnBase, getPackIconForCategory, iconOnError, normalizeAssetPath, resolveIconUrl, setAssetCdnBase };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map