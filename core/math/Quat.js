export class Quat {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }

  set(x, y, z, w) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
    return this
  }

  copy(q) {
    this.x = q.x
    this.y = q.y
    this.z = q.z
    this.w = q.w
    return this
  }

  clone() {
    return new Quat(this.x, this.y, this.z, this.w)
  }

  identity() {
    return this.set(0, 0, 0, 1)
  }

  setFromAxisAngle(axis, angle) {
    const halfAngle = angle / 2
    const s = Math.sin(halfAngle)
    this.x = axis.x * s
    this.y = axis.y * s
    this.z = axis.z * s
    this.w = Math.cos(halfAngle)
    return this
  }

  setFromEuler(x, y, z, order = 'XYZ') {
    const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2)
    const s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2)

    switch (order) {
      case 'XYZ':
        this.x = s1 * c2 * c3 + c1 * s2 * s3
        this.y = c1 * s2 * c3 - s1 * c2 * s3
        this.z = c1 * c2 * s3 + s1 * s2 * c3
        this.w = c1 * c2 * c3 - s1 * s2 * s3
        break
      case 'YXZ':
        this.x = s1 * c2 * c3 + c1 * s2 * s3
        this.y = c1 * s2 * c3 - s1 * c2 * s3
        this.z = c1 * c2 * s3 - s1 * s2 * c3
        this.w = c1 * c2 * c3 + s1 * s2 * s3
        break
      case 'ZXY':
        this.x = s1 * c2 * c3 - c1 * s2 * s3
        this.y = c1 * s2 * c3 + s1 * c2 * s3
        this.z = c1 * c2 * s3 + s1 * s2 * c3
        this.w = c1 * c2 * c3 - s1 * s2 * s3
        break
      case 'ZYX':
        this.x = s1 * c2 * c3 - c1 * s2 * s3
        this.y = c1 * s2 * c3 + s1 * c2 * s3
        this.z = c1 * c2 * s3 - s1 * s2 * c3
        this.w = c1 * c2 * c3 + s1 * s2 * s3
        break
      case 'YZX':
        this.x = s1 * c2 * c3 + c1 * s2 * s3
        this.y = c1 * s2 * c3 + s1 * c2 * s3
        this.z = c1 * c2 * s3 - s1 * s2 * c3
        this.w = c1 * c2 * c3 - s1 * s2 * s3
        break
      case 'XZY':
        this.x = s1 * c2 * c3 - c1 * s2 * s3
        this.y = c1 * s2 * c3 - s1 * c2 * s3
        this.z = c1 * c2 * s3 + s1 * s2 * c3
        this.w = c1 * c2 * c3 + s1 * s2 * s3
        break
    }
    return this
  }

  multiply(q) {
    const ax = this.x, ay = this.y, az = this.z, aw = this.w
    const bx = q.x, by = q.y, bz = q.z, bw = q.w
    this.x = ax * bw + aw * bx + ay * bz - az * by
    this.y = ay * bw + aw * by + az * bx - ax * bz
    this.z = az * bw + aw * bz + ax * by - ay * bx
    this.w = aw * bw - ax * bx - ay * by - az * bz
    return this
  }

  premultiply(q) {
    const ax = q.x, ay = q.y, az = q.z, aw = q.w
    const bx = this.x, by = this.y, bz = this.z, bw = this.w
    this.x = ax * bw + aw * bx + ay * bz - az * by
    this.y = ay * bw + aw * by + az * bx - ax * bz
    this.z = az * bw + aw * bz + ax * by - ay * bx
    this.w = aw * bw - ax * bx - ay * by - az * bz
    return this
  }

  conjugate() {
    this.x = -this.x
    this.y = -this.y
    this.z = -this.z
    return this
  }

  invert() {
    return this.conjugate().normalize()
  }

  normalize() {
    let len = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    if (len > 0) {
      len = 1 / Math.sqrt(len)
      this.x *= len
      this.y *= len
      this.z *= len
      this.w *= len
    }
    return this
  }

  dot(q) {
    return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
  }

  slerp(q, t) {
    if (t === 0) return this
    if (t === 1) return this.copy(q)

    const x = this.x, y = this.y, z = this.z, w = this.w
    let cosHalfTheta = w * q.w + x * q.x + y * q.y + z * q.z

    if (cosHalfTheta < 0) {
      this.w = -q.w
      this.x = -q.x
      this.y = -q.y
      this.z = -q.z
      cosHalfTheta = -cosHalfTheta
    } else {
      this.copy(q)
    }

    if (cosHalfTheta >= 1.0) {
      this.w = w
      this.x = x
      this.y = y
      this.z = z
      return this
    }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta
    if (sqrSinHalfTheta <= Number.EPSILON) {
      const s = 1 - t
      this.w = s * w + t * this.w
      this.x = s * x + t * this.x
      this.y = s * y + t * this.y
      this.z = s * z + t * this.z
      return this.normalize()
    }

    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta)
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta)
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta

    this.w = w * ratioA + this.w * ratioB
    this.x = x * ratioA + this.x * ratioB
    this.y = y * ratioA + this.y * ratioB
    this.z = z * ratioA + this.z * ratioB

    return this
  }

  toEuler(order = 'XYZ') {
    const x = this.x, y = this.y, z = this.z, w = this.w
    const x2 = x + x, y2 = y + y, z2 = z + z
    const xx = x * x2, xy = x * y2, xz = x * z2
    const yy = y * y2, yz = y * z2, zz = z * z2
    const wx = w * x2, wy = w * y2, wz = w * z2

    const m11 = 1 - (yy + zz)
    const m12 = xy - wz
    const m13 = xz + wy
    const m21 = xy + wz
    const m22 = 1 - (xx + zz)
    const m23 = yz - wx
    const m31 = xz - wy
    const m32 = yz + wx
    const m33 = 1 - (xx + yy)

    let ex, ey, ez

    switch (order) {
      case 'XYZ':
        ey = Math.asin(Math.max(-1, Math.min(1, m13)))
        if (Math.abs(m13) < 0.9999999) {
          ex = Math.atan2(-m23, m33)
          ez = Math.atan2(-m12, m11)
        } else {
          ex = Math.atan2(m32, m22)
          ez = 0
        }
        break
      default:
        ex = 0; ey = 0; ez = 0
    }

    return { x: ex, y: ey, z: ez }
  }

  static fromAxisAngle(axis, angle) {
    return new Quat().setFromAxisAngle(axis, angle)
  }

  static fromEuler(x, y, z, order) {
    return new Quat().setFromEuler(x, y, z, order)
  }

  static slerp(a, b, t) {
    return a.clone().slerp(b, t)
  }

  static IDENTITY = Object.freeze(new Quat(0, 0, 0, 1))
}
