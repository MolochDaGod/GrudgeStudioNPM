export class Button {
  constructor(options = {}) {
    this.id = options.id ?? null
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.width = options.width ?? 120
    this.height = options.height ?? 40
    this.text = options.text ?? 'Button'
    
    this.backgroundColor = options.backgroundColor ?? '#4488ff'
    this.hoverColor = options.hoverColor ?? '#5599ff'
    this.pressedColor = options.pressedColor ?? '#3377dd'
    this.disabledColor = options.disabledColor ?? '#666666'
    
    this.textColor = options.textColor ?? '#ffffff'
    this.font = options.font ?? 'bold 16px Arial'
    
    this.borderColor = options.borderColor ?? '#ffffff'
    this.borderWidth = options.borderWidth ?? 2
    this.borderRadius = options.borderRadius ?? 8
    
    this.visible = true
    this.interactive = true
    this.disabled = options.disabled ?? false
    this.hovered = false
    this.pressed = false
    
    this.zIndex = options.zIndex ?? 10
    this.needsRedraw = false
    
    this.onClickCallback = options.onClick ?? null
    this.onHoverCallback = options.onHover ?? null
    this.onLeaveCallback = options.onLeave ?? null
  }

  setText(text) {
    this.text = text
    this.needsRedraw = true
    return this
  }

  setDisabled(disabled) {
    this.disabled = disabled
    this.needsRedraw = true
    return this
  }

  onClick(event) {
    if (!this.disabled && this.onClickCallback) {
      this.onClickCallback(event, this)
    }
  }

  onHover(event) {
    if (!this.disabled && this.onHoverCallback) {
      this.onHoverCallback(event, this)
    }
  }

  onLeave(event) {
    if (this.onLeaveCallback) {
      this.onLeaveCallback(event, this)
    }
  }

  render(ctx) {
    let bgColor = this.backgroundColor
    
    if (this.disabled) {
      bgColor = this.disabledColor
    } else if (this.pressed) {
      bgColor = this.pressedColor
    } else if (this.hovered) {
      bgColor = this.hoverColor
    }
    
    ctx.fillStyle = bgColor
    this.roundRect(ctx, this.x, this.y, this.width, this.height, this.borderRadius)
    ctx.fill()
    
    if (this.borderWidth > 0) {
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      this.roundRect(ctx, this.x, this.y, this.width, this.height, this.borderRadius)
      ctx.stroke()
    }
    
    ctx.fillStyle = this.disabled ? '#aaaaaa' : this.textColor
    ctx.font = this.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2)
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
