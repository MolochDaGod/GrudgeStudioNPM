"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BAKE_DEFAULTS: () => BAKE_DEFAULTS,
  BAKE_QUALITY_GATES: () => BAKE_QUALITY_GATES,
  bakeJobsFromAnimRegistry: () => bakeJobsFromAnimRegistry,
  recommendedBakeFlags: () => recommendedBakeFlags,
  validateBakeJob: () => validateBakeJob
});
module.exports = __toCommonJS(index_exports);

// src/pipeline.ts
var import_character = require("@grudge-studio/character");
var import_assets = require("@grudge-studio/assets");
var BAKE_QUALITY_GATES = [
  {
    id: "magic_bytes_glb",
    description: "Output starts with glTF magic bytes, not HTML",
    required: true
  },
  {
    id: "si_units",
    description: "1 unit = 1 m; characters 1.55\u20132.05 m after fit",
    required: true
  },
  {
    id: "rotation_only_anims",
    description: "Baked skill/loco clips strip .position on hip/root for grounded use",
    required: true
  },
  {
    id: "no_meshy",
    description: "No Meshy placeholder heroes",
    required: true
  },
  {
    id: "atlas_or_maps",
    description: "Textures present; not 1\xD71 yellow",
    required: true
  },
  {
    id: "cdn_key_stable",
    description: "R2 key stable for fleet loaders",
    required: true
  }
];
var BAKE_DEFAULTS = {
  humanHeightM: import_character.CHARACTER_SI.humanHeightM,
  motion: import_character.GROUNDED_MOTION_CONTRACT,
  practices: import_assets.ASSET_BEST_PRACTICES,
  /** Local CLI path convention */
  convertCli: "ObjectStore/tools/grudge-convert",
  forgeEditor: "https://forge.grudge-studio.com"
};
function validateBakeJob(job) {
  const errors = [];
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
function recommendedBakeFlags(target) {
  switch (target) {
    case "character_kit":
      return {
        fitHumanHeight: true,
        textureWebp: true,
        draco: true,
        colliderBake: true,
        stripPositionTracks: false
      };
    case "anim_pack":
      return {
        rotationOnlyAnims: true,
        stripPositionTracks: true,
        fitHumanHeight: false
      };
    case "weapon":
    case "prop":
      return { fitHumanHeight: false, textureWebp: true, draco: true, colliderBake: true };
    default:
      return { textureWebp: true, draco: true };
  }
}
function bakeJobsFromAnimRegistry(packIds) {
  const unity = (0, import_assets.getAnimSource)("unity_mixamo_library");
  const base = unity?.localPath ?? "";
  const ids = packIds?.length ? packIds : (0, import_assets.packsNeedingBake)().map((p) => p.id);
  const jobs = [];
  for (const id of ids) {
    for (const j of (0, import_assets.bakeJobsForPack)(id)) {
      const input = base ? `${base.replace(/\\/g, "/")}/${j.inputRel}` : j.inputRel;
      jobs.push({
        id: `anim_${id}_${j.skillOrRole}_${jobs.length}`,
        target: "anim_pack",
        input,
        outputKey: j.outputKey,
        rotationOnlyAnims: j.rotationOnly,
        stripPositionTracks: true
      });
    }
  }
  return jobs;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BAKE_DEFAULTS,
  BAKE_QUALITY_GATES,
  bakeJobsFromAnimRegistry,
  recommendedBakeFlags,
  validateBakeJob
});
//# sourceMappingURL=index.cjs.map