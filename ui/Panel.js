export class Panel {
  constructor(options = {}) {
    this.id = options.id ?? null
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.width = options.width ?? 200
    this.height = options.height ?? 150
    
    this.backgroundColor = options.backgroundColor ?? 'rgba(0, 0, 0, 0.7)'
    this.borderColor = options.borderColor ?? '#ffffff'
    this.borderWidth = options.borderWidth ?? 1
    this.borderRadius = options.borderRadius ?? 8
    
    this.padding = options.padding ?? 10
    this.visible = true
    this.interactive = options.interactive ?? false
    this.zIndex = options.zIndex ?? 5
    
    this.title = options.title ?? null
    this.titleFont = options.titleFont ?? 'bold 16px Arial'
    this.titleColor = options.titleColor ?? '#ffffff'
    this.titleHeight = options.titleHeight ?? 30
    
    this.children = []
    this.needsRedraw = false
  }

  add(element) {
    element.x += this.x + this.padding
    element.y += this.y + this.padding + (this.title ? this.titleHeight : 0)
    this.children.push(element)
    this.needsRedraw = true
    return this
  }

  remove(element) {
    const index = this.children.indexOf(element)
    if (index !== -1) {
      this.children.splice(index, 1)
      this.needsRedraw = true
    }
    return this
  }

  setPosition(x, y) {
    const dx = x - this.x
    const dy = y - this.y
    
    this.x = x
    this.y = y
    
    for (const child of this.children) {
      child.x += dx
      child.y += dy
    }
    
    this.needsRedraw = true
    return this
  }

  update(dt) {
    for (const child of this.children) {
      if (child.update) {
        child.update(dt)
        if (child.needsRedraw) {
          this.needsRedraw = true
          child.needsRedraw = false
        }
      }
    }
  }

  render(ctx) {
    ctx.fillStyle = this.backgroundColor
    this.roundRect(ctx, this.x, this.y, this.width, this.height, this.borderRadius)
    ctx.fill()
    
    if (this.borderWidth > 0) {
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      this.roundRect(ctx, this.x, this.y, this.width, this.height, this.borderRadius)
      ctx.stroke()
    }
    
    if (this.title) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(this.x, this.y, this.width, this.titleHeight)
      
      ctx.fillStyle = this.titleColor
      ctx.font = this.titleFont
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.title, this.x + this.width / 2, this.y + this.titleHeight / 2)
    }
    
    for (const child of this.children) {
      if (child.visible !== false) {
        ctx.save()
        child.render(ctx)
        ctx.restore()
      }
    }
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height
  }
}
