export class Minimap {
  constructor(options = {}) {
    this.id = options.id ?? null
    this.x = options.x ?? 20
    this.y = options.y ?? 20
    this.size = options.size ?? 150
    this.worldSize = options.worldSize ?? 100
    
    this.backgroundColor = options.backgroundColor ?? 'rgba(0, 0, 0, 0.6)'
    this.borderColor = options.borderColor ?? '#ffffff'
    this.borderWidth = options.borderWidth ?? 2
    this.circular = options.circular ?? true
    
    this.playerColor = options.playerColor ?? '#4488ff'
    this.playerSize = options.playerSize ?? 6
    this.enemyColor = options.enemyColor ?? '#ff4444'
    this.allyColor = options.allyColor ?? '#44ff44'
    this.objectColor = options.objectColor ?? '#ffff44'
    
    this.markers = []
    this.playerPosition = { x: 0, z: 0 }
    this.playerRotation = 0
    this.showPlayerFacing = options.showPlayerFacing ?? true
    
    this.visible = true
    this.zIndex = options.zIndex ?? 50
    this.needsRedraw = false
  }

  setPlayerPosition(x, z, rotation = 0) {
    this.playerPosition = { x, z }
    this.playerRotation = rotation
    this.needsRedraw = true
    return this
  }

  addMarker(id, type, worldX, worldZ) {
    this.markers.push({ id, type, x: worldX, z: worldZ })
    this.needsRedraw = true
    return this
  }

  updateMarker(id, worldX, worldZ) {
    const marker = this.markers.find(m => m.id === id)
    if (marker) {
      marker.x = worldX
      marker.z = worldZ
      this.needsRedraw = true
    }
    return this
  }

  removeMarker(id) {
    const index = this.markers.findIndex(m => m.id === id)
    if (index !== -1) {
      this.markers.splice(index, 1)
      this.needsRedraw = true
    }
    return this
  }

  clearMarkers() {
    this.markers = []
    this.needsRedraw = true
    return this
  }

  worldToMinimap(worldX, worldZ) {
    const centerX = this.x + this.size / 2
    const centerY = this.y + this.size / 2
    
    const relX = worldX - this.playerPosition.x
    const relZ = worldZ - this.playerPosition.z
    
    const scale = this.size / this.worldSize
    
    const mapX = centerX + relX * scale
    const mapY = centerY + relZ * scale
    
    return { x: mapX, y: mapY }
  }

  isInBounds(x, y) {
    const centerX = this.x + this.size / 2
    const centerY = this.y + this.size / 2
    
    if (this.circular) {
      const dx = x - centerX
      const dy = y - centerY
      return Math.sqrt(dx * dx + dy * dy) <= this.size / 2
    } else {
      return x >= this.x && x <= this.x + this.size &&
             y >= this.y && y <= this.y + this.size
    }
  }

  render(ctx) {
    const centerX = this.x + this.size / 2
    const centerY = this.y + this.size / 2
    
    ctx.save()
    
    if (this.circular) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, this.size / 2, 0, Math.PI * 2)
      ctx.clip()
    }
    
    ctx.fillStyle = this.backgroundColor
    if (this.circular) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, this.size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(this.x, this.y, this.size, this.size)
    }
    
    for (const marker of this.markers) {
      const pos = this.worldToMinimap(marker.x, marker.z)
      
      if (!this.isInBounds(pos.x, pos.y)) continue
      
      let color = this.objectColor
      if (marker.type === 'enemy') color = this.enemyColor
      else if (marker.type === 'ally') color = this.allyColor
      
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.fillStyle = this.playerColor
    ctx.beginPath()
    ctx.arc(centerX, centerY, this.playerSize, 0, Math.PI * 2)
    ctx.fill()
    
    if (this.showPlayerFacing) {
      ctx.strokeStyle = this.playerColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + Math.sin(this.playerRotation) * this.playerSize * 2,
        centerY - Math.cos(this.playerRotation) * this.playerSize * 2
      )
      ctx.stroke()
    }
    
    ctx.restore()
    
    if (this.borderWidth > 0) {
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      
      if (this.circular) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, this.size / 2, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        ctx.strokeRect(this.x, this.y, this.size, this.size)
      }
    }
  }

  containsPoint(x, y) {
    if (this.circular) {
      const centerX = this.x + this.size / 2
      const centerY = this.y + this.size / 2
      const dx = x - centerX
      const dy = y - centerY
      return Math.sqrt(dx * dx + dy * dy) <= this.size / 2
    }
    
    return x >= this.x && x <= this.x + this.size &&
           y >= this.y && y <= this.y + this.size
  }
}
