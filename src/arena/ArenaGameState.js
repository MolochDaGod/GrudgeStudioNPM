/*
    GRUDGE Studio - Arena Game State Machine
    Clean state management for the arena game
*/

export const ArenaState = {
    INITIALIZING: 'initializing',
    LOADING: 'loading',
    MENU: 'menu',
    COUNTDOWN: 'countdown',
    FIGHTING: 'fighting',
    ROUND_END: 'round_end',
    MATCH_END: 'match_end',
    PAUSED: 'paused',
    DISPOSED: 'disposed'
}

export const ArenaEvent = {
    LOAD_COMPLETE: 'load_complete',
    START_MATCH: 'start_match',
    COUNTDOWN_DONE: 'countdown_done',
    FIGHTER_DEFEATED: 'fighter_defeated',
    ROUND_TIMEOUT: 'round_timeout',
    NEXT_ROUND: 'next_round',
    MATCH_WON: 'match_won',
    PAUSE: 'pause',
    RESUME: 'resume',
    QUIT: 'quit',
    RESET: 'reset'
}

const StateTransitions = {
    [ArenaState.INITIALIZING]: {
        [ArenaEvent.LOAD_COMPLETE]: ArenaState.MENU
    },
    [ArenaState.LOADING]: {
        [ArenaEvent.LOAD_COMPLETE]: ArenaState.MENU
    },
    [ArenaState.MENU]: {
        [ArenaEvent.START_MATCH]: ArenaState.COUNTDOWN
    },
    [ArenaState.COUNTDOWN]: {
        [ArenaEvent.COUNTDOWN_DONE]: ArenaState.FIGHTING,
        [ArenaEvent.PAUSE]: ArenaState.PAUSED
    },
    [ArenaState.FIGHTING]: {
        [ArenaEvent.FIGHTER_DEFEATED]: ArenaState.ROUND_END,
        [ArenaEvent.ROUND_TIMEOUT]: ArenaState.ROUND_END,
        [ArenaEvent.PAUSE]: ArenaState.PAUSED
    },
    [ArenaState.ROUND_END]: {
        [ArenaEvent.NEXT_ROUND]: ArenaState.COUNTDOWN,
        [ArenaEvent.MATCH_WON]: ArenaState.MATCH_END
    },
    [ArenaState.MATCH_END]: {
        [ArenaEvent.RESET]: ArenaState.MENU,
        [ArenaEvent.QUIT]: ArenaState.MENU
    },
    [ArenaState.PAUSED]: {
        [ArenaEvent.RESUME]: ArenaState.FIGHTING,
        [ArenaEvent.QUIT]: ArenaState.MENU
    }
}

export class ArenaGameStateMachine {
    constructor() {
        this.state = ArenaState.INITIALIZING
        this.previousState = null
        this.listeners = new Map()
        this.stateData = this.createInitialData()
        this.transitionQueue = []
        this.isTransitioning = false
    }
    
    createInitialData() {
        return {
            roundNumber: 1,
            roundsToWin: 2,
            maxRounds: 3,
            roundTime: 90,
            roundTimer: 90,
            countdownTimer: 3,
            
            scores: { player: 0, opponent: 0 },
            
            playerHealth: 100,
            playerMaxHealth: 100,
            opponentHealth: 100,
            opponentMaxHealth: 100,
            
            winner: null,
            matchWinner: null,
            
            loadProgress: 0,
            loadStatus: '',
            
            isPaused: false,
            pauseReason: null
        }
    }
    
    getState() {
        return this.state
    }
    
    getData() {
        return { ...this.stateData }
    }
    
    updateData(updates) {
        Object.assign(this.stateData, updates)
        this.emit('dataChange', this.stateData)
    }
    
    canTransition(event) {
        const transitions = StateTransitions[this.state]
        return transitions && event in transitions
    }
    
    dispatch(event, payload = {}) {
        this.transitionQueue.push({ event, payload })
        
        if (!this.isTransitioning) {
            this.processQueue()
        }
    }
    
    processQueue() {
        if (this.transitionQueue.length === 0) {
            this.isTransitioning = false
            return
        }
        
        this.isTransitioning = true
        const { event, payload } = this.transitionQueue.shift()
        
        const transitions = StateTransitions[this.state]
        if (!transitions || !(event in transitions)) {
            console.warn(`Invalid transition: ${this.state} + ${event}`)
            this.processQueue()
            return
        }
        
        const nextState = transitions[event]
        this.previousState = this.state
        this.state = nextState
        
        this.onEnterState(nextState, payload)
        
        this.emit('stateChange', {
            from: this.previousState,
            to: nextState,
            event,
            data: this.stateData
        })
        
        this.processQueue()
    }
    
    onEnterState(state, payload) {
        switch (state) {
            case ArenaState.MENU:
                this.stateData = this.createInitialData()
                break
                
            case ArenaState.COUNTDOWN:
                this.stateData.countdownTimer = 3
                this.stateData.isPaused = false
                break
                
            case ArenaState.FIGHTING:
                break
                
            case ArenaState.ROUND_END:
                if (payload.winner) {
                    this.stateData.winner = payload.winner
                    if (payload.winner === 'player') {
                        this.stateData.scores.player++
                    } else {
                        this.stateData.scores.opponent++
                    }
                }
                break
                
            case ArenaState.MATCH_END:
                this.stateData.matchWinner = payload.matchWinner || 
                    (this.stateData.scores.player > this.stateData.scores.opponent ? 'player' : 'opponent')
                break
                
            case ArenaState.PAUSED:
                this.stateData.isPaused = true
                this.stateData.pauseReason = payload.reason || 'user'
                break
        }
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event).push(callback)
        
        return () => this.off(event, callback)
    }
    
    off(event, callback) {
        const callbacks = this.listeners.get(event)
        if (callbacks) {
            const index = callbacks.indexOf(callback)
            if (index > -1) callbacks.splice(index, 1)
        }
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event) || []
        callbacks.forEach(cb => {
            try {
                cb(data)
            } catch (e) {
                console.error(`State listener error for ${event}:`, e)
            }
        })
    }
    
    isInState(...states) {
        return states.includes(this.state)
    }
    
    isFighting() {
        return this.state === ArenaState.FIGHTING
    }
    
    isActive() {
        return this.isInState(ArenaState.COUNTDOWN, ArenaState.FIGHTING, ArenaState.ROUND_END)
    }
    
    reset() {
        this.state = ArenaState.INITIALIZING
        this.previousState = null
        this.stateData = this.createInitialData()
        this.transitionQueue = []
        this.isTransitioning = false
    }
    
    serialize() {
        return {
            state: this.state,
            previousState: this.previousState,
            data: { ...this.stateData }
        }
    }
    
    deserialize(saved) {
        this.state = saved.state
        this.previousState = saved.previousState
        this.stateData = { ...saved.data }
    }
}

export const arenaGameState = new ArenaGameStateMachine()
export default ArenaGameStateMachine
