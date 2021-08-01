import { definePage } from '@/model/page'
import { useLocation } from 'react-router-dom'

export default definePage({
  role: ['user'],
  redirect: () => {
    if (useLocation().pathname === '/') return '/dashboard'
  },
})
