/**
 * Character / combat state machine — pure data for hosts + editor.
 * Pair with LocomotionCore for anim; UUID nodes for deploy graph.
 */

export type LocomotionState =
  | "idle"
  | "walk"
  | "run"
  | "sprint"
  | "jump"
  | "fall"
  | "land"
  | "swim"
  | "climb"
  | "mount"
  | "boat";

export type CombatState =
  | "ready"
  | "windup"
  | "active"
  | "recovery"
  | "block"
  | "parry"
  | "hitstun"
  | "knockback"
  | "flyback"
  | "down"
  | "getup"
  | "stun"
  | "dead";

export type SurfaceState =
  | "ground"
  | "wade"
  | "swim"
  | "climb"
  | "wallRun"
  | "mount"
  | "boat"
  | "fly";

export interface CharacterRuntimeState {
  /** Stable entity uuid (deploy graph / net) */
  uuid?: string;
  locomotion: LocomotionState;
  combat: CombatState;
  surface: SurfaceState;
  /** Active weapon skill id or null */
  skillId: string | null;
  /** Anim pack id */
  animPack: string;
  /** 0–1 move intent */
  moveSpeed01: number;
  sprinting: boolean;
  /** Weapon collider should be live */
  weaponColliderActive: boolean;
  /** In skill hit window */
  inHitWindow: boolean;
  /** Skill progress 0–1 */
  skillProgress: number;
  /** Facing yaw radians */
  yaw: number;
}

export function createDefaultCharacterState(
  partial: Partial<CharacterRuntimeState> = {},
): CharacterRuntimeState {
  return {
    locomotion: "idle",
    combat: "ready",
    surface: "ground",
    skillId: null,
    animPack: "sword_shield",
    moveSpeed01: 0,
    sprinting: false,
    weaponColliderActive: false,
    inHitWindow: false,
    skillProgress: 0,
    yaw: 0,
    ...partial,
  };
}

/** Derive locomotion label from speed */
export function locomotionFromSpeed(
  speed01: number,
  sprinting: boolean,
): LocomotionState {
  if (speed01 < 0.05) return "idle";
  if (sprinting) return "sprint";
  if (speed01 < 0.45) return "walk";
  return "run";
}

/** Combat phase from skill progress + hit window */
export function combatFromSkillProgress(
  busy: boolean,
  progress: number,
  hitWindow: [number, number] = [0.28, 0.55],
): CombatState {
  if (!busy) return "ready";
  if (progress < hitWindow[0]) return "windup";
  if (progress <= hitWindow[1]) return "active";
  return "recovery";
}

/**
 * Snapshot from LocomotionCore-like runtime (duck-typed to avoid package cycle).
 * Call after loco.update(dt) each frame.
 */
export interface LocoSkillSnapshot {
  busy: boolean;
  skillId: string | null;
  progress: number;
  inHitWindow: boolean;
  weaponColliderActive: boolean;
  gait?: LocomotionState | string;
}

export function applyLocoSnapshot(
  state: CharacterRuntimeState,
  snap: LocoSkillSnapshot,
  move: { speed01: number; sprinting: boolean },
): CharacterRuntimeState {
  const hitWindow: [number, number] = [0.28, 0.55];
  return {
    ...state,
    moveSpeed01: move.speed01,
    sprinting: move.sprinting,
    locomotion:
      (snap.gait as LocomotionState | undefined) ??
      locomotionFromSpeed(move.speed01, move.sprinting),
    skillId: snap.skillId,
    skillProgress: snap.progress,
    inHitWindow: snap.inHitWindow,
    weaponColliderActive: snap.weaponColliderActive,
    combat: combatFromSkillProgress(snap.busy, snap.progress, hitWindow),
  };
}

export interface StateTransitionEvent {
  type:
    | "move"
    | "stop"
    | "sprint"
    | "skill_start"
    | "skill_end"
    | "skill_tick"
    | "hit"
    | "knockback"
    | "flyback"
    | "down"
    | "getup"
    | "stun"
    | "block"
    | "parry"
    | "die"
    | "surface"
    | "anim_pack";
  payload?: Record<string, unknown>;
}

/**
 * Tiny reducer for UI / net sync — host applies to CharacterRuntimeState.
 */
export function reduceCharacterState(
  state: CharacterRuntimeState,
  ev: StateTransitionEvent,
): CharacterRuntimeState {
  const next = { ...state };
  switch (ev.type) {
    case "move":
      next.moveSpeed01 = Number(ev.payload?.speed01 ?? 0.7);
      next.sprinting = !!ev.payload?.sprint;
      next.locomotion = locomotionFromSpeed(next.moveSpeed01, next.sprinting);
      break;
    case "stop":
      next.moveSpeed01 = 0;
      next.sprinting = false;
      next.locomotion = "idle";
      break;
    case "sprint":
      next.sprinting = !!ev.payload?.on;
      if (next.moveSpeed01 > 0.05) {
        next.locomotion = locomotionFromSpeed(next.moveSpeed01, next.sprinting);
      }
      break;
    case "skill_start":
      next.skillId = String(ev.payload?.skillId ?? "skill");
      next.combat = "windup";
      next.skillProgress = 0;
      next.inHitWindow = false;
      next.weaponColliderActive = false;
      break;
    case "skill_tick": {
      const progress = Number(ev.payload?.progress ?? 0);
      const hitWindow = (ev.payload?.hitWindow as [number, number]) ?? [
        0.28, 0.55,
      ];
      next.skillProgress = progress;
      next.combat = combatFromSkillProgress(true, progress, hitWindow);
      next.inHitWindow = progress >= hitWindow[0] && progress <= hitWindow[1];
      next.weaponColliderActive = !!(
        ev.payload?.weaponCollider !== false && next.inHitWindow
      );
      break;
    }
    case "skill_end":
      next.skillId = null;
      next.combat = "ready";
      next.weaponColliderActive = false;
      next.inHitWindow = false;
      next.skillProgress = 0;
      break;
    case "hit":
      next.combat = "hitstun";
      next.weaponColliderActive = false;
      break;
    case "knockback":
      next.combat = "knockback";
      next.weaponColliderActive = false;
      break;
    case "flyback":
      next.combat = "flyback";
      next.weaponColliderActive = false;
      break;
    case "down":
      next.combat = "down";
      next.moveSpeed01 = 0;
      next.weaponColliderActive = false;
      break;
    case "getup":
      next.combat = "getup";
      break;
    case "stun":
      next.combat = "stun";
      next.moveSpeed01 = 0;
      break;
    case "block":
      next.combat = "block";
      break;
    case "parry":
      next.combat = "parry";
      break;
    case "die":
      next.combat = "dead";
      next.locomotion = "idle";
      next.skillId = null;
      next.weaponColliderActive = false;
      break;
    case "surface":
      next.surface = (ev.payload?.surface as SurfaceState) ?? "ground";
      break;
    case "anim_pack":
      next.animPack = String(ev.payload?.animPack ?? next.animPack);
      break;
    default:
      break;
  }
  return next;
}

/** JSON-safe patch for multiplayer / save */
export function stateToNetPatch(
  state: CharacterRuntimeState,
): Record<string, unknown> {
  return {
    uuid: state.uuid,
    locomotion: state.locomotion,
    combat: state.combat,
    surface: state.surface,
    skillId: state.skillId,
    animPack: state.animPack,
    moveSpeed01: state.moveSpeed01,
    sprinting: state.sprinting,
    weaponColliderActive: state.weaponColliderActive,
    inHitWindow: state.inHitWindow,
    skillProgress: state.skillProgress,
    yaw: state.yaw,
  };
}
