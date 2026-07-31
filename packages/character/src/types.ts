/** Character quality system types — used by editor, deployer, and game hosts. */

import type { AnimPackId } from "@grudge-studio/assets";

export type { AnimPackId };

export type CharacterKind = "hero" | "npc" | "unit" | "boss" | "civilian";

export interface CharacterIdentity {
  id: string;
  kind: CharacterKind;
  displayName: string;
  /** grudge6 race id: human | barbarian | dwarf | elf | orc | undead */
  raceId: string;
  classId?: string;
  /** Railway character UUID when player-owned */
  characterUuid?: string;
}

export interface CharacterLoadout {
  meshIds?: string[];
  gearPreset?: string;
  weapon?: string;
  animPack?: AnimPackId;
}

export interface CharacterDeployOptions {
  /** Target height metres (heroes 1.8) */
  targetHeightM?: number;
  /** Ground Y for feet */
  groundY?: number;
  /** Art-forward: auto | true | false — grudge6 FBX usually needs +π/2 */
  facePlusZ?: "auto" | boolean;
  /** Strip root/hip .position tracks for uniform grounded motion */
  stripPositionTracks?: boolean;
  importPipeline?: "fbx-atlas" | "glb" | "auto";
}

export interface CharacterQualityReport {
  ok: boolean;
  heightM: number | null;
  feetErrorM: number | null;
  pelvisFound: boolean;
  handRightFound: boolean;
  errors: string[];
  warnings: string[];
}

/** SI contract for all character hosts */
export const CHARACTER_SI = {
  humanHeightM: 1.8,
  heightMinM: 1.55,
  heightMaxM: 2.05,
  feetTolM: 0.08,
  capsuleRadiusM: 0.35,
  capsuleHalfHeightM: 0.55,
} as const;

/**
 * Forbidden processes — agents must not do these.
 * Note: Mixamo → Bip001 retarget is the correct pipeline; the kill is
 * playing raw mixamorig tracks on a Bip001 kit without rematch/bake.
 */
export const CHARACTER_KILL_LIST = [
  "pelvis_y_as_feet",
  "hip_position_tracks_on_grounded_kit",
  /** raw mixamorig tracks on Bip001 without retarget (use MIXAMO_TO_BIP001 bake) */
  "unretargeted_mixamorig_on_bip001",
  "fit_weapon_to_1_8m",
  "meshy_capsule_hero",
  "double_art_forward_yaw",
  "dispose_director_before_pack_load",
] as const;

/** @deprecated alias of unretargeted_mixamorig_on_bip001 */
export const MIXAMORIG_ON_BIP001_KILL = "unretargeted_mixamorig_on_bip001" as const;
