/**
 * One quality system for editor + deployer + runtime hosts.
 */

import { CHARACTER_DEPLOY_STEPS, CHARACTER_KILL_LIST, CHARACTER_SI } from "@grudge-studio/character";
import { BAKE_QUALITY_GATES } from "@grudge-studio/bake";
import { DEFAULT_NPC_CATALOG, DEFAULT_UNIT_CATALOG } from "@grudge-studio/units";
import { DEFAULT_FLEET_URLS } from "@grudge-studio/core";

export type QualityDomain =
  | "bake"
  | "character"
  | "npc"
  | "unit"
  | "editor"
  | "deployer"
  | "runtime_3d";

export interface QualitySystemManifest {
  version: string;
  editorUrl: string;
  cdn: string;
  domains: QualityDomain[];
  characterDeploySteps: readonly string[];
  characterKillList: readonly string[];
  bakeGates: typeof BAKE_QUALITY_GATES;
  si: typeof CHARACTER_SI;
  defaultUnitCount: number;
  defaultNpcCount: number;
  requiredHostPackages: string[];
  requiredNpmSlices: string[];
}

/** SSOT manifest — import from Forge, CI, or game onboarding */
export const QUALITY_SYSTEM: QualitySystemManifest = {
  version: "0.3.0",
  editorUrl: "https://forge.grudge-studio.com",
  cdn: DEFAULT_FLEET_URLS.assets,
  domains: ["bake", "character", "npc", "unit", "editor", "deployer", "runtime_3d"],
  characterDeploySteps: CHARACTER_DEPLOY_STEPS,
  characterKillList: CHARACTER_KILL_LIST,
  bakeGates: BAKE_QUALITY_GATES,
  si: CHARACTER_SI,
  defaultUnitCount: DEFAULT_UNIT_CATALOG.length,
  defaultNpcCount: DEFAULT_NPC_CATALOG.length,
  requiredHostPackages: [
    "three@^0.185",
    "@dimforge/rapier3d-compat OR @react-three/rapier",
  ],
  requiredNpmSlices: [
    "@grudge-studio/sdk",
    "@grudge-studio/character",
    "@grudge-studio/units",
    "@grudge-studio/bake",
    "@grudge-studio/deploy",
    "@grudge-studio/animator",
  ],
};

export function qualityChecklist(): string[] {
  return [
    "[ ] Bake gates green (BAKE_QUALITY_GATES)",
    "[ ] Character deploy steps 1–15 followed",
    "[ ] stripPositionTracks / no hip-Y on grounded kits",
    "[ ] Skeleton Bip001 (SKELETON_CONTRACT / skeletonQualityReport)",
    "[ ] Anim pack from getAnimPack — skeleton matches pipeline",
    "[ ] formatAnimDebugReport / missingRoles checked for WIP packs",
    "[ ] LocomotionCore for combat — weapon skills blend on gait",
    "[ ] combatSkillKit + SKILL_BLEND_PROFILES (no ad-hoc retain numbers)",
    "[ ] Hit windows drive colliders; docs WEAPON_SKILL_BLENDS.md",
    "[ ] Directional: directionalSlotFromXZ or gaitBlendFromSpeed",
    "[ ] CharacterRuntimeState + applyLocoSnapshot each frame",
    "[ ] Deploy graph UUIDs valid (validateGraph / createCharacterDeployBundle)",
    "[ ] NPC/unit defs from @grudge-studio/units (+ ObjectStore extensions)",
    "[ ] Editor = forge.grudge-studio.com (no parallel editor SSOT)",
    "[ ] Deployer uses QUALITY_SYSTEM + stack rewrites",
    "[ ] Host has three + Rapier",
    "[ ] No Meshy/capsule heroes",
  ];
}
