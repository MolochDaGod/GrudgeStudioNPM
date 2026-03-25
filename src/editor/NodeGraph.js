/*
    GRUDGE Studio - Node Graph System
    Visual programming interface inspired by ThreeNodes.js
*/

export class Port {
    constructor(node, config) {
        this.node = node
        this.name = config.name
        this.type = config.type || 'any'
        this.direction = config.direction
        this.value = config.default !== undefined ? config.default : null
        this.connections = []
        this.element = null
    }
    
    get isInput() {
        return this.direction === 'input'
    }
    
    get isOutput() {
        return this.direction === 'output'
    }
    
    get isConnected() {
        return this.connections.length > 0
    }
    
    canConnectTo(other) {
        if (this.direction === other.direction) return false
        if (this.node === other.node) return false
        if (this.type !== 'any' && other.type !== 'any' && this.type !== other.type) return false
        return true
    }
    
    getValue() {
        if (this.isInput && this.isConnected) {
            const conn = this.connections[0]
            return conn.from.getValue()
        }
        return this.value
    }
    
    setValue(value) {
        this.value = value
        if (this.isOutput) {
            this.connections.forEach(conn => {
                conn.to.node.onInputChanged?.(conn.to.name, value)
            })
        }
    }
}

export class Connection {
    constructor(from, to) {
        this.id = crypto.randomUUID()
        this.from = from
        this.to = to
        this.element = null
    }
    
    disconnect() {
        const fromIdx = this.from.connections.indexOf(this)
        if (fromIdx > -1) this.from.connections.splice(fromIdx, 1)
        
        const toIdx = this.to.connections.indexOf(this)
        if (toIdx > -1) this.to.connections.splice(toIdx, 1)
    }
}

export class Node {
    constructor(graph, config = {}) {
        this.graph = graph
        this.id = config.id || crypto.randomUUID()
        this.type = config.type || 'Generic'
        this.name = config.name || this.type
        this.x = config.x || 100
        this.y = config.y || 100
        this.width = config.width || 180
        this.collapsed = false
        this.selected = false
        this.element = null
        this.executeFunc = config.executeFunc || null
        
        this.inputs = new Map()
        this.outputs = new Map()
        
        this.color = config.color || '#4a5568'
        this.icon = config.icon || '◆'
        
        if (config.inputs) {
            config.inputs.forEach(input => this.addInput(input))
        }
        if (config.outputs) {
            config.outputs.forEach(output => this.addOutput(output))
        }
    }
    
    addInput(config) {
        const port = new Port(this, { ...config, direction: 'input' })
        this.inputs.set(config.name, port)
        return port
    }
    
    addOutput(config) {
        const port = new Port(this, { ...config, direction: 'output' })
        this.outputs.set(config.name, port)
        return port
    }
    
    getInput(name) {
        return this.inputs.get(name)
    }
    
    getOutput(name) {
        return this.outputs.get(name)
    }
    
    getInputValue(name) {
        const port = this.inputs.get(name)
        return port ? port.getValue() : null
    }
    
    setOutputValue(name, value) {
        const port = this.outputs.get(name)
        if (port) port.setValue(value)
    }
    
    execute() {
        if (this.executeFunc) {
            this.executeFunc(this)
        }
    }
    
    onInputChanged(portName, value) {
        this.execute()
    }
    
    serialize() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            x: this.x,
            y: this.y,
            inputs: Array.from(this.inputs.entries()).map(([name, port]) => ({
                name,
                value: port.value
            }))
        }
    }
    
    deserialize(data) {
        this.x = data.x
        this.y = data.y
        this.name = data.name
        
        if (data.inputs) {
            data.inputs.forEach(input => {
                const port = this.inputs.get(input.name)
                if (port) port.value = input.value
            })
        }
    }
}

export class NodeGraph {
    constructor() {
        this.nodes = new Map()
        this.connections = []
        this.nodeTypes = new Map()
        
        this.registerBuiltinNodes()
    }
    
    registerNodeType(type, factory) {
        this.nodeTypes.set(type, factory)
    }
    
    registerBuiltinNodes() {
        this.registerNodeType('Number', (graph) => new Node(graph, {
            type: 'Number',
            color: '#2563eb',
            icon: '#',
            inputs: [{ name: 'value', type: 'number', default: 0 }],
            outputs: [{ name: 'out', type: 'number' }],
            executeFunc: (node) => {
                node.setOutputValue('out', node.getInputValue('value') || 0)
            }
        }))
        
        this.registerNodeType('Math', (graph) => new Node(graph, {
            type: 'Math',
            color: '#7c3aed',
            icon: '±',
            inputs: [
                { name: 'a', type: 'number', default: 0 },
                { name: 'b', type: 'number', default: 0 },
                { name: 'operation', type: 'string', default: 'add' }
            ],
            outputs: [{ name: 'result', type: 'number' }],
            executeFunc: (node) => {
                const a = node.getInputValue('a') || 0
                const b = node.getInputValue('b') || 0
                const op = node.getInputValue('operation') || 'add'
                let result = 0
                switch (op) {
                    case 'add': result = a + b; break
                    case 'subtract': result = a - b; break
                    case 'multiply': result = a * b; break
                    case 'divide': result = b !== 0 ? a / b : 0; break
                    case 'power': result = Math.pow(a, b); break
                    case 'modulo': result = a % b; break
                }
                node.setOutputValue('result', result)
            }
        }))
        
        this.registerNodeType('Vector3', (graph) => new Node(graph, {
            type: 'Vector3',
            color: '#059669',
            icon: '→',
            inputs: [
                { name: 'x', type: 'number', default: 0 },
                { name: 'y', type: 'number', default: 0 },
                { name: 'z', type: 'number', default: 0 }
            ],
            outputs: [{ name: 'vector', type: 'vector3' }],
            executeFunc: (node) => {
                node.setOutputValue('vector', {
                    x: node.getInputValue('x') || 0,
                    y: node.getInputValue('y') || 0,
                    z: node.getInputValue('z') || 0
                })
            }
        }))
        
        this.registerNodeType('Color', (graph) => new Node(graph, {
            type: 'Color',
            color: '#dc2626',
            icon: '●',
            inputs: [
                { name: 'r', type: 'number', default: 1 },
                { name: 'g', type: 'number', default: 1 },
                { name: 'b', type: 'number', default: 1 }
            ],
            outputs: [{ name: 'color', type: 'color' }],
            executeFunc: (node) => {
                node.setOutputValue('color', {
                    r: Math.max(0, Math.min(1, node.getInputValue('r') || 1)),
                    g: Math.max(0, Math.min(1, node.getInputValue('g') || 1)),
                    b: Math.max(0, Math.min(1, node.getInputValue('b') || 1))
                })
            }
        }))
        
        this.registerNodeType('Time', (graph) => new Node(graph, {
            type: 'Time',
            color: '#0891b2',
            icon: '⏱',
            outputs: [
                { name: 'time', type: 'number' },
                { name: 'delta', type: 'number' },
                { name: 'frame', type: 'number' }
            ],
            executeFunc: (node) => {
                node.setOutputValue('time', performance.now() / 1000)
                node.setOutputValue('delta', 1/60)
                node.setOutputValue('frame', Math.floor(performance.now() / (1000/60)))
            }
        }))
        
        this.registerNodeType('Sine', (graph) => new Node(graph, {
            type: 'Sine',
            color: '#6366f1',
            icon: '∿',
            inputs: [
                { name: 'value', type: 'number', default: 0 },
                { name: 'amplitude', type: 'number', default: 1 },
                { name: 'frequency', type: 'number', default: 1 }
            ],
            outputs: [{ name: 'out', type: 'number' }],
            executeFunc: (node) => {
                const val = node.getInputValue('value') || 0
                const amp = node.getInputValue('amplitude') || 1
                const freq = node.getInputValue('frequency') || 1
                node.setOutputValue('out', Math.sin(val * freq) * amp)
            }
        }))
        
        this.registerNodeType('Transform', (graph) => new Node(graph, {
            type: 'Transform',
            color: '#f59e0b',
            icon: '⊕',
            inputs: [
                { name: 'position', type: 'vector3' },
                { name: 'rotation', type: 'vector3' },
                { name: 'scale', type: 'vector3' }
            ],
            outputs: [{ name: 'transform', type: 'transform' }],
            executeFunc: (node) => {
                node.setOutputValue('transform', {
                    position: node.getInputValue('position') || { x: 0, y: 0, z: 0 },
                    rotation: node.getInputValue('rotation') || { x: 0, y: 0, z: 0 },
                    scale: node.getInputValue('scale') || { x: 1, y: 1, z: 1 }
                })
            }
        }))
        
        this.registerNodeType('Mesh', (graph) => new Node(graph, {
            type: 'Mesh',
            color: '#10b981',
            icon: '◇',
            inputs: [
                { name: 'geometry', type: 'geometry' },
                { name: 'material', type: 'material' },
                { name: 'transform', type: 'transform' }
            ],
            outputs: [{ name: 'mesh', type: 'object3d' }],
            executeFunc: (node) => {
                node.setOutputValue('mesh', {
                    type: 'Mesh',
                    geometry: node.getInputValue('geometry'),
                    material: node.getInputValue('material'),
                    transform: node.getInputValue('transform')
                })
            }
        }))
        
        this.registerNodeType('BoxGeometry', (graph) => new Node(graph, {
            type: 'BoxGeometry',
            color: '#64748b',
            icon: '□',
            inputs: [
                { name: 'width', type: 'number', default: 1 },
                { name: 'height', type: 'number', default: 1 },
                { name: 'depth', type: 'number', default: 1 }
            ],
            outputs: [{ name: 'geometry', type: 'geometry' }],
            executeFunc: (node) => {
                node.setOutputValue('geometry', {
                    type: 'BoxGeometry',
                    width: node.getInputValue('width') || 1,
                    height: node.getInputValue('height') || 1,
                    depth: node.getInputValue('depth') || 1
                })
            }
        }))
        
        this.registerNodeType('SphereGeometry', (graph) => new Node(graph, {
            type: 'SphereGeometry',
            color: '#64748b',
            icon: '○',
            inputs: [
                { name: 'radius', type: 'number', default: 1 },
                { name: 'segments', type: 'number', default: 32 }
            ],
            outputs: [{ name: 'geometry', type: 'geometry' }],
            executeFunc: (node) => {
                node.setOutputValue('geometry', {
                    type: 'SphereGeometry',
                    radius: node.getInputValue('radius') || 1,
                    segments: node.getInputValue('segments') || 32
                })
            }
        }))
        
        this.registerNodeType('StandardMaterial', (graph) => new Node(graph, {
            type: 'StandardMaterial',
            color: '#8b5cf6',
            icon: '◉',
            inputs: [
                { name: 'color', type: 'color' },
                { name: 'roughness', type: 'number', default: 0.5 },
                { name: 'metalness', type: 'number', default: 0 }
            ],
            outputs: [{ name: 'material', type: 'material' }],
            executeFunc: (node) => {
                node.setOutputValue('material', {
                    type: 'MeshStandardMaterial',
                    color: node.getInputValue('color') || { r: 1, g: 1, b: 1 },
                    roughness: node.getInputValue('roughness') || 0.5,
                    metalness: node.getInputValue('metalness') || 0
                })
            }
        }))
        
        this.registerNodeType('Scene', (graph) => new Node(graph, {
            type: 'Scene',
            color: '#1e3a8a',
            icon: '🎬',
            inputs: [
                { name: 'objects', type: 'object3d' },
                { name: 'background', type: 'color' }
            ],
            outputs: [{ name: 'scene', type: 'scene' }],
            executeFunc: (node) => {
                node.setOutputValue('scene', {
                    type: 'Scene',
                    objects: node.getInputValue('objects'),
                    background: node.getInputValue('background')
                })
            }
        }))
        
        this.registerNodeType('Renderer', (graph) => new Node(graph, {
            type: 'Renderer',
            color: '#be185d',
            icon: '🖥',
            inputs: [
                { name: 'scene', type: 'scene' },
                { name: 'camera', type: 'camera' }
            ]
        }))
    }
    
    createNode(type, x = 100, y = 100) {
        const factory = this.nodeTypes.get(type)
        if (!factory) {
            console.warn(`Unknown node type: ${type}`)
            return null
        }
        
        const node = factory(this)
        node.x = x
        node.y = y
        this.nodes.set(node.id, node)
        
        return node
    }
    
    removeNode(nodeId) {
        const node = this.nodes.get(nodeId)
        if (!node) return
        
        this.connections = this.connections.filter(conn => {
            if (conn.from.node === node || conn.to.node === node) {
                conn.disconnect()
                return false
            }
            return true
        })
        
        this.nodes.delete(nodeId)
    }
    
    connect(fromNode, fromPortName, toNode, toPortName) {
        const from = fromNode.getOutput(fromPortName)
        const to = toNode.getInput(toPortName)
        
        if (!from || !to) {
            console.warn('Invalid ports for connection')
            return null
        }
        
        if (!from.canConnectTo(to)) {
            console.warn('Cannot connect these ports')
            return null
        }
        
        if (to.isConnected) {
            const existingConn = to.connections[0]
            this.disconnect(existingConn.id)
        }
        
        const connection = new Connection(from, to)
        from.connections.push(connection)
        to.connections.push(connection)
        this.connections.push(connection)
        
        to.node.onInputChanged?.(toPortName, from.getValue())
        
        return connection
    }
    
    disconnect(connectionId) {
        const index = this.connections.findIndex(c => c.id === connectionId)
        if (index > -1) {
            const conn = this.connections[index]
            conn.disconnect()
            this.connections.splice(index, 1)
        }
    }
    
    getNodeTypes() {
        return Array.from(this.nodeTypes.keys())
    }
    
    execute() {
        for (const node of this.nodes.values()) {
            node.execute()
        }
    }
    
    serialize() {
        return {
            nodes: Array.from(this.nodes.values()).map(n => n.serialize()),
            connections: this.connections.map(c => ({
                id: c.id,
                from: { node: c.from.node.id, port: c.from.name },
                to: { node: c.to.node.id, port: c.to.name }
            }))
        }
    }
    
    deserialize(data) {
        this.clear()
        
        data.nodes.forEach(nodeData => {
            const node = this.createNode(nodeData.type, nodeData.x, nodeData.y)
            if (node) {
                node.id = nodeData.id
                node.deserialize(nodeData)
                this.nodes.set(node.id, node)
            }
        })
        
        data.connections.forEach(connData => {
            const fromNode = this.nodes.get(connData.from.node)
            const toNode = this.nodes.get(connData.to.node)
            if (fromNode && toNode) {
                this.connect(fromNode, connData.from.port, toNode, connData.to.port)
            }
        })
    }
    
    clear() {
        this.connections.forEach(c => c.disconnect())
        this.connections = []
        this.nodes.clear()
    }
    
    toCode() {
        const lines = [
            '// Generated by GRUDGE Studio Node Graph',
            'import * as THREE from "three";',
            '',
            'export function createScene() {',
            '    const scene = new THREE.Scene();',
            ''
        ]
        
        const sortedNodes = this.topologicalSort()
        const varNames = new Map()
        
        sortedNodes.forEach((node, i) => {
            const varName = `${node.type.toLowerCase()}_${i}`
            varNames.set(node.id, varName)
            
            switch (node.type) {
                case 'BoxGeometry':
                    lines.push(`    const ${varName} = new THREE.BoxGeometry(${node.getInputValue('width')}, ${node.getInputValue('height')}, ${node.getInputValue('depth')});`)
                    break
                case 'SphereGeometry':
                    lines.push(`    const ${varName} = new THREE.SphereGeometry(${node.getInputValue('radius')}, ${node.getInputValue('segments')});`)
                    break
                case 'StandardMaterial':
                    lines.push(`    const ${varName} = new THREE.MeshStandardMaterial({ roughness: ${node.getInputValue('roughness')}, metalness: ${node.getInputValue('metalness')} });`)
                    break
                case 'Mesh':
                    const geoPort = node.getInput('geometry')
                    const matPort = node.getInput('material')
                    const geoVar = geoPort?.isConnected ? varNames.get(geoPort.connections[0].from.node.id) : 'undefined'
                    const matVar = matPort?.isConnected ? varNames.get(matPort.connections[0].from.node.id) : 'undefined'
                    lines.push(`    const ${varName} = new THREE.Mesh(${geoVar}, ${matVar});`)
                    lines.push(`    scene.add(${varName});`)
                    break
            }
        })
        
        lines.push('')
        lines.push('    return scene;')
        lines.push('}')
        
        return lines.join('\n')
    }
    
    topologicalSort() {
        const visited = new Set()
        const result = []
        
        const visit = (node) => {
            if (visited.has(node.id)) return
            visited.add(node.id)
            
            node.inputs.forEach(port => {
                if (port.isConnected) {
                    visit(port.connections[0].from.node)
                }
            })
            
            result.push(node)
        }
        
        this.nodes.forEach(node => visit(node))
        
        return result
    }
}

export const nodeGraph = new NodeGraph()
export default NodeGraph
