import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_PROXY_TARGET } = loadEnv(mode, process.cwd())

  return {
    server: {
      proxy: VITE_PROXY_TARGET
        ? {
            '/api': {
              target: VITE_PROXY_TARGET,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  }
})
