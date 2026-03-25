-- GRUDGE Studio Core Utilities
-- Common functions for all scripts

-- Clamp value between min and max
function clamp(value, min, max)
    return Math3D.clamp(value, min, max)
end

-- Linear interpolation
function lerp(a, b, t)
    return Math3D.lerp(a, b, t)
end

-- Random number between min and max
function random(min, max)
    return Math3D.random(min, max)
end

-- Check if value is within range
function inRange(value, min, max)
    return value >= min and value <= max
end

-- Calculate percentage
function percent(current, max)
    if max <= 0 then return 0 end
    return (current / max) * 100
end

-- Round to decimal places
function round(value, decimals)
    local mult = 10 ^ (decimals or 0)
    return math.floor(value * mult + 0.5) / mult
end

-- Create cooldown timer
function createCooldown(duration)
    return {
        duration = duration,
        lastUsed = 0,
        isReady = function(self)
            return (Game.getTime() - self.lastUsed) >= self.duration
        end,
        use = function(self)
            self.lastUsed = Game.getTime()
        end,
        remaining = function(self)
            local elapsed = Game.getTime() - self.lastUsed
            return math.max(0, self.duration - elapsed)
        end
    }
end

-- Simple state machine
function createStateMachine(initialState)
    return {
        current = initialState,
        previous = nil,
        setState = function(self, newState)
            self.previous = self.current
            self.current = newState
        end,
        isState = function(self, state)
            return self.current == state
        end
    }
end

Core.log("Core utilities loaded")
