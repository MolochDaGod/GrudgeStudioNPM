/**
 * grudgeProxy() — Shared Vite dev proxy for any Grudge Studio game
 *
 * Usage in vite.config.js:
 *   import { grudgeProxy } from 'grudge-studio/cloud/vite-proxy'
 *   export default defineConfig({
 *     server: { proxy: grudgeProxy() }
 *   })
 *
 * Override individual ports if needed:
 *   grudgeProxy({ auth: 4001, api: 4003 })
 */

/**
 * @param {object} [ports]  Override default service ports
 * @param {number} [ports.auth]      grudge-id        (default 3001)
 * @param {number} [ports.api]       game-api         (default 3003)
 * @param {number} [ports.account]   account-api      (default 3005)
 * @param {number} [ports.launcher]  launcher-api     (default 3006)
 * @param {number} [ports.ws]        ws-service       (default 3007)
 * @param {number} [ports.assets]    asset-service    (default 3008)
 * @param {string} [ports.host]      service host     (default 'localhost')
 * @returns {object} Vite proxy config
 */
export function grudgeProxy(ports = {}) {
  const host = ports.host || 'localhost'
  const p = {
    auth:     ports.auth     || 3001,
    api:      ports.api      || 3003,
    account:  ports.account  || 3005,
    launcher: ports.launcher || 3006,
    ws:       ports.ws       || 3007,
    assets:   ports.assets   || 3008,
  }

  return {
    // Auth service (grudge-id)
    '/auth': {
      target: `http://${host}:${p.auth}`,
      changeOrigin: true,
      secure: false,
    },
    // Account service
    '/account': {
      target: `http://${host}:${p.account}`,
      changeOrigin: true,
      secure: false,
    },
    // Asset service
    '/assets': {
      target: `http://${host}:${p.assets}`,
      changeOrigin: true,
      secure: false,
    },
    // Launcher service
    '/launcher': {
      target: `http://${host}:${p.launcher}`,
      changeOrigin: true,
      secure: false,
    },
    // Game API (characters, missions, crews, inventory, health)
    '/api': {
      target: `http://${host}:${p.api}`,
      changeOrigin: true,
      secure: false,
    },
    // WebSocket upgrade (Socket.IO)
    '/socket.io': {
      target: `http://${host}:${p.ws}`,
      changeOrigin: true,
      ws: true,
    },
  }
}

export default grudgeProxy
