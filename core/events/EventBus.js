import { EventEmitter } from './EventEmitter.js'

class GlobalEventBus extends EventEmitter {
  constructor() {
    super()
    this.channels = new Map()
  }

  channel(name) {
    if (!this.channels.has(name)) {
      this.channels.set(name, new EventEmitter())
    }
    return this.channels.get(name)
  }

  hasChannel(name) {
    return this.channels.has(name)
  }

  removeChannel(name) {
    const channel = this.channels.get(name)
    if (channel) {
      channel.removeAllListeners()
      this.channels.delete(name)
    }
    return this
  }

  clearAllChannels() {
    for (const channel of this.channels.values()) {
      channel.removeAllListeners()
    }
    this.channels.clear()
    return this
  }

  broadcast(event, ...args) {
    this.emit(event, ...args)
    for (const channel of this.channels.values()) {
      channel.emit(event, ...args)
    }
    return this
  }
}

export const EventBus = new GlobalEventBus()
