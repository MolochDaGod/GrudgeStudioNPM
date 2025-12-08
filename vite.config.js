import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isPages = mode === 'pages'
  const isDemo = mode === 'demo'
  const isProduction = mode === 'production'

  return {
    base: isPages ? '/GrudgeStudioNPM/' : '/',
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          playground: resolve(__dirname, 'playground.html'),
          'fps-game': resolve(__dirname, 'examples/fps-game.html'),
          'rpg-adventure': resolve(__dirname, 'examples/rpg-adventure.html')
        }
      },
      
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : undefined
    },

    server: {
      port: 3000,
      open: true,
      cors: true
    },

    preview: {
      port: 4173,
      open: true
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@core': resolve(__dirname, 'src/core'),
        '@render': resolve(__dirname, 'src/render'),
        '@terrain': resolve(__dirname, 'src/terrain'),
        '@controllers': resolve(__dirname, 'src/controllers'),
        '@ui': resolve(__dirname, 'src/ui'),
        '@assets': resolve(__dirname, 'src/assets')
      }
    },

    optimizeDeps: {
      include: ['three', 'socket.io-client']
    },

    define: {
      __PLAYGROUND_MODE__: JSON.stringify(mode),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.1.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],

    // Environment-specific configurations
    ...(isPages && {
      // GitHub Pages specific configuration
      experimental: {
        renderBuiltUrl(filename) {
          return '/GrudgeStudioNPM/' + filename
        }
      }
    }),

    ...(isDemo && {
      // Demo deployment configuration
      build: {
        ...this.build,
        rollupOptions: {
          ...this.build?.rollupOptions,
          external: ['socket.io-client'] // Exclude heavy dependencies for demo
        }
      }
    })
  }
})