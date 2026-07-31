/**
 * Directional locomotion helpers — 4/8-way intent for hosts + debug.
 * Pack-level maps live in @grudge-studio/assets (clipRoleForDirection).
 */

import {
  clamp01,
  gaitBlendFromSpeed,
  smoothstep,
} from "./blend";

export type MoveCardinal =
  | "idle"
  | "forward"
  | "back"
  | "left"
  | "right"
  | "forward_left"
  | "forward_right"
  | "back_left"
  | "back_right";

/**
 * Convert planar move intent (x right, z forward) to 8-way slot.
 * Same convention as assets.directionalSlotFromXZ.
 */
export function moveIntentToCardinal(
  x: number,
  z: number,
  deadzone = 0.12,
): MoveCardinal {
  const mag = Math.hypot(x, z);
  if (mag < deadzone) return "idle";
  const angle = Math.atan2(x, z);
  const deg = (angle * 180) / Math.PI;
  if (deg >= -22.5 && deg < 22.5) return "forward";
  if (deg >= 22.5 && deg < 67.5) return "forward_right";
  if (deg >= 67.5 && deg < 112.5) return "right";
  if (deg >= 112.5 && deg < 157.5) return "back_right";
  if (deg >= 157.5 || deg < -157.5) return "back";
  if (deg >= -157.5 && deg < -112.5) return "back_left";
  if (deg >= -112.5 && deg < -67.5) return "left";
  return "forward_left";
}

/** Speed 0–1 from move stick magnitude */
export function speed01FromXZ(x: number, z: number, max = 1): number {
  return clamp01(Math.hypot(x, z) / Math.max(1e-6, max));
}

/**
 * Simple 4-clip directional blend weights (forward/back/left/right).
 * Diagonals split weight between two cardinals. Sum ≈ 1 when moving.
 */
export function directionalCardinalWeights(
  x: number,
  z: number,
  deadzone = 0.12,
): { idle: number; forward: number; back: number; left: number; right: number } {
  const mag = Math.hypot(x, z);
  if (mag < deadzone) {
    return { idle: 1, forward: 0, back: 0, left: 0, right: 0 };
  }
  const nx = x / mag;
  const nz = z / mag;
  const forward = Math.max(0, nz);
  const back = Math.max(0, -nz);
  const right = Math.max(0, nx);
  const left = Math.max(0, -nx);
  const sum = forward + back + left + right || 1;
  return {
    idle: 0,
    forward: forward / sum,
    back: back / sum,
    left: left / sum,
    right: right / sum,
  };
}

/**
 * Combine directional cardinal weights with gait (walk/run/sprint) scale.
 * Host multiplies: walkForwardWeight = cardinal.forward * gait.walk * locoScale
 */
export function directionalGaitPlan(
  x: number,
  z: number,
  sprinting: boolean,
  opts: { deadzone?: number; walkFrac?: number } = {},
): {
  cardinal: ReturnType<typeof directionalCardinalWeights>;
  gait: ReturnType<typeof gaitBlendFromSpeed>;
  speed01: number;
  slot: MoveCardinal;
} {
  const deadzone = opts.deadzone ?? 0.12;
  const speed01 = speed01FromXZ(x, z);
  return {
    cardinal: directionalCardinalWeights(x, z, deadzone),
    gait: gaitBlendFromSpeed(speed01, sprinting, opts.walkFrac ?? 0.45),
    speed01,
    slot: moveIntentToCardinal(x, z, deadzone),
  };
}

/** Debug string for HUD */
export function formatDirectionalDebug(
  x: number,
  z: number,
  sprinting = false,
): string {
  const p = directionalGaitPlan(x, z, sprinting);
  return (
    `slot=${p.slot} spd=${p.speed01.toFixed(2)} ` +
    `card F${p.cardinal.forward.toFixed(2)}B${p.cardinal.back.toFixed(2)}` +
    `L${p.cardinal.left.toFixed(2)}R${p.cardinal.right.toFixed(2)} ` +
    `gait i${p.gait.idle.toFixed(2)}w${p.gait.walk.toFixed(2)}r${p.gait.run.toFixed(2)}s${p.gait.sprint.toFixed(2)}`
  );
}

/** Ease yaw toward move direction (radians) */
export function yawTowardXZ(
  currentYaw: number,
  x: number,
  z: number,
  dt: number,
  turnSpeed = 10,
): number {
  if (Math.hypot(x, z) < 0.05) return currentYaw;
  const target = Math.atan2(x, z);
  let d = target - currentYaw;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const t = 1 - Math.exp(-turnSpeed * dt);
  return currentYaw + d * smoothstep(t);
}
