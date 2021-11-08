import { APIS, PartialUseQueryOptions } from '@/api/client'
import { useQuery } from 'react-query'

export const CACHE_TASK = 'tasks'

export const CACHE_TASK_DETAIL = 'task-detail'

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

export function useQueryTaskDetail(
  query: {
    id: number
  },
  options?: PartialUseQueryOptions
) {
  const { id } = query
  return useQuery(
    [CACHE_TASK, id],
    () => APIS.Task.flowworksFlowWorkIdGet(id),
    options
  )
}
