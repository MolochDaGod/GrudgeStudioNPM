-- GRUDGE Studio - Fireball Ability
-- Ranged magic projectile with explosion

local Fireball = {
    name = "Fireball",
    type = "projectile",
    element = "fire",
    
    -- Stats
    baseDamage = 35,
    range = 25,
    manaCost = 30,
    cooldown = 3.0,
    
    -- Projectile settings
    projectileSpeed = 15,
    explosionRadius = 3.0,
    
    -- State
    lastCastTime = 0,
    
    -- Animations
    castAnim = "cast_fireball",
    castTime = 0.8
}

-- Check if ability is ready
function Fireball:isReady()
    local currentTime = Game.getTime()
    return (currentTime - self.lastCastTime) >= self.cooldown
end

-- Get remaining cooldown
function Fireball:getCooldownRemaining()
    local elapsed = Game.getTime() - self.lastCastTime
    return math.max(0, self.cooldown - elapsed)
end

-- Calculate damage with intelligence scaling
function Fireball:calculateDamage()
    local intelligence = Player.getStat("intelligence") or 10
    local magicPower = Player.getStat("magicPower") or 0
    
    -- Int scaling: +2% per point above 10
    local intBonus = 1 + ((intelligence - 10) * 0.02)
    
    -- Magic power adds flat damage
    local damage = (self.baseDamage + magicPower) * intBonus
    
    -- Crit check (magic crit chance)
    local critChance = Player.getStat("spellCrit") or 5
    local isCrit = random(0, 100) < critChance
    
    if isCrit then
        damage = damage * 1.75
    end
    
    return round(damage, 0), isCrit
end

-- Cast the ability
function Fireball:cast()
    -- Check cooldown
    if not self:isReady() then
        Core.log("Fireball on cooldown: " .. round(self:getCooldownRemaining(), 1) .. "s")
        return false
    end
    
    -- Check mana
    local currentMana = Player.getMana()
    if currentMana < self.manaCost then
        Core.log("Not enough mana! Need " .. self.manaCost)
        return false
    end
    
    -- Get target
    local target = Combat.getTarget()
    if not target then
        Core.log("No target for Fireball!")
        return false
    end
    
    -- Check range
    if target.distance > self.range then
        Core.log("Target out of range!")
        return false
    end
    
    -- Consume mana
    Player.modifyMana(-self.manaCost)
    
    -- Play cast animation
    Animation.play(self.castAnim, 0.15, false)
    Game.playSound("fireball_cast")
    
    -- Spawn projectile
    local damage, isCrit = self:calculateDamage()
    Combat.spawnProjectile("fireball", self.projectileSpeed, damage)
    
    -- Visual effects
    Game.spawnEffect("fireball_launch", 0, 1.5, 0)
    
    if isCrit then
        Core.log("Critical Fireball!")
    end
    
    -- Set cooldown
    self.lastCastTime = Game.getTime()
    
    -- Emit event for UI
    Core.emit("ability:cast", {
        name = self.name,
        cooldown = self.cooldown
    })
    
    return true
end

-- Called when projectile hits
function Fireball:onHit(target)
    -- Apply burning effect
    Combat.applyEffect(target.id, "burning", 4.0, 5)
    
    -- Explosion AOE
    Combat.aoeAttack(self.explosionRadius, self.baseDamage * 0.5, "fire")
    
    -- Visual effects
    Game.spawnEffect("fireball_explosion", 0, 0, 0)
    Game.playSound("fireball_explode")
end

-- Get ability info for UI
function Fireball:getInfo()
    return {
        name = self.name,
        icon = "fireball_icon",
        cooldown = self.cooldown,
        manaCost = self.manaCost,
        range = self.range,
        description = "Launches a ball of fire that explodes on impact, dealing " .. 
                      self.baseDamage .. " fire damage and burning enemies."
    }
end

-- Initialize
function initAbility()
    Core.log("Ability loaded: " .. Fireball.name)
    return Fireball
end

ability = initAbility()
