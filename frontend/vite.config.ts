import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The four Spring Boot services run on separate ports and none of them sends
 * CORS headers. Rather than patching every controller, the dev server proxies
 * `/api/*` to the right service, so the browser only ever talks to one origin.
 *
 * Override any port with a .env file (see .env.example).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const target = (port: string, fallback: string) =>
    env[port] ?? `http://localhost:${fallback}`

  const service = (t: string) => ({
    target: t,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  })

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: {
        '/api/products': service(target('VITE_PRODUCT_SERVICE', '8100')),
        '/api/orders': service(target('VITE_ORDER_SERVICE', '8200')),
        '/api/notifications': service(target('VITE_NOTIFICATION_SERVICE', '8300')),
        '/api/users': service(target('VITE_USER_SERVICE', '8400')),
      },
    },
    build: {
      // three + drei are large; splitting them keeps the app chunk readable
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three', '@react-three/fiber', '@react-three/drei'],
          },
        },
      },
    },
  }
})
