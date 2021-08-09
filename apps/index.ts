import { loadRoutes } from '@pages-macro'
import mountRouter from '@/router'
import { IPageMeta } from '@/model/page'

export default function prepareApps() {
  return mountRouter(
    [
      loadRoutes<IPageMeta>('./landing', '/login'),
      loadRoutes<IPageMeta>('./main', '/'),
    ],
    {
      noSession: '/login',
      noPermission: '/login',
    }
  )
}
