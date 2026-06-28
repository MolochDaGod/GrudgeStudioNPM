import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

const pagesBase = {
  pages: '/GrudgeStudioNPM/',
  root: '/',
}

export default defineConfig(({ mode }) => ({
  plugins: [
    glsl(),
    wasm(),
    topLevelAwait()
  ],
  base: pagesBase[mode] ?? '/',
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/assets': {
        target: 'https://assets.grudge-studio.com',
        changeOrigin: true,
        secure: true,
      },
      '/anims': {
        target: 'https://assets.grudge-studio.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        editor: 'editor.html',
        playground: 'playground.html',
        viewer: 'viewer.html',
        characterBuilder: 'character-builder.html',
        skillTree: 'skill-tree.html',
        deployPuter: 'deploy-puter.html'
      }
    },
    copyPublicDir: true,
    target: 'esnext'
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat']
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0')
  }
}))
