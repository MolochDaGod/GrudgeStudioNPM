# Grudge Studio v1.2.0 - Complete Deployment Guide

## 🚀 Quick Start

Grudge Studio is now successfully deployed to GitHub Pages! Access it at:
- **Main Site**: https://MolochDaGod.github.io/GrudgeStudioNPM/
- **Deployment Status**: https://MolochDaGod.github.io/GrudgeStudioNPM/deployment-status.html
- **FPS Game**: https://MolochDaGod.github.io/GrudgeStudioNPM/examples/fps-game.html
- **RPG Adventure**: https://MolochDaGod.github.io/GrudgeStudioNPM/examples/rpg-adventure.html

## 📋 What's Included

### Core Framework (v1.2.0)
- **5 Comprehensive Tool Modules** (4000+ lines)
  - ShaderTools: Advanced shader systems (water, lava, portal, fireball)
  - InputTools: Multi-modal input (mouse, gamepad, leap motion, touch)
  - CameraTools: 4 camera controllers (Orbit, FPS, TPS, Cinematic)
  - PhysicsTools: Full 3D physics engine with collision detection
  - ExampleTools: Ready-to-use visual effects and interactive systems

### Documentation (900+ lines)
- **TOOLS.md**: Complete API reference with examples
- **GETTING_STARTED.md**: Deployment guides for 5 platforms
- **README.md**: Framework overview and features

### Game Examples
- **FPS Game**: First-person shooter with combat and AI enemies
- **RPG Adventure**: Role-playing game with procedural terrain
- **Interactive Showcase**: Demo of all visual effects

## 🔄 Deployment Pipeline

### Automatic Deployment (GitHub Actions)
The project includes GitHub Actions workflow that automatically:
1. **Test**: Runs linting and unit tests
2. **Build**: Compiles with Vite to optimized dist/
3. **Deploy to GitHub Pages**: Updates live site automatically
4. (Optional) Deploy to Docker Hub if secrets configured
5. (Optional) Deploy to Puter Cloud if API key configured
6. (Optional) Deploy to self-hosted server if configured

### How to Deploy

#### GitHub Pages (Already Active ✓)
```bash
# Build is automatic when pushing to main
git add -A
git commit -m "Update game"
git push origin main

# GitHub Actions automatically:
# 1. Runs tests
# 2. Builds with Vite
# 3. Deploys to GitHub Pages
```

#### Local Development
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build:pages

# Serve locally
npx http-server dist
```

#### Docker Deployment
```bash
# Build Docker image
npm run build:docker

# Run container locally
docker run -p 8080:80 GrudgeStudio:latest

# Push to Docker Hub
docker push your-username/grudge-studio
```

#### Puter Cloud Deployment
1. Create Puter account at https://puter.com
2. Get API key from account settings
3. Add to GitHub secrets:
   ```
   PUTER_API_KEY=your_api_key
   PUTER_APP_NAME=grudge-studio
   ```
4. Push to main - automatic deployment

#### Self-Hosted Server
1. Configure SSH credentials in GitHub secrets:
   ```
   DEPLOY_HOST=your.server.com
   DEPLOY_USER=ubuntu
   DEPLOY_SSH_KEY=your_private_key
   ```
2. Server must have Docker installed
3. Push to production branch for auto-deploy

## 🏗️ Build Configuration

### Vite Configuration
- **Base Path**: `/GrudgeStudioNPM/` (for GitHub Pages)
- **Output Directory**: `dist/`
- **Bundle Size**: ~1.4 MB JavaScript (gzipped: 290 KB)
- **Build Time**: ~4 seconds

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with WebGL support

## 📊 Project Structure

```
GrudgeStudioNPM/
├── src/
│   ├── tools/               # Tool modules (4000+ lines)
│   │   ├── ShaderTools.js
│   │   ├── InputTools.js
│   │   ├── CameraTools.js
│   │   ├── PhysicsTools.js
│   │   ├── ExampleTools.js
│   │   └── index.js
│   ├── playground.js        # Main application
│   └── styles/
├── core/                    # Core framework modules
├── render/                  # Rendering systems
├── controllers/             # Game controllers
├── examples/                # Game examples
│   ├── fps-game.html
│   ├── rpg-adventure.html
│   └── interactive-showcase.html
├── deployment/              # Docker & deployment configs
├── docs/                    # Documentation
├── ai-agent/                # AI agent system
├── TOOLS.md                 # API reference (400+ lines)
├── GETTING_STARTED.md       # Guides (500+ lines)
├── README.md                # Overview
└── package.json             # v1.2.0
```

## 🔧 Customization

### Adding New Features

#### Create New Tool Module
```javascript
// src/tools/MyTools.js
export class MyCustomSystem {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera
  }
  
  initialize() {
    // Setup code
  }
  
  update(deltaTime) {
    // Update logic
  }
}

// Export in src/tools/index.js
export { MyCustomSystem } from './MyTools.js'
```

#### Use in Playground
```javascript
import { MyCustomSystem } from './tools/index.js'

const mySystem = new MyCustomSystem(scene, camera)
```

### Modifying Build Configuration
Edit `vite.config.js` to change:
- Base path for deployment
- Output directory
- Build optimizations
- Environment variables

### Custom Deployment
Add to `.github/workflows/deploy.yml`:
```yaml
deploy-custom:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm install --legacy-peer-deps
    - run: npm run build:pages
    - run: custom-deploy-script.sh
```

## 🐛 Troubleshooting

### Build Fails with "vite: not found"
```bash
npm install
npm run build:pages
```

### Import errors for core modules
Ensure relative paths use `../` from src/:
```javascript
// Correct
import { Vec3 } from '../core/index.js'

// Wrong
import { Vec3 } from '/src/core/index.js'
```

### GitHub Pages not updating
1. Check GitHub Actions tab for errors
2. Verify base path in vite.config.js is correct
3. Clear browser cache and hard refresh

### Large bundle size
Enable compression in vite.config.js:
```javascript
build: {
  minify: 'terser',
  rollupOptions: {
    output: {
      manualChunks: { 'three': ['three'] }
    }
  }
}
```

## 📈 Performance Tips

### Optimize Load Time
- Use code splitting with dynamic imports
- Enable gzip compression on server
- Lazy load textures and models
- Monitor with Performance Monitor in tools

### Optimize Rendering
- Use LOD (Level of Detail) for terrain
- Implement frustum culling
- Batch draw calls
- Use instancing for repeated objects

### Memory Management
- Dispose of unused geometries
- Cache shader programs
- Pool game objects
- Monitor heap size

## 🔐 Security & Best Practices

### GitHub Actions Secrets
Store sensitive data as secrets (not in code):
- `DOCKER_USERNAME` / `DOCKER_PASSWORD`
- `PUTER_API_KEY`
- `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_SSH_KEY`

### Environment Variables
```bash
# .env.local (not committed)
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
```

### Code Quality
```bash
# Lint code
npm run lint

# Run tests
npm test

# Check for vulnerabilities
npm audit
```

## 📞 Support & Resources

### Documentation
- **TOOLS.md**: Full API reference with examples
- **GETTING_STARTED.md**: Step-by-step guides
- **README.md**: Framework overview

### Example Projects
- **fps-game.html**: Combat system example
- **rpg-adventure.html**: Terrain and NPC example
- **interactive-showcase.html**: Visual effects demo

### Community
- GitHub Issues: Report bugs or request features
- GitHub Discussions: Ask questions and share ideas
- GitHub Pages: Latest deployment status

## 🎯 Next Steps

1. **Customize the Game**
   - Modify examples to fit your use case
   - Add new levels or features
   - Integrate with backend API

2. **Deploy to Other Platforms**
   - Follow GETTING_STARTED.md for Docker
   - Set up Puter Cloud with API key
   - Configure self-hosted server

3. **Scale Your Game**
   - Add multiplayer with networking module
   - Implement server-side logic
   - Add user accounts and persistence

4. **Optimize for Production**
   - Enable build compression
   - Set up CDN for assets
   - Monitor performance metrics
   - Implement error tracking

## 📄 License & Attribution

Grudge Studio v1.2.0
- Built with Three.js
- Deployed via GitHub Pages + Actions
- Open source and community-driven

---

**Last Updated**: December 8, 2025
**Version**: 1.2.0
**Status**: ✅ Fully Deployed
