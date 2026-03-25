import * as THREE from 'three'

export class SnapAlignTools {
    constructor(scene) {
        this.scene = scene
        this.gridSnap = 1.0
        this.rotationSnap = 15
        this.scaleSnap = 0.25
        this.snapEnabled = false
        this.vertexSnapEnabled = false
        this.vertexSnapThreshold = 0.5
    }

    setGridSnap(value) {
        this.gridSnap = value
    }

    setRotationSnap(degrees) {
        this.rotationSnap = degrees
    }

    enableSnap(enabled) {
        this.snapEnabled = enabled
    }

    enableVertexSnap(enabled) {
        this.vertexSnapEnabled = enabled
    }

    snapToGrid(position) {
        if (!this.snapEnabled) return position

        return new THREE.Vector3(
            Math.round(position.x / this.gridSnap) * this.gridSnap,
            Math.round(position.y / this.gridSnap) * this.gridSnap,
            Math.round(position.z / this.gridSnap) * this.gridSnap
        )
    }

    snapRotation(rotation) {
        if (!this.snapEnabled) return rotation

        const snapRad = (this.rotationSnap * Math.PI) / 180
        return new THREE.Euler(
            Math.round(rotation.x / snapRad) * snapRad,
            Math.round(rotation.y / snapRad) * snapRad,
            Math.round(rotation.z / snapRad) * snapRad
        )
    }

    snapScale(scale) {
        if (!this.snapEnabled) return scale

        return new THREE.Vector3(
            Math.round(scale.x / this.scaleSnap) * this.scaleSnap,
            Math.round(scale.y / this.scaleSnap) * this.scaleSnap,
            Math.round(scale.z / this.scaleSnap) * this.scaleSnap
        )
    }

    findNearestVertex(position, excludeObjects = []) {
        if (!this.vertexSnapEnabled) return null

        let nearestVertex = null
        let nearestDistance = this.vertexSnapThreshold

        this.scene.traverse(object => {
            if (excludeObjects.includes(object)) return
            if (!object.isMesh || !object.geometry) return

            const posAttr = object.geometry.attributes.position
            if (!posAttr) return

            object.updateMatrixWorld()
            const worldMatrix = object.matrixWorld

            for (let i = 0; i < posAttr.count; i++) {
                const vertex = new THREE.Vector3(
                    posAttr.getX(i),
                    posAttr.getY(i),
                    posAttr.getZ(i)
                )
                vertex.applyMatrix4(worldMatrix)

                const distance = position.distanceTo(vertex)
                if (distance < nearestDistance) {
                    nearestDistance = distance
                    nearestVertex = vertex.clone()
                }
            }
        })

        return nearestVertex
    }

    alignObjects(objects, axis, alignment) {
        if (!objects || objects.length < 2) return

        const bounds = this.calculateBounds(objects)
        
        objects.forEach(obj => {
            const objBounds = new THREE.Box3().setFromObject(obj)
            const objCenter = objBounds.getCenter(new THREE.Vector3())
            const objSize = objBounds.getSize(new THREE.Vector3())

            let targetPos

            switch (alignment) {
                case 'min':
                    targetPos = bounds.min[axis] + objSize[axis] / 2
                    break
                case 'max':
                    targetPos = bounds.max[axis] - objSize[axis] / 2
                    break
                case 'center':
                default:
                    const boundsCenter = bounds.min[axis] + (bounds.max[axis] - bounds.min[axis]) / 2
                    targetPos = boundsCenter
                    break
            }

            const offset = targetPos - objCenter[axis]
            obj.position[axis] += offset
        })
    }

    alignToMin(objects, axis) {
        this.alignObjects(objects, axis, 'min')
    }

    alignToMax(objects, axis) {
        this.alignObjects(objects, axis, 'max')
    }

    alignToCenter(objects, axis) {
        this.alignObjects(objects, axis, 'center')
    }

    distributeEvenly(objects, axis) {
        if (!objects || objects.length < 3) return

        objects.sort((a, b) => a.position[axis] - b.position[axis])

        const first = objects[0].position[axis]
        const last = objects[objects.length - 1].position[axis]
        const spacing = (last - first) / (objects.length - 1)

        objects.forEach((obj, index) => {
            obj.position[axis] = first + spacing * index
        })
    }

    calculateBounds(objects) {
        const bounds = new THREE.Box3()
        
        objects.forEach(obj => {
            const objBounds = new THREE.Box3().setFromObject(obj)
            bounds.union(objBounds)
        })

        return bounds
    }

    matchSize(objects, sourceObject, axes = ['x', 'y', 'z']) {
        if (!objects || objects.length === 0 || !sourceObject) return

        const sourceBounds = new THREE.Box3().setFromObject(sourceObject)
        const sourceSize = sourceBounds.getSize(new THREE.Vector3())

        objects.forEach(obj => {
            if (obj === sourceObject) return

            const objBounds = new THREE.Box3().setFromObject(obj)
            const objSize = objBounds.getSize(new THREE.Vector3())

            axes.forEach(axis => {
                if (objSize[axis] > 0) {
                    const scale = sourceSize[axis] / objSize[axis]
                    obj.scale[axis] *= scale
                }
            })
        })
    }

    stackObjects(objects, axis = 'y', gap = 0) {
        if (!objects || objects.length < 2) return

        objects.sort((a, b) => a.position[axis] - b.position[axis])

        let currentPos = objects[0].position[axis]

        objects.forEach((obj, index) => {
            if (index === 0) return

            const prevObj = objects[index - 1]
            const prevBounds = new THREE.Box3().setFromObject(prevObj)
            const prevSize = prevBounds.getSize(new THREE.Vector3())

            const objBounds = new THREE.Box3().setFromObject(obj)
            const objSize = objBounds.getSize(new THREE.Vector3())
            const objCenter = objBounds.getCenter(new THREE.Vector3())

            currentPos += prevSize[axis] / 2 + gap + objSize[axis] / 2
            const offset = currentPos - objCenter[axis]
            obj.position[axis] += offset
        })
    }

    centerOnGround(objects) {
        objects.forEach(obj => {
            const bounds = new THREE.Box3().setFromObject(obj)
            obj.position.y -= bounds.min.y
        })
    }

    centerInScene(objects) {
        if (!objects || objects.length === 0) return

        const bounds = this.calculateBounds(objects)
        const center = bounds.getCenter(new THREE.Vector3())

        objects.forEach(obj => {
            obj.position.x -= center.x
            obj.position.z -= center.z
        })
    }

    resetTransform(object) {
        object.position.set(0, 0, 0)
        object.rotation.set(0, 0, 0)
        object.scale.set(1, 1, 1)
    }

    applyTransform(object) {
        object.updateMatrix()
        object.geometry?.applyMatrix4(object.matrix)
        object.position.set(0, 0, 0)
        object.rotation.set(0, 0, 0)
        object.scale.set(1, 1, 1)
        object.updateMatrix()
    }
}
