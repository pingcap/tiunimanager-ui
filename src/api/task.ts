import { APIS, PartialUseQueryOptions } from '@/api/client'
import { useQuery } from 'react-query'

export const CACHE_TASK = 'tasks'

export function useQueryTasks(
  query: {
    clusterId?: string
    page?: number
    pageSize?: number
    status?: number
    keyword?: string
  },
  options?: PartialUseQueryOptions
) {
  const { clusterId, page, pageSize, status, keyword } = query
  return useQuery(
    [CACHE_TASK, clusterId, page, pageSize, status, keyword],
    () => APIS.Task.flowworksGet(clusterId, keyword, page, pageSize, status),
    options
  )
}
