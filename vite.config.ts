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
} from './macros'
import { LANGUAGE_IDS } from './src/i18n'
import { createMacroPlugin } from 'vite-plugin-macro'
import pluginDel from 'rollup-plugin-delete'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const proxy =
    !env.VITE_MOCK &&
    !!env.VITE_PROXY_API_TARGET &&
    ({
      proxy: {
        '/api': {
          target: env.VITE_PROXY_API_TARGET,
          changeOrigin: true,
        },
        '/fs': {
          target: env.VITE_PROXY_FS_TARGET,
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
            title: env.VITE_TITLE || 'TiEM',
            description: env.VITE_DESCRIPTION || 'TiDB Enterprise Manager',
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
      createMacroPlugin({
        typesPath: './types/macros.d.ts',
      }).use(
        provideI18n({
          languageWhitelist: new Set(LANGUAGE_IDS),
          defaultLoadGlob: './translations/*.{yaml,yml}',
          globalNamespaces: new Set(['model', 'task']),
        }),
        provideAssets(),
        providePages(),
        provideComponents()
      ),
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
          modifyVars: {
            'primary-color': '#3A40E1',
            'text-color': '#565656',
            'border-color-base': '#E9EAEE',
            'border-color-split': '#E9EAEE',
            'heading-color': '#565656',
            'layout-body-background': '#F7F8F9',
            'layout-header-background': '#2C2C2C',
            'page-header-back-color': '#2C2C2C',
            'menu-dark-color': '#E9EAEE',
            'menu-dark-inline-submenu-bg': '#2C2C2C',
            'table-header-bg': '#E9EAEE',
            'border-radius-base': '6px',
            'height-base': '40px',
            'height-lg': '48px',
            'btn-padding-horizontal-base': '23px',
          },
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
    build: {
      target: ['chrome67', 'firefox68', 'edge79', 'safari14'],
    },
    server: {
      ...proxy,
    },
  }
})
