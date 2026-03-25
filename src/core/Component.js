/*
    GRUDGE Studio - Component System
    Needle Engine-inspired component architecture with decorators and lifecycle
*/

export const FrameEvent = {
    EarlyUpdate: 'earlyUpdate',
    Update: 'update',
    LateUpdate: 'lateUpdate',
    BeforeRender: 'beforeRender',
    AfterRender: 'afterRender'
}

const serializedFields = new WeakMap()
const syncedFields = new WeakMap()
const validatedFields = new WeakMap()

export function serializable(type = null) {
    return function(target, propertyKey) {
        if (!serializedFields.has(target.constructor)) {
            serializedFields.set(target.constructor, new Map())
        }
        serializedFields.get(target.constructor).set(propertyKey, {
            type: type,
            propertyKey: propertyKey
        })
    }
}

export function syncField(callback = null) {
    return function(target, propertyKey) {
        if (!syncedFields.has(target.constructor)) {
            syncedFields.set(target.constructor, new Map())
        }
        syncedFields.get(target.constructor).set(propertyKey, {
            callback: callback,
            propertyKey: propertyKey
        })
        
        const privateKey = `_${propertyKey}`
        
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[privateKey]
            },
            set(value) {
                const oldValue = this[privateKey]
                this[privateKey] = value
                
                if (this._syncEnabled && oldValue !== value) {
                    this._onFieldSync?.(propertyKey, value, oldValue)
                    
                    if (callback && typeof this[callback] === 'function') {
                        this[callback](propertyKey, value, oldValue)
                    }
                }
            },
            enumerable: true,
            configurable: true
        })
    }
}

export function validate() {
    return function(target, propertyKey) {
        if (!validatedFields.has(target.constructor)) {
            validatedFields.set(target.constructor, new Set())
        }
        validatedFields.get(target.constructor).add(propertyKey)
        
        const privateKey = `_validated_${propertyKey}`
        
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[privateKey]
            },
            set(value) {
                const oldValue = this[privateKey]
                this[privateKey] = value
                
                if (oldValue !== value && typeof this.onValidate === 'function') {
                    this.onValidate(propertyKey, value, oldValue)
                }
            },
            enumerable: true,
            configurable: true
        })
    }
}

export function prefix(TargetClass) {
    return function(target, methodName, descriptor) {
        const originalMethod = TargetClass.prototype[methodName]
        
        if (originalMethod) {
            TargetClass.prototype[methodName] = function(...args) {
                const result = descriptor.value.apply(this, args)
                if (result === false) {
                    return
                }
                return originalMethod.apply(this, args)
            }
        }
        
        return descriptor
    }
}

export class Behaviour {
    constructor(gameObject = null, context = null) {
        this.gameObject = gameObject
        this.context = context
        this.enabled = true
        this._started = false
        this._destroyed = false
        this._syncEnabled = true
        this._coroutines = []
        
        this.uuid = crypto.randomUUID()
    }
    
    get visible() {
        return this.gameObject?.visible ?? true
    }
    
    set visible(value) {
        if (this.gameObject) {
            this.gameObject.visible = value
        }
    }
    
    get transform() {
        return this.gameObject
    }
    
    get position() {
        return this.gameObject?.position
    }
    
    get rotation() {
        return this.gameObject?.rotation
    }
    
    get scale() {
        return this.gameObject?.scale
    }
    
    get name() {
        return this.gameObject?.name || this.constructor.name
    }
    
    getSerializedFields() {
        const fields = serializedFields.get(this.constructor)
        if (!fields) return []
        
        return Array.from(fields.entries()).map(([key, config]) => ({
            name: key,
            type: config.type,
            value: this[key]
        }))
    }
    
    serialize() {
        const data = {
            type: this.constructor.name,
            uuid: this.uuid,
            enabled: this.enabled,
            fields: {}
        }
        
        const fields = serializedFields.get(this.constructor)
        if (fields) {
            for (const [key, config] of fields) {
                data.fields[key] = this[key]
            }
        }
        
        return data
    }
    
    deserialize(data) {
        if (data.uuid) this.uuid = data.uuid
        if (data.enabled !== undefined) this.enabled = data.enabled
        
        if (data.fields) {
            for (const [key, value] of Object.entries(data.fields)) {
                this[key] = value
            }
        }
        
        return this
    }
    
    startCoroutine(generator, frameEvent = FrameEvent.Update) {
        const coroutine = {
            generator: generator,
            frameEvent: frameEvent,
            active: true
        }
        this._coroutines.push(coroutine)
        return coroutine
    }
    
    stopCoroutine(coroutine) {
        const index = this._coroutines.indexOf(coroutine)
        if (index > -1) {
            this._coroutines[index].active = false
            this._coroutines.splice(index, 1)
        }
    }
    
    stopAllCoroutines() {
        this._coroutines.forEach(c => c.active = false)
        this._coroutines = []
    }
    
    _updateCoroutines(frameEvent) {
        for (let i = this._coroutines.length - 1; i >= 0; i--) {
            const coroutine = this._coroutines[i]
            if (!coroutine.active || coroutine.frameEvent !== frameEvent) continue
            
            const result = coroutine.generator.next()
            if (result.done) {
                this._coroutines.splice(i, 1)
            }
        }
    }
    
    destroy() {
        if (this._destroyed) return
        this._destroyed = true
        
        this.stopAllCoroutines()
        
        if (typeof this.onDestroy === 'function') {
            this.onDestroy()
        }
    }
    
    getComponent(ComponentClass) {
        if (!this.gameObject?._components) return null
        return this.gameObject._components.find(c => c instanceof ComponentClass)
    }
    
    getComponents(ComponentClass) {
        if (!this.gameObject?._components) return []
        return this.gameObject._components.filter(c => c instanceof ComponentClass)
    }
    
    addComponent(ComponentClass) {
        const component = new ComponentClass(this.gameObject, this.context)
        if (!this.gameObject._components) {
            this.gameObject._components = []
        }
        this.gameObject._components.push(component)
        return component
    }
    
    _onFieldSync(fieldName, newValue, oldValue) {
        if (this.context?.networking) {
            this.context.networking.syncField(this.uuid, fieldName, newValue)
        }
    }
}

export class ComponentSystem {
    constructor(context) {
        this.context = context
        this.components = new Map()
        this.componentsByType = new Map()
    }
    
    register(component) {
        this.components.set(component.uuid, component)
        
        const typeName = component.constructor.name
        if (!this.componentsByType.has(typeName)) {
            this.componentsByType.set(typeName, new Set())
        }
        this.componentsByType.get(typeName).add(component)
        
        if (typeof component.awake === 'function') {
            component.awake()
        }
    }
    
    unregister(component) {
        this.components.delete(component.uuid)
        
        const typeName = component.constructor.name
        if (this.componentsByType.has(typeName)) {
            this.componentsByType.get(typeName).delete(component)
        }
    }
    
    getByType(typeName) {
        return Array.from(this.componentsByType.get(typeName) || [])
    }
    
    earlyUpdate() {
        for (const component of this.components.values()) {
            if (!component.enabled || component._destroyed) continue
            
            if (!component._started) {
                component._started = true
                if (typeof component.start === 'function') {
                    component.start()
                }
                if (typeof component.onEnable === 'function') {
                    component.onEnable()
                }
            }
            
            if (typeof component.earlyUpdate === 'function') {
                component.earlyUpdate()
            }
            component._updateCoroutines(FrameEvent.EarlyUpdate)
        }
    }
    
    update() {
        for (const component of this.components.values()) {
            if (!component.enabled || component._destroyed) continue
            
            if (typeof component.update === 'function') {
                component.update()
            }
            component._updateCoroutines(FrameEvent.Update)
        }
    }
    
    lateUpdate() {
        for (const component of this.components.values()) {
            if (!component.enabled || component._destroyed) continue
            
            if (typeof component.lateUpdate === 'function') {
                component.lateUpdate()
            }
            component._updateCoroutines(FrameEvent.LateUpdate)
        }
    }
    
    onBeforeRender() {
        for (const component of this.components.values()) {
            if (!component.enabled || component._destroyed) continue
            
            if (typeof component.onBeforeRender === 'function') {
                component.onBeforeRender()
            }
            component._updateCoroutines(FrameEvent.BeforeRender)
        }
    }
    
    onAfterRender() {
        for (const component of this.components.values()) {
            if (!component.enabled || component._destroyed) continue
            
            if (typeof component.onAfterRender === 'function') {
                component.onAfterRender()
            }
            component._updateCoroutines(FrameEvent.AfterRender)
        }
    }
    
    destroy() {
        for (const component of this.components.values()) {
            component.destroy()
        }
        this.components.clear()
        this.componentsByType.clear()
    }
}

export default Behaviour
