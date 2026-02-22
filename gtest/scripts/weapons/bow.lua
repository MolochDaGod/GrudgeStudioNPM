-- GRUDGE Studio - Bow Weapon Script
-- Ranged weapon with charged shots

local Bow = {
    name = "Hunter's Bow",
    type = "ranged",
    baseDamage = 18,
    range = 30,
    attackSpeed = 0.8,
    
    -- Charge system
    isCharging = false,
    chargeStart = 0,
    maxChargeTime = 2.0,
    minChargeTime = 0.3,
    
    -- Arrow types
    currentArrow = "normal",
    arrowTypes = {
        normal = { damage = 1.0, speed = 25, effect = nil },
        fire = { damage = 1.2, speed = 22, effect = "burning" },
        ice = { damage = 0.9, speed = 20, effect = "frozen" },
        poison = { damage = 0.8, speed = 25, effect = "poisoned" }
    },
    
    -- Animations
    animations = {
        idle = "bow_idle",
        draw = "bow_draw",
        hold = "bow_hold",
        release = "bow_release",
        walk = "bow_walk"
    }
}

-- Get charge percentage (0-1)
function Bow:getChargePercent()
    if not self.isCharging then return 0 end
    local elapsed = Game.getTime() - self.chargeStart
    return clamp(elapsed / self.maxChargeTime, 0, 1)
end

-- Calculate damage based on charge
function Bow:calculateDamage()
    local chargePercent = self:getChargePercent()
    local arrowData = self.arrowTypes[self.currentArrow]
    
    -- Charge multiplier (1.0 at min, 2.0 at max)
    local chargeMultiplier = 1.0 + chargePercent
    
    -- Crit check
    local critChance = Player.getStat("critChance") or 5
    local isCrit = random(0, 100) < critChance
    
    local damage = self.baseDamage * arrowData.damage * chargeMultiplier
    if isCrit then
        damage = damage * 2.0
    end
    
    return round(damage, 0), isCrit, arrowData
end

-- Start charging
function Bow:startCharge()
    if self.isCharging then return end
    
    self.isCharging = true
    self.chargeStart = Game.getTime()
    
    Animation.play(self.animations.draw, 0.1, false)
    Game.playSound("bow_draw")
end

-- Release arrow
function Bow:release()
    if not self.isCharging then return false end
    
    local chargePercent = self:getChargePercent()
    
    -- Check minimum charge time
    if chargePercent < (self.minChargeTime / self.maxChargeTime) then
        self.isCharging = false
        Animation.play(self.animations.idle, 0.2, true)
        Core.log("Charge too short!")
        return false
    end
    
    -- Get target
    local target = Combat.getTarget()
    if not target then
        self.isCharging = false
        Animation.play(self.animations.idle, 0.2, true)
        Core.log("No target!")
        return false
    end
    
    -- Check range
    if target.distance > self.range then
        self.isCharging = false
        Animation.play(self.animations.idle, 0.2, true)
        Core.log("Target out of range!")
        return false
    end
    
    -- Calculate damage and arrow data
    local damage, isCrit, arrowData = self:calculateDamage()
    
    -- Play release animation
    Animation.play(self.animations.release, 0.1, false)
    Game.playSound("bow_release")
    
    -- Spawn projectile
    local projectileType = self.currentArrow .. "_arrow"
    Combat.spawnProjectile(projectileType, arrowData.speed, damage)
    
    -- Apply effect if arrow has one
    if arrowData.effect then
        Combat.applyEffect(target.id, arrowData.effect, 3.0, 1.0)
    end
    
    -- Visual effects
    if isCrit then
        Game.spawnEffect("crit_arrow", 0, 0, 0)
        Core.log("Critical shot!")
    end
    
    self.isCharging = false
    return true
end

-- Cancel charge
function Bow:cancel()
    if not self.isCharging then return end
    
    self.isCharging = false
    Animation.play(self.animations.idle, 0.2, true)
end

-- Switch arrow type
function Bow:setArrowType(arrowType)
    if self.arrowTypes[arrowType] then
        self.currentArrow = arrowType
        Core.log("Switched to " .. arrowType .. " arrows")
        return true
    end
    return false
end

-- Rain of Arrows special (AOE)
function Bow:special()
    local manaCost = 40
    local currentMana = Player.getMana()
    
    if currentMana < manaCost then
        Core.log("Not enough mana!")
        return false
    end
    
    Player.modifyMana(-manaCost)
    
    Animation.play("bow_rain", 0.2, false)
    Game.playSound("arrow_rain")
    
    -- Delayed AOE
    Combat.aoeAttack(5.0, self.baseDamage * 2.0, "physical")
    Game.spawnEffect("arrow_rain", 0, 5, 0)
    
    return true
end

-- Update (called each frame when equipped)
function Bow:update(deltaTime)
    if self.isCharging then
        local chargePercent = self:getChargePercent()
        
        -- Switch to hold animation when fully drawn
        if chargePercent >= 0.3 then
            Animation.play(self.animations.hold, 0.1, true)
        end
        
        -- Visual feedback for charge level
        if chargePercent >= 1.0 then
            Game.spawnEffect("charge_ready", 0, 0, 0)
        end
    end
end

-- Initialize
function initWeapon()
    Core.log("Bow equipped: " .. Bow.name)
    Animation.play(Bow.animations.idle, 0.3, true)
    return Bow
end

-- Global weapon reference
weapon = initWeapon()
