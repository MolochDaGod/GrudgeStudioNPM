/**
 * GRUDGE 6 Character Viewer — parity with character.grudge-studio.com/viewer
 * Loads Bip001 champions from CDN, plays baked Bip001 clips (no runtime Mixamo retarget).
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  setAssetBase,
  GRUDGE_RACE_IDS,
  RACE_ASSETS,
  ANIM_PACK_CLIPS,
  loadCharacterModel,
  loadBakedClip,
  detectRigType,
  BIP001_ORDERED,
  DEFAULT_BONE_MAP,
} from '../../grudge-studio/kit/index.js'

const ASSET_HOST = import.meta.env.DEV ? '' : 'https://assets.grudge-studio.com'
if (ASSET_HOST) setAssetBase(ASSET_HOST)

class Grudge6Viewer {
  constructor() {
    this.container = document.getElementById('viewer')
    this.raceBar = document.getElementById('race-bar')
    this.statusEl = document.getElementById('status-text')
    this.infoEl = document.getElementById('info-panel')
    this.animSelect = document.getElementById('animation-select')
    this.skeletonToggle = document.getElementById('toggle-skeleton')
    this.gridToggle = document.getElementById('toggle-grid')

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0b1020)
    this.clock = new THREE.Clock()

    const aspect = this.container.clientWidth / this.container.clientHeight
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 200)
    this.camera.position.set(0, 1.6, 3.2)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 1, 0)
    this.controls.enableDamping = true

    const hemi = new THREE.HemisphereLight(0xddeeff, 0x223344, 0.55)
    const dir = new THREE.DirectionalLight(0xffffff, 1.1)
    dir.position.set(4, 8, 3)
    dir.castShadow = true
    this.scene.add(hemi, dir)

    this.grid = new THREE.GridHelper(12, 24, 0x334466, 0x1a2233)
    this.scene.add(this.grid)

    this.ground = new THREE.Mesh(
      new THREE.CircleGeometry(6, 48),
      new THREE.MeshStandardMaterial({ color: 0x141a2b, roughness: 0.95 }),
    )
    this.ground.rotation.x = -Math.PI / 2
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    this.currentRace = 'barbarians'
    this.character = null
    this.mixer = null
    this.action = null
    this.skeletonHelper = null
    this.clips = []
    this.loading = false

    this.buildRaceBar()
    this.wireControls()
    this.loadRace(this.currentRace)
    window.addEventListener('resize', () => this.onResize())
    this.animate()
  }

  setStatus(msg) {
    if (this.statusEl) this.statusEl.textContent = msg
  }

  buildRaceBar() {
    if (!this.raceBar) return
    this.raceBar.innerHTML = ''
    for (const id of GRUDGE_RACE_IDS) {
      const race = RACE_ASSETS[id]
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'race-chip' + (id === this.currentRace ? ' active' : '')
      btn.dataset.race = id
      btn.innerHTML = `<span class="race-abbr">${race.abbr}</span><span class="race-name">${race.name}</span>`
      btn.style.setProperty('--race-color', race.color)
      btn.addEventListener('click', () => this.loadRace(id))
      this.raceBar.appendChild(btn)
    }
  }

  wireControls() {
    this.skeletonToggle?.addEventListener('change', (e) => {
      if (this.skeletonHelper) this.skeletonHelper.visible = e.target.checked
    })
    this.gridToggle?.addEventListener('change', (e) => {
      this.grid.visible = e.target.checked
    })
    this.animSelect?.addEventListener('change', () => this.playSelectedAnim())
  }

  clearCharacter() {
    if (this.action) this.action.stop()
    this.action = null
    this.mixer = null
    if (this.skeletonHelper) {
      this.scene.remove(this.skeletonHelper)
      this.skeletonHelper = null
    }
    if (this.character) {
      this.scene.remove(this.character)
      this.character.traverse((c) => {
        if (c.geometry) c.geometry.dispose()
        if (c.material) {
          const mats = Array.isArray(c.material) ? c.material : [c.material]
          mats.forEach((m) => m.dispose?.())
        }
      })
      this.character = null
    }
  }

  async loadRace(raceId) {
    if (this.loading) return
    this.loading = true
    this.currentRace = raceId
    this.buildRaceBar()
    const race = RACE_ASSETS[raceId]
    this.setStatus(`Loading ${race.name}…`)

    try {
      this.clearCharacter()
      const { group, skeleton, mixer, meshNames } = await loadCharacterModel(race.modelUrl)
      this.character = group
      this.mixer = mixer
      this.scene.add(group)

      const boneNames = skeleton?.bones.map((b) => b.name) ?? []
      const rig = detectRigType(boneNames)
      if (skeleton) {
        this.skeletonHelper = new THREE.SkeletonHelper(group)
        this.skeletonHelper.visible = this.skeletonToggle?.checked ?? false
        this.scene.add(this.skeletonHelper)
      }

      const pack = ANIM_PACK_CLIPS.unarmed
      const clipKeys = ['idle', 'walk', 'run', 'attack']
      this.clips = []
      for (const key of clipKeys) {
        try {
          const clip = await loadBakedClip(pack[key])
          clip.name = key
          this.clips.push(clip)
        } catch (e) {
          console.warn('[grudge6-viewer] clip failed', pack[key], e)
        }
      }

      if (this.animSelect) {
        this.animSelect.innerHTML = ''
        for (const clip of this.clips) {
          const opt = document.createElement('option')
          opt.value = clip.name
          opt.textContent = clip.name
          this.animSelect.appendChild(opt)
        }
      }
      if (this.clips.length) this.playClip(this.clips[0])

      const mapped = BIP001_ORDERED.filter((b) => boneNames.some((n) => n.replace(/\s/g, '_') === b)).length
      if (this.infoEl) {
        this.infoEl.innerHTML = `
          <div><strong>Race</strong> ${race.name} (${race.abbr})</div>
          <div><strong>Skeleton</strong> ${rig} — Bip001 champions use baked clips</div>
          <div><strong>Bones</strong> ${boneNames.length} (${mapped}/${BIP001_ORDERED.length} canonical)</div>
          <div><strong>Meshes</strong> ${meshNames.length}</div>
          <div><strong>Mixamo map</strong> ${Object.keys(DEFAULT_BONE_MAP).length} entries (offline bake)</div>
          <div><strong>Asset host</strong> ${ASSET_HOST || 'same-origin proxy'}</div>
        `
      }
      document.getElementById('brand-abbr')?.replaceChildren(document.createTextNode(race.abbr))
      document.getElementById('brand-name')?.replaceChildren(document.createTextNode(race.name))
      const badge = document.querySelector('.brand-badge')
      if (badge) {
        badge.style.background = race.color
        badge.style.boxShadow = `0 0 14px ${race.color}66`
      }
      this.setStatus(`${race.name} ready`)
    } catch (err) {
      console.error(err)
      this.setStatus(`Failed: ${err.message}`)
    } finally {
      this.loading = false
    }
  }

  playSelectedAnim() {
    const name = this.animSelect?.value
    const clip = this.clips.find((c) => c.name === name)
    if (clip) this.playClip(clip)
  }

  playClip(clip) {
    if (!this.mixer) return
    if (this.action) this.action.fadeOut(0.2)
    this.action = this.mixer.clipAction(clip)
    this.action.reset().fadeIn(0.2).play()
  }

  onResize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    const dt = this.clock.getDelta()
    this.mixer?.update(dt)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}

new Grudge6Viewer()