// start dev tools
if (import.meta.env.DEV) await import('@/devtools')

// init error tracking tools
import '@/track'

// bootstrap application
import bootstrap from '@/bootstrap'
bootstrap().then()

// load required assets
import { importAssets } from '@assets-macro'
importAssets('./styles/*.{less,css}')
