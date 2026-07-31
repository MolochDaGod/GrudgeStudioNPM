/**
 * Framework-light gait director. Works with THREE.AnimationMixer actions.
 * Does not import three at runtime (duck-typed) so SSR/CJS stay clean.
 *
 * For combat (weapon skills on locomotion), prefer {@link LocomotionCore}.
 */

export interface LocoClips {
  idle: unknown;
  walk: unknown;
  run: unknown;
  sprint?: unknown;
}

export interface ActionLike {
  reset(): ActionLike;
  play(): ActionLike;
  stop(): ActionLike;
  fadeIn(d: number): ActionLike;
  fadeOut(d: number): ActionLike;
  setEffectiveWeight(w: number): ActionLike;
  setLoop(mode: number, reps: number): ActionLike;
  clampWhenFinished: boolean;
  isRunning(): boolean;
  getClip(): { duration: number };
}

export interface MixerLike {
  clipAction(clip: unknown): ActionLike;
  update(dt: number): void;
}

const LOOP_REPEAT = 2201; // THREE.LoopRepeat
const LOOP_ONCE = 2200;

export interface AnimationDirectorOptions {
  fade?: number;
  /** Speed fraction below which walk wins over run (default 0.45) */
  walkSpeedFrac?: number;
  /** Loco weight while one-shot overlay is busy (default 0.45) */
  busyLocoWeight?: number;
}

/**
 * Owns locomotion weights + overlay one-shots.
 * Call setGaitTarget every frame; requestOneShot for attacks.
 */
export class AnimationDirector {
  private mixer: MixerLike;
  private idle: ActionLike;
  private walk: ActionLike;
  private run: ActionLike;
  private sprint: ActionLike;
  private fade: number;
  private walkSpeedFrac: number;
  private busyLocoWeight: number;
  private moving = false;
  private sprinting = false;
  private speed01: number | undefined;
  private overlay: ActionLike | null = null;
  busy = false;

  constructor(mixer: MixerLike, clips: LocoClips, opts: AnimationDirectorOptions = {}) {
    this.mixer = mixer;
    this.fade = opts.fade ?? 0.12;
    this.walkSpeedFrac = opts.walkSpeedFrac ?? 0.45;
    this.busyLocoWeight = opts.busyLocoWeight ?? 0.45;
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
   * @param sprinting - sprint hold
   * @param speed01 - optional 0–1 speed for walk vs run (omit → run when moving)
   */
  setGaitTarget(moving: boolean, sprinting = false, speed01?: number): void {
    this.moving = moving;
    this.sprinting = sprinting && moving;
    this.speed01 = speed01;
  }

  requestOneShot(
    clip: unknown,
    opts: { fade?: number; blend?: number } = {},
  ): boolean {
    if (this.busy && !opts.blend) return false;
    const fade = opts.fade ?? 0.1;
    if (this.overlay) {
      try {
        this.overlay.fadeOut(fade);
      } catch {
        /* ignore */
      }
    }
    const action = this.mixer.clipAction(clip);
    action.reset();
    action.setLoop(LOOP_ONCE, 1);
    action.clampWhenFinished = false;
    action.fadeIn(fade).play();
    this.overlay = action;
    this.busy = true;
    const dur = Math.max(0.2, action.getClip().duration || 0.6);
    setTimeout(() => {
      this.busy = false;
      try {
        action.fadeOut(0.12);
      } catch {
        /* ignore */
      }
    }, dur * 1000);
    return true;
  }

  update(dt: number): void {
    let target: "idle" | "walk" | "run" | "sprint" = "idle";
    if (this.moving) {
      if (this.sprinting) target = "sprint";
      else if (this.speed01 !== undefined && this.speed01 < this.walkSpeedFrac) {
        target = "walk";
      } else target = "run";
    }
    const map: Record<string, ActionLike> = {
      idle: this.idle,
      walk: this.walk,
      run: this.run,
      sprint: this.sprint,
    };
    const want = map[target] ?? this.idle;
    const locoW = this.busy ? this.busyLocoWeight : 1;
    for (const a of [this.idle, this.walk, this.run, this.sprint]) {
      if (a === want) a.setEffectiveWeight(locoW);
      else a.setEffectiveWeight(0);
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
    this.overlay = null;
    this.busy = false;
  }
}
