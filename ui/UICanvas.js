export class UICanvas {
  constructor(options = {}) {
    this.width = options.width ?? window.innerWidth
    this.height = options.height ?? window.innerHeight
    this.pixelRatio = options.pixelRatio ?? window.devicePixelRatio
    
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width * this.pixelRatio
    this.canvas.height = this.height * this.pixelRatio
    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.pointerEvents = options.interactive ? 'auto' : 'none'
    this.canvas.style.zIndex = options.zIndex ?? '100'
    
    this.ctx = this.canvas.getContext('2d')
    this.ctx.scale(this.pixelRatio, this.pixelRatio)
    
    this.elements = []
    this.needsRedraw = true
    
    if (options.container) {
      options.container.appendChild(this.canvas)
    } else {
      document.body.appendChild(this.canvas)
    }
    
    if (options.autoResize !== false) {
      window.addEventListener('resize', () => this.resize())
    }
    
    if (options.interactive) {
      this.setupInteraction()
    }
  }

  resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    
    this.canvas.width = this.width * this.pixelRatio
    this.canvas.height = this.height * this.pixelRatio
    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'
    
    this.ctx.scale(this.pixelRatio, this.pixelRatio)
    this.needsRedraw = true
  }

  setupInteraction() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      for (const element of this.elements) {
        if (element.interactive && element.containsPoint?.(x, y)) {
          element.onClick?.(e)
        }
      }
    })
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      for (const element of this.elements) {
        if (element.interactive) {
          const wasHovered = element.hovered
          element.hovered = element.containsPoint?.(x, y) ?? false
          
          if (element.hovered !== wasHovered) {
            this.needsRedraw = true
            if (element.hovered) {
              element.onHover?.(e)
            } else {
              element.onLeave?.(e)
            }
          }
        }
      }
    })
  }

  add(element) {
    this.elements.push(element)
    element.canvas = this
    this.needsRedraw = true
    return element
  }

  remove(element) {
    const index = this.elements.indexOf(element)
    if (index !== -1) {
      this.elements.splice(index, 1)
      element.canvas = null
      this.needsRedraw = true
    }
    return this
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  render() {
    if (!this.needsRedraw) return
    
    this.clear()
    
    this.elements.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
    
    for (const element of this.elements) {
      if (element.visible !== false) {
        this.ctx.save()
        element.render(this.ctx)
        this.ctx.restore()
      }
    }
    
    this.needsRedraw = false
  }

  update(dt) {
    for (const element of this.elements) {
      if (element.update) {
        element.update(dt)
        if (element.needsRedraw) {
          this.needsRedraw = true
          element.needsRedraw = false
        }
      }
    }
    
    this.render()
  }

  setDirty() {
    this.needsRedraw = true
  }

  getElement(id) {
    return this.elements.find(e => e.id === id)
  }

  dispose() {
    this.elements = []
    this.canvas.remove()
  }
}
