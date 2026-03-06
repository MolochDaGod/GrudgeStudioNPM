/**
 * AnimationConverter.js — Grudge Studio FBX → GLB Animation Conversion Tool
 *
 * Provides batch and single-file conversion of FBX animation files to
 * web-ready GLB format using Facebook's fbx2gltf.
 *
 * USAGE (as module):
 *   import { AnimationConverter } from 'grudge-studio/assets'
 *
 *   const converter = new AnimationConverter({ framerate: 'bake30' })
 *   await converter.convert('path/to/anim.fbx', 'path/to/anim.glb')
 *   await converter.convertDirectory('path/to/fbx-folder/', 'path/to/output/')
 *
 * USAGE (CLI via grudge-studio):
 *   npx grudge-convert-anims --input ./model/animations --framerate bake60
 *
 * REQUIRES: npm install fbx2gltf
 */

export class AnimationConverter {
  /**
   * @param {object} options
   * @param {string} [options.framerate='bake30'] - Animation bake rate: bake24, bake30, bake60
   * @param {boolean} [options.binary=true] - Output GLB (true) or GLTF (false)
   * @param {boolean} [options.computeNormals=false] - Compute vertex normals
   * @param {string[]} [options.extraArgs=[]] - Additional fbx2gltf CLI args
   * @param {function} [options.onProgress] - Callback(file, index, total)
   * @param {function} [options.onError] - Callback(file, error)
   */
  constructor(options = {}) {
    this.framerate = options.framerate ?? 'bake30'
    this.binary = options.binary ?? true
    this.computeNormals = options.computeNormals ?? false
    this.extraArgs = options.extraArgs ?? []
    this.onProgress = options.onProgress ?? null
    this.onError = options.onError ?? null

    this._converter = null
    this._fs = null
    this._path = null
  }

  /**
   * Lazy-load Node.js dependencies (allows this file to exist in browser bundles
   * without crashing — it just won't work until called in Node)
   */
  async _ensureDeps() {
    if (this._converter) return

    try {
      // Dynamic imports for Node.js environment
      const fbx2gltf = await import('fbx2gltf')
      this._converter = fbx2gltf.default || fbx2gltf
      const fs = await import('fs')
      this._fs = fs.default || fs
      const path = await import('path')
      this._path = path.default || path
    } catch (err) {
      throw new Error(
        'AnimationConverter requires Node.js with `fbx2gltf` installed. ' +
        'Run: npm install fbx2gltf\n' + err.message
      )
    }
  }

  /**
   * Build CLI args array for fbx2gltf
   */
  _buildArgs() {
    const args = []
    if (this.binary) args.push('--binary')
    args.push('--anim-framerate', this.framerate)
    if (this.computeNormals) args.push('--compute-normals', 'missing')
    args.push(...this.extraArgs)
    return args
  }

  /**
   * Convert a single FBX file to GLB/GLTF.
   *
   * @param {string} srcPath - Path to source .fbx file
   * @param {string} [destPath] - Path to output .glb/.gltf file (auto-generated if omitted)
   * @returns {Promise<{ src: string, dest: string, duration: number }>}
   */
  async convert(srcPath, destPath) {
    await this._ensureDeps()

    if (!destPath) {
      const ext = this.binary ? '.glb' : '.gltf'
      const dir = this._path.dirname(srcPath)
      const base = this._path.basename(srcPath, this._path.extname(srcPath))
      destPath = this._path.join(dir, base + ext)
    }

    const start = Date.now()
    const args = this._buildArgs()

    try {
      const result = await this._converter(srcPath, destPath, args)
      return {
        src: srcPath,
        dest: result || destPath,
        duration: Date.now() - start,
      }
    } catch (err) {
      const error = new Error(`Failed to convert ${srcPath}: ${err.message || err}`)
      error.srcPath = srcPath
      error.originalError = err
      throw error
    }
  }

  /**
   * Batch convert all FBX files in a directory.
   *
   * @param {string} inputDir - Directory containing .fbx files
   * @param {string} [outputDir] - Output directory (defaults to same as input)
   * @param {object} [options]
   * @param {boolean} [options.recursive=true] - Search subdirectories
   * @param {boolean} [options.skipExisting=true] - Skip if GLB is newer than FBX
   * @param {boolean} [options.cleanFbx=false] - Delete FBX after successful conversion
   * @returns {Promise<{ converted: Array, failed: Array, skipped: Array }>}
   */
  async convertDirectory(inputDir, outputDir, options = {}) {
    await this._ensureDeps()

    const recursive = options.recursive ?? true
    const skipExisting = options.skipExisting ?? true
    const cleanFbx = options.cleanFbx ?? false

    outputDir = outputDir || inputDir

    // Find all FBX files
    const fbxFiles = this._findFiles(inputDir, '.fbx', recursive)
    const results = { converted: [], failed: [], skipped: [] }

    for (let i = 0; i < fbxFiles.length; i++) {
      const fbxPath = fbxFiles[i]
      const relativePath = this._path.relative(inputDir, fbxPath)
      const ext = this.binary ? '.glb' : '.gltf'
      const destPath = this._path.join(
        outputDir,
        relativePath.replace(/\.fbx$/i, ext)
      )

      // Ensure output subdirectory exists
      const destDir = this._path.dirname(destPath)
      if (!this._fs.existsSync(destDir)) {
        this._fs.mkdirSync(destDir, { recursive: true })
      }

      // Skip if output is newer
      if (skipExisting && this._fs.existsSync(destPath)) {
        const srcStat = this._fs.statSync(fbxPath)
        const destStat = this._fs.statSync(destPath)
        if (destStat.mtimeMs > srcStat.mtimeMs) {
          results.skipped.push({ src: fbxPath, dest: destPath })
          this.onProgress?.(fbxPath, i + 1, fbxFiles.length, 'skipped')
          continue
        }
      }

      try {
        const result = await this.convert(fbxPath, destPath)
        results.converted.push(result)
        this.onProgress?.(fbxPath, i + 1, fbxFiles.length, 'converted')

        if (cleanFbx) {
          this._fs.unlinkSync(fbxPath)
        }
      } catch (err) {
        results.failed.push({ src: fbxPath, error: err.message })
        this.onError?.(fbxPath, err)
        this.onProgress?.(fbxPath, i + 1, fbxFiles.length, 'failed')
      }
    }

    return results
  }

  /**
   * Convert all FBX files in multiple weapon-style animation folders.
   * Designed for the modular weapon system animation packs.
   *
   * @param {string} animBaseDir - Base animations directory (e.g. model/animations/)
   * @param {string[]} [folders] - Specific folder names to convert (null = all)
   * @param {object} [options] - Same as convertDirectory options
   * @returns {Promise<object>} Results per folder
   */
  async convertWeaponAnimations(animBaseDir, folders, options = {}) {
    await this._ensureDeps()

    // Auto-detect folders if not specified
    if (!folders) {
      folders = this._fs.readdirSync(animBaseDir).filter(f =>
        this._fs.statSync(this._path.join(animBaseDir, f)).isDirectory()
      )
    }

    const allResults = {}

    for (const folder of folders) {
      const folderPath = this._path.join(animBaseDir, folder)
      if (!this._fs.existsSync(folderPath)) {
        console.warn(`AnimationConverter: Folder not found: ${folderPath}`)
        continue
      }

      console.log(`  Converting [${folder}]...`)
      allResults[folder] = await this.convertDirectory(folderPath, null, options)

      const r = allResults[folder]
      console.log(`    ✓ ${r.converted.length} converted, ${r.skipped.length} skipped, ${r.failed.length} failed`)
    }

    return allResults
  }

  /**
   * Recursively find files with a given extension.
   */
  _findFiles(dir, ext, recursive) {
    const results = []
    const entries = this._fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = this._path.join(dir, entry.name)
      if (entry.isDirectory() && recursive) {
        results.push(...this._findFiles(full, ext, recursive))
      } else if (entry.name.toLowerCase().endsWith(ext)) {
        results.push(full)
      }
    }
    return results
  }
}
