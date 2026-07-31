/**
 * Character deploy pipeline — ordered steps for editor + game hosts.
 * Pure contract + helpers; hosts supply THREE roots.
 */

import type { CharacterDeployOptions, CharacterQualityReport } from "./types";
import { CHARACTER_SI } from "./types";
import { GROUNDED_MOTION_CONTRACT } from "./motion";
import { weaponToAnimPack } from "@grudge-studio/assets";

export { weaponToAnimPack };

/** Ordered deploy steps — implement each in host or use gameopen characterDeploy */
export const CHARACTER_DEPLOY_STEPS = [
  "load_kit",
  "unify_skeletons",
  "box3_fit_height",
  "atlas_rebind",
  "equip_mesh_ids",
  "reground_after_equip",
  "art_forward_plus_z",
  "center_xz_pelvis",
  "ground_feet_min_y",
  "load_anim_pack_strip_position",
  "animation_director_idle",
  "sample_and_reground",
  "wire_skills_colliders",
  "capsule_surface_locomotion",
  "diagnose_quality",
] as const;

export type CharacterDeployStep = (typeof CHARACTER_DEPLOY_STEPS)[number];

export function defaultDeployOptions(
  partial: CharacterDeployOptions = {},
): Required<
  Pick<
    CharacterDeployOptions,
    "targetHeightM" | "groundY" | "facePlusZ" | "stripPositionTracks" | "importPipeline"
  >
> {
  return {
    targetHeightM: partial.targetHeightM ?? CHARACTER_SI.humanHeightM,
    groundY: partial.groundY ?? 0,
    facePlusZ: partial.facePlusZ ?? "auto",
    stripPositionTracks: partial.stripPositionTracks ?? true,
    importPipeline: partial.importPipeline ?? "auto",
  };
}

/** Recommend art-forward yaw for grudge6 FBX kits */
export function recommendArtForwardYaw(
  importPipeline: CharacterDeployOptions["importPipeline"],
  raceId?: string,
): number {
  if (importPipeline === "glb") return 0;
  // grudge6 / Toon RTS FBX art faces +X; controller +Z
  if (importPipeline === "fbx-atlas" || importPipeline === "auto") return Math.PI / 2;
  void raceId;
  return Math.PI / 2;
}

export function evaluateHeightQuality(heightM: number | null): {
  ok: boolean;
  error?: string;
} {
  if (heightM == null || !Number.isFinite(heightM)) {
    return { ok: false, error: "height_unknown" };
  }
  if (heightM < CHARACTER_SI.heightMinM || heightM > CHARACTER_SI.heightMaxM) {
    return {
      ok: false,
      error: `height_out_of_range:${heightM.toFixed(2)}m (want ${CHARACTER_SI.heightMinM}–${CHARACTER_SI.heightMaxM})`,
    };
  }
  return { ok: true };
}

export function evaluateFeetQuality(feetErrorM: number | null): {
  ok: boolean;
  error?: string;
} {
  if (feetErrorM == null || !Number.isFinite(feetErrorM)) {
    return { ok: false, error: "feet_unknown" };
  }
  if (Math.abs(feetErrorM) > CHARACTER_SI.feetTolM) {
    return {
      ok: false,
      error: `feet_error:${feetErrorM.toFixed(3)}m (tol ${CHARACTER_SI.feetTolM})`,
    };
  }
  return { ok: true };
}

export function buildQualityReport(input: {
  heightM: number | null;
  feetErrorM: number | null;
  pelvisFound: boolean;
  handRightFound: boolean;
  extraErrors?: string[];
  extraWarnings?: string[];
}): CharacterQualityReport {
  const errors: string[] = [...(input.extraErrors ?? [])];
  const warnings: string[] = [...(input.extraWarnings ?? [])];
  const h = evaluateHeightQuality(input.heightM);
  if (!h.ok && h.error) errors.push(h.error);
  const f = evaluateFeetQuality(input.feetErrorM);
  if (!f.ok && f.error) errors.push(f.error);
  if (!input.pelvisFound) errors.push("pelvis_bone_missing");
  if (!input.handRightFound) warnings.push("right_hand_missing");
  return {
    ok: errors.length === 0,
    heightM: input.heightM,
    feetErrorM: input.feetErrorM,
    pelvisFound: input.pelvisFound,
    handRightFound: input.handRightFound,
    errors,
    warnings,
  };
}

export const MOTION = GROUNDED_MOTION_CONTRACT;
