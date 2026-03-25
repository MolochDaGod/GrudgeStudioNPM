-- GRUDGE Studio Event Helpers
-- Simplified event binding and emission

local eventQueue = {}

-- Queue an event to be processed
function queueEvent(name, data)
    table.insert(eventQueue, { name = name, data = data })
end

-- Process all queued events
function processEvents()
    for i, event in ipairs(eventQueue) do
        Core.emit(event.name, event.data)
    end
    eventQueue = {}
end

-- Combat event helpers
function onDealDamage(callback)
    Core.on("combat:damage", callback)
end

function onTakeDamage(callback)
    Core.on("player:damaged", callback)
end

function onKill(callback)
    Core.on("combat:kill", callback)
end

function onDeath(callback)
    Core.on("player:death", callback)
end

-- Animation event helpers
function onAnimationEnd(callback)
    Core.on("animation:ended", callback)
end

function onAnimationEvent(callback)
    Core.on("animation:event", callback)
end

-- Ability event helpers
function onAbilityStart(callback)
    Core.on("ability:start", callback)
end

function onAbilityEnd(callback)
    Core.on("ability:end", callback)
end

function onCooldownReady(callback)
    Core.on("ability:ready", callback)
end

Core.log("Event helpers loaded")
