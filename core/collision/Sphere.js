import { Vec3 } from '../math/Vec3.js'

export class Sphere {
  constructor(center = new Vec3(), radius = 1) {
    this.center = center.clone ? center.clone() : new Vec3(center.x, center.y, center.z)
    this.radius = radius
  }

  set(center, radius) {
    this.center.copy(center)
    this.radius = radius
    return this
  }

  clone() {
    return new Sphere(this.center, this.radius)
  }

  copy(sphere) {
    this.center.copy(sphere.center)
    this.radius = sphere.radius
    return this
  }

  isEmpty() {
    return this.radius < 0
  }

  makeEmpty() {
    this.center.set(0, 0, 0)
    this.radius = -1
    return this
  }

  containsPoint(point) {
    return point.distanceSq(this.center) <= this.radius * this.radius
  }

  distanceToPoint(point) {
    return point.distance(this.center) - this.radius
  }

  intersectsSphere(sphere) {
    const radiusSum = this.radius + sphere.radius
    return sphere.center.distanceSq(this.center) <= radiusSum * radiusSum
  }

  intersectsBox(box) {
    return box.intersectsSphere(this)
  }

  clampPoint(point) {
    const deltaLengthSq = this.center.distanceSq(point)
    if (deltaLengthSq > this.radius * this.radius) {
      const result = point.clone().sub(this.center).normalize()
      result.mul(this.radius).add(this.center)
      return result
    }
    return point.clone()
  }

  getBoundingBox() {
    const { AABB } = require('./AABB.js')
    return new AABB(
      new Vec3(
        this.center.x - this.radius,
        this.center.y - this.radius,
        this.center.z - this.radius
      ),
      new Vec3(
        this.center.x + this.radius,
        this.center.y + this.radius,
        this.center.z + this.radius
      )
    )
  }

  translate(offset) {
    this.center.add(offset)
    return this
  }

  expandByPoint(point) {
    const distance = this.center.distance(point)
    if (distance > this.radius) {
      const delta = (distance - this.radius) / 2
      this.center.add(Vec3.sub(point, this.center).normalize().mul(delta))
      this.radius += delta
    }
    return this
  }

  union(sphere) {
    const distance = this.center.distance(sphere.center)
    if (distance + sphere.radius <= this.radius) {
      return this
    }
    if (distance + this.radius <= sphere.radius) {
      return this.copy(sphere)
    }
    const newRadius = (this.radius + sphere.radius + distance) / 2
    const t = (newRadius - this.radius) / distance
    this.center.lerp(sphere.center, t)
    this.radius = newRadius
    return this
  }
}
