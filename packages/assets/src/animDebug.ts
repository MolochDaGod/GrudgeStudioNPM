/**
 * Animation asset debug — inventory reports, missing slots, blend recommendations.
 * Hosts print these to HUD / console during development.
 */

import {
  ANIM_PACKS,
  type AnimPackDef,
  type BakeStatus,
  type ClipRole,
  getAnimPack,
  packsNeedingBake,
} from "./animPacks";
import { ANIM_SOURCE_ROOTS, type SkeletonRuntime } from "./animSources";
import {
  formatWeaponSkillAnimCatalog,
  listAllWeaponSkillAnims,
  weaponSkillsForPack,
} from "./weaponSkillAnims";

export interface PackDebugLine {
  packId: string;
  label: string;
  skeleton: SkeletonRuntime;
  bakeStatus: BakeStatus;
  sourceRootId: string;
  clipRoles: ClipRole[];
  skillCount: number;
  hasDirectional: boolean;
  okForProduction: boolean;
  warnings: string[];
}

export interface AnimSystemDebugReport {
  generatedAt: string;
  sources: Array<{ id: string; pipeline: string; skeleton: string; pathHint: string }>;
  packs: PackDebugLine[];
  needsBake: string[];
  weaponSkillCount: number;
  weaponSkillsByPack: Record<string, number>;
  practices: string[];
}

function packLine(p: AnimPackDef): PackDebugLine {
  const warnings: string[] = [];
  const roles = Object.keys(p.clips) as ClipRole[];
  if (!p.clips.idle && p.skeleton === "bip001") {
    warnings.push("missing idle");
  }
  if (!p.clips.walk && !p.clips.run && p.bakeStatus !== "needs_bake") {
    warnings.push("missing walk/run loco");
  }
  if (p.bakeStatus === "needs_bake") {
    warnings.push("FBX not baked — do not load raw Mixamo on Bip001");
  }
  if (p.skeleton === "opb" || p.skeleton === "kaykit") {
    warnings.push("native skeleton — do not rematch to Bip001");
  }
  if (p.skills.length === 0) warnings.push("no skill defs");
  const okForProduction =
    p.bakeStatus === "production_baked" ||
    p.bakeStatus === "native_embedded" ||
    p.bakeStatus === "library_shared";
  return {
    packId: p.id,
    label: p.label,
    skeleton: p.skeleton,
    bakeStatus: p.bakeStatus,
    sourceRootId: p.sourceRootId,
    clipRoles: roles,
    skillCount: p.skills.length,
    hasDirectional: !!p.directional,
    okForProduction,
    warnings,
  };
}

/** Full system report for /debug UI or CI */
export function buildAnimSystemDebugReport(): AnimSystemDebugReport {
  const allSkills = listAllWeaponSkillAnims();
  const weaponSkillsByPack: Record<string, number> = {};
  for (const s of allSkills) {
    weaponSkillsByPack[s.animPack] = (weaponSkillsByPack[s.animPack] ?? 0) + 1;
  }
  return {
    generatedAt: new Date().toISOString(),
    sources: ANIM_SOURCE_ROOTS.map((s) => ({
      id: s.id,
      pipeline: s.pipeline,
      skeleton: s.skeleton,
      pathHint: s.pathHint,
    })),
    packs: ANIM_PACKS.map(packLine),
    needsBake: packsNeedingBake().map((p) => p.id),
    weaponSkillCount: allSkills.length,
    weaponSkillsByPack,
    practices: [
      "Mixamo FBX → retarget MIXAMO_TO_BIP001 → strip hip-Y → bake JSON",
      "Flare/OPB/KayKit = CLIP HARVEST ONLY — not playable heroes",
      "Adio GLB for pistol/crossbow; Raidriar B_MF→Bip001 for mace_1h/axe_1h",
      "Weapon skills: combatSkillKit + SKILL_BLEND_PROFILES + LocomotionCore",
      "Docs: packages/assets/docs/WEAPON_SKILL_BLENDS.md",
      "Reactions + block + dash shared via combatSkillKit",
      "Hit window drives colliders; base layer always locomotion",
      "Directional: directionalSlotFromXZ → clipRoleForDirection",
      "Never play unretargeted mixamorig tracks on Bip001 kits",
      "Prefer same-origin /anims/baked then assets CDN",
    ],
  };
}

/** Compact console-friendly string */
export function formatAnimDebugReport(report?: AnimSystemDebugReport): string {
  const r = report ?? buildAnimSystemDebugReport();
  const lines: string[] = [
    `=== Anim system debug (${r.generatedAt}) ===`,
    `Sources: ${r.sources.length}`,
    ...r.sources.map((s) => `  [${s.pipeline}] ${s.id} (${s.skeleton}) → ${s.pathHint}`),
    `Packs: ${r.packs.length}`,
  ];
  for (const p of r.packs) {
    const flag = p.okForProduction ? "OK" : "WIP";
    lines.push(
      `  [${flag}] ${p.packId} skel=${p.skeleton} bake=${p.bakeStatus} skills=${p.skillCount} roles=${p.clipRoles.join(",")}`,
    );
    for (const w of p.warnings) lines.push(`      ! ${w}`);
  }
  if (r.needsBake.length) {
    lines.push(`Needs bake: ${r.needsBake.join(", ")}`);
  }
  lines.push(`Weapon skills: ${r.weaponSkillCount}`);
  for (const [pack, n] of Object.entries(r.weaponSkillsByPack)) {
    lines.push(`  ${pack}: ${n}`);
  }
  lines.push("Practices:");
  for (const pr of r.practices) lines.push(`  · ${pr}`);
  return lines.join("\n");
}

/** Pack skill + blend dump for HUD */
export function formatPackSkillDebug(packId: string): string {
  const skills = weaponSkillsForPack(packId);
  return formatWeaponSkillAnimCatalog(packId) + `\n(${skills.length} skills)`;
}

/** Runtime snapshot: which clips loaded for a pack */
export interface LoadedClipDebug {
  packId: string;
  role: string;
  requestedKeys: string[];
  resolvedKey: string | null;
  duration?: number;
  trackCount?: number;
}

export function missingRoles(
  packId: string,
  loadedRoles: Iterable<string>,
): ClipRole[] {
  const pack = getAnimPack(packId);
  const have = new Set(loadedRoles);
  const want = Object.keys(pack.clips) as ClipRole[];
  return want.filter((r) => !have.has(r));
}

/**
 * Blend practice recommendation for a skill on current gait.
 * Hosts log this when debugging “why did loco freeze”.
 */
export function blendPracticeHint(opts: {
  skillId: string;
  blendOnLocomotion: boolean;
  upperBodyWeight?: number;
  locomotionSkill?: boolean;
  moving: boolean;
}): string {
  const w = opts.upperBodyWeight ?? 1;
  if (opts.locomotionSkill) {
    return `[${opts.skillId}] full-body mobility: locoScale≈0.1–0.2 during dash; restore gait after fadeOut`;
  }
  if (opts.blendOnLocomotion && opts.moving) {
    return `[${opts.skillId}] upper-body blend: skillW=${w.toFixed(2)} retain loco≈0.55×(1-skill×0.5); continuous gait OK`;
  }
  if (opts.blendOnLocomotion) {
    return `[${opts.skillId}] standing skill: allowLocomotion true but speed≈0 → idle under skill`;
  }
  return `[${opts.skillId}] full-body skill: freeze/reduce loco to ~0.12; no run blend until recovery`;
}

/** Directional debug: human-readable move vector → slot → role */
export function directionalDebugLine(
  packId: string,
  x: number,
  z: number,
  slotFn: (x: number, z: number) => string,
  roleFn: (packId: string, slot: string) => string,
): string {
  const slot = slotFn(x, z);
  const role = roleFn(packId, slot);
  return `dir xz=(${x.toFixed(2)},${z.toFixed(2)}) → slot=${slot} → role=${role} pack=${packId}`;
}

/** Layer weight snapshot for HUD */
export function formatLayerWeights(w: {
  locomotion: number;
  upper_body: number;
  full_body_skill: number;
  additive?: number;
}): string {
  return `loco=${w.locomotion.toFixed(2)} upper=${w.upper_body.toFixed(2)} full=${w.full_body_skill.toFixed(2)} add=${(w.additive ?? 0).toFixed(2)}`;
}
