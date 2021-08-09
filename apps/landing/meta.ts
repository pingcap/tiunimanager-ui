import { definePage } from '@/model/page'

export default definePage({
  role: ['all'],
  redirect(session, location) {
    if (session) return location.state.from
  },
})
