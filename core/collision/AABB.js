import { Vec3 } from '../math/Vec3.js'

export class AABB {
  constructor(min = new Vec3(-1, -1, -1), max = new Vec3(1, 1, 1)) {
    this.min = min.clone ? min.clone() : new Vec3(min.x, min.y, min.z)
    this.max = max.clone ? max.clone() : new Vec3(max.x, max.y, max.z)
  }

  set(min, max) {
    this.min.copy(min)
    this.max.copy(max)
    return this
  }

  setFromCenterAndSize(center, size) {
    const halfSize = new Vec3(size.x / 2, size.y / 2, size.z / 2)
    this.min.set(center.x - halfSize.x, center.y - halfSize.y, center.z - halfSize.z)
    this.max.set(center.x + halfSize.x, center.y + halfSize.y, center.z + halfSize.z)
    return this
  }

  setFromPoints(points) {
    this.makeEmpty()
    for (const point of points) {
      this.expandByPoint(point)
    }
    return this
  }

  clone() {
    return new AABB(this.min, this.max)
  }

  copy(box) {
    this.min.copy(box.min)
    this.max.copy(box.max)
    return this
  }

  makeEmpty() {
    this.min.set(Infinity, Infinity, Infinity)
    this.max.set(-Infinity, -Infinity, -Infinity)
    return this
  }

  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
  }

  getCenter() {
    if (this.isEmpty()) return new Vec3()
    return new Vec3(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2,
      (this.min.z + this.max.z) / 2
    )
  }

  getSize() {
    if (this.isEmpty()) return new Vec3()
    return new Vec3(
      this.max.x - this.min.x,
      this.max.y - this.min.y,
      this.max.z - this.min.z
    )
  }

  expandByPoint(point) {
    this.min.x = Math.min(this.min.x, point.x)
    this.min.y = Math.min(this.min.y, point.y)
    this.min.z = Math.min(this.min.z, point.z)
    this.max.x = Math.max(this.max.x, point.x)
    this.max.y = Math.max(this.max.y, point.y)
    this.max.z = Math.max(this.max.z, point.z)
    return this
  }

  expandByScalar(scalar) {
    this.min.x -= scalar
    this.min.y -= scalar
    this.min.z -= scalar
    this.max.x += scalar
    this.max.y += scalar
    this.max.z += scalar
    return this
  }

  containsPoint(point) {
    return point.x >= this.min.x && point.x <= this.max.x &&
           point.y >= this.min.y && point.y <= this.max.y &&
           point.z >= this.min.z && point.z <= this.max.z
  }

  containsBox(box) {
    return this.min.x <= box.min.x && box.max.x <= this.max.x &&
           this.min.y <= box.min.y && box.max.y <= this.max.y &&
           this.min.z <= box.min.z && box.max.z <= this.max.z
  }

  intersectsBox(box) {
    return box.max.x >= this.min.x && box.min.x <= this.max.x &&
           box.max.y >= this.min.y && box.min.y <= this.max.y &&
           box.max.z >= this.min.z && box.min.z <= this.max.z
  }

  intersectsSphere(sphere) {
    const closestPoint = this.clampPoint(sphere.center)
    return closestPoint.distanceSq(sphere.center) <= sphere.radius * sphere.radius
  }

  clampPoint(point) {
    return new Vec3(
      Math.max(this.min.x, Math.min(this.max.x, point.x)),
      Math.max(this.min.y, Math.min(this.max.y, point.y)),
      Math.max(this.min.z, Math.min(this.max.z, point.z))
    )
  }

  distanceToPoint(point) {
    return this.clampPoint(point).distance(point)
  }

  union(box) {
    this.min.x = Math.min(this.min.x, box.min.x)
    this.min.y = Math.min(this.min.y, box.min.y)
    this.min.z = Math.min(this.min.z, box.min.z)
    this.max.x = Math.max(this.max.x, box.max.x)
    this.max.y = Math.max(this.max.y, box.max.y)
    this.max.z = Math.max(this.max.z, box.max.z)
    return this
  }

  intersect(box) {
    this.min.x = Math.max(this.min.x, box.min.x)
    this.min.y = Math.max(this.min.y, box.min.y)
    this.min.z = Math.max(this.min.z, box.min.z)
    this.max.x = Math.min(this.max.x, box.max.x)
    this.max.y = Math.min(this.max.y, box.max.y)
    this.max.z = Math.min(this.max.z, box.max.z)
    if (this.isEmpty()) this.makeEmpty()
    return this
  }

  translate(offset) {
    this.min.add(offset)
    this.max.add(offset)
    return this
  }
}
