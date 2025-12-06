export class Mat4 {
  constructor() {
    this.elements = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
  }

  set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    const e = this.elements
    e[0] = n11; e[4] = n12; e[8] = n13; e[12] = n14
    e[1] = n21; e[5] = n22; e[9] = n23; e[13] = n24
    e[2] = n31; e[6] = n32; e[10] = n33; e[14] = n34
    e[3] = n41; e[7] = n42; e[11] = n43; e[15] = n44
    return this
  }

  identity() {
    this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
    return this
  }

  clone() {
    const m = new Mat4()
    m.elements.set(this.elements)
    return m
  }

  copy(m) {
    this.elements.set(m.elements)
    return this
  }

  multiply(m) {
    return this.multiplyMatrices(this, m)
  }

  premultiply(m) {
    return this.multiplyMatrices(m, this)
  }

  multiplyMatrices(a, b) {
    const ae = a.elements
    const be = b.elements
    const te = this.elements

    const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12]
    const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13]
    const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14]
    const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15]

    const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12]
    const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13]
    const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14]
    const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15]

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44

    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44

    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44

    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44

    return this
  }

  translate(x, y, z) {
    const e = this.elements
    e[12] += e[0] * x + e[4] * y + e[8] * z
    e[13] += e[1] * x + e[5] * y + e[9] * z
    e[14] += e[2] * x + e[6] * y + e[10] * z
    e[15] += e[3] * x + e[7] * y + e[11] * z
    return this
  }

  scale(x, y, z) {
    const e = this.elements
    e[0] *= x; e[4] *= y; e[8] *= z
    e[1] *= x; e[5] *= y; e[9] *= z
    e[2] *= x; e[6] *= y; e[10] *= z
    e[3] *= x; e[7] *= y; e[11] *= z
    return this
  }

  rotateX(angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const e = this.elements

    const e4 = e[4], e5 = e[5], e6 = e[6], e7 = e[7]
    const e8 = e[8], e9 = e[9], e10 = e[10], e11 = e[11]

    e[4] = e4 * c + e8 * s
    e[5] = e5 * c + e9 * s
    e[6] = e6 * c + e10 * s
    e[7] = e7 * c + e11 * s
    e[8] = e8 * c - e4 * s
    e[9] = e9 * c - e5 * s
    e[10] = e10 * c - e6 * s
    e[11] = e11 * c - e7 * s

    return this
  }

  rotateY(angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const e = this.elements

    const e0 = e[0], e1 = e[1], e2 = e[2], e3 = e[3]
    const e8 = e[8], e9 = e[9], e10 = e[10], e11 = e[11]

    e[0] = e0 * c - e8 * s
    e[1] = e1 * c - e9 * s
    e[2] = e2 * c - e10 * s
    e[3] = e3 * c - e11 * s
    e[8] = e0 * s + e8 * c
    e[9] = e1 * s + e9 * c
    e[10] = e2 * s + e10 * c
    e[11] = e3 * s + e11 * c

    return this
  }

  rotateZ(angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const e = this.elements

    const e0 = e[0], e1 = e[1], e2 = e[2], e3 = e[3]
    const e4 = e[4], e5 = e[5], e6 = e[6], e7 = e[7]

    e[0] = e0 * c + e4 * s
    e[1] = e1 * c + e5 * s
    e[2] = e2 * c + e6 * s
    e[3] = e3 * c + e7 * s
    e[4] = e4 * c - e0 * s
    e[5] = e5 * c - e1 * s
    e[6] = e6 * c - e2 * s
    e[7] = e7 * c - e3 * s

    return this
  }

  determinant() {
    const e = this.elements
    const n11 = e[0], n12 = e[4], n13 = e[8], n14 = e[12]
    const n21 = e[1], n22 = e[5], n23 = e[9], n24 = e[13]
    const n31 = e[2], n32 = e[6], n33 = e[10], n34 = e[14]
    const n41 = e[3], n42 = e[7], n43 = e[11], n44 = e[15]

    return (
      n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
      n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
      n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
      n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)
    )
  }

  invert() {
    const e = this.elements
    const n11 = e[0], n21 = e[1], n31 = e[2], n41 = e[3]
    const n12 = e[4], n22 = e[5], n32 = e[6], n42 = e[7]
    const n13 = e[8], n23 = e[9], n33 = e[10], n43 = e[11]
    const n14 = e[12], n24 = e[13], n34 = e[14], n44 = e[15]

    const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44
    const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44
    const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44
    const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14
    if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

    const detInv = 1 / det

    e[0] = t11 * detInv
    e[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv
    e[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv
    e[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv

    e[4] = t12 * detInv
    e[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv
    e[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv
    e[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv

    e[8] = t13 * detInv
    e[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv
    e[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv
    e[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv

    e[12] = t14 * detInv
    e[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv
    e[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv
    e[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv

    return this
  }

  static perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2)
    const nf = 1 / (near - far)
    return new Mat4().set(
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    )
  }

  static lookAt(eye, target, up) {
    const zAxis = { x: eye.x - target.x, y: eye.y - target.y, z: eye.z - target.z }
    const zLen = Math.sqrt(zAxis.x * zAxis.x + zAxis.y * zAxis.y + zAxis.z * zAxis.z)
    zAxis.x /= zLen; zAxis.y /= zLen; zAxis.z /= zLen

    const xAxis = {
      x: up.y * zAxis.z - up.z * zAxis.y,
      y: up.z * zAxis.x - up.x * zAxis.z,
      z: up.x * zAxis.y - up.y * zAxis.x
    }
    const xLen = Math.sqrt(xAxis.x * xAxis.x + xAxis.y * xAxis.y + xAxis.z * xAxis.z)
    xAxis.x /= xLen; xAxis.y /= xLen; xAxis.z /= xLen

    const yAxis = {
      x: zAxis.y * xAxis.z - zAxis.z * xAxis.y,
      y: zAxis.z * xAxis.x - zAxis.x * xAxis.z,
      z: zAxis.x * xAxis.y - zAxis.y * xAxis.x
    }

    return new Mat4().set(
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      -(xAxis.x * eye.x + xAxis.y * eye.y + xAxis.z * eye.z),
      -(yAxis.x * eye.x + yAxis.y * eye.y + yAxis.z * eye.z),
      -(zAxis.x * eye.x + zAxis.y * eye.y + zAxis.z * eye.z),
      1
    )
  }
}
