import * as THREE from 'three'

export class Layer {
  constructor(name, scene) {
    this.name = name
    this.scene = scene
    this.objects = new Set()
    this.visible = true
    this.group = new THREE.Group()
    this.group.name = name
    scene.add(this.group)
  }

  add(object) {
    this.objects.add(object)
    this.group.add(object)
    return this
  }

  remove(object) {
    this.objects.delete(object)
    this.group.remove(object)
    return this
  }

  clear() {
    for (const object of this.objects) {
      this.group.remove(object)
    }
    this.objects.clear()
    return this
  }

  show() {
    this.visible = true
    this.group.visible = true
    return this
  }

  hide() {
    this.visible = false
    this.group.visible = false
    return this
  }

  toggle() {
    this.visible = !this.visible
    this.group.visible = this.visible
    return this
  }

  setOpacity(opacity) {
    this.group.traverse((child) => {
      if (child.material) {
        child.material.transparent = true
        child.material.opacity = opacity
      }
    })
    return this
  }

  getObjects() {
    return Array.from(this.objects)
  }

  forEach(callback) {
    this.objects.forEach(callback)
    return this
  }

  dispose() {
    this.clear()
    this.scene.remove(this.group)
  }
}
