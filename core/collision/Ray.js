import { Vec3 } from '../math/Vec3.js'

export class Ray {
  constructor(origin = new Vec3(), direction = new Vec3(0, 0, -1)) {
    this.origin = origin.clone ? origin.clone() : new Vec3(origin.x, origin.y, origin.z)
    this.direction = direction.clone ? direction.clone() : new Vec3(direction.x, direction.y, direction.z)
    this.direction.normalize()
  }

  set(origin, direction) {
    this.origin.copy(origin)
    this.direction.copy(direction).normalize()
    return this
  }

  clone() {
    return new Ray(this.origin, this.direction)
  }

  copy(ray) {
    this.origin.copy(ray.origin)
    this.direction.copy(ray.direction)
    return this
  }

  at(t) {
    return new Vec3(
      this.origin.x + this.direction.x * t,
      this.origin.y + this.direction.y * t,
      this.origin.z + this.direction.z * t
    )
  }

  lookAt(target) {
    this.direction.copy(target).sub(this.origin).normalize()
    return this
  }

  distanceToPoint(point) {
    const v = Vec3.sub(point, this.origin)
    const t = v.dot(this.direction)
    if (t < 0) {
      return this.origin.distance(point)
    }
    return this.at(t).distance(point)
  }

  distanceSqToPoint(point) {
    const v = Vec3.sub(point, this.origin)
    const t = v.dot(this.direction)
    if (t < 0) {
      return this.origin.distanceSq(point)
    }
    return this.at(t).distanceSq(point)
  }

  closestPointToPoint(point) {
    const v = Vec3.sub(point, this.origin)
    const t = Math.max(0, v.dot(this.direction))
    return this.at(t)
  }

  intersectSphere(sphere) {
    const v = Vec3.sub(sphere.center, this.origin)
    const tca = v.dot(this.direction)
    const d2 = v.dot(v) - tca * tca
    const radius2 = sphere.radius * sphere.radius

    if (d2 > radius2) return null

    const thc = Math.sqrt(radius2 - d2)
    const t0 = tca - thc
    const t1 = tca + thc

    if (t1 < 0) return null

    const t = t0 < 0 ? t1 : t0
    return { point: this.at(t), distance: t }
  }

  intersectBox(box) {
    let tmin, tmax, tymin, tymax, tzmin, tzmax

    const invdirx = 1 / this.direction.x
    const invdiry = 1 / this.direction.y
    const invdirz = 1 / this.direction.z

    if (invdirx >= 0) {
      tmin = (box.min.x - this.origin.x) * invdirx
      tmax = (box.max.x - this.origin.x) * invdirx
    } else {
      tmin = (box.max.x - this.origin.x) * invdirx
      tmax = (box.min.x - this.origin.x) * invdirx
    }

    if (invdiry >= 0) {
      tymin = (box.min.y - this.origin.y) * invdiry
      tymax = (box.max.y - this.origin.y) * invdiry
    } else {
      tymin = (box.max.y - this.origin.y) * invdiry
      tymax = (box.min.y - this.origin.y) * invdiry
    }

    if (tmin > tymax || tymin > tmax) return null
    if (tymin > tmin || isNaN(tmin)) tmin = tymin
    if (tymax < tmax || isNaN(tmax)) tmax = tymax

    if (invdirz >= 0) {
      tzmin = (box.min.z - this.origin.z) * invdirz
      tzmax = (box.max.z - this.origin.z) * invdirz
    } else {
      tzmin = (box.max.z - this.origin.z) * invdirz
      tzmax = (box.min.z - this.origin.z) * invdirz
    }

    if (tmin > tzmax || tzmin > tmax) return null
    if (tzmin > tmin || tmin !== tmin) tmin = tzmin
    if (tzmax < tmax || tmax !== tmax) tmax = tzmax

    if (tmax < 0) return null

    const t = tmin >= 0 ? tmin : tmax
    return { point: this.at(t), distance: t }
  }

  intersectPlane(plane) {
    const denominator = this.direction.dot(plane.normal)
    if (Math.abs(denominator) < 0.0001) return null
    
    const t = -(this.origin.dot(plane.normal) + plane.constant) / denominator
    if (t < 0) return null
    
    return { point: this.at(t), distance: t }
  }

  intersectTriangle(a, b, c, backfaceCulling = false) {
    const edge1 = Vec3.sub(b, a)
    const edge2 = Vec3.sub(c, a)
    const h = Vec3.cross(this.direction, edge2)
    const det = edge1.dot(h)

    if (backfaceCulling) {
      if (det < 0.0001) return null
    } else {
      if (Math.abs(det) < 0.0001) return null
    }

    const f = 1 / det
    const s = Vec3.sub(this.origin, a)
    const u = f * s.dot(h)

    if (u < 0 || u > 1) return null

    const q = Vec3.cross(s, edge1)
    const v = f * this.direction.dot(q)

    if (v < 0 || u + v > 1) return null

    const t = f * edge2.dot(q)

    if (t > 0.0001) {
      return { point: this.at(t), distance: t }
    }

    return null
  }
}
