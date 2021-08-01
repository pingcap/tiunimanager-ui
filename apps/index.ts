import { importRoutes } from '@import-pages-macro'
import mountRouter from '@/router'
import { IPageMeta } from '@/model/page'

export default function prepareApps() {
  return mountRouter(
    [
      importRoutes<IPageMeta>('./landing', '/login'),
      importRoutes<IPageMeta>('./main', '/'),
    ],
    {
      noSession: '/login',
      noPermission: '/login',
    }
  )
}
