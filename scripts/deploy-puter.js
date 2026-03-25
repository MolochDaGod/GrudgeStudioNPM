#!/usr/bin/env node
/**
 * Puter Deployment Script for Grudge Arena
 * 
 * This script handles post-build deployment to Puter.
 * It's designed to be run after `npm run build` and can be
 * integrated with Replit's deployment hooks.
 * 
 * Usage:
 *   node scripts/deploy-puter.js
 * 
 * Or via npm:
 *   npm run deploy:puter
 * 
 * Configuration:
 *   PUTER_SUBDOMAIN - Your puter.site subdomain (default: gruda-code)
 *   PUTER_DIR - Directory name on Puter (default: grudge-arena)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

const CONFIG = {
    subdomain: process.env.PUTER_SUBDOMAIN || 'gruda-code',
    directory: process.env.PUTER_DIR || 'grudge-arena',
    appId: 'app-d563ec46-ba85-4cdb-82ff-3aad2916061e',
    siteUrl: 'https://gruda-code-4zwtk.puter.site'
}

function log(msg, type = 'info') {
    const prefix = {
        info: '\x1b[36m[INFO]\x1b[0m',
        success: '\x1b[32m[SUCCESS]\x1b[0m',
        error: '\x1b[31m[ERROR]\x1b[0m',
        warn: '\x1b[33m[WARN]\x1b[0m'
    }
    console.log(`${prefix[type] || prefix.info} ${msg}`)
}

function checkBuildExists() {
    if (!fs.existsSync(distDir)) {
        log('Build directory not found. Run "npm run build" first.', 'error')
        return false
    }
    
    const indexPath = path.join(distDir, 'index.html')
    if (!fs.existsSync(indexPath)) {
        log('index.html not found in dist/. Build may have failed.', 'error')
        return false
    }
    
    return true
}

function listBuildFiles() {
    const files = []
    
    function walkDir(dir, prefix = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            const relativePath = path.join(prefix, entry.name)
            
            if (entry.isDirectory()) {
                walkDir(fullPath, relativePath)
            } else {
                const stat = fs.statSync(fullPath)
                files.push({
                    path: relativePath,
                    size: stat.size,
                    fullPath: fullPath
                })
            }
        }
    }
    
    walkDir(distDir)
    return files
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function main() {
    console.log('')
    console.log('\x1b[35m╔════════════════════════════════════════╗\x1b[0m')
    console.log('\x1b[35m║     GRUDGE ARENA - PUTER DEPLOYMENT    ║\x1b[0m')
    console.log('\x1b[35m╚════════════════════════════════════════╝\x1b[0m')
    console.log('')
    
    log(`Target subdomain: ${CONFIG.subdomain}`)
    log(`Target directory: ${CONFIG.directory}`)
    log(`Site URL: ${CONFIG.siteUrl}`)
    console.log('')
    
    if (!checkBuildExists()) {
        process.exit(1)
    }
    
    const files = listBuildFiles()
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    
    log(`Found ${files.length} files to deploy (${formatSize(totalSize)})`)
    console.log('')
    
    console.log('\x1b[33mFiles to deploy:\x1b[0m')
    files.slice(0, 10).forEach(f => {
        console.log(`  - ${f.path} (${formatSize(f.size)})`)
    })
    if (files.length > 10) {
        console.log(`  ... and ${files.length - 10} more files`)
    }
    console.log('')
    
    log('Build is ready for deployment!', 'success')
    console.log('')
    console.log('\x1b[36mTo deploy to Puter:\x1b[0m')
    console.log('  1. Open your app in browser')
    console.log('  2. Navigate to /deploy-puter.html')
    console.log('  3. Click "Deploy to Puter" button')
    console.log('  4. Authenticate with your Puter account')
    console.log('')
    console.log('\x1b[36mOr manually:\x1b[0m')
    console.log('  1. Go to https://puter.com')
    console.log('  2. Upload the dist/ folder')
    console.log('  3. Right-click -> "Publish as Website"')
    console.log('')
    
    log('Deployment preparation complete!', 'success')
}

main().catch(err => {
    log(`Deployment failed: ${err.message}`, 'error')
    process.exit(1)
})
