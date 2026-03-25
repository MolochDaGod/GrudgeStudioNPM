export class ObjectPool {
    constructor(factory, initialSize = 10, maxSize = 100) {
        this.factory = factory
        this.maxSize = maxSize
        this.pool = []
        this.active = new Set()
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createObject())
        }
    }

    createObject() {
        const obj = this.factory()
        obj._poolId = Math.random().toString(36).substr(2, 9)
        return obj
    }

    acquire() {
        let obj
        if (this.pool.length > 0) {
            obj = this.pool.pop()
        } else if (this.active.size < this.maxSize) {
            obj = this.createObject()
        } else {
            console.warn('ObjectPool: Max size reached')
            return null
        }

        this.active.add(obj)
        
        if (obj.onAcquire) {
            obj.onAcquire()
        }
        
        return obj
    }

    release(obj) {
        if (!this.active.has(obj)) {
            return false
        }

        this.active.delete(obj)
        
        if (obj.onRelease) {
            obj.onRelease()
        }

        if (obj.reset) {
            obj.reset()
        }

        this.pool.push(obj)
        return true
    }

    releaseAll() {
        this.active.forEach(obj => {
            if (obj.onRelease) obj.onRelease()
            if (obj.reset) obj.reset()
            this.pool.push(obj)
        })
        this.active.clear()
    }

    getActiveCount() {
        return this.active.size
    }

    getAvailableCount() {
        return this.pool.length
    }

    getTotalCount() {
        return this.pool.length + this.active.size
    }

    dispose() {
        this.pool.forEach(obj => {
            if (obj.dispose) obj.dispose()
        })
        this.active.forEach(obj => {
            if (obj.dispose) obj.dispose()
        })
        this.pool = []
        this.active.clear()
    }
}

export class ProjectilePool extends ObjectPool {
    constructor(scene, initialSize = 20) {
        super(() => this.createProjectile(), initialSize, 100)
        this.scene = scene
    }

    createProjectile() {
        const THREE = window.THREE
        if (!THREE) return { mesh: null }

        const geometry = new THREE.SphereGeometry(0.1, 8, 8)
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.visible = false

        return {
            mesh,
            velocity: new THREE.Vector3(),
            damage: 0,
            owner: null,
            lifetime: 0,
            maxLifetime: 3,
            
            onAcquire() {
                this.mesh.visible = true
                this.lifetime = 0
            },
            
            onRelease() {
                this.mesh.visible = false
            },
            
            reset() {
                this.velocity.set(0, 0, 0)
                this.damage = 0
                this.owner = null
                this.lifetime = 0
            },
            
            update(dt) {
                this.mesh.position.add(this.velocity.clone().multiplyScalar(dt))
                this.lifetime += dt
                return this.lifetime < this.maxLifetime
            },
            
            dispose() {
                geometry.dispose()
                material.dispose()
            }
        }
    }
}

export class ParticlePool extends ObjectPool {
    constructor(scene, initialSize = 50) {
        super(() => this.createParticle(), initialSize, 200)
        this.scene = scene
    }

    createParticle() {
        const THREE = window.THREE
        if (!THREE) return { mesh: null }

        const geometry = new THREE.PlaneGeometry(0.5, 0.5)
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.visible = false

        return {
            mesh,
            velocity: new THREE.Vector3(),
            lifetime: 0,
            maxLifetime: 1,
            
            onAcquire() {
                this.mesh.visible = true
                this.lifetime = 0
                this.mesh.material.opacity = 1
            },
            
            onRelease() {
                this.mesh.visible = false
            },
            
            reset() {
                this.velocity.set(0, 0, 0)
                this.lifetime = 0
            },
            
            update(dt, camera) {
                this.mesh.position.add(this.velocity.clone().multiplyScalar(dt))
                this.lifetime += dt
                this.mesh.material.opacity = 1 - (this.lifetime / this.maxLifetime)
                if (camera) {
                    this.mesh.lookAt(camera.position)
                }
                return this.lifetime < this.maxLifetime
            },
            
            dispose() {
                geometry.dispose()
                material.dispose()
            }
        }
    }
}
