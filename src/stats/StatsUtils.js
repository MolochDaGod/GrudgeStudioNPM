export const DIMINISHING_RETURNS_THRESHOLD = 25
export const HARD_CAP_THRESHOLD = 35
export const DECAY_RATE = 0.90
export const POST_CAP_EFFECTIVENESS = 0.0001

export function getEffectiveStatValue(rawValue) {
    if (rawValue <= DIMINISHING_RETURNS_THRESHOLD) {
        return rawValue
    }
    
    let effective = DIMINISHING_RETURNS_THRESHOLD
    
    for (let i = DIMINISHING_RETURNS_THRESHOLD + 1; i <= rawValue; i++) {
        if (i <= HARD_CAP_THRESHOLD) {
            const pointsOver = i - DIMINISHING_RETURNS_THRESHOLD
            const effectiveness = Math.pow(DECAY_RATE, pointsOver)
            effective += effectiveness
        } else {
            effective += POST_CAP_EFFECTIVENESS
        }
    }
    
    return effective
}

export function getStatEffectiveness(rawValue) {
    if (rawValue <= DIMINISHING_RETURNS_THRESHOLD) {
        return 1.0
    }
    
    if (rawValue > HARD_CAP_THRESHOLD) {
        return POST_CAP_EFFECTIVENESS
    }
    
    const pointsOver = rawValue - DIMINISHING_RETURNS_THRESHOLD
    return Math.pow(DECAY_RATE, pointsOver)
}

export function getNextPointEffectiveness(currentValue) {
    return getStatEffectiveness(currentValue + 1)
}

export function getStatBreakdown(rawValue) {
    const effective = getEffectiveStatValue(rawValue)
    const nextPointEff = getNextPointEffectiveness(rawValue)
    
    let category = 'Normal'
    if (rawValue > HARD_CAP_THRESHOLD) {
        category = 'Hard Capped'
    } else if (rawValue > DIMINISHING_RETURNS_THRESHOLD) {
        category = 'Diminishing'
    }
    
    return {
        raw: rawValue,
        effective: Math.round(effective * 100) / 100,
        nextPointEffectiveness: Math.round(nextPointEff * 10000) / 100,
        category,
        wastedPoints: rawValue > HARD_CAP_THRESHOLD ? rawValue - HARD_CAP_THRESHOLD : 0
    }
}

const STAT_WEIGHTS = {
    strength: 1.2,
    dexterity: 1.1,
    constitution: 1.3,
    intelligence: 1.0,
    wisdom: 0.9,
    charisma: 0.6,
    luck: 0.7,
    willpower: 0.8
}

export function calculatePowerScore(stats) {
    let totalPower = 0
    
    for (const [stat, value] of Object.entries(stats)) {
        if (STAT_WEIGHTS[stat] !== undefined) {
            const effectiveValue = getEffectiveStatValue(value)
            const weight = STAT_WEIGHTS[stat]
            totalPower += effectiveValue * weight
        }
    }
    
    const healthBonus = (stats.maxHealth || 100) / 100 * 10
    const attackBonus = (stats.attackPower || 10) / 10 * 5
    const defenseBonus = (stats.defense || 5) / 5 * 3
    
    totalPower += healthBonus + attackBonus + defenseBonus
    
    return Math.round(totalPower)
}

export const POWER_RANKINGS = [
    { name: 'Fodder', minScore: 0, maxScore: 49, color: '#888888' },
    { name: 'Rookie', minScore: 50, maxScore: 74, color: '#AAAAAA' },
    { name: 'Novice', minScore: 75, maxScore: 99, color: '#FFFFFF' },
    { name: 'Apprentice', minScore: 100, maxScore: 124, color: '#00FF00' },
    { name: 'Journeyman', minScore: 125, maxScore: 149, color: '#00FFAA' },
    { name: 'Adept', minScore: 150, maxScore: 174, color: '#00AAFF' },
    { name: 'Expert', minScore: 175, maxScore: 199, color: '#0066FF' },
    { name: 'Master', minScore: 200, maxScore: 249, color: '#AA00FF' },
    { name: 'Grandmaster', minScore: 250, maxScore: 299, color: '#FF00FF' },
    { name: 'Champion', minScore: 300, maxScore: 349, color: '#FF6600' },
    { name: 'Legend', minScore: 350, maxScore: 399, color: '#FFD700' },
    { name: 'Mythic', minScore: 400, maxScore: 499, color: '#FF0000' },
    { name: 'Divine', minScore: 500, maxScore: Infinity, color: '#FFFFFF', glow: true }
]

export function getPowerRanking(powerScore) {
    for (const ranking of POWER_RANKINGS) {
        if (powerScore >= ranking.minScore && powerScore <= ranking.maxScore) {
            return {
                name: ranking.name,
                color: ranking.color,
                glow: ranking.glow || false,
                score: powerScore,
                progress: ranking.maxScore === Infinity 
                    ? 100 
                    : ((powerScore - ranking.minScore) / (ranking.maxScore - ranking.minScore)) * 100
            }
        }
    }
    
    return { name: 'Unknown', color: '#888888', score: powerScore, progress: 0 }
}

export function compareEntities(entity1Stats, entity2Stats) {
    const power1 = calculatePowerScore(entity1Stats)
    const power2 = calculatePowerScore(entity2Stats)
    
    const diff = power1 - power2
    const percentDiff = power2 > 0 ? (diff / power2) * 100 : 100
    
    let advantage = 'Even'
    if (diff > 50) advantage = 'Major Advantage'
    else if (diff > 20) advantage = 'Advantage'
    else if (diff > 5) advantage = 'Slight Advantage'
    else if (diff < -50) advantage = 'Major Disadvantage'
    else if (diff < -20) advantage = 'Disadvantage'
    else if (diff < -5) advantage = 'Slight Disadvantage'
    
    return {
        power1,
        power2,
        difference: diff,
        percentDifference: Math.round(percentDiff),
        advantage
    }
}

export function getStatAllocationAdvice(stats, availablePoints = 1) {
    const advice = []
    
    for (const [stat, value] of Object.entries(stats)) {
        if (STAT_WEIGHTS[stat] === undefined) continue
        
        const currentEff = getStatEffectiveness(value)
        const nextEff = getNextPointEffectiveness(value)
        const weight = STAT_WEIGHTS[stat]
        const valueGain = nextEff * weight
        
        advice.push({
            stat,
            currentValue: value,
            effectiveness: Math.round(nextEff * 100),
            valueGain: Math.round(valueGain * 100) / 100,
            recommendation: nextEff < 0.5 ? 'Not Recommended' : nextEff < 0.8 ? 'Diminishing' : 'Good'
        })
    }
    
    advice.sort((a, b) => b.valueGain - a.valueGain)
    
    return advice
}

export default {
    getEffectiveStatValue,
    getStatEffectiveness,
    getNextPointEffectiveness,
    getStatBreakdown,
    calculatePowerScore,
    getPowerRanking,
    compareEntities,
    getStatAllocationAdvice,
    DIMINISHING_RETURNS_THRESHOLD,
    HARD_CAP_THRESHOLD,
    POWER_RANKINGS
}
