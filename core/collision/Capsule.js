import { Vec3 } from '../math/Vec3.js'

export class Capsule {
  constructor(start = new Vec3(0, 0, 0), end = new Vec3(0, 1, 0), radius = 0.5) {
    this.start = start.clone ? start.clone() : new Vec3(start.x, start.y, start.z)
    this.end = end.clone ? end.clone() : new Vec3(end.x, end.y, end.z)
    this.radius = radius
  }

  set(start, end, radius) {
    this.start.copy(start)
    this.end.copy(end)
    this.radius = radius
    return this
  }

  clone() {
    return new Capsule(this.start, this.end, this.radius)
  }

  copy(capsule) {
    this.start.copy(capsule.start)
    this.end.copy(capsule.end)
    this.radius = capsule.radius
    return this
  }

  getCenter() {
    return Vec3.lerp(this.start, this.end, 0.5)
  }

  getHeight() {
    return this.start.distance(this.end)
  }

  getDirection() {
    return Vec3.sub(this.end, this.start).normalize()
  }

  closestPointOnSegment(point) {
    const ab = Vec3.sub(this.end, this.start)
    const t = Math.max(0, Math.min(1, Vec3.sub(point, this.start).dot(ab) / ab.lengthSq()))
    return Vec3.lerp(this.start, this.end, t)
  }

  distanceToPoint(point) {
    const closest = this.closestPointOnSegment(point)
    return point.distance(closest) - this.radius
  }

  containsPoint(point) {
    return this.distanceToPoint(point) <= 0
  }

  intersectsSphere(sphere) {
    const closest = this.closestPointOnSegment(sphere.center)
    const distance = sphere.center.distance(closest)
    return distance <= this.radius + sphere.radius
  }

  intersectsCapsule(capsule) {
    const closest1 = this.closestPointOnSegment(capsule.start)
    const closest2 = this.closestPointOnSegment(capsule.end)
    const dist1 = capsule.closestPointOnSegment(closest1).distance(closest1)
    const dist2 = capsule.closestPointOnSegment(closest2).distance(closest2)
    const minDist = Math.min(dist1, dist2)
    return minDist <= this.radius + capsule.radius
  }

  getBoundingBox() {
    const { AABB } = require('./AABB.js')
    const box = new AABB()
    box.min.x = Math.min(this.start.x, this.end.x) - this.radius
    box.min.y = Math.min(this.start.y, this.end.y) - this.radius
    box.min.z = Math.min(this.start.z, this.end.z) - this.radius
    box.max.x = Math.max(this.start.x, this.end.x) + this.radius
    box.max.y = Math.max(this.start.y, this.end.y) + this.radius
    box.max.z = Math.max(this.start.z, this.end.z) + this.radius
    return box
  }

  translate(offset) {
    this.start.add(offset)
    this.end.add(offset)
    return this
  }
}
