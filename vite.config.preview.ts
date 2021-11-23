import { defineConfig, loadEnv, ProxyOptions } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_PROXY_API_TARGET, VITE_PROXY_FS_TARGET } = loadEnv(
    mode,
    process.cwd()
  )
  const proxy: Record<string, ProxyOptions> = Object.create(null)
  if (VITE_PROXY_API_TARGET)
    proxy['/api'] = {
      target: VITE_PROXY_API_TARGET,
      changeOrigin: true,
    }
  if (VITE_PROXY_FS_TARGET)
    proxy['/fs'] = {
      target: VITE_PROXY_FS_TARGET,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/fs/, ''),
    }
  return {
    server: {
      proxy,
    },
  }
})
