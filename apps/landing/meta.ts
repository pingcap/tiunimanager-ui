import { definePage } from '@/model/page'
import { useAuthState } from '@store/auth'
import { useHistory } from 'react-router-dom'
import { RouteContext } from '@/router/helper'

export default definePage({
  role: ['all'],
  redirect: () => {
    const [{ session }] = useAuthState()
    const history = useHistory<RouteContext>()
    if (session) return history.location.state?.from || '/'
  },
})
