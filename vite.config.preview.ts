/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineConfig, loadEnv, ProxyOptions } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_PROXY_API_TARGET, VITE_PROXY_FS_TARGET, VITE_PROXY_WEB_TARGET } =
    loadEnv(mode, process.cwd())

  const proxy: Record<string, ProxyOptions> = Object.create(null)

  if (VITE_PROXY_API_TARGET) {
    proxy['/api'] = {
      target: VITE_PROXY_API_TARGET,
      changeOrigin: true,
    }
  }

  if (VITE_PROXY_FS_TARGET) {
    proxy['/fs'] = {
      target: VITE_PROXY_FS_TARGET,
      changeOrigin: true,
    }
  }

  if (VITE_PROXY_WEB_TARGET) {
    proxy['^/grafanas-'] = {
      target: VITE_PROXY_WEB_TARGET,
      changeOrigin: true,
    }
  }

  return {
    server: {
      proxy,
    },
  }
})
