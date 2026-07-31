import { getFleetUrls } from "@grudge-studio/core";

/**
 * Baked Bip001 clips — prefer SAME-ORIGIN /anims/baked in games.
 * Fallback order: same-origin → assets CDN → arena (legacy live JSON host).
 * Do not treat HTML 404 pages as JSON.
 *
 * Pack ids SSOT: sword_shield (not 1h_sword_shield). See GrudgeBuilder shared/fleet/animPacks.ts
 */
export const BAKED_ANIM_ARENA =
  "https://grudge-arena.grudge-studio.com/api/assets/anims/baked";

export function bakedAnimUrl(rel: string, sameOrigin = true): string {
  const clean = rel.replace(/^\/+/, "").replace(/\.json$/i, "");
  const encoded = clean
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  if (sameOrigin) return `/anims/baked/${encoded}.json`;
  return `${getFleetUrls().assets}/anims/baked/${encoded}.json`;
}

/** Try same-origin → assets → arena until loader succeeds. */
export function bakedAnimUrlCandidates(rel: string): string[] {
  const clean = rel.replace(/^\/+/, "").replace(/\.json$/i, "");
  const encoded = clean
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  const assets = getFleetUrls().assets.replace(/\/$/, "");
  return [
    `/anims/baked/${encoded}.json`,
    `${assets}/anims/baked/${encoded}.json`,
    `${BAKED_ANIM_ARENA}/${encoded}.json`,
  ];
}

/** Legacy pack id → canonical (fleet SSOT). */
export function normalizeAnimPackId(id: string | null | undefined): string {
  if (!id) return "sword_shield";
  const raw = String(id).trim().toLowerCase().replace(/\s+/g, "_");
  const aliases: Record<string, string> = {
    "1h_sword_shield": "sword_shield",
    "1h-sword-shield": "sword_shield",
    swordandshield: "sword_shield",
    bow: "longbow",
    staff: "magic",
    greatsword: "samurai",
    "2h_melee": "samurai",
    "2h": "samurai",
    katana: "samurai",
    dodge: "dash",
    evade: "dash",
    mobility: "dash",
    one_piece: "opb_clips",
    opb: "opb_clips",
    opb_native: "opb_clips",
    bounty_rush: "opb_clips",
    adio: "pistol",
    gun: "pistol",
    handgun: "pistol",
    gunfight: "pistol",
    xbow: "crossbow",
    cross_bow: "crossbow",
    knockback: "reactions",
    flyback: "reactions",
    getup: "reactions",
    hitstun: "reactions",
    parry: "block",
    defense: "block",
    kaykit: "kaykit_clips",
    mace: "mace_1h",
    "1h_mace": "mace_1h",
    hammer: "mace_1h",
    club: "mace_1h",
    axe: "axe_1h",
    "1h_axe": "axe_1h",
    hatchet: "axe_1h",
    greataxe: "axe_1h",
    raidriar: "mace_1h",
    infinity_blade: "mace_1h",
    god_king: "mace_1h",
  };
  if (aliases[raw]) return aliases[raw];
  if (raw.includes("sword") && raw.includes("shield")) return "sword_shield";
  return raw;
}

export const LOCO_BAKED = {
  idle: "locomotion/idle",
  walk: "locomotion/walking",
  run: "locomotion/running",
  jump: "locomotion/jump",
  warcry: "locomotion/standing taunt battlecry",
} as const;
