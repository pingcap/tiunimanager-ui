import { loadRoutes } from '@pages-macro'
import mountRouter from '@/router'
import { IPageMeta } from '@/model/page'

export default function prepareApps() {
  return mountRouter(
    [
      loadRoutes<IPageMeta>('./landing', '/login'),
      loadRoutes<IPageMeta>('./user', '/user'),
      loadRoutes<IPageMeta>('./main', '/'),
    ],
    {
      noSession: '/login',
      noSafeSession: '/user/password',
      noPermission: '/login',
    }
  )
}
