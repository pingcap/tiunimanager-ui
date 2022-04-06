import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  release: `${import.meta.env.VITE_APP_NAME}@${
    import.meta.env.VITE_APP_VERSION
  }`,
  environment: import.meta.env.VITE_APP_DEPLOY_ENV,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1,
})
