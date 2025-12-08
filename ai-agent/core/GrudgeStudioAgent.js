/**
 * Grudge Studio AI Agent
 * Intelligent project assistant for learning, dependency management, and automated fixes
 */

import fs from 'fs/promises'
import path from 'path'
import { EventEmitter } from 'events'

export class GrudgeStudioAgent extends EventEmitter {
    constructor(options = {}) {
        super()
        
        this.projectPath = options.projectPath || process.cwd()
        this.config = {
            autoFix: options.autoFix || true,
            learningMode: options.learningMode || true,
            dependencies: {
                check: true,
                autoUpdate: options.autoUpdate || false,
                vulnerabilityCheck: true
            },
            ai: {
                model: options.aiModel || 'local',
                apiKey: options.apiKey,
                endpoint: options.endpoint
            }
        }
        
        this.knowledgeBase = new Map()
        this.projectAnalysis = {}
        this.suggestions = []
        this.fixes = []
        
        this.init()
    }

    async init() {
        console.log('🤖 Initializing Grudge Studio AI Agent...')
        
        try {
            await this.analyzeProject()
            await this.loadKnowledgeBase()
            await this.checkDependencies()
            await this.scanForIssues()
            
            this.emit('initialized', {
                analysis: this.projectAnalysis,
                suggestions: this.suggestions
            })
            
            console.log('✅ AI Agent initialized successfully')
        } catch (error) {
            console.error('❌ Failed to initialize AI Agent:', error)
            this.emit('error', error)
        }
    }

    async analyzeProject() {
        console.log('📊 Analyzing project structure...')
        
        const packagePath = path.join(this.projectPath, 'package.json')
        let packageJson = {}
        
        try {
            const packageContent = await fs.readFile(packagePath, 'utf-8')
            packageJson = JSON.parse(packageContent)
        } catch (error) {
            console.warn('⚠️ No package.json found, creating analysis for generic project')
        }

        this.projectAnalysis = {
            name: packageJson.name || 'unknown-project',
            version: packageJson.version || '0.0.0',
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {},
            scripts: packageJson.scripts || {},
            type: this.detectProjectType(packageJson),
            files: await this.scanProjectFiles(),
            frameworks: this.detectFrameworks(packageJson),
            hasGrudgeStudio: this.hasGrudgeStudioDependency(packageJson),
            timestamp: new Date().toISOString()
        }

        console.log(`📝 Project Analysis Complete: ${this.projectAnalysis.name} (${this.projectAnalysis.type})`)
    }

    detectProjectType(packageJson) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
        
        if (deps['grudge-studio']) return 'grudge-studio-game'
        if (deps['three']) return 'threejs-project'
        if (deps['react']) return 'react-app'
        if (deps['vue']) return 'vue-app'
        if (deps['angular']) return 'angular-app'
        if (deps['express']) return 'node-server'
        if (deps['electron']) return 'electron-app'
        
        return 'generic'
    }

    detectFrameworks(packageJson) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
        const frameworks = []
        
        const frameworkMap = {
            'three': 'Three.js',
            'socket.io': 'Socket.IO',
            'socket.io-client': 'Socket.IO Client',
            'react': 'React',
            'vue': 'Vue.js',
            'angular': 'Angular',
            'express': 'Express.js',
            'webpack': 'Webpack',
            'vite': 'Vite',
            'typescript': 'TypeScript',
            'grudge-studio': 'Grudge Studio'
        }

        Object.keys(deps).forEach(dep => {
            if (frameworkMap[dep]) {
                frameworks.push(frameworkMap[dep])
            }
        })

        return frameworks
    }

    hasGrudgeStudioDependency(packageJson) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
        return !!deps['grudge-studio']
    }

    async scanProjectFiles() {
        const files = {
            total: 0,
            js: 0,
            ts: 0,
            html: 0,
            css: 0,
            json: 0,
            images: 0,
            models: 0
        }

        try {
            const allFiles = await this.getAllFiles(this.projectPath)
            
            allFiles.forEach(file => {
                const ext = path.extname(file).toLowerCase()
                files.total++
                
                switch (ext) {
                    case '.js':
                    case '.jsx':
                        files.js++
                        break
                    case '.ts':
                    case '.tsx':
                        files.ts++
                        break
                    case '.html':
                        files.html++
                        break
                    case '.css':
                    case '.scss':
                    case '.sass':
                        files.css++
                        break
                    case '.json':
                        files.json++
                        break
                    case '.png':
                    case '.jpg':
                    case '.jpeg':
                    case '.gif':
                    case '.webp':
                        files.images++
                        break
                    case '.glb':
                    case '.gltf':
                    case '.obj':
                    case '.fbx':
                        files.models++
                        break
                }
            })
        } catch (error) {
            console.warn('⚠️ Could not scan project files:', error.message)
        }

        return files
    }

    async getAllFiles(dirPath, arrayOfFiles = []) {
        try {
            const files = await fs.readdir(dirPath)
            
            for (const file of files) {
                if (file.startsWith('.') || file === 'node_modules') continue
                
                const fullPath = path.join(dirPath, file)
                const stat = await fs.stat(fullPath)
                
                if (stat.isDirectory()) {
                    arrayOfFiles = await this.getAllFiles(fullPath, arrayOfFiles)
                } else {
                    arrayOfFiles.push(fullPath)
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
        
        return arrayOfFiles
    }

    async loadKnowledgeBase() {
        console.log('🧠 Loading AI knowledge base...')
        
        // Grudge Studio specific knowledge
        this.knowledgeBase.set('grudge-studio-setup', {
            pattern: /grudge.?studio/i,
            solution: this.getGrudgeStudioSetup(),
            category: 'setup'
        })

        this.knowledgeBase.set('three-js-optimization', {
            pattern: /three\.?js|performance|fps|lag/i,
            solution: this.getThreeJSOptimizations(),
            category: 'performance'
        })

        this.knowledgeBase.set('shader-issues', {
            pattern: /shader|material|glsl/i,
            solution: this.getShaderSolutions(),
            category: 'graphics'
        })

        this.knowledgeBase.set('animation-problems', {
            pattern: /animation|tween|morph/i,
            solution: this.getAnimationSolutions(),
            category: 'animation'
        })

        this.knowledgeBase.set('networking-issues', {
            pattern: /socket|multiplayer|network|connection/i,
            solution: this.getNetworkingSolutions(),
            category: 'networking'
        })

        console.log(`🎯 Loaded ${this.knowledgeBase.size} knowledge patterns`)
    }

    async checkDependencies() {
        console.log('🔍 Checking dependencies...')
        
        const packagePath = path.join(this.projectPath, 'package.json')
        
        try {
            const packageContent = await fs.readFile(packagePath, 'utf-8')
            const packageJson = JSON.parse(packageContent)
            
            const issues = []
            const recommendations = []

            // Check for Grudge Studio integration
            if (!packageJson.dependencies?.['grudge-studio']) {
                recommendations.push({
                    type: 'dependency',
                    message: 'Add Grudge Studio for enhanced 3D game development',
                    action: 'npm install grudge-studio',
                    priority: 'high'
                })
            }

            // Check Three.js version compatibility
            if (packageJson.dependencies?.['three']) {
                const threeVersion = packageJson.dependencies['three']
                if (!this.isVersionCompatible(threeVersion, '>=0.160.0')) {
                    issues.push({
                        type: 'version-conflict',
                        message: 'Three.js version may be incompatible with Grudge Studio',
                        fix: 'npm install three@^0.160.0'
                    })
                }
            }

            // Check for missing development tools
            const devTools = ['vite', 'webpack', 'parcel']
            const hasDevTool = devTools.some(tool => 
                packageJson.devDependencies?.[tool] || packageJson.dependencies?.[tool]
            )
            
            if (!hasDevTool) {
                recommendations.push({
                    type: 'tooling',
                    message: 'No build tool detected. Vite is recommended for Three.js projects',
                    action: 'npm install --save-dev vite',
                    priority: 'medium'
                })
            }

            this.dependencyIssues = issues
            this.recommendations = recommendations

            console.log(`✅ Dependency check complete: ${issues.length} issues, ${recommendations.length} recommendations`)
            
        } catch (error) {
            console.warn('⚠️ Could not check dependencies:', error.message)
        }
    }

    isVersionCompatible(currentVersion, requiredVersion) {
        // Simplified version comparison
        try {
            const current = currentVersion.replace(/[^\d.]/g, '')
            const required = requiredVersion.replace(/[^\d.]/g, '')
            return current >= required
        } catch {
            return false
        }
    }

    async scanForIssues() {
        console.log('🔧 Scanning for common issues...')
        
        const issues = []
        const files = await this.getAllFiles(this.projectPath)
        
        for (const file of files) {
            if (path.extname(file) === '.js' || path.extname(file) === '.ts') {
                try {
                    const content = await fs.readFile(file, 'utf-8')
                    const fileIssues = await this.analyzeFile(file, content)
                    issues.push(...fileIssues)
                } catch (error) {
                    // Skip files we can't read
                }
            }
        }

        this.codeIssues = issues
        console.log(`🎯 Found ${issues.length} potential issues`)
    }

    async analyzeFile(filePath, content) {
        const issues = []
        const relativePath = path.relative(this.projectPath, filePath)

        // Check for common Three.js issues
        if (content.includes('new THREE.')) {
            if (!content.includes('dispose()')) {
                issues.push({
                    file: relativePath,
                    line: this.findLineNumber(content, 'new THREE.'),
                    type: 'memory-leak',
                    message: 'Potential memory leak: Missing dispose() calls',
                    suggestion: 'Add geometry.dispose() and material.dispose() when objects are no longer needed',
                    autoFixable: false
                })
            }
        }

        // Check for performance issues
        if (content.includes('setInterval') || content.includes('setTimeout')) {
            if (content.includes('render') || content.includes('update')) {
                issues.push({
                    file: relativePath,
                    type: 'performance',
                    message: 'Using setTimeout/setInterval for rendering may cause performance issues',
                    suggestion: 'Use requestAnimationFrame for smooth animations',
                    autoFixable: true,
                    fix: 'Replace with requestAnimationFrame loop'
                })
            }
        }

        // Check for missing error handling
        if (content.includes('new THREE.GLTFLoader') && !content.includes('catch')) {
            issues.push({
                file: relativePath,
                type: 'error-handling',
                message: 'Missing error handling for GLTF loader',
                suggestion: 'Add error handling for failed model loading',
                autoFixable: true
            })
        }

        return issues
    }

    findLineNumber(content, searchString) {
        const lines = content.split('\n')
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchString)) {
                return i + 1
            }
        }
        return 1
    }

    async applyAutoFixes() {
        if (!this.config.autoFix) return

        console.log('🔨 Applying automatic fixes...')
        
        const fixableIssues = this.codeIssues.filter(issue => issue.autoFixable)
        const appliedFixes = []

        for (const issue of fixableIssues) {
            try {
                const filePath = path.join(this.projectPath, issue.file)
                const content = await fs.readFile(filePath, 'utf-8')
                
                let fixedContent = content
                
                if (issue.type === 'performance' && issue.fix === 'Replace with requestAnimationFrame loop') {
                    fixedContent = this.fixRenderLoop(content)
                }
                
                if (issue.type === 'error-handling' && issue.message.includes('GLTF loader')) {
                    fixedContent = this.addGLTFErrorHandling(content)
                }
                
                if (fixedContent !== content) {
                    await fs.writeFile(filePath, fixedContent, 'utf-8')
                    appliedFixes.push({
                        file: issue.file,
                        type: issue.type,
                        description: issue.suggestion
                    })
                }
                
            } catch (error) {
                console.warn(`⚠️ Could not apply fix to ${issue.file}:`, error.message)
            }
        }

        if (appliedFixes.length > 0) {
            console.log(`✅ Applied ${appliedFixes.length} automatic fixes`)
            this.emit('fixes-applied', appliedFixes)
        }
    }

    fixRenderLoop(content) {
        // Replace setTimeout/setInterval render loops with requestAnimationFrame
        return content
            .replace(/setInterval\s*\(\s*render\s*,\s*\d+\s*\)/g, 'function animate() { requestAnimationFrame(animate); render(); } animate()')
            .replace(/setTimeout\s*\(\s*render\s*,\s*\d+\s*\)/g, 'requestAnimationFrame(render)')
    }

    addGLTFErrorHandling(content) {
        // Add error handling to GLTF loader calls
        const gltfPattern = /loader\.load\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^,)]+)/g
        
        return content.replace(gltfPattern, (match, url, successCallback) => {
            return `loader.load('${url}', ${successCallback}, undefined, (error) => {
                console.error('Error loading GLTF model:', error);
            })`
        })
    }

    async generateSuggestions() {
        console.log('💡 Generating intelligent suggestions...')
        
        const suggestions = []

        // Project-specific suggestions
        if (this.projectAnalysis.type === 'threejs-project' && !this.projectAnalysis.hasGrudgeStudio) {
            suggestions.push({
                type: 'integration',
                priority: 'high',
                title: 'Upgrade to Grudge Studio',
                description: 'Enhance your Three.js project with Grudge Studio for advanced features',
                benefits: [
                    'Built-in character controllers',
                    'Multiplayer networking',
                    'Procedural terrain generation',
                    'Advanced UI components',
                    'Deployment tools'
                ],
                action: {
                    command: 'npm install grudge-studio',
                    followUp: 'Update imports and integrate Grudge Studio components'
                }
            })
        }

        // Performance suggestions
        if (this.projectAnalysis.files.models > 0) {
            suggestions.push({
                type: 'optimization',
                priority: 'medium',
                title: 'Optimize 3D Models',
                description: 'Improve performance with model optimization techniques',
                benefits: [
                    'Faster loading times',
                    'Better frame rates',
                    'Reduced memory usage'
                ],
                action: {
                    code: this.getModelOptimizationCode(),
                    description: 'Add LOD (Level of Detail) system for models'
                }
            })
        }

        // Security suggestions
        if (this.dependencyIssues.length > 0) {
            suggestions.push({
                type: 'security',
                priority: 'high',
                title: 'Fix Dependency Issues',
                description: 'Update dependencies to fix security vulnerabilities',
                issues: this.dependencyIssues,
                action: {
                    commands: this.dependencyIssues.map(issue => issue.fix)
                }
            })
        }

        this.suggestions = suggestions
        return suggestions
    }

    getGrudgeStudioSetup() {
        return {
            installation: 'npm install grudge-studio',
            basicSetup: `
import { SceneManager, ThirdPersonCamera } from 'grudge-studio/render'
import { ThirdPersonController } from 'grudge-studio/controllers'
import { Vec3 } from 'grudge-studio/core'

const scene = new SceneManager()
const camera = new ThirdPersonCamera()
const controller = new ThirdPersonController()

scene.add(camera)
scene.add(controller)
scene.start()
            `,
            documentation: 'https://molochthegod.github.io/GrudgeStudioNPM/'
        }
    }

    getThreeJSOptimizations() {
        return `
// Performance optimizations for Three.js
const optimizations = {
    // Use object pooling
    objectPool: new Map(),
    
    // Optimize materials
    shareMaterials: (objects) => {
        const materialCache = new Map()
        objects.forEach(obj => {
            if (obj.material) {
                const key = JSON.stringify(obj.material.userData)
                if (materialCache.has(key)) {
                    obj.material = materialCache.get(key)
                } else {
                    materialCache.set(key, obj.material)
                }
            }
        })
    },
    
    // Use instanced rendering for repeated objects
    useInstancedMesh: (geometry, material, count) => {
        return new THREE.InstancedMesh(geometry, material, count)
    },
    
    // Frustum culling
    enableFrustumCulling: (camera, objects) => {
        const frustum = new THREE.Frustum()
        const cameraMatrix = new THREE.Matrix4()
        
        cameraMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(cameraMatrix)
        
        objects.forEach(obj => {
            obj.visible = frustum.intersectsObject(obj)
        })
    }
}
        `
    }

    getShaderSolutions() {
        return `
// Common shader solutions
const shaderHelpers = {
    // Animated vertex shader
    animatedVertexShader: \`
        uniform float time;
        uniform float amplitude;
        
        void main() {
            vec3 pos = position;
            pos.y += sin(pos.x * 10.0 + time) * amplitude;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    \`,
    
    // Particle fragment shader
    particleFragmentShader: \`
        uniform float time;
        uniform vec3 color;
        
        void main() {
            float alpha = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - vec2(0.5)));
            gl_FragColor = vec4(color, alpha);
        }
    \`,
    
    // Water shader
    waterMaterial: new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0x006994) },
            amplitude: { value: 0.1 }
        },
        vertexShader: this.animatedVertexShader,
        fragmentShader: \`
            uniform vec3 color;
            void main() {
                gl_FragColor = vec4(color, 0.8);
            }
        \`
    })
}
        `
    }

    getAnimationSolutions() {
        return `
// Animation system solutions
const animationHelpers = {
    // Smooth animation mixer
    createAnimationMixer: (model) => {
        const mixer = new THREE.AnimationMixer(model)
        const actions = new Map()
        
        model.animations.forEach(clip => {
            const action = mixer.clipAction(clip)
            actions.set(clip.name, action)
        })
        
        return { mixer, actions }
    },
    
    // Tween system
    createTween: (object, targetProperties, duration = 1000) => {
        return new Promise(resolve => {
            const startProperties = {}
            Object.keys(targetProperties).forEach(key => {
                startProperties[key] = object[key]
            })
            
            const startTime = performance.now()
            
            function animate() {
                const elapsed = performance.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                
                Object.keys(targetProperties).forEach(key => {
                    const start = startProperties[key]
                    const target = targetProperties[key]
                    object[key] = start + (target - start) * progress
                })
                
                if (progress < 1) {
                    requestAnimationFrame(animate)
                } else {
                    resolve()
                }
            }
            
            animate()
        })
    }
}
        `
    }

    getNetworkingSolutions() {
        return `
// Networking solutions with Grudge Studio
const networkingHelpers = {
    // Setup multiplayer connection
    setupMultiplayer: async (serverUrl = 'ws://localhost:3000') => {
        const { NetworkManager, StateSync } = await import('grudge-studio/net')
        
        const networkManager = new NetworkManager({
            server: serverUrl,
            compression: true,
            heartbeat: 30000
        })
        
        const stateSync = new StateSync({
            networkManager,
            updateRate: 60
        })
        
        await networkManager.connect()
        return { networkManager, stateSync }
    },
    
    // Sync player position
    syncPlayerPosition: (player, stateSync) => {
        stateSync.registerObject(player.uuid, {
            position: player.position,
            rotation: player.rotation,
            animation: player.currentAnimation
        })
    }
}
        `
    }

    getModelOptimizationCode() {
        return `
// Model optimization system
class ModelOptimizer {
    constructor() {
        this.lodLevels = new Map()
        this.geometryCache = new Map()
    }
    
    // Create LOD (Level of Detail) system
    createLOD(model, distances = [10, 25, 50]) {
        const lod = new THREE.LOD()
        
        // High detail (close)
        lod.addLevel(model, 0)
        
        // Medium detail
        const mediumDetail = this.reduceMeshDetail(model, 0.5)
        lod.addLevel(mediumDetail, distances[0])
        
        // Low detail
        const lowDetail = this.reduceMeshDetail(model, 0.25)
        lod.addLevel(lowDetail, distances[1])
        
        // Billboard (far)
        const billboard = this.createBillboard(model)
        lod.addLevel(billboard, distances[2])
        
        return lod
    }
    
    reduceMeshDetail(model, factor) {
        const reduced = model.clone()
        
        reduced.traverse(child => {
            if (child.isMesh && child.geometry) {
                // Simplified geometry reduction
                const geometry = child.geometry.clone()
                const positions = geometry.attributes.position.array
                const reducedPositions = new Float32Array(positions.length * factor)
                
                for (let i = 0; i < reducedPositions.length; i += 3) {
                    const sourceIndex = Math.floor(i / factor) * 3
                    reducedPositions[i] = positions[sourceIndex]
                    reducedPositions[i + 1] = positions[sourceIndex + 1]
                    reducedPositions[i + 2] = positions[sourceIndex + 2]
                }
                
                geometry.setAttribute('position', new THREE.BufferAttribute(reducedPositions, 3))
                child.geometry = geometry
            }
        })
        
        return reduced
    }
}
        `
    }

    // CLI Interface
    async runInteractive() {
        console.log('🎮 Grudge Studio AI Agent - Interactive Mode')
        console.log('Type "help" for available commands or "exit" to quit\n')
        
        const readline = require('readline')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'grudge-ai> '
        })

        rl.prompt()

        rl.on('line', async (input) => {
            const command = input.trim().toLowerCase()
            
            switch (command) {
                case 'help':
                    this.showHelp()
                    break
                case 'analyze':
                    await this.analyzeProject()
                    console.log('✅ Project analysis complete')
                    break
                case 'suggestions':
                    const suggestions = await this.generateSuggestions()
                    this.displaySuggestions(suggestions)
                    break
                case 'fix':
                    await this.applyAutoFixes()
                    break
                case 'status':
                    this.showStatus()
                    break
                case 'deps':
                    await this.checkDependencies()
                    this.displayDependencyReport()
                    break
                case 'exit':
                    rl.close()
                    return
                default:
                    await this.processNaturalLanguageQuery(input)
            }
            
            rl.prompt()
        })

        rl.on('close', () => {
            console.log('\n👋 Goodbye! Happy coding with Grudge Studio!')
            process.exit(0)
        })
    }

    showHelp() {
        console.log(`
Available Commands:
  analyze     - Analyze project structure and files
  suggestions - Get AI-powered improvement suggestions
  fix         - Apply automatic fixes to common issues
  deps        - Check and update dependencies
  status      - Show current project status
  help        - Show this help message
  exit        - Exit the agent

Natural Language:
  You can also ask questions in natural language:
  "How do I optimize my Three.js performance?"
  "Add multiplayer to my game"
  "Fix shader compilation errors"
        `)
    }

    showStatus() {
        console.log('\n📊 Project Status:')
        console.log(`Name: ${this.projectAnalysis.name}`)
        console.log(`Type: ${this.projectAnalysis.type}`)
        console.log(`Files: ${this.projectAnalysis.files.total} total`)
        console.log(`Frameworks: ${this.projectAnalysis.frameworks.join(', ') || 'None detected'}`)
        console.log(`Issues: ${this.codeIssues?.length || 0}`)
        console.log(`Recommendations: ${this.recommendations?.length || 0}`)
    }

    displaySuggestions(suggestions) {
        if (suggestions.length === 0) {
            console.log('✅ No suggestions at this time. Your project looks good!')
            return
        }

        console.log('\n💡 AI Suggestions:')
        suggestions.forEach((suggestion, index) => {
            console.log(`\n${index + 1}. ${suggestion.title} (${suggestion.priority} priority)`)
            console.log(`   ${suggestion.description}`)
            
            if (suggestion.benefits) {
                console.log('   Benefits:')
                suggestion.benefits.forEach(benefit => {
                    console.log(`     • ${benefit}`)
                })
            }
            
            if (suggestion.action?.command) {
                console.log(`   Action: ${suggestion.action.command}`)
            }
        })
    }

    displayDependencyReport() {
        console.log('\n📦 Dependency Report:')
        
        if (this.dependencyIssues?.length > 0) {
            console.log('❌ Issues:')
            this.dependencyIssues.forEach(issue => {
                console.log(`  • ${issue.message}`)
                console.log(`    Fix: ${issue.fix}`)
            })
        }
        
        if (this.recommendations?.length > 0) {
            console.log('\n💡 Recommendations:')
            this.recommendations.forEach(rec => {
                console.log(`  • ${rec.message}`)
                console.log(`    Action: ${rec.action}`)
            })
        }
        
        if (!this.dependencyIssues?.length && !this.recommendations?.length) {
            console.log('✅ All dependencies are up to date!')
        }
    }

    async processNaturalLanguageQuery(query) {
        console.log('🤔 Processing your question...')
        
        // Simple pattern matching for common queries
        const patterns = Array.from(this.knowledgeBase.values())
        
        for (const pattern of patterns) {
            if (pattern.pattern.test(query)) {
                console.log(`\n💡 Found solution in ${pattern.category} category:`)
                
                if (typeof pattern.solution === 'string') {
                    console.log(pattern.solution)
                } else if (typeof pattern.solution === 'object') {
                    Object.entries(pattern.solution).forEach(([key, value]) => {
                        console.log(`${key}:`)
                        console.log(value)
                        console.log('')
                    })
                }
                return
            }
        }
        
        console.log('❓ I\'m not sure how to help with that. Try asking about:')
        console.log('  • Three.js optimization')
        console.log('  • Shader problems')
        console.log('  • Animation issues')
        console.log('  • Networking setup')
        console.log('  • Grudge Studio integration')
    }

    // Export configuration and fixes
    async exportReport(outputPath = './grudge-studio-report.json') {
        const report = {
            timestamp: new Date().toISOString(),
            project: this.projectAnalysis,
            issues: this.codeIssues,
            suggestions: this.suggestions,
            dependencies: {
                issues: this.dependencyIssues,
                recommendations: this.recommendations
            },
            knowledgeBase: Array.from(this.knowledgeBase.keys())
        }

        try {
            await fs.writeFile(outputPath, JSON.stringify(report, null, 2))
            console.log(`📄 Report exported to ${outputPath}`)
        } catch (error) {
            console.error('❌ Failed to export report:', error)
        }
    }
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
    const agent = new GrudgeStudioAgent({
        projectPath: process.argv[2] || process.cwd(),
        autoFix: process.argv.includes('--auto-fix'),
        learningMode: true
    })
    
    if (process.argv.includes('--interactive')) {
        agent.runInteractive()
    } else {
        agent.on('initialized', async () => {
            await agent.generateSuggestions()
            await agent.applyAutoFixes()
            await agent.exportReport()
            
            console.log('\n🎯 Analysis complete! Run with --interactive for interactive mode.')
        })
    }
}
