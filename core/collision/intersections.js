export function sphereVsSphere(a, b) {
  const radiusSum = a.radius + b.radius
  const distanceSq = a.center.distanceSq(b.center)
  
  if (distanceSq > radiusSum * radiusSum) {
    return null
  }
  
  const distance = Math.sqrt(distanceSq)
  const penetration = radiusSum - distance
  
  if (distance === 0) {
    return {
      hit: true,
      penetration,
      normal: { x: 0, y: 1, z: 0 },
      point: a.center.clone()
    }
  }
  
  const normal = {
    x: (b.center.x - a.center.x) / distance,
    y: (b.center.y - a.center.y) / distance,
    z: (b.center.z - a.center.z) / distance
  }
  
  return {
    hit: true,
    penetration,
    normal,
    point: {
      x: a.center.x + normal.x * a.radius,
      y: a.center.y + normal.y * a.radius,
      z: a.center.z + normal.z * a.radius
    }
  }
}

export function sphereVsAABB(sphere, box) {
  const closestPoint = box.clampPoint(sphere.center)
  const distanceSq = closestPoint.distanceSq(sphere.center)
  
  if (distanceSq > sphere.radius * sphere.radius) {
    return null
  }
  
  const distance = Math.sqrt(distanceSq)
  const penetration = sphere.radius - distance
  
  let normal
  if (distance === 0) {
    const center = box.getCenter()
    const dx = sphere.center.x - center.x
    const dy = sphere.center.y - center.y
    const dz = sphere.center.z - center.z
    const size = box.getSize()
    
    const px = size.x / 2 - Math.abs(dx)
    const py = size.y / 2 - Math.abs(dy)
    const pz = size.z / 2 - Math.abs(dz)
    
    if (px < py && px < pz) {
      normal = { x: dx > 0 ? 1 : -1, y: 0, z: 0 }
    } else if (py < pz) {
      normal = { x: 0, y: dy > 0 ? 1 : -1, z: 0 }
    } else {
      normal = { x: 0, y: 0, z: dz > 0 ? 1 : -1 }
    }
  } else {
    normal = {
      x: (sphere.center.x - closestPoint.x) / distance,
      y: (sphere.center.y - closestPoint.y) / distance,
      z: (sphere.center.z - closestPoint.z) / distance
    }
  }
  
  return {
    hit: true,
    penetration,
    normal,
    point: closestPoint
  }
}

export function aabbVsAABB(a, b) {
  if (!a.intersectsBox(b)) {
    return null
  }
  
  const aCenter = a.getCenter()
  const bCenter = b.getCenter()
  const aSize = a.getSize()
  const bSize = b.getSize()
  
  const dx = bCenter.x - aCenter.x
  const dy = bCenter.y - aCenter.y
  const dz = bCenter.z - aCenter.z
  
  const px = (aSize.x + bSize.x) / 2 - Math.abs(dx)
  const py = (aSize.y + bSize.y) / 2 - Math.abs(dy)
  const pz = (aSize.z + bSize.z) / 2 - Math.abs(dz)
  
  let normal, penetration
  
  if (px < py && px < pz) {
    penetration = px
    normal = { x: dx > 0 ? -1 : 1, y: 0, z: 0 }
  } else if (py < pz) {
    penetration = py
    normal = { x: 0, y: dy > 0 ? -1 : 1, z: 0 }
  } else {
    penetration = pz
    normal = { x: 0, y: 0, z: dz > 0 ? -1 : 1 }
  }
  
  return {
    hit: true,
    penetration,
    normal,
    point: {
      x: aCenter.x + normal.x * aSize.x / 2,
      y: aCenter.y + normal.y * aSize.y / 2,
      z: aCenter.z + normal.z * aSize.z / 2
    }
  }
}

export function capsuleVsCapsule(a, b) {
  const d1 = { x: a.end.x - a.start.x, y: a.end.y - a.start.y, z: a.end.z - a.start.z }
  const d2 = { x: b.end.x - b.start.x, y: b.end.y - b.start.y, z: b.end.z - b.start.z }
  const r = { x: a.start.x - b.start.x, y: a.start.y - b.start.y, z: a.start.z - b.start.z }
  
  const d1d1 = d1.x * d1.x + d1.y * d1.y + d1.z * d1.z
  const d2d2 = d2.x * d2.x + d2.y * d2.y + d2.z * d2.z
  const d1d2 = d1.x * d2.x + d1.y * d2.y + d1.z * d2.z
  const d1r = d1.x * r.x + d1.y * r.y + d1.z * r.z
  const d2r = d2.x * r.x + d2.y * r.y + d2.z * r.z
  
  const denom = d1d1 * d2d2 - d1d2 * d1d2
  
  let s, t
  if (denom < 0.0001) {
    s = 0
    t = d1d2 > d2d2 ? d1r / d1d2 : d2r / d2d2
  } else {
    s = (d1d2 * d2r - d2d2 * d1r) / denom
    t = (d1d1 * d2r - d1d2 * d1r) / denom
  }
  
  s = Math.max(0, Math.min(1, s))
  t = Math.max(0, Math.min(1, t))
  
  const p1 = {
    x: a.start.x + d1.x * s,
    y: a.start.y + d1.y * s,
    z: a.start.z + d1.z * s
  }
  const p2 = {
    x: b.start.x + d2.x * t,
    y: b.start.y + d2.y * t,
    z: b.start.z + d2.z * t
  }
  
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dz = p2.z - p1.z
  const distanceSq = dx * dx + dy * dy + dz * dz
  const radiusSum = a.radius + b.radius
  
  if (distanceSq > radiusSum * radiusSum) {
    return null
  }
  
  const distance = Math.sqrt(distanceSq)
  const penetration = radiusSum - distance
  
  let normal
  if (distance === 0) {
    normal = { x: 0, y: 1, z: 0 }
  } else {
    normal = { x: dx / distance, y: dy / distance, z: dz / distance }
  }
  
  return {
    hit: true,
    penetration,
    normal,
    point: {
      x: p1.x + normal.x * a.radius,
      y: p1.y + normal.y * a.radius,
      z: p1.z + normal.z * a.radius
    }
  }
}
