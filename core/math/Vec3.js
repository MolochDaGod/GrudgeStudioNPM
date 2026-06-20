export class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  set(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  copy(v) {
    this.x = v.x
    this.y = v.y
    this.z = v.z
    return this
  }

  clone() {
    return new Vec3(this.x, this.y, this.z)
  }

  add(v) {
    this.x += v.x
    this.y += v.y
    this.z += v.z
    return this
  }

  sub(v) {
    this.x -= v.x
    this.y -= v.y
    this.z -= v.z
    return this
  }

  mul(s) {
    this.x *= s
    this.y *= s
    this.z *= s
    return this
  }

  div(s) {
    this.x /= s
    this.y /= s
    this.z /= s
    return this
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  cross(v) {
    const x = this.y * v.z - this.z * v.y
    const y = this.z * v.x - this.x * v.z
    const z = this.x * v.y - this.y * v.x
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z
  }

  normalize() {
    const len = this.length()
    if (len > 0) {
      this.x /= len
      this.y /= len
      this.z /= len
    }
    return this
  }

  distance(v) {
    const dx = this.x - v.x
    const dy = this.y - v.y
    const dz = this.z - v.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  distanceSq(v) {
    const dx = this.x - v.x
    const dy = this.y - v.y
    const dz = this.z - v.z
    return dx * dx + dy * dy + dz * dz
  }

  lerp(v, t) {
    this.x += (v.x - this.x) * t
    this.y += (v.y - this.y) * t
    this.z += (v.z - this.z) * t
    return this
  }

  slerp(v, t) {
    const dot = this.dot(v)
    const theta = Math.acos(Math.min(1, Math.max(-1, dot)))
    const sinTheta = Math.sin(theta)
    if (sinTheta < 0.001) {
      return this.lerp(v, t)
    }
    const a = Math.sin((1 - t) * theta) / sinTheta
    const b = Math.sin(t * theta) / sinTheta
    this.x = this.x * a + v.x * b
    this.y = this.y * a + v.y * b
    this.z = this.z * a + v.z * b
    return this
  }

  reflect(normal) {
    const d = 2 * this.dot(normal)
    this.x -= normal.x * d
    this.y -= normal.y * d
    this.z -= normal.z * d
    return this
  }

  project(v) {
    const dot = this.dot(v)
    const len = v.lengthSq()
    this.x = v.x * dot / len
    this.y = v.y * dot / len
    this.z = v.z * dot / len
    return this
  }

  applyMatrix4(m) {
    const e = m.elements
    const x = this.x, y = this.y, z = this.z
    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15])
    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w
    return this
  }

  applyQuaternion(q) {
    const x = this.x, y = this.y, z = this.z
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w
    const ix = qw * x + qy * z - qz * y
    const iy = qw * y + qz * x - qx * z
    const iz = qw * z + qx * y - qy * x
    const iw = -qx * x - qy * y - qz * z
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx
    return this
  }

  equals(v, epsilon = 0.0001) {
    return Math.abs(this.x - v.x) < epsilon && 
           Math.abs(this.y - v.y) < epsilon && 
           Math.abs(this.z - v.z) < epsilon
  }

  toArray() {
    return [this.x, this.y, this.z]
  }

  fromArray(arr, offset = 0) {
    this.x = arr[offset]
    this.y = arr[offset + 1]
    this.z = arr[offset + 2]
    return this
  }

  static add(a, b) {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z)
  }

  static sub(a, b) {
    return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z)
  }

  static cross(a, b) {
    return new Vec3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    )
  }

  static lerp(a, b, t) {
    return new Vec3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t
    )
  }

  static random(scale = 1) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    return new Vec3(
      Math.sin(phi) * Math.cos(theta) * scale,
      Math.sin(phi) * Math.sin(theta) * scale,
      Math.cos(phi) * scale
    )
  }

  static ZERO = Object.freeze(new Vec3(0, 0, 0))
  static ONE = Object.freeze(new Vec3(1, 1, 1))
  static UP = Object.freeze(new Vec3(0, 1, 0))
  static DOWN = Object.freeze(new Vec3(0, -1, 0))
  static LEFT = Object.freeze(new Vec3(-1, 0, 0))
  static RIGHT = Object.freeze(new Vec3(1, 0, 0))
  static FORWARD = Object.freeze(new Vec3(0, 0, -1))
  static BACK = Object.freeze(new Vec3(0, 0, 1))
}
