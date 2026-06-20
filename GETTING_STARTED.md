# Grudge Studio - Getting Started Guide

A quick reference for setting up and deploying Grudge Studio projects.

## Installation

### Step 1: Install Package

```bash
npm install grudge-studio
npm install three socket.io-client
```

### Step 2: Create HTML File

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grudge Studio Game</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #000;
        }
        
        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
        
        #ui {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <canvas class="webgl"></canvas>
    <div id="ui">Grudge Studio v1.2.0</div>
    <script type="module" src="./main.js"></script>
</body>
</html>
```

### Step 3: Create Main Game File

```javascript
// main.js
import * as THREE from 'three'
import { QuickSetup, AdvancedLightingSystem } from 'grudge-studio/tools'

const canvas = document.querySelector('canvas')

// Quick setup for first-person game
const game = QuickSetup.createFPSGame(canvas, {
    moveSpeed: 15,
    lookSpeed: 2,
    shadows: true
})

// Create game world
setupWorld(game.scene, game.physicsWorld)

// Animation loop handled by QuickSetup
console.log('Game initialized!')

function setupWorld(scene, physics) {
    // Add ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0x228b22 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)
    
    // Add enemies, items, etc.
}
```

### Step 4: Run Development Server

```bash
npm install vite --save-dev
npm run dev
```

---

## Deployment Guides

### GitHub Pages (Recommended for Demos)

Perfect for showcasing your game online.

#### 1. Configure package.json

```json
{
    "scripts": {
        "build": "vite build",
        "deploy:github": "npm run build && gh pages deploy dist"
    }
}
```

#### 2. Create GitHub Actions Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 3. Deploy

```bash
git push origin main
# GitHub Actions will automatically build and deploy
```

Your game will be live at: `https://username.github.io/repo-name/`

---

### Docker (Production Self-Hosting)

For self-hosted production deployments.

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve with Node.js
RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### 2. Build and Run

```bash
# Build image
docker build -t grudge-studio:latest .

# Run container
docker run -p 3000:8080 grudge-studio:latest

# Access at http://localhost:3000
```

#### 3. Docker Compose (Multi-service)

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web
```

```bash
docker-compose up -d
```

---

### Puter Cloud (Fastest)

Managed hosting with automatic scaling.

#### 1. Login to Puter

```bash
puter login
```

#### 2. Deploy

```bash
puter deploy --name my-game --dir dist
```

Your game is live! Get the URL from the output.

---

### Traditional Server (Apache/Nginx)

For complete control over your hosting.

#### 1. Build

```bash
npm run build
```

#### 2. Upload

Upload the `dist/` folder to your web server:

```bash
scp -r dist/ user@yourserver.com:/var/www/html/grudge-game/
```

#### 3. Configure Nginx

```nginx
server {
    listen 80;
    server_name yourgame.com;

    root /var/www/html/grudge-game;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Reload Nginx:

```bash
sudo systemctl restart nginx
```

---

## Common Scenarios

### Scenario 1: Quick Game Jam Project

```bash
# Setup
npm install grudge-studio three socket.io-client vite --save-dev

# Start coding
npm run dev

# Deploy to GitHub Pages
npm run build
git add . && git commit -m "Game complete" && git push

# Share link with judges
```

### Scenario 2: Multiplayer Game Server

```javascript
// server.js - Node.js with Express + Socket.IO
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(express.static('dist'))

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id)
    
    socket.on('move', (data) => {
        io.emit('playerMoved', { id: socket.id, ...data })
    })
    
    socket.on('disconnect', () => {
        io.emit('playerLeft', { id: socket.id })
    })
})

httpServer.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})
```

Run with:

```bash
node server.js
```

Then connect from client:

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

socket.on('playerMoved', (data) => {
    // Update other players
})
```

### Scenario 3: Mobile-Optimized Game

```javascript
import { QuickSetup } from 'grudge-studio/tools'

const setup = QuickSetup.createFPSGame(canvas, {
    fov: 60, // Wider FOV for mobile
    shadows: false, // Better performance
    autoRotate: false
})

// Touch controls
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0]
    // Handle touch input
})

// Responsive sizing
window.addEventListener('resize', () => {
    setup.camera.aspect = window.innerWidth / window.innerHeight
    setup.camera.updateProjectionMatrix()
    setup.renderer.setSize(window.innerWidth, window.innerHeight)
})
```

### Scenario 4: Using AI Agent for Project Help

```javascript
// The AI agent analyzes your project automatically
// Place this in your project root to get assistance

import { GrudgeStudioAgent } from 'grudge-studio/ai-agent'

const agent = new GrudgeStudioAgent(process.cwd())

// Get project analysis
const analysis = agent.analyzeProject()
console.log('Framework detected:', analysis.framework)
console.log('Dependencies:', analysis.dependencies)

// Check for issues
const issues = agent.scanForIssues()
issues.forEach(issue => {
    console.log(`⚠️ ${issue.type}: ${issue.message}`)
})

// Get suggestions
const suggestions = agent.getSuggestions()
suggestions.forEach(suggestion => {
    console.log(`💡 ${suggestion}`)
})

// Auto-fix common issues
agent.autoFixIssues()
```

---

## Performance Tips

### 1. Optimize Rendering

```javascript
// Enable frustum culling
camera.add(mesh) // Only render visible objects

// Use level of detail
import { LOD } from 'three'
const lod = new LOD()
lod.addLevel(detailedMesh, 0)
lod.addLevel(simpleMesh, 50)
scene.add(lod)

// Limit shadow-casting objects
light.castShadow = true
mesh.castShadow = true // Only for objects that cast shadows
```

### 2. Optimize Physics

```javascript
// Use simpler collision shapes
import { BoxShape, SphereShape } from 'grudge-studio/tools'

// Box > Sphere > Capsule (from fastest to slowest)

// Batch physics updates
const bodies = [...]
bodies.forEach(body => physics.addBody(body))
physics.step(deltaTime)
```

### 3. Memory Management

```javascript
// Dispose of unused resources
geometry.dispose()
material.dispose()
texture.dispose()
renderer.dispose()

// Remove from scene
scene.remove(mesh)
```

---

## Troubleshooting

### Game not rendering?

```javascript
// Check canvas exists
const canvas = document.querySelector('canvas')
if (!canvas) console.error('No canvas found!')

// Check Three.js import
import * as THREE from 'three'
if (!THREE) console.error('Three.js not imported!')

// Check WebGL support
const gl = canvas.getContext('webgl2')
if (!gl) console.error('WebGL2 not supported!')
```

### Slow performance?

```javascript
// Check frame rate
const monitor = new PerformanceMonitor(renderer)
console.log(monitor.getStats())

// Reduce shadow map quality
light.shadow.mapSize.width = 1024
light.shadow.mapSize.height = 1024

// Disable post-processing
// comment out composer.render()
```

### Physics not working?

```javascript
// Ensure bodies are added to world
physics.addBody(body)

// Check collision objects are set
if (collisionObjects.length === 0) {
    console.error('No collision objects!')
}

// Verify gravity
console.log(physics.gravity)
```

### Networking issues?

```javascript
// Check connection
socket.on('connect', () => {
    console.log('Connected to server')
})

socket.on('connect_error', (error) => {
    console.error('Connection error:', error)
})

// Debug messages
socket.onAny((event, ...args) => {
    console.log(event, args)
})
```

---

## Next Steps

1. **Read the full [Tools Documentation](TOOLS.md)**
2. **Check out [Examples](examples/)**
3. **Explore the [API Reference](API.md)**
4. **Join the Community** - GitHub Discussions

---

Happy coding! 🎮✨