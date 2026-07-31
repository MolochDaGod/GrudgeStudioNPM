/**
 * LocomotionCore — gait + blended weapon skill overlays on the same mixer.
 *
 * Design:
 *   - Locomotion (idle/walk/run/sprint) is always the *base* layer
 *   - Weapon skills are upper-body / full-body one-shots with configurable
 *     blend weight so run does not fully stop during slash
 *   - Hit windows + weapon collider hooks are data, not UI
 *   - Skill end is driven by update() (no setTimeout drift)
 *
 * Duck-typed THREE.AnimationMixer (no hard three import).
 */

import type { ActionLike, LocoClips, MixerLike } from "./director";
import {
  gaitBlendFromSpeed,
  skillOnLocoWeights,
  type LayerWeights,
} from "./blend";

const LOOP_REPEAT = 2201;
const LOOP_ONCE = 2200;

export interface WeaponSkillDef {
  id: string;
  /** Display / hotbar */
  name?: string;
  /** Clip to play as overlay */
  clip: unknown;
  /** 0–1 upper-body weight while skill plays; rest stays loco */
  upperBodyWeight?: number;
  /** Fade in/out seconds */
  fadeIn?: number;
  fadeOut?: number;
  /** Hit window as fraction of clip duration [start, end] */
  hitWindow?: [number, number];
  /** Melee range metres */
  rangeM?: number;
  /** Enable hand weapon collider during hit window */
  weaponCollider?: boolean;
  /** Allow casting while moving (keep loco weights) */
  allowLocomotion?: boolean;
  /** Cooldown seconds */
  cooldownS?: number;
  /** Optional anim pack id for deploy graphs */
  animPack?: string;
}

export interface LocomotionCoreOptions {
  fade?: number;
  /** Walk speed threshold as fraction of max (0–1). Below → walk, above → run */
  walkSpeedFrac?: number;
  /** When skill plays, multiply loco weight by this (0 = freeze loco) */
  skillLocoRetain?: number;
  /**
   * Use continuous multi-clip gait weights (idle∩walk∩run) instead of hard switch.
   * Default true for smoother combat locomotion.
   */
  continuousGait?: boolean;
}

export type GaitId = "idle" | "walk" | "run" | "sprint";

export interface SkillRuntimeState {
  skillId: string | null;
  busy: boolean;
  /** 0–1 through active skill */
  progress: number;
  inHitWindow: boolean;
  weaponColliderActive: boolean;
}

/**
 * Core that hosts own locomotion AND weapon skill blend.
 * Prefer this over bare AnimationDirector when shipping combat.
 */
export class LocomotionCore {
  private mixer: MixerLike;
  private idle: ActionLike;
  private walk: ActionLike;
  private run: ActionLike;
  private sprint: ActionLike;
  private fade: number;
  private walkSpeedFrac: number;
  private skillLocoRetain: number;
  private continuousGait: boolean;

  private moving = false;
  private speed01 = 0;
  private sprinting = false;

  private overlay: ActionLike | null = null;
  private activeSkill: WeaponSkillDef | null = null;
  private skillElapsed = 0;
  private skillDuration = 0.6;
  private skillUpper = 1;
  private skillFadeOut = 0.12;
  private skillEnding = false;
  private cdUntil = new Map<string, number>();
  private now = 0;

  /** Last computed layer weights (debug / UI) */
  layerWeights: LayerWeights = {
    locomotion: 1,
    upper_body: 0,
    full_body_skill: 0,
    additive: 0,
  };

  readonly skillState: SkillRuntimeState = {
    skillId: null,
    busy: false,
    progress: 0,
    inHitWindow: false,
    weaponColliderActive: false,
  };

  constructor(mixer: MixerLike, clips: LocoClips, opts: LocomotionCoreOptions = {}) {
    this.mixer = mixer;
    this.fade = opts.fade ?? 0.12;
    this.walkSpeedFrac = opts.walkSpeedFrac ?? 0.45;
    this.skillLocoRetain = opts.skillLocoRetain ?? 0.55;
    this.continuousGait = opts.continuousGait !== false;

    this.idle = mixer.clipAction(clips.idle);
    this.walk = mixer.clipAction(clips.walk);
    this.run = mixer.clipAction(clips.run);
    this.sprint = mixer.clipAction(clips.sprint ?? clips.run);

    for (const a of [this.idle, this.walk, this.run, this.sprint]) {
      a.setLoop(LOOP_REPEAT, Infinity);
      a.setEffectiveWeight(0);
      a.play();
    }
    this.idle.setEffectiveWeight(1);
  }

  /**
   * @param moving - any locomotion intent
   * @param speed01 - 0 idle … 1 full run (host maps WASD magnitude)
   * @param sprinting - hold sprint
   */
  setGaitTarget(moving: boolean, speed01 = 0, sprinting = false): void {
    this.moving = moving;
    this.speed01 = Math.max(0, Math.min(1, speed01));
    this.sprinting = sprinting && moving;
  }

  /** Compatibility with AnimationDirector API (moving, sprinting) */
  setGaitMoving(moving: boolean, sprinting = false): void {
    this.setGaitTarget(moving, moving ? (sprinting ? 1 : 0.7) : 0, sprinting);
  }

  get busy(): boolean {
    return this.skillState.busy;
  }

  get currentGait(): GaitId {
    return this.resolveGait();
  }

  /** Remaining cooldown for skill id (seconds), 0 if ready */
  cooldownRemaining(skillId: string): number {
    const until = this.cdUntil.get(skillId) ?? 0;
    return Math.max(0, until - this.now);
  }

  /**
   * Play weapon skill blended over locomotion core.
   * Returns false if on cooldown or blocked.
   */
  playWeaponSkill(skill: WeaponSkillDef): boolean {
    const until = this.cdUntil.get(skill.id) ?? 0;
    if (this.now < until) return false;
    // Allow re-fire only when allowLocomotion (cancel/replace current)
    if (this.skillState.busy && !skill.allowLocomotion) return false;

    const fadeIn = skill.fadeIn ?? 0.08;
    const fadeOut = skill.fadeOut ?? 0.12;

    if (this.overlay) {
      try {
        this.overlay.fadeOut(fadeIn);
      } catch {
        /* ignore */
      }
    }

    const action = this.mixer.clipAction(skill.clip);
    action.reset();
    action.setLoop(LOOP_ONCE, 1);
    action.clampWhenFinished = false;
    action.setEffectiveWeight(skill.upperBodyWeight ?? 1);
    action.fadeIn(fadeIn).play();

    this.overlay = action;
    this.activeSkill = skill;
    this.skillElapsed = 0;
    this.skillDuration = Math.max(0.15, action.getClip().duration || 0.6);
    this.skillUpper = skill.upperBodyWeight ?? 1;
    this.skillFadeOut = fadeOut;
    this.skillEnding = false;

    this.skillState.skillId = skill.id;
    this.skillState.busy = true;
    this.skillState.progress = 0;
    this.skillState.inHitWindow = false;
    this.skillState.weaponColliderActive = false;

    if (skill.cooldownS && skill.cooldownS > 0) {
      this.cdUntil.set(skill.id, this.now + skill.cooldownS);
    }

    return true;
  }

  /** Force-cancel active skill overlay */
  cancelSkill(fadeOut?: number): void {
    if (!this.skillState.busy) return;
    const fo = fadeOut ?? this.skillFadeOut;
    if (this.overlay) {
      try {
        this.overlay.fadeOut(fo);
      } catch {
        /* ignore */
      }
    }
    this.clearSkillState();
  }

  /** @deprecated use playWeaponSkill */
  requestOneShot(clip: unknown, opts: { fade?: number } = {}): boolean {
    return this.playWeaponSkill({
      id: "oneshot",
      clip,
      fadeIn: opts.fade,
      upperBodyWeight: 1,
      allowLocomotion: true,
    });
  }

  private resolveGait(): GaitId {
    if (!this.moving || this.speed01 < 0.05) return "idle";
    if (this.sprinting) return "sprint";
    if (this.speed01 < this.walkSpeedFrac) return "walk";
    return "run";
  }

  private clearSkillState(): void {
    this.overlay = null;
    this.activeSkill = null;
    this.skillEnding = false;
    this.skillState.skillId = null;
    this.skillState.busy = false;
    this.skillState.progress = 0;
    this.skillState.inHitWindow = false;
    this.skillState.weaponColliderActive = false;
    this.layerWeights = {
      locomotion: 1,
      upper_body: 0,
      full_body_skill: 0,
      additive: 0,
    };
  }

  private endSkill(): void {
    if (this.skillEnding) return;
    this.skillEnding = true;
    if (this.overlay) {
      try {
        this.overlay.fadeOut(this.skillFadeOut);
      } catch {
        /* ignore */
      }
    }
    this.clearSkillState();
  }

  update(dt: number): void {
    this.now += dt;

    if (this.skillState.busy && this.activeSkill) {
      this.skillElapsed += dt;
      const p = Math.min(1, this.skillElapsed / this.skillDuration);
      this.skillState.progress = p;
      const hw = this.activeSkill.hitWindow ?? [0.28, 0.55];
      const inHit = p >= hw[0] && p <= hw[1];
      this.skillState.inHitWindow = inHit;
      this.skillState.weaponColliderActive = !!(
        this.activeSkill.weaponCollider !== false && inHit
      );

      if (this.skillElapsed >= this.skillDuration) {
        this.endSkill();
      }
    }

    // Layer weights for skill-on-loco
    if (this.skillState.busy && this.activeSkill) {
      this.layerWeights = skillOnLocoWeights({
        skillWeight: this.skillUpper,
        allowLocomotion: this.activeSkill.allowLocomotion,
        skillLocoRetain: this.skillLocoRetain,
      });
    } else {
      this.layerWeights = {
        locomotion: 1,
        upper_body: 0,
        full_body_skill: 0,
        additive: 0,
      };
    }

    const locoScale = this.layerWeights.locomotion;

    if (this.continuousGait && this.moving) {
      const g = gaitBlendFromSpeed(
        this.speed01,
        this.sprinting,
        this.walkSpeedFrac,
      );
      this.idle.setEffectiveWeight(g.idle * locoScale);
      this.walk.setEffectiveWeight(g.walk * locoScale);
      this.run.setEffectiveWeight(g.run * locoScale);
      this.sprint.setEffectiveWeight(g.sprint * locoScale);
    } else {
      const gait = this.resolveGait();
      const actions: Record<GaitId, ActionLike> = {
        idle: this.idle,
        walk: this.walk,
        run: this.run,
        sprint: this.sprint,
      };
      const want = actions[gait];
      for (const a of [this.idle, this.walk, this.run, this.sprint]) {
        if (a === want) a.setEffectiveWeight(locoScale);
        else a.setEffectiveWeight(0);
      }
    }

    if (this.overlay && this.skillState.busy) {
      try {
        this.overlay.setEffectiveWeight(this.skillUpper);
      } catch {
        /* ignore */
      }
    }

    this.mixer.update(dt);
  }

  dispose(): void {
    for (const a of [this.idle, this.walk, this.run, this.sprint]) {
      try {
        a.stop();
      } catch {
        /* ignore */
      }
    }
    this.clearSkillState();
  }
}

/** Default hit window fractions when clip has no events */
export const DEFAULT_MELEE_HIT_WINDOW: [number, number] = [0.28, 0.55];

export function makeMeleeSkill(
  id: string,
  clip: unknown,
  rangeM = 2.5,
  extra: Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  return {
    id,
    clip,
    rangeM,
    upperBodyWeight: 0.95,
    allowLocomotion: true,
    hitWindow: DEFAULT_MELEE_HIT_WINDOW,
    weaponCollider: true,
    fadeIn: 0.08,
    fadeOut: 0.12,
    cooldownS: 0.35,
    ...extra,
  };
}

export function makeRangedSkill(
  id: string,
  clip: unknown,
  rangeM = 22,
  extra: Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  return {
    id,
    clip,
    rangeM,
    upperBodyWeight: 1,
    allowLocomotion: false,
    hitWindow: [0.35, 0.5],
    weaponCollider: false,
    fadeIn: 0.1,
    fadeOut: 0.15,
    cooldownS: 0.5,
    ...extra,
  };
}

export function makeMagicSkill(
  id: string,
  clip: unknown,
  rangeM = 18,
  extra: Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  return {
    id,
    clip,
    rangeM,
    upperBodyWeight: 1,
    allowLocomotion: false,
    hitWindow: [0.4, 0.65],
    weaponCollider: false,
    fadeIn: 0.12,
    fadeOut: 0.18,
    cooldownS: 0.8,
    animPack: "magic",
    ...extra,
  };
}
