export const DEG2RAD = Math.PI / 180
export const RAD2DEG = 180 / Math.PI
export const PI = Math.PI
export const TAU = Math.PI * 2
export const EPSILON = 0.000001

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function inverseLerp(a, b, value) {
  return (value - a) / (b - a)
}

export function remap(value, inMin, inMax, outMin, outMax) {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value))
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function smootherstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export function smoothDamp(current, target, velocity, smoothTime, maxSpeed, deltaTime) {
  smoothTime = Math.max(0.0001, smoothTime)
  const omega = 2 / smoothTime
  const x = omega * deltaTime
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  let change = current - target
  const maxChange = maxSpeed * smoothTime
  change = clamp(change, -maxChange, maxChange)
  const temp = (velocity + omega * change) * deltaTime
  velocity = (velocity - omega * temp) * exp
  let output = target + (change + temp) * exp
  if ((target - current > 0) === (output > target)) {
    output = target
    velocity = (output - target) / deltaTime
  }
  return { value: output, velocity }
}

export function smoothDampAngle(current, target, velocity, smoothTime, maxSpeed, deltaTime) {
  target = current + deltaAngle(current, target)
  return smoothDamp(current, target, velocity, smoothTime, maxSpeed, deltaTime)
}

export function deltaAngle(current, target) {
  let delta = (target - current) % TAU
  if (delta > PI) delta -= TAU
  else if (delta < -PI) delta += TAU
  return delta
}

export function lerpAngle(a, b, t) {
  return a + deltaAngle(a, b) * t
}

export function pingPong(t, length) {
  t = Math.abs(t) % (length * 2)
  return length - Math.abs(t - length)
}

export function repeat(t, length) {
  return clamp(t - Math.floor(t / length) * length, 0, length)
}

export function isPowerOfTwo(value) {
  return (value & (value - 1)) === 0 && value !== 0
}

export function nextPowerOfTwo(value) {
  value--
  value |= value >> 1
  value |= value >> 2
  value |= value >> 4
  value |= value >> 8
  value |= value >> 16
  value++
  return value
}

export function random(min = 0, max = 1) {
  return min + Math.random() * (max - min)
}

export function randomInt(min, max) {
  return Math.floor(random(min, max + 1))
}

export function randomSign() {
  return Math.random() < 0.5 ? -1 : 1
}

export function randomInCircle(radius = 1) {
  const angle = Math.random() * TAU
  const r = Math.sqrt(Math.random()) * radius
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
}

export function randomOnCircle(radius = 1) {
  const angle = Math.random() * TAU
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
}

export function randomInSphere(radius = 1) {
  const theta = Math.random() * TAU
  const phi = Math.acos(2 * Math.random() - 1)
  const r = Math.cbrt(Math.random()) * radius
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi)
  }
}

export function randomOnSphere(radius = 1) {
  const theta = Math.random() * TAU
  const phi = Math.acos(2 * Math.random() - 1)
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi)
  }
}

export function approximately(a, b, epsilon = EPSILON) {
  return Math.abs(a - b) < epsilon
}

export function sign(value) {
  return value < 0 ? -1 : value > 0 ? 1 : 0
}

export function fract(value) {
  return value - Math.floor(value)
}

export function mod(a, b) {
  return ((a % b) + b) % b
}
