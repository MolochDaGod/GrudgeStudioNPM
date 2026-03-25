/*
    GRUDGE Studio - Voxel Animation Brush System
    Ported from Dungeon-Crawler-Quest entity-editor.tsx
    Provides animation authoring tools for the Timeline editor.
    Paint-based approach to animating body parts with preset motion patterns.
*/

// ── Body Part Definitions ──────────────────────────────────────

export const BODY_PARTS = ['leftLeg', 'rightLeg', 'leftArm', 'rightArm', 'torso', 'head', 'weapon']

export const BODY_PART_LABELS = {
  leftLeg: 'L.Leg', rightLeg: 'R.Leg', leftArm: 'L.Arm', rightArm: 'R.Arm',
  torso: 'Torso', head: 'Head', weapon: 'Weapon',
}

export const BODY_PART_COLORS = {
  leftLeg: '#3b82f6', rightLeg: '#6366f1', leftArm: '#22c55e', rightArm: '#10b981',
  torso: '#f59e0b', head: '#ef4444', weapon: '#a855f7',
}

export const BODY_PART_CENTERS = {
  head:     { ox: 0, oy: 0, oz: 0 },
  torso:    { ox: 0, oy: 0, oz: 0 },
  leftArm:  { ox: -3, oy: 0, oz: 0 },
  rightArm: { ox: 3, oy: 0, oz: 0 },
  leftLeg:  { ox: -1, oy: 0, oz: -4 },
  rightLeg: { ox: 1, oy: 0, oz: -4 },
  weapon:   { ox: -4, oy: 0, oz: 2 },
}

// ── Easing Functions ───────────────────────────────────────────

export const EASING_OPTIONS = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'overshoot', 'bounce']

export function ease(t, type = 'linear') {
  t = Math.max(0, Math.min(1, t))
  switch (type) {
    case 'easeIn': return t * t
    case 'easeOut': return 1 - (1 - t) * (1 - t)
    case 'easeInOut': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    case 'overshoot': {
      const s = 1.70158
      return (t = t - 1) * t * ((s + 1) * t + s) + 1
    }
    case 'bounce': {
      if (t < 1 / 2.75) return 7.5625 * t * t
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
    default: return t
  }
}

// ── Animation Brushes ──────────────────────────────────────────
// Each brush generates motion patterns that can be painted onto body parts

export const ANIMATION_BRUSHES = [
  {
    id: 'pose',
    label: 'Pose',
    color: '#ef4444',
    desc: 'Static offset — paint a body part to a target offset',
    generate: (part, params = {}) => {
      const { ox = 0, oy = 0, oz = 0, intensity = 1 } = params
      return (t) => ({
        ox: Math.round(ox * intensity),
        oy: Math.round(oy * intensity),
        oz: Math.round(oz * intensity),
      })
    }
  },
  {
    id: 'wave',
    label: 'Wave',
    color: '#3b82f6',
    desc: 'Sinusoidal motion — paint gentle oscillation on selected parts',
    generate: (part, params = {}) => {
      const { amplitude = 2, frequency = 3, axis = 'oz', phase = 0, intensity = 1 } = params
      return (t) => {
        const value = Math.round(Math.sin(t * frequency + phase) * amplitude * intensity)
        return { ox: 0, oy: 0, oz: 0, [axis]: value }
      }
    }
  },
  {
    id: 'pulse',
    label: 'Pulse',
    color: '#22c55e',
    desc: 'Scale pulse — paint a heartbeat-like scale animation',
    generate: (part, params = {}) => {
      const { amplitude = 1.5, speed = 4, intensity = 1 } = params
      return (t) => {
        const pulse = Math.abs(Math.sin(t * speed)) * amplitude * intensity
        return { ox: 0, oy: 0, oz: Math.round(pulse) }
      }
    }
  },
  {
    id: 'spin',
    label: 'Spin',
    color: '#a855f7',
    desc: 'Rotation sweep — paint a smooth rotation arc on parts',
    generate: (part, params = {}) => {
      const { radius = 2, speed = 2, intensity = 1 } = params
      return (t) => ({
        ox: Math.round(Math.cos(t * speed) * radius * intensity),
        oy: Math.round(Math.sin(t * speed) * radius * intensity),
        oz: 0,
      })
    }
  },
  {
    id: 'bounce',
    label: 'Bounce',
    color: '#f59e0b',
    desc: 'Vertical bounce — paint an up-down hop on parts',
    generate: (part, params = {}) => {
      const { height = 3, speed = 5, intensity = 1 } = params
      return (t) => ({
        ox: 0,
        oy: 0,
        oz: Math.round(Math.abs(Math.sin(t * speed)) * height * intensity),
      })
    }
  },
  {
    id: 'tremble',
    label: 'Tremble',
    color: '#06b6d4',
    desc: 'Micro-shake — paint fine trembling for tension or fear',
    generate: (part, params = {}) => {
      const { magnitude = 0.5, speed = 20, intensity = 1 } = params
      return (t) => ({
        ox: Math.round((Math.sin(t * speed * 7.3) + Math.cos(t * speed * 11.1)) * magnitude * intensity * 0.5),
        oy: Math.round((Math.cos(t * speed * 5.7) + Math.sin(t * speed * 13.3)) * magnitude * intensity * 0.5),
        oz: Math.round(Math.sin(t * speed * 9.1) * magnitude * intensity * 0.3),
      })
    }
  },
]

// ── Motion Keyframe System ─────────────────────────────────────

/**
 * @typedef {Object} BodyPartPose
 * @property {number} ox - X offset
 * @property {number} oy - Y offset
 * @property {number} oz - Z offset
 */

/**
 * @typedef {Object} MotionKeyframe
 * @property {number} time - Time in seconds
 * @property {Object<string, BodyPartPose>} pose - Pose per body part
 * @property {string} easing - Easing function name
 */

/**
 * Sample a full pose at a given time by interpolating between keyframes.
 * @param {MotionKeyframe[]} keyframes - Sorted array of keyframes
 * @param {number} time - Time to sample at
 * @returns {Object<string, BodyPartPose>}
 */
export function sampleMotion(keyframes, time) {
  if (keyframes.length === 0) return {}
  if (keyframes.length === 1) return { ...keyframes[0].pose }
  if (time <= keyframes[0].time) return { ...keyframes[0].pose }
  if (time >= keyframes[keyframes.length - 1].time) return { ...keyframes[keyframes.length - 1].pose }

  // Find surrounding keyframes
  let kfA = keyframes[0]
  let kfB = keyframes[1]
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
      kfA = keyframes[i]
      kfB = keyframes[i + 1]
      break
    }
  }

  const range = kfB.time - kfA.time
  const rawT = range > 0 ? (time - kfA.time) / range : 0
  const t = ease(rawT, kfB.easing || 'easeInOut')

  const result = {}
  const allParts = new Set([...Object.keys(kfA.pose || {}), ...Object.keys(kfB.pose || {})])

  for (const part of allParts) {
    const a = kfA.pose?.[part] || { ox: 0, oy: 0, oz: 0 }
    const b = kfB.pose?.[part] || { ox: 0, oy: 0, oz: 0 }
    result[part] = {
      ox: Math.round(a.ox + (b.ox - a.ox) * t),
      oy: Math.round(a.oy + (b.oy - a.oy) * t),
      oz: Math.round(a.oz + (b.oz - a.oz) * t),
    }
  }

  return result
}

/**
 * Generate a smoothed animation by sampling keyframes at regular intervals.
 * @param {MotionKeyframe[]} keyframes
 * @param {number} duration - Total duration in seconds
 * @param {number} fps - Samples per second
 * @returns {Object<string, BodyPartPose>[]} Array of sampled poses
 */
export function generateSmoothedAnimation(keyframes, duration, fps = 30) {
  const frames = []
  const totalFrames = Math.ceil(duration * fps)
  for (let i = 0; i <= totalFrames; i++) {
    const time = (i / totalFrames) * duration
    frames.push(sampleMotion(keyframes, time))
  }
  return frames
}

// ── Class-Specific Animation Presets ───────────────────────────
// Built-in animation patterns per class, derived from DCQ animation-editor

export const CLASS_ANIMATION_PRESETS = {
  Warrior: {
    idle: (t) => ({
      leftLeg: { ox: 0, oy: 0, oz: 0 },
      rightLeg: { ox: 0, oy: 0, oz: 0 },
      leftArm: { ox: 0, oy: 0, oz: 0 },
      rightArm: { ox: 0, oy: 0, oz: 0 },
      torso: { ox: 0, oy: 0, oz: Math.round(Math.sin(t * 2) * 0.3) },
      head: { ox: 0, oy: 0, oz: 0 },
      weapon: { ox: 0, oy: 0, oz: 0 },
    }),
    walk: (t) => {
      const phase = Math.sin(t * 10)
      const bounce = Math.abs(Math.sin(t * 20)) * 0.6
      return {
        leftLeg: { ox: Math.round(phase * 2), oy: 0, oz: Math.round(Math.max(0, -phase) * 0.8) },
        rightLeg: { ox: Math.round(-phase * 2), oy: 0, oz: Math.round(Math.max(0, phase) * 0.8) },
        leftArm: { ox: Math.round(-phase * 1.4), oy: 0, oz: 0 },
        rightArm: { ox: Math.round(phase * 1.4), oy: 0, oz: 0 },
        torso: { ox: 0, oy: Math.round(Math.sin(t * 10) * 0.4), oz: Math.round(bounce) },
        head: { ox: 0, oy: 0, oz: Math.round(bounce * 0.8) },
        weapon: { ox: Math.round(phase * 0.6), oy: 0, oz: Math.round(bounce * 0.3) },
      }
    },
    attack: (t) => {
      const p = Math.min(1, t / 0.65)
      const windUp = p < 0.35 ? p / 0.35 : 0
      const swing = p >= 0.35 && p < 0.65 ? (p - 0.35) / 0.3 : 0
      const follow = p >= 0.65 ? (p - 0.65) / 0.35 : 0
      return {
        leftLeg: { ox: Math.round(swing * 2.5), oy: 0, oz: Math.round(swing * 0.8) },
        rightLeg: { ox: Math.round(-swing * 1.5 + windUp * 0.8), oy: 0, oz: 0 },
        leftArm: { ox: Math.round(-windUp * 4 + swing * 5.5 - follow * 1.5), oy: Math.round(swing * -3.5), oz: Math.round(swing * 5 - windUp * 3) },
        rightArm: { ox: Math.round(-windUp * 2 + follow * 0.8), oy: Math.round(windUp * 1), oz: Math.round(windUp * 2 + swing * 0.5) },
        torso: { ox: Math.round(swing * 3.5), oy: Math.round(swing * 0.8 - windUp * 0.5), oz: 0 },
        head: { ox: Math.round(swing * 1.2), oy: 0, oz: 0 },
        weapon: { ox: Math.round(-windUp * 4 + swing * 10), oy: Math.round(swing * -5.5), oz: Math.round(windUp * 6 - swing * 5.5) },
      }
    },
  },
  Ranger: {
    idle: (t) => ({
      leftLeg: { ox: 0, oy: 0, oz: 0 },
      rightLeg: { ox: 0, oy: 0, oz: 0 },
      leftArm: { ox: 0, oy: 0, oz: 0 },
      rightArm: { ox: 0, oy: 0, oz: 0 },
      torso: { ox: 0, oy: 0, oz: Math.round(Math.sin(t * 2) * 0.3) },
      head: { ox: 0, oy: 0, oz: 0 },
      weapon: { ox: 0, oy: 0, oz: 0 },
    }),
    attack: (t) => {
      const p = Math.min(1, t / 0.65)
      const draw = p < 0.45 ? p / 0.45 : 1
      const release = p >= 0.55 ? Math.min(1, (p - 0.55) / 0.15) : 0
      const recoil = p >= 0.7 ? (p - 0.7) / 0.3 : 0
      return {
        leftLeg: { ox: Math.round(-draw * 1), oy: 0, oz: 0 },
        rightLeg: { ox: Math.round(draw * 1.2 - recoil * 0.5), oy: 0, oz: 0 },
        leftArm: { ox: Math.round(draw * 3.5 - release * 0.5 - recoil), oy: Math.round(-draw * 0.8), oz: Math.round(draw * 3) },
        rightArm: { ox: Math.round(-draw * 3 + release * 5 - recoil * 2), oy: Math.round(draw * 0.3), oz: Math.round(draw * 2 + release) },
        torso: { ox: Math.round(-draw * 0.8 + release * 0.5), oy: Math.round(-draw * 0.5), oz: 0 },
        head: { ox: Math.round(draw * 0.5 + release - recoil * 0.5), oy: Math.round(-draw * 0.3), oz: 0 },
        weapon: { ox: Math.round(draw * 3.5 - release * 0.5), oy: Math.round(-draw * 0.8), oz: Math.round(draw * 3) },
      }
    },
  },
  Mage: {
    idle: (t) => ({
      leftLeg: { ox: 0, oy: 0, oz: 0 },
      rightLeg: { ox: 0, oy: 0, oz: 0 },
      leftArm: { ox: 0, oy: 0, oz: Math.round(Math.sin(t * 1.5) * 0.5) },
      rightArm: { ox: 0, oy: 0, oz: Math.round(Math.cos(t * 1.5) * 0.5) },
      torso: { ox: 0, oy: 0, oz: Math.round(Math.sin(t * 2) * 0.3) },
      head: { ox: 0, oy: 0, oz: 0 },
      weapon: { ox: 0, oy: 0, oz: Math.round(Math.sin(t * 1.5) * 0.5) },
    }),
    attack: (t) => {
      const p = Math.min(1, t / 0.8)
      const charge = p < 0.4 ? p / 0.4 : 1
      const cast = p >= 0.4 && p < 0.6 ? (p - 0.4) / 0.2 : 0
      const recover = p >= 0.6 ? (p - 0.6) / 0.4 : 0
      return {
        leftLeg: { ox: 0, oy: 0, oz: 0 },
        rightLeg: { ox: Math.round(charge * 0.5), oy: 0, oz: 0 },
        leftArm: { ox: Math.round(charge * 2 + cast * 3), oy: Math.round(-charge), oz: Math.round(charge * 4 + cast * 2 - recover * 3) },
        rightArm: { ox: Math.round(charge * 2 + cast * 3), oy: Math.round(charge), oz: Math.round(charge * 4 + cast * 2 - recover * 3) },
        torso: { ox: Math.round(-charge * 0.5 + cast * 1.5), oy: 0, oz: Math.round(charge * 0.5) },
        head: { ox: Math.round(cast * 1.5), oy: 0, oz: Math.round(charge * 0.3) },
        weapon: { ox: Math.round(charge * 2 + cast * 4), oy: 0, oz: Math.round(charge * 5 + cast * 2 - recover * 4) },
      }
    },
  },
  Worg: {
    idle: (t) => ({
      leftLeg: { ox: 0, oy: 0, oz: 0 },
      rightLeg: { ox: 0, oy: 0, oz: 0 },
      leftArm: { ox: 0, oy: 0, oz: 0 },
      rightArm: { ox: 0, oy: 0, oz: 0 },
      torso: { ox: 0, oy: 0, oz: Math.round(Math.sin(t * 2.5) * 0.4) },
      head: { ox: Math.round(Math.sin(t * 1.5) * 0.3), oy: 0, oz: 0 },
      weapon: { ox: 0, oy: 0, oz: 0 },
    }),
    attack: (t) => {
      const p = Math.min(1, t / 0.5)
      const lunge = p < 0.3 ? p / 0.3 : p < 0.5 ? 1 : 1 - (p - 0.5) / 0.5
      const strike = p >= 0.2 && p < 0.5 ? (p - 0.2) / 0.3 : 0
      return {
        leftLeg: { ox: Math.round(lunge * 3), oy: 0, oz: 0 },
        rightLeg: { ox: Math.round(-lunge * 1.5), oy: 0, oz: 0 },
        leftArm: { ox: Math.round(lunge * 2 + strike * 4), oy: Math.round(-strike * 3), oz: Math.round(strike * 2) },
        rightArm: { ox: Math.round(lunge * 2 + strike * 4), oy: Math.round(strike * 3), oz: Math.round(strike * 2) },
        torso: { ox: Math.round(lunge * 2), oy: 0, oz: Math.round(-lunge * 0.5) },
        head: { ox: Math.round(lunge * 2.5), oy: 0, oz: 0 },
        weapon: { ox: Math.round(lunge * 2 + strike * 5), oy: Math.round(-strike * 4), oz: Math.round(strike * 3) },
      }
    },
  },
}

/**
 * Get a brush by ID.
 */
export function getBrush(brushId) {
  return ANIMATION_BRUSHES.find(b => b.id === brushId) || ANIMATION_BRUSHES[0]
}

/**
 * Apply a brush to a specific body part at a given time, returning the offset.
 */
export function applyBrush(brushId, part, time, params = {}) {
  const brush = getBrush(brushId)
  const generator = brush.generate(part, params)
  return generator(time)
}
