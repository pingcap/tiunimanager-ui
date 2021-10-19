import { defineConfig, loadEnv, ServerOptions } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import { resolve } from 'path'
import vitePluginImp from 'vite-plugin-imp'
import vitePluginHtml from 'vite-plugin-html'
import pluginYaml from 'rollup-plugin-yamlx'
import {
  provideAssets,
  provideComponents,
  provideI18n,
  providePages,
} from '@ulab/mvp'
import { LANGUAGE_IDS } from './src/i18n'
import { vitePluginMacro } from 'vite-plugin-macro'
import pluginDel from 'rollup-plugin-delete'

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
      pluginYaml(),
      vitePluginMacro({
        typesPath: './types/macros.d.ts',
      })
        .use([
          provideI18n({
            languageWhitelist: new Set(LANGUAGE_IDS),
            defaultLoadGlob: './translations/*.{yaml,yml}',
            globalNamespaces: new Set('model'),
          }),
          provideAssets(),
          providePages(),
          provideComponents(),
        ])
        .toPlugin(),
      pluginDel({
        targets: 'dist/mock*',
        hook: 'generateBundle',
      }),
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
