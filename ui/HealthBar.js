export class HealthBar {
  constructor(options = {}) {
    this.id = options.id ?? null
    this.x = options.x ?? 20
    this.y = options.y ?? 20
    this.width = options.width ?? 200
    this.height = options.height ?? 20
    this.maxValue = options.maxValue ?? 100
    this.value = options.value ?? 100
    
    this.backgroundColor = options.backgroundColor ?? '#333333'
    this.fillColor = options.fillColor ?? '#ff4444'
    this.lowColor = options.lowColor ?? '#ff0000'
    this.borderColor = options.borderColor ?? '#ffffff'
    this.borderWidth = options.borderWidth ?? 2
    this.borderRadius = options.borderRadius ?? 4
    
    this.showText = options.showText ?? true
    this.textColor = options.textColor ?? '#ffffff'
    this.font = options.font ?? '14px Arial'
    this.textAlign = options.textAlign ?? 'center'
    
    this.lowThreshold = options.lowThreshold ?? 0.25
    this.animated = options.animated ?? true
    this.animationSpeed = options.animationSpeed ?? 5
    
    this.displayValue = this.value
    this.visible = true
    this.zIndex = options.zIndex ?? 0
    this.needsRedraw = false
  }

  setValue(value) {
    const oldValue = this.value
    this.value = Math.max(0, Math.min(this.maxValue, value))
    
    if (oldValue !== this.value) {
      this.needsRedraw = true
    }
    
    return this
  }

  setMaxValue(maxValue) {
    this.maxValue = maxValue
    this.needsRedraw = true
    return this
  }

  update(dt) {
    if (this.animated && this.displayValue !== this.value) {
      const diff = this.value - this.displayValue
      const step = diff * this.animationSpeed * dt
      
      if (Math.abs(diff) < 0.5) {
        this.displayValue = this.value
      } else {
        this.displayValue += step
      }
      
      this.needsRedraw = true
    } else if (!this.animated) {
      this.displayValue = this.value
    }
  }

  render(ctx) {
    const percentage = this.displayValue / this.maxValue
    const fillWidth = this.width * percentage
    
    ctx.fillStyle = this.backgroundColor
    this.roundRect(ctx, this.x, this.y, this.width, this.height, this.borderRadius)
    ctx.fill()
    
    if (percentage > 0) {
      ctx.fillStyle = percentage <= this.lowThreshold ? this.lowColor : this.fillColor
      this.roundRect(ctx, this.x, this.y, fillWidth, this.height, this.borderRadius)
      ctx.fill()
    }
    
    if (this.borderWidth > 0) {
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      this.roundRect(ctx, this.x, this.y, this.width, this.height, this.borderRadius)
      ctx.stroke()
    }
    
    if (this.showText) {
      ctx.fillStyle = this.textColor
      ctx.font = this.font
      ctx.textAlign = this.textAlign
      ctx.textBaseline = 'middle'
      
      const text = `${Math.round(this.displayValue)}/${this.maxValue}`
      const textX = this.textAlign === 'center' 
        ? this.x + this.width / 2 
        : this.x + 5
      
      ctx.fillText(text, textX, this.y + this.height / 2)
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
