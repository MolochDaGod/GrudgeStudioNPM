export const GameState = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  ROUND_END: 'round_end',
  MATCH_END: 'match_end'
}

export const GameConfig = {
  arena: {
    width: 40,
    depth: 30,
    playerStartDistance: 15
  },
  fighter: {
    moveSpeed: 8,
    runSpeed: 14,
    jumpForce: 12,
    gravity: 30,
    maxHealth: 100,
    attacks: {
      light: { damage: 8, range: 2, cooldown: 0.3, duration: 0.2 },
      heavy: { damage: 18, range: 2.5, cooldown: 0.8, duration: 0.4 },
      special: { damage: 30, range: 3, cooldown: 2.0, duration: 0.6 }
    }
  },
  match: {
    roundTime: 90,
    roundsToWin: 2,
    maxRounds: 3
  }
}
