export class EventEmitter {
    constructor() {
        this.listeners = new Map()
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event).push(callback)
        return () => this.off(event, callback)
    }

    once(event, callback) {
        const wrapper = (...args) => {
            this.off(event, wrapper)
            callback(...args)
        }
        return this.on(event, wrapper)
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return
        
        const callbacks = this.listeners.get(event)
        const index = callbacks.indexOf(callback)
        
        if (index > -1) {
            callbacks.splice(index, 1)
        }
        
        if (callbacks.length === 0) {
            this.listeners.delete(event)
        }
    }

    emit(event, ...args) {
        if (!this.listeners.has(event)) return false
        
        const callbacks = this.listeners.get(event).slice()
        for (const callback of callbacks) {
            try {
                callback(...args)
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error)
            }
        }
        
        return true
    }

    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event)
        } else {
            this.listeners.clear()
        }
    }

    listenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0
    }
}
