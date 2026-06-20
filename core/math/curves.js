import { Vec2 } from './Vec2.js'
import { Vec3 } from './Vec3.js'

export class Bezier {
  static quadratic2D(p0, p1, p2, t) {
    const mt = 1 - t
    return new Vec2(
      mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
    )
  }

  static cubic2D(p0, p1, p2, p3, t) {
    const mt = 1 - t
    const mt2 = mt * mt
    const t2 = t * t
    return new Vec2(
      mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
    )
  }

  static quadratic3D(p0, p1, p2, t) {
    const mt = 1 - t
    return new Vec3(
      mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
      mt * mt * p0.z + 2 * mt * t * p1.z + t * t * p2.z
    )
  }

  static cubic3D(p0, p1, p2, p3, t) {
    const mt = 1 - t
    const mt2 = mt * mt
    const t2 = t * t
    return new Vec3(
      mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
      mt2 * mt * p0.z + 3 * mt2 * t * p1.z + 3 * mt * t2 * p2.z + t2 * t * p3.z
    )
  }
}

export class CatmullRom {
  static point2D(p0, p1, p2, p3, t, alpha = 0.5) {
    const t01 = Math.pow(p0.distance(p1), alpha)
    const t12 = Math.pow(p1.distance(p2), alpha)
    const t23 = Math.pow(p2.distance(p3), alpha)

    const m1x = (1 - (t01 / (t01 + t12))) * (p2.x - p1.x) + (t01 / (t01 + t12)) * (p1.x - p0.x)
    const m1y = (1 - (t01 / (t01 + t12))) * (p2.y - p1.y) + (t01 / (t01 + t12)) * (p1.y - p0.y)
    const m2x = (1 - (t23 / (t12 + t23))) * (p2.x - p1.x) + (t23 / (t12 + t23)) * (p3.x - p2.x)
    const m2y = (1 - (t23 / (t12 + t23))) * (p2.y - p1.y) + (t23 / (t12 + t23)) * (p3.y - p2.y)

    const t2 = t * t
    const t3 = t2 * t
    return new Vec2(
      (2 * t3 - 3 * t2 + 1) * p1.x + (t3 - 2 * t2 + t) * m1x + (-2 * t3 + 3 * t2) * p2.x + (t3 - t2) * m2x,
      (2 * t3 - 3 * t2 + 1) * p1.y + (t3 - 2 * t2 + t) * m1y + (-2 * t3 + 3 * t2) * p2.y + (t3 - t2) * m2y
    )
  }
}

export class Path2D {
  constructor(points = []) {
    this.points = points
    this.closed = false
  }

  addPoint(point) {
    this.points.push(point)
    return this
  }

  getPoint(t) {
    const points = this.points
    const n = points.length
    if (n < 2) return points[0] || new Vec2()

    const segmentCount = this.closed ? n : n - 1
    const segment = Math.floor(t * segmentCount)
    const localT = (t * segmentCount) - segment

    const i0 = this.closed ? (segment - 1 + n) % n : Math.max(0, segment - 1)
    const i1 = this.closed ? segment % n : segment
    const i2 = this.closed ? (segment + 1) % n : Math.min(n - 1, segment + 1)
    const i3 = this.closed ? (segment + 2) % n : Math.min(n - 1, segment + 2)

    return CatmullRom.point2D(points[i0], points[i1], points[i2], points[i3], localT)
  }

  getPoints(divisions = 50) {
    const result = []
    for (let i = 0; i <= divisions; i++) {
      result.push(this.getPoint(i / divisions))
    }
    return result
  }

  getLength(divisions = 50) {
    let length = 0
    let prev = this.getPoint(0)
    for (let i = 1; i <= divisions; i++) {
      const point = this.getPoint(i / divisions)
      length += prev.distance(point)
      prev = point
    }
    return length
  }
}

export class Path3D {
  constructor(points = []) {
    this.points = points
    this.closed = false
  }

  addPoint(point) {
    this.points.push(point)
    return this
  }

  getPoint(t) {
    const points = this.points
    const n = points.length
    if (n < 2) return points[0] || new Vec3()

    const segmentCount = this.closed ? n : n - 1
    const segment = Math.min(Math.floor(t * segmentCount), segmentCount - 1)
    const localT = (t * segmentCount) - segment

    const i1 = this.closed ? segment % n : segment
    const i2 = this.closed ? (segment + 1) % n : Math.min(n - 1, segment + 1)

    return Vec3.lerp(points[i1], points[i2], localT)
  }

  getPoints(divisions = 50) {
    const result = []
    for (let i = 0; i <= divisions; i++) {
      result.push(this.getPoint(i / divisions))
    }
    return result
  }
}
