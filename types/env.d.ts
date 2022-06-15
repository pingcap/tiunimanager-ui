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

interface ImportMetaEnv {
  // page title
  VITE_TITLE: string
  // page description
  VITE_DESCRIPTION: string

  // dev server proxy
  VITE_PROXY_WEB_TARGET: string
  VITE_PROXY_API_TARGET: string
  VITE_PROXY_FS_TARGET: string

  // api base url, e.g. /api/v1
  VITE_API_BASE_URL: string
  VITE_FS_BASE_URL: string

  // system external services
  VITE_LOG_URL: string
  VITE_MONITOR_URL: string
  VITE_TRACER_URL: string
  VITE_ALERT_URL: string

  // app info
  VITE_APP_DEPLOY_ENV: string

  // error tracking
  VITE_SENTRY_DSN: string
}

declare const __APP_NAME__: string
declare const __APP_VERSION__: string
