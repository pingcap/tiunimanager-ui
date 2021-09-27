import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'

export function useRouteQuery() {
  const search = useLocation().search
  return useMemo(() => new URLSearchParams(search), [search])
}
