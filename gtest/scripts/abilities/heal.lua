-- GRUDGE Studio - Heal Ability
-- Self-healing spell with HoT component

local Heal = {
    name = "Healing Light",
    type = "support",
    element = "holy",
    
    -- Stats
    baseHeal = 50,
    hotAmount = 10,
    hotDuration = 6.0,
    hotTicks = 6,
    
    manaCost = 35,
    cooldown = 8.0,
    
    -- State
    lastCastTime = 0,
    
    -- Animations
    castAnim = "cast_heal",
    castTime = 1.2
}

-- Check if ability is ready
function Heal:isReady()
    local currentTime = Game.getTime()
    return (currentTime - self.lastCastTime) >= self.cooldown
end

-- Get remaining cooldown
function Heal:getCooldownRemaining()
    local elapsed = Game.getTime() - self.lastCastTime
    return math.max(0, self.cooldown - elapsed)
end

-- Calculate heal amount with wisdom scaling
function Heal:calculateHeal()
    local wisdom = Player.getStat("wisdom") or 10
    local healPower = Player.getStat("healPower") or 0
    
    -- Wisdom scaling: +3% per point above 10
    local wisBonus = 1 + ((wisdom - 10) * 0.03)
    
    -- Calculate instant heal
    local instantHeal = (self.baseHeal + healPower) * wisBonus
    
    -- Calculate HoT amount per tick
    local hotPerTick = (self.hotAmount + (healPower * 0.3)) * wisBonus / self.hotTicks
    
    -- Crit check (heal crit)
    local critChance = Player.getStat("healCrit") or 10
    local isCrit = random(0, 100) < critChance
    
    if isCrit then
        instantHeal = instantHeal * 1.5
        hotPerTick = hotPerTick * 1.5
    end
    
    return round(instantHeal, 0), round(hotPerTick, 0), isCrit
end

-- Cast the ability
function Heal:cast()
    -- Check cooldown
    if not self:isReady() then
        Core.log("Heal on cooldown: " .. round(self:getCooldownRemaining(), 1) .. "s")
        return false
    end
    
    -- Check mana
    local currentMana = Player.getMana()
    if currentMana < self.manaCost then
        Core.log("Not enough mana! Need " .. self.manaCost)
        return false
    end
    
    -- Check if healing is needed
    local currentHealth = Player.getHealth()
    local maxHealth = Player.getStat("maxHealth") or 100
    
    if currentHealth >= maxHealth then
        Core.log("Already at full health!")
        return false
    end
    
    -- Consume mana
    Player.modifyMana(-self.manaCost)
    
    -- Play cast animation
    Animation.play(self.castAnim, 0.2, false)
    Game.playSound("heal_cast")
    
    -- Calculate healing
    local instantHeal, hotPerTick, isCrit = self:calculateHeal()
    
    -- Apply instant heal
    Player.modifyHealth(instantHeal)
    
    -- Apply HoT effect
    Combat.applyEffect("self", "regenerating", self.hotDuration, hotPerTick)
    
    -- Visual effects
    Game.spawnEffect("heal_burst", 0, 0, 0)
    
    if isCrit then
        Core.log("Critical Heal! +" .. instantHeal .. " HP")
        Game.spawnEffect("heal_crit", 0, 1, 0)
    else
        Core.log("Healed for " .. instantHeal .. " HP")
    end
    
    -- Set cooldown
    self.lastCastTime = Game.getTime()
    
    -- Emit event for UI
    Core.emit("ability:cast", {
        name = self.name,
        cooldown = self.cooldown,
        heal = instantHeal
    })
    
    return true
end

-- Get ability info for UI
function Heal:getInfo()
    return {
        name = self.name,
        icon = "heal_icon",
        cooldown = self.cooldown,
        manaCost = self.manaCost,
        range = 0,
        description = "Heal yourself for " .. self.baseHeal .. " HP instantly, " ..
                      "then " .. self.hotAmount .. " HP over " .. self.hotDuration .. " seconds."
    }
end

-- Initialize
function initAbility()
    Core.log("Ability loaded: " .. Heal.name)
    return Heal
end

ability = initAbility()
