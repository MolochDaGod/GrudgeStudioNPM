-- GRUDGE Studio - Sword Weapon Script
-- Basic melee weapon with combo system

local Sword = {
    name = "Iron Sword",
    type = "melee",
    baseDamage = 25,
    range = 2.5,
    attackSpeed = 1.2,
    
    -- Combo tracking
    comboCount = 0,
    maxCombo = 3,
    comboWindow = 1.5,
    lastAttackTime = 0,
    
    -- Animations
    animations = {
        idle = "sword_idle",
        attack1 = "sword_slash_1",
        attack2 = "sword_slash_2",
        attack3 = "sword_slash_3",
        block = "sword_block",
        special = "sword_spin"
    }
}

-- Calculate damage with combo multiplier
function Sword:calculateDamage()
    local multiplier = 1 + (self.comboCount * 0.15)
    local critChance = Player.getStat("critChance") or 5
    local isCrit = random(0, 100) < critChance
    
    local damage = self.baseDamage * multiplier
    if isCrit then
        damage = damage * 1.5
        Core.log("Critical hit!")
    end
    
    return round(damage, 0), isCrit
end

-- Primary attack
function Sword:attack()
    local currentTime = Game.getTime()
    
    -- Check combo window
    if currentTime - self.lastAttackTime > self.comboWindow then
        self.comboCount = 0
    end
    
    -- Get target
    local target = Combat.getTarget()
    if not target then
        Core.log("No target!")
        return false
    end
    
    -- Check range
    if target.distance > self.range then
        Core.log("Target out of range!")
        return false
    end
    
    -- Increment combo
    self.comboCount = self.comboCount + 1
    if self.comboCount > self.maxCombo then
        self.comboCount = 1
    end
    
    -- Play attack animation
    local animName = self.animations["attack" .. self.comboCount]
    Animation.play(animName, 0.1, false)
    
    -- Calculate and deal damage
    local damage, isCrit = self:calculateDamage()
    Combat.dealDamage(target.id, damage, "physical")
    
    -- Visual feedback
    if isCrit then
        Game.spawnEffect("crit_slash", target.x or 0, target.y or 0, target.z or 0)
    else
        Game.spawnEffect("slash", target.x or 0, target.y or 0, target.z or 0)
    end
    
    self.lastAttackTime = currentTime
    
    return true
end

-- Block ability
function Sword:block()
    Animation.play(self.animations.block, 0.15, true)
    Combat.applyEffect("self", "blocking", 2.0, 0.5)
    Core.log("Blocking!")
end

-- Special attack (spin)
function Sword:special()
    local manaCost = 25
    local currentMana = Player.getMana()
    
    if currentMana < manaCost then
        Core.log("Not enough mana!")
        return false
    end
    
    Player.modifyMana(-manaCost)
    Animation.play(self.animations.special, 0.2, false)
    
    -- AOE damage
    Combat.aoeAttack(3.0, self.baseDamage * 1.5, "physical")
    Game.spawnEffect("spin_slash", 0, 0, 0)
    Game.playSound("sword_spin")
    
    return true
end

-- Update (called each frame when equipped)
function Sword:update(deltaTime)
    -- Auto-reset combo if window expired
    if Game.getTime() - self.lastAttackTime > self.comboWindow then
        if self.comboCount > 0 then
            self.comboCount = 0
        end
    end
end

-- Initialize
function initWeapon()
    Core.log("Sword equipped: " .. Sword.name)
    Animation.play(Sword.animations.idle, 0.3, true)
    return Sword
end

-- Global weapon reference
weapon = initWeapon()
