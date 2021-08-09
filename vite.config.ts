import { defineConfig, loadEnv, ServerOptions } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import { resolve } from 'path'
import vitePluginImp from 'vite-plugin-imp'
import vitePluginHtml from 'vite-plugin-html'
import vitePluginYaml from './plugins/yaml-loader'
import vitePluginImportPagesMacro from './plugins/import-pages-macro'
import vitePluginI18nMacro from './plugins/i18n-macro'
import vitePluginImportAssetsMacro from './plugins/import-assets-macro'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const proxy =
    !env.VITE_MOCK &&
    !!env.VITE_PROXY_TARGET &&
    ({
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    } as ServerOptions)

  return {
    plugins: [
      reactRefresh(),
      vitePluginHtml({
        inject: {
          injectData: {
            title: env.VITE_TITLE || 'TiCP Demo',
            description: env.VITE_DESCRIPTION || 'Just a demo now.',
          },
        },
        minify: true,
      }),
      vitePluginImp({
        libList: [
          {
            libName: 'antd',
            style: (name) => `antd/es/${name}/style`,
          },
        ],
      }),
      vitePluginYaml(),
      vitePluginImportPagesMacro(),
      vitePluginI18nMacro(),
      vitePluginImportAssetsMacro(),
    ],
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: [
        { find: '@', replacement: resolve(__dirname, 'src') },
        { find: '@hooks', replacement: resolve(__dirname, 'hooks') },
        { find: '@apps', replacement: resolve(__dirname, 'apps') },
        { find: '@store', replacement: resolve(__dirname, 'store') },
        { find: '@mock', replacement: resolve(__dirname, 'mock') },
        { find: '@untyped', replacement: resolve(__dirname, 'untyped') },
        { find: '#', replacement: resolve(__dirname, 'generated') },
        // see https://github.com/vitejs/vite/issues/2185#issuecomment-784637827
        { find: /^~/, replacement: '' },
      ],
    },
    esbuild: {
      jsxInject: `import React from 'react'`,
    },
    server: {
      ...proxy,
    },
  }
})
