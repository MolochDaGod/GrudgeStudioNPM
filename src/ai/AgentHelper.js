/*
    GRUDGE Studio - AI Agent Helper
    LLM-based assistant for game development (inspired by PRAI)
*/

export const AgentStepType = {
    ANALYZE: 'analyze',
    GENERATE: 'generate',
    VALIDATE: 'validate',
    EXECUTE: 'execute'
}

export class AgentHistory {
    constructor() {
        this.messages = []
        this.steps = []
        this.context = new Map()
    }
    
    addMessage(role, content) {
        const message = {
            id: crypto.randomUUID(),
            role,
            content,
            timestamp: Date.now()
        }
        this.messages.push(message)
        return message
    }
    
    addStep(step) {
        const stepEntry = {
            id: crypto.randomUUID(),
            type: step.type,
            input: step.input,
            output: step.output,
            duration: step.duration,
            timestamp: Date.now()
        }
        this.steps.push(stepEntry)
        return stepEntry
    }
    
    setContext(key, value) {
        this.context.set(key, value)
    }
    
    getContext(key) {
        return this.context.get(key)
    }
    
    getMessages(limit = 10) {
        return this.messages.slice(-limit)
    }
    
    getSteps(limit = 5) {
        return this.steps.slice(-limit)
    }
    
    buildPromptContext() {
        const recentMessages = this.getMessages(5)
        const recentSteps = this.getSteps(3)
        
        let context = ''
        
        if (recentMessages.length > 0) {
            context += 'Recent conversation:\n'
            recentMessages.forEach(m => {
                context += `${m.role}: ${m.content}\n`
            })
        }
        
        if (recentSteps.length > 0) {
            context += '\nRecent actions:\n'
            recentSteps.forEach(s => {
                context += `- ${s.type}: ${s.input?.substring(0, 100)}...\n`
            })
        }
        
        return context
    }
    
    clear() {
        this.messages = []
        this.steps = []
        this.context.clear()
    }
    
    serialize() {
        return {
            messages: this.messages,
            steps: this.steps,
            context: Object.fromEntries(this.context)
        }
    }
    
    deserialize(data) {
        this.messages = data.messages || []
        this.steps = data.steps || []
        this.context = new Map(Object.entries(data.context || {}))
    }
}

export class AgentStepConfig {
    constructor(config) {
        this.type = config.type || 'generic'
        this.prompt = config.prompt || ''
        this.schema = config.schema || null
        this.examples = config.examples || []
        this.maxRetries = config.maxRetries || 3
    }
    
    buildPrompt(context = {}) {
        let prompt = this.prompt
        
        Object.entries(context).forEach(([key, value]) => {
            prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
        })
        
        if (this.schema) {
            prompt += `\n\nExpected output format:\n${JSON.stringify(this.schema, null, 2)}`
        }
        
        if (this.examples.length > 0) {
            prompt += '\n\nExamples:'
            this.examples.forEach((example, i) => {
                prompt += `\n${i + 1}. Input: ${example.input} -> Output: ${JSON.stringify(example.output)}`
            })
        }
        
        return prompt
    }
}

export class AgentHelper {
    constructor(config = {}) {
        this.history = new AgentHistory()
        this.aiProvider = config.aiProvider || 'puter'
        this.model = config.model || 'gpt-4o-mini'
        this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt()
        
        this.isProcessing = false
        this.onProgress = config.onProgress || null
        this.onComplete = config.onComplete || null
        this.onError = config.onError || null
    }
    
    getDefaultSystemPrompt() {
        return `You are GRUDGE Studio AI Assistant, helping developers create 3D games.
You have access to the GRUDGE SDK which includes:
- Three.js for 3D rendering
- Rapier physics engine
- Component-based entity system
- Visual node graph editor
- Timeline animation system
- Asset management
- AI pathfinding

When generating code:
- Use ES6+ JavaScript
- Import from the SDK modules
- Follow existing code patterns
- Include helpful comments

Available SDK imports:
- import * as THREE from 'three'
- import { ArenaEntity } from './arena/ArenaEntity.js'
- import { Component } from './core/Component.js'
- import { NodeGraph } from './editor/NodeGraph.js'
- import { Timeline } from './editor/Timeline.js'`
    }
    
    async chat(userMessage) {
        if (this.isProcessing) {
            return { error: 'Already processing a request' }
        }
        
        this.isProcessing = true
        this.history.addMessage('user', userMessage)
        
        try {
            const response = await this.callAI(userMessage)
            this.history.addMessage('assistant', response)
            
            this.onComplete?.(response)
            return { success: true, response }
        } catch (error) {
            this.onError?.(error)
            return { success: false, error: error.message }
        } finally {
            this.isProcessing = false
        }
    }
    
    async executeStep(stepConfig, context = {}) {
        const step = stepConfig instanceof AgentStepConfig ? stepConfig : new AgentStepConfig(stepConfig)
        const startTime = Date.now()
        
        this.onProgress?.({ step: step.type, status: 'started' })
        
        try {
            const prompt = step.buildPrompt(context)
            const response = await this.callAI(prompt)
            
            let output = response
            
            if (step.schema) {
                try {
                    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/)
                    if (jsonMatch) {
                        output = JSON.parse(jsonMatch[1])
                    } else if (response.startsWith('{') || response.startsWith('[')) {
                        output = JSON.parse(response)
                    }
                } catch (e) {
                    console.warn('Failed to parse JSON response:', e)
                }
            }
            
            const stepEntry = this.history.addStep({
                type: step.type,
                input: prompt.substring(0, 200),
                output: typeof output === 'string' ? output.substring(0, 500) : output,
                duration: Date.now() - startTime
            })
            
            this.onProgress?.({ step: step.type, status: 'completed', duration: stepEntry.duration })
            
            return { success: true, output }
        } catch (error) {
            this.onProgress?.({ step: step.type, status: 'failed', error: error.message })
            return { success: false, error: error.message }
        }
    }
    
    async generateScript(description, type = 'component') {
        const templates = {
            component: {
                type: AgentStepType.GENERATE,
                prompt: `Generate a GRUDGE SDK component for: {description}
                
Use this template:
\`\`\`javascript
import * as THREE from 'three'
import { Component } from '../core/Component.js'

export class {ClassName} extends Component {
    awake() {
        // Initialize component
    }
    
    start() {
        // Called when entity is ready
    }
    
    update(deltaTime) {
        // Called every frame
    }
}
\`\`\``,
                schema: { code: 'string', className: 'string', description: 'string' }
            },
            entity: {
                type: AgentStepType.GENERATE,
                prompt: `Generate a GRUDGE SDK entity configuration for: {description}
                
The entity should have appropriate stats, behaviors, and visual appearance.`,
                schema: { 
                    type: 'string',
                    stats: 'object',
                    behaviors: 'array',
                    appearance: 'object'
                }
            },
            scene: {
                type: AgentStepType.GENERATE,
                prompt: `Generate a Three.js scene setup for: {description}
                
Include lighting, environment, and any necessary objects.`,
                schema: {
                    lights: 'array',
                    objects: 'array',
                    environment: 'object'
                }
            }
        }
        
        const template = templates[type] || templates.component
        
        return this.executeStep(template, { description })
    }
    
    async analyzeCode(code) {
        return this.executeStep({
            type: AgentStepType.ANALYZE,
            prompt: `Analyze this code and provide:
1. What it does
2. Potential issues
3. Suggestions for improvement

Code:
\`\`\`javascript
${code}
\`\`\``,
            schema: {
                summary: 'string',
                issues: 'array',
                suggestions: 'array'
            }
        })
    }
    
    async suggestFeatures(context) {
        return this.executeStep({
            type: AgentStepType.ANALYZE,
            prompt: `Based on this game context, suggest 5 features to add:

Context: ${context}

For each feature, provide:
- Name
- Description
- Difficulty (easy/medium/hard)
- Estimated time`,
            schema: {
                features: [{
                    name: 'string',
                    description: 'string',
                    difficulty: 'string',
                    estimatedTime: 'string'
                }]
            }
        })
    }
    
    async callAI(prompt) {
        const contextPrompt = this.history.buildPromptContext()
        const fullPrompt = contextPrompt ? `${contextPrompt}\n\nCurrent request: ${prompt}` : prompt
        
        if (typeof window !== 'undefined' && window.puter?.ai) {
            const response = await window.puter.ai.chat(fullPrompt, {
                model: this.model,
                system: this.systemPrompt
            })
            return response.message?.content || response
        }
        
        return this.mockResponse(prompt)
    }
    
    mockResponse(prompt) {
        if (prompt.includes('component') || prompt.includes('script')) {
            return `\`\`\`javascript
import * as THREE from 'three'
import { Component } from '../core/Component.js'

export class GeneratedComponent extends Component {
    awake() {
        this.speed = 5
        this.direction = new THREE.Vector3()
    }
    
    update(deltaTime) {
        // Add your logic here
        if (this.entity) {
            this.entity.group.rotation.y += deltaTime * 0.5
        }
    }
}
\`\`\``
        }
        
        return 'I can help you with game development! Try asking me to generate components, analyze code, or suggest features.'
    }
    
    setSystemPrompt(prompt) {
        this.systemPrompt = prompt
    }
    
    setModel(model) {
        this.model = model
    }
    
    clearHistory() {
        this.history.clear()
    }
}

export const agentHelper = new AgentHelper()
export default AgentHelper
