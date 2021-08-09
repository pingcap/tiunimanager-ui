// start dev tools
if (import.meta.env.DEV) await import('@/devtools')

// bootstrap application
import bootstrap from '@/bootstrap'
bootstrap().then()

// load required assets
import { importAssets } from '@assets-macro'
importAssets('./styles/*.{less,css}')
