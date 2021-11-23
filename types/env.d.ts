interface ImportMetaEnv {
  // page title
  VITE_TITLE: string
  // page description
  VITE_DESCRIPTION: string

  // dev server proxy
  VITE_PROXY_API_TARGET: string
  VITE_PROXY_FS_TARGET: string

  // api base url, e.g. /api/v1
  VITE_API_BASE_URL: string

  // system external services
  VITE_LOG_URL: string
  VITE_MONITOR_URL: string
  VITE_TRACER_URL: string
  VITE_ALERT_URL: string

  // release mode for bundle
  VITE_RELEASE: string
}
