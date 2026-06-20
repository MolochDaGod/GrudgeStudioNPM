export class Text {
  constructor(options = {}) {
    this.id = options.id ?? null
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.text = options.text ?? ''
    
    this.color = options.color ?? '#ffffff'
    this.font = options.font ?? '16px Arial'
    this.align = options.align ?? 'left'
    this.baseline = options.baseline ?? 'top'
    
    this.shadowColor = options.shadowColor ?? null
    this.shadowBlur = options.shadowBlur ?? 4
    this.shadowOffsetX = options.shadowOffsetX ?? 2
    this.shadowOffsetY = options.shadowOffsetY ?? 2
    
    this.outlineColor = options.outlineColor ?? null
    this.outlineWidth = options.outlineWidth ?? 2
    
    this.maxWidth = options.maxWidth ?? null
    this.lineHeight = options.lineHeight ?? 1.2
    
    this.visible = true
    this.zIndex = options.zIndex ?? 0
    this.needsRedraw = false
  }

  setText(text) {
    if (this.text !== text) {
      this.text = text
      this.needsRedraw = true
    }
    return this
  }

  setColor(color) {
    this.color = color
    this.needsRedraw = true
    return this
  }

  setPosition(x, y) {
    this.x = x
    this.y = y
    this.needsRedraw = true
    return this
  }

  render(ctx) {
    ctx.font = this.font
    ctx.textAlign = this.align
    ctx.textBaseline = this.baseline
    
    const lines = this.maxWidth ? this.wrapText(ctx, this.text, this.maxWidth) : [this.text]
    const fontSize = parseInt(this.font) || 16
    const lineSpacing = fontSize * this.lineHeight
    
    if (this.shadowColor) {
      ctx.shadowColor = this.shadowColor
      ctx.shadowBlur = this.shadowBlur
      ctx.shadowOffsetX = this.shadowOffsetX
      ctx.shadowOffsetY = this.shadowOffsetY
    }
    
    for (let i = 0; i < lines.length; i++) {
      const y = this.y + i * lineSpacing
      
      if (this.outlineColor) {
        ctx.strokeStyle = this.outlineColor
        ctx.lineWidth = this.outlineWidth
        ctx.strokeText(lines[i], this.x, y)
      }
      
      ctx.fillStyle = this.color
      ctx.fillText(lines[i], this.x, y)
    }
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]
    
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i]
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    
    lines.push(currentLine)
    return lines
  }

  containsPoint() {
    return false
  }
}
