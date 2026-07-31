/**
 * Bake pipeline SSOT — CLI (grudge-convert) implements; npm documents + validates jobs.
 */

import { CHARACTER_SI, GROUNDED_MOTION_CONTRACT } from "@grudge-studio/character";
import {
  ASSET_BEST_PRACTICES,
  bakeJobsForPack,
  packsNeedingBake,
  getAnimSource,
} from "@grudge-studio/assets";

export type BakeTarget =
  | "character_kit"
  | "anim_pack"
  | "weapon"
  | "prop"
  | "building"
  | "terrain_chunk"
  | "unit_mesh";

export interface BakeJob {
  id: string;
  target: BakeTarget;
  /** Source path (FBX/GLB) */
  input: string;
  /** Output GLB / JSON key under R2 */
  outputKey: string;
  /** SI: force human fit for character_kit only */
  fitHumanHeight?: boolean;
  /** Always true for anim packs on grounded kits */
  rotationOnlyAnims?: boolean;
  stripPositionTracks?: boolean;
  textureWebp?: boolean;
  draco?: boolean;
  colliderBake?: boolean;
}

export interface BakeQualityGate {
  id: string;
  description: string;
  required: boolean;
}

/** Gates every bake must document; CLI maps to validators */
export const BAKE_QUALITY_GATES: BakeQualityGate[] = [
  {
    id: "magic_bytes_glb",
    description: "Output starts with glTF magic bytes, not HTML",
    required: true,
  },
  {
    id: "si_units",
    description: "1 unit = 1 m; characters 1.55–2.05 m after fit",
    required: true,
  },
  {
    id: "rotation_only_anims",
    description: "Baked skill/loco clips strip .position on hip/root for grounded use",
    required: true,
  },
  {
    id: "no_meshy",
    description: "No Meshy placeholder heroes",
    required: true,
  },
  {
    id: "atlas_or_maps",
    description: "Textures present; not 1×1 yellow",
    required: true,
  },
  {
    id: "cdn_key_stable",
    description: "R2 key stable for fleet loaders",
    required: true,
  },
];

export const BAKE_DEFAULTS = {
  humanHeightM: CHARACTER_SI.humanHeightM,
  motion: GROUNDED_MOTION_CONTRACT,
  practices: ASSET_BEST_PRACTICES,
  /** Local CLI path convention */
  convertCli: "ObjectStore/tools/grudge-convert",
  forgeEditor: "https://forge.grudge-studio.com",
} as const;

export function validateBakeJob(job: BakeJob): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!job.input) errors.push("input_required");
  if (!job.outputKey) errors.push("outputKey_required");
  if (job.target === "character_kit" && job.fitHumanHeight === false) {
    errors.push("character_kit_should_fit_human");
  }
  if (job.target === "anim_pack" && job.rotationOnlyAnims === false) {
    errors.push("anim_pack_must_be_rotation_only_for_grounded");
  }
  return { ok: errors.length === 0, errors };
}

/** Recommend flags by target */
export function recommendedBakeFlags(target: BakeTarget): Partial<BakeJob> {
  switch (target) {
    case "character_kit":
      return {
        fitHumanHeight: true,
        textureWebp: true,
        draco: true,
        colliderBake: true,
        stripPositionTracks: false,
      };
    case "anim_pack":
      return {
        rotationOnlyAnims: true,
        stripPositionTracks: true,
        fitHumanHeight: false,
      };
    case "weapon":
    case "prop":
      return { fitHumanHeight: false, textureWebp: true, draco: true, colliderBake: true };
    default:
      return { textureWebp: true, draco: true };
  }
}

/**
 * Expand registry packs that need bake into BakeJob list.
 * Inputs are relative to unity_mixamo_library localPath when available.
 */
export function bakeJobsFromAnimRegistry(packIds?: string[]): BakeJob[] {
  const unity = getAnimSource("unity_mixamo_library");
  const base = unity?.localPath ?? "";
  const ids = packIds?.length
    ? packIds
    : packsNeedingBake().map((p) => p.id);
  const jobs: BakeJob[] = [];
  for (const id of ids) {
    for (const j of bakeJobsForPack(id)) {
      const input = base
        ? `${base.replace(/\\/g, "/")}/${j.inputRel}`
        : j.inputRel;
      jobs.push({
        id: `anim_${id}_${j.skillOrRole}_${jobs.length}`,
        target: "anim_pack",
        input,
        outputKey: j.outputKey,
        rotationOnlyAnims: j.rotationOnly,
        stripPositionTracks: true,
      });
    }
  }
  return jobs;
}
