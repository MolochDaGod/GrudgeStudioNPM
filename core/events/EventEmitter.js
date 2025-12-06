export class EventEmitter {
  constructor() {
    this.events = new Map()
    this.onceEvents = new Map()
  }

  on(event, callback, context = null) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push({ callback, context })
    return () => this.off(event, callback)
  }

  once(event, callback, context = null) {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, [])
    }
    this.onceEvents.get(event).push({ callback, context })
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.set(
        event,
        this.events.get(event).filter(listener => listener.callback !== callback)
      )
    }
    if (this.onceEvents.has(event)) {
      this.onceEvents.set(
        event,
        this.onceEvents.get(event).filter(listener => listener.callback !== callback)
      )
    }
    return this
  }

  emit(event, ...args) {
    const listeners = this.events.get(event)
    if (listeners) {
      for (const { callback, context } of listeners) {
        try {
          callback.apply(context, args)
        } catch (e) {
          console.error(`Event "${event}" handler error:`, e)
        }
      }
    }

    const onceListeners = this.onceEvents.get(event)
    if (onceListeners) {
      this.onceEvents.delete(event)
      for (const { callback, context } of onceListeners) {
        try {
          callback.apply(context, args)
        } catch (e) {
          console.error(`Event "${event}" once handler error:`, e)
        }
      }
    }

    return this
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event)
      this.onceEvents.delete(event)
    } else {
      this.events.clear()
      this.onceEvents.clear()
    }
    return this
  }

  listenerCount(event) {
    const count = (this.events.get(event)?.length || 0) + 
                  (this.onceEvents.get(event)?.length || 0)
    return count
  }

  eventNames() {
    const names = new Set([...this.events.keys(), ...this.onceEvents.keys()])
    return Array.from(names)
  }

  listeners(event) {
    const regular = this.events.get(event) || []
    const once = this.onceEvents.get(event) || []
    return [...regular, ...once].map(l => l.callback)
  }
}
