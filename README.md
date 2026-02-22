# GRUDGE STUDIO SDK

**Version 1.2.0** - A comprehensive game development framework for building 3D multiplayer games using Three.js and Socket.IO, featuring advanced shader systems, physics engines, AI agent assistance, and integrated deployment capabilities through Puter and GitHub.

## 📚 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🌐 Deployment Network](#-deployment-network)
- [🛠️ Development Environment](#️-development-environment)
- [🏗️ Self-Hosting Guide](#️-self-hosting-guide)
- [🔧 Modules](#-modules)
- [💡 Examples](#-examples)
- [📖 API Reference](#-api-reference)
- [🐳 Production Deployment](#-production-deployment)
- [🤝 Contributing](#-contributing)

## 🚀 Quick Start

Get up and running with Grudge Studio in minutes:

```bash
# Install the framework
npm install grudge-studio

# Install peer dependencies
npm install three socket.io-client

# Create your first game
npx create-grudge-game my-game
cd my-game
npm start
```

## 📦 Installation

### Basic Installation

```bash
npm install grudge-studio
```

### Peer Dependencies

Make sure you have these installed in your project:

```bash
npm install three socket.io-client socket.io
```

### Development Dependencies (Optional)

```bash
npm install --save-dev @types/three webpack webpack-cli
```

## 🌐 Deployment Network

Grudge Studio provides a comprehensive deployment ecosystem that integrates with multiple platforms for seamless development-to-production workflows.

### 🎯 Supported Platforms

| Platform | Type | Use Case | Setup Time |
|----------|------|----------|------------|
| **Puter Self-Hosting** | Private Cloud | Full control, custom domains | 15 min |
| **GitHub Pages** | Static Hosting | Client-side games, demos | 5 min |
| **Puter Cloud** | Managed Hosting | Auto-scaling, zero config | 2 min |
| **Docker** | Containerized | Production deployments | 10 min |
| **Local Development** | Development | Testing, debugging | 1 min |

### ⚡ Quick Deploy Commands

```bash
# Deploy to GitHub Pages (automatic via workflow)
git push origin main

# Manual GitHub Pages deployment
npm run deploy:github

# Deploy to Puter Cloud (fastest)
npm run deploy:puter-cloud

# Build for self-hosting
npm run build:production

# Deploy to custom Puter instance
npm run deploy:puter --instance=my-server.com

# Deploy with Docker
npm run deploy:docker

# Development server
npm run dev

# Preview production build
npm run preview
```

### 🎮 Interactive Playground

Experience Grudge Studio's capabilities with our interactive 3D playground:

**Live Demo**: [https://molochthegod.github.io/GrudgeStudioNPM/playground.html](https://molochthegod.github.io/GrudgeStudioNPM/playground.html)

#### Features:
- **6 Unique Characters**: Orc Warrior, Skeleton Mage, Elf Ranger, Human Paladin, Dwarf Berserker, Dwarven Guardian
- **Multiple Game Modes**: Sandbox, Arena Battle, Exploration, World Builder  
- **Real-time Terrain Modification**: Dynamic terrain generation and editing
- **Advanced Lighting**: Dynamic lighting with multiple presets
- **Performance Monitoring**: Real-time FPS, triangle count, and draw calls
- **Screenshot & Fullscreen**: Built-in screenshot and fullscreen capabilities

#### Character Models:
Each character includes:
- Unique animations (idle, combat, victory poses)
- Distinctive visual design matching fantasy archetypes
- Optimized 3D models with proper LOD support
- Combat abilities and special moves

#### Controls:
- **Mouse**: Orbit camera around the scene
- **Scroll**: Zoom in/out
- **WASD**: Pan camera
- **Space**: Character jump animation
- **C**: Cycle camera modes
- **1-6**: Quick character switching
- **Fullscreen**: F key or button

## 🛠️ Development Environment

### Local Development Setup

```javascript
import { Vec3, EventBus, InputManager, Clock } from 'grudge-studio/core'
import { SceneManager, ThirdPersonCamera } from 'grudge-studio/render'
import { ThirdPersonController, CombatController } from 'grudge-studio/controllers'
import { TerrainGenerator, BiomeSystem } from 'grudge-studio/terrain'
import { NetworkManager, Lobby, StateSync } from 'grudge-studio/net'
import { UICanvas, HealthBar, Minimap } from 'grudge-studio/ui'
import { AssetManifest, AssetBundle } from 'grudge-studio/assets'

// Initialize your game
const game = new GrudgeStudioGame({
  canvas: document.getElementById('gameCanvas'),
  multiplayer: true,
  terrain: { procedural: true },
  ui: { hud: true, minimap: true }
})

game.start()
```

### Development Server

```bash
# Start development server with hot reload
npm run dev

# Start with Puter integration
npm run dev:puter

# Start with debugging enabled
npm run dev:debug
```

## 🏗️ Self-Hosting Guide

Deploy your own Grudge Studio games using the integrated Puter self-hosting capabilities.

### 🚀 Quick Self-Host Setup

#### Option 1: Docker Compose (Recommended)

**Linux/macOS:**
```bash
mkdir -p grudge-studio-deploy/config grudge-studio-deploy/data
sudo chown -R 1000:1000 grudge-studio-deploy
wget https://raw.githubusercontent.com/MolochDaGod/GrudgeStudioNPM/main/deployment/docker-compose.yml
docker compose up
```

**Windows:**
```powershell
mkdir -p grudge-studio-deploy
cd grudge-studio-deploy
New-Item -Path "config" -ItemType Directory -Force
New-Item -Path "data" -ItemType Directory -Force
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/MolochDaGod/GrudgeStudioNPM/main/deployment/docker-compose.yml" -OutFile "docker-compose.yml"
docker compose up
```

#### Option 2: Direct Docker

```bash
mkdir grudge-studio-deploy && cd grudge-studio-deploy
mkdir -p config data && sudo chown -R 1000:1000 .
docker run --rm -p 4100:4100 \
  -v $(pwd)/config:/etc/puter \
  -v $(pwd)/data:/var/puter \
  ghcr.io/molochthegod/grudge-studio:latest
```

#### Option 3: Local Development

```bash
git clone https://github.com/MolochDaGod/GrudgeStudioNPM.git
cd GrudgeStudioNPM
npm install
npm run self-host
```

**→** Your instance will be available at **http://puter.localhost:4100** (or next available port)

### 🔧 Configuration

#### Domain Setup

For LAN access, enable nip.io domains in your config:

```json
{
  "allow_nipio_domains": true,
  "domain": "192.168.1.100.nip.io",
  "protocol": "http"
}
```

For custom domains, configure both main and API subdomains:

```json
{
  "domain": "mygame.local",
  "protocol": "http"
}
```

Then add to your hosts file (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):
```
192.168.1.100 mygame.local
192.168.1.100 api.mygame.local
```

#### Advanced Configuration

Create a custom configuration in `config/local.json`:

```json
{
  "$version": "v1.1.0",
  "$requires": ["config.json"],
  "config_name": "grudge-studio-local",
  
  "domain": "my-grudge-studio.local",
  "protocol": "http",
  "http_port": 4100,
  
  "grudge_studio": {
    "multiplayer": {
      "max_players": 64,
      "enable_voice_chat": true
    },
    "terrain": {
      "chunk_size": 512,
      "render_distance": 8
    },
    "assets": {
      "cdn_enabled": false,
      "local_cache": true
    }
  },
  
  "services": {
    "database": {
      "engine": "sqlite",
      "path": "grudge-studio.sqlite"
    }
  }
}
```

Set environment variable: `PUTER_CONFIG_PROFILE=local`

### 🔐 Security & Authentication

#### Default User Setup

After first run, login with the generated default user:
- **Username**: `default_user`
- **Password**: Check console output for generated password
- **⚠️ Change password immediately after first login**

#### Custom Authentication

```json
{
  "disable_temp_users": true,
  "disable_user_signup": false,
  "require_email_verification": true
}
```

### 📊 Monitoring & Performance

#### Enable Performance Monitoring

Set environment variable:
```bash
export PERFMON=1
```

#### Enable Development Mode

For enhanced debugging:
```bash
export UNSAFE_PUTER_DEV=1
```

## 🔧 Modules

### 🧮 Core Module
Math utilities, collision detection, state machines, events, input handling, and time utilities.

```javascript
import { Vec3, Mat4, Quat, AABB, Sphere, Capsule, Ray } from 'grudge-studio/core'
import { StateMachine, EventEmitter, EventBus } from 'grudge-studio/core'
import { InputManager, GamepadManager, InputMap } from 'grudge-studio/core'
import { Clock, Timer, Tween } from 'grudge-studio/core'
```

**Math Classes:**
- `Vec2`, `Vec3` - 2D/3D vectors with full math operations
- `Mat4` - 4x4 matrix for transformations
- `Quat` - Quaternion for rotations
- `noise2D`, `noise3D` - Simplex noise functions
- `Easing` - Animation easing functions

**Collision:**
- `AABB` - Axis-aligned bounding boxes
- `Sphere` - Sphere collision
- `Capsule` - Capsule collision (great for characters)
- `Ray` - Raycasting

### 🎬 Render Module
Scene management and camera systems built on Three.js.

```javascript
import { SceneManager } from 'grudge-studio/render'
import { OrbitCamera, FollowCamera, FirstPersonCamera } from 'grudge-studio/render'
import { ThirdPersonCamera, CinematicCamera } from 'grudge-studio/render'
import { AnimationController, MaterialFactory } from 'grudge-studio/render'
import { AssetLoader, ParticleSystem } from 'grudge-studio/render'
```

**Camera Systems:**
- `FirstPersonCamera` - FPS-style camera
- `ThirdPersonCamera` - Over-shoulder perspective
- `OrbitCamera` - Orbital camera for inspection
- `FollowCamera` - Smooth following camera
- `CinematicCamera` - Cutscene and scripted sequences

### 🎮 Controllers Module
Character movement and input handling systems.

```javascript
import { ThirdPersonController, FirstPersonController } from 'grudge-studio/controllers'
import { PlatformerController, VehicleController } from 'grudge-studio/controllers'
import { CombatController, DamageSystem } from 'grudge-studio/controllers'
```

**Available Controllers:**
- `ThirdPersonController` - Third-person character movement
- `FirstPersonController` - First-person movement with mouse look
- `PlatformerController` - 2.5D platformer mechanics
- `VehicleController` - Car/vehicle physics
- `CombatController` - Combat system with combos

### 🌍 Terrain Module
Procedural terrain generation and rendering.

```javascript
import { TerrainGenerator, BiomeSystem, LODTerrain } from 'grudge-studio/terrain'
import { HeightMap, TerrainChunk } from 'grudge-studio/terrain'
```

**Features:**
- Infinite procedural worlds
- Multiple biome support
- LOD (Level of Detail) optimization
- Real-time chunk loading/unloading

### 🌐 Networking Module
Multiplayer networking with Socket.IO integration.

```javascript
import { NetworkManager, Lobby, StateSync } from 'grudge-studio/net'
import { ClientPrediction, ServerTemplate } from 'grudge-studio/net'
```

**Networking Features:**
- Real-time multiplayer
- Client-side prediction
- State synchronization
- Lobby system
- Built-in anti-cheat measures

### 🎨 UI Module
Game UI components and HUD elements.

```javascript
import { UICanvas, Button, Panel, Text } from 'grudge-studio/ui'
import { HealthBar, Minimap } from 'grudge-studio/ui'
```

**UI Components:**
- Canvas-based UI system
- Responsive design support
- Game-specific widgets (health bars, minimaps)
- Customizable themes

## 💡 Examples

### Basic 3D Scene

```javascript
import { SceneManager, OrbitCamera } from 'grudge-studio/render'
import { Vec3 } from 'grudge-studio/core'

const scene = new SceneManager()
const camera = new OrbitCamera({
  target: new Vec3(0, 0, 0),
  distance: 10
})

scene.add(camera)
scene.start()
```

### Multiplayer Game

```javascript
import { NetworkManager } from 'grudge-studio/net'
import { ThirdPersonController } from 'grudge-studio/controllers'

const network = new NetworkManager({
  server: 'ws://localhost:3000',
  room: 'game-room'
})

const player = new ThirdPersonController({
  networked: true,
  networkManager: network
})

network.connect().then(() => {
  console.log('Connected to multiplayer server!')
})
```

### Procedural Terrain

```javascript
import { TerrainGenerator, BiomeSystem } from 'grudge-studio/terrain'

const terrain = new TerrainGenerator({
  size: 1000,
  chunkSize: 64,
  biomes: ['forest', 'desert', 'mountains']
})

const biomes = new BiomeSystem({
  forest: { treesDensity: 0.8, grassHeight: 2 },
  desert: { sandDunes: true, oasisChance: 0.1 },
  mountains: { snowLine: 150, rockiness: 0.9 }
})

terrain.generate()
```

## 📖 API Reference

### Configuration Options

```javascript
const config = {
  // Rendering
  renderer: {
    antialias: true,
    shadows: true,
    fog: { enabled: true, density: 0.01 }
  },
  
  // Physics
  physics: {
    gravity: -9.81,
    timeStep: 1/60,
    substeps: 3
  },
  
  // Networking
  networking: {
    maxPlayers: 32,
    tickRate: 60,
    compression: true
  },
  
  // Terrain
  terrain: {
    chunkSize: 128,
    renderDistance: 8,
    lodLevels: 4
  }
}
```

### Event System

```javascript
import { EventBus } from 'grudge-studio/core'

const events = new EventBus()

// Listen for events
events.on('player:jump', (player) => {
  console.log(`${player.name} jumped!`)
})

// Emit events
events.emit('player:jump', player)

// One-time listeners
events.once('game:start', () => {
  console.log('Game started!')
})
```

### State Management

```javascript
import { StateMachine } from 'grudge-studio/core'

const playerState = new StateMachine({
  initial: 'idle',
  states: {
    idle: {
      canJump: true,
      on: { MOVE: 'walking', JUMP: 'jumping' }
    },
    walking: {
      on: { STOP: 'idle', JUMP: 'jumping' }
    },
    jumping: {
      canJump: false,
      on: { LAND: 'idle' }
    }
  }
})
```

## 🐳 Production Deployment

### Docker Production Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  grudge-studio:
    image: ghcr.io/molochthegod/grudge-studio:latest
    ports:
      - "80:4100"
      - "443:4101"
    volumes:
      - ./config:/etc/puter
      - ./data:/var/puter
      - ./ssl:/etc/ssl/puter
    environment:
      - NODE_ENV=production
      - PUTER_CONFIG_PROFILE=production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - grudge-studio
    restart: unless-stopped

  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

### Production Configuration

```json
{
  "$version": "v1.1.0",
  "$requires": ["config.json"],
  "config_name": "production",
  
  "domain": "yourdomain.com",
  "protocol": "https",
  "http_port": 4100,
  
  "production": true,
  "debug": false,
  
  "services": {
    "database": {
      "engine": "postgresql",
      "host": "localhost",
      "port": 5432,
      "database": "grudge_studio",
      "username": "grudge_user"
    },
    "redis": {
      "host": "redis",
      "port": 6379
    }
  },
  
  "ssl": {
    "cert_path": "/etc/ssl/puter/cert.pem",
    "key_path": "/etc/ssl/puter/key.pem"
  }
}
```

### NGINX Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    upstream grudge_studio {
        server grudge-studio:4100;
    }

    server {
        listen 80;
        server_name yourdomain.com api.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com api.yourdomain.com;

        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;

        location / {
            proxy_pass http://grudge_studio;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build for production
        run: npm run build:production
        
      - name: Build Docker image
        run: |
          docker build -t grudge-studio:${{ github.sha }} .
          docker tag grudge-studio:${{ github.sha }} grudge-studio:latest
          
      - name: Deploy to server
        run: |
          echo "${{ secrets.DEPLOY_KEY }}" | ssh-add -
          ssh -o StrictHostKeyChecking=no ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} \
            "cd /opt/grudge-studio && docker-compose pull && docker-compose up -d"
```

### Monitoring & Analytics

```javascript
// Enable built-in monitoring
const config = {
  monitoring: {
    enabled: true,
    metricsPort: 9090,
    healthCheck: '/health',
    performance: true
  },
  
  analytics: {
    enabled: true,
    anonymize: true,
    events: ['player:join', 'game:start', 'error:*']
  }
}
```

### Performance Optimization

```javascript
// Production optimizations
const prodConfig = {
  optimization: {
    textureCompression: true,
    meshOptimization: true,
    culling: {
      frustum: true,
      occlusion: true,
      distance: 1000
    },
    lod: {
      enabled: true,
      levels: [1, 0.5, 0.25, 0.1]
    }
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/MolochDaGod/GrudgeStudioNPM.git
cd GrudgeStudioNPM
npm install
npm run dev
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests
```

### Building

```bash
npm run build          # Build for development
npm run build:prod     # Build for production
npm run build:docs     # Generate documentation
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Live Game**: [grudgewarlords.com](https://grudgewarlords.com)
- **Discord**: [Join our community](https://discord.gg/KmAC5aXs84)
- **Issues**: [GitHub Issues](https://github.com/MolochDaGod/GrudgeStudioNPM/issues)
- **Game Data API**: [ObjectStore](https://molochdagod.github.io/ObjectStore)

## 🎮 Live Projects

| Project | URL | Description |
|---------|-----|-------------|
| Grudge Warlords | [grudgewarlords.com](https://grudgewarlords.com) | Browser-based souls-like MMO RPG |
| ObjectStore API | [GitHub Pages](https://molochdagod.github.io/ObjectStore) | Static game data API (weapons, races, classes) |
| ObjectStore SDK | [grudge-sdk.js](https://molochdagod.github.io/ObjectStore/sdk/grudge-sdk.js) | JavaScript SDK for game data |
| Arena PvP | [grudgewarlords.com/arena](https://grudgewarlords.com) | Ranked PvP with server-authoritative battles |

## 🚀 Roadmap

- [ ] WebXR/VR Support
- [ ] Advanced AI NPCs
- [ ] Blockchain Integration
- [ ] Mobile SDK
- [ ] Visual Editor
- [ ] Marketplace for Assets

---

**Made with ❤️ by the Grudge Studio Team**

## Quick Start

```javascript
import { Vec3, EventBus, InputManager, Clock } from 'grudge-studio/core'
import { SceneManager, ThirdPersonCamera } from 'grudge-studio/render'
import { ThirdPersonController, CombatController } from 'grudge-studio/controllers'
import { TerrainGenerator, BiomeSystem } from 'grudge-studio/terrain'
import { NetworkManager, Lobby, StateSync } from 'grudge-studio/net'
import { UICanvas, HealthBar, Minimap } from 'grudge-studio/ui'
import { AssetManifest, AssetBundle } from 'grudge-studio/assets'
```

## Modules

### Core
Math utilities, collision detection, state machines, events, input handling, and time utilities.

```javascript
import { Vec3, Mat4, Quat, AABB, Sphere, Capsule, Ray } from 'grudge-studio/core'
import { StateMachine, EventEmitter, EventBus } from 'grudge-studio/core'
import { InputManager, GamepadManager, InputMap } from 'grudge-studio/core'
import { Clock, Timer, Tween } from 'grudge-studio/core'
```

**Math Classes:**
- `Vec2`, `Vec3` - 2D/3D vectors with full math operations
- `Mat4` - 4x4 matrix for transformations
- `Quat` - Quaternion for rotations
- `noise2D`, `noise3D` - Simplex noise functions
- `Easing` - Animation easing functions

**Collision:**
- `AABB` - Axis-aligned bounding boxes
- `Sphere` - Sphere collision
- `Capsule` - Capsule collision (great for characters)
- `Ray` - Raycasting

### Render
Scene management and camera systems built on Three.js.

```javascript
import { SceneManager } from 'grudge-studio/render'
import { OrbitCamera, FollowCamera, FirstPersonCamera } from 'grudge-studio/render'
import { ThirdPersonCamera, CinematicCamera } from 'grudge-studio/render'
import { AnimationController, MaterialFactory } from 'grudge-studio/render'
import { AssetLoader, ParticleSystem } from 'grudge-studio/render'
```

**Camera Systems:**
- `OrbitCamera` - Orbit around a target point
- `FollowCamera` - Smooth follow with offset
- `FirstPersonCamera` - FPS-style camera
- `ThirdPersonCamera` - Over-the-shoulder camera
- `CinematicCamera` - Spline-based camera paths

### Controllers
Character and vehicle controllers with physics.

```javascript
import { CharacterController } from 'grudge-studio/controllers'
import { FirstPersonController, ThirdPersonController } from 'grudge-studio/controllers'
import { PlatformerController, VehicleController } from 'grudge-studio/controllers'
import { CombatController, DamageSystem } from 'grudge-studio/controllers'
```

**Character Types:**
- `FirstPersonController` - FPS movement with mouse look
- `ThirdPersonController` - Third-person with sprint and crouch
- `PlatformerController` - Jump, double-jump, wall-jump, dash

**Combat:**
- `CombatController` - Attack combos, blocking, dodging
- `DamageSystem` - Health, damage types, resistances

### Terrain
Procedural terrain generation with LOD and biomes.

```javascript
import { HeightMap, TerrainGenerator } from 'grudge-studio/terrain'
import { TerrainChunk, LODTerrain } from 'grudge-studio/terrain'
import { BiomeSystem } from 'grudge-studio/terrain'
```

**Features:**
- Simplex noise-based heightmaps
- Infinite terrain with LOD chunks
- Biome coloring based on height, moisture, temperature

### Net
Multiplayer networking with Socket.IO.

```javascript
import { NetworkManager, StateSync } from 'grudge-studio/net'
import { ClientPrediction, Lobby } from 'grudge-studio/net'
import { ServerTemplate } from 'grudge-studio/net'
```

**Features:**
- Automatic state synchronization
- Client-side prediction with reconciliation
- Lobby and room management
- Server boilerplate templates

### UI
Canvas-based UI system for games.

```javascript
import { UICanvas, HealthBar, Button } from 'grudge-studio/ui'
import { Panel, Text, Minimap } from 'grudge-studio/ui'
```

**Components:**
- `HealthBar` - Animated health/mana bars
- `Button` - Interactive buttons with hover/click states
- `Panel` - Container panels with backgrounds
- `Text` - Text rendering with fonts and styles
- `Minimap` - Game minimap with entity markers

### Assets
Asset management with CDN support.

```javascript
import { AssetManifest, AssetBundle } from 'grudge-studio/assets'
import { AssetPipeline } from 'grudge-studio/assets'
```

**Features:**
- Asset registry with versioning
- Bundle loading for grouped assets
- CDN support for production
- Processing pipeline for optimization

## Examples

### Arena Fighter

```javascript
import { SceneManager, ThirdPersonCamera } from 'grudge-studio/render'
import { ThirdPersonController, CombatController, DamageSystem } from 'grudge-studio/controllers'
import { InputManager, Clock } from 'grudge-studio/core'
import { UICanvas, HealthBar } from 'grudge-studio/ui'

// Initialize
const scene = new SceneManager({ container: document.body })
const input = new InputManager()
const clock = new Clock()
const ui = new UICanvas(window.innerWidth, window.innerHeight)

// Create player
const player = new ThirdPersonController(scene.scene, input, {
  moveSpeed: 8,
  sprintSpeed: 14
})

// Add combat
const combat = new CombatController(player)
const damage = new DamageSystem()
damage.registerEntity('player', { maxHealth: 100 })

// UI
const healthBar = new HealthBar(20, 20, 200, 20, { maxValue: 100 })
ui.addComponent(healthBar)

// Game loop
function update() {
  const delta = clock.getDelta()
  player.update(delta)
  combat.update(delta)
  healthBar.setValue(damage.getHealth('player'))
  ui.render()
  scene.render()
  requestAnimationFrame(update)
}
update()
```

### Multiplayer Lobby

```javascript
import { NetworkManager, Lobby, StateSync } from 'grudge-studio/net'

const network = new NetworkManager('https://your-server.com')
const lobby = new Lobby(network)
const sync = new StateSync(network)

// Create/join rooms
lobby.createRoom('My Room', { maxPlayers: 4 })
lobby.onRoomCreated((room) => console.log('Room created:', room.id))

// Sync player state
sync.registerEntity('player', playerObject, ['position', 'rotation'])
sync.onEntityUpdate((id, state) => {
  // Update remote player
})
```

### Procedural World

```javascript
import { LODTerrain, BiomeSystem } from 'grudge-studio/terrain'

const biomes = new BiomeSystem()
biomes.addBiome('forest', { 
  color: 0x228B22,
  heightRange: [0.3, 0.6],
  moistureRange: [0.5, 1.0]
})

const terrain = new LODTerrain(scene, {
  chunkSize: 64,
  viewDistance: 3,
  biomeSystem: biomes
})

// Update chunks based on camera position
function update() {
  terrain.update(camera.position)
}
```

## API Reference

Full API documentation is available in the `docs` module:

```javascript
import { KnowledgeBase, PromptLibrary, Examples } from 'grudge-studio/docs'

const kb = new KnowledgeBase()
console.log(kb.getModuleAPI('core'))
console.log(kb.search('camera'))

const prompts = new PromptLibrary()
console.log(prompts.getPrompt('debug_performance'))
```

## Self-Hosting Guide

This section provides comprehensive instructions for self-hosting Grudge Studio applications using Puter infrastructure.

### Prerequisites

- Node.js 16+ and npm
- Git
- Docker (optional but recommended)
- Domain name (optional for local development)

### Method 1: Docker Compose (Recommended)

#### Linux/macOS
```bash
# Create directory structure
mkdir -p grudge-deployment/puter/config grudge-deployment/puter/data
sudo chown -R 1000:1000 grudge-deployment/puter
cd grudge-deployment

# Download Puter configuration
wget https://raw.githubusercontent.com/HeyPuter/puter/main/docker-compose.yml

# Start Puter instance
docker compose up -d
```

#### Windows (PowerShell)
```powershell
# Create directory structure
mkdir -p grudge-deployment
cd grudge-deployment
New-Item -Path "puter\config" -ItemType Directory -Force
New-Item -Path "puter\data" -ItemType Directory -Force

# Download Puter configuration
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/HeyPuter/puter/main/docker-compose.yml" -OutFile "docker-compose.yml"

# Start Puter instance
docker compose up -d
```

Your Puter instance will be available at `http://puter.localhost:4100` (or the next available port).

### Method 2: Local Development Setup

```bash
# Clone Puter repository
git clone https://github.com/HeyPuter/puter
cd puter

# Install dependencies
npm install

# Start development server
npm start
```

### Method 3: Docker Single Container

```bash
# Quick single-container setup
mkdir puter && cd puter
mkdir -p puter/config puter/data
sudo chown -R 1000:1000 puter
docker run --rm -p 4100:4100 \
  -v $(pwd)/puter/config:/etc/puter \
  -v $(pwd)/puter/data:/var/puter \
  ghcr.io/heyputer/puter
```

### Configuration

After first run, Puter generates a configuration file at one of these locations:
- `config/config.json` (Docker deployment)
- `volatile/config/config.json` (Local development)
- `/etc/puter/config.json` (Production server)

#### Basic Configuration Example

```json
{
  "config_name": "grudge-studio-deployment",
  "env": "production",
  "server_id": "grudge-server",
  "http_port": 4100,
  "domain": "your-domain.com",
  "protocol": "https",
  "contact_email": "admin@your-domain.com",
  "services": {
    "database": {
      "engine": "sqlite",
      "path": "grudge-database.sqlite"
    },
    "file-cache": {
      "disk_limit": 5368709120,
      "path": "./game-assets-cache"
    }
  }
}
```

#### Domain Configuration

For production deployments, configure your domain:

**Local Network (Development)**
- Use `nip.io` for easy local DNS: `grudge.192.168.1.100.nip.io`
- Configure router DNS or use hosts file
- Set up local DNS server (Pi-hole, BIND9, dnsmasq)

**Production Deployment**
- Point your domain and `api.your-domain.com` to your server
- Configure reverse proxy (nginx/cloudflare)
- Enable HTTPS with valid SSL certificates

### Security Configuration

#### Environment Variables
```bash
# Required for production
export PUTER_DOMAIN="your-domain.com"
export PUTER_PROTOCOL="https"
export PUTER_JWT_SECRET="your-super-secure-jwt-secret"
export PUTER_COOKIE_SECRET="your-cookie-secret"

# Optional security settings
export PUTER_DISABLE_TEMP_USERS="true"
export PUTER_DISABLE_USER_SIGNUP="false"
export PUTER_REQUIRE_EMAIL_VERIFICATION="true"
```

#### Reverse Proxy (Nginx Example)
```nginx
server {
    listen 80;
    server_name your-domain.com api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com api.your-domain.com;
    
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    
    location / {
        proxy_pass http://localhost:4100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Production Deployment

### Building for Production

```bash
# Clone your Grudge Studio project
git clone https://github.com/yourusername/your-grudge-game
cd your-grudge-game

# Install dependencies
npm install

# Build optimized production bundle
npm run build:production
```

This creates an optimized build in the `dist/` directory with:
- Minified JavaScript bundles
- Compressed assets
- Service worker for offline support
- Progressive Web App (PWA) manifests

### Deployment Options

#### 1. Puter Cloud Deployment

```bash
# Login to Puter
npx puter-cli login

# Deploy your game
npx puter-cli deploy ./dist --name "my-grudge-game"

# Custom domain deployment
npx puter-cli deploy ./dist --name "my-grudge-game" --domain "mygame.yourdomain.com"
```

#### 2. Self-Hosted Puter Deployment

```bash
# Configure Puter endpoint
export PUTER_API_URL="https://api.your-puter-domain.com"

# Deploy to your Puter instance
npm run deploy:self-hosted
```

#### 3. GitHub Pages Deployment

```bash
# Configure GitHub Pages in repository settings
# Then deploy with:
npm run deploy:github

# Or use GitHub Actions (recommended)
```

**GitHub Actions Workflow (`.github/workflows/deploy.yml`):**
```yaml
name: Deploy Grudge Studio Game

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build production
      run: npm run build:production
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### 4. Docker Production Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose for Production:**
```yaml
version: '3.8'
services:
  grudge-game:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  puter-backend:
    image: ghcr.io/heyputer/puter:latest
    ports:
      - "4100:4100"
    volumes:
      - ./puter-config:/etc/puter
      - ./puter-data:/var/puter
    environment:
      - PUTER_DOMAIN=yourdomain.com
      - PUTER_PROTOCOL=https
    restart: unless-stopped
```

### Performance Optimization

#### CDN Integration
```javascript
// Configure CDN in your Grudge Studio app
import { AssetManifest } from 'grudge-studio/assets'

const assets = new AssetManifest({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.yourdomain.com/assets/' 
    : '/assets/',
  preload: ['textures', 'sounds', 'models'],
  compression: 'gzip'
})
```

#### Monitoring and Analytics
```javascript
// Add performance monitoring
import { PerformanceMonitor } from 'grudge-studio/core'

const monitor = new PerformanceMonitor({
  endpoint: 'https://analytics.yourdomain.com/api/metrics',
  sampleRate: 0.1, // 10% sampling in production
  metrics: ['fps', 'memory', 'network', 'errors']
})

// Enable in production only
if (process.env.NODE_ENV === 'production') {
  monitor.start()
}
```

### Scaling and Load Balancing

#### Horizontal Scaling with Load Balancer

```nginx
upstream grudge_backend {
    server puter1:4100;
    server puter2:4100;
    server puter3:4100;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    location /api/ {
        proxy_pass http://grudge_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        root /var/www/grudge-game;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Database Clustering
```json
{
  "services": {
    "database": {
      "engine": "postgresql",
      "host": "postgres-cluster.yourdomain.com",
      "port": 5432,
      "database": "grudge_studio",
      "ssl": true,
      "pool": {
        "min": 5,
        "max": 20
      }
    }
  }
}
```

### Troubleshooting Common Issues

#### Build Essentials (Linux)
```bash
# Debian/Ubuntu
sudo apt update && sudo apt install build-essential

# RHEL/Fedora
sudo dnf groupinstall "Development Tools"

# Arch Linux
sudo pacman -S base-devel

# Alpine
sudo apk add build-base
```

#### Permission Issues (Docker)
```bash
# Fix permission issues
sudo chown -R $USER:$USER ./puter
sudo chmod -R 755 ./puter
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:production
```

For detailed troubleshooting and advanced configuration, see the [Puter Self-Hosting Documentation](https://github.com/HeyPuter/puter/blob/main/doc/self-hosters/instructions.md).

## License

MIT
