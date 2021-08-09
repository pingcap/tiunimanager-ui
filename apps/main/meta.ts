import { definePage } from '@/model/page'
import { resolveRoute } from '@pages-macro'

export default definePage({
  role: ['user'],
  redirect(_, location) {
    if (location.pathname === resolveRoute()) return resolveRoute('dashboard')
  },
})
