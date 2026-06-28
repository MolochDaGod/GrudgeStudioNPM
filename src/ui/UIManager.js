import { GameState } from '../core/GameState.js'
import { appUrl } from '../lib/appUrl.js'
import { HUB_LINKS } from '../../grudge-studio/hub/links.js'

export class UIManager {
  constructor() {
    this.screens = {
      loading: document.getElementById('loading-screen'),
      menu: document.getElementById('menu-screen'),
      hud: document.getElementById('hud'),
      pause: document.getElementById('pause-menu')
    }
    
    this.elements = {
      loadingProgress: document.querySelector('.loading-progress'),
      loadingStatus: document.getElementById('loading-status'),
      p1Health: document.getElementById('p1-health'),
      p2Health: document.getElementById('p2-health'),
      roundNumber: document.getElementById('round-number'),
      roundTimer: document.getElementById('round-timer'),
      p1Score: document.getElementById('p1-score'),
      p2Score: document.getElementById('p2-score'),
      announcement: document.getElementById('round-announcement'),
      announcementText: document.getElementById('announcement-text')
    }
    
    this.callbacks = {}
  }
  
  init(callbacks) {
    this.callbacks = callbacks
    this.bindEvents()
  }
  
  bindEvents() {
    document.getElementById('btn-arena')?.addEventListener('click', () => {
      if (this.callbacks.onEnterArena) this.callbacks.onEnterArena()
    })

    document.getElementById('btn-practice')?.addEventListener('click', () => {
      if (this.callbacks.onStartMatch) this.callbacks.onStartMatch()
    })

    document.getElementById('btn-world-builder')?.addEventListener('click', () => {
      if (this.callbacks.onWorldBuilder) this.callbacks.onWorldBuilder()
    })
    
    document.getElementById('btn-playground')?.addEventListener('click', () => {
      window.location.href = appUrl('playground.html')
    })

    document.getElementById('btn-editor')?.addEventListener('click', () => {
      window.location.href = appUrl('editor.html')
    })

    document.getElementById('btn-voxel')?.addEventListener('click', () => {
      window.location.href = appUrl('playground.html')
    })

    document.getElementById('btn-ai-map')?.addEventListener('click', () => {
      if (this.callbacks.onWorldBuilder) this.callbacks.onWorldBuilder()
    })

    document.getElementById('btn-ground-rts')?.addEventListener('click', () => {
      window.open(HUB_LINKS.groundRts, '_blank', 'noopener,noreferrer')
    })
    
    document.getElementById('btn-builder')?.addEventListener('click', () => {
      window.location.href = appUrl('character-builder.html')
    })

    document.getElementById('btn-skills')?.addEventListener('click', () => {
      window.location.href = appUrl('skill-tree.html')
    })
    
    document.getElementById('btn-viewer')?.addEventListener('click', () => {
      window.location.href = appUrl('viewer.html')
    })
    
    document.getElementById('btn-assets')?.addEventListener('click', () => {
      window.open(HUB_LINKS.assetCdn, '_blank', 'noopener,noreferrer')
    })
    
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      if (this.callbacks.onResume) this.callbacks.onResume()
    })
    
    document.getElementById('btn-quit')?.addEventListener('click', () => {
      if (this.callbacks.onQuit) this.callbacks.onQuit()
    })
    
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.callbacks.onPause) this.callbacks.onPause()
      }
    })
  }
  
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.remove('active')
    })
    
    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active')
    }
  }

  hideAllScreens() {
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.remove('active')
    })
  }
  
  updateLoadingProgress(percent, status) {
    if (this.elements.loadingProgress) {
      this.elements.loadingProgress.style.width = `${percent}%`
    }
    if (this.elements.loadingStatus) {
      this.elements.loadingStatus.textContent = status
    }
  }
  
  onStateChange(state) {
    switch (state) {
      case GameState.LOADING:
        this.showScreen('loading')
        break
      case GameState.MENU:
        this.showScreen('menu')
        break
      case GameState.PLAYING:
        this.showScreen('hud')
        break
      case GameState.PAUSED:
        this.showScreen('pause')
        break
      case GameState.MATCH_END:
        this.showScreen('menu')
        break
    }
  }
  
  updateHealth(playerHealth, opponentHealth, timer) {
    if (this.elements.p1Health) {
      this.elements.p1Health.style.width = `${playerHealth * 100}%`
    }
    if (this.elements.p2Health) {
      this.elements.p2Health.style.width = `${opponentHealth * 100}%`
    }
    if (this.elements.roundTimer) {
      this.elements.roundTimer.textContent = timer
    }
  }
  
  updateRound(roundNumber, scores) {
    if (this.elements.roundNumber) {
      this.elements.roundNumber.textContent = `Round ${roundNumber}`
    }
    if (this.elements.p1Score) {
      this.elements.p1Score.textContent = scores.player
    }
    if (this.elements.p2Score) {
      this.elements.p2Score.textContent = scores.opponent
    }
  }
  
  showAnnouncement(text, duration = 2000) {
    if (this.elements.announcement && this.elements.announcementText) {
      this.elements.announcementText.textContent = text
      this.elements.announcement.classList.remove('hidden')
      
      setTimeout(() => {
        this.elements.announcement.classList.add('hidden')
      }, duration)
    }
  }
  
  showRoundStart(roundNumber) {
    this.updateRound(roundNumber, { player: 0, opponent: 0 })
    this.showAnnouncement(`ROUND ${roundNumber}`, 1500)
    
    setTimeout(() => {
      this.showAnnouncement('FIGHT!', 1000)
    }, 1500)
  }
  
  showRoundEnd(playerWon) {
    const text = playerWon ? 'YOU WIN!' : 'YOU LOSE!'
    this.showAnnouncement(text, 2000)
  }
  
  showMatchEnd(playerWon, scores) {
    const text = playerWon ? 'VICTORY!' : 'DEFEAT!'
    this.showAnnouncement(text, 3000)
  }
}
