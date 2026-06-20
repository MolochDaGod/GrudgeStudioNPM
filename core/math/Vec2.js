export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  set(x, y) {
    this.x = x
    this.y = y
    return this
  }

  copy(v) {
    this.x = v.x
    this.y = v.y
    return this
  }

  clone() {
    return new Vec2(this.x, this.y)
  }

  add(v) {
    this.x += v.x
    this.y += v.y
    return this
  }

  sub(v) {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  mul(s) {
    this.x *= s
    this.y *= s
    return this
  }

  div(s) {
    this.x /= s
    this.y /= s
    return this
  }

  dot(v) {
    return this.x * v.x + this.y * v.y
  }

  cross(v) {
    return this.x * v.y - this.y * v.x
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y
  }

  normalize() {
    const len = this.length()
    if (len > 0) {
      this.x /= len
      this.y /= len
    }
    return this
  }

  distance(v) {
    const dx = this.x - v.x
    const dy = this.y - v.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  distanceSq(v) {
    const dx = this.x - v.x
    const dy = this.y - v.y
    return dx * dx + dy * dy
  }

  angle() {
    return Math.atan2(this.y, this.x)
  }

  rotate(angle) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const x = this.x * cos - this.y * sin
    const y = this.x * sin + this.y * cos
    this.x = x
    this.y = y
    return this
  }

  lerp(v, t) {
    this.x += (v.x - this.x) * t
    this.y += (v.y - this.y) * t
    return this
  }

  equals(v, epsilon = 0.0001) {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon
  }

  toArray() {
    return [this.x, this.y]
  }

  fromArray(arr, offset = 0) {
    this.x = arr[offset]
    this.y = arr[offset + 1]
    return this
  }

  static add(a, b) {
    return new Vec2(a.x + b.x, a.y + b.y)
  }

  static sub(a, b) {
    return new Vec2(a.x - b.x, a.y - b.y)
  }

  static lerp(a, b, t) {
    return new Vec2(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    )
  }

  static fromAngle(angle, length = 1) {
    return new Vec2(Math.cos(angle) * length, Math.sin(angle) * length)
  }

  static random(scale = 1) {
    const angle = Math.random() * Math.PI * 2
    return new Vec2(Math.cos(angle) * scale, Math.sin(angle) * scale)
  }

  static ZERO = Object.freeze(new Vec2(0, 0))
  static ONE = Object.freeze(new Vec2(1, 1))
  static UP = Object.freeze(new Vec2(0, 1))
  static DOWN = Object.freeze(new Vec2(0, -1))
  static LEFT = Object.freeze(new Vec2(-1, 0))
  static RIGHT = Object.freeze(new Vec2(1, 0))
}
